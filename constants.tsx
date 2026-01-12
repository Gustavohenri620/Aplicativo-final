import React from 'react';
import { Category } from './types';
import { 
  Home, Utensils, Car, HeartPulse, GraduationCap, 
  Gamepad2, Banknote, TrendingUp, MoreHorizontal,
  ShoppingBag, Coffee, Wifi, Phone, Gift,
  Briefcase, Music, Plane, Wrench, Zap, Shield
} from 'lucide-react';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Moradia', icon: 'Home', color: '#3b82f6' },
  { id: '2', name: 'Alimentação', icon: 'Utensils', color: '#ef4444' },
  { id: '3', name: 'Transporte', icon: 'Car', color: '#10b981' },
  { id: '4', name: 'Saúde', icon: 'HeartPulse', color: '#ec4899' },
  { id: '5', name: 'Educação', icon: 'GraduationCap', color: '#8b5cf6' },
  { id: '6', name: 'Lazer', icon: 'Gamepad2', color: '#f59e0b' },
  { id: '7', name: 'Salário', icon: 'Banknote', color: '#22c55e' },
  { id: '8', name: 'Investimentos', icon: 'TrendingUp', color: '#0ea5e9' },
  { id: '9', name: 'Outros', icon: 'MoreHorizontal', color: '#64748b' },
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
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#0ea5e9', // Sky
  '#64748b', // Slate
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];

export const ICON_MAP: Record<string, React.ElementType> = {
  Home, Utensils, Car, HeartPulse, GraduationCap, 
  Gamepad2, Banknote, TrendingUp, MoreHorizontal,
  ShoppingBag, Coffee, Wifi, Phone, Gift,
  Briefcase, Music, Plane, Wrench, Zap, Shield
};