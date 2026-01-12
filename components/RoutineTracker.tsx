
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
  Activity, MessageSquare,
  Sparkle
} from 'lucide-react';
import { RoutineItem, UserProfile } from '../types';

interface RoutineTrackerProps {
  routines: RoutineItem[];
  userProfile: UserProfile;
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
  category: string;
  desc: string;
  exercises: Exercise[];
}

const WORKOUT_LIBRARY: WorkoutTemplate[] = [
  { 
    title: "Peito & Tríceps", 
    category: "Hipertrofia",
    desc: "Foco em volume de peitoral e tríceps ferradura.",
    exercises: [
      { name: "Supino Reto", reps: "4x10", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKL9Fh3p90E6OJy/giphy.mp4" },
      { name: "Supino Inclinado", reps: "3x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxS5zP3wD1S/giphy.mp4" },
      { name: "Tríceps Pulley", reps: "4x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.mp4" }
    ]
  },
  { 
    title: "Costas & Bíceps", 
    category: "Hipertrofia",
    desc: "Largura das costas e pico do bíceps.",
    exercises: [
      { name: "Puxada Aberta", reps: "4x10", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlSgH9iO07X97Pi/giphy.mp4" },
      { name: "Remada Curvada", reps: "3x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Jmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlSgH9iO07X97Pi/giphy.mp4" },
      { name: "Rosca Direta", reps: "3x10", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lWjZk3p3E7z6h2/giphy.mp4" }
    ]
  },
  { 
    title: "Pernas Completo", 
    category: "Força",
    desc: "Treino pesado para membros inferiores.",
    exercises: [
      { name: "Agachamento", reps: "4x8", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxS5zP3wD1S/giphy.mp4" },
      { name: "Leg Press", reps: "3x12", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKL9Fh3p90E6OJy/giphy.mp4" },
      { name: "Cadeira Extensora", reps: "3x15", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKv6eMdwW556d1K/giphy.mp4" }
    ]
  },
  { 
    title: "Ombros & Trapézio", 
    category: "Estética",
    desc: "Deltoides em 3D e trapézio imponente.",
    exercises: [
      { name: "Desenvolvimento", reps: "4x10", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.mp4" },
      { name: "Elevação Lateral", reps: "4x15", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKtkX7p9m8m7m8M/giphy.mp4" }
    ]
  },
  { 
    title: "Core & Abs", 
    category: "Saúde",
    desc: "Estabilidade lombar e definição abdominal.",
    exercises: [
      { name: "Prancha", reps: "3x60s", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKp7mBvH5Q1iP6w/giphy.mp4" },
      { name: "Abdominal Supra", reps: "3x20", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4Jmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlSgH9iO07X97Pi/giphy.mp4" }
    ]
  },
  { 
    title: "HIIT Express", 
    category: "Cardio",
    desc: "Queima calórica máxima em apenas 20 min.",
    exercises: [
      { name: "Burpees", reps: "4x30s", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.mp4" },
      { name: "Polichinelos", reps: "4x30s", video: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ1N2R4Zmx4Zmx4Zmx4Zmx4Zmx4Zmx4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKp7mBvH5Q1iP6w/giphy.mp4" }
    ]
  }
];

const SMART_SUGGESTIONS = {
  TASK: [
    { title: "Beber 3L de Água", icon: GlassWater, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200" },
    { title: "Leitura do Dia", icon: Book, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-200" },
    { title: "Alimentação Limpa", icon: Utensils, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-200" },
    { title: "Meditar 10 min", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-200" },
    { title: "Organizar Finanças", icon: Banknote, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-200" },
  ],
  WORKOUT: [
    { title: "Cardio 30 min", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-200" },
    { title: "Musculação", icon: Dumbbell, color: "text-slate-700", bg: "bg-slate-700/10", border: "border-slate-300" },
    { title: "Mobilidade", icon: Activity, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-200" },
  ]
};

const VideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
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

const RoutineTracker: React.FC<RoutineTrackerProps> = ({ routines, userProfile, onAdd, onToggle, onDelete }) => {
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
      setTimeout(() => setShowXP(null), 1500);
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

  const handleWhatsAppReminder = (item: RoutineItem) => {
    const whatsapp = userProfile.whatsapp_number;
    if (!whatsapp) {
      alert("Por favor, configure seu número de WhatsApp no perfil para enviar lembretes!");
      return;
    }
    const message = item.type === 'TASK' 
      ? `Olá! Não esqueça da sua missão: *${item.title}*! 🚀`
      : `Hora de treinar! Partiu fazer o treino: *${item.title}*? 🔥`;
    const url = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
          {items.map(item => {
            const isJustCompleted = showXP === item.id;
            return (
              <div 
                key={item.id}
                className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-[2rem] border-2 transition-all duration-700 overflow-hidden ${
                  item.completed 
                    ? `bg-emerald-500/10 border-emerald-500/30 animate-glow-pulse shadow-[0_0_20px_rgba(16,185,129,0.15)] opacity-80` 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 shadow-sm'
                }`}
              >
                {/* Visual Shimmer/Beam Effect for newly completed tasks */}
                {item.completed && (
                  <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                  </div>
                )}
                
                <div className="flex items-center gap-4 flex-1 relative z-10">
                   <button 
                     onClick={() => handleToggle(item.id, !item.completed)}
                     className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 transform active:scale-90 shrink-0 ${
                       item.completed 
                         ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' 
                         : 'bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-transparent hover:border-indigo-400'
                     }`}
                   >
                     <CheckCircle2 size={24} className={`transition-all duration-500 ${item.completed ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-45'}`} />
                   </button>
                   <div className="flex flex-col min-w-0">
                     <span className={`font-bold text-base sm:text-lg truncate transition-all duration-700 ${item.completed ? 'line-through text-emerald-800/60 dark:text-emerald-400/60 blur-[0.2px]' : 'text-slate-800 dark:text-white'}`}>
                       {item.title}
                     </span>
                     <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-tighter transition-all duration-500 ${item.completed ? 'text-emerald-500' : 'text-indigo-500'}`}>
                           {item.completed ? 'Concluído' : '+50 XP'}
                        </span>
                        {item.completed && <Sparkles size={10} className="text-emerald-400 animate-pulse" />}
                     </div>
                   </div>
                </div>
                
                {isJustCompleted && (
                  <div className="absolute left-1/2 -top-6 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center gap-1">
                     <div className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                        <Zap size={10} className="fill-white" /> +50 XP
                     </div>
                     <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-sparkle" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                     </div>
                  </div>
                )}

                <div className="flex items-center gap-1 relative z-10">
                  {!item.completed && (
                    <button 
                      onClick={() => handleWhatsAppReminder(item)}
                      className="p-3 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Lembrar no WhatsApp"
                    >
                      <MessageSquare size={18} />
                    </button>
                  )}
                  <button onClick={() => onDelete(item.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
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
      {/* Gamification Header */}
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

      {/* Recommended Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <Sparkle size={16} className="text-indigo-500 fill-indigo-500" />
           <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Metas Sugeridas</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SMART_SUGGESTIONS[activeSubTab].map((suggest, i) => (
            <button 
              key={i} 
              onClick={() => handleAddItem(suggest.title)} 
              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border-2 transition-all hover:scale-105 active:scale-95 bg-white dark:bg-slate-900 ${suggest.border} shadow-sm group`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${suggest.bg} ${suggest.color} group-hover:scale-110`}>
                <suggest.icon size={24} />
              </div>
              <span className="text-center text-[11px] font-black text-slate-700 dark:text-slate-200 leading-tight">
                {suggest.title}
              </span>
            </button>
          ))}
          <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Plus size={24} />
             </div>
             <span className="text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">Personalizar</span>
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] w-full border border-slate-200 dark:border-slate-800">
         <button onClick={() => setActiveSubTab('TASK')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'TASK' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500'}`}><ClipboardList size={18} /> Missões</button>
         <button onClick={() => setActiveSubTab('WORKOUT')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === 'WORKOUT' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500'}`}><Dumbbell size={18} /> Treinos</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           {/* Custom Input Bar */}
           <div className="relative">
              <input 
                type="text"
                placeholder={`Nomeie sua própria ${activeSubTab === 'TASK' ? 'missão' : 'treino'}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                className="w-full pl-6 pr-16 py-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-transparent focus:border-indigo-500 shadow-sm transition-all outline-none text-slate-800 dark:text-white font-bold text-lg placeholder:text-slate-300"
              />
              <button onClick={() => handleAddItem()} className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Plus size={28} /></button>
           </div>

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
                   <p className="text-xl font-black text-slate-400">Sua lista está vazia!</p>
                   <p className="text-xs font-bold text-slate-500 mt-2">Use as sugestões acima ou adicione algo novo.</p>
                </div>
              )}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-emerald-500">
                <Utensils size={18} className="fill-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Dica de Saúde</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs font-bold leading-relaxed">
                Beber água regularmente acelera o metabolismo e melhora o foco. Tente bater sua meta de 3L hoje!
              </p>
           </div>

           {/* Optimized Library Sidebar */}
           <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col max-h-[700px] shadow-sm">
              <div className="flex items-center justify-between mb-6 px-2">
                 <div className="flex items-center gap-2 text-indigo-500">
                    <ListPlus size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Biblioteca Pro</span>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
                 {WORKOUT_LIBRARY.map((workout, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedWorkoutPreview(workout);
                        setActiveExerciseIndex(0);
                      }}
                      className="group flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all shadow-sm cursor-pointer"
                    >
                       <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                             <Dumbbell size={18} />
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-[11px] font-black text-slate-800 dark:text-white truncate leading-tight">{workout.title}</h4>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{workout.category}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onAdd({ title: workout.title, completed: false, type: 'WORKOUT' });
                            }} 
                            className="w-8 h-8 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center transition-all"
                            title="Adicionar à lista"
                          >
                            <Plus size={16} />
                          </button>
                          <div className="w-8 h-8 flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <PlayCircle size={18} />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {selectedWorkoutPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedWorkoutPreview(null)}>
           <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] lg:max-h-[85vh] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Dumbbell size={24} /></div>
                    <div><h2 className="text-xl font-black text-slate-800 dark:text-white">{selectedWorkoutPreview.title}</h2><div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Activity size={10} className="text-indigo-500" /> {selectedWorkoutPreview.category}</div></div>
                 </div>
                 <button onClick={() => setSelectedWorkoutPreview(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                 <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950 p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-indigo-500"><PlayCircle size={14} fill="currentColor" /><span className="text-[10px] font-black uppercase tracking-widest">Demonstração: {selectedWorkoutPreview.exercises[activeExerciseIndex].name}</span></div>
                          <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[9px] font-black uppercase tracking-tighter">Técnica Perfeita</div>
                       </div>
                       <VideoPlayer src={selectedWorkoutPreview.exercises[activeExerciseIndex].video} />
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                       <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2"><Info size={14} className="text-indigo-500" /> Por que fazer?</h4>
                       <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{selectedWorkoutPreview.desc}</p>
                    </div>
                 </div>
                 <div className="lg:col-span-5 border-l border-slate-100 dark:border-slate-800 p-6 lg:p-8 flex flex-col gap-6 bg-white dark:bg-slate-900 overflow-y-auto no-scrollbar">
                    <div>
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Ficha de Exercícios</h3>
                       <div className="space-y-3">
                          {selectedWorkoutPreview.exercises.map((ex, i) => (
                             <button key={i} onClick={() => setActiveExerciseIndex(i)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${activeExerciseIndex === i ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-200'}`}>
                                <div className="flex items-center gap-4">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${activeExerciseIndex === i ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-400'}`}>{i + 1}</div>
                                   <div><p className={`text-sm font-black ${activeExerciseIndex === i ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>{ex.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{ex.reps}</p></div>
                                </div>
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="mt-auto pt-6 space-y-4">
                       <button onClick={() => { onAdd({ title: selectedWorkoutPreview.title, completed: false, type: 'WORKOUT' }); setSelectedWorkoutPreview(null); }} className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"><Plus size={20} strokeWidth={3} /> Adicionar este Treino</button>
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
