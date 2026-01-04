
import React, { useState } from 'react';
import { 
  Plus, X, Trash2, Edit2, Check,
  MoreHorizontal, SearchX
} from 'lucide-react';
import { Category } from '../types';
import { ICON_MAP, AVAILABLE_COLORS } from '../constants';

interface CategorySettingsProps {
  categories: Category[];
  onSave: (category: Omit<Category, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
}

const CategorySettings: React.FC<CategorySettingsProps> = ({ categories, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('MoreHorizontal');
  const [selectedColor, setSelectedColor] = useState('#64748b');

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setName(category.name);
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
    } else {
      setEditingId(null);
      setName('');
      setSelectedIcon('MoreHorizontal');
      setSelectedColor('#64748b');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: editingId || undefined,
      name,
      icon: selectedIcon,
      color: selectedColor,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 lg:pb-0">
      <div className="flex items-center justify-between sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Categorias</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gerencie suas categorias personalizadas.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all font-semibold"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Categoria</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || MoreHorizontal;
          return (
            <div 
              key={cat.id} 
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: cat.color }}
                >
                  <IconComponent size={24} />
                </div>
                <span className="font-bold text-slate-800 dark:text-white text-lg">{cat.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(cat)}
                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(cat.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
           <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <SearchX size={32} />
             </div>
             <p className="text-slate-500">Nenhuma categoria encontrada.</p>
           </div>
        )}
      </div>

      {/* Modal / Bottom Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
           <div 
            className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
           >
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => setIsModalOpen(false)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={24} />
                </button>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <div className="w-10"></div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                
                {/* Preview */}
                <div className="flex justify-center mb-6">
                   <div className="flex flex-col items-center gap-3">
                      <div 
                        className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg transition-all"
                        style={{ backgroundColor: selectedColor }}
                      >
                         {React.createElement(ICON_MAP[selectedIcon] || MoreHorizontal, { size: 32 })}
                      </div>
                      <span className="text-sm font-medium text-slate-400">Pré-visualização</span>
                   </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nome da Categoria</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Viagens"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-lg font-medium text-slate-800 dark:text-white transition-all outline-none placeholder:text-slate-400"
                  />
                </div>

                {/* Color Picker */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Cor</label>
                  <div className="grid grid-cols-6 gap-3">
                    {AVAILABLE_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-full aspect-square rounded-full transition-transform hover:scale-110 flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : ''}`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && <Check size={16} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Picker */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Ícone</label>
                  <div className="grid grid-cols-5 gap-3 p-1 max-h-48 overflow-y-auto no-scrollbar">
                    {Object.keys(ICON_MAP).map(iconName => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setSelectedIcon(iconName)}
                          className={`aspect-square rounded-xl flex items-center justify-center transition-all ${selectedIcon === iconName ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 ring-2 ring-indigo-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-transform active:scale-[0.98]"
                  >
                    Salvar Categoria
                  </button>
                </div>

              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default CategorySettings;
