
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Planning from './components/Planning';
import CategorySettings from './components/CategorySettings';
import RoutineTracker from './components/RoutineTracker';
import { Transaction, Category, Budget, TransactionType, UserProfile, RoutineItem, TransactionStatus } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { X, CheckCircle2, Trash2, Info, AlertCircle, Github } from 'lucide-react';
import { githubService, GitHubSyncData } from './services/githubService';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'delete';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('github_pat') || '');
  
  // Estado Inicial carregado do LocalStorage
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { id: 'local-user', email: 'user@local', full_name: 'Usuário Local', xp: 0 };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    const saved = localStorage.getItem('routines');
    return saved ? JSON.parse(saved) : [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>();

  // Persistência Automática no LocalStorage
  useEffect(() => localStorage.setItem('userProfile', JSON.stringify(userProfile)), [userProfile]);
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('budgets', JSON.stringify(budgets)), [budgets]);
  useEffect(() => localStorage.setItem('routines', JSON.stringify(routines)), [routines]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const handleGitHubSync = async (mode: 'PUSH' | 'PULL', tokenOverride?: string) => {
    const token = tokenOverride || githubToken;
    if (!token) {
      showToast('GitHub Token não configurado.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const gist = await githubService.getGist(token);
      const currentData: GitHubSyncData = { userProfile, transactions, categories, budgets, routines };

      if (mode === 'PUSH') {
        if (gist) {
          await githubService.updateGist(token, gist.id, currentData);
        } else {
          await githubService.createGist(token, currentData);
        }
        showToast('Dados sincronizados com GitHub!');
      } else {
        if (!gist) {
          showToast('Nenhum backup encontrado no GitHub.', 'error');
          return;
        }
        const downloaded = await githubService.downloadData(token, gist.id);
        if (downloaded) {
          setUserProfile(downloaded.userProfile);
          setTransactions(downloaded.transactions);
          setCategories(downloaded.categories);
          setBudgets(downloaded.budgets);
          setRoutines(downloaded.routines);
          showToast('Backup restaurado do GitHub!');
        }
      }
    } catch (error) {
      showToast('Erro na sincronização com GitHub.', 'error');
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveGitHubToken = (token: string) => {
    setGithubToken(token);
    localStorage.setItem('github_pat', token);
    showToast('Token GitHub salvo!');
  };

  // Handlers Locais (Mantendo como solicitado)
  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'user_id'>) => {
    const newTransaction: Transaction = { ...data, id: crypto.randomUUID(), user_id: userProfile.id };
    setTransactions(prev => [newTransaction, ...prev]);
    showToast('Lançamento salvo!');
    setIsFormOpen(false);
  };

  const handleUpdateTransaction = (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!editingTransaction) return;
    setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...data, id: t.id, user_id: t.user_id } : t));
    showToast('Registro atualizado!');
    setEditingTransaction(undefined);
    setIsFormOpen(false);
  };

  const handleToggleTransactionStatus = (id: string, currentStatus: TransactionStatus) => {
    const newStatus: TransactionStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleDeleteTransaction = (id: string) => {
    if (!window.confirm('Excluir permanentemente?')) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Registro excluído.', 'delete');
  };

  const handleSaveCategory = (data: Omit<Category, 'id'> & { id?: string }) => {
    if (data.id) {
      setCategories(prev => prev.map(c => c.id === data.id ? { ...data, id: c.id } as Category : c));
    } else {
      setCategories(prev => [...prev, { ...data, id: crypto.randomUUID() } as Category]);
    }
    showToast('Categoria salva!');
  };

  const handleDeleteCategory = (id: string) => {
    if (!window.confirm('Excluir esta categoria?')) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Categoria removida.');
  };

  const handleSaveBudget = (data: Omit<Budget, 'id' | 'user_id'>) => {
    const existingIndex = budgets.findIndex(b => b.category_id === data.category_id && b.month === data.month && b.year === data.year);
    if (existingIndex > -1) {
      const newBudgets = [...budgets];
      newBudgets[existingIndex] = { ...data, id: budgets[existingIndex].id, user_id: userProfile.id };
      setBudgets(newBudgets);
    } else {
      setBudgets(prev => [...prev, { ...data, id: crypto.randomUUID(), user_id: userProfile.id }]);
    }
    showToast('Meta atualizada!');
  };

  const handleAddRoutine = (item: Omit<RoutineItem, 'id' | 'created_at' | 'user_id'>) => {
    const newItem: RoutineItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString(), user_id: userProfile.id };
    setRoutines(prev => [newItem, ...prev]);
    showToast('Meta adicionada!');
  };

  const handleToggleRoutine = (id: string, completed: boolean) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed } : r));
    if (completed) {
      const item = routines.find(r => r.id === id);
      if (item) {
        const xpGain = item.type === 'WORKOUT' ? 100 : 50;
        setUserProfile(prev => ({ ...prev, xp: (prev.xp || 0) + xpGain }));
      }
    }
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    showToast('Meta removida.');
  };

  const handleUpdateProfile = async (name: string, photo: string, goal: string, whatsapp: string) => {
    setUserProfile(prev => ({ ...prev, full_name: name, avatar_url: photo, financial_goal: goal, whatsapp_number: whatsapp }));
    showToast('Perfil salvo!');
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onAddClick={() => { setPrefilledDate(undefined); setIsFormOpen(true); }} 
      userProfile={userProfile} 
      onUpdateProfile={handleUpdateProfile} 
      onLogout={() => { localStorage.clear(); window.location.reload(); }}
      isSyncing={isSyncing}
      githubToken={githubToken}
      onSaveGithubToken={handleSaveGitHubToken}
      onSyncGitHub={() => handleGitHubSync('PUSH')}
      onRestoreGitHub={() => handleGitHubSync('PULL')}
    >
      {activeTab === 'dashboard' && <Dashboard transactions={transactions} categories={categories} setActiveTab={setActiveTab} userProfile={userProfile} />}
      {activeTab === 'routines' && <RoutineTracker routines={routines} userProfile={userProfile} onAdd={handleAddRoutine} onToggle={handleToggleRoutine} onDelete={handleDeleteRoutine} />}
      {activeTab === 'income' && <TransactionList type="INCOME" transactions={transactions} categories={categories} onAdd={() => { setFormType('INCOME'); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('INCOME'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} onToggleStatus={handleToggleTransactionStatus} />}
      {activeTab === 'expenses' && <TransactionList type="EXPENSE" transactions={transactions} categories={categories} onAdd={() => { setFormType('EXPENSE'); setIsFormOpen(true); }} onEdit={(t) => { setEditingTransaction(t); setFormType('EXPENSE'); setIsFormOpen(true); }} onDelete={handleDeleteTransaction} onToggleStatus={handleToggleTransactionStatus} />}
      {activeTab === 'planning' && <Planning categories={categories} budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} />}
      {activeTab === 'categories' && <CategorySettings categories={categories} onSave={handleSaveCategory} onDelete={handleDeleteCategory} />}

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
