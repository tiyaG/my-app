"use client";
export const dynamic = 'force-dynamic'; // Prevents the 'supabaseKey is required' build crash

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Use production URL if available, otherwise fallback to current origin
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });

    if (error) {
      alert(error.message);
    } else {
      setMessage('Reset link sent! Check your inbox. 📧');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col space-y-2 text-left">
        <h2 className="text-5xl font-black text-black uppercase italic tracking-tighter leading-tight">
          RESET.
        </h2>
        <p className="text-gray-500 font-bold text-lg">
          Enter email to get a reset link.
        </p>
      </div>

      {message ? (
        <div className="p-6 bg-[#fdf2f0] border border-[#e29578] text-[#e29578] rounded-2xl font-black text-center animate-in fade-in zoom-in duration-300">
          {message}
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full pl-14 pr-6 py-5 bg-[#fcfaf9] rounded-2xl border-none focus:ring-2 focus:ring-[#e29578] outline-none text-black font-bold shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#e29578] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            <ArrowRight size={22} />
          </button>
        </form>
      )}

      <div className="pt-2">
        <Link 
          href="/login" 
          className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-[#e29578] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
}