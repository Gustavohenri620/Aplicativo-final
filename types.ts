
export type TransactionType = 'INCOME' | 'EXPENSE';
export type ExpenseType = 'FIXED' | 'VARIABLE';
export type IncomeType = 'SALARY' | 'EXTRA';
// Added missing TransactionStatus type
export type TransactionStatus = 'PENDING' | 'COMPLETED';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  user_id?: string | null;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  type: TransactionType;
  expense_type?: ExpenseType;
  income_type?: IncomeType;
  payment_method?: string;
  recurring: boolean;
  user_id: string;
  // Added optional status field to Transaction
  status?: TransactionStatus;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  user_id: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  financial_goal?: string;
  // Added missing fields used in components
  xp?: number;
  whatsapp_number?: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  completed: boolean;
  type: 'TASK' | 'WORKOUT';
  category?: string;
  user_id: string;
  created_at: string;
}
