
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  BarChart3, 
  Plus,
  User,
  Camera,
  X,
  Tags,
  LogOut,
  CalendarDays,
  Target,
  Phone,
  CheckCircle2,
  CloudUpload,
  CloudLightning,
  Loader2,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (name: string, photo: string, goal: string, whatsapp: string) => Promise<void>;
  onLogout: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onAddClick,
  userProfile,
  onUpdateProfile,
  onLogout,
  isSyncing = false,
  lastSyncTime = null
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
  const [tempName, setTempName] = useState('');
  const [tempPhoto, setTempPhoto] = useState('');
  const [tempGoal, setTempGoal] = useState('');
  const [tempWhatsapp, setTempWhatsapp] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isProfileModalOpen) {
      setTempName(userProfile.full_name || '');
      setTempPhoto(userProfile.avatar_url || '');
      setTempGoal(userProfile.financial_goal || '');
      setTempWhatsapp(userProfile.whatsapp_number || '');
    }
  }, [isProfileModalOpen, userProfile]);

  const rawName = userProfile?.full_name || '';
  const displayName = rawName.trim().length > 0 ? rawName : 'Visitante';

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'routines', label: 'Rotinas', icon: CalendarDays },
    { id: 'income', label: 'Receitas', icon: ArrowUpCircle },
    { id: 'expenses', label: 'Despesas', icon: ArrowDownCircle },
    { id: 'planning', label: 'Metas', icon: BarChart3 },
    { id: 'categories', label: 'Categorias', icon: Tags },
  ];

  const handleOpenProfile = () => {
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing || isLocalLoading) return;
    
    setIsLocalLoading(true);
    try {
      await onUpdateProfile(tempName, tempPhoto, tempGoal, tempWhatsapp);
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLocalLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 160; // Ultraleve para Base64 instantâneo (< 25KB)
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Qualidade 0.3 garante um Base64 minúsculo que nunca dará erro 413
          const dataUrl = canvas.toDataURL('image/jpeg', 0.3); 
          setTempPhoto(dataUrl);
        }
        setIsLocalLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-5">
      <div 
        onClick={handleOpenProfile}
        className="flex items-center gap-4 mb-10 p-5 rounded-[2.5rem] bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-all group shadow-2xl active:scale-95"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-[1.2rem] bg-slate-800 overflow-hidden flex items-center justify-center border-2 border-indigo-500/30 shadow-inner shrink-0">
            {userProfile.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-slate-500" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-1.5 rounded-lg shadow-xl border border-slate-950 group-hover:scale-110 transition-transform">
            <Zap size={10} className="text-white fill-current" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] leading-none mb-1.5">Elite Member</p>
          <p className="text-base font-black text-white truncate leading-tight tracking-tighter">{displayName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all duration-500 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 translate-x-1.5' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'animate-pulse' : ''} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
              )}
            </button>
          );
        })}
      </nav>

      <button 
        onClick={onLogout}
        className="mt-auto flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-slate-600 hover:bg-rose-500/5 hover:text-rose-400 transition-all duration-500 group font-black text-[10px] uppercase tracking-widest"
      >
        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span>Log Out Cloud</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen dark bg-slate-950">
      <header className="lg:pl-72 fixed top-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-900/50 z-40 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
           <div className="lg:hidden w-10 h-10 bg-indigo-600 rounded-[1rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
             <CalendarDays size={22} strokeWidth={2.5} />
           </div>
           <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
             F<span className="text-indigo-500">R</span>
             <span className="hidden sm:inline lowercase text-lg not-italic ml-1 font-bold text-slate-500 tracking-normal">flow</span>
           </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-4 px-5 py-2.5 bg-slate-900/40 rounded-[1.2rem] border transition-all duration-700 ${isSyncing ? 'border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.05)]' : 'border-slate-800'}`}>
            {isSyncing ? (
              <div className="flex items-center gap-3">
                <RefreshCcw size={14} className="text-indigo-400 animate-spin" />
                <div className="flex flex-col -space-y-0.5">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sincronizando</span>
                  <span className="text-[7px] font-bold text-slate-600 uppercase">Real-time Push</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <CloudLightning size={16} className="text-emerald-500" />
                  <div className="absolute inset-0 blur-lg bg-emerald-500/20" />
                </div>
                <div className="flex flex-col -space-y-0.5">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Status Ativo</span>
                  {lastSyncTime && (
                    <span className="text-[7px] font-bold text-slate-600 lowercase leading-none">last heartbeat: {lastSyncTime}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-slate-900/50 z-50">
        <SidebarContent />
      </aside>

      <main className="lg:pl-72 pt-20 min-h-screen flex flex-col">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-28 lg:pb-10 flex-1 w-full animate-in fade-in duration-700">
          {React.Children.map(children, child => {
             if (React.isValidElement(child)) {
               return React.cloneElement(child as React.ReactElement<any>, { onOpenProfile: handleOpenProfile });
             }
             return child;
          })}
        </div>
      </main>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-400">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-950 rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400 border border-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-10 py-7 flex items-center justify-between border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Profile Config</h2>
              <button 
                onClick={() => !isLocalLoading && setIsProfileModalOpen(false)} 
                className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-inner"
                disabled={isLocalLoading}
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-10 space-y-8">
              <div className="flex flex-col items-center gap-5">
                <div 
                  className={`relative group ${isLocalLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !isLocalLoading && fileInputRef.current?.click()}
                >
                  <div className="w-32 h-32 rounded-[2.8rem] bg-slate-100 dark:bg-slate-900 overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-2xl transition-all group-hover:border-indigo-600 group-hover:-rotate-3">
                    {tempPhoto ? (
                      <img src={tempPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-slate-300 w-full h-full p-8" />
                    )}
                  </div>
                  {!isLocalLoading && (
                    <div className="absolute inset-0 bg-indigo-600/40 rounded-[2.8rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Camera size={32} className="text-white animate-bounce" />
                    </div>
                  )}
                  {isLocalLoading && (
                    <div className="absolute inset-0 bg-slate-950/40 rounded-[2.8rem] flex items-center justify-center">
                       <Loader2 size={36} className="text-indigo-400 animate-spin" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isLocalLoading}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Avatar Optimizer v1.0</p>
                  <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Synced via Cloud Pipeline</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Identity Name</label>
                  <input
                    required
                    disabled={isLocalLoading}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Your digital signature"
                    className="w-full px-7 py-5 bg-slate-50 dark:bg-slate-900 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-600 text-slate-800 dark:text-white outline-none placeholder:text-slate-700 font-bold transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1 flex items-center gap-2">
                    <Target size={14} className="text-indigo-500" />
                    Main Objective
                  </label>
                  <input
                    disabled={isLocalLoading}
                    type="text"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    placeholder="Set your north star"
                    className="w-full px-7 py-5 bg-slate-50 dark:bg-slate-900 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-600 text-slate-800 dark:text-white outline-none placeholder:text-slate-700 font-bold transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1 flex items-center gap-2">
                    <Phone size={14} className="text-emerald-500" />
                    Secure Whatsapp
                  </label>
                  <input
                    disabled={isLocalLoading}
                    type="tel"
                    value={tempWhatsapp}
                    onChange={(e) => setTempWhatsapp(e.target.value)}
                    placeholder="E.164 Standard"
                    className="w-full px-7 py-5 bg-slate-50 dark:bg-slate-900 border-none rounded-[1.5rem] focus:ring-2 focus:ring-indigo-600 text-slate-800 dark:text-white outline-none placeholder:text-slate-700 font-bold transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-6">
                  <button
                    disabled={isSyncing || isLocalLoading}
                    type="submit"
                    className="group w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
                  >
                    {(isSyncing || isLocalLoading) ? <RefreshCcw className="animate-spin" size={20} /> : <CheckCircle2 size={20} className="group-hover:scale-125 transition-transform" />}
                    {(isSyncing || isLocalLoading) ? 'Syncing Core...' : 'Overwrite Cloud Profile'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
