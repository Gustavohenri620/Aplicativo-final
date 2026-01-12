
import React, { useState, useEffect, useCallback } from 'react';
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

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchInitialData(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchInitialData(currentUser.id, currentUser.email || '');
      } else {
        setUserProfile(null);
        setTransactions([]);
        setBudgets([]);
        setRoutines([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchInitialData = async (userId: string, email: string) => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profileData) setUserProfile(profileData);
      else {
        const newProfile = { id: userId, email: email, full_name: email.split('@')[0] };
        await supabase.from('profiles').upsert(newProfile);
        setUserProfile(newProfile);
      }

      const { data: categoriesData } = await supabase.from('categories').select('*');
      if (categoriesData) setCategories(categoriesData);

      const { data: transactionsData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (transactionsData) setTransactions(transactionsData);

      const { data: budgetsData } = await supabase.from('budgets').select('*');
      if (budgetsData) setBudgets(budgetsData);

      const { data: routineData } = await supabase.from('routines').select('*').order('created_at', { ascending: true });
      if (routineData) setRoutines(routineData);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (name: string, photo: string, goal: string, whatsapp: string) => {
    if (!user) return;
    setIsSyncing(true);
    const updatedProfile = { id: user.id, email: user.email, full_name: name, avatar_url: photo, financial_goal: goal, whatsapp_number: whatsapp };
    setUserProfile(updatedProfile);
    const { error } = await supabase.from('profiles').upsert(updatedProfile);
    setIsSyncing(false);
    if (!error) showToast('Perfil salvo automaticamente!');
    else showToast('Erro ao sincronizar perfil', 'error');
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      await supabase.auth.signOut();
      showToast('Até breve!', 'info');
    }
  };

  // Routine Actions
  const handleAddRoutine = async (item: Omit<RoutineItem, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    const newItem = { ...item, id: crypto.randomUUID(), user_id: user.id, created_at: new Date().toISOString() };
    setRoutines(prev => [...prev, newItem as RoutineItem]);
    const { error } = await supabase.from('routines').insert(newItem);
    setIsSyncing(false);
    if (!error) showToast(`${item.type === 'TASK' ? 'Tarefa' : 'Treino'} salva automaticamente!`);
  };

  const handleToggleRoutine = async (id: string, completed: boolean) => {
    setIsSyncing(true);
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed } : r));
    const { error } = await supabase.from('routines').update({ completed }).eq('id', id);
    setIsSyncing(false);
    if (!error) showToast(completed ? 'Meta batida! Sincronizado. 🚀' : 'Atualizado automaticamente');
  };

  const handleDeleteRoutine = async (id: string) => {
    setIsSyncing(true);
    setRoutines(prev => prev.filter(r => r.id !== id));
    const { error } = await supabase.from('routines').delete().eq('id', id);
    setIsSyncing(false);
    if (!error) showToast('Removido e sincronizado.', 'delete');
  };

  // Finance Actions
  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    const newT = { ...data, id: crypto.randomUUID(), user_id: user.id, status: data.status || 'COMPLETED' };
    setTransactions(prev => [newT as Transaction, ...prev]);
    setIsFormOpen(false);
    const { error } = await supabase.from('transactions').insert(newT);
    setIsSyncing(false);
    if (!error) showToast('Atividade financeira salva!');
  };

  const handleUpdateTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!editingTransaction || !user) return;
    setIsSyncing(true);
    const updated = { ...data, id: editingTransaction.id, user_id: user.id };
    setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updated as Transaction : t));
    setEditingTransaction(undefined);
    setIsFormOpen(false);
    const { error } = await supabase.from('transactions').update(updated).eq('id', editingTransaction.id);
    setIsSyncing(false);
    if (!error) showToast('Lançamento atualizado e salvo!');
  };

  const handleToggleTransactionStatus = async (id: string, currentStatus: TransactionStatus) => {
    setIsSyncing(true);
    const newStatus: TransactionStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
    setIsSyncing(false);
    if (!error) showToast(newStatus === 'COMPLETED' ? 'Concluído e sincronizado! ✅' : 'Status atualizado ⏳');
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Excluir transação?')) {
      setIsSyncing(true);
      setTransactions(prev => prev.filter(t => t.id !== id));
      await supabase.from('transactions').delete().eq('id', id);
      setIsSyncing(false);
      showToast('Transação removida permanentemente.', 'delete');
    }
  };

  const handleSaveCategory = async (catData: Omit<Category, 'id'> & { id?: string }) => {
    if (!user) return;
    setIsSyncing(true);
    const id = catData.id || crypto.randomUUID();
    const newCat = { ...catData, id, user_id: user.id };
    setCategories(prev => catData.id ? prev.map(c => c.id === id ? newCat : c) : [...prev, newCat]);
    await supabase.from('categories').upsert(newCat);
    setIsSyncing(false);
    showToast('Categoria salva automaticamente!');
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Excluir categoria?')) {
      setIsSyncing(true);
      setCategories(p => p.filter(c => c.id !== id));
      await supabase.from('categories').delete().eq('id', id);
      setIsSyncing(false);
      showToast('Categoria removida e sincronizada.', 'delete');
    }
  };

  const handleSaveBudget = async (budgetData: Omit<Budget, 'id' | 'user_id'>) => {
    if (!user) return;
    setIsSyncing(true);
    const id = crypto.randomUUID();
    const newB = { ...budgetData, id, user_id: user.id };
    setBudgets(prev => [...prev.filter(b => b.category_id !== budgetData.category_id), newB as Budget]);
    await supabase.from('budgets').upsert(newB);
    setIsSyncing(false);
    showToast('Planejamento salvo e atualizado!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-500"><Loader2 className="animate-spin" size={48} /></div>;
  if (!user) return <Auth />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard transactions={transactions} categories={categories} setActiveTab={setActiveTab} userProfile={userProfile || { id: user.id, email: user.email }} />;
      case 'routines': return <RoutineTracker routines={routines} userProfile={userProfile || { id: user.id, email: user.email }} onAdd={handleAddRoutine} onToggle={handleToggleRoutine} onDelete={handleDeleteRoutine} />;
      case 'financial-calendar': return <FinancialCalendar transactions={transactions} categories={categories} onToggleStatus={handleToggleTransactionStatus} onQuickAdd={(date) => { setPrefilledDate(date); setIsAddMenuOpen(true); }} />;
      case 'income': return <TransactionList type="INCOME" transactions={transactions} categories={categories} onAdd={() => { setFormType('INCOME'); setPrefilledDate(undefined); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('INCOME'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} />;
      case 'expenses': return <TransactionList type="EXPENSE" transactions={transactions} categories={categories} onAdd={() => { setFormType('EXPENSE'); setPrefilledDate(undefined); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('EXPENSE'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} />;
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
      userProfile={userProfile || { id: user.id, email: user.email }} 
      onUpdateProfile={handleUpdateProfile} 
      onLogout={handleLogout}
      isSyncing={isSyncing}
    >
      {renderContent()}
      <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-80 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-8 duration-300 ${t.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : t.type === 'error' ? 'bg-rose-500/90 border-rose-400 text-white' : t.type === 'delete' ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-indigo-500/90 border-indigo-400 text-white'}`}>
            <div className="shrink-0">{t.type === 'success' && <CheckCircle2 size={20} />}{t.type === 'error' && <AlertCircle size={20} />}{t.type === 'delete' && <Trash2 size={20} />}{t.type === 'info' && <Info size={20} />}</div>
            <p className="text-sm font-bold">{t.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto p-1"><X size={14} /></button>
          </div>
        ))}
      </div>
      {isAddMenuOpen && (
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setIsAddMenuOpen(false)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white">Adicionar Novo</h3>
                    {prefilledDate && <p className="text-xs text-indigo-500 font-bold uppercase mt-1">Para o dia {new Date(prefilledDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>}
                  </div>
                  <button onClick={() => setIsAddMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><X size={20} /></button>
               </div>
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <button onClick={() => { setFormType('INCOME'); setEditingTransaction(undefined); setIsFormOpen(true); setIsAddMenuOpen(false); }} className="flex flex-col items-center gap-4 p-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-3xl group"><div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowUpCircle size={32} /></div><span className="font-bold text-emerald-700 dark:text-emerald-400">Receita</span></button>
                  <button onClick={() => { setFormType('EXPENSE'); setEditingTransaction(undefined); setIsFormOpen(true); setIsAddMenuOpen(false); }} className="flex flex-col items-center gap-4 p-6 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-900/50 rounded-3xl group"><div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowDownCircle size={32} /></div><span className="font-bold text-rose-700 dark:text-rose-400">Despesa</span></button>
               </div>
            </div>
         </div>
      )}
      {isFormOpen && <TransactionForm type={formType} categories={categories} onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction} onClose={() => setIsFormOpen(false)} initialData={editingTransaction} prefilledDate={prefilledDate} />}
    </Layout>
  );
};

export default App;
