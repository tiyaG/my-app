"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Heart, Award, Calendar, ChevronDown, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function OpportunitiesPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'non-profit',
      label: 'Non-Profit Roles',
      icon: <Heart className="text-rose-500" />,
      items: [
        { name: "Global Outreach Coordinator", status: "open", due: "03/15" },
        { name: "Community Resource Manager", status: "open", due: "04/01" },
        { name: "Environmental Justice Intern", status: "closed", due: "01/10" },
      ]
    },
    {
      id: 'hackathons',
      label: 'Hackathons & Competitions',
      icon: <Trophy className="text-amber-500" />,
      items: [
        { name: "Code For Change 2026", status: "open", due: "02/20" },
        { name: "Civic Tech Hack", status: "open", due: "03/05" },
        { name: "Global Sustainability Jam", status: "closed", due: "12/20" },
      ]
    },
    {
      id: 'certificates',
      label: 'Skill-Based Certificates',
      icon: <Award className="text-blue-500" />,
      items: [
        { name: "Advanced Leadership Cert", status: "open", due: "Rolling" },
        { name: "Digital Advocacy Mastery", status: "open", due: "05/15" },
        { name: "Non-Profit Management", status: "closed", due: "02/01" },
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#FDFCFE] pb-20">
      
      {/* UNIQUE ORANGE HEADER */}
      <div className="relative bg-orange-500 p-8 md:p-16 text-white overflow-hidden shadow-2xl">
        {/* Decorative Sparkle Circle */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-orange-400 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-100 font-bold mb-8 hover:text-white transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> BACK TO HUB
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <Sparkles size={24} className="text-orange-200 animate-pulse" />
            <h1 className="text-6xl font-black tracking-tighter italic uppercase">Opportunities.</h1>
          </div>
          <p className="text-orange-100 font-medium text-xl max-w-2xl">
            Select a category below to explore curated roles and elite technical certifications.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="group">
            {/* CATEGORY ROW */}
            <motion.div 
              onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center justify-between p-8 rounded-[2.5rem] cursor-pointer transition-all border-2 ${
                expandedCategory === cat.id 
                ? 'bg-white border-orange-500 shadow-2xl shadow-orange-100' 
                : 'bg-white border-gray-100 hover:border-orange-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-orange-50 transition-colors">
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{cat.label}</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    {cat.items.filter(i => i.status === 'open').length} Positions Available
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:block px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Browse All
                </div>
                <motion.div animate={{ rotate: expandedCategory === cat.id ? 180 : 0 }}>
                  <ChevronDown className={expandedCategory === cat.id ? 'text-orange-500' : 'text-gray-300'} />
                </motion.div>
              </div>
            </motion.div>

            {/* EXPANDED CONTENT */}
            <AnimatePresence>
              {expandedCategory === cat.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 mt-2 space-y-3">
                    {cat.items.map((item, i) => (
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="flex items-center justify-between p-6 bg-white/50 border border-gray-100 rounded-[1.8rem] hover:bg-orange-50/50 hover:border-orange-100 transition-all group/item"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.status === 'open' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-300'}`} />
                          <span className="font-bold text-gray-700 text-lg group-hover/item:text-orange-600 transition-colors">{item.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Calendar size={14} /> Due: {item.due}
                          </div>
                          <button className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 text-gray-400 group-hover/item:text-orange-500 group-hover/item:border-orange-200 transition-all">
                             <Zap size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </main>
  );
}