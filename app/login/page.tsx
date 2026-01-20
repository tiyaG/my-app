"use client";
import React, { useState } from 'react';
// We use ../../ to step out of 'login' and 'app' to reach the 'lib' folder
import { supabase } from '../../lib/supabase'; 
import { motion } from 'framer-motion';
import { Mail, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // THE MAGIC: This sends the actual email
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Changed from '/dashboard' to '/community' to match your actual folders
        emailRedirectTo: window.location.origin + '/community',
      },
    });

    if (error) {
      alert(error.message);
    } else {
      setMessage('Check your email for the magic link! 🚀');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-50 text-center"
      >
        <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-200">
          <Zap className="text-white" size={40} />
        </div>
        
        <h1 className="text-4xl font-black tracking-tighter text-black mb-4 italic">GLOBAL HUB.</h1>
        <p className="text-gray-400 font-bold mb-10">Enter your email to access the community.</p>

        {message ? (
          <div className="bg-green-50 text-green-600 p-6 rounded-2xl font-bold border border-green-100">
            {message}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                placeholder="name@company.com"
                className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl outline-orange-500 border-none font-bold text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}