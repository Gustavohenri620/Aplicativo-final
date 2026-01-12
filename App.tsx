
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Planning from './components/Planning';
import CategorySettings from './components/CategorySettings';
import RoutineTracker from './components/RoutineTracker';
import FinancialCalendar from './components/FinancialCalendar';
import Auth from './components/Auth';
import { Transaction, Category, Budget, TransactionType, UserProfile, RoutineItem, TransactionStatus } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { X, Loader2, CheckCircle2, Trash2, Info, AlertCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { supabase } from './supabase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'delete';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>();

  const syncChannelRef = useRef<any>(null);

  const updateSyncStamp = () => {
    const now = new Date();
    setLastSyncTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Monitoramento de Autenticação e Configuração de Realtime
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchInitialData(currentUser.id, currentUser.email || '');
        setupRealtimeSubscriptions(currentUser.id);
      } else {
        if (syncChannelRef.current) supabase.removeChannel(syncChannelRef.current);
        setUserProfile(null);
        setTransactions([]);
        setBudgets([]);
        setRoutines([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (syncChannelRef.current) supabase.removeChannel(syncChannelRef.current);
    };
  }, []);

  const setupRealtimeSubscriptions = (userId: string) => {
    if (syncChannelRef.current) supabase.removeChannel(syncChannelRef.current);

    syncChannelRef.current = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload) => {
        if (payload.new) setUserProfile(payload.new as UserProfile);
        updateSyncStamp();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, async () => {
        const { data } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
        if (data) setTransactions(data);
        updateSyncStamp();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routines', filter: `user_id=eq.${userId}` }, async () => {
        const { data } = await supabase.from('routines').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) setRoutines(data);
        updateSyncStamp();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` }, async () => {
        const { data } = await supabase.from('categories').select('*').or(`user_id.eq.${userId},user_id.is.null`);
        if (data) setCategories(data.length > 0 ? data : DEFAULT_CATEGORIES);
        updateSyncStamp();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` }, async () => {
        const { data } = await supabase.from('budgets').select('*').eq('user_id', userId);
        if (data) setBudgets(data);
        updateSyncStamp();
      })
      .subscribe();
  };

  const fetchInitialData = async (userId: string, email: string) => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      let currentProfile: UserProfile;
      if (profileData) {
        currentProfile = profileData;
      } else {
        currentProfile = { id: userId, email: email, full_name: email.split('@')[0], xp: 0, avatar_url: '', financial_goal: '', whatsapp_number: '' };
        await supabase.from('profiles').upsert(currentProfile);
      }
      setUserProfile(currentProfile);

      const [catRes, transRes, budRes, routRes] = await Promise.all([
        supabase.from('categories').select('*').or(`user_id.eq.${userId},user_id.is.null`),
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('routines').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (catRes.data) setCategories(catRes.data.length > 0 ? catRes.data : DEFAULT_CATEGORIES);
      if (transRes.data) setTransactions(transRes.data);
      if (budRes.data) setBudgets(budRes.data);
      if (routRes.data) setRoutines(routRes.data);

      updateSyncStamp();
    } catch (error) {
      showToast('Falha na sincronização inicial.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funções de salvamento (Mantidas com lógica de estado otimista + confirmação do banco)
  const handleUpdateProfile = async (name: string, photo: string, goal: string, whatsapp: string) => {
    if (!user) return;
    setIsSyncing(true);
    const profileToSave = { id: user.id, email: user.email, full_name: name, avatar_url: photo, financial_goal: goal, whatsapp_number: whatsapp, xp: userProfile?.xp || 0 };
    try {
      const { data, error } = await supabase.from('profiles').upsert(profileToSave, { onConflict: 'id' }).select().single();
      if (error) throw error;
      setUserProfile(data);
      showToast('Perfil sincronizado!');
    } catch (error) {
      showToast('Erro ao sincronizar perfil.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddRoutine = async (item: Omit<RoutineItem, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    const newItem = { ...item, id: crypto.randomUUID(), user_id: user.id, created_at: new Date().toISOString() };
    try {
      const { error } = await supabase.from('routines').insert(newItem);
      if (error) throw error;
      setRoutines(prev => [newItem as RoutineItem, ...prev]);
      showToast('Rotina salva!');
    } catch (error) {
      showToast('Falha ao salvar rotina.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleRoutine = async (id: string, completed: boolean) => {
    if (!user || !userProfile) return;
    setIsSyncing(true);
    const item = routines.find(r => r.id === id);
    if (!item) return;

    const xpGain = completed ? (item.type === 'WORKOUT' ? 100 : 50) : -(item.type === 'WORKOUT' ? 100 : 50);
    const newXP = Math.max(0, (userProfile.xp || 0) + xpGain);

    try {
      await Promise.all([
        supabase.from('routines').update({ completed }).eq('id', id).eq('user_id', user.id),
        supabase.from('profiles').update({ xp: newXP }).eq('id', user.id)
      ]);
      setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed } : r));
      setUserProfile(prev => prev ? { ...prev, xp: newXP } : null);
      showToast('Progresso atualizado!');
    } catch (error) {
      showToast('Erro na atualização.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await supabase.from('routines').delete().eq('id', id).eq('user_id', user.id);
      setRoutines(prev => prev.filter(r => r.id !== id));
      showToast('Rotina removida.', 'delete');
    } catch (error) {
      showToast('Erro ao excluir.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    const newT = { ...data, id: crypto.randomUUID(), user_id: user.id };
    try {
      const { error } = await supabase.from('transactions').insert(newT);
      if (error) throw error;
      setTransactions(prev => [newT as Transaction, ...prev]);
      setIsFormOpen(false);
      showToast('Registro financeiro salvo!');
    } catch (error) {
      showToast('Falha no registro.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!editingTransaction || !user) return;
    setIsSyncing(true);
    const updated = { ...data, id: editingTransaction.id, user_id: user.id };
    try {
      const { error } = await supabase.from('transactions').update(updated).eq('id', editingTransaction.id).eq('user_id', user.id);
      if (error) throw error;
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updated as Transaction : t));
      setEditingTransaction(undefined);
      setIsFormOpen(false);
      showToast('Registro atualizado!');
    } catch (error) {
      showToast('Erro ao atualizar.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleTransactionStatus = async (id: string, currentStatus: TransactionStatus) => {
    if (!user) return;
    const newStatus: TransactionStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setIsSyncing(true);
    try {
      await supabase.from('transactions').update({ status: newStatus }).eq('id', id).eq('user_id', user.id);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      showToast('Status financeiro alterado!');
    } catch (error) {
      showToast('Erro na alteração.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    if (window.confirm('Excluir este registro permanentemente?')) {
      setIsSyncing(true);
      try {
        await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
        setTransactions(prev => prev.filter(t => t.id !== id));
        showToast('Removido da nuvem!', 'delete');
      } catch (error) {
        showToast('Erro ao excluir.', 'error');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSaveCategory = async (catData: Omit<Category, 'id'> & { id?: string }) => {
    if (!user) return;
    setIsSyncing(true);
    const id = catData.id || crypto.randomUUID();
    const newCat = { ...catData, id, user_id: user.id };
    try {
      await supabase.from('categories').upsert(newCat, { onConflict: 'id' });
      setCategories(prev => catData.id ? prev.map(c => c.id === id ? newCat : c) : [...prev, newCat]);
      showToast('Categoria salva!');
    } catch (error) {
      showToast('Erro ao salvar categoria.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Categoria excluída.', 'delete');
    } catch (error) {
      showToast('Erro ao remover.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveBudget = async (budgetData: Omit<Budget, 'id' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    const existing = budgets.find(b => b.category_id === budgetData.category_id);
    const id = existing?.id || crypto.randomUUID();
    const newB = { ...budgetData, id, user_id: user.id };
    try {
      await supabase.from('budgets').upsert(newB, { onConflict: 'id' });
      setBudgets(prev => [...prev.filter(b => b.id !== id), newB as Budget]);
      showToast('Meta atualizada!');
    } catch (error) {
      showToast('Erro ao salvar meta.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      await supabase.auth.signOut();
      showToast('Sessão encerrada.', 'info');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-indigo-500 gap-6">
      <div className="relative">
        <Loader2 className="animate-spin" size={64} />
        <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse rounded-full" />
      </div>
      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-[0.3em] block mb-2">Conexão Segura</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando com Supabase Cloud...</span>
      </div>
    </div>
  );

  if (!user) return <Auth />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard transactions={transactions} categories={categories} setActiveTab={setActiveTab} userProfile={userProfile!} />;
      case 'routines': return <RoutineTracker routines={routines} userProfile={userProfile!} onAdd={handleAddRoutine} onToggle={handleToggleRoutine} onDelete={handleDeleteRoutine} />;
      case 'financial-calendar': return <FinancialCalendar transactions={transactions} categories={categories} onToggleStatus={handleToggleTransactionStatus} onQuickAdd={(date) => { setPrefilledDate(date); setIsAddMenuOpen(true); }} />;
      case 'income': return <TransactionList type="INCOME" transactions={transactions} categories={categories} onAdd={() => { setFormType('INCOME'); setPrefilledDate(undefined); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('INCOME'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} onToggleStatus={handleToggleTransactionStatus} />;
      case 'expenses': return <TransactionList type="EXPENSE" transactions={transactions} categories={categories} onAdd={() => { setFormType('EXPENSE'); setPrefilledDate(undefined); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('EXPENSE'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} onToggleStatus={handleToggleTransactionStatus} />;
      case 'planning': return <Planning categories={categories} budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} />;
      case 'categories': return <CategorySettings categories={categories} onSave={handleSaveCategory} onDelete={handleDeleteCategory} />;
      default: return null;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onAddClick={() => { setPrefilledDate(undefined); setIsAddMenuOpen(true); }} 
      userProfile={userProfile!} 
      onUpdateProfile={handleUpdateProfile} 
      onLogout={handleLogout}
      isSyncing={isSyncing}
      lastSyncTime={lastSyncTime}
    >
      {renderContent()}
      
      <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-80 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-8 duration-300 ${t.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : t.type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' : t.type === 'delete' ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-indigo-500/90 border-indigo-400 text-white'}`}>
            <div className="shrink-0">
              {t.type === 'success' && <CheckCircle2 size={20} />}
              {t.type === 'error' && <AlertCircle size={20} />}
              {t.type === 'delete' && <Trash2 size={20} />}
              {t.type === 'info' && <Info size={20} />}
            </div>
            <p className="text-sm font-bold">{t.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto p-1 opacity-70 hover:opacity-100 transition-opacity"><X size={14} /></button>
          </div>
        ))}
      </div>

      {isAddMenuOpen && (
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setIsAddMenuOpen(false)} />
            <div className="relative w-full max-sm bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
               <div className="flex justify-between items-center mb-8 px-2">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Novo Registro</h3>
                  <button onClick={() => setIsAddMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 transition-colors"><X size={20} /></button>
               </div>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <button onClick={() => { setFormType('INCOME'); setEditingTransaction(undefined); setIsFormOpen(true); setIsAddMenuOpen(false); }} className="flex flex-col items-center gap-4 p-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-3xl group transition-all hover:border-emerald-500">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowUpCircle size={32} /></div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Receita</span>
                  </button>
                  <button onClick={() => { setFormType('EXPENSE'); setEditingTransaction(undefined); setIsFormOpen(true); setIsAddMenuOpen(false); }} className="flex flex-col items-center gap-4 p-6 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-900/50 rounded-3xl group transition-all hover:border-rose-500">
                    <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowDownCircle size={32} /></div>
                    <span className="font-bold text-rose-700 dark:text-rose-400">Despesa</span>
                  </button>
               </div>
            </div>
         </div>
      )}
      
      {isFormOpen && <TransactionForm type={formType} categories={categories} onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} onClose={() => setIsFormOpen(false)} initialData={editingTransaction} prefilledDate={prefilledDate} />}
    </Layout>
  );
};

export default App;
