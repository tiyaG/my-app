"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // This triggers the confirmation email to the user
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        emailRedirectTo: `${window.location.origin}/community` 
      },
    });

    if (error) {
      alert(error.message);
    } else {
      // Show the success message you liked from the image
      setMessage('Check your email for a confirmation link! 📧');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col space-y-2 text-left">
        <h2 className="text-5xl font-black text-black uppercase italic tracking-tighter leading-tight">
          JOIN US.
        </h2>
        <p className="text-gray-500 font-bold text-lg">
          Create your account to get started.
        </p>
      </div>

      {message ? (
        // The success box with your orange theme
        <div className="p-6 bg-[#fdf2f0] border border-[#e29578] text-[#e29578] rounded-2xl font-black text-center animate-in fade-in zoom-in duration-300">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
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
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                placeholder="Create Password"
                className="w-full pl-14 pr-6 py-5 bg-[#fcfaf9] rounded-2xl border-none focus:ring-2 focus:ring-[#e29578] outline-none text-black font-bold shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#e29578] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Account'}
            <ArrowRight size={22} />
          </button>
        </form>
      )}

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-300 font-black tracking-widest">OR</span>
        </div>
      </div>

      <button className="w-full py-4 border-2 border-[#fcfaf9] rounded-2xl flex items-center justify-center gap-3 hover:bg-[#fcfaf9] transition font-bold text-gray-600">
        Continue with Google
      </button>

      <p className="text-center text-sm font-bold text-gray-400">
        Already a member?{' '}
        <Link href="/login" className="text-[#e29578] hover:underline transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}