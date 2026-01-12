
export type TransactionType = 'INCOME' | 'EXPENSE';
export type ExpenseType = 'FIXED' | 'VARIABLE';
export type IncomeType = 'SALARY' | 'EXTRA';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
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
}
