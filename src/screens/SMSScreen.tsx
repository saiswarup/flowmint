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
import { useExpenses } from '../context/ExpenseContext';
import {
  guessCategory,
  parseTransactionMessage,
  ParsedTransaction,
} from '../utils/parseTransaction';
import { COLORS, FONT, RADIUS } from '../utils/responsive';

interface ParsedSMS extends ParsedTransaction {
  id: string;
  added: boolean;
}

export default function SMSScreen() {
  const { addExpense, reloadExpenses } = useExpenses();
  const [messages, setMessages] = useState<ParsedSMS[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  const readSMS = () => {
    SmsAndroid.list(
      JSON.stringify({
        box: 'inbox',
        maxCount: 100,
      }),
      (fail: unknown) => {
        console.log('Failed:', fail);
      },
      (_count: number, smsList: string) => {
        const arr = JSON.parse(smsList);

        const parsed = arr
          .map((sms: { _id: string; body: string; date: string }) => {
            const result = parseTransactionMessage(
              sms.body,
              new Date(Number(sms.date)).toISOString()
            );

            if (!result) return null;

            return {
              ...result,
              id: sms._id,
              added: false,
            };
          })
          .filter(Boolean);

        setMessages(parsed);
      }
    );
  };

  const requestPermission = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Android Only', 'SMS reading works only on Android');
      return;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      setHasPermission(true);
      Alert.alert('Success', 'SMS permission granted');
      readSMS();
    }
  };

  const handleAdd = (msg: ParsedSMS) => {
    addExpense({
      name: msg.merchant,
      amount: msg.amount,
      category: guessCategory(msg.merchant),
      date: msg.date,
      note: `Balance: ₹${msg.balance ?? 'N/A'}`,
      type: msg.type,
      wallet: 'Bank Account',
    });

    setMessages(prev =>
      prev.map(m => (m.id === msg.id ? { ...m, added: true } : m))
    );
  };

  const handleAddAll = async () => {
    const pending = messages.filter(m => !m.added);

    pending.forEach(msg => {
      addExpense({
        name: msg.merchant,
        amount: msg.amount,
        category: guessCategory(msg.merchant),
        date: msg.date,
        note: `Balance: ₹${msg.balance ?? 'N/A'}`,
        type: msg.type,
        wallet: 'Bank Account',
      });
    });

    await reloadExpenses();

    setMessages(prev =>
      prev.map(m => ({
        ...m,
        added: true,
      }))
    );
  };

  const pending = messages.filter(m => !m.added);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.header}>SMS Import</Text>
      <Text style={styles.subHeader}>
        Review bank SMS and add them as expenses manually.
      </Text>

      {!hasPermission && (
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Allow SMS Access</Text>
        </TouchableOpacity>
      )}

      {hasPermission && (
        <TouchableOpacity style={styles.refreshBtn} onPress={readSMS}>
          <Text style={styles.btnText}>Refresh SMS</Text>
        </TouchableOpacity>
      )}

      {pending.length > 0 && (
        <TouchableOpacity style={styles.addAllBtn} onPress={handleAddAll}>
          <Text style={styles.btnText}>Add All ({pending.length})</Text>
        </TouchableOpacity>
      )}

      <ScrollView>
        {messages.map(msg => (
          <View key={msg.id} style={styles.card}>
            <Text style={styles.title}>{msg.merchant}</Text>
            <Text style={styles.amount}>₹{msg.amount}</Text>
            <Text style={styles.meta}>
              {msg.type === 'expense' ? 'Debit' : 'Credit'} · {msg.bank}
            </Text>
            <Text style={styles.meta}>Balance: ₹{msg.balance ?? 'N/A'}</Text>

            {!msg.added ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(msg)}>
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.addedLabel}>Added</Text>
            )}
          </View>
        ))}

        {hasPermission && messages.length === 0 && (
          <Text style={styles.empty}>No bank SMS found in recent messages.</Text>
        )}
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
    marginBottom: 8,
  },
  subHeader: {
    fontSize: FONT.sm,
    color: COLORS.textSub,
    marginBottom: 20,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
  },
  refreshBtn: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  amount: {
    fontSize: FONT.xl,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  meta: {
    fontSize: FONT.sm,
    color: COLORS.textSub,
    marginTop: 2,
  },
  addedLabel: {
    marginTop: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  empty: {
    color: COLORS.textSub,
    textAlign: 'center',
    marginTop: 40,
  },
});
