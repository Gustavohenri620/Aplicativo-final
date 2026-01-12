
import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Check, CreditCard, MoreHorizontal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Transaction, Category, TransactionType, ExpenseType, IncomeType, TransactionStatus } from '../types';
import { PAYMENT_METHODS, ICON_MAP } from '../constants';

interface TransactionFormProps {
  type: TransactionType;
  categories: Category[];
  onSubmit: (transaction: Omit<Transaction, 'id' | 'user_id'>) => void;
  onClose: () => void;
  initialData?: Transaction;
  prefilledDate?: string;
  isSyncing?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  type, 
  categories, 
  onSubmit, 
  onClose, 
  initialData, 
  prefilledDate,
  isSyncing = false 
}) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [date, setDate] = useState(initialData?.date || prefilledDate || new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState(initialData?.category_id || (categories.length > 0 ? categories[0].id : ''));
  const [expenseType, setExpenseType] = useState<ExpenseType>(initialData?.expense_type || 'VARIABLE');
  const [incomeType, setIncomeType] = useState<IncomeType>(initialData?.income_type || 'SALARY');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.payment_method || PAYMENT_METHODS[0]);
  const [recurring, setRecurring] = useState(initialData?.recurring || false);
  const [status, setStatus] = useState<TransactionStatus>(initialData?.status || 'COMPLETED');

  useEffect(() => {
    if (prefilledDate && !initialData) {
      setDate(prefilledDate);
    }
  }, [prefilledDate, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId || isSyncing) return;

    onSubmit({
      description,
      amount: parseFloat(amount),
      date,
      category_id: categoryId,
      type,
      expense_type: type === 'EXPENSE' ? expenseType : undefined,
      income_type: type === 'INCOME' ? incomeType : undefined,
      payment_method: paymentMethod,
      recurring,
      status,
    });
  };

  const themeColor = type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600';
  const bgColor = type === 'INCOME' ? 'bg-emerald-600' : 'bg-rose-600';
  const lightBg = type === 'INCOME' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20';
  const borderColor = type === 'INCOME' ? 'border-emerald-100 dark:border-emerald-900/50' : 'border-rose-100 dark:border-rose-900/50';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {initialData ? 'Editar' : 'Nova'} {type === 'INCOME' ? 'Receita' : 'Despesa'}
          </h2>
          <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-6 space-y-6">
            
            {/* Amount Input */}
            <div className="space-y-2 text-center">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor da Transação</label>
               <div className="relative inline-block">
                 <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold ${themeColor} opacity-50`}>R$</span>
                 <input
                    autoFocus
                    required
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className={`w-full text-center text-5xl font-black bg-transparent border-none focus:ring-0 ${themeColor} placeholder:opacity-30 outline-none px-8 py-2`}
                  />
               </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <input
                required
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição (ex: Supermercado)"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-lg font-medium text-slate-800 dark:text-white transition-all outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Main Options Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                 <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Data</label>
                 <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-2 py-2 bg-white dark:bg-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
               </div>

               <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                 <label className="block text-xs font-bold text-slate-400 mb-2 ml-1">Pagamento</label>
                 <div className="relative">
                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 bg-white dark:bg-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-white border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                 </div>
               </div>
            </div>

            {/* Status Selector */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
              <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Status da Atividade</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setStatus('COMPLETED')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${status === 'COMPLETED' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                >
                  <CheckCircle2 size={16} /> Finalizado
                </button>
                <button 
                  type="button"
                  onClick={() => setStatus('PENDING')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${status === 'PENDING' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}
                >
                  <AlertCircle size={16} /> Pendente
                </button>
              </div>
            </div>

            {/* Category Grid Selection */}
            <div>
               <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                 <Tag size={16} /> Categoria
               </label>
               <div className="grid grid-cols-4 gap-3 max-h-40 overflow-y-auto no-scrollbar pr-1">
                 {categories.map((cat) => {
                   const Icon = ICON_MAP[cat.icon] || MoreHorizontal;
                   const isSelected = categoryId === cat.id;
                   return (
                     <button
                       key={cat.id}
                       type="button"
                       onClick={() => setCategoryId(cat.id)}
                       className={`group flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${isSelected ? `${borderColor} ${lightBg} scale-105 shadow-sm` : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                     >
                        <div 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} 
                          style={{ backgroundColor: cat.color }}
                        >
                          <Icon size={20} />
                        </div>
                        <span className={`text-[10px] font-bold truncate w-full text-center ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>
                          {cat.name}
                        </span>
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Type Toggle & Recurring */}
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                  {type === 'EXPENSE' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpenseType('FIXED')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${expenseType === 'FIXED' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                      >
                        Fixo
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpenseType('VARIABLE')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${expenseType === 'VARIABLE' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                      >
                        Variável
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIncomeType('SALARY')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${incomeType === 'SALARY' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                      >
                        Salário
                      </button>
                      <button
                        type="button"
                        onClick={() => setIncomeType('EXTRA')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${incomeType === 'EXTRA' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                      >
                        Extra
                      </button>
                    </>
                  )}
              </div>
              
              <button
                type="button"
                onClick={() => setRecurring(!recurring)}
                className={`flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-bold transition-all border-2 ${recurring ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${recurring ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400 bg-white'}`}>
                  {recurring && <Check size={10} className="text-white" />}
                </div>
                Mensal
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 pt-2 pb-8 sm:pb-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
             <button
              disabled={isSyncing}
              type="submit"
              className={`w-full py-4 text-white text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${bgColor} ${type === 'INCOME' ? 'shadow-emerald-200 dark:shadow-none' : 'shadow-rose-200 dark:shadow-none'} ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Salvando em Nuvem...
                </>
              ) : (
                <>{initialData ? 'Atualizar Transação' : 'Confirmar Lançamento'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
