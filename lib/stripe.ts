import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  max_recipes: number;
  max_image_size: number;
  has_ads: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'canceled';
  payment_method: string | null;
}

// Stripe 헬퍼 함수들
export async function createCheckoutSession(priceId: string, userId: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
    client_reference_id: userId,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// 사용량 제한 체크 함수
export function checkUsageLimits(
  userPlan: SubscriptionPlan | null,
  currentUsage: { recipes_uploaded: number; total_image_size: number }
): { canUpload: boolean; canUploadImage: boolean; reason?: string } {
  if (!userPlan) {
    return {
      canUpload: currentUsage.recipes_uploaded < 10,
      canUploadImage: currentUsage.total_image_size < 5 * 1024 * 1024, // 5MB
      reason: 'Free plan limits',
    };
  }

  const canUpload = userPlan.max_recipes === -1 || currentUsage.recipes_uploaded < userPlan.max_recipes;
  const canUploadImage = currentUsage.total_image_size < userPlan.max_image_size;

  return {
    canUpload,
    canUploadImage,
    reason: !canUpload ? 'Recipe upload limit reached' : !canUploadImage ? 'Image size limit reached' : undefined,
  };
} 