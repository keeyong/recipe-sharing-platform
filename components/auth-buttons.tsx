'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function AuthButtons() {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 hidden md:block">
          Welcome, {user.email}
        </span>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-gray-700 hover:text-amber-600 transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-3">
      <Link 
        href="/login" 
        className="px-4 py-2 text-gray-700 hover:text-amber-600 transition-colors"
      >
        Sign In
      </Link>
      <Link 
        href="/signup" 
        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
} 