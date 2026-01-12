
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, 
  AlertCircle, ArrowRight, Clock, 
  Calendar, CreditCard, Tag,
  Target, User, Edit2, Activity
} from 'lucide-react';
import { Transaction, Category, UserProfile } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  setActiveTab: (tab: string) => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, categories, setActiveTab, userProfile, onOpenProfile }) => {
  const now = new Date();
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
      name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      receitas: dayTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0),
      despesas: dayTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0),
    };
  });

  // Detailed Recent Expenses (last 8 for the table)
  const recentExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const last6MonthsData = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const m = date.getMonth();
    const y = date.getFullYear();
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      receitas: monthTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0),
      despesas: monthTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0),
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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

        {userProfile?.financial_goal ? (
          <div className="w-full md:w-auto bg-indigo-50 dark:bg-indigo-900/20 px-5 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
               <Target size={20} />
             </div>
             <div>
               <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Foco Principal</p>
               <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{userProfile.financial_goal}</p>
             </div>
          </div>
        ) : (
          <div className="hidden md:block">
            <p className="text-xs text-slate-400 italic">Defina um objetivo no seu perfil.</p>
          </div>
        )}
      </div>

      {/* Cards de Resumo Superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Wallet size={20} /></div>
            <span className="text-xs font-medium text-slate-400 uppercase">Saldo Mensal</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${healthScore > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${healthScore}%` }} />
            </div>
            <span className="text-xs text-slate-400">{Math.round(healthScore)}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-xs font-medium text-slate-400 uppercase">Receitas</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-emerald-500 mt-1">Ganhos do mês</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg"><TrendingDown size={20} /></div>
            <span className="text-xs font-medium text-slate-400 uppercase">Despesas</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-rose-500 mt-1">{commitmentRatio.toFixed(1)}% comprometido</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><AlertCircle size={20} /></div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</span>
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {healthScore > 70 ? '💰 Ótima Saúde' : healthScore > 40 ? '⚖️ Equilibrado' : '⚠️ Alerta de Gastos'}
          </p>
          <button onClick={() => setActiveTab('planning')} className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">Ver Planejamento <ArrowRight size={12}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Comparativo Semestral</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6MonthsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#0f172a' }} 
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={15} />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO DE GASTOS SEMANAIS (SUBSTITUIU CATEGORIAS) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Gastos Semanais</h3>
            <Activity className="text-indigo-500" size={18} />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#0f172a' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="receitas" fill="#10b981" radius={[3, 3, 0, 0]} barSize={8} />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider">
             <div className="flex items-center gap-1.5 text-emerald-500">
               <div className="w-2 h-2 rounded-full bg-emerald-500" /> Entradas
             </div>
             <div className="flex items-center gap-1.5 text-rose-500">
               <div className="w-2 h-2 rounded-full bg-rose-500" /> Saídas
             </div>
          </div>
        </div>
      </div>

      {/* TABELA DE DESPESAS RECENTES ORGANIZADA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-indigo-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Últimas Despesas</h3>
          </div>
          <button onClick={() => setActiveTab('expenses')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Ver Histórico Completo</button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Pagamento</th>
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
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(t.date).getFullYear()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{t.description}</span>
                            <span className="text-[10px] text-slate-400 font-medium md:hidden">{t.payment_method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color || '#94a3b8' }} />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              {category?.name || 'Outros'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <CreditCard size={14} />
                            <span className="text-xs font-medium">{t.payment_method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-base font-black text-rose-600 dark:text-rose-400">
                            R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Calendar size={32} strokeWidth={1.5} />
                        <p className="font-medium">Nenhuma despesa recente registrada.</p>
                      </div>
                    </td>
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
