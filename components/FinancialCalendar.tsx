
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  CreditCard,
  Tag,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Transaction, Category, TransactionStatus } from '../types';
import { ICON_MAP } from '../constants';

interface FinancialCalendarProps {
  transactions: Transaction[];
  categories: Category[];
  onToggleStatus: (id: string, currentStatus: TransactionStatus) => void;
  onQuickAdd?: (date: string) => void;
}

const FinancialCalendar: React.FC<FinancialCalendarProps> = ({ transactions, categories, onToggleStatus, onQuickAdd }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, currentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }
    return days;
  }, [currentDate]);

  const getTransactionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return transactions.filter(t => t.date === dateStr);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  const selectedDayTransactions = selectedDay ? getTransactionsForDate(selectedDay) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Agenda de Pagamentos</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Controle seu fluxo de caixa e marque o que já foi liquidado.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
           <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-xl transition-all">
             <ChevronLeft size={20} />
           </button>
           <div className="px-4 text-sm font-black text-slate-700 dark:text-white capitalize min-w-[140px] text-center">
             {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
           </div>
           <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-xl transition-all">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Calendário Principal */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-3">
            {calendarDays.map((dateObj, idx) => {
              const dayTrans = getTransactionsForDate(dateObj.date);
              const income = dayTrans.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
              const expenses = dayTrans.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
              const isToday = dateObj.date.toDateString() === new Date().toDateString();
              const isSelected = selectedDay?.toDateString() === dateObj.date.toDateString();
              const hasPending = dayTrans.some(t => t.status === 'PENDING');

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedDay(dateObj.date)}
                  className={`min-h-[70px] sm:min-h-[100px] p-2 flex flex-col border transition-all cursor-pointer group rounded-2xl relative ${
                    !dateObj.currentMonth ? 'opacity-20 pointer-events-none border-transparent' : 
                    isSelected ? 'bg-indigo-600/10 border-indigo-500 shadow-md ring-1 ring-indigo-500/20' :
                    isToday ? 'bg-slate-50 dark:bg-slate-800/80 border-indigo-200 dark:border-indigo-900/50' :
                    'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-black ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                      {dateObj.day}
                    </span>
                    {dateObj.currentMonth && hasPending && (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pendências" />
                    )}
                  </div>

                  {dateObj.currentMonth && dayTrans.length > 0 && (
                    <div className="flex-1 flex flex-col justify-end gap-1 mt-1">
                       {income > 0 && (
                         <div className="h-1.5 sm:h-2 w-full bg-emerald-500/20 rounded-full relative overflow-hidden">
                           <div className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full w-full" />
                         </div>
                       )}
                       {expenses > 0 && (
                         <div className="h-1.5 sm:h-2 w-full bg-rose-500/20 rounded-full relative overflow-hidden">
                           <div className="absolute inset-y-0 left-0 bg-rose-500 rounded-full w-full" />
                         </div>
                       )}
                    </div>
                  )}
                  
                  {isToday && (
                    <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhes do Dia */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                     <CalendarIcon size={20} />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                       {selectedDay ? selectedDay.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : 'Selecione'}
                     </h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fluxo de Caixa</p>
                   </div>
                 </div>
                 {selectedDay && (
                   <button 
                    onClick={() => onQuickAdd?.(selectedDay.toISOString().split('T')[0])}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg active:scale-95"
                    title="Novo Lançamento"
                   >
                     <Plus size={18} />
                   </button>
                 )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[500px]">
                {selectedDayTransactions.length > 0 ? (
                  selectedDayTransactions.map(t => {
                    const category = categories.find(c => c.id === t.category_id);
                    const Icon = ICON_MAP[category?.icon || 'MoreHorizontal'] || MoreHorizontal;
                    const isIncome = t.type === 'INCOME';
                    const isCompleted = t.status === 'COMPLETED';

                    return (
                      <div key={t.id} className={`p-4 rounded-2xl border transition-all group relative ${isCompleted ? 'bg-slate-50 dark:bg-slate-800/20 border-transparent opacity-80' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-500/30'}`}>
                         <div className="flex items-start justify-between gap-3 mb-2">
                           <div className="flex items-center gap-3 min-w-0">
                             <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: category?.color || '#94a3b8' }}>
                               <Icon size={16} />
                             </div>
                             <div className="min-w-0">
                               <p className={`text-xs font-black uppercase tracking-tighter truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                 {t.description}
                               </p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase">{category?.name || 'Outros'}</p>
                             </div>
                           </div>

                           <button 
                             onClick={() => onToggleStatus(t.id, t.status)}
                             className={`shrink-0 p-1.5 rounded-lg transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500'}`}
                             title={isCompleted ? "Marcar como pendente" : "Marcar como concluído"}
                           >
                             {isCompleted ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                           </button>
                         </div>
                         
                         <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                               <CreditCard size={10} />
                               <span>{t.payment_method}</span>
                            </div>
                            <span className={`text-sm font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                               {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                            </span>
                         </div>
                         
                         {isCompleted && (
                           <div className="absolute -top-1 -right-1 bg-emerald-500 w-2 h-2 rounded-full shadow-lg" />
                         )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center opacity-30">
                    <Clock size={48} className="text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-500 italic">
                      {selectedDay ? "Nenhum lançamento." : "Toque em um dia."}
                    </p>
                  </div>
                )}
              </div>

              {selectedDayTransactions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                     <span>Balanço Previsto</span>
                     <span className={`${
                       selectedDayTransactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0) >= 0 
                       ? 'text-emerald-500' : 'text-rose-500'
                     }`}>
                       R$ {selectedDayTransactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0).toLocaleString('pt-BR')}
                     </span>
                   </div>
                </div>
              )}
           </div>

           <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-900/20 text-white relative overflow-hidden group">
              <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform">
                <ArrowUpCircle size={120} />
              </div>
              <div className="flex items-center gap-2 mb-2 text-white/70">
                 <CheckCircle2 size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Salvamento Automático</span>
              </div>
              <h4 className="text-lg font-black mb-3">Tudo sincronizado!</h4>
              <p className="text-xs font-medium opacity-80 leading-relaxed">
                Ao clicar no ícone de status, sua atividade financeira é salva automaticamente no servidor.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalendar;
