
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
    }, 4000);
  }, []);

  // Monitoramento de Autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchInitialData(currentUser.id, currentUser.email || '');
        setupRealtimeSubscriptions(currentUser.id);
      } else {
        if (syncChannelRef.current) supabase.removeChannel(syncChannelRef.current);
        resetState();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (syncChannelRef.current) supabase.removeChannel(syncChannelRef.current);
    };
  }, []);

  const resetState = () => {
    setUserProfile(null);
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets([]);
    setRoutines([]);
    setLoading(false);
  };

  const setupRealtimeSubscriptions = (userId: string) => {
    if (syncChannelRef.current) supabase.removeChannel(syncChannelRef.current);

    syncChannelRef.current = supabase.channel(`db-sync-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, (payload) => {
        if (payload.new) setUserProfile(prev => ({ ...prev, ...payload.new }));
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        const { data } = await supabase.from('categories').select('*').or(`user_id.eq.${userId},user_id.is.null`);
        if (data && data.length > 0) setCategories(data);
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
      // Perfil
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      
      if (!profileData && !profileError) {
        // Se o trigger falhou ou atrasou, criamos manualmente para garantir continuidade
        const newProfile = { id: userId, email: email, full_name: email.split('@')[0], xp: 0 };
        const { data: upserted } = await supabase.from('profiles').upsert(newProfile).select().single();
        if (upserted) setUserProfile(upserted);
      } else if (profileData) {
        setUserProfile(profileData);
      }

      // Dados em massa
      const [catRes, transRes, budRes, routRes] = await Promise.all([
        supabase.from('categories').select('*').or(`user_id.eq.${userId},user_id.is.null`),
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('routines').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (catRes.data && catRes.data.length > 0) setCategories(catRes.data);
      if (transRes.data) setTransactions(transRes.data);
      if (budRes.data) setBudgets(budRes.data);
      if (routRes.data) setRoutines(routRes.data);

      updateSyncStamp();
    } catch (error) {
      showToast('Erro ao carregar dados da nuvem.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funções de manipulação com feedback visual
  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    const newId = crypto.randomUUID();
    const newT = { ...data, id: newId, user_id: user.id };
    
    // Optimistic Update
    setTransactions(prev => [newT as Transaction, ...prev]);
    setIsFormOpen(false);

    try {
      const { error } = await supabase.from('transactions').insert(newT);
      if (error) throw error;
      showToast('Transação salva!');
    } catch (error: any) {
      setTransactions(prev => prev.filter(t => t.id !== newId));
      showToast(`Erro ao salvar: ${error.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!editingTransaction || !user) return;
    setIsSyncing(true);
    const updated = { ...data, id: editingTransaction.id, user_id: user.id };
    
    setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updated as Transaction : t));
    setEditingTransaction(undefined);
    setIsFormOpen(false);

    try {
      const { error } = await supabase.from('transactions').update(updated).eq('id', editingTransaction.id);
      if (error) throw error;
      showToast('Transação atualizada!');
    } catch (error: any) {
      showToast('Erro na atualização.', 'error');
      // Re-fetch para garantir integridade
      fetchInitialData(user.id, user.email);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleTransactionStatus = async (id: string, currentStatus: TransactionStatus) => {
    if (!user) return;
    const newStatus: TransactionStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setIsSyncing(true);
    
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      showToast('Status sincronizado!');
    } catch (error) {
      showToast('Erro ao alterar status.', 'error');
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: currentStatus } : t));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    if (window.confirm('Excluir este registro da nuvem permanentemente?')) {
      setIsSyncing(true);
      const original = transactions.find(t => t.id === id);
      setTransactions(prev => prev.filter(t => t.id !== id));

      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        showToast('Registro excluído.', 'delete');
      } catch (error) {
        if (original) setTransactions(prev => [original, ...prev]);
        showToast('Erro ao excluir registro.', 'error');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleUpdateProfile = async (name: string, photo: string, goal: string, whatsapp: string) => {
    if (!user) return;
    setIsSyncing(true);
    const xp = userProfile?.xp || 0;
    const profileToSave = { id: user.id, email: user.email, full_name: name, avatar_url: photo, financial_goal: goal, whatsapp_number: whatsapp, xp: xp };
    
    try {
      const { data, error } = await supabase.from('profiles').upsert(profileToSave).select().single();
      if (error) throw error;
      setUserProfile(data);
      showToast('Perfil sincronizado com a nuvem!');
    } catch (error) {
      showToast('Falha na sincronização do perfil.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja encerrar a sessão?')) {
      await supabase.auth.signOut();
      showToast('Sessão encerrada.', 'info');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-indigo-500 gap-6">
      <div className="relative">
        <Loader2 className="animate-spin" size={64} />
        <div className="absolute inset-0 blur-3xl bg-indigo-500/10 animate-pulse rounded-full" />
      </div>
      <div className="text-center">
        <span className="text-xs font-black uppercase tracking-[0.4em] block mb-2 text-indigo-400">Security Gateway</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Estabelecendo túnel seguro...</span>
      </div>
    </div>
  );

  if (!user) return <Auth />;

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
      {activeTab === 'dashboard' && <Dashboard transactions={transactions} categories={categories} setActiveTab={setActiveTab} userProfile={userProfile!} />}
      {activeTab === 'routines' && <RoutineTracker routines={routines} userProfile={userProfile!} onAdd={(i) => {}} onToggle={(id, c) => {}} onDelete={(id) => {}} />}
      {activeTab === 'income' && <TransactionList type="INCOME" transactions={transactions} categories={categories} onAdd={() => { setFormType('INCOME'); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('INCOME'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} onToggleStatus={handleToggleTransactionStatus} />}
      {activeTab === 'expenses' && <TransactionList type="EXPENSE" transactions={transactions} categories={categories} onAdd={() => { setFormType('EXPENSE'); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('EXPENSE'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} onToggleStatus={handleToggleTransactionStatus} />}
      {activeTab === 'planning' && <Planning categories={categories} budgets={budgets} transactions={transactions} onSaveBudget={(b) => {}} />}
      {activeTab === 'categories' && <CategorySettings categories={categories} onSave={(c) => {}} onDelete={(id) => {}} />}
      {activeTab === 'financial-calendar' && <FinancialCalendar transactions={transactions} categories={categories} onToggleStatus={handleToggleTransactionStatus} />}

      <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-80 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 p-4 rounded-3xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-8 duration-300 ${t.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : t.type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' : t.type === 'delete' ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-indigo-500/90 border-indigo-400 text-white'}`}>
            <div className="shrink-0">
              {t.type === 'success' && <CheckCircle2 size={20} />}
              {t.type === 'error' && <AlertCircle size={20} />}
              {t.type === 'delete' && <Trash2 size={20} />}
              {t.type === 'info' && <Info size={20} />}
            </div>
            <p className="text-sm font-bold tracking-tight">{t.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto p-1.5 opacity-60 hover:opacity-100 transition-opacity"><X size={14} /></button>
          </div>
        ))}
      </div>

      {isFormOpen && <TransactionForm type={formType} categories={categories} onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} onClose={() => setIsFormOpen(false)} initialData={editingTransaction} prefilledDate={prefilledDate} />}
    </Layout>
  );
};

export default App;
