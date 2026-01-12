
import React, { useState, useRef } from 'react';
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
  Phone
} from 'lucide-react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (name: string, photo: string, goal: string, whatsapp: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  onAddClick,
  userProfile,
  onUpdateProfile,
  onLogout
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [tempName, setTempName] = useState('');
  const [tempPhoto, setTempPhoto] = useState('');
  const [tempGoal, setTempGoal] = useState('');
  const [tempWhatsapp, setTempWhatsapp] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    setTempName(rawName);
    setTempPhoto(userProfile.avatar_url || '');
    setTempGoal(userProfile.financial_goal || '');
    setTempWhatsapp(userProfile.whatsapp_number || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(tempName, tempPhoto, tempGoal, tempWhatsapp);
    setIsProfileModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen dark bg-slate-950">
      <header className="lg:pl-72 fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <div className="lg:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
             <CalendarDays size={20} />
           </div>
           <h1 className="text-lg font-black text-white tracking-tight">FinanceFlow</h1>
        </div>
        
        <button 
          type="button"
          onClick={() => onLogout()}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-rose-900/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 hover:border-rose-900/50 transition-all font-bold text-xs"
        >
          <LogOut size={14} />
          <span>Sair</span>
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 z-50 flex-col py-6 px-4">
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
                type="button"
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
          type="button"
          onClick={() => onLogout()}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair da conta</span>
        </button>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 pb-safe pt-2 z-50 flex items-end justify-between h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex w-full justify-around items-end pb-4">
          <button 
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-medium">Início</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('routines')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'routines' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <CalendarDays size={24} />
            <span className="text-[10px] font-medium">Rotinas</span>
          </button>
        </div>

        <div className="relative -top-6">
          <button 
            type="button"
            onClick={onAddClick}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95 border-4 border-slate-950"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        <div className="flex w-full justify-around items-end pb-4">
           <button 
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'expenses' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <ArrowDownCircle size={24} />
            <span className="text-[10px] font-medium">Contas</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('planning')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'planning' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <Target size={24} />
            <span className="text-[10px] font-medium">Metas</span>
          </button>
        </div>
      </nav>

      <main className="lg:pl-72 pt-16 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
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
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Editar Perfil</h2>
              <button 
                type="button"
                onClick={() => setIsProfileModalOpen(false)} 
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-slate-50 dark:border-slate-700 shadow-sm">
                    {tempPhoto ? (
                      <img src={tempPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-slate-300 w-full h-full p-4" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <p className="text-sm text-slate-500">Clique na foto para alterar</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Seu Nome</label>
                  <input
                    required
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-400 font-medium"
                    placeholder="Como gostaria de ser chamado?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Target size={14} className="text-indigo-500" />
                    Principal Objetivo Financeiro
                  </label>
                  <input
                    type="text"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-400 font-medium"
                    placeholder="Ex: Viagem para Europa, Comprar Carro..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone size={14} className="text-emerald-500" />
                    WhatsApp (DDI + DDD + Número)
                  </label>
                  <input
                    type="tel"
                    value={tempWhatsapp}
                    onChange={(e) => setTempWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none placeholder:text-slate-400 font-medium"
                    placeholder="5511999999999"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
