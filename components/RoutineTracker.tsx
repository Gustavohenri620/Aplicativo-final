
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
  ArrowRight,
  MessageCircle,
  Leaf,
  Clock,
  Star,
  BellRing
} from 'lucide-react';
import { RoutineItem, UserProfile } from '../types';

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

const SUGGESTIONS: Record<'TASK' | 'WORKOUT', Array<{ title: string; icon: any; color: string; period: string }>> = {
  TASK: [
    { title: "Meta de Água (3L)", icon: GlassWater, color: "text-blue-500", period: "morning" },
    { title: "Leitura (30 min)", icon: Book, color: "text-emerald-500", period: "evening" },
    { title: "Alimentação Saudável", icon: Utensils, color: "text-emerald-500", period: "afternoon" },
    { title: "Comer uma Fruta", icon: Apple, color: "text-rose-500", period: "afternoon" },
    { title: "Meditar 5 min", icon: Brain, color: "text-purple-500", period: "morning" },
  ],
  WORKOUT: [
    { title: "Musculação", icon: Dumbbell, color: "text-emerald-600", period: "afternoon" },
    { title: "Caminhada 30min", icon: TrendingUp, color: "text-emerald-500", period: "morning" },
    { title: "Alongamento", icon: Zap, color: "text-amber-500", period: "morning" },
    { title: "Yoga", icon: Sunrise, color: "text-indigo-500", period: "evening" },
  ]
};

const CATEGORY_ICONS: Record<string, any> = {
  "Força": { icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  "Foco": { icon: ZapIcon, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  "Cardio": { icon: Wind, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  "Mobilidade": { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" }
};

interface RoutineTrackerProps {
  routines: RoutineItem[];
  userProfile?: UserProfile;
  onAdd: (item: Omit<RoutineItem, 'id' | 'created_at' | 'user_id'>) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onOpenProfile?: () => void;
}

const RoutineTracker: React.FC<RoutineTrackerProps> = ({ routines, userProfile, onAdd, onToggle, onDelete, onOpenProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<'TASK' | 'WORKOUT'>('TASK');
  const [inputValue, setInputValue] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('morning');
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [selectedWorkoutPreview, setSelectedWorkoutPreview] = useState<WorkoutTemplate | null>(null);

  const filteredItems = routines.filter(item => item.type === activeSubTab);
  const completedItems = filteredItems.filter(item => item.completed);
  const totalItems = filteredItems.length;
  const dailyProgress = totalItems > 0 ? (completedItems.length / totalItems) * 100 : 0;

  const currentXP = routines.filter(r => r.completed).length * 50;
  const level = Math.floor(currentXP / 500) + 1;
  const xpInLevel = currentXP % 500;

  const streak = 7;

  const motivationMessage = useMemo(() => {
    if (totalItems === 0) return "Crie sua primeira meta verde hoje!";
    if (dailyProgress === 0) return "Toda grande jornada começa com um pequeno passo.";
    if (dailyProgress < 50) return "Você está crescendo! Mantenha a consistência.";
    if (dailyProgress < 100) return "Quase lá! Seu corpo e mente agradecem.";
    return "Dia perfeito! Você floresceu hoje! 🌿";
  }, [dailyProgress, totalItems]);

  const handleToggle = (id: string, completed: boolean) => {
    if (completed) {
      setCelebratingId(id);
      setTimeout(() => setCelebratingId(null), 1200);
    }
    onToggle(id, completed);
  };

  const handleAddItem = (titleOverride?: string, periodOverride?: string) => {
    const title = titleOverride || inputValue.trim();
    if (!title) return;
    
    onAdd({ 
      title, 
      completed: false, 
      type: activeSubTab, 
      category: periodOverride || selectedPeriod 
    });
    
    if (!titleOverride) {
      setInputValue('');
    }
  };

  const handleWhatsappReminder = (item: RoutineItem) => {
    if (!userProfile?.whatsapp_number || userProfile.whatsapp_number.trim() === '') {
      if (onOpenProfile) onOpenProfile();
      alert("Por favor, cadastre seu número de WhatsApp no perfil para usar esta função.");
      return;
    }

    const message = encodeURIComponent(`Olá! 🚀 Lembrete Finance&Routine:\n\nNão esqueça de concluir sua meta: *${item.title}* hoje!\n\nSua saúde financeira e física andam juntas. Vamos pra cima! 🔥`);
    const whatsappUrl = `https://wa.me/${userProfile.whatsapp_number.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const groupedItems = useMemo(() => {
    return {
      morning: filteredItems.filter(i => i.category === 'morning'),
      afternoon: filteredItems.filter(i => i.category === 'afternoon'),
      evening: filteredItems.filter(i => i.category === 'evening'),
      uncategorized: filteredItems.filter(i => !i.category) // Legado
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
          {items.map(item => {
            const isCelebrating = celebratingId === item.id;
            
            return (
              <div key={item.id} className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-[2rem] border-2 transition-all duration-300 ${item.completed ? 'bg-emerald-500/5 border-emerald-500/10 opacity-80' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 shadow-sm'}`}>
                <div className="flex items-center gap-4 flex-1">
                   <div className="relative">
                     <button 
                       onClick={() => handleToggle(item.id, !item.completed)} 
                       className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shrink-0 overflow-visible ${item.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-transparent'}`}
                     >
                       <CheckCircle2 size={24} className={`transition-all duration-300 ${item.completed ? 'opacity-100 scale-110 rotate-0' : 'opacity-0 scale-50 rotate-45'}`} />
                     </button>
                     
                     {/* Celebration Particles */}
                     {isCelebrating && (
                       <div className="absolute inset-0 pointer-events-none">
                         {[...Array(6)].map((_, i) => (
                           <div 
                             key={i} 
                             className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-out fade-out zoom-out duration-1000"
                             style={{ 
                               transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-24px)`,
                             }}
                           />
                         ))}
                         <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-in zoom-in spin-in duration-500" size={16} />
                       </div>
                     )}
                   </div>

                   <div className="flex flex-col min-w-0">
                     <span className={`font-bold text-base sm:text-lg truncate transition-all duration-500 ${item.completed ? 'line-through text-slate-400 italic' : 'text-slate-800 dark:text-white'}`}>
                       {item.title}
                     </span>
                     <div className="flex items-center gap-1.5">
                       <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${item.completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                         +50 XP
                       </span>
                       {item.completed && (
                         <div className="flex items-center text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full animate-in slide-in-from-left-1 duration-300">
                           FEITO
                         </div>
                       )}
                     </div>
                   </div>
                </div>

                {isCelebrating && (
                  <div className="absolute left-1/2 -top-6 -translate-x-1/2 animate-in slide-in-from-bottom-2 fade-in duration-500 z-20">
                     <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                       <Trophy size={10} className="animate-bounce" /> BOA! +50 XP
                     </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 sm:mt-0 ml-0 sm:ml-4">
                  {!item.completed && (
                    <button 
                      onClick={() => handleWhatsappReminder(item)}
                      title="Lembrar no WhatsApp"
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all group/wa shadow-sm border border-emerald-100 dark:border-emerald-800/50 active:scale-95"
                    >
                      <MessageCircle size={16} fill="currentColor" className="opacity-70 group-hover/wa:opacity-100" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Lembrar</span>
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(item.id)} 
                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      
      {/* Enhanced Green Header Dashboard */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[3rem] border border-emerald-50 dark:border-emerald-900/20 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none rotate-12 scale-150 text-emerald-500">
          <Leaf size={180} />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 relative z-10">
          <div className="flex items-center gap-6 lg:w-1/2">
             <div className="relative shrink-0">
                <svg className="w-24 h-24 sm:w-28 sm:h-28 transform -rotate-90 overflow-visible">
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="56" cy="56" r="48" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="10" />
                  <circle 
                    cx="56" cy="56" r="48" 
                    className="fill-none transition-all duration-1000 ease-out" 
                    stroke="url(#greenGradient)"
                    strokeWidth="10" 
                    strokeDasharray={301.6} 
                    strokeDashoffset={301.6 - (301.6 * dailyProgress) / 100}
                    strokeLinecap="round"
                    style={{ filter: dailyProgress === 100 ? 'url(#glow)' : 'none' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">
                     {Math.round(dailyProgress)}%
                   </span>
                   <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Meta</span>
                </div>
             </div>
             
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <h1 className="text-xl font-black text-slate-800 dark:text-white truncate">Minha Rotina</h1>
                   <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
                      <Flame size={12} fill="currentColor" className="animate-pulse" /> {streak} Dias
                   </div>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">{motivationMessage}</p>
                
                {/* Nova Barra de Progresso Linear Animada */}
                <div className="w-full max-w-sm mb-4 group/progress">
                   <div className="flex justify-between items-end mb-1.5 px-0.5">
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em]">Progresso do Dia</span>
                      <span className="text-[10px] font-black text-slate-400">{completedItems.length} de {totalItems} metas</span>
                   </div>
                   <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.2)] ${dailyProgress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse' : 'bg-emerald-500'}`} 
                        style={{ width: `${dailyProgress}%` }} 
                      />
                   </div>
                </div>

                <div className="w-full max-w-sm">
                   <div className="flex justify-between items-end mb-1 px-0.5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nível {level}</span>
                      <span className="text-[10px] font-black text-emerald-600">{xpInLevel}/500 XP</span>
                   </div>
                   <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:w-1/2">
             <div className="flex-1 min-w-[140px] bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/20 group">
                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                   <Medal size={16} className="group-hover:rotate-12 transition-transform" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Coleção</span>
                </div>
                <div className="flex -space-x-2">
                   {['🌿', '💧', '🥗'].map((emoji, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border-2 border-emerald-50 dark:border-emerald-800 flex items-center justify-center text-xs shadow-sm hover:-translate-y-1 transition-transform cursor-default">{emoji}</div>
                   ))}
                   <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-white shadow-sm">+5</div>
                </div>
             </div>
             <div className="flex-1 min-w-[140px] bg-emerald-600 p-4 rounded-3xl border border-emerald-500 shadow-xl shadow-emerald-500/20 group cursor-pointer overflow-hidden relative active:scale-95 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Target size={60} /></div>
                <div className="flex flex-col h-full justify-between relative z-10">
                   <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Foco do Dia</span>
                   <p className="text-xs font-black text-white leading-tight mt-1">Dobre seu XP ao concluir as metas da manhã!</p>
                   <ArrowRight size={14} className="text-white mt-2 group-hover:translate-x-1 transition-transform" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Tabs in Green */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] w-full border border-slate-200 dark:border-slate-800">
         <button onClick={() => setActiveSubTab('TASK')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'TASK' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xl' : 'text-slate-500'}`}><ClipboardList size={18} /> Missões</button>
         <button onClick={() => setActiveSubTab('WORKOUT')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'WORKOUT' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xl' : 'text-slate-500'}`}><Dumbbell size={18} /> Treinos</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           {/* New Enhanced Manual Add Section */}
           <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-900/20 shadow-sm space-y-5">
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder={`Digite uma nova ${activeSubTab === 'TASK' ? 'missão' : 'treino'}...`} 
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} 
                      className="w-full pl-6 pr-16 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent focus:border-emerald-500 transition-all outline-none text-slate-800 dark:text-white font-bold text-lg placeholder:text-slate-300" 
                    />
                    <button onClick={() => handleAddItem()} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Plus size={24} /></button>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
                       <button onClick={() => setSelectedPeriod('morning')} className={`flex-1 sm:w-24 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPeriod === 'morning' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}><Sunrise size={14} /> Manhã</button>
                       <button onClick={() => setSelectedPeriod('afternoon')} className={`flex-1 sm:w-24 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPeriod === 'afternoon' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}><Sun size={14} /> Tarde</button>
                       <button onClick={() => setSelectedPeriod('evening')} className={`flex-1 sm:w-24 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPeriod === 'evening' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}><Moon size={14} /> Noite</button>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <Clock size={12} /> Selecione o período
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sugestões Rápidas:</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                  {SUGGESTIONS[activeSubTab].map((suggest, i) => (
                      <button key={i} onClick={() => handleAddItem(suggest.title, suggest.period)} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-emerald-500 active:scale-95 transition-all shrink-0 group">
                        <suggest.icon size={16} className={`${suggest.color} group-hover:scale-110 transition-transform`} /><span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{suggest.title}</span>
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
                  <PeriodSection title="Noite" icon={Moon} items={groupedItems.evening} color="bg-emerald-600" />
                  <PeriodSection title="Outros" icon={Clock} items={groupedItems.uncategorized} color="bg-slate-500" />
                </>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 text-emerald-200">
                    <Leaf size={40} className="animate-pulse" />
                  </div>
                  <h4 className="text-lg font-black text-slate-400 uppercase tracking-tighter">Plante seus hábitos.</h4>
                  <p className="text-sm text-slate-400 max-w-[200px] mt-2 font-medium leading-relaxed">Sua rotina define o seu sucesso. Adicione uma meta para começar!</p>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Optimized Library in Green */}
        <div className="space-y-6">
           <div className="bg-emerald-600 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden group">
             <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform"><Zap size={100} fill="currentColor" /></div>
             <div className="flex items-center gap-3 mb-4">
               <Sparkles size={18} className="text-amber-300" />
               <span className="text-[10px] font-black uppercase tracking-widest">Sabedoria Semanal</span>
             </div>
             <p className="text-white/90 text-xs font-bold leading-relaxed relative z-10">
               "Cada meta concluída é um tijolo na construção da sua liberdade financeira e bem-estar."
             </p>
           </div>
           
           <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col max-h-[800px] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2 text-emerald-600">
                    <ListPlus size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Treinos de Elite</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-1">
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
                               className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-emerald-500 transition-all shadow-sm cursor-pointer flex items-center justify-between gap-3"
                             >
                                <div className="min-w-0 flex-1">
                                   <h4 className="text-[11px] font-black text-slate-800 dark:text-white truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                      {workout.title}
                                   </h4>
                                   <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">{workout.exercises.length} Movimentos</p>
                                </div>
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onAdd({ title: workout.title, completed: false, type: 'WORKOUT', category: 'afternoon' }); 
                                  }} 
                                  className="shrink-0 w-8 h-8 bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90"
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

      {/* Modal - Green Themed */}
      {selectedWorkoutPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedWorkoutPreview(null)}>
           <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${CATEGORY_ICONS[selectedWorkoutPreview.category]?.bg} ${CATEGORY_ICONS[selectedWorkoutPreview.category]?.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                       <Dumbbell size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{selectedWorkoutPreview.title}</h2>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Activity size={10} className="text-emerald-500" /> {selectedWorkoutPreview.category} • Ficha Técnica
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedWorkoutPreview(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-90"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                 <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descrição</h3>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 italic">
                      "{selectedWorkoutPreview.desc}"
                    </p>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Série de Exercícios</h3>
                    <div className="space-y-3">
                       {selectedWorkoutPreview.exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500/20 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs bg-emerald-600 text-white shadow-sm group-hover:scale-110 transition-transform">
                                   {i + 1}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-800 dark:text-white">{ex.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{ex.reps}</p>
                                </div>
                             </div>
                             <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-emerald-500">
                       <Info size={18} />
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-widest mb-1">Dica Pro</h4>
                       <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 leading-relaxed">
                          Concentre-se na qualidade do movimento. Respiração profunda ajuda na oxigenação muscular e no foco mental.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/30 dark:bg-slate-800/30">
                 <button 
                    onClick={() => {
                       onAdd({ title: selectedWorkoutPreview.title, completed: false, type: 'WORKOUT', category: 'afternoon' });
                       setSelectedWorkoutPreview(null);
                    }}
                    className="w-full py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    <Star size={18} fill="currentColor" className="animate-spin-slow" />
                    Começar Treino Agora
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RoutineTracker;
