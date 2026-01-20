"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, BookOpen, Slack, 
  ArrowLeft, Zap, MessageCircle, X, Edit3, User, Hash, Trash2, LogOut,
  Bold, Italic, List
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// --- TIPTAP IMPORTS ---
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Intelligence');

  // --- TIPTAP EDITOR INITIALIZATION ---
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none p-6 min-h-[250px] text-black bg-white rounded-b-2xl',
      },
    },
  });

  // Sync editor content when modal opens
  useEffect(() => {
    if (isModalOpen && editor) {
      editor.commands.setContent('');
      setContent('');
    }
  }, [isModalOpen, editor]);

  // --- AUTH GUARD & USER CHECK ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
      } else {
        setUserEmail(user.email ?? 'Anonymous');
        fetchArticles();
      }
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

  const handleDelete = async (id: string, articleAuthor: string) => {
    if (userEmail === articleAuthor) {
      if (confirm("Are you sure you want to delete your insight?")) {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchArticles();
      }
    } else {
      alert("Security Alert: You can only delete your own articles!");
    }
  };

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FDFCFE] font-sans">
      {/* HEADER SECTION */}
      <div className="bg-orange-500 p-8 md:p-12 text-white shadow-2xl shadow-orange-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-orange-100 font-bold hover:text-white transition-all group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> BACK TO DASHBOARD
            </Link>
            <div className="flex items-center gap-4 bg-orange-600 px-4 py-2 rounded-full border border-orange-400">
               <User size={16} />
               <span className="text-xs font-black uppercase tracking-tighter">{userEmail}</span>
               <button onClick={handleLogout} className="hover:text-black transition-colors ml-2"><LogOut size={16}/></button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h1 className="text-6xl font-black tracking-tighter mb-2 italic">GLOBAL HUB.</h1>
              <p className="text-orange-100 font-medium text-lg">Connect. Collaborate. Create.</p>
            </div>
            <a href="https://slack.com" target="_blank" className="flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all w-fit">
              <Slack size={20} /> Join the Slack
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={24} />
              <input 
                type="text" 
                placeholder="Search articles..." 
                className="w-full pl-16 pr-6 py-6 bg-white rounded-[2rem] shadow-xl shadow-gray-100 border-2 border-transparent focus:border-orange-500 outline-none font-bold text-lg transition-all text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-2 ml-4">
                <BookOpen size={14} /> Community Insights
              </h3>
              
              <AnimatePresence>
                {filteredArticles.map((art, i) => (
                  <motion.article 
                    key={art.id || i}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
                  >
                    <div>
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">{art.category}</span>
                      <h2 className="text-2xl font-black text-gray-900 mt-3 group-hover:text-orange-500 transition-colors">{art.title}</h2>
                      <p className="text-gray-400 font-bold text-sm mt-1">By {art.author}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedArticle(art)} className="flex items-center gap-2 bg-gray-50 hover:bg-black hover:text-white px-6 py-3 rounded-xl font-bold transition-all text-sm text-black">
                            Read More <Zap size={14} />
                        </button>
                        {userEmail === art.author && (
                          <button onClick={() => handleDelete(art.id, art.author)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 size={18} />
                          </button>
                        )}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 border border-white sticky top-12">
              <div className="mt-2 pt-2 border-t border-gray-50">
                <p className="text-xs text-gray-400 font-medium italic mb-4 text-center">Share your expertise with the Hub.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all"
                >
                  Post an Article
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PUBLISH MODAL (TIPTAP VERSION) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 text-black">
                <div className="flex items-center gap-3">
                  <Edit3 className="text-orange-500" />
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">New Insight</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-200 rounded-full transition-colors"><X /></button>
              </div>
              
              <div className="p-10 space-y-8 overflow-y-auto">
                <input type="text" placeholder="Article Title..." className="w-full text-5xl font-black outline-none placeholder:text-gray-200 text-black bg-transparent" value={title} onChange={e => setTitle(e.target.value)} />
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <div className="w-full pl-14 pr-4 py-5 bg-gray-100 rounded-2xl font-bold text-gray-500 border-none"> Posting as: {userEmail}</div>
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select className="pl-14 pr-10 py-5 bg-gray-50 rounded-2xl font-bold outline-orange-500 border-none appearance-none text-black" value={category} onChange={e => setCategory(e.target.value)}>
                      <option>Intelligence</option><option>Web3</option><option>Civic</option>
                    </select>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                   {/* TOOLBAR */}
                  <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-100">
                    <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}><Bold size={18}/></button>
                    <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}><Italic size={18}/></button>
                    <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}><List size={18}/></button>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="p-10 border-t border-gray-100 flex justify-end bg-gray-50/50">
                <button onClick={handlePublish} className="bg-black text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-orange-600 transition-all">Publish Now</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* READ MORE MODAL */}
      <AnimatePresence>
        {selectedArticle && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{selectedArticle.category}</span>
                    <button onClick={() => setSelectedArticle(null)} className="p-3 hover:bg-gray-200 rounded-full transition-colors text-black"><X /></button>
                </div>
                <div className="p-10 md:p-16 overflow-y-auto">
                    <h1 className="text-5xl font-black text-gray-900 leading-tight mb-4 italic tracking-tighter">{selectedArticle.title}</h1>
                    <p className="text-gray-400 font-bold text-lg mb-10">By {selectedArticle.author}</p>
                    {/* Rendered content with tailwind prose for clean styling */}
                    <div className="prose prose-lg max-w-none text-black font-medium" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                </div>
                <div className="p-10 border-t border-gray-100 flex justify-end bg-gray-50/50">
                    <button onClick={() => setSelectedArticle(null)} className="bg-black text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all">Close</button>
                </div>
            </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}