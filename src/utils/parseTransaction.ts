import { Category } from '../context/ExpenseContext';

export interface ParsedTransaction {
  raw: string;
  amount: number;
  balance?: number;
  type: 'expense' | 'income';
  merchant: string;
  bank: string;
  date: string;
}

export const FINANCIAL_APP_PACKAGES = [
  'com.google.android.apps.nbu.paisa.user',
  'com.phonepe.app',
  'net.one97.paytm',
  'com.dreamplug.androidapp',
  'com.mobikwik_new',
  'com.amazon.mShop.android.shopping',
  'in.org.npci.upiapp',
  'com.sbi.lotusintouch',
  'com.csam.icici.bank.imobile',
  'com.snapwork.hdfc',
  'com.axis.mobile',
  'com.kotak811mobilebanking',
];

export function isFinancialApp(appPackage?: string): boolean {
  if (!appPackage) return false;
  const lower = appPackage.toLowerCase();
  return FINANCIAL_APP_PACKAGES.some(pkg => lower.includes(pkg));
}

export function parseTransactionMessage(
  message: string,
  date: string
): ParsedTransaction | null {
  const amountMatch = message.match(
    /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
  );

  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (isNaN(amount) || amount <= 0) return null;

  const balanceMatch = message.match(
    /(?:avail(?:able)?\s*bal(?:ance)?|a\/c\s*bal(?:ance)?|balance)[:\s]*?(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
  );

  const balance = balanceMatch
    ? parseFloat(balanceMatch[1].replace(/,/g, ''))
    : undefined;

  const lower = message.toLowerCase();

  const isCredit = [
    'credited',
    'credit',
    'received',
    'deposited',
    'refund',
    'cashback',
  ].some(k => lower.includes(k));

  const isDebit = [
    'debited',
    'debit',
    'spent',
    'paid',
    'withdrawn',
    'purchase',
    'payment',
    'sent',
  ].some(k => lower.includes(k));

  if (!isCredit && !isDebit) return null;

  const type = isCredit ? 'income' : 'expense';

  let merchant = type === 'expense' ? 'Purchase' : 'Credit Received';

  const merchantMatch = message.match(
    /(?:at|to|from|paid to|sent to)\s+([A-Za-z0-9\s&.'-]{2,30}?)(?:\s+on|\s+for|\.|,|$|\s+via)/i
  );

  if (merchantMatch) {
    merchant = merchantMatch[1].trim();
  }

  let bank = 'Bank';

  const banks = [
    'SBI',
    'HDFC',
    'ICICI',
    'Axis',
    'Kotak',
    'PNB',
    'BOB',
    'Canara',
    'Yes Bank',
    'IndusInd',
    'Paytm',
    'PhonePe',
    'GPay',
    'Google Pay',
  ];

  for (const b of banks) {
    if (lower.includes(b.toLowerCase())) {
      bank = b;
      break;
    }
  }

  return {
    raw: message,
    amount,
    balance,
    type,
    merchant,
    bank,
    date,
  };
}

export function guessCategory(merchant: string): Category {
  const m = merchant.toLowerCase();

  if (/swiggy|zomato|food|pizza|burger|restaurant/.test(m)) {
    return 'Food & Dining';
  }

  if (/ola|uber|rapido|metro|fuel|petrol/.test(m)) {
    return 'Transport';
  }

  if (/amazon|flipkart|myntra/.test(m)) {
    return 'Shopping';
  }

  if (/bill|airtel|jio|recharge/.test(m)) {
    return 'Bills & Utilities';
  }

  if (/hospital|medical|pharmacy/.test(m)) {
    return 'Health';
  }

  return 'Other';
}

export function buildNotificationText(data: {
  title?: string;
  text?: string;
  bigText?: string;
  subText?: string;
}): string {
  return [data.title, data.text, data.bigText, data.subText]
    .filter(Boolean)
    .join(' ');
}
