"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Sparkles, User, Mail, MapPin, 
  Globe, Phone, Instagram, Linkedin, 
  CheckCircle2, ChevronDown, LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase'; 

export default function ProfessionalProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // FORM STATES
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('apple');
  const [industrySearch, setIndustrySearch] = useState('');
  const [roleTitle, setRoleTitle] = useState('Active Member'); // New state for Status
  
  const [isSaved, setIsSaved] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser({
          id: user.id,
          email: user.email,
          joined: new Date(user.created_at).toLocaleDateString(),
        });

        // FETCH SAVED DATA INCLUDING ROLE AND SOCIALS
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setLocation(profile.location || '');
          setPhone(profile.phone || '');
          setWebsite(profile.website || '');
          setIndustrySearch(profile.industry || '');
          setSelectedAvatar(profile.avatar_url || 'apple');
          setRoleTitle(profile.role_title || 'Active Member'); // Pulls from your new column
          setLinkedin(profile.linkedin || ''); // Pulls saved LinkedIn
          setInstagram(profile.instagram || ''); // Pulls saved Instagram
        }
      } else {
        window.location.href = '/login';
      }
      setLoading(false);
    };
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        location: location,
        phone: phone,
        website: website,
        industry: industrySearch,
        avatar_url: selectedAvatar,
        linkedin: linkedin,    // Saves LinkedIn to DB
        instagram: instagram,  // Saves Instagram to DB
        updated_at: new Date(),
      });

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const fruitAvatars = [
    { id: 'apple', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=apple' },
    { id: 'orange', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=orange' },
    { id: 'peach', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=peach' },
    { id: 'lemon', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=lemon' },
    { id: 'pear', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=pear' },
    { id: 'cherry', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=cherry' },
    { id: 'grape', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=grape' },
    { id: 'strawberry', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=strawberry' },
  ];

  const industries = ["Computer Science", "Artificial Intelligence", "Cybersecurity", "Data Science", "Agriculture Technology", "Biotechnology", "FinTech", "Software Engineering", "UI/UX Design"];
  const filteredIndustries = useMemo(() => industries.filter(i => i.toLowerCase().includes(industrySearch.toLowerCase())), [industrySearch]);

  if (loading && !user) return <div className="min-h-screen flex items-center justify-center font-black italic text-orange-500 tracking-tighter text-3xl">SYNCING IDENTITY...</div>;

  return (
    <main className="min-h-screen bg-[#FDFCFE] relative overflow-hidden pb-20">
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[100px]" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12">
        <div className="flex justify-between items-start mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/community" className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 font-bold transition-all group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> BACK TO HUB
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mt-4 italic">MY IDENTITY.</h1>
          </motion.div>
          
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all">
            <LogOut size={16} /> LOGOUT
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white text-center">
               <div className="relative w-32 h-32 mx-auto mb-6">
                  <motion.div key={selectedAvatar} animate={{ scale: [0.9, 1] }} className="w-full h-full rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 p-1">
                    <img src={fruitAvatars.find(a => a.id === selectedAvatar)?.url} className="w-full h-full rounded-full bg-white object-cover" alt="profile"/>
                  </motion.div>
               </div>
               <div className="grid grid-cols-4 gap-2">
                 {fruitAvatars.map(a => (
                   <button key={a.id} onClick={() => setSelectedAvatar(a.id)} className={`rounded-xl transition-all p-1 ${selectedAvatar === a.id ? 'bg-orange-100 ring-2 ring-orange-500 scale-110' : 'opacity-40 hover:opacity-100'}`}>
                     <img src={a.url} alt="fruit" className="w-full h-full" />
                   </button>
                 ))}
               </div>
            </div>

            {/* UPDATED STATUS BOX WITH SPARKLE AND DYNAMIC ROLE */}
            <div className="bg-orange-500 p-8 rounded-[2.8rem] shadow-xl mt-6 relative overflow-hidden group">
              <div className="absolute top-4 left-4 text-orange-200 opacity-40">
                <Sparkles size={24} />
              </div>

              <div className="relative z-10">
                <h2 className="text-white text-3xl font-black uppercase italic tracking-tighter leading-none">
                  Status: {roleTitle}
                </h2>
                <p className="text-orange-100/60 text-[9px] font-bold uppercase mt-4 tracking-widest">
                  Joined: {user?.joined || '1/19/2026'}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white">
              
              <SectionTitle title="Verified Account" />
              <div className="mb-10 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl text-green-600"><CheckCircle2 size={24}/></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-black">{user?.email}</p>
                </div>
              </div>

              <SectionTitle title="Personal Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <InputBox label="Full Name" value={fullName} onChange={setFullName} placeholder="Enter name" icon={<User size={16}/>}/>
                <InputBox label="Location" value={location} onChange={setLocation} placeholder="City, State" icon={<MapPin size={16}/>}/>
                <InputBox label="Phone Number" value={phone} onChange={setPhone} placeholder="+1..." icon={<Phone size={16}/>}/>
                <InputBox label="Website" value={website} onChange={setWebsite} placeholder="yourdomain.com" icon={<Globe size={16}/>}/>
              </div>

              <SectionTitle title="Social Media" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <InputBox label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="profile link" icon={<Linkedin size={16}/>}/>
                <InputBox label="Instagram" value={instagram} onChange={setInstagram} placeholder="username" icon={<Instagram size={16}/>}/>
              </div>

              <SectionTitle title="Primary Focus" />
              <div className="relative mb-12">
                <div className="relative">
                  <input 
                    type="text" 
                    value={industrySearch}
                    onChange={(e) => {setIndustrySearch(e.target.value); setIsDropdownOpen(true)}}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none font-bold text-black"
                    placeholder="Search industry..."
                  />
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                
                <AnimatePresence>
                  {isDropdownOpen && filteredIndustries.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto p-2">
                      {filteredIndustries.map((item) => (
                        <button key={item} onClick={() => {setIndustrySearch(item); setIsDropdownOpen(false)}} className="w-full text-left p-4 hover:bg-orange-50 rounded-xl font-bold text-black hover:text-orange-600 transition-colors">
                          {item}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleUpdateProfile}
                className={`w-full py-6 rounded-3xl font-black text-lg tracking-widest transition-all shadow-xl ${isSaved ? 'bg-green-500 text-white' : 'bg-black text-white'}`}
              >
                {isSaved ? 'SAVED SUCCESSFULLY' : 'SAVE PROFILE'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
    {title} <div className="h-[1px] flex-1 bg-orange-100" />
  </h3>;
}

function InputBox({ label, value, onChange, placeholder, icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-black placeholder:text-gray-300" 
      />
    </div>
  );
}