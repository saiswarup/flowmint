import { Category } from '../context/ExpenseContext';

export interface CategoryMeta {
  label: Category;
  emoji: string;
  color: string;
  bg: string;
}

export const COLORS = {
  bg: '#050D12',
  card: '#0D1B22',
  card2: '#13252E',
  border: '#1E3742',

  text: '#FFFFFF',
  textSub: '#7A9BAA',

  primary: '#00C896',
  secondary: '#00A3FF',
  accent: '#00EDAA',
  yellow: '#FFD93D',
  pink: '#FF6B8A',
  orange: '#FF9F43',
  purple: '#9B5CFF',
};

export const CATEGORIES: CategoryMeta[] = [
  { label: 'Food & Dining',     emoji: '🍔', color: '#FF9F43', bg: '#1A1200' },
  { label: 'Transport',         emoji: '🚗', color: '#00A3FF', bg: '#001A2A' },
  { label: 'Shopping',          emoji: '🛍️', color: '#FF6B8A', bg: '#1A0010' },
  { label: 'Bills & Utilities', emoji: '⚡', color: '#FFD93D', bg: '#1A1600' },
  { label: 'Entertainment',     emoji: '🎬', color: '#00C896', bg: '#001A14' },
  { label: 'Health',            emoji: '💊', color: '#FF6B8A', bg: '#1A0010' },
  { label: 'Education',         emoji: '📚', color: '#00EDAA', bg: '#001A12' },

  { label: 'Rent',              emoji: '🏠', color: '#9B5CFF', bg: '#140A22' },
  { label: 'Groceries',         emoji: '🛒', color: '#00C896', bg: '#001A14' },
  { label: 'Fuel',              emoji: '⛽', color: '#FF9F43', bg: '#1A1200' },
  { label: 'Mobile Recharge',   emoji: '📱', color: '#00A3FF', bg: '#001A2A' },
  { label: 'Internet',          emoji: '🌐', color: '#00EDAA', bg: '#001A12' },
  { label: 'Electricity',       emoji: '💡', color: '#FFD93D', bg: '#1A1600' },
  { label: 'Water Bill',        emoji: '🚰', color: '#00A3FF', bg: '#001A2A' },
  { label: 'Gas',               emoji: '🔥', color: '#FF6B8A', bg: '#1A0010' },

  { label: 'Salary',            emoji: '💼', color: '#00C896', bg: '#001A14' },
  { label: 'Freelance',         emoji: '💻', color: '#9B5CFF', bg: '#140A22' },
  { label: 'Business',          emoji: '🏢', color: '#00EDAA', bg: '#001A12' },

  { label: 'Savings',           emoji: '🏦', color: '#00C896', bg: '#001A14' },
  { label: 'Investment',        emoji: '📈', color: '#FFD93D', bg: '#1A1600' },
  { label: 'Insurance',         emoji: '🛡️', color: '#00A3FF', bg: '#001A2A' },

  { label: 'Travel',            emoji: '✈️', color: '#FF9F43', bg: '#1A1200' },
  { label: 'Subscription',      emoji: '📺', color: '#FF6B8A', bg: '#1A0010' },
  { label: 'Gym',               emoji: '🏋️', color: '#00EDAA', bg: '#001A12' },
  { label: 'Pet Care',          emoji: '🐶', color: '#FF9F43', bg: '#1A1200' },
  { label: 'Kids',              emoji: '🧸', color: '#9B5CFF', bg: '#140A22' },
  { label: 'Gifts',             emoji: '🎁', color: '#FF6B8A', bg: '#1A0010' },
  { label: 'Charity',           emoji: '❤️', color: '#FF6B8A', bg: '#1A0010' },

  { label: 'Other',             emoji: '📦', color: '#7A9BAA', bg: '#0D1F26' },
];

export const getCategoryMeta = (cat: string): CategoryMeta =>
  CATEGORIES.find(c => c.label === cat) || CATEGORIES[CATEGORIES.length - 1];

export const formatCurrency = (amount: number, symbol = '₹'): string =>
  `${symbol}${amount.toLocaleString('en-IN')}`;

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
