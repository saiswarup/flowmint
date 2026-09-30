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

interface ImportItem {
  parsed: ParsedTransaction;
  sourceId: string;
  source: 'sms' | 'notification';
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

async function saveProcessedIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.processedIds,
    JSON.stringify(ids.slice(0, 500))
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

function isDuplicateExpense(
  expenses: ExpenseRecord[],
  parsed: ParsedTransaction
): boolean {
  return expenses.some(
    e =>
      e.amount === parsed.amount &&
      e.name === parsed.merchant &&
      e.type === parsed.type &&
      new Date(e.date).toDateString() ===
        new Date(parsed.date).toDateString()
  );
}

function createExpenseRecord(
  parsed: ParsedTransaction,
  source: 'sms' | 'notification'
): ExpenseRecord {
  return {
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
}

export async function batchImportTransactions(
  items: ImportItem[]
): Promise<number> {
  if (items.length === 0) return 0;

  const profile = await loadAutoImportProfile();
  if (!profile.autoImportEnabled) return 0;

  const processedSet = new Set(await loadProcessedIds());
  let expenses = await loadExpenses();
  let imported = 0;

  for (const { parsed, sourceId, source } of items) {
    if (source === 'sms' && profile.smsImportEnabled === false) continue;
    if (source === 'notification' && profile.notificationImportEnabled === false) {
      continue;
    }

    if (processedSet.has(sourceId)) continue;

    if (isDuplicateExpense(expenses, parsed)) {
      processedSet.add(sourceId);
      continue;
    }

    expenses = [createExpenseRecord(parsed, source), ...expenses];
    processedSet.add(sourceId);
    imported += 1;
  }

  if (imported > 0) {
    await saveExpenses(expenses);
  }

  await saveProcessedIds([...processedSet]);

  return imported;
}

export async function importTransactionIfNew(
  parsed: ParsedTransaction,
  sourceId: string,
  source: 'sms' | 'notification'
): Promise<boolean> {
  const imported = await batchImportTransactions([
    { parsed, sourceId, source },
  ]);
  return imported > 0;
}

export async function reloadExpensesFromStorage(): Promise<ExpenseRecord[]> {
  return loadExpenses();
}
