"use client";
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5ebe0] p-4 md:p-8">
      {/* Main Container */}
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-[2rem] overflow-hidden shadow-2xl min-h-[600px]">
        
        {/* Left Side: Image/Branding Section */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-[#e29578] text-white relative">
          <div className="z-10">
            <h1 className="text-4xl font-black italic tracking-tighter">EMPOWER HER.</h1>
            <p className="mt-4 text-orange-100 font-medium">Join our global community of change-makers.</p>
          </div>
          <div className="z-10">
            <p className="text-sm font-bold opacity-80 italic">© 2026 EmpowerHer Portal</p>
          </div>
          {/* Decorative Circle */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-400 rounded-full opacity-20 blur-3xl" />
        </div>

        {/* Right Side: The actual form (Login or Signup) */}
        <div className="flex items-center justify-center p-8 md:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}