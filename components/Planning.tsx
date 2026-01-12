
import React, { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, AlertCircle, Plus, Edit2, Check, X } from 'lucide-react';
import { Category, Budget, Transaction } from '../types';

interface PlanningProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  onSaveBudget: (budget: Omit<Budget, 'id' | 'user_id'>) => void;
}

const Planning: React.FC<PlanningProps> = ({ categories, budgets, transactions, onSaveBudget }) => {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'EXPENSE';
  });

  const handleEditBudget = (catId: string, currentAmount: number) => {
    setEditingCategoryId(catId);
    setEditValue(currentAmount.toString());
  };

  const handleSave = (catId: string) => {
    onSaveBudget({
      category_id: catId,
      amount: parseFloat(editValue) || 0,
      month: currentMonth,
      year: currentYear
    });
    setEditingCategoryId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Planejamento Mensal</h1>
        <p className="text-slate-500 dark:text-slate-400">Defina limites de gastos para cada categoria.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const budget = budgets.find(b => b.category_id === cat.id && b.month === currentMonth && b.year === currentYear);
          const spent = currentMonthExpenses
            .filter(t => t.category_id === cat.id)
            .reduce((acc, t) => acc + t.amount, 0);
          
          const budgetAmount = budget?.amount || 0;
          const percent = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
          const isOverBudget = budgetAmount > 0 && spent > budgetAmount;
          const isApproachingLimit = budgetAmount > 0 && percent >= 80 && !isOverBudget;

          return (
            <div 
              key={cat.id} 
              className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm transition-all duration-300 ${
                isOverBudget 
                  ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/10' 
                  : isApproachingLimit
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/10'
                  : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-slate-400">Orçamento Mensal</p>
                  </div>
                </div>
                {editingCategoryId === cat.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleSave(cat.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"><Check size={18} /></button>
                    <button onClick={() => setEditingCategoryId(null)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"><X size={18} /></button>
                  </div>
                ) : (
                  <button onClick={() => handleEditBudget(cat.id, budgetAmount)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Gasto</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">R$ {spent.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Meta</p>
                    {editingCategoryId === cat.id ? (
                      <input 
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 text-right px-2 py-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white outline-none"
                      />
                    ) : (
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">R$ {budgetAmount.toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={isOverBudget ? 'text-rose-500' : isApproachingLimit ? 'text-amber-600' : 'text-slate-500'}>Progresso</span>
                    <span className={isOverBudget ? 'text-rose-500' : isApproachingLimit ? 'text-amber-600' : 'text-slate-500'}>{Math.round(percent)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>

                {isOverBudget && (
                  <div className="flex items-center gap-2 p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs animate-in slide-in-from-top-1 duration-300">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Limite excedido em R$ {(spent - budgetAmount).toLocaleString('pt-BR')}</span>
                  </div>
                )}

                {isApproachingLimit && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-xl text-amber-700 dark:text-amber-400 text-xs animate-in slide-in-from-top-1 duration-300">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Atenção: Você já usou {Math.round(percent)}% do limite.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Planning;
