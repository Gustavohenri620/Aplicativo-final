
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
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
  CheckCircle2
} from 'lucide-react';
import { Transaction, Category, UserProfile } from '../types';
import { ICON_MAP } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  setActiveTab: (tab: string) => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onUpdateTransaction?: (transaction: Omit<Transaction, 'id' | 'user_id'>, id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  categories, 
  setActiveTab, 
  userProfile, 
  onOpenProfile,
  onUpdateTransaction 
}) => {
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
  const commitmentRatio = income > 0 ? (expenses / income) * 100 : (expenses > 0 ? 100 : 0);
  const healthScore = Math.max(0, Math.min(100, (1 - expenses / (income || 1)) * 100));

  // Weekly Flow Data (Last 7 days)
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    
    return {
      name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
      fullDate: dateStr,
      displayDate: d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }),
      receitas: dayTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0),
      despesas: dayTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0),
    };
  });

  const weeklyTotalIncome = weeklyData.reduce((acc, d) => acc + d.receitas, 0);
  const weeklyTotalExpenses = weeklyData.reduce((acc, d) => acc + d.despesas, 0);
  const weeklyBalance = weeklyTotalIncome - weeklyTotalExpenses;

  // Upcoming Transactions (Today and future)
  const upcomingTransactions = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0,0,0,0);
      return tDate >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  // Transactions for the selected day in weekly chart
  const dayDetailTransactions = selectedDay 
    ? transactions.filter(t => t.date === selectedDay).sort((a, b) => b.amount - a.amount)
    : [];

  const selectedDayInfo = weeklyData.find(d => d.fullDate === selectedDay);

  // Detailed Recent Expenses (Past)
  const recentExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const commitmentPieData = [
    { name: 'Gastos', value: expenses },
    { name: 'Sobra', value: Math.max(0, income - expenses) }
  ];

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0,0,0,0);
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const handleMarkAsPaid = (t: Transaction) => {
    if (!onUpdateTransaction) return;
    const today = new Date().toISOString().split('T')[0];
    const { id, user_id, ...dataWithoutId } = t;
    onUpdateTransaction({
      ...dataWithoutId,
      date: today
    }, t.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Profile */}
      <div 
        onClick={onOpenProfile}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group relative"
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 size={18} className="text-slate-400" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-slate-50 dark:border-slate-700 shadow-sm shrink-0 group-hover:border-indigo-100 dark:group-hover:border-slate-600 transition-colors">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-slate-300 w-full h-full p-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                Olá, {userProfile?.full_name?.split(' ')[0] || 'Visitante'}! 👋
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm group-hover:text-indigo-500 transition-colors">
              Toque para editar seu perfil
            </p>
          </div>
        </div>

        {userProfile?.financial_goal && (
          <div className="w-full md:w-auto bg-indigo-50 dark:bg-indigo-900/20 px-5 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
               <Target size={20} />
             </div>
             <div>
               <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Foco Principal</p>
               <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{userProfile.financial_goal}</p>
             </div>
          </div>
        )}
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><Wallet size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Mensal</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-800 dark:text-white">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-slate-400">Saúde Financeira</span>
                <span className={healthScore > 50 ? 'text-emerald-500' : 'text-amber-500'}>{Math.round(healthScore)}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${healthScore > 70 ? 'bg-indigo-500' : healthScore > 40 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${healthScore}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><TrendingUp size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ganhos Total</span>
          </div>
          <div className="flex items-end justify-between gap-2 mt-2">
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-white">R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
                <ArrowUpRight size={12} /> Entrada de capital
              </p>
            </div>
            <div className="flex gap-1 items-end pb-1">
              {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                <div key={i} className="w-1 bg-emerald-500/20 rounded-full" style={{ height: `${h * 24}px` }}>
                  <div className="w-full bg-emerald-500 rounded-full" style={{ height: `${h * 100}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl"><TrendingDown size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gasto Total</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex-1">
              <p className="text-2xl font-black text-slate-800 dark:text-white">R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-tighter">
                {commitmentRatio.toFixed(1)}% da receita gasta
              </p>
            </div>
            <div className="w-12 h-12 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commitmentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={15}
                    outerRadius={22}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#f43f5e" />
                    <Cell fill={commitmentRatio >= 100 ? "#f43f5e20" : "#10b98120"} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><AlertCircle size={20} /></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análise do Mês</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">
              {healthScore > 75 ? 'Excelente performance! 🚀' : healthScore > 40 ? 'Gestão equilibrada ⚖️' : 'Atenção aos gastos! ⚠️'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Status baseado na relação receitas/despesas.</p>
          </div>
          <button onClick={() => setActiveTab('planning')} className="mt-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-widest hover:translate-x-1 transition-transform">
            Planejamento <ArrowRight size={12}/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRÓXIMOS LANÇAMENTOS */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                 <CalendarClock size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">Próximos Lançamentos</h3>
                 <p className="text-xs text-slate-400 font-medium">Contas e recebimentos agendados</p>
               </div>
             </div>
             <button onClick={() => setActiveTab('income')} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
               <ArrowRightCircle size={20} />
             </button>
          </div>

          <div className="space-y-3">
            {upcomingTransactions.length > 0 ? (
              upcomingTransactions.map((t) => {
                const category = categories.find(c => c.id === t.category_id);
                const Icon = ICON_MAP[category?.icon || 'MoreHorizontal'] || MoreHorizontal;
                const isIncome = t.type === 'INCOME';
                
                return (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center min-w-[45px] py-1 px-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                         <span className="text-[10px] font-black text-indigo-500 uppercase">{formatDateLabel(t.date)}</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: category?.color || '#94a3b8' }}>
                         <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{t.description}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{category?.name || 'Geral'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                         <p className={`font-black text-sm ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                         </p>
                         <p className="text-[10px] text-slate-400 font-medium">{t.payment_method}</p>
                      </div>
                      
                      {/* Botão de Marcar como Pago (Apenas para Despesas) */}
                      {!isIncome && (
                        <button 
                          onClick={() => handleMarkAsPaid(t)}
                          className="p-2 text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Marcar como pago"
                        >
                          <CheckCircle2 size={24} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                 <Calendar className="mb-4 text-slate-300" size={48} />
                 <p className="text-sm font-bold text-slate-500">Tudo em dia! <br/> Nenhum lançamento futuro encontrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* FLUXO SEMANAL */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Fluxo Semanal</h3>
            <Activity className="text-indigo-500" size={18} />
          </div>
          
          <div className="mb-6">
             <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Toque nas barras para detalhes</p>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                   <ArrowUpRight size={14} className="text-emerald-500" />
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200">R$ {weeklyTotalIncome.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <ArrowDownRight size={14} className="text-rose-500" />
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200">R$ {weeklyTotalExpenses.toLocaleString('pt-BR')}</span>
                </div>
             </div>
          </div>

          <div className="flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={weeklyData} 
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                onClick={(data) => {
                  if (data && data.activePayload) {
                    const date = data.activePayload[0].payload.fullDate;
                    setSelectedDay(selectedDay === date ? null : date);
                  }
                }}
              >
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)', cursor: 'pointer' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', backgroundColor: '#1e293b' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}
                />
                <Bar dataKey="receitas" fill="#10b981" radius={[2, 2, 0, 0]} barSize={6}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-income-${index}`} 
                      fill={entry.fullDate === selectedDay ? '#34d399' : '#10b981'} 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
                <Bar dataKey="despesas" fill="#f43f5e" radius={[2, 2, 0, 0]} barSize={6}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-expense-${index}`} 
                      fill={entry.fullDate === selectedDay ? '#fb7185' : '#f43f5e'} 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-around">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Entradas</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Saídas</span>
             </div>
          </div>
        </div>
      </div>

      {/* DETALHAMENTO DIÁRIO */}
      {selectedDay && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
           <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-indigo-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Activity size={120} />
              </div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg capitalize">{selectedDayInfo?.displayDate}</h3>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Transações do Dia</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 relative z-10">
                {dayDetailTransactions.length > 0 ? (
                  dayDetailTransactions.map((t) => {
                    const category = categories.find(c => c.id === t.category_id);
                    const Icon = ICON_MAP[category?.icon || 'MoreHorizontal'] || MoreHorizontal;
                    return (
                      <div key={t.id} className="flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{t.description}</p>
                            <div className="flex items-center gap-2 text-[10px] text-white/60 font-bold uppercase tracking-tight">
                              <span>{category?.name || 'Outros'}</span>
                              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                              <span>{t.payment_method}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black ${t.type === 'INCOME' ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <p className="text-sm font-medium opacity-60">Sem registros para esta data.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {/* ÚLTIMAS DESPESAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-indigo-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Últimas Atividades</h3>
          </div>
          <button onClick={() => setActiveTab('expenses')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Ver Histórico</button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((t) => {
                    const category = categories.find(c => c.id === t.category_id);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{t.description}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color || '#94a3b8' }} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{category?.name || 'Geral'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Nenhuma atividade recente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
