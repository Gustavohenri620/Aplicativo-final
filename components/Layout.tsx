
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
  Check,
  Tags,
  Target,
  LogOut,
  CalendarDays,
  Phone,
  CloudLightning,
  CloudUpload,
  CheckCircle2,
  Loader2
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
    if (isSyncing) return;
    
    try {
      await onUpdateProfile(tempName, tempPhoto, tempGoal, tempWhatsapp);
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar perfil no Layout:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300; // Tamanho ideal para avatar, evita erros de payload
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
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setTempPhoto(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      <div 
        onClick={handleOpenProfile}
        className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors group"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border-4 border-slate-600 shadow-md shrink-0">
            {userProfile.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-slate-400" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-slate-900 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-800">
            <Camera size={12} className="text-indigo-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Olá,</p>
          <p className="text-lg font-bold text-white truncate leading-tight">{displayName}</p>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button 
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
      >
        <LogOut size={20} />
        <span className="font-medium">Sair da conta</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen dark bg-slate-950">
      <header className="lg:pl-72 fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <div className="lg:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
             <CalendarDays size={20} />
           </div>
           <h1 className="text-lg font-black text-white tracking-tight">Finance&Routine</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
            {isSyncing ? (
              <div className="flex items-center gap-2">
                <CloudUpload size={14} className="text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sincronizando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-help">
                <div className="relative">
                  <CloudLightning size={14} className="text-emerald-500" />
                  <CheckCircle2 size={6} className="absolute -bottom-0.5 -right-0.5 text-emerald-300" />
                </div>
                <div className="flex flex-col -space-y-0.5">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Nuvem Conectada</span>
                  {lastSyncTime && (
                    <span className="text-[8px] font-bold text-slate-500 lowercase leading-none">às {lastSyncTime}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 z-50">
        <SidebarContent />
      </aside>

      <main className="lg:pl-72 pt-16 min-h-screen flex flex-col">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8 flex-1 w-full">
          {React.Children.map(children, child => {
             if (React.isValidElement(child)) {
               return React.cloneElement(child as React.ReactElement<any>, { onOpenProfile: handleOpenProfile });
             }
             return child;
          })}
        </div>
      </main>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Meu Perfil</h2>
              <button 
                onClick={() => !isSyncing && setIsProfileModalOpen(false)} 
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                disabled={isSyncing}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className={`relative group ${isSyncing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  onClick={() => !isSyncing && fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-slate-50 dark:border-slate-700 shadow-sm transition-all group-hover:border-indigo-500">
                    {tempPhoto ? (
                      <img src={tempPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-slate-300 w-full h-full p-4" />
                    )}
                  </div>
                  {!isSyncing && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isSyncing}
                  />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Alterar Foto de Perfil</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input
                    required
                    disabled={isSyncing}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-400 font-bold disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Target size={12} className="text-indigo-500" />
                    Meta Financeira
                  </label>
                  <input
                    disabled={isSyncing}
                    type="text"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-400 font-bold disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Phone size={12} className="text-emerald-500" />
                    WhatsApp
                  </label>
                  <input
                    disabled={isSyncing}
                    type="tel"
                    value={tempWhatsapp}
                    onChange={(e) => setTempWhatsapp(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-400 font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSyncing ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                    {isSyncing ? 'Sincronizando...' : 'Confirmar e Salvar'}
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
