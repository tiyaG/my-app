"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Link as LinkIcon, Github, Globe, 
  ChevronDown, Plus, ExternalLink, FileText, Info, ArrowLeft, Rocket, CheckCircle, Trash2, Layers, ShieldCheck, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ProjectsPage() {
  const [uploadMethod, setUploadMethod] = useState<'none' | 'file' | 'link'>('link');
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role_title')
          .eq('id', user.id)
          .single();

        if (profile) {
          const cleanRole = profile.role_title?.replace(/['"]+/g, '').trim().toLowerCase();
          const isFounder = cleanRole === 'founder';
          setIsAdmin(isFounder);
          if (isFounder) fetchPending();
        }
      }
      fetchApproved();
    };
    initPage();
  }, []);

  const fetchApproved = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (data) setMyProjects(data);
  };

  const fetchPending = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setPendingProjects(data);
  };

  // UPDATED: Optimistic Update Logic
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    // 1. Find the project in the pending list before moving it
    const projectToMove = pendingProjects.find(p => p.id === id);

    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      // 2. Remove from the pending UI list
      setPendingProjects(prev => prev.filter(p => p.id !== id));

      // 3. If approved, immediately push it into the approved feed UI
      if (newStatus === 'approved' && projectToMove) {
        const approvedProject = { ...projectToMove, status: 'approved' };
        setMyProjects(prev => [approvedProject, ...prev]);
      }
    } else {
      alert("Error updating status: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project permanently?")) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      setMyProjects(prev => prev.filter(p => p.id !== id));
      setPendingProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    let finalRepoUrl = repoUrl;
    try {
      if (uploadMethod === 'file' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from('Project Files') 
          .upload(fileName, file);
        if (storageError) throw storageError;
        const { data: urlData } = supabase.storage.from('Project Files').getPublicUrl(fileName);
        finalRepoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('projects')
        .insert([{ repo_url: finalRepoUrl, live_url: siteUrl, status: 'pending' }]);

      if (error) throw error;

      setShowSuccess(true);
      setRepoUrl('');
      setSiteUrl('');
      setFile(null);
      setTimeout(() => setShowSuccess(false), 3000);
      alert("Project submitted! Awaiting founder approval.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const projectIdeas = [
    { id: 1, title: "AI Ethics Dashboard", diff: "hard", desc: "Build a tool that analyzes news articles for bias using OpenAI's API." },
    { id: 2, title: "Local Election Tracker", diff: "medium", desc: "A React app that pulls local candidate data and summarizes platforms." },
    { id: 3, title: "Community Fridge Map", diff: "easy", desc: "A simple interactive map showing donation locations." },
  ];

  return (
    <main className="min-h-screen bg-[#FFFBF9] text-black">
      <header className="relative bg-orange-600 p-8 md:p-16 text-white overflow-hidden shadow-xl mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-100 font-black text-[10px] tracking-widest mb-8 hover:text-white transition-all group uppercase">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <Rocket size={32} className="text-white" />
            <h1 className="text-6xl font-black tracking-tighter italic uppercase">Project Hub.</h1>
          </div>
          <p className="text-orange-100 font-bold uppercase text-xs tracking-widest opacity-80">Build. Share. Inspire.</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
        
        <div className="lg:col-span-5 space-y-8">
          
          {/* 🚨 ADMIN REVIEW QUEUE */}
          {isAdmin && pendingProjects.length > 0 && (
            <div className="bg-yellow-50 p-8 rounded-[2.5rem] border-2 border-yellow-200 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-yellow-700 mb-6 flex items-center gap-2">
                <ShieldCheck size={18}/> Review Queue ({pendingProjects.length})
              </h3>
              <div className="space-y-3">
                {pendingProjects.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-yellow-100">
                    <div className="overflow-hidden mr-2">
                      <p className="font-black text-[10px] uppercase truncate">{p.repo_url.split('/').pop()}</p>
                      <a href={p.repo_url} target="_blank" className="text-[9px] text-blue-500 underline uppercase">View Link</a>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStatus(p.id, 'approved')} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md active:scale-95 transition-all"><CheckCircle size={14}/></button>
                      <button onClick={() => handleUpdateStatus(p.id, 'rejected')} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md active:scale-95 transition-all"><XCircle size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-900/5 relative overflow-hidden border border-orange-50">
            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center text-center p-6">
                  <CheckCircle size={48} className="text-orange-600 mb-2" />
                  <h3 className="text-2xl font-black text-gray-900 uppercase italic">Submitted!</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Awaiting Founder Approval</p>
                </motion.div>
              )}
            </AnimatePresence>

            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
               <Plus size={16} className="text-orange-600"/> Submit Project
            </h3>

            <div className="flex gap-2 mb-6 bg-orange-50/50 p-1.5 rounded-2xl">
              <button onClick={() => setUploadMethod('file')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${uploadMethod === 'file' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-orange-400'}`}>File Upload</button>
              <button onClick={() => setUploadMethod('link')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${uploadMethod === 'link' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-orange-400'}`}>Insert Link</button>
            </div>

            <div className="space-y-4">
              {uploadMethod === 'link' ? (
                <div className="relative">
                   <Github className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-600" size={18} />
                   <input type="text" placeholder="GitHub Repository URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="w-full pl-14 pr-4 py-5 bg-orange-50/30 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300" />
                </div>
              ) : (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-orange-100 bg-orange-50/20'}`}
                >
                  <input type="file" id="file-upload" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud size={32} className="text-orange-600 mb-2" />
                    <span className="text-sm font-black text-gray-700 uppercase tracking-tight">
                      {file ? file.name : "Drop your work here"}
                    </span>
                  </label>
                </div>
              )}
              
              <div className="relative">
                 <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-600" size={18} />
                 <input type="text" placeholder="Live Website URL" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} className="w-full pl-14 pr-4 py-5 bg-orange-50/30 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-700 transition-all placeholder:text-gray-300" />
              </div>

              <button onClick={handlePublish} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-black tracking-widest uppercase text-[10px] shadow-xl hover:bg-orange-600 transition-all disabled:bg-gray-200">
                {loading ? "Processing..." : "Submit for Approval"}
              </button>
            </div>
          </div>

          {/* COMMUNITY FEED */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-orange-50 flex flex-col">
            <h3 className="font-black text-orange-600 uppercase text-[10px] tracking-[0.3em] mb-6 flex items-center gap-2">
              <Layers size={16}/> Approved Projects
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {myProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl border border-orange-100 group hover:border-orange-400 transition-colors">
                  <div className="flex-1 overflow-hidden mr-4">
                    <p className="font-black text-gray-900 text-xs uppercase truncate tracking-tight">{p.repo_url.split('/').pop()}</p>
                    <p className="text-[9px] text-orange-600/60 uppercase font-black tracking-widest mt-1">Verified Project</p>
                  </div>
                  <div className="flex gap-1">
                    {isAdmin && (
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    )}
                    <a href={p.repo_url} target="_blank" className="p-2 bg-white rounded-lg text-orange-600 border border-orange-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                      <ExternalLink size={14}/>
                    </a>
                  </div>
                </div>
              ))}
              {myProjects.length === 0 && (
                <p className="text-center py-10 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">No approved projects yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSPIRATION */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-4">Inspiration Feed</h3>
          {projectIdeas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-[2rem] shadow-sm border border-orange-50 overflow-hidden group hover:shadow-lg transition-shadow">
               <div onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)} className="p-8 cursor-pointer flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <Info size={20} />
                    </div>
                    <div>
                      <span className="text-lg font-black text-gray-900 tracking-tight uppercase block">{idea.title}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${idea.diff === 'hard' ? 'text-red-500' : 'text-orange-500'}`}>{idea.diff} difficulty</span>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`text-gray-300 transition-transform duration-300 ${expandedIdea === idea.id ? 'rotate-180 text-orange-600' : ''}`} />
               </div>
               <AnimatePresence>
                 {expandedIdea === idea.id && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 pb-8">
                     <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 text-gray-600 font-bold text-sm leading-relaxed">
                       {idea.desc}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}