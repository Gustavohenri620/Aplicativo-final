
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
import { X, Loader2, CheckCircle2, Trash2, Info, AlertCircle, RefreshCcw } from 'lucide-react';
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
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (profileData) setUserProfile(profileData);

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
      showToast('Erro ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS FINANCEIROS ---
  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('transactions').insert({ ...data, user_id: user.id });
      if (error) throw error;
      showToast('Lançamento salvo!');
      setIsFormOpen(false);
    } catch (error: any) {
      showToast('Erro ao salvar transação.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!editingTransaction || !user) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('transactions').update(data).eq('id', editingTransaction.id);
      if (error) throw error;
      showToast('Transação atualizada!');
      setEditingTransaction(undefined);
      setIsFormOpen(false);
    } catch (error: any) {
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
      const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      showToast('Status atualizado!');
    } catch (error) {
      showToast('Erro ao mudar status.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user || !window.confirm('Excluir permanentemente?')) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      showToast('Registro excluído.', 'delete');
    } catch (error) {
      showToast('Erro ao excluir.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- HANDLERS DE CATEGORIAS ---
  const handleSaveCategory = async (data: Omit<Category, 'id'> & { id?: string }) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const payload = { ...data, user_id: user.id };
      const { error } = data.id 
        ? await supabase.from('categories').update(payload).eq('id', data.id)
        : await supabase.from('categories').insert(payload);
      
      if (error) throw error;
      showToast('Categoria salva!');
    } catch (error) {
      showToast('Erro ao salvar categoria.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user || !window.confirm('Excluir esta categoria?')) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      showToast('Categoria removida.');
    } catch (error) {
      showToast('Erro: Categoria em uso ou falha na rede.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- HANDLERS DE PLANEJAMENTO ---
  const handleSaveBudget = async (data: Omit<Budget, 'id' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('budgets').upsert({
        ...data,
        user_id: user.id
      }, { onConflict: 'user_id,category_id,month,year' });
      
      if (error) throw error;
      showToast('Meta de gastos atualizada!');
    } catch (error) {
      showToast('Erro ao salvar meta.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- HANDLERS DE ROTINA ---
  const handleAddRoutine = async (item: Omit<RoutineItem, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('routines').insert({ ...item, user_id: user.id });
      if (error) throw error;
      showToast('Meta adicionada!');
    } catch (error) {
      showToast('Erro ao salvar rotina.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleRoutine = async (id: string, completed: boolean) => {
    if (!user || !userProfile) return;
    setIsSyncing(true);
    try {
      const item = routines.find(r => r.id === id);
      const { error } = await supabase.from('routines').update({ completed }).eq('id', id);
      if (error) throw error;

      // Ganho de XP se completar
      if (completed && item) {
        const xpGain = item.type === 'WORKOUT' ? 100 : 50;
        await supabase.from('profiles').update({ xp: (userProfile.xp || 0) + xpGain }).eq('id', user.id);
      }
    } catch (error) {
      showToast('Erro ao atualizar progresso.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      showToast('Erro ao remover meta.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateProfile = async (name: string, photo: string, goal: string, whatsapp: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: name,
        avatar_url: photo,
        financial_goal: goal,
        whatsapp_number: whatsapp
      }).eq('id', user.id);
      if (error) throw error;
      showToast('Perfil sincronizado!');
    } catch (error) {
      showToast('Erro ao salvar perfil.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja sair?')) await supabase.auth.signOut();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-indigo-500 gap-6">
      <Loader2 className="animate-spin" size={64} />
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando Core...</span>
    </div>
  );

  if (!user) return <Auth />;

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onAddClick={() => { setPrefilledDate(undefined); setIsFormOpen(true); }} 
      userProfile={userProfile!} 
      onUpdateProfile={handleUpdateProfile} 
      onLogout={handleLogout}
      isSyncing={isSyncing}
      lastSyncTime={lastSyncTime}
    >
      {activeTab === 'dashboard' && <Dashboard transactions={transactions} categories={categories} setActiveTab={setActiveTab} userProfile={userProfile!} />}
      {activeTab === 'routines' && <RoutineTracker routines={routines} userProfile={userProfile!} onAdd={handleAddRoutine} onToggle={handleToggleRoutine} onDelete={handleDeleteRoutine} />}
      {activeTab === 'income' && <TransactionList type="INCOME" transactions={transactions} categories={categories} onAdd={() => { setFormType('INCOME'); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('INCOME'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} onToggleStatus={handleToggleTransactionStatus} />}
      {activeTab === 'expenses' && <TransactionList type="EXPENSE" transactions={transactions} categories={categories} onAdd={() => { setFormType('EXPENSE'); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('EXPENSE'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} onToggleStatus={handleToggleTransactionStatus} />}
      {activeTab === 'planning' && <Planning categories={categories} budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} />}
      {activeTab === 'categories' && <CategorySettings categories={categories} onSave={handleSaveCategory} onDelete={handleDeleteCategory} />}
      {activeTab === 'financial-calendar' && <FinancialCalendar transactions={transactions} categories={categories} onToggleStatus={handleToggleTransactionStatus} onQuickAdd={(d) => { setPrefilledDate(d); setIsFormOpen(true); }} />}

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

      {isFormOpen && <TransactionForm type={formType} categories={categories} onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} onClose={() => { setIsFormOpen(false); setEditingTransaction(undefined); }} initialData={editingTransaction} prefilledDate={prefilledDate} />}
    </Layout>
  );
};

export default App;
