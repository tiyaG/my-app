"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, FolderKanban, Users, Lightbulb, UserCircle, 
  MapPin, Video, CheckCircle2, X, Briefcase, Plus, Trash2, Megaphone, Link as LinkIcon,
  Bold, Italic, List
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../lib/supabase'; 

// --- TIPTAP IMPORTS ---
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function EmpoweringTalks() {
  // --- UI STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signupType, setSignupType] = useState<'none' | 'choice' | 'inPerson' | 'online'>('none');
  const [webinars, setWebinars] = useState([]); 

  // --- DATA & ADMIN STATES ---
  const [profileData, setProfileData] = useState({
    fullName: 'Member',
    avatarUrl: 'apple',
    industry: 'Not specified',
    location: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // --- ANNOUNCEMENT FORM STATES ---
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // --- TIPTAP EDITOR INITIALIZATION ---
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setNewContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none p-4 min-h-[150px]',
      },
    },
  });

  // Sync editor content when modal opens/resets
  useEffect(() => {
    if (showCreateModal && editor) {
      editor.commands.setContent('');
      setNewContent('');
    }
  }, [showCreateModal, editor]);

  const fruitAvatars: any = {
    apple: 'https://api.dicebear.com/7.x/notionists/svg?seed=apple',
    orange: 'https://api.dicebear.com/7.x/notionists/svg?seed=orange',
    peach: 'https://api.dicebear.com/7.x/notionists/svg?seed=peach',
    lemon: 'https://api.dicebear.com/7.x/notionists/svg?seed=lemon',
    pear: 'https://api.dicebear.com/7.x/notionists/svg?seed=pear',
    cherry: 'https://api.dicebear.com/7.x/notionists/svg?seed=cherry',
    grape: 'https://api.dicebear.com/7.x/notionists/svg?seed=grape',
    strawberry: 'https://api.dicebear.com/7.x/notionists/svg?seed=strawberry',
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (user.email === 'anannyagairola@gmail.com') setIsAdmin(true);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setProfileData({
          fullName: profile.full_name || 'Member',
          avatarUrl: profile.avatar_url || 'apple',
          industry: profile.industry || 'Exploring',
          location: profile.location || '',
          website: profile.website || ''
        });
      }
      const { data: ann } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (ann) setAnnouncements(ann);
    }
    setLoading(false);
  };

  const handlePostAnnouncement = async () => {
    if (!newTitle || !newContent || newContent === '<p></p>') return alert("Please fill both fields");
    const { error } = await supabase.from('announcements').insert([{ title: newTitle, content: newContent }]);
    if (!error) {
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      fetchPageData();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm("Permanently delete this announcement?")) {
      await supabase.from('announcements').delete().eq('id', id);
      fetchPageData();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-[#333]">
      {/* --- SIDEBAR NAVIGATION --- */}
      <nav className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-2">
        <div className="text-2xl font-black text-orange-500 mb-10 px-2 uppercase tracking-tighter">
          Empowering<br/><span className="text-gray-900">Talks</span>
        </div>
        <Link href="/"><NavItem icon={<Home size={20}/>} label="Home" active /></Link>
        <Link href="/projects"><NavItem icon={<FolderKanban size={20}/>} label="Projects" /></Link>
        <Link href="/community"><NavItem icon={<Users size={20}/>} label="Community" /></Link>
        <Link href="/opportunities"><NavItem icon={<Lightbulb size={20}/>} label="Opportunities" /></Link>
        <div className="mt-auto pt-4 border-t">
          <Link href="/profile"><NavItem icon={<UserCircle size={20}/>} label="Profile" /></Link>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* PROFILE SUMMARY */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[5rem] -z-0 opacity-50" />
            <div className="relative z-10 flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-orange-100 shadow-xl overflow-hidden p-1">
                 <img src={fruitAvatars[profileData.avatarUrl] || fruitAvatars['apple']} alt="avatar" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">{loading ? '...' : `Hi, ${profileData.fullName.split(' ')[0]} 👋`}</h2>
                <p className="text-orange-500 font-bold flex items-center gap-2 mt-1"><Briefcase size={16} /> {profileData.industry}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                <p className="font-bold text-sm text-gray-700 truncate">{profileData.location || 'Not Set'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Portfolio</p>
                <p className="font-bold text-sm text-gray-700 truncate">{profileData.website || 'Add Link'}</p>
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENTS BOX */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black flex items-center gap-2 text-gray-800">
                 <Megaphone size={20} className="text-orange-500"/> ANNOUNCEMENTS
               </h3>
               <button onClick={() => setShowHistoryModal(true)} className="text-xs font-black text-orange-400 uppercase tracking-widest hover:text-orange-600">View History</button>
             </div>

             <div className="space-y-4 flex-1">
               {announcements.slice(0, 3).map((item) => (
                 <div key={item.id} className="group bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative">
                   <h4 className="font-black text-gray-900 mb-1 uppercase text-xs tracking-wider">{item.title}</h4>
                   <div className="text-sm text-gray-500 line-clamp-2 prose prose-sm" dangerouslySetInnerHTML={{ __html: item.content }} />
                   {isAdmin && (
                     <button onClick={() => handleDeleteAnnouncement(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                       <Trash2 size={16} />
                     </button>
                   )}
                 </div>
               ))}
               {isAdmin && (
                 <button onClick={() => setShowCreateModal(true)} className="w-full border-2 border-dashed border-orange-200 rounded-2xl py-4 text-orange-500 font-black text-xs flex items-center justify-center gap-2 hover:bg-orange-50 transition">
                   <Plus size={16}/> NEW ANNOUNCEMENT
                 </button>
               )}
             </div>
          </div>
        </div>

        {/* WEBINARS SECTION */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Upcoming Webinars</h3>
            <span className="text-sm font-bold text-orange-500 cursor-pointer">ALL MEMBERS</span>
          </div>
          {webinars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
              <p className="text-gray-400 mb-4 font-medium">You haven't signed up for any talks yet.</p>
              <button onClick={() => {setIsModalOpen(true); setSignupType('choice')}} className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-100 hover:scale-105 transition">Sign up for your first talk</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
          )}
        </div>
      </main>

      {/* --- MODAL: CREATE ANNOUNCEMENT (TIPTAP INTEGRATED) --- */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 relative shadow-2xl">
              <h2 className="text-2xl font-black mb-6 italic text-gray-900 uppercase underline decoration-orange-500">Drafting.</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-2 block">Headline</label>
                  <input placeholder="Enter title..." className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-500 outline-none" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                </div>
                
                <div className="flex flex-col bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest p-4 pb-0 block">Content Body</label>
                  
                  {/* TIPTAP TOOLBAR */}
                  <div className="flex gap-2 p-2 border-b border-gray-200 bg-white/50 px-4">
                    <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}><Bold size={18}/></button>
                    <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}><Italic size={18}/></button>
                    <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}><List size={18}/></button>
                  </div>

                  {/* TIPTAP EDITOR */}
                  <div className="bg-white overflow-y-auto max-h-[250px] font-medium">
                    <EditorContent editor={editor} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-black text-gray-400 uppercase hover:text-black">Cancel</button>
                  <button onClick={handlePostAnnouncement} className="flex-[2] bg-black text-white py-4 rounded-2xl font-black tracking-widest hover:bg-orange-500 transition shadow-lg">PUBLISH POST</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL: ANNOUNCEMENT HISTORY --- */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[3rem] p-10 overflow-y-auto relative text-black">
              <button onClick={() => setShowHistoryModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black font-black"><X size={32}/></button>
              <h2 className="text-3xl font-black mb-8 italic text-gray-900 uppercase">Archive.</h2>
              <div className="space-y-8">
                {announcements.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-8">
                    <span className="text-[10px] font-black text-orange-400 tracking-[0.2em]">{new Date(item.created_at).toLocaleDateString()}</span>
                    <h3 className="text-2xl font-black text-gray-900 mt-1 uppercase">{item.title}</h3>
                    <div className="mt-4 text-gray-600 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                    {isAdmin && <button onClick={() => handleDeleteAnnouncement(item.id)} className="text-red-500 text-[10px] font-black mt-6 flex items-center gap-1 uppercase tracking-widest border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50"><Trash2 size={12}/> Remove</button>}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- REUSABLE COMPONENTS --- */
function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition ${active ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}>
      {icon} <span>{label}</span>
    </div>
  );
}

function ChoiceCard({ icon, title, onClick }: { icon: any, title: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-8 border-2 border-gray-50 rounded-[2rem] hover:border-orange-200 hover:bg-orange-50/30 transition flex flex-col items-center gap-3">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50">{icon}</div>
      <span className="font-bold text-lg">{title}</span>
    </button>
  );
}