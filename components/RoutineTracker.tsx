
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Dumbbell, CheckCircle2, 
  Plus, Trash2, Zap, Trophy, 
  ClipboardList, SearchX, 
  Sparkles, Flame, Sunrise, Sun, Moon,
  Star, TrendingUp, BookOpen, Droplets, 
  Brain, Banknote, Coffee, Heart, Utensils,
  ChevronRight, Apple, ListPlus, Info,
  ChevronDown, GlassWater, Book, PlayCircle,
  X, Play, Pause, Volume2, VolumeX, Maximize2,
  Activity
} from 'lucide-react';
import { RoutineItem } from '../types';

interface RoutineTrackerProps {
  routines: RoutineItem[];
  onAdd: (item: Omit<RoutineItem, 'id' | 'created_at' | 'user_id'>) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

interface Exercise {
  name: string;
  reps: string;
  video: string;
}

interface WorkoutTemplate {
  title: string;
  desc: string;
  exercises: Exercise[];
}

const WORKOUT_LIBRARY: WorkoutTemplate[] = [
  { 
    title: "Peito & Tríceps (Foco Hipertrofia)", 
    desc: "Treino clássico de empurrar para volume e definição.",
    exercises: [
      { name: "Supino Reto", reps: "4x10", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKL9Fh3p90E6OJy/giphy.mp4" },
      { name: "Supino Inclinado Halteres", reps: "3x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxS5zP3wD1S/giphy.mp4" },
      { name: "Crucifixo Máquina", reps: "3x15", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKtkX7p9m8m7m8M/giphy.mp4" },
      { name: "Tríceps Pulley Corda", reps: "4x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.mp4" }
    ]
  },
  { 
    title: "Costas & Bíceps (Power Pull)", 
    desc: "Foco em largura das costas e pico do bíceps.",
    exercises: [
      { name: "Puxada Alta Aberta", reps: "4x10", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlSgH9iO07X97Pi/giphy.mp4" },
      { name: "Remada Baixa", reps: "3x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.mp4" },
      { name: "Rosca Direta W", reps: "3x10", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lWjZk3p3E7z6h2/giphy.mp4" },
      { name: "Rosca Martelo", reps: "3x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKp7mBvH5Q1iP6w/giphy.mp4" }
    ]
  },
  { 
    title: "Pernas Completo (Base Forte)", 
    desc: "Treino pesado para membros inferiores.",
    exercises: [
      { name: "Agachamento Livre", reps: "4x8", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxS5zP3wD1S/giphy.mp4" },
      { name: "Leg Press 45", reps: "3x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKL9Fh3p90E6OJy/giphy.mp4" },
      { name: "Cadeira Extensora", reps: "3x15", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eMdwW556d1K/giphy.mp4" },
      { name: "Mesa Flexora", reps: "3x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlSgH9iO07X97Pi/giphy.mp4" }
    ]
  },
  { 
    title: "Ombros & Trapézio", 
    desc: "Volume e largura superior.",
    exercises: [
      { name: "Desenvolvimento Halter", reps: "4x10", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.mp4" },
      { name: "Elevação Lateral", reps: "4x15", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKtkX7p9m8m7m8M/giphy.mp4" },
      { name: "Encolhimento Barra", reps: "4x15", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lWjZk3p3E7z6h2/giphy.mp4" }
    ]
  },
  { 
    title: "Core & Abdominais", 
    desc: "Estabilidade e definição abdominal.",
    exercises: [
      { name: "Prancha Abdominal", reps: "3x60s", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKp7mBvH5Q1iP6w/giphy.mp4" },
      { name: "Abdominal Supra", reps: "3x25", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlSgH9iO07X97Pi/giphy.mp4" },
      { name: "Elevação de Pernas", reps: "3x15", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKtkX7p9m8m7m8M/giphy.mp4" }
    ]
  }
];

const SUGGESTIONS = {
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

// Componente Interno de Vídeo Player
const VideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Forçar recarregamento quando o src muda
    video.load();
    video.play().catch(() => setIsPlaying(false));
    setIsPlaying(true);

    const updateProgress = () => {
      const p = (video.currentTime / video.duration) * 100;
      setProgress(p || 0);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative group aspect-video rounded-[2.5rem] overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />
      
      {/* Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col gap-4">
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
            <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Demonstração Loop</div>
          </div>
        </div>
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
           <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <Play size={32} fill="white" className="text-white ml-1" />
           </div>
        </div>
      )}
    </div>
  );
};

const RoutineTracker: React.FC<RoutineTrackerProps> = ({ routines, onAdd, onToggle, onDelete }) => {
  const [activeSubTab, setActiveSubTab] = useState<'TASK' | 'WORKOUT'>('TASK');
  const [inputValue, setInputValue] = useState('');
  const [showXP, setShowXP] = useState<string | null>(null);
  const [selectedWorkoutPreview, setSelectedWorkoutPreview] = useState<WorkoutTemplate | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const filteredItems = routines.filter(item => item.type === activeSubTab);
  
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

  const handleAddItem = (titleOverride?: string) => {
    const title = titleOverride || inputValue.trim();
    if (!title) return;
    onAdd({
      title,
      completed: false,
      type: activeSubTab
    });
    if (!titleOverride) setInputValue('');
  };

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
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-3 px-2">
          <div className={`p-1.5 rounded-lg ${color} bg-opacity-20 ${color.replace('bg-', 'text-')}`}>
            <Icon size={16} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
        </div>
        <div className="space-y-3">
          {items.map(item => (
            <div 
              key={item.id}
              className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-[2rem] border-2 transition-all duration-300 ${
                item.completed 
                  ? 'bg-emerald-500/5 border-transparent opacity-60 grayscale-[0.5]' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                 <button 
                   onClick={() => handleToggle(item.id, !item.completed)}
                   className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform active:scale-90 shrink-0 ${
                     item.completed 
                       ? 'bg-emerald-500 text-white shadow-lg' 
                       : 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-transparent'
                   }`}
                 >
                   <CheckCircle2 size={24} className={item.completed ? 'opacity-100' : 'opacity-0'} />
                 </button>
                 <div className="flex flex-col min-w-0">
                   <span className={`font-bold text-base sm:text-lg truncate transition-all ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                     {item.title}
                   </span>
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">+50 XP</span>
                 </div>
              </div>
              
              {showXP === item.id && (
                <div className="absolute left-1/2 -top-4 -translate-x-1/2 animate-bounce pointer-events-none z-20">
                   <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles size={10} /> +50 XP
                   </div>
                </div>
              )}

              <button onClick={() => onDelete(item.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      {/* Header Gamification */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
           <Trophy size={150} />
        </div>
        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shrink-0">
                <span className="text-2xl font-black">{level}</span>
             </div>
             <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black text-slate-800 dark:text-white truncate">Minha Rotina</h1>
                <div className="mt-2 w-full max-w-xs">
                   <div className="flex justify-between items-end mb-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nível Atual</span>
                      <span className="text-[10px] font-black text-indigo-500">{xpInLevel}/500 XP</span>
                   </div>
                   <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] w-full border border-slate-200 dark:border-slate-800">
         <button onClick={() => setActiveSubTab('TASK')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'TASK' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500'}`}><ClipboardList size={18} /> Missões</button>
         <button onClick={() => setActiveSubTab('WORKOUT')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'WORKOUT' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500'}`}><Dumbbell size={18} /> Treinos</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           {/* Add Bar */}
           <div className="space-y-4">
              <div className="relative">
                 <input 
                   type="text"
                   placeholder={`Personalize sua ${activeSubTab === 'TASK' ? 'missão' : 'treino'}...`}
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                   className="w-full pl-6 pr-16 py-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-transparent focus:border-indigo-500 shadow-sm transition-all outline-none text-slate-800 dark:text-white font-bold text-lg placeholder:text-slate-300"
                 />
                 <button onClick={() => handleAddItem()} className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Plus size={28} /></button>
              </div>

              {/* Suggestions Chips */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sugestões Rápidas:</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                  {SUGGESTIONS[activeSubTab].map((suggest, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleAddItem(suggest.title)} 
                        className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500 active:scale-95 transition-all shrink-0"
                      >
                        <suggest.icon size={16} className={suggest.color} />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">{suggest.title}</span>
                      </button>
                  ))}
                </div>
              </div>
           </div>

           {/* Routine Items List */}
           <div className="space-y-2">
              {filteredItems.length > 0 ? (
                <>
                  <PeriodSection title="Manhã" icon={Sunrise} items={groupedItems.morning} color="bg-amber-500" />
                  <PeriodSection title="Tarde" icon={Sun} items={groupedItems.afternoon} color="bg-orange-500" />
                  <PeriodSection title="Noite" icon={Moon} items={groupedItems.evening} color="bg-indigo-500" />
                </>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                   <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300"><SearchX size={40} /></div>
                   <p className="text-xl font-black text-slate-400">Monte seu plano!</p>
                   <p className="text-xs font-bold text-slate-500 mt-2">Clique em Treinos ou Missões para adicionar.</p>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Components */}
        <div className="space-y-6">
           {/* Info Card */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-emerald-500">
                <Utensils size={18} className="fill-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Dica de Sucesso</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs font-bold leading-relaxed">
                Manter o foco em metas diárias como beber água e ler ajuda a criar a disciplina necessária para o sucesso financeiro.
              </p>
           </div>

           {/* Template Library */}
           <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col max-h-[700px] shadow-sm">
              <div className="flex items-center justify-between mb-4 px-2">
                 <div className="flex items-center gap-2 text-indigo-500">
                    <ListPlus size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Biblioteca Pro</span>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                 {WORKOUT_LIBRARY.map((workout, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedWorkoutPreview(workout);
                        setActiveExerciseIndex(0);
                      }}
                      className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-500 transition-all shadow-sm cursor-pointer relative overflow-hidden"
                    >
                       <div className="flex justify-between items-start mb-2 relative z-10">
                          <h4 className="text-[11px] font-black text-slate-800 dark:text-white pr-8 leading-tight">{workout.title}</h4>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onAdd({ title: workout.title, completed: false, type: 'WORKOUT' });
                            }} 
                            className="absolute right-0 top-0 shrink-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                            <Plus size={16} />
                          </button>
                       </div>
                       <div className="flex items-center gap-1.5 opacity-60 relative z-10">
                          <PlayCircle size={10} className="shrink-0 text-indigo-500" />
                          <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Ver exercícios em vídeo</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Workout Detail Modal (Video Integrated) */}
      {selectedWorkoutPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedWorkoutPreview(null)}>
           <div 
             className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] lg:max-h-[85vh] animate-in zoom-in-95 duration-300"
             onClick={(e) => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                       <Dumbbell size={24} />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-slate-800 dark:text-white">{selectedWorkoutPreview.title}</h2>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Activity size={10} className="text-indigo-500" /> 60 Min sugeridos
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedWorkoutPreview(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all">
                   <X size={24} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                 {/* Video Player Section */}
                 <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-indigo-500">
                             <PlayCircle size={14} fill="currentColor" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Demonstração: {selectedWorkoutPreview.exercises[activeExerciseIndex].name}</span>
                          </div>
                          <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[9px] font-black uppercase tracking-tighter">
                             Técnica Perfeita
                          </div>
                       </div>
                       
                       <VideoPlayer src={selectedWorkoutPreview.exercises[activeExerciseIndex].video} />
                    </div>

                    <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                       <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                          <Info size={14} className="text-indigo-500" /> Por que fazer?
                       </h4>
                       <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                          O {selectedWorkoutPreview.exercises[activeExerciseIndex].name} é fundamental para o desenvolvimento de {selectedWorkoutPreview.title.split(' ')[0]}. 
                          Mantenha o foco na amplitude e cadência de 2 segundos.
                       </p>
                    </div>
                 </div>

                 {/* Exercises Selection List */}
                 <div className="lg:col-span-5 border-l border-slate-100 dark:border-slate-800 p-6 lg:p-8 flex flex-col gap-6 bg-white dark:bg-slate-900 overflow-y-auto no-scrollbar">
                    <div>
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Ficha de Exercícios</h3>
                       <div className="space-y-3">
                          {selectedWorkoutPreview.exercises.map((ex, i) => (
                             <button 
                                key={i}
                                onClick={() => setActiveExerciseIndex(i)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                                   activeExerciseIndex === i 
                                   ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                   : 'border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-200'
                                }`}
                             >
                                <div className="flex items-center gap-4">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${activeExerciseIndex === i ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-400'}`}>
                                      {i + 1}
                                   </div>
                                   <div>
                                      <p className={`text-sm font-black ${activeExerciseIndex === i ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>{ex.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{ex.reps}</p>
                                   </div>
                                </div>
                                {activeExerciseIndex === i && <Sparkles size={16} className="text-indigo-500 animate-pulse" />}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="mt-auto pt-6 space-y-4">
                       <button 
                          onClick={() => {
                             onAdd({ title: selectedWorkoutPreview.title, completed: false, type: 'WORKOUT' });
                             setSelectedWorkoutPreview(null);
                          }}
                          className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                       >
                          <Plus size={20} strokeWidth={3} />
                          Adicionar este Treino
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RoutineTracker;
