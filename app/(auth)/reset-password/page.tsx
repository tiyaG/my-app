"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // This updates the user's password in Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      router.push('/login'); // Send them to login with their new password
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter leading-none">NEW PASS.</h2>
        <p className="text-gray-500 font-bold">Type your new secure password below.</p>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="password" 
            placeholder="New Password"
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#e29578] outline-none text-black font-bold"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#e29578] transition-all shadow-xl shadow-orange-50 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}