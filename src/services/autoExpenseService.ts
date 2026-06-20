import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  guessCategory,
  ParsedTransaction,
} from '../utils/parseTransaction';

export const STORAGE_KEYS = {
  expenses: 'ss_expenses_v4',
  profile: 'ss_profile_v4',
  processedIds: 'ss_auto_import_ids_v1',
} as const;

export interface AutoImportProfile {
  autoImportEnabled?: boolean;
  smsImportEnabled?: boolean;
  notificationImportEnabled?: boolean;
}

export interface ExpenseRecord {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  type: 'expense' | 'income';
  wallet: string;
}

async function loadExpenses(): Promise<ExpenseRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.expenses);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveExpenses(expenses: ExpenseRecord[]): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.expenses,
    JSON.stringify(expenses)
  );
}

async function loadProcessedIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.processedIds);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function markProcessed(sourceId: string): Promise<void> {
  const ids = await loadProcessedIds();
  if (ids.includes(sourceId)) return;
  const updated = [sourceId, ...ids].slice(0, 500);
  await AsyncStorage.setItem(
    STORAGE_KEYS.processedIds,
    JSON.stringify(updated)
  );
}

export async function loadAutoImportProfile(): Promise<AutoImportProfile> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.profile);
  if (!raw) {
    return {
      autoImportEnabled: false,
      smsImportEnabled: true,
      notificationImportEnabled: true,
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function isAutoImportEnabled(
  source: 'sms' | 'notification'
): Promise<boolean> {
  const profile = await loadAutoImportProfile();

  if (!profile.autoImportEnabled) return false;

  if (source === 'sms') {
    return profile.smsImportEnabled !== false;
  }

  return profile.notificationImportEnabled !== false;
}

export async function importTransactionIfNew(
  parsed: ParsedTransaction,
  sourceId: string,
  source: 'sms' | 'notification'
): Promise<boolean> {
  const enabled = await isAutoImportEnabled(source);
  if (!enabled) return false;

  const processedIds = await loadProcessedIds();
  if (processedIds.includes(sourceId)) return false;

  const expenses = await loadExpenses();

  const duplicate = expenses.some(
    e =>
      e.amount === parsed.amount &&
      e.name === parsed.merchant &&
      e.type === parsed.type &&
      new Date(e.date).toDateString() ===
        new Date(parsed.date).toDateString()
  );

  if (duplicate) {
    await markProcessed(sourceId);
    return false;
  }

  const expense: ExpenseRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: parsed.merchant,
    amount: parsed.amount,
    category: guessCategory(parsed.merchant),
    date: parsed.date,
    note:
      parsed.balance != null
        ? `Auto-import (${source}) · Balance ₹${parsed.balance}`
        : `Auto-import from ${parsed.bank} (${source})`,
    type: parsed.type,
    wallet: 'Bank Account',
  };

  await saveExpenses([expense, ...expenses]);
  await markProcessed(sourceId);
  return true;
}

export async function reloadExpensesFromStorage(): Promise<ExpenseRecord[]> {
  return loadExpenses();
}
