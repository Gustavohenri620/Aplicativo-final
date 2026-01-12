
import React from 'react';
import { Category } from './types';
import { 
  Home, Utensils, Car, HeartPulse, GraduationCap, 
  Gamepad2, Banknote, TrendingUp, MoreHorizontal,
  ShoppingBag, Coffee, Wifi, Phone, Gift,
  Briefcase, Music, Plane, Wrench, Zap, Shield
} from 'lucide-react';

// IDs temporários que serão substituídos pelos UUIDs do Supabase assim que carregados
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Moradia', icon: 'Home', color: '#3b82f6' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Alimentação', icon: 'Utensils', color: '#ef4444' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Transporte', icon: 'Car', color: '#10b981' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Saúde', icon: 'HeartPulse', color: '#ec4899' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Educação', icon: 'GraduationCap', color: '#8b5cf6' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Lazer', icon: 'Gamepad2', color: '#f59e0b' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Salário', icon: 'Banknote', color: '#22c55e' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Investimentos', icon: 'TrendingUp', color: '#0ea5e9' },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Outros', icon: 'MoreHorizontal', color: '#64748b' },
];

export const PAYMENT_METHODS = [
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Pix',
  'Boleto',
  'Transferência',
];

export const AVAILABLE_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#ec4899', '#8b5cf6', '#f59e0b',
  '#22c55e', '#0ea5e9', '#64748b', '#f97316', '#14b8a6', '#6366f1',
];

export const ICON_MAP: Record<string, React.ElementType> = {
  Home, Utensils, Car, HeartPulse, GraduationCap, 
  Gamepad2, Banknote, TrendingUp, MoreHorizontal,
  ShoppingBag, Coffee, Wifi, Phone, Gift,
  Briefcase, Music, Plane, Wrench, Zap, Shield
};
