"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, BookOpen, Slack, 
  ArrowLeft, Zap, MessageCircle, X, Edit3, User, Hash, Trash2, LogOut,
  Bold, Italic, List, Plus, Layout
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// --- TIPTAP IMPORTS ---
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import dynamic from 'next/dynamic';

const EditorContent = dynamic(
  () => import('@tiptap/react').then((m) => m.EditorContent),
  { ssr: false }
);

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Intelligence');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false, 
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none p-6 min-h-[250px] text-black bg-white rounded-b-2xl',
      },
    },
  });

  useEffect(() => {
    if (isModalOpen && editor) {
      editor.commands.setContent('');
      setContent('');
    }
  }, [isModalOpen, editor]);

  // --- UPDATED AUTH LOGIC: DATABASE ROLE-BASED ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/login';
        return;
      }

      setUserEmail(user.email ?? 'Anonymous');

      // Check the profiles table for the 'founder' role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role_title')
        .eq('id', user.id)
        .single();

      if (profile && !error) {
        // Handle literal quotes if they exist in the DB
        const cleanRole = profile.role_title?.replace(/['"]+/g, '').trim().toLowerCase();
        setIsAdmin(cleanRole === 'founder');
      }

      fetchArticles();
    };
    
    checkUser();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setArticles(data);
  };

  const handlePublish = async () => {
    if (!isAdmin) return alert("Only admins can post!");
    if (!title || !content || content === '<p></p>') return alert("Please fill in all fields!");
    
    const { error } = await supabase
      .from('articles')
      .insert([{ title, author: userEmail, content, category }]);
      
    if (error) {
        alert(error.message);
    } else {
      setIsModalOpen(false);
      fetchArticles();
      setTitle(''); 
      setContent('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return alert("Access Denied: Only admins can delete.");

    if (confirm("ADMIN: Delete this community insight permanently?")) {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) {
        alert(error.message);
      } else {
        fetchArticles();
      }
    }
  };

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FFFBF9] font-sans text-black">
      {/* HEADER SECTION */}
      <div className="bg-orange-600 p-8 md:p-16 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-orange-100 font-black text-[10px] tracking-widest hover:text-white transition-all group uppercase">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-4 bg-orange-700/30 px-5 py-2 rounded-full border border-orange-400/30 backdrop-blur-sm">
               <User size={14} className="text-orange-200" />
               <span className="text-[10px] font-black uppercase tracking-widest">{userEmail?.split('@')[0]}</span>
               <button onClick={handleLogout} className="hover:text-black transition-colors ml-2 border-l border-orange-400/30 pl-3">
                <LogOut size={14}/>
               </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-7xl font-black tracking-tighter mb-2 italic uppercase leading-[0.8]">Global Hub.</h1>
              <p className="text-orange-100 font-bold uppercase text-xs tracking-widest opacity-80 mt-4">Connect. Collaborate. Create.</p>
            </div>
            <a href="https://slack.com" target="_blank" className="flex items-center gap-3 bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:text-white transition-all w-fit group">
              <Slack size={18} className="group-hover:rotate-12 transition-transform" /> Join the Slack
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT SIDE: FEED */}
          <div className="lg:col-span-8 space-y-10">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-200 group-focus-within:text-orange-500 transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Search articles by title or category..." 
                className="w-full pl-16 pr-6 py-7 bg-white rounded-[2.5rem] shadow-xl shadow-orange-900/5 border-2 border-transparent focus:border-orange-500 outline-none font-bold text-lg transition-all text-black placeholder:text-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-2 ml-4">
                <BookOpen size={14} className="text-orange-500"/> Community Insights
              </h3>
              
              <AnimatePresence>
                {filteredArticles.map((art, i) => (
                  <motion.article 
                    key={art.id || i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[3rem] border border-orange-50 shadow-sm hover:shadow-2xl hover:shadow-orange-200/40 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">{art.category}</span>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{new Date(art.created_at).toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 leading-tight uppercase tracking-tighter italic group-hover:text-orange-600 transition-colors">{art.title}</h2>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-3 flex items-center gap-2">
                        <User size={12} className="text-orange-300"/> Shared by {art.author?.split('@')[0]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={() => setSelectedArticle(art)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-black transition-all text-[10px] uppercase tracking-widest hover:bg-orange-600">
                            Read <Zap size={14} />
                        </button>
                        
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(art.id)} 
                            className="p-4 rounded-2xl transition-all text-gray-200 hover:text-red-500 hover:bg-red-50"
                          >
                              <Trash2 size={18} />
                          </button>
                        )}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT SIDE: SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-orange-900/5 border border-orange-50 sticky top-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 mb-6">
                <Edit3 size={32} />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">
                {isAdmin ? "Admin Controls" : "Community Hub"}
              </h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed mb-8 uppercase tracking-tight">
                {isAdmin ? "Post a new insight for the global community." : "Connect with elite minds and discover new opportunities."}
              </p>
              
              {isAdmin && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 hover:bg-black transition-all"
                >
                  Post an Article
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PUBLISH MODAL (ADMIN ONLY) */}
      <AnimatePresence>
        {isModalOpen && isAdmin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-black">
              <div className="p-10 border-b border-orange-50 flex justify-between items-center bg-orange-50/30">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <Edit3 className="text-orange-600" /> New Insight
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-black shadow-sm"><X /></button>
              </div>
              
              <div className="p-10 space-y-8 overflow-y-auto">
                <input type="text" placeholder="Your Catchy Title..." className="w-full text-5xl font-black outline-none placeholder:text-orange-100 border-none bg-transparent italic tracking-tighter text-black" value={title} onChange={e => setTitle(e.target.value)} />
                <div className="border-2 border-orange-50 rounded-[2rem] overflow-hidden focus-within:border-orange-500 transition-colors">
                  <div className="flex gap-2 p-4 bg-orange-50/50 border-b border-orange-50">
                    <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded-xl transition-all ${editor?.isActive('bold') ? 'bg-orange-600 text-white shadow-md' : 'text-orange-600 hover:bg-orange-100'}`}><Bold size={18}/></button>
                    <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded-xl transition-all ${editor?.isActive('italic') ? 'bg-orange-600 text-white shadow-md' : 'text-orange-600 hover:bg-orange-100'}`}><Italic size={18}/></button>
                    <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded-xl transition-all ${editor?.isActive('bulletList') ? 'bg-orange-600 text-white shadow-md' : 'text-orange-600 hover:bg-orange-100'}`}><List size={18}/></button>
                  </div>
                  <EditorContent editor={editor} className="bg-white min-h-[300px]" />
                </div>
              </div>

              <div className="p-10 border-t border-orange-50 flex justify-end">
                <button onClick={handlePublish} className="bg-black text-white px-16 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-orange-600 transition-all shadow-xl">Publish Insight</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARTICLE VIEW MODAL */}
      <AnimatePresence>
        {selectedArticle && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-black">
                  <div className="p-10 border-b border-orange-50 flex justify-between items-center">
                      <span className="bg-orange-600 text-white text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-orange-600/20">{selectedArticle.category}</span>
                      <button onClick={() => setSelectedArticle(null)} className="p-3 hover:bg-orange-50 rounded-full text-black transition-colors"><X /></button>
                  </div>
                  <div className="p-10 md:p-20 overflow-y-auto custom-scrollbar">
                      <h1 className="text-6xl font-black leading-[0.9] mb-8 italic tracking-tighter uppercase">{selectedArticle.title}</h1>
                      <div className="prose prose-orange prose-xl max-w-none font-bold text-gray-700 leading-relaxed mb-10" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                      <div className="pt-10 border-t border-orange-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Written by {selectedArticle.author}</p>
                      </div>
                  </div>
                  <div className="p-8 border-t border-orange-50 flex justify-center bg-orange-50/20">
                      <button onClick={() => setSelectedArticle(null)} className="bg-black text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-lg">Back to Hub</button>
                  </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}