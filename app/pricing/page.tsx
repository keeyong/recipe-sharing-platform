'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getSubscriptionPlans, getUserSubscription } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id: string;
  price: number;
  features: string[];
  max_recipes: number;
  has_ads: boolean;
}

export default function PricingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [plansData, subscriptionData] = await Promise.all([
          getSubscriptionPlans(),
          user ? getUserSubscription(user.id) : null,
        ]);
        
        setPlans(plansData);
        setUserSubscription(subscriptionData);
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setProcessing(priceId);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('결제 세션 생성에 실패했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '무료';
    return `₩${price.toLocaleString()}/월`;
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'basic_upload': return '📝';
      case 'basic_search': return '🔍';
      case 'ads': return '📢';
      case 'unlimited_upload': return '♾️';
      case 'hd_images': return '🖼️';
      case 'no_ads': return '🚫📢';
      case 'advanced_search': return '🔍✨';
      case 'unlimited_favorites': return '❤️♾️';
      case 'premium_features': return '⭐';
      case 'nutrition_calc': return '🧮';
      case 'shopping_list': return '🛒';
      case 'recipe_analytics': return '📊';
      case 'priority_support': return '🎯';
      default: return '✅';
    }
  };

  const getFeatureText = (feature: string) => {
    switch (feature) {
      case 'basic_upload': return '기본 레시피 업로드 (월 10개)';
      case 'basic_search': return '기본 검색 기능';
      case 'ads': return '광고 표시';
      case 'unlimited_upload': return '무제한 레시피 업로드';
      case 'hd_images': return '고화질 이미지 업로드';
      case 'no_ads': return '광고 제거';
      case 'advanced_search': return '고급 검색 필터';
      case 'unlimited_favorites': return '무제한 즐겨찾기';
      case 'premium_features': return 'Premium 기능 모두 포함';
      case 'nutrition_calc': return '영양 정보 자동 계산';
      case 'shopping_list': return '쇼핑 리스트 자동 생성';
      case 'recipe_analytics': return '레시피 분석 도구';
      case 'priority_support': return '우선 고객 지원';
      default: return feature;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

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
          <a href="/" className="text-gray-600 hover:text-amber-600 transition-colors">Home</a>
          <a href="/recipes" className="text-gray-600 hover:text-amber-600 transition-colors">Recipes</a>
          <a href="/dashboard" className="text-gray-600 hover:text-amber-600 transition-colors">Dashboard</a>
          <a href="/pricing" className="text-amber-600 font-semibold">Pricing</a>
          <a href="/consulting" className="text-gray-600 hover:text-amber-600 transition-colors">Consulting</a>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          프리미엄 기능으로 더 나은 요리 경험을
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          무제한 레시피 업로드, 고화질 이미지, 광고 없는 환경 등 다양한 프리미엄 기능을 경험해보세요.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = userSubscription?.subscription_plans?.stripe_price_id === plan.stripe_price_id;
            const isProcessing = processing === plan.stripe_price_id;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.name === 'Premium' 
                    ? 'border-amber-500 scale-105' 
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                {plan.name === 'Premium' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      인기
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="font-display text-2xl font-bold text-gray-800 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-amber-600 mb-2">
                    {formatPrice(plan.price)}
                  </div>
                  {plan.price > 0 && (
                    <p className="text-gray-500 text-sm">월 구독</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-xl">{getFeatureIcon(feature)}</span>
                      <span className="text-gray-700">{getFeatureText(feature)}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.stripe_price_id)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.name === 'Premium'
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {isCurrentPlan 
                    ? '현재 플랜' 
                    : isProcessing 
                    ? '처리 중...' 
                    : plan.price === 0 
                    ? '무료 시작' 
                    : '구독하기'
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-gray-800 mb-12">
            자주 묻는 질문
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-3">언제든지 취소할 수 있나요?</h3>
              <p className="text-gray-600">네, 언제든지 구독을 취소할 수 있습니다. 취소 후에도 결제 기간이 끝날 때까지 서비스를 이용할 수 있습니다.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-3">무료 플랜에서 업그레이드하면 어떻게 되나요?</h3>
              <p className="text-gray-600">기존 레시피와 데이터는 그대로 유지되며, 즉시 프리미엄 기능을 사용할 수 있습니다.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-3">결제는 안전한가요?</h3>
              <p className="text-gray-600">Stripe를 통해 안전하게 결제가 처리되며, 카드 정보는 암호화되어 저장됩니다.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-3">환불 정책은 어떻게 되나요?</h3>
              <p className="text-gray-600">첫 구독 후 7일 이내에 환불 요청 시 전액 환불해드립니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 