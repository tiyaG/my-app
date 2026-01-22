"use client";
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
    
    // Authenticates the user with Supabase
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      alert(error.message);
    } else {
      // Directs the user to the community page upon success
      router.push('/community'); 
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter leading-none">WELCOME.</h2>
        <p className="text-gray-500 font-bold">Log in to your portal.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Input */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#e29578] outline-none text-black font-bold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Input Group */}
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#e29578] outline-none text-black font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* Forgot Password Link */}
          <div className="flex justify-end pr-2">
            <Link 
              href="/forgot-password" 
              className="text-xs font-bold text-gray-400 hover:text-[#e29578] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#e29578] transition-all shadow-xl shadow-orange-50 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Log In'}
          <ArrowRight size={20} />
        </button>
      </form>

      <p className="text-center text-sm font-bold text-gray-400">
        New here? <Link href="/signup" className="text-[#e29578] hover:underline">Create account</Link>
      </p>
    </div>
  );
}