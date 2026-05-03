import { Category } from '../context/ExpenseContext';

export interface CategoryMeta {
  label: Category;
  emoji: string;
  color: string;
  bg: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { label: 'Food & Dining',     emoji: '🍔', color: '#FF9F43', bg: '#1A1200' },
  { label: 'Transport',         emoji: '🚗', color: '#00A3FF', bg: '#001A2A' },
  { label: 'Shopping',          emoji: '🛍️', color: '#FF6B8A', bg: '#1A0010' },
  { label: 'Bills & Utilities', emoji: '⚡', color: '#FFD93D', bg: '#1A1600' },
  { label: 'Entertainment',     emoji: '🎬', color: '#00C896', bg: '#001A14' },
  { label: 'Health',            emoji: '💊', color: '#FF6B8A', bg: '#1A0010' },
  { label: 'Education',         emoji: '📚', color: '#00EDAA', bg: '#001A12' },
  { label: 'Other',             emoji: '📦', color: '#7A9BAA', bg: '#0D1F26' },
];

export const getCategoryMeta = (cat: string): CategoryMeta =>
  CATEGORIES.find(c => c.label === cat) || CATEGORIES[7];

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
