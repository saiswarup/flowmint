import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { useExpenses, Category } from '../context/ExpenseContext';
import {
  COLORS,
  SPACING,
  FONT,
  RADIUS,
  rs,
  ms,
} from '../utils/responsive';

interface ParsedSMS {
  id: string;
  raw: string;
  amount: number;
  balance?: number;
  type: 'expense' | 'income';
  merchant: string;
  bank: string;
  date: string;
  added: boolean;
}

function parseSMS(message: string, date: string): ParsedSMS | null {
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
  ].some(k => lower.includes(k));

  if (!isCredit && !isDebit) return null;

  const type = isCredit ? 'income' : 'expense';

  let merchant =
    type === 'expense' ? 'Purchase' : 'Credit Received';

  const merchantMatch = message.match(
    /(?:at|to|from)\s+([A-Z][A-Za-z0-9\s&]{2,20}?)(?:\s+on|\s+for|\.|,|$)/i
  );

  if (merchantMatch)
    merchant = merchantMatch[1].trim();

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
  ];

  for (const b of banks) {
    if (lower.includes(b.toLowerCase())) {
      bank = b;
      break;
    }
  }

  return {
    id: Date.now().toString() + Math.random(),
    raw: message,
    amount,
    balance,
    type,
    merchant,
    bank,
    date,
    added: false,
  };
}

function guessCategory(merchant: string): Category {
  const m = merchant.toLowerCase();

  if (/swiggy|zomato|food|pizza|burger/.test(m))
    return 'Food & Dining';

  if (/ola|uber|rapido|metro|fuel/.test(m))
    return 'Transport';

  if (/amazon|flipkart|myntra/.test(m))
    return 'Shopping';

  if (/bill|airtel|jio/.test(m))
    return 'Bills & Utilities';

  if (/hospital|medical/.test(m))
    return 'Health';

  return 'Other';
}

export default function SMSScreen() {
  const { addExpense } = useExpenses();

  const [messages, setMessages] = useState<ParsedSMS[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  const readSMS = () => {
    SmsAndroid.list(
      JSON.stringify({
        box: 'inbox',
        maxCount: 100,
      }),
      (fail: any) => {
        console.log('Failed:', fail);
      },
      (count: number, smsList: string) => {
        const arr = JSON.parse(smsList);

        const parsed = arr
          .map((sms: any) =>
            parseSMS(sms.body, new Date(Number(sms.date)).toISOString())
          )
          .filter(Boolean);

        setMessages(parsed);
      }
    );
  };

  const requestPermission = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Android Only',
        'SMS reading works only on Android'
      );
      return;
    }

    const granted =
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );

    if (
      granted ===
      PermissionsAndroid.RESULTS.GRANTED
    ) {
      setHasPermission(true);

      Alert.alert(
        'Success',
        'SMS permission granted'
      );

      readSMS();
    }
  };

  const handleAdd = (msg: ParsedSMS) => {
    addExpense({
      name: msg.merchant,
      amount: msg.amount,
      category: guessCategory(msg.merchant),
      date: msg.date,
      note: `Balance: ₹${msg.balance || 'N/A'}`,
      type: msg.type,
      wallet: 'Bank Account',
    });

    setMessages(prev =>
      prev.map(m =>
        m.id === msg.id
          ? { ...m, added: true }
          : m
      )
    );
  };

  const handleAddAll = () => {
    const pending =
      messages.filter(m => !m.added);

    pending.forEach(msg => {
      addExpense({
        name: msg.merchant,
        amount: msg.amount,
        category: guessCategory(msg.merchant),
        date: msg.date,
        note: `Balance: ₹${msg.balance || 'N/A'}`,
        type: msg.type,
        wallet: 'Bank Account',
      });
    });

    setMessages(prev =>
      prev.map(m => ({
        ...m,
        added: true,
      }))
    );
  };

  const pending =
    messages.filter(m => !m.added);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.header}>
        SMS Import
      </Text>

      {!hasPermission && (
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.btnText}>
            Allow SMS Access
          </Text>
        </TouchableOpacity>
      )}

      {pending.length > 0 && (
        <TouchableOpacity
          style={styles.addAllBtn}
          onPress={handleAddAll}
        >
          <Text style={styles.btnText}>
            Add All ({pending.length})
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={styles.card}
          >
            <Text style={styles.title}>
              {msg.merchant}
            </Text>

            <Text>
              ₹{msg.amount}
            </Text>

            <Text>
              Balance: ₹
              {msg.balance || 'N/A'}
            </Text>

            <Text>{msg.bank}</Text>

            {!msg.added && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() =>
                  handleAdd(msg)
                }
              >
                <Text style={styles.btnText}>
                  Add
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },

  header: {
    fontSize: FONT.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 20,
  },

  permissionBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: RADIUS.lg,
    marginBottom: 20,
  },

  addAllBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: RADIUS.lg,
    marginBottom: 20,
  },

  addBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: RADIUS.md,
  },

  btnText: {
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: RADIUS.lg,
    marginBottom: 15,
  },

  title: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
});