"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Trophy, Heart, Award, Calendar, ChevronDown, 
  Zap, X, Link as LinkIcon, Trash2, Edit3 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function OpportunitiesPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  
  // State to store the user's official role from the database
  const [userRole, setUserRole] = useState<string | null>(null);

  // --- IMPROVED ADMIN CHECK ---
  // Checks for 'Founder' or 'Lead' regardless of capitalization
  const isAdmin = userRole?.toLowerCase() === 'founder' || userRole?.toLowerCase().includes('lead');

  const [newOpp, setNewOpp] = useState({
    name: '',
    category: 'non-profit',
    status: 'open',
    due: '',
    description: '',
    link: ''
  });

  // --- UPDATED AUTH & ROLE CHECK ---
  useEffect(() => {
    const checkUserAndRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user) {
        // We use .maybeSingle() to avoid errors if the profile is missing
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role_title')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Supabase Profile Error:", profileError.message);
        }

        if (profile?.role_title) {
          console.log("Database Role Found:", profile.role_title);
          setUserRole(profile.role_title);
        } else {
          console.log("No profile found or no role assigned, defaulting to Active Member");
          setUserRole('Active Member');
        }
      }
      
      fetchOpportunities();
    };
    checkUserAndRole();
  }, []);

  const fetchOpportunities = async () => {
    const { data } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    if (data) setOpportunities(data);
  };

  const handlePublish = async () => {
    if (!isAdmin) return alert("Only admins can post opportunities!");
    if (!newOpp.name || !newOpp.description) return alert("Please fill in the fields!");
    
    const { error } = await supabase.from('opportunities').insert([newOpp]);
    if (!error) {
      fetchOpportunities();
      setNewOpp({ name: '', category: 'non-profit', status: 'open', due: '', description: '', link: '' });
      alert("Opportunity published!");
    } else {
      alert(error.message);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (confirm("ADMIN: Remove this opportunity permanently?")) {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (!error) fetchOpportunities();
    }
  };

  const categories = [
    { id: 'non-profit', label: 'Non-Profit Roles', icon: <Heart size={24} className="text-orange-500" /> },
    { id: 'hackathons', label: 'Hackathons & Competitions', icon: <Trophy size={24} className="text-orange-500" /> },
    { id: 'certificates', label: 'Skill-Based Certificates', icon: <Award size={24} className="text-orange-500" /> }
  ];

  return (
    <main className="min-h-screen bg-[#FFFBF9] font-sans text-black">
      
      {/* HEADER */}
      <div className="bg-orange-600 p-8 md:p-16 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-100 font-black text-[10px] tracking-widest hover:text-white transition-all group uppercase mb-10">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <div>
            <h1 className="text-7xl font-black tracking-tighter mb-2 italic uppercase leading-[0.8]">Opportunities.</h1>
            <p className="text-orange-100 font-bold uppercase text-xs tracking-widest opacity-80 mt-4">Curated roles, elite hackathons, and certifications.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* ADMIN SIDEBAR */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-orange-900/5 border border-orange-50 sticky top-12 flex flex-col items-center text-center">
            
            {/* --- DEBUG BADGE --- */}
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl w-full">
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">System Debug</p>
              <p className="text-xs font-bold text-black">Role: "{userRole || 'Loading...'}"</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1">Admin Access: {isAdmin ? "YES ✅" : "NO ❌"}</p>
            </div>

            <div className={`w-16 h-16 ${isAdmin ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'} rounded-3xl flex items-center justify-center mb-6`}>
              <Edit3 size={32} />
            </div>
            
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 text-black">
              {isAdmin ? "Founder Dashboard" : "Elite Access"}
            </h3>

            {isAdmin ? (
              <div className="w-full space-y-4 text-left">
                <p className="text-gray-400 text-[10px] font-bold uppercase text-center mb-4">Add new content to the hub</p>
                <input 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-sm focus:border-orange-500 outline-none transition-all text-black" 
                  placeholder="Opportunity Name" 
                  value={newOpp.name} 
                  onChange={e => setNewOpp({...newOpp, name: e.target.value})} 
                />
                <select 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl p-4 font-bold text-sm outline-none focus:border-orange-500 transition-all text-black"
                  value={newOpp.category}
                  onChange={e => setNewOpp({...newOpp, category: e.target.value})}
                >
                  <option value="non-profit">Non-Profit Roles</option>
                  <option value="hackathons">Hackathons</option>
                  <option value="certificates">Certificates</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input className="bg-gray-50 border-none rounded-2xl p-4 font-bold text-xs outline-none text-black" placeholder="Due (MM/DD)" value={newOpp.due} onChange={e => setNewOpp({...newOpp, due: e.target.value})} />
                  <input className="bg-gray-50 border-none rounded-2xl p-4 font-bold text-xs outline-none text-black" placeholder="Link" value={newOpp.link} onChange={e => setNewOpp({...newOpp, link: e.target.value})} />
                </div>
                <textarea 
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm outline-none text-black" 
                  placeholder="Description..." 
                  rows={3} 
                  value={newOpp.description} 
                  onChange={e => setNewOpp({...newOpp, description: e.target.value})} 
                />
                <button 
                  onClick={handlePublish}
                  className="w-full bg-orange-600 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 hover:bg-black transition-all"
                >
                  Publish Role
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-xs font-bold leading-relaxed mb-8 uppercase tracking-tight">
                Unlock your trajectory with curated industry opportunities.
              </p>
            )}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-2 ml-4 mb-8">
            <Zap size={14} className="text-orange-500"/> Active Opportunities
          </h3>

          {categories.map((cat) => {
            const catItems = opportunities.filter(o => o.category === cat.id);
            const isOpen = expandedCategory === cat.id;

            return (
              <div key={cat.id} className="group">
                <motion.div 
                  onClick={() => setExpandedCategory(isOpen ? null : cat.id)}
                  className={`flex items-center justify-between p-8 rounded-[3rem] cursor-pointer transition-all border ${
                    isOpen ? 'bg-white border-orange-500 shadow-2xl shadow-orange-200/40' : 'bg-white border-orange-50 hover:border-orange-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-orange-50 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">{cat.label}</h2>
                      <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-1">
                        {catItems.length} ACTIVE LISTINGS
                      </p>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown className={isOpen ? 'text-orange-600' : 'text-gray-300'} />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-4 mt-2 space-y-3">
                        {catItems.length === 0 && (
                          <div className="p-10 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">No listings yet</div>
                        )}
                        {catItems.map((item, i) => (
                          <motion.div 
                            key={item.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedOpp(item)}
                            className="flex items-center justify-between p-6 bg-white border border-orange-50 rounded-[2.2rem] hover:shadow-lg hover:border-orange-200 transition-all group/item cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                              <span className="font-black text-gray-900 text-lg uppercase italic tracking-tight group-hover/item:text-orange-600 transition-colors">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} className="text-orange-300" /> {item.due}
                              </span>
                              
                              {isAdmin && (
                                <button onClick={(e) => handleDelete(e, item.id)} className="text-gray-200 hover:text-red-500 transition-all p-2">
                                  <Trash2 size={16} />
                                </button>
                              )}
                              
                              <div className="bg-black p-3 rounded-xl text-white group-hover/item:bg-orange-600 transition-all">
                                <Zap size={14} />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedOpp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl text-black"
            >
              <div className="p-10 border-b border-orange-50 flex justify-between items-center bg-orange-50/30">
                <span className="bg-orange-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                  {selectedOpp.category}
                </span>
                <button onClick={() => setSelectedOpp(null)} className="p-3 hover:bg-white rounded-full text-gray-400 hover:text-black transition-all shadow-sm"><X /></button>
              </div>
              <div className="p-12">
                <h2 className="text-5xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-6">{selectedOpp.name}</h2>
                <p className="text-gray-600 font-bold text-lg mb-10 leading-relaxed italic uppercase tracking-tight opacity-70">"{selectedOpp.description}"</p>
                <div className="flex flex-col gap-3">
                  <a 
                    href={selectedOpp.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-black text-white text-center py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl"
                  >
                    Apply Now <LinkIcon size={16} />
                  </a>
                  <button 
                    onClick={() => setSelectedOpp(null)} 
                    className="w-full py-5 border-2 border-orange-50 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-orange-50 transition-all text-gray-400"
                  >
                    Back to Hub
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}