
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, ReferenceArea
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, 
  AlertCircle, ArrowRight, Clock, 
  Calendar, CreditCard,
  Target, User, Edit2, Activity,
  ArrowUpRight, ArrowDownRight,
  X, ChevronRight,
  MoreHorizontal,
  CalendarClock,
  ArrowRightCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Transaction, Category, UserProfile } from '../types';
import { ICON_MAP } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  setActiveTab: (tab: string) => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, categories, setActiveTab, userProfile, onOpenProfile }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const expenses = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const balance = income - expenses;
  const healthScore = Math.max(0, Math.min(100, (1 - expenses / (income || 1)) * 100));

  // Weekly Flow Data
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    
    return {
      name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
      fullDate: dateStr,
      displayDate: d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }),
      receitas: dayTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0),
      despesas: dayTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0),
    };
  });

  const weeklyTotalIncome = weeklyData.reduce((acc, d) => acc + d.receitas, 0);
  const weeklyTotalExpenses = weeklyData.reduce((acc, d) => acc + d.despesas, 0);

  // Upcoming Transactions
  const upcomingTransactions = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0,0,0,0);
      return tDate >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  const recentExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0,0,0,0);
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* MEGA HEADER: SALDO EM DESTAQUE */}
      <div className="relative overflow-hidden bg-indigo-600 rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-indigo-500/30 group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <Wallet size={300} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                <ShieldCheck size={28} />
              </div>
              <span className="text-white/70 text-sm font-black uppercase tracking-widest">Saldo Atual Disponível</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter mb-2">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="text-xs font-black text-white">+ R$ {income.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <TrendingDown size={16} className="text-rose-400" />
                <span className="text-xs font-black text-white">- R$ {expenses.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-4">
             <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl p-1 border border-white/30 shadow-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform" onClick={onOpenProfile}>
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <User size={48} className="text-white/50 w-full h-full p-4" />
                )}
             </div>
             <p className="text-white font-black text-center leading-tight">
               {userProfile?.full_name?.split(' ')[0] || 'Visitante'}<br/>
               <span className="text-white/50 text-[10px] uppercase tracking-widest">Editar Perfil</span>
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Saúde Financeira */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Activity size={24} />
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saúde Financeira</span>
           </div>
           <div className="space-y-4">
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{Math.round(healthScore)}%</h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${healthScore > 50 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {healthScore > 75 ? 'Excelente' : healthScore > 40 ? 'Estável' : 'Crítico'}
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 shadow-lg ${healthScore > 70 ? 'bg-indigo-500' : healthScore > 40 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${healthScore}%` }} 
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">Análise baseada na sua taxa de poupança atual.</p>
           </div>
        </div>

        {/* Foco Principal */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Target size={24} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta de Vida</span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-800 dark:text-white mb-1">
              {userProfile?.financial_goal || 'Defina sua meta financeira'}
            </p>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Mantenha o foco. Cada centavo economizado te aproxima deste objetivo.
            </p>
          </div>
          <button onClick={() => setActiveTab('planning')} className="mt-4 text-[10px] font-black text-indigo-600 flex items-center gap-1 uppercase hover:translate-x-1 transition-transform">
            Configurar Planejamento <ArrowRight size={14}/>
          </button>
        </div>

        {/* Fluxo Semanal Simples */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Movimentação Semanal</h3>
            <Zap className="text-indigo-500" size={18} />
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-4">
             <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">Recebido</span>
             </div>
             <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[9px] font-bold text-slate-400 uppercase">Pago</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRÓXIMOS LANÇAMENTOS */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                 <CalendarClock size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-800 dark:text-white">Agenda Financeira</h3>
                 <p className="text-xs text-slate-400 font-medium">Próximos compromissos registrados</p>
               </div>
             </div>
          </div>

          <div className="space-y-4">
            {upcomingTransactions.length > 0 ? (
              upcomingTransactions.map((t) => {
                const category = categories.find(c => c.id === t.category_id);
                const Icon = ICON_MAP[category?.icon || 'MoreHorizontal'] || MoreHorizontal;
                const isIncome = t.type === 'INCOME';
                
                return (
                  <div key={t.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-transparent hover:border-indigo-500/20 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col items-center justify-center min-w-[50px] py-2 px-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                         <span className="text-[9px] font-black text-indigo-500 uppercase">{formatDateLabel(t.date)}</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg" style={{ backgroundColor: category?.color || '#94a3b8' }}>
                         <Icon size={24} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 dark:text-white text-lg truncate leading-tight">{t.description}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{category?.name || 'Geral'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-black text-lg ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                       </p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">{t.payment_method}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center opacity-30">
                 <Calendar className="mb-4 text-slate-300" size={64} />
                 <p className="text-base font-black text-slate-500 uppercase">Tudo em ordem!</p>
              </div>
            )}
          </div>
        </div>

        {/* ÚLTIMAS ATIVIDADES */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">Atividades Recentes</h3>
            <button onClick={() => setActiveTab('expenses')} className="p-2 bg-slate-50 dark:bg-slate-800 text-indigo-500 rounded-xl">
              <ArrowRightCircle size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((t) => {
                const category = categories.find(c => c.id === t.category_id);
                return (
                  <div key={t.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color }} />
                       <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-white truncate text-sm">{t.description}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} • {category?.name}
                          </p>
                       </div>
                    </div>
                    <span className="font-black text-rose-500 text-sm">
                      - R$ {t.amount.toLocaleString('pt-BR')}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-10 text-slate-400 text-sm font-bold uppercase">Nenhum registro anterior.</p>
            )}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 border border-slate-100 dark:border-slate-800">
               <ShieldCheck size={24} />
             </div>
             <div className="text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tecnologia & Design</p>
               <p className="text-sm font-black text-slate-800 dark:text-white">Gustavo Henrique de Oliveira</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
