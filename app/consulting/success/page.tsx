'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Force dynamic rendering to avoid prerendering issues with useSearchParams
export const dynamic = 'force-dynamic';

function ConsultingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
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
          <Link href="/" className="text-gray-600 hover:text-amber-600 transition-colors">Home</Link>
          <Link href="/recipes" className="text-gray-600 hover:text-amber-600 transition-colors">Recipes</Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-amber-600 transition-colors">Dashboard</Link>
          <Link href="/pricing" className="text-gray-600 hover:text-amber-600 transition-colors">Pricing</Link>
          <Link href="/consulting" className="text-amber-600 font-semibold">Consulting</Link>
        </div>
      </nav>

      {/* Success Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-gray-800 mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for purchasing our consulting service. We're excited to help you on your culinary journey!
            </p>
          </div>

          {/* Session Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">
              What's Next?
            </h2>
            
            <div className="space-y-6 text-left">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Confirmation Email</h3>
                  <p className="text-gray-600">You'll receive a confirmation email within the next few minutes with your session details.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Schedule Your Session</h3>
                  <p className="text-gray-600">Our team will contact you within 24 hours to schedule your consultation session.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Prepare for Your Session</h3>
                  <p className="text-gray-600">Think about your cooking goals and any specific questions you'd like to ask our experts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session ID */}
          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">
                <strong>Session ID:</strong> {sessionId}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Please keep this reference number for your records.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/consulting"
              className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Book Another Session
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-12 bg-white rounded-lg p-6">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your consultation, don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:support@sharemyrecipe.com"
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                📧 support@sharemyrecipe.com
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                📞 +1 (555) 123-4567
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsultingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConsultingSuccessContent />
    </Suspense>
  );
} 