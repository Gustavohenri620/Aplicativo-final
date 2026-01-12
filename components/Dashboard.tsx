
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  AreaChart, Area 
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, 
  AlertCircle, ArrowRight, Clock, 
  ArrowDownLeft, Calendar, CreditCard, Tag,
  Target, User, Edit2
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

  // Category Distribution
  const categoryData = categories.map(cat => {
    const total = currentMonthTransactions
      .filter(t => t.category_id === cat.id && t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);
    return { name: cat.name, value: total, color: cat.color };
  }).filter(c => c.value > 0);

  // Daily Spending Trend (Last 7 days)
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayTotal = transactions
      .filter(t => t.type === 'EXPENSE' && t.date === dateStr)
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      total: dayTotal,
    };
  });

  // Detailed Recent Expenses (last 6)
  const recentExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

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
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={15} />
                <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">Categorias</h3>
          <div className="h-64 w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SEÇÃO DETALHADA DE DESPESAS COM GRÁFICO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-indigo-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Análise Detalhada de Gastos</h3>
          </div>
          <button onClick={() => setActiveTab('expenses')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Ver Histórico Completo</button>
        </div>

        {/* Gráfico de Tendência Diária da Semana */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Tendência de Gastos (Últimos 7 dias)</span>
            <span className="text-xs font-bold text-rose-500">Total da semana: R$ {last7DaysData.reduce((a,b)=>a+b.total, 0).toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
                   formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}`, 'Gasto']}
                />
                <Area type="monotone" dataKey="total" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Despesas Detalhadas (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((t) => {
              const category = categories.find(c => c.id === t.category_id);
              return (
                <div key={t.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Tag size={64} className="rotate-12 translate-x-4 -translate-y-4" />
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: category?.color || '#94a3b8' }}>
                        <ArrowDownLeft size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{t.description}</h4>
                        <span className="text-xs text-slate-400 font-medium">{category?.name || 'Outros'}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-bold ${t.expense_type === 'FIXED' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30'}`}>
                      {t.expense_type === 'FIXED' ? 'Fixo' : 'Variável'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(t.date).toLocaleDateString('pt-BR')}</div>
                      <div className="flex items-center gap-1.5"><CreditCard size={14}/> {t.payment_method}</div>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Valor</span>
                      <span className="text-lg font-black text-rose-600">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <p className="text-slate-400 font-medium">Nenhuma despesa recente para exibir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
