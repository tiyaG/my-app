"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Link as LinkIcon, Github, Globe, 
  ChevronDown, Plus, ExternalLink, FileText, Info, ArrowLeft, Rocket, CheckCircle, Trash2 
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (Ensure your .env.local has the 'anon' key!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProjectsPage() {
  const [uploadMethod, setUploadMethod] = useState<'none' | 'file' | 'link'>('link');
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // NEW STATE FOR FILE HANDLING
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMyProjects(data);
  };

  useEffect(() => { fetchProjects(); }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) alert(error.message);
    else setMyProjects(myProjects.filter(p => p.id !== id));
  };

  // --- FILE DRAG & DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // --- PUBLISH LOGIC ---
  const handlePublish = async () => {
    setLoading(true);
    let finalRepoUrl = repoUrl;

    try {
      // 1. Handle File Upload if method is 'file'
      if (uploadMethod === 'file' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        // Using your exact bucket name with the space
        const { data: storageData, error: storageError } = await supabase.storage
          .from('Project Files') 
          .upload(fileName, file);

        if (storageError) throw storageError;
        
        // Get public URL
        const { data: urlData } = supabase.storage.from('Project Files').getPublicUrl(fileName);
        finalRepoUrl = urlData.publicUrl;
      }

      // 2. Insert into Database
      const { data, error } = await supabase
        .from('projects')
        .insert([{ repo_url: finalRepoUrl, live_url: siteUrl }])
        .select();

      if (error) throw error;

      setShowSuccess(true);
      setRepoUrl('');
      setSiteUrl('');
      setFile(null);
      if (data) setMyProjects(prev => [data[0], ...prev]);
      setTimeout(() => setShowSuccess(false), 3000);
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
    <main className="min-h-screen bg-[#FDFCFE]">
      <header className="relative bg-orange-500 p-8 md:p-16 text-white overflow-hidden shadow-2xl mb-12">
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-100 font-bold mb-8 hover:text-white transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> BACK TO DASHBOARD
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <Rocket size={28} className="text-orange-200" />
            <h1 className="text-6xl font-black tracking-tighter italic uppercase">Project Hub.</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-gray-50">
            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center text-center p-6">
                  <CheckCircle size={48} className="text-green-500 mb-2" />
                  <h3 className="text-2xl font-black text-black">PUBLISHED!</h3>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 mb-6 bg-gray-50 p-1.5 rounded-2xl">
              <button onClick={() => setUploadMethod('file')} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${uploadMethod === 'file' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}>File Upload</button>
              <button onClick={() => setUploadMethod('link')} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${uploadMethod === 'link' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'}`}>Insert Link</button>
            </div>

            <div className="space-y-4">
              {uploadMethod === 'link' ? (
                <div className="relative">
                   <Github className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input type="text" placeholder="GitHub Repository URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className="w-full pl-14 pr-4 py-5 bg-gray-50 rounded-2xl outline-orange-500 font-bold text-gray-700" />
                </div>
              ) : (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                >
                  <input type="file" id="file-upload" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud size={32} className="text-orange-500 mb-2" />
                    <span className="text-sm font-bold text-gray-600">
                      {file ? file.name : "Drag & Drop or Click to Upload"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">Supports .zip, .pdf, .png</span>
                  </label>
                </div>
              )}
              
              <div className="relative">
                 <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input type="text" placeholder="Live Website URL (Optional)" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} className="w-full pl-14 pr-4 py-5 bg-gray-50 rounded-2xl outline-orange-500 font-bold text-gray-700" />
              </div>

              <button onClick={handlePublish} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-black tracking-widest uppercase text-sm shadow-xl hover:bg-orange-600 transition-all disabled:bg-gray-400">
                {loading ? "Processing..." : "Make Project Public"}
              </button>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
            <h3 className="font-black text-orange-500 uppercase text-[10px] tracking-[0.2em] mb-6">Live Community Feed</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {myProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group">
                  <div className="flex-1 overflow-hidden mr-4">
                    <p className="font-bold text-sm truncate">{p.repo_url.split('/').pop()}</p>
                    <p className="text-[9px] text-gray-500 uppercase font-black">Shared Recently</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                    <a href={p.repo_url} target="_blank" className="p-2 bg-white/5 rounded-lg hover:bg-orange-500">
                      <ExternalLink size={14}/>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-4">Inspiration Feed</h3>
          {projectIdeas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group">
               <div onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)} className="p-8 cursor-pointer flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xl font-bold text-gray-800 tracking-tight">{idea.title}</span>
                  </div>
                  <ChevronDown size={20} className={expandedIdea === idea.id ? 'rotate-180 transition-transform' : ''} />
               </div>
               {expandedIdea === idea.id && (
                 <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed">{idea.desc}</div>
               )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}