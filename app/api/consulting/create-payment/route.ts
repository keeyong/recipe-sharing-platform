import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Consulting Payment API Called ===');
    const { optionId, userId, amount, description } = await request.json();
    console.log('Request data:', { optionId, userId, amount, description });
    
    if (!optionId || !userId || !amount || !description) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Getting current user...');
    
    // Get Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header exists:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }
    
    // Create Supabase client for API route
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Set the auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    console.log('Current user:', user ? 'Found' : 'Not found');
    console.log('Auth error:', authError);
    
    if (!user || authError) {
      console.log('User not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Using MCP Stripe server to create payment link
    // This will be handled by your MCP Stripe server
    const paymentData = {
      amount: amount, // in cents
      currency: 'usd',
      description: description,
      customer_email: user.email,
      metadata: {
        userId: userId,
        optionId: optionId,
        type: 'consulting'
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/consulting/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/consulting?canceled=true`,
    };

    // Create payment link using MCP Stripe server
    // This is where your MCP server integration would happen
    const paymentUrl = await createStripePaymentLink(paymentData);

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error('Error creating consulting payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// This function integrates with Stripe API directly
async function createStripePaymentLink(paymentData: any): Promise<string> {
  try {
    console.log('Creating Stripe payment link...');
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
    });

    // Step 1: Create or get existing product for consulting service
    const productName = paymentData.description.includes('Individual') 
      ? 'Individual Recipe Consulting' 
      : 'Group Recipe Consulting';
    
    console.log('Product name:', productName);
    
    // Step 2: Create product in Stripe
    const product = await stripe.products.create({
      name: productName,
      description: paymentData.description,
    });
    
    // Step 3: Create price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: paymentData.amount,
      currency: paymentData.currency,
    });
    
    // Step 4: Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: paymentData.metadata,
    });
    
    console.log('Successfully created payment link:', paymentLink.url);
    return paymentLink.url;
    
  } catch (error) {
    console.error('Error creating Stripe payment link:', error);
    throw new Error('Failed to create payment link');
  }
} 