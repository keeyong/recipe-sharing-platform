'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ConsultingOption {
  id: string;
  name: string;
  price: number;
  sessions: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const consultingOptions: ConsultingOption[] = [
  {
    id: 'individual',
    name: 'Individual Consulting',
    price: 125,
    sessions: 1,
    description: 'One-on-one personalized recipe consultation',
    features: [
      '60-minute private session',
      'Personalized recipe recommendations',
      'Cooking technique guidance',
      'Nutritional advice',
      'Recipe customization',
      'Follow-up email support'
    ]
  },
  {
    id: 'group',
    name: 'Group Consulting',
    price: 225,
    sessions: 4,
    description: 'Group sessions with recipe experts',
    features: [
      '4 x 90-minute group sessions',
      'Interactive cooking demonstrations',
      'Recipe sharing and feedback',
      'Community support',
      'Access to exclusive recipes',
      'Monthly Q&A sessions'
    ],
    popular: true
  }
];

export default function ConsultingPage() {
  const { user } = useAuth();
  // const router = useRouter(); // Removed unused variable
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConsultingPurchase = async (optionId: string) => {
    if (!user) {
      alert('Please log in to purchase consulting services.');
      return;
    }

    setLoading(true);
    setSelectedOption(optionId);

    try {
      // Using MCP Stripe server to create payment link
      const option = consultingOptions.find(opt => opt.id === optionId);
      if (!option) throw new Error('Invalid option selected');

      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Create a payment link using MCP Stripe server
      const response = await fetch('/api/consulting/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          optionId,
          userId: user.id,
          amount: option.price * 100, // Convert to cents
          description: `${option.name} - ${option.sessions} session(s)`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const { paymentUrl } = await response.json();
      
      // Redirect to Stripe payment page
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
      setSelectedOption(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🍳</span>
          </div>
          <span className="font-display text-2xl font-bold text-gray-800">ShareMyRecipe</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-amber-600 transition-colors">Home</Link>
          <Link href="/recipes" className="text-gray-600 hover:text-amber-600 transition-colors">Recipes</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-amber-600 transition-colors">Pricing</Link>
          <Link href="/consulting" className="text-amber-600 font-semibold">Consulting</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Premium Recipe Consulting
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Get personalized guidance from our expert chefs and nutritionists. 
          Whether you're a beginner or experienced cook, our consulting services 
          will help you master the art of cooking.
        </p>
        <div className="flex justify-center space-x-4 mb-8">
          <div className="bg-white rounded-lg px-6 py-3 shadow-md">
            <span className="text-2xl">👨‍🍳</span>
            <p className="text-sm text-gray-600 mt-1">Expert Chefs</p>
          </div>
          <div className="bg-white rounded-lg px-6 py-3 shadow-md">
            <span className="text-2xl">🥗</span>
            <p className="text-sm text-gray-600 mt-1">Nutrition Focus</p>
          </div>
          <div className="bg-white rounded-lg px-6 py-3 shadow-md">
            <span className="text-2xl">📱</span>
            <p className="text-sm text-gray-600 mt-1">Flexible Scheduling</p>
          </div>
        </div>
      </div>

      {/* Consulting Options */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {consultingOptions.map((option) => (
            <div
              key={option.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                option.popular 
                  ? 'border-amber-500 scale-105' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              {option.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                  {option.name}
                </h3>
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  ${option.price}
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  {option.sessions} session{option.sessions > 1 ? 's' : ''}
                </p>
                <p className="text-gray-700 mb-6">
                  {option.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleConsultingPurchase(option.id)}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  loading && selectedOption === option.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : option.popular
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                }`}
              >
                {loading && selectedOption === option.id 
                  ? 'Processing...' 
                  : `Book ${option.name}`
                }
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-gray-800 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-3">How do the sessions work?</h3>
              <p className="text-gray-600">Sessions are conducted via video call. You'll receive a link before your scheduled time. Our experts will guide you through recipes, techniques, and answer your questions.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-3">Can I reschedule my session?</h3>
              <p className="text-gray-600">Yes, you can reschedule up to 24 hours before your session. Contact our support team to arrange a new time.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-3">What if I'm not satisfied?</h3>
              <p className="text-gray-600">We offer a 100% satisfaction guarantee. If you're not happy with your session, we'll provide a full refund or reschedule at no cost.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-3">Do I need special equipment?</h3>
              <p className="text-gray-600">No special equipment required! We'll work with what you have in your kitchen. Our experts will adapt recipes to your available tools and ingredients.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto">
          <h3 className="font-display text-2xl font-bold text-gray-800 mb-4">
            Have Questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help you choose the right consulting option.
          </p>
          <button className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
} 