"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, FolderKanban, Users, Lightbulb, UserCircle, 
  MapPin, Video, CheckCircle2, X, Briefcase, Plus, Trash2, Megaphone, 
  Bold, Italic, List, Globe, Calendar, ExternalLink, Info, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '../lib/supabase'; 

const EditorContent = dynamic(
  () => import('@tiptap/react').then((m) => m.EditorContent),
  { ssr: false }
);

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function EmpoweringTalks() {
  // --- UI & FUNCTIONAL STATES ---
  const [signupType, setSignupType] = useState<'none' | 'choice' | 'inPerson' | 'online'>('none');
  const [webinars, setWebinars] = useState<any[]>([]); 
  const [profileData, setProfileData] = useState({
    fullName: 'Member', avatarUrl: 'orange', industry: 'Not specified', location: '', website: ''
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [showCreateWebinar, setShowCreateWebinar] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState<any>(null);
  
  // State for the Webinar Form
  const [webinarForm, setWebinarForm] = useState({ title: '', date: '', link: '', description: '' });

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => setNewContent(editor.getHTML()),
    editorProps: { attributes: { class: 'prose prose-sm focus:outline-none max-w-none p-4 min-h-[150px]' } },
  });

  const fruitAvatars: any = {
    apple: 'https://api.dicebear.com/7.x/notionists/svg?seed=apple',
    orange: 'https://api.dicebear.com/7.x/notionists/svg?seed=orange',
    peach: 'https://api.dicebear.com/7.x/notionists/svg?seed=peach',
  };

  useEffect(() => { fetchPageData(); }, []);

  const fetchPageData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (user.email === 'anannyagairola@gmail.com') setIsAdmin(true);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) setProfileData({
        fullName: profile.full_name || 'Member',
        avatarUrl: profile.avatar_url || 'orange',
        industry: profile.industry || 'Exploring',
        location: profile.location || '',
        website: profile.website || ''
      });
      const { data: ann } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (ann) setAnnouncements(ann);
      const { data: web } = await supabase.from('webinars').select('*').order('date', { ascending: true });
      if (web) setWebinars(web);
    }
    setLoading(false);
  };

  const handlePostAnnouncement = async () => {
    if (!newTitle || !newContent) return alert("Please fill fields");
    const { error } = await supabase.from('announcements').insert([{ title: newTitle, content: newContent }]);
    if (!error) { setShowCreateModal(false); fetchPageData(); }
  };

  // --- UPDATED WEBINAR POST LOGIC ---
  const handlePostWebinar = async () => {
    // Ensure the keys match the SQL columns exactly
    const webinarData = {
      title: webinarForm.title,
      date: webinarForm.date,
      link: webinarForm.link,
      description: webinarForm.description
    };

    if (!webinarData.title || !webinarData.date) {
        return alert("Please fill in the Header Name and Date.");
    }

    const { data, error } = await supabase
      .from('webinars') // This matches the table you just created
      .insert([webinarData]);

    if (error) {
      console.error("Supabase Error:", error.message);
      alert(`Error: ${error.message}`);
    } else {
      setShowCreateWebinar(false);
      setWebinarForm({ title: '', date: '', link: '', description: '' });
      fetchPageData(); // Refresh the UI list
      alert("Webinar Published Successfully!");
    }
  };

  const deleteWebinar = async (id: string) => {
    if (confirm("Delete this webinar?")) {
      await supabase.from('webinars').delete().eq('id', id);
      fetchPageData();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFFBF9] text-[#4A2411]">
      <nav className="w-64 bg-white border-r border-orange-100 p-6 flex flex-col gap-2 shadow-sm">
        <div className="text-2xl font-black text-orange-600 mb-10 px-2 uppercase tracking-tighter italic">
          Empowering<br/><span className="text-black">Talks.</span>
        </div>
        <Link href="/"><NavItem icon={<Home size={20}/>} label="Home" active /></Link>
        <Link href="/projects"><NavItem icon={<FolderKanban size={20}/>} label="Projects" /></Link>
        <Link href="/community"><NavItem icon={<Users size={20}/>} label="Community" /></Link>
        <Link href="/opportunities"><NavItem icon={<Lightbulb size={20}/>} label="Opportunities" /></Link>
        <div className="mt-auto pt-4 border-t border-orange-50">
          <Link href="/profile"><NavItem icon={<UserCircle size={20}/>} label="Profile" /></Link>
        </div>
      </nav>

      <main className="flex-1 p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500 rounded-bl-[10rem] opacity-5 transition-opacity group-hover:opacity-10" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-orange-500 p-1 shadow-lg shadow-orange-500/20 transform -rotate-3">
                 <img src={fruitAvatars[profileData.avatarUrl]} alt="avatar" className="w-full h-full rounded-2xl bg-white object-cover" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-gray-900 leading-none mb-2">{loading ? '...' : `Hi, ${profileData.fullName.split(' ')[0]} 👋`}</h2>
                <p className="text-orange-600 font-black uppercase text-[10px] tracking-widest mb-3 flex items-center gap-2"><Briefcase size={12}/> {profileData.industry}</p>
                <Link href="/profile" className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-orange-600 transition-colors uppercase tracking-widest group/link">
                  Edit your profile <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform"/>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-orange-100 flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-black flex items-center gap-2 italic uppercase text-gray-900">
                 <Megaphone size={20} className="text-orange-600"/> Updates
               </h3>
               <button onClick={() => setShowHistoryModal(true)} className="text-[10px] font-black text-orange-400 uppercase tracking-widest hover:text-orange-600">Archive</button>
             </div>
             <div className="space-y-3 flex-1">
               {announcements.slice(0, 2).map((item) => (
                 <div key={item.id} className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 relative group">
                   <h4 className="font-black text-orange-600 mb-1 uppercase text-[10px] tracking-widest">{item.title}</h4>
                   <div className="text-xs text-gray-600 line-clamp-1 prose" dangerouslySetInnerHTML={{ __html: item.content }} />
                 </div>
               ))}
               {isAdmin && (
                 <button onClick={() => setShowCreateModal(true)} className="w-full bg-black text-white rounded-2xl py-3 text-[10px] font-black tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition mt-2">
                   <Plus size={14}/> NEW ANNOUNCEMENT
                 </button>
               )}
             </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-orange-50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black italic tracking-tighter">UPCOMING WEBINARS.</h3>
            {isAdmin && (
              <button onClick={() => setShowCreateWebinar(true)} className="bg-black text-white px-6 py-2 rounded-full font-black text-[10px] tracking-widest hover:bg-orange-600 transition">
                CREATE WEBINAR
              </button>
            )}
          </div>

          {webinars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-orange-100 rounded-[2.5rem] bg-orange-50/30">
              <p className="text-orange-900/40 mb-6 font-black italic uppercase tracking-widest text-sm text-center">Your growth journey starts here.</p>
              <button onClick={() => setSignupType('choice')} className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-black tracking-widest shadow-xl shadow-orange-600/30 hover:scale-105 transition active:scale-95 uppercase text-xs">Find Webinars</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {webinars.map((web) => (
                <div key={web.id} onClick={() => setSelectedWebinar(web)} className="group bg-white p-6 rounded-[2rem] border border-orange-100 cursor-pointer hover:border-orange-500 transition-all hover:shadow-2xl hover:shadow-orange-200/50 flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <Calendar size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 uppercase text-sm mb-1">{web.title}</h4>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{new Date(web.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info size={18} className="text-gray-300 group-hover:text-orange-500 transition" />
                    {isAdmin && <Trash2 size={18} onClick={(e) => { e.stopPropagation(); deleteWebinar(web.id); }} className="text-gray-200 hover:text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {/* ADMIN: CREATE WEBINAR MODAL */}
        {showCreateWebinar && (
          <Modal close={() => setShowCreateWebinar(false)}>
            <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tighter">Post Webinar.</h2>
            <div className="space-y-4">
              <input 
                placeholder="Header Name" 
                value={webinarForm.title}
                className="w-full p-5 bg-orange-50/50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-500 outline-none text-sm" 
                onChange={e => setWebinarForm({...webinarForm, title: e.target.value})}
              />
              <input 
                type="date" 
                value={webinarForm.date}
                className="w-full p-5 bg-orange-50/50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-500 outline-none text-sm" 
                onChange={e => setWebinarForm({...webinarForm, date: e.target.value})}
              />
              <input 
                placeholder="Signup Link (URL)" 
                value={webinarForm.link}
                className="w-full p-5 bg-orange-50/50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-500 outline-none text-sm" 
                onChange={e => setWebinarForm({...webinarForm, link: e.target.value})}
              />
              <textarea 
                placeholder="Brief Description..." 
                value={webinarForm.description}
                rows={3} 
                className="w-full p-5 bg-orange-50/50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-500 outline-none text-sm" 
                onChange={e => setWebinarForm({...webinarForm, description: e.target.value})}
              />
              
              <button 
                onClick={handlePostWebinar} 
                className="w-full py-5 bg-black text-white rounded-2xl font-black tracking-widest hover:bg-orange-600 transition shadow-lg text-[10px]"
              >
                PUBLISH TO USERS
              </button>
            </div>
          </Modal>
        )}

        {/* WEBINAR DETAILS VIEW */}
        {selectedWebinar && (
          <Modal close={() => setSelectedWebinar(null)}>
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">Upcoming Talk</span>
                <span className="text-gray-400 font-black text-xs">{new Date(selectedWebinar.date).toLocaleDateString()}</span>
              </div>
              <h2 className="text-4xl font-black uppercase leading-[0.9] text-gray-900">{selectedWebinar.title}</h2>
              <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100">
                <p className="text-sm font-bold text-gray-700 leading-relaxed">{selectedWebinar.description || "Join this amazing webinar session to boost your growth!"}</p>
              </div>
              <a href={selectedWebinar.link} target="_blank" className="flex items-center justify-center gap-3 w-full py-5 bg-orange-600 text-white rounded-2xl font-black tracking-widest hover:bg-black transition shadow-xl shadow-orange-600/20 uppercase text-xs">
                SIGN UP FOR FREE <ExternalLink size={18}/>
              </a>
            </div>
          </Modal>
        )}

        {/* ORIGINAL ANNOUNCEMENT MODAL */}
        {showCreateModal && (
          <Modal close={() => setShowCreateModal(false)}>
            <h2 className="text-2xl font-black mb-6 italic text-gray-900 uppercase underline decoration-orange-500 decoration-4 underline-offset-4">Drafting.</h2>
            <div className="space-y-6">
              <input placeholder="Headline" className="w-full p-5 bg-orange-50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-500 outline-none text-sm" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <div className="bg-orange-50 rounded-2xl border border-orange-100 overflow-hidden">
                <div className="flex gap-2 p-3 border-b border-orange-100 bg-white/50">
                  <button onClick={() => editor?.chain().focus().toggleBold().run()} className="p-1 text-orange-600"><Bold size={18}/></button>
                  <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="p-1 text-orange-600"><Italic size={18}/></button>
                  <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="p-1 text-orange-600"><List size={18}/></button>
                </div>
                <div className="bg-white max-h-[200px] overflow-y-auto"><EditorContent editor={editor} /></div>
              </div>
              <button onClick={handlePostAnnouncement} className="w-full bg-black text-white py-5 rounded-2xl font-black tracking-widest hover:bg-orange-600 transition shadow-lg text-[10px]">PUBLISH POST</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all 
      ${active 
        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 font-black' 
        : 'text-gray-400 hover:bg-orange-50 hover:text-orange-600 font-bold'}`}>
      {icon} <span className="uppercase text-[10px] tracking-widest">{label}</span>
    </div>
  );
}

function Modal({ children, close }: { children: React.ReactNode, close: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-[3rem] p-12 relative shadow-2xl overflow-hidden">
        <button onClick={close} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><X size={24}/></button>
        {children}
      </motion.div>
    </motion.div>
  );
}