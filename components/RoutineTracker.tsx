
import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, CheckCircle2, Circle, 
  Plus, Trash2, Zap, Trophy, 
  ClipboardList, SearchX, 
  ArrowRight, Activity, Clock,
  Sparkles, Flame, Sunrise, Sun, Moon,
  Star, TrendingUp
} from 'lucide-react';
import { RoutineItem } from '../types';

interface RoutineTrackerProps {
  routines: RoutineItem[];
  onAdd: (item: Omit<RoutineItem, 'id' | 'created_at' | 'user_id'>) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const RoutineTracker: React.FC<RoutineTrackerProps> = ({ routines, onAdd, onToggle, onDelete }) => {
  const [activeSubTab, setActiveSubTab] = useState<'TASK' | 'WORKOUT'>('TASK');
  const [inputValue, setInputValue] = useState('');
  const [showXP, setShowXP] = useState<string | null>(null);

  const filteredItems = routines.filter(item => item.type === activeSubTab);
  const completedCount = filteredItems.filter(i => i.completed).length;
  const totalCount = filteredItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  // XP Calculation simulation
  const currentXP = routines.filter(r => r.completed).length * 50;
  const level = Math.floor(currentXP / 500) + 1;
  const xpInLevel = currentXP % 500;

  const handleToggle = (id: string, completed: boolean) => {
    if (completed) {
      setShowXP(id);
      setTimeout(() => setShowXP(null), 1000);
    }
    onToggle(id, completed);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onAdd({
      title: inputValue.trim(),
      completed: false,
      type: activeSubTab
    });
    setInputValue('');
  };

  // Grouping by "Period"
  const groupedItems = useMemo(() => {
    return {
      morning: filteredItems.filter((_, i) => i % 3 === 0),
      afternoon: filteredItems.filter((_, i) => i % 3 === 1),
      evening: filteredItems.filter((_, i) => i % 3 === 2),
    };
  }, [filteredItems]);

  const PeriodSection = ({ title, icon: Icon, items, color }: { title: string, icon: any, items: RoutineItem[], color: string }) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg ${color} bg-opacity-10 ${color.replace('bg-', 'text-')}`}>
            <Icon size={16} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
        </div>
        <div className="space-y-3">
          {items.map(item => (
            <div 
              key={item.id}
              className={`group relative flex items-center justify-between p-5 rounded-3xl border-2 transition-all duration-300 ${
                item.completed 
                  ? 'bg-emerald-500/5 border-transparent opacity-60 grayscale-[0.5]' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                 <button 
                   onClick={() => handleToggle(item.id, !item.completed)}
                   className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all transform active:scale-90 ${
                     item.completed 
                       ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                       : 'bg-slate-100 dark:bg-slate-800 text-transparent border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                   }`}
                 >
                   <CheckCircle2 size={22} className={item.completed ? 'opacity-100' : 'opacity-0'} />
                 </button>
                 <div className="flex flex-col">
                   <span className={`font-bold text-lg transition-all ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                     {item.title}
                   </span>
                   {!item.completed && (
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-indigo-500 uppercase">+50 XP</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Progresso</span>
                     </div>
                   )}
                 </div>
              </div>

              {/* XP Floating Pop */}
              {showXP === item.id && (
                <div className="absolute left-1/2 -top-4 -translate-x-1/2 animate-bounce pointer-events-none">
                   <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles size={10} /> +50 XP
                   </div>
                </div>
              )}

              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Gamified Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
           <Trophy size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
             <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-4 ring-white dark:ring-slate-800">
                <span className="text-3xl font-black">{level}</span>
                <div className="absolute -bottom-2 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
                   <span className="text-[10px] font-black text-indigo-500 uppercase">Nível</span>
                </div>
             </div>
             <div className="flex-1">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                  Minha Rotina Diária
                </h1>
                <div className="mt-3 w-full max-w-xs">
                   <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso do Nível</span>
                      <span className="text-[10px] font-black text-indigo-500">{xpInLevel}/500 XP</span>
                   </div>
                   <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(xpInLevel / 500) * 100}%` }}
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                <Flame className="text-orange-500 fill-orange-500 mb-1" size={20} />
                <span className="text-lg font-black text-orange-700 dark:text-orange-400 leading-none">5</span>
                <span className="text-[8px] font-black uppercase text-orange-600/60 mt-1">Duras</span>
             </div>
             <div className="flex flex-col items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <Star className="text-indigo-500 fill-indigo-500 mb-1" size={20} />
                <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none">{currentXP}</span>
                <span className="text-[8px] font-black uppercase text-indigo-600/60 mt-1">XP Total</span>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] w-full max-w-sm border border-slate-200 dark:border-slate-800">
         <button 
           onClick={() => setActiveSubTab('TASK')}
           className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'TASK' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl scale-[1.02]' : 'text-slate-500'}`}
         >
           <ClipboardList size={18} />
           Missões
         </button>
         <button 
           onClick={() => setActiveSubTab('WORKOUT')}
           className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'WORKOUT' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl scale-[1.02]' : 'text-slate-500'}`}
         >
           <Dumbbell size={18} />
           Treinos
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <form onSubmit={handleAddItem} className="relative group">
              <input 
                type="text"
                placeholder={activeSubTab === 'TASK' ? "Nova missão para hoje..." : "Qual o desafio físico de hoje?"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-8 pr-20 py-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-transparent focus:border-indigo-500 shadow-sm transition-all outline-none text-slate-800 dark:text-white font-black text-lg placeholder:text-slate-300"
              />
              <button 
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-transform"
              >
                <Plus size={28} />
              </button>
           </form>

           {/* Task Sections by Period */}
           <div className="space-y-2">
              {filteredItems.length > 0 ? (
                <>
                  <PeriodSection title="Manhã" icon={Sunrise} items={groupedItems.morning} color="bg-amber-500" />
                  <PeriodSection title="Tarde" icon={Sun} items={groupedItems.afternoon} color="bg-orange-500" />
                  <PeriodSection title="Noite" icon={Moon} items={groupedItems.evening} color="bg-indigo-500" />
                </>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 animate-pulse">
                      <SearchX size={48} />
                   </div>
                   <p className="text-2xl font-black text-slate-400">Sem missões ativas.</p>
                   <p className="font-bold text-slate-500 mt-2">O que vamos conquistar hoje?</p>
                </div>
              )}
           </div>
        </div>

        {/* Side Stats & Motivation */}
        <div className="space-y-6">
           {/* Progress Card */}
           <div className="bg-gradient-to-br from-indigo-600 to-violet-800 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                <TrendingUp size={140} />
              </div>
              <h3 className="font-black text-xs uppercase tracking-[0.2em] opacity-70 mb-6">Eficiência Diária</h3>
              
              <div className="flex items-center justify-center py-6">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                       <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                       <circle 
                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={364}
                        strokeDashoffset={364 - (364 * progressPercent) / 100}
                        strokeLinecap="round"
                        className="text-white transition-all duration-1000" 
                       />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                       <span className="text-3xl font-black">{Math.round(progressPercent)}%</span>
                       <span className="text-[8px] font-black uppercase opacity-60">Concluído</span>
                    </div>
                 </div>
              </div>

              <div className="mt-8 space-y-4">
                 <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase">Resolvido</span>
                    <span className="font-black">{completedCount}/{totalCount}</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase">Consistência</span>
                    <div className="flex gap-1">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className={`w-1.5 h-3 rounded-full ${i <= 5 ? 'bg-emerald-400' : 'bg-white/20'}`} />
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Motivation Card (Replaced AI tip with generic info) */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <Activity size={20} className="fill-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Meu Objetivo</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                Mantenha a consistência para subir de nível. Cada tarefa concluída fortalece seus hábitos e sua disciplina.
              </p>
              <div className="mt-6 flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                    <Clock size={14} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase">Foco no Dia</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineTracker;
