"use client";
export const dynamic = 'force-dynamic'; 

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      alert(error.message);
    } else {
      router.push('/community'); 
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col space-y-2 text-left">
        <h2 className="text-5xl font-black text-black uppercase italic tracking-tighter leading-tight">
          WELCOME.
        </h2>
        <p className="text-gray-500 font-bold text-lg">
          Log in to your portal.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Input */}
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

        {/* Password Input Group */}
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full pl-14 pr-6 py-5 bg-[#fcfaf9] rounded-2xl border-none focus:ring-2 focus:ring-[#e29578] outline-none text-black font-bold shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* Forgot Password Link - Added here */}
          <div className="flex justify-end px-2">
            <Link 
              href="/forgot-password" 
              className="text-sm font-bold text-[#e29578] hover:underline transition-all"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#e29578] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Log In'}
          <ArrowRight size={22} />
        </button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-300 font-black tracking-widest">OR</span>
        </div>
      </div>

      <p className="text-center text-sm font-bold text-gray-400">
        New here?{' '}
        <Link href="/signup" className="text-[#e29578] hover:underline transition-colors">
          Create account
        </Link>
      </p>
    </div>
  );
}