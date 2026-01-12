
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  BarChart3, 
  User,
  Camera,
  X,
  Tags,
  LogOut,
  CalendarDays,
  Target,
  Phone,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Zap,
  Github,
  CloudUpload,
  CloudDownload,
  Key
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
  githubToken?: string;
  onSaveGithubToken?: (token: string) => void;
  onSyncGitHub?: () => void;
  onRestoreGitHub?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onAddClick,
  userProfile,
  onUpdateProfile,
  onLogout,
  isSyncing,
  githubToken,
  onSaveGithubToken,
  onSyncGitHub,
  onRestoreGitHub
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [tempToken, setTempToken] = useState(githubToken || '');
  
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLocalLoading(true);
    try {
      await onUpdateProfile(tempName, tempPhoto, tempGoal, tempWhatsapp);
      if (onSaveGithubToken) onSaveGithubToken(tempToken);
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
      setTempPhoto(event.target?.result as string);
      setIsLocalLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-5">
      <div 
        onClick={() => setIsProfileModalOpen(true)}
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
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-1.5 rounded-lg shadow-xl border border-slate-950">
            <Zap size={10} className="text-white fill-current" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] leading-none mb-1.5">Nível {Math.floor((userProfile.xp || 0) / 500) + 1}</p>
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
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button 
        onClick={onLogout}
        className="mt-auto flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-slate-600 hover:bg-rose-500/5 hover:text-rose-400 transition-all duration-500 font-black text-[10px] uppercase tracking-widest"
      >
        <LogOut size={18} />
        <span>Limpar Dados</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen dark bg-slate-950">
      <header className="lg:pl-72 fixed top-0 left-0 right-0 h-20 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-900/50 z-40 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
           <div className="lg:hidden w-10 h-10 bg-indigo-600 rounded-[1rem] flex items-center justify-center text-white">
             <CalendarDays size={22} strokeWidth={2.5} />
           </div>
           <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
             Finance<span className="text-indigo-500">&</span>Routine
           </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {githubToken ? (
            <div className="flex items-center gap-2">
              <button 
                disabled={isSyncing}
                onClick={onSyncGitHub}
                className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
                title="Sincronizar no GitHub"
              >
                {isSyncing ? <RefreshCcw size={18} className="animate-spin" /> : <CloudUpload size={18} />}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-bold"
            >
              <Github size={16} />
              <span>Conectar Cloud</span>
            </button>
          )}
        </div>
      </header>

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-slate-900/50 z-50">
        <SidebarContent />
      </aside>

      <main className="lg:pl-72 pt-20 min-h-screen flex flex-col">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-28 lg:pb-10 flex-1 w-full animate-in fade-in duration-700">
          {children}
        </div>
      </main>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-400">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-900">
            <div className="px-10 py-7 flex items-center justify-between border-b border-slate-900 bg-slate-900/50">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Perfil & Cloud Sync</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-3 bg-slate-900 text-slate-400 hover:text-rose-500 rounded-2xl"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-10 space-y-6">
              <div className="flex justify-center mb-4">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-900 overflow-hidden border-4 border-slate-800 shadow-2xl transition-all group-hover:border-indigo-600 group-hover:-rotate-3">
                    {tempPhoto ? <img src={tempPhoto} alt="Preview" className="w-full h-full object-cover" /> : <User size={40} className="text-slate-700 w-full h-full p-6" />}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome</label>
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full px-5 py-4 bg-slate-900 border-none rounded-2xl text-white outline-none font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input type="tel" value={tempWhatsapp} onChange={(e) => setTempWhatsapp(e.target.value)} className="w-full px-5 py-4 bg-slate-900 border-none rounded-2xl text-white outline-none font-bold text-sm" />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Github size={16} className="text-indigo-400" />
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">GitHub Sync (Cloud Privada)</label>
                  </div>
                  <div className="relative">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input 
                      type="password" 
                      value={tempToken} 
                      onChange={(e) => setTempToken(e.target.value)} 
                      placeholder="Personal Access Token (PAT)"
                      className="w-full pl-12 pr-5 py-4 bg-slate-900 border-none rounded-2xl text-white outline-none font-mono text-xs placeholder:text-slate-700" 
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed px-1">
                    Seus dados serão salvos em um <strong>Gist Privado</strong> na sua própria conta do GitHub. Gere um token com escopo 'gist' em settings/tokens.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95">
                  <CheckCircle2 size={20} /> Salvar Tudo
                </button>
                {githubToken && (
                  <button type="button" onClick={onRestoreGitHub} className="w-full py-4 bg-slate-900 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest rounded-3xl border border-slate-800 transition-all flex items-center justify-center gap-3">
                    <CloudDownload size={18} /> Restaurar Backup da Nuvem
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
