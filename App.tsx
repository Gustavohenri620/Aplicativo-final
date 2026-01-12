
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Planning from './components/Planning';
import CategorySettings from './components/CategorySettings';
import { Transaction, Category, Budget, TransactionType, UserProfile } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { ArrowUpCircle, ArrowDownCircle, X, Loader2 } from 'lucide-react';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // States
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    id: 'user-1', email: '', full_name: 'Visitante', avatar_url: '', financial_goal: '' 
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>('EXPENSE');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  // Force Dark Mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const userId = 'user-1'; // Usando ID fixo conforme estrutura anterior

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) setUserProfile(profileData);

      // 2. Fetch Categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');
      
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        // Se não houver categorias, podemos inserir as default se necessário
        // Por agora mantemos o estado default
      }

      // 3. Fetch Transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (transactionsData) setTransactions(transactionsData);

      // 4. Fetch Budgets
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*');
      
      if (budgetsData) setBudgets(budgetsData);

    } catch (error) {
      console.error('Erro ao carregar dados do Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  // Profile Handler
  const handleUpdateProfile = async (name: string, photo: string, goal: string) => {
    const updatedProfile = {
      ...userProfile,
      full_name: name || 'Visitante',
      avatar_url: photo,
      financial_goal: goal
    };

    setUserProfile(updatedProfile);

    try {
      await supabase
        .from('profiles')
        .upsert(updatedProfile);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  // Transaction Handlers
  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      user_id: 'user-1',
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setIsFormOpen(false);

    try {
      await supabase.from('transactions').insert(newTransaction);
    } catch (error) {
      console.error('Erro ao inserir transação:', error);
    }
  };

  const handleUpdateTransaction = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!editingTransaction) return;
    
    const updated = { ...data, id: editingTransaction.id, user_id: editingTransaction.user_id };

    setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updated : t));
    setEditingTransaction(undefined);
    setIsFormOpen(false);

    try {
      await supabase.from('transactions').update(updated).eq('id', editingTransaction.id);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      try {
        await supabase.from('transactions').delete().eq('id', id);
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
      }
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setIsFormOpen(true);
  };

  const handleOpenAdd = (type: TransactionType) => {
    setFormType(type);
    setEditingTransaction(undefined);
    setIsFormOpen(true);
    setIsAddMenuOpen(false);
  };

  // Category Handlers
  const handleSaveCategory = async (categoryData: Omit<Category, 'id'> & { id?: string }) => {
    const id = categoryData.id || crypto.randomUUID();
    const newCategory = { ...categoryData, id };

    setCategories(prev => {
      if (categoryData.id) {
        return prev.map(c => c.id === categoryData.id ? newCategory : c);
      }
      return [...prev, newCategory];
    });

    try {
      await supabase.from('categories').upsert(newCategory);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Tem certeza? Isso pode afetar transações existentes.')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (error) {
        console.error('Erro ao deletar categoria:', error);
      }
    }
  };

  const handleSaveBudget = async (budgetData: Omit<Budget, 'id' | 'user_id'>) => {
    const existingIndex = budgets.findIndex(b => 
      b.category_id === budgetData.category_id && 
      b.month === budgetData.month && 
      b.year === budgetData.year
    );

    const id = existingIndex >= 0 ? budgets[existingIndex].id : crypto.randomUUID();
    const newBudget: Budget = {
      ...budgetData,
      id,
      user_id: 'user-1'
    };

    setBudgets(prev => {
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = newBudget;
        return next;
      }
      return [...prev, newBudget];
    });

    try {
      await supabase.from('budgets').upsert(newBudget);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-medium">Sincronizando seus dados...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions} 
            categories={categories}
            setActiveTab={setActiveTab}
            userProfile={userProfile}
          />
        );
      case 'income':
        return (
          <TransactionList 
            type="INCOME"
            transactions={transactions}
            categories={categories}
            onAdd={() => handleOpenAdd('INCOME')}
            onEdit={handleEditClick}
            onDelete={handleDeleteTransaction}
          />
        );
      case 'expenses':
        return (
          <TransactionList 
            type="EXPENSE"
            transactions={transactions}
            categories={categories}
            onAdd={() => handleOpenAdd('EXPENSE')}
            onEdit={handleEditClick}
            onDelete={handleDeleteTransaction}
          />
        );
      case 'planning':
        return (
          <Planning 
            categories={categories}
            budgets={budgets}
            transactions={transactions}
            onSaveBudget={handleSaveBudget}
          />
        );
      case 'categories':
        return (
          <CategorySettings
            categories={categories}
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
            <p>Seção em desenvolvimento: {activeTab}</p>
          </div>
        );
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onAddClick={() => setIsAddMenuOpen(true)}
      userProfile={userProfile}
      onUpdateProfile={handleUpdateProfile}
    >
      {renderContent()}

      {/* Action Sheet / Menu de Adição Rápida */}
      {isAddMenuOpen && (
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setIsAddMenuOpen(false)} />
            
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-safe">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white">O que deseja adicionar?</h3>
                 <button onClick={() => setIsAddMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                    <X size={20} />
                 </button>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mb-4">
                  <button 
                    onClick={() => handleOpenAdd('INCOME')}
                    className="flex flex-col items-center gap-4 p-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-3xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
                  >
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-2xl flex items-center justify-center mb-1">
                      <ArrowUpCircle size={32} />
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Receita</span>
                  </button>

                  <button 
                    onClick={() => handleOpenAdd('EXPENSE')}
                    className="flex flex-col items-center gap-4 p-6 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-900/50 rounded-3xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95"
                  >
                    <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/50 text-rose-600 rounded-2xl flex items-center justify-center mb-1">
                      <ArrowDownCircle size={32} />
                    </div>
                    <span className="font-bold text-rose-700 dark:text-rose-400">Despesa</span>
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Transaction Form Modal */}
      {isFormOpen && (
        <TransactionForm
          type={formType}
          categories={categories}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
          onClose={() => setIsFormOpen(false)}
          initialData={editingTransaction}
        />
      )}

    </Layout>
  );
};

export default App;
