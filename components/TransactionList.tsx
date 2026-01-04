
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar,
  SearchX,
  CreditCard,
  Tag,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw
} from 'lucide-react';
import { Transaction, Category, TransactionType } from '../types';
import { PAYMENT_METHODS } from '../constants';

interface TransactionListProps {
  type: TransactionType;
  transactions: Transaction[];
  categories: Category[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const TransactionList: React.FC<TransactionListProps> = ({ type, transactions, categories, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Logic
  const filteredTransactions = transactions
    .filter(t => t.type === type)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(t => selectedCategory === 'all' || t.category_id === selectedCategory)
    .filter(t => selectedPayment === 'all' || t.payment_method === selectedPayment)
    .filter(t => {
      if (!dateStart) return true;
      return t.date >= dateStart;
    })
    .filter(t => {
      if (!dateEnd) return true;
      return t.date <= dateEnd;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  
  const activeFiltersCount = [
    selectedCategory !== 'all', 
    selectedPayment !== 'all', 
    dateStart !== '', 
    dateEnd !== ''
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPayment('all');
    setDateStart('');
    setDateEnd('');
    setSearchTerm('');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {type === 'INCOME' ? 'Minhas Receitas' : 'Minhas Despesas'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Total acumulado: <span className={type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        
        <button 
          onClick={onAdd}
          className={`hidden lg:flex items-center gap-2 px-5 py-3 ${type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'} text-white rounded-2xl shadow-lg transition-all font-semibold`}
        >
          <Plus size={20} />
          {type === 'INCOME' ? 'Nova Receita' : 'Nova Despesa'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Main Search & Toggle Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all outline-none font-medium placeholder:text-slate-400"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold transition-all shrink-0 ${showFilters || activeFiltersCount > 0 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="animate-in slide-in-from-top-2 duration-200 pt-2 pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* Date Start */}
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl">
                   <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">De</label>
                   <div className="flex items-center gap-2 px-2">
                     <Calendar size={16} className="text-slate-400 shrink-0"/>
                     <input 
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="bg-transparent border-none w-full text-sm font-semibold text-slate-700 dark:text-white focus:ring-0 p-0"
                     />
                   </div>
                </div>

                {/* Date End */}
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl">
                   <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Até</label>
                   <div className="flex items-center gap-2 px-2">
                     <Calendar size={16} className="text-slate-400 shrink-0"/>
                     <input 
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="bg-transparent border-none w-full text-sm font-semibold text-slate-700 dark:text-white focus:ring-0 p-0"
                     />
                   </div>
                </div>

                {/* Category Filter */}
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl">
                   <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Categoria</label>
                   <div className="flex items-center gap-2 px-2">
                     <Filter size={16} className="text-slate-400 shrink-0"/>
                     <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent border-none w-full text-sm font-semibold text-slate-700 dark:text-white focus:ring-0 p-0 appearance-none"
                     >
                       <option value="all">Todas</option>
                       {categories.map(cat => (
                         <option key={cat.id} value={cat.id}>{cat.name}</option>
                       ))}
                     </select>
                   </div>
                </div>

                {/* Payment Method */}
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl">
                   <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Pagamento</label>
                   <div className="flex items-center gap-2 px-2">
                     <CreditCard size={16} className="text-slate-400 shrink-0"/>
                     <select
                      value={selectedPayment}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="bg-transparent border-none w-full text-sm font-semibold text-slate-700 dark:text-white focus:ring-0 p-0 appearance-none"
                     >
                       <option value="all">Todos</option>
                       {PAYMENT_METHODS.map(method => (
                         <option key={method} value={method}>{method}</option>
                       ))}
                     </select>
                   </div>
                </div>

              </div>
              
              {/* Sort and Clear Row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                    <ArrowUpDown size={14} className="text-slate-400"/>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 p-0 appearance-none cursor-pointer"
                    >
                      <option value="date-desc">Mais Recentes</option>
                      <option value="date-asc">Mais Antigas</option>
                      <option value="amount-desc">Maior Valor</option>
                      <option value="amount-asc">Menor Valor</option>
                    </select>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <RotateCcw size={12} />
                    Limpar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lista de Transações */}
        <div className="p-2 sm:p-4">
          {filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map((t) => {
                const category = categories.find(c => c.id === t.category_id);
                return (
                  <div 
                    key={t.id} 
                    className="group bg-white dark:bg-slate-900 sm:bg-slate-50 sm:dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 sm:border-transparent dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all hover:shadow-md flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      {/* Ícone da Categoria/Tipo */}
                      <div 
                        className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-sm`}
                        style={{ backgroundColor: category?.color || '#94a3b8' }}
                      >
                         {category?.name.charAt(0)}
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-white truncate text-base mb-0.5">{t.description}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                           <span className="flex items-center gap-1"><Tag size={12}/> {category?.name}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                           <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(t.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
                           <span className="hidden sm:inline-flex items-center gap-1 ml-2"><CreditCard size={12}/> {t.payment_method}</span>
                           {t.recurring && (
                             <>
                               <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                               <span className="text-indigo-500">Recorrente</span>
                             </>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-lg font-black tracking-tight ${type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      
                      <div className="flex items-center gap-1 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => onEdit(t)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                         >
                            <Edit2 size={16} />
                         </button>
                         <button 
                            onClick={() => onDelete(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300">
                <SearchX size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Nada por aqui</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
                {activeFiltersCount > 0 
                  ? "Nenhuma transação encontrada com os filtros selecionados."
                  : "Não encontramos nenhuma transação."}
              </p>
              {activeFiltersCount > 0 ? (
                <button onClick={clearFilters} className="text-indigo-600 font-semibold hover:underline">
                   Limpar Filtros
                </button>
              ) : (
                <button onClick={onAdd} className="text-indigo-600 font-semibold hover:underline">
                   Adicionar nova {type === 'INCOME' ? 'Receita' : 'Despesa'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
