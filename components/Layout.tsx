
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
  RefreshCcw
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
        const MAX_SIZE = 200; // Máxima eficiência de payload (Abaixo de 40KB Base64)
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.4); // Compressão agressiva porém nítida para avatar
          setTempPhoto(dataUrl);
        }
        setIsLocalLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      <div 
        onClick={handleOpenProfile}
        className="flex items-center gap-4 mb-8 p-4 rounded-3xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-700/80 transition-all group shadow-sm active:scale-95"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-indigo-500/20 shadow-md shrink-0">
            {userProfile.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-slate-400" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-1 rounded-lg shadow-sm border border-slate-900 group-hover:scale-110 transition-transform">
            <Camera size={10} className="text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Perfil</p>
          <p className="text-base font-black text-white truncate leading-tight tracking-tight">{displayName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
            </button>
          );
        })}
      </nav>

      <button 
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 group font-bold text-sm"
      >
        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Encerrar Sessão</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen dark bg-slate-950">
      <header className="lg:pl-72 fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
           <div className="lg:hidden w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
             <CalendarDays size={20} />
           </div>
           <h1 className="text-xl font-black text-white tracking-tighter">Finance<span className="text-indigo-500">&</span>Routine</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-3 px-4 py-1.5 bg-slate-900/50 rounded-2xl border transition-all duration-500 ${isSyncing ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-slate-800'}`}>
            {isSyncing ? (
              <div className="flex items-center gap-2.5">
                <RefreshCcw size={12} className="text-indigo-400 animate-spin" />
                <div className="flex flex-col -space-y-0.5">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Gravando...</span>
                  <span className="text-[7px] font-bold text-slate-500 uppercase">Cloud Sync</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <CloudLightning size={14} className="text-emerald-500" />
                  <div className="absolute inset-0 blur-sm bg-emerald-500/20" />
                </div>
                <div className="flex flex-col -space-y-0.5">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Nuvem Ativa</span>
                  {lastSyncTime && (
                    <span className="text-[8px] font-bold text-slate-500 lowercase leading-none">atua. em {lastSyncTime}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-slate-900 z-50">
        <SidebarContent />
      </aside>

      <main className="lg:pl-72 pt-16 min-h-screen flex flex-col">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8 flex-1 w-full animate-in fade-in duration-500">
          {React.Children.map(children, child => {
             if (React.isValidElement(child)) {
               return React.cloneElement(child as React.ReactElement<any>, { onOpenProfile: handleOpenProfile });
             }
             return child;
          })}
        </div>
      </main>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Meu Perfil Cloud</h2>
              <button 
                onClick={() => !isLocalLoading && setIsProfileModalOpen(false)} 
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"
                disabled={isLocalLoading}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className={`relative group ${isLocalLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={() => !isLocalLoading && fileInputRef.current?.click()}
                >
                  <div className="w-28 h-28 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-slate-50 dark:border-slate-700 shadow-xl transition-all group-hover:border-indigo-500 group-hover:rotate-3">
                    {tempPhoto ? (
                      <img src={tempPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={56} className="text-slate-300 w-full h-full p-6" />
                    )}
                  </div>
                  {!isLocalLoading && (
                    <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={28} className="text-white" />
                    </div>
                  )}
                  {isLocalLoading && (
                    <div className="absolute inset-0 bg-black/20 rounded-[2.5rem] flex items-center justify-center">
                       <Loader2 size={32} className="text-indigo-400 animate-spin" />
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avatar Personalizado</p>
                  <span className="text-[8px] font-bold text-indigo-500 uppercase">Sincronizado via Supabase</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Exibição Pessoal</label>
                  <input
                    required
                    disabled={isLocalLoading}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-600 font-bold disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Target size={12} className="text-indigo-500" />
                    Propósito Financeiro
                  </label>
                  <input
                    disabled={isLocalLoading}
                    type="text"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    placeholder="Ex: Comprar Casa em 2026"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-600 font-bold disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <Phone size={12} className="text-emerald-500" />
                    Notificações WhatsApp
                  </label>
                  <input
                    disabled={isLocalLoading}
                    type="tel"
                    value={tempWhatsapp}
                    onChange={(e) => setTempWhatsapp(e.target.value)}
                    placeholder="5511999999999"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-600 font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-4">
                  <button
                    disabled={isSyncing || isLocalLoading}
                    type="submit"
                    className="group w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-[1.8rem] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {(isSyncing || isLocalLoading) ? <RefreshCcw className="animate-spin" size={18} /> : <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />}
                    {(isSyncing || isLocalLoading) ? 'Sincronizando Dados...' : 'Salvar Alterações Agora'}
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
