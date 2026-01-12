import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, CheckCircle2, 
  Plus, Trash2, Zap, Trophy, 
  ClipboardList, SearchX, 
  Sparkles, Sunrise, Sun, Moon,
  TrendingUp, Utensils,
  ChevronRight, ListPlus, Info,
  GlassWater, Book, X, 
  Activity,
  Apple, Brain,
  Layers,
  ZapIcon,
  Wind,
  ShieldCheck,
  Flame,
  Medal,
  Target,
  ArrowRight
} from 'lucide-react';
import { RoutineItem } from '../types';

interface Exercise {
  name: string;
  reps: string;
}

interface WorkoutTemplate {
  title: string;
  category: string;
  desc: string;
  exercises: Exercise[];
}

const WORKOUT_LIBRARY: WorkoutTemplate[] = [
  { 
    title: "Peito & Tríceps (Hipertrofia)", 
    category: "Força",
    desc: "Foco em volume muscular e força de empurrar.",
    exercises: [{ name: "Supino Reto Barra", reps: "4x10" }, { name: "Crucifixo Inclinado", reps: "3x12" }, { name: "Tríceps Testa", reps: "4x12" }]
  },
  { 
    title: "Costas & Bíceps (Puxada)", 
    category: "Força",
    desc: "Desenvolvimento de largura e densidade dorsal.",
    exercises: [{ name: "Puxada Aberta", reps: "4x12" }, { name: "Remada Curvada", reps: "4x10" }, { name: "Rosca Direta", reps: "3x10" }]
  },
  { 
    title: "Pernas (Base Forte)", 
    category: "Força",
    desc: "Treino pesado para base e explosão.",
    exercises: [{ name: "Agachamento Livre", reps: "4x8" }, { name: "Leg Press 45", reps: "3x15" }, { name: "Panturrilha em Pé", reps: "4x20" }]
  },
  { 
    title: "Ombros (3D Shoulders)", 
    category: "Foco",
    desc: "Foco em todas as cabeças do deltoide.",
    exercises: [{ name: "Desenvolvimento Halteres", reps: "4x10" }, { name: "Elevação Lateral", reps: "4x15" }]
  },
  { 
    title: "Abdominal & Core (Six Pack)", 
    category: "Foco",
    desc: "Fortalecimento central e definição.",
    exercises: [{ name: "Prancha Isométrica", reps: "3x60s" }, { name: "Crunch Abdominal", reps: "3x20" }]
  },
  { 
    title: "HIIT Queima Máxima", 
    category: "Cardio",
    desc: "Cardio de alta intensidade para secar.",
    exercises: [{ name: "Burpees", reps: "3x15" }, { name: "Polichinelos", reps: "3x45s" }]
  },
  { 
    title: "Yoga Flow Iniciante", 
    category: "Mobilidade",
    desc: "Flexibilidade e paz mental.",
    exercises: [{ name: "Saudação ao Sol", reps: "5 ciclos" }, { name: "Postura Guerreiro", reps: "3x1min" }]
  }
];

const SUGGESTIONS: Record<'TASK' | 'WORKOUT', Array<{ title: string; icon: any; color: string }>> = {
  TASK: [
    { title: "Meta de Água (3L)", icon: GlassWater, color: "text-blue-500" },
    { title: "Leitura (30 min)", icon: Book, color: "text-indigo-500" },
    { title: "Alimentação Saudável", icon: Utensils, color: "text-emerald-500" },
    { title: "Comer uma Fruta", icon: Apple, color: "text-rose-500" },
    { title: "Meditar 5 min", icon: Brain, color: "text-purple-500" },
  ],
  WORKOUT: [
    { title: "Musculação", icon: Dumbbell, color: "text-slate-700" },
    { title: "Caminhada 30min", icon: TrendingUp, color: "text-emerald-500" },
    { title: "Alongamento", icon: Zap, color: "text-amber-500" },
    { title: "Yoga", icon: Sunrise, color: "text-indigo-500" },
  ]
};

const CATEGORY_ICONS: Record<string, any> = {
  "Força": { icon: Layers, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  "Foco": { icon: ZapIcon, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  "Cardio": { icon: Wind, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  "Mobilidade": { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
};

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
  const [selectedWorkoutPreview, setSelectedWorkoutPreview] = useState<WorkoutTemplate | null>(null);

  const filteredItems = routines.filter(item => item.type === activeSubTab);
  const completedItems = filteredItems.filter(item => item.completed);
  const totalItems = filteredItems.length;
  const dailyProgress = totalItems > 0 ? (completedItems.length / totalItems) * 100 : 0;

  const currentXP = routines.filter(r => r.completed).length * 50;
  const level = Math.floor(currentXP / 500) + 1;
  const xpInLevel = currentXP % 500;

  // Mock streak (normally calculated from history)
  const streak = 7;

  const motivationMessage = useMemo(() => {
    if (totalItems === 0) return "Adicione sua primeira meta hoje!";
    if (dailyProgress === 0) return "O primeiro passo é o mais importante. Vamos começar?";
    if (dailyProgress < 50) return "Ótimo começo! Você está no ritmo certo.";
    if (dailyProgress < 100) return "Quase lá! Só mais algumas missões para o 100%.";
    return "Incrível! Você dominou o seu dia!";
  }, [dailyProgress, totalItems]);

  const handleToggle = (id: string, completed: boolean) => {
    if (completed) {
      setShowXP(id);
      setTimeout(() => setShowXP(null), 1000);
    }
    onToggle(id, completed);
  };

  const handleAddItem = (titleOverride?: string) => {
    const title = titleOverride || inputValue.trim();
    if (!title) return;
    onAdd({ title, completed: false, type: activeSubTab });
    if (!titleOverride) setInputValue('');
  };

  const groupedItems = useMemo(() => {
    return {
      morning: filteredItems.filter((_, i) => i % 3 === 0),
      afternoon: filteredItems.filter((_, i) => i % 3 === 1),
      evening: filteredItems.filter((_, i) => i % 3 === 2),
    };
  }, [filteredItems]);

  const groupedLibrary = useMemo(() => {
    const groups: Record<string, WorkoutTemplate[]> = {};
    WORKOUT_LIBRARY.forEach(w => {
      if (!groups[w.category]) groups[w.category] = [];
      groups[w.category].push(w);
    });
    return groups;
  }, []);

  const PeriodSection = ({ title, icon: Icon, items, color }: { title: string, icon: any, items: RoutineItem[], color: string }) => {
    if (items.length === 0) return null;
    const sectionCompleted = items.filter(i => i.completed).length;
    const isFull = sectionCompleted === items.length;

    return (
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${color} bg-opacity-20 ${color.replace('bg-', 'text-')}`}>
              <Icon size={16} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${isFull ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            {sectionCompleted}/{items.length} Concluído
          </div>
        </div>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-[2rem] border-2 transition-all duration-300 ${item.completed ? 'bg-emerald-500/5 border-transparent opacity-60 grayscale-[0.5]' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 shadow-sm'}`}>
              <div className="flex items-center gap-4 flex-1">
                 <button onClick={() => handleToggle(item.id, !item.completed)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform active:scale-90 shrink-0 ${item.completed ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-transparent'}`}>
                   <CheckCircle2 size={24} className={item.completed ? 'opacity-100' : 'opacity-0'} />
                 </button>
                 <div className="flex flex-col min-w-0">
                   <span className={`font-bold text-base sm:text-lg truncate transition-all ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{item.title}</span>
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">+50 XP</span>
                 </div>
              </div>
              {showXP === item.id && (
                <div className="absolute left-1/2 -top-4 -translate-x-1/2 animate-bounce pointer-events-none z-20">
                   <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1"><Sparkles size={10} /> +50 XP</div>
                </div>
              )}
              <div className="flex items-center gap-1">
                <button onClick={() => onDelete(item.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* Dynamic Header Dashboard */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none rotate-12 scale-150">
          <Trophy size={180} />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 relative z-10">
          <div className="flex items-center gap-6 lg:w-1/2">
             <div className="relative shrink-0">
                <svg className="w-24 h-24 sm:w-28 sm:h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="10" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    className="stroke-indigo-500 fill-none transition-all duration-1000" 
                    strokeWidth="10" 
                    strokeDasharray={301.6} 
                    strokeDashoffset={301.6 - (301.6 * dailyProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-none">{Math.round(dailyProgress)}%</span>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Hoje</span>
                </div>
             </div>
             
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <h1 className="text-xl font-black text-slate-800 dark:text-white truncate">Status do Dia</h1>
                   <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                      <Flame size={12} fill="currentColor" /> {streak} Dias
                   </div>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">{motivationMessage}</p>
                <div className="w-full max-w-xs">
                   <div className="flex justify-between items-end mb-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nível {level}</span>
                      <span className="text-[10px] font-black text-indigo-500">{xpInLevel}/500 XP</span>
                   </div>
                   <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full transition-all duration-1000" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:w-1/2">
             <div className="flex-1 min-w-[140px] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-indigo-500">
                   <Medal size={16} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Conquistas</span>
                </div>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border-2 border-slate-50 dark:border-slate-800 flex items-center justify-center text-xs">⭐</div>
                   ))}
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">+12</div>
                </div>
             </div>
             <div className="flex-1 min-w-[140px] bg-indigo-600 p-4 rounded-3xl border border-indigo-500 shadow-xl shadow-indigo-500/20 group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Target size={60} /></div>
                <div className="flex flex-col h-full justify-between relative z-10">
                   <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Missão Especial</span>
                   <p className="text-xs font-black text-white leading-tight mt-1">Conclua 3 metas hoje p/ dobrar XP!</p>
                   <ArrowRight size={14} className="text-white mt-2 group-hover:translate-x-1 transition-transform" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] w-full border border-slate-200 dark:border-slate-800">
         <button onClick={() => setActiveSubTab('TASK')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'TASK' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500'}`}><ClipboardList size={18} /> Missões</button>
         <button onClick={() => setActiveSubTab('WORKOUT')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'WORKOUT' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500'}`}><Dumbbell size={18} /> Treinos</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="space-y-4">
              <div className="relative">
                 <input type="text" placeholder={`Personalize sua ${activeSubTab === 'TASK' ? 'missão' : 'treino'}...`} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} className="w-full pl-6 pr-16 py-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-transparent focus:border-indigo-500 shadow-sm transition-all outline-none text-slate-800 dark:text-white font-bold text-lg placeholder:text-slate-300" />
                 <button onClick={() => handleAddItem()} className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Plus size={28} /></button>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sugestões Rápidas:</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                  {SUGGESTIONS[activeSubTab].map((suggest, i) => (
                      <button key={i} onClick={() => handleAddItem(suggest.title)} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500 active:scale-95 transition-all shrink-0">
                        <suggest.icon size={16} className={suggest.color} /><span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{suggest.title}</span>
                      </button>
                  ))}
                </div>
              </div>
           </div>

           {/* Today's Plan Sections */}
           <div className="space-y-2">
              {filteredItems.length > 0 ? (
                <>
                  <PeriodSection title="Manhã" icon={Sunrise} items={groupedItems.morning} color="bg-amber-500" />
                  <PeriodSection title="Tarde" icon={Sun} items={groupedItems.afternoon} color="bg-orange-500" />
                  <PeriodSection title="Noite" icon={Moon} items={groupedItems.evening} color="bg-indigo-500" />
                </>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300">
                    <SearchX size={40} />
                  </div>
                  <h4 className="text-lg font-black text-slate-400">Nenhuma missão planejada.</h4>
                  <p className="text-sm text-slate-400 max-w-[200px] mt-2">Use as sugestões acima or adicione algo novo!</p>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Optimized Library */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex items-center gap-3 mb-4 text-emerald-500">
               <Zap size={18} className="fill-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest">Sabedoria do Dia</span>
             </div>
             <p className="text-slate-600 dark:text-slate-300 text-xs font-bold leading-relaxed">
               "Pequenas vitórias diárias levam a grandes sucessos financeiros. Disciplina é a ponte entre metas e realizações."
             </p>
           </div>
           
           <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col max-h-[800px] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2 text-indigo-500">
                    <ListPlus size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Treinos de Elite</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-1">
                 {/* Fixed type inference issue by using Object.keys and explicit indexing */}
                 {Object.keys(groupedLibrary).map((category) => {
                   const items = groupedLibrary[category];
                   const config = CATEGORY_ICONS[category] || { icon: Activity, color: "text-slate-400", bg: "bg-slate-100" };
                   const CatIcon = config.icon;

                   return (
                     <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2 px-1 mb-2">
                           <div className={`p-1.5 rounded-lg ${config.bg} ${config.color}`}>
                              <CatIcon size={12} />
                           </div>
                           <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">{category}</h4>
                        </div>
                        <div className="space-y-2">
                           {items.map((workout, idx) => (
                             <div 
                               key={idx} 
                               onClick={() => setSelectedWorkoutPreview(workout)} 
                               className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-500 transition-all shadow-sm cursor-pointer flex items-center justify-between gap-3"
                             >
                                <div className="min-w-0 flex-1">
                                   <h4 className="text-[11px] font-black text-slate-800 dark:text-white truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {workout.title}
                                   </h4>
                                   <p className="text-[9px] font-bold text-slate-400 mt-0.5">{workout.exercises.length} Exercícios</p>
                                </div>
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onAdd({ title: workout.title, completed: false, type: 'WORKOUT' }); 
                                  }} 
                                  className="shrink-0 w-8 h-8 bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center transition-all"
                                >
                                   <Plus size={16} />
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      </div>

      {/* Modal - Technical Training Sheet (Simplified) */}
      {selectedWorkoutPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedWorkoutPreview(null)}>
           <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${CATEGORY_ICONS[selectedWorkoutPreview.category]?.bg} ${CATEGORY_ICONS[selectedWorkoutPreview.category]?.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                       <Dumbbell size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-slate-800 dark:text-white">{selectedWorkoutPreview.title}</h2>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Activity size={10} className="text-indigo-500" /> {selectedWorkoutPreview.category} • Ficha Técnica
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedWorkoutPreview(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                 <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descrição do Treino</h3>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {selectedWorkoutPreview.desc}
                    </p>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Lista de Exercícios</h3>
                    <div className="space-y-3">
                       {selectedWorkoutPreview.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                             <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs bg-indigo-600 text-white shadow-sm">
                                   {i + 1}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-800 dark:text-white">{ex.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{ex.reps}</p>
                                </div>
                             </div>
                             <ChevronRight size={16} className="text-slate-300" />
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                       <Info size={18} className="text-indigo-500" />
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-100 uppercase tracking-widest mb-1">Foco na Técnica</h4>
                       <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                          Mantenha um intervalo de 45-60s entre as séries. Hidrate-se bem durante o treino. Qualidade sobre quantidade sempre!
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/30 dark:bg-slate-800/30">
                 <button 
                    onClick={() => {
                       onAdd({ title: selectedWorkoutPreview.title, completed: false, type: 'WORKOUT' });
                       setSelectedWorkoutPreview(null);
                    }}
                    className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    <Plus size={20} strokeWidth={3} />
                    Adicionar aos Meus Treinos
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RoutineTracker;