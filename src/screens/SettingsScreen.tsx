import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
  PermissionsAndroid,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import RNAndroidNotificationListener from 'react-native-android-notification-listener';
import { useExpenses } from '../context/ExpenseContext';
import { COLORS, SPACING, FONT, RADIUS, rs, ms, clamp } from '../utils/responsive';
import { scanAndImportSms } from '../services/smsImportService';
import Constants from 'expo-constants';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const {
    state,
    updateProfile,
    formatAmount,
    clearAllExpenses,
    reloadExpenses,
  } = useExpenses();
  const { profile, expenses } = state;
  const [budgetInput, setBudgetInput] = useState(profile.monthlyBudget.toString());
  const [notifications, setNotifications] = useState(profile.notificationsEnabled);
  const [autoImport, setAutoImport] = useState(profile.autoImportEnabled);
  const [smsImport, setSmsImport] = useState(profile.smsImportEnabled);
  const [notificationImport, setNotificationImport] = useState(
    profile.notificationImportEnabled
  );
  const [notificationStatus, setNotificationStatus] = useState('unknown');
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAutoImport(profile.autoImportEnabled);
    setSmsImport(profile.smsImportEnabled);
    setNotificationImport(profile.notificationImportEnabled);
    setNotifications(profile.notificationsEnabled);
  }, [
    profile.autoImportEnabled,
    profile.smsImportEnabled,
    profile.notificationImportEnabled,
    profile.notificationsEnabled,
  ]);

  const refreshNotificationStatus = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    try {
      const status = await RNAndroidNotificationListener.getPermissionStatus();
      setNotificationStatus(status);
    } catch {
      setNotificationStatus('unknown');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshNotificationStatus();
    }, [refreshNotificationStatus])
  );

  const requestSmsPermission = async () => {
    if (busy) return;

    if (Platform.OS !== 'android') {
      Alert.alert('Android only', 'SMS import works on Android devices.');
      return;
    }

    setBusy(true);
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Success', 'SMS permission granted.');
      } else {
        Alert.alert('Permission denied', 'Enable SMS access in app settings.');
      }
    } catch {
      Alert.alert('Error', 'Could not request SMS permission.');
    } finally {
      setBusy(false);
    }
  };

  const requestNotificationAccess = async () => {
    if (busy) return;

    if (Platform.OS !== 'android') {
      Alert.alert('Android only', 'Notification access works on Android devices.');
      return;
    }

    setBusy(true);
    try {
      RNAndroidNotificationListener.requestPermission();
    } catch {
      Alert.alert('Error', 'Could not open notification settings.');
    } finally {
      setTimeout(() => {
        refreshNotificationStatus();
        setBusy(false);
      }, 500);
    }
  };

  const handleScanSmsNow = async () => {
    if (Platform.OS !== 'android' || scanning || busy) return;

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );

    if (!hasPermission) {
      Alert.alert(
        'SMS permission needed',
        'Tap "Allow SMS access" first, then try again.'
      );
      return;
    }

    setScanning(true);
    setBusy(true);

    InteractionManager.runAfterInteractions(async () => {
      try {
        const imported = await scanAndImportSms(50);
        await reloadExpenses();
        Alert.alert(
          'SMS scan complete',
          imported > 0
            ? `${imported} new transaction${imported === 1 ? '' : 's'} added.`
            : 'No new transactions found.'
        );
      } catch {
        Alert.alert('Scan failed', 'Could not read SMS. Check permissions.');
      } finally {
        setScanning(false);
        setBusy(false);
      }
    });
  };

  const statusLabel =
    notificationStatus === 'authorized'
      ? 'Granted'
      : notificationStatus === 'denied'
        ? 'Denied'
        : 'Not set';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.mintBadge}>
          <Text style={styles.mintBadgeText}>🌿 FlowMint</Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: rs(100) }}
        scrollEnabled={!scanning}
      >
        {(scanning || busy) && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {scanning ? 'Scanning SMS…' : 'Please wait…'}
            </Text>
          </View>
        )}
        <Text style={styles.groupLabel}>PROFILE</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile.name || 'F').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile.name || 'Set your name'}</Text>
              <Text style={styles.profileSub}>FlowMint Member 🌿</Text>
            </View>
          </View>
        </View>

        <Text style={styles.groupLabel}>AUTO EXPENSE TRACKING</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Auto-import expenses</Text>
              <Text style={styles.rowSub}>
                Add spending from bank SMS and UPI notifications
              </Text>
            </View>
            <Switch
              value={autoImport}
              onValueChange={v => {
                setAutoImport(v);
                updateProfile({ autoImportEnabled: v });
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#000"
            />
          </View>
          <View style={styles.sep} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Import from SMS</Text>
              <Text style={styles.rowSub}>Bank debit/credit messages</Text>
            </View>
            <Switch
              value={smsImport}
              onValueChange={v => {
                setSmsImport(v);
                updateProfile({ smsImportEnabled: v });
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#000"
              disabled={!autoImport}
            />
          </View>
          <View style={styles.sep} />
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Import from notifications</Text>
              <Text style={styles.rowSub}>GPay, PhonePe, Paytm alerts</Text>
            </View>
            <Switch
              value={notificationImport}
              onValueChange={v => {
                setNotificationImport(v);
                updateProfile({ notificationImportEnabled: v });
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#000"
              disabled={!autoImport}
            />
          </View>
          <View style={styles.sep} />
          <TouchableOpacity
            style={styles.row}
            onPress={requestSmsPermission}
            disabled={busy || scanning}
          >
            <Text style={styles.rowLabel}>Allow SMS access</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.sep} />
          <TouchableOpacity
            style={styles.row}
            onPress={requestNotificationAccess}
            disabled={busy || scanning}
          >
            <View>
              <Text style={styles.rowLabel}>Allow notification access</Text>
              <Text style={styles.rowSub}>Status: {statusLabel}</Text>
            </View>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.sep} />
          <TouchableOpacity
            style={styles.row}
            onPress={handleScanSmsNow}
            disabled={scanning || busy}
          >
            <Text style={styles.rowLabel}>
              {scanning ? 'Scanning SMS…' : 'Scan SMS now'}
            </Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.sep} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              if (busy || scanning) return;
              navigation.navigate('SMSImport');
            }}
            disabled={busy || scanning}
          >
            <Text style={styles.rowLabel}>Review SMS imports</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.groupLabel}>BUDGET</Text>
        <View style={styles.card}>
          <Text style={styles.rowLabel}>Monthly budget</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.sym}>{profile.currencySymbol}</Text>
            <TextInput
              style={styles.budgetInput}
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSub}
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => {
                const val = parseInt(budgetInput, 10);
                if (!isNaN(val) && val > 0) {
                  updateProfile({ monthlyBudget: val });
                  Alert.alert('Saved', `Budget updated to ${formatAmount(val)}`);
                }
              }}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.groupLabel}>CURRENCY</Text>
        <View style={styles.card}>
          {CURRENCIES.map(c => (
            <TouchableOpacity
              key={c.code}
              style={[
                styles.currencyRow,
                profile.currency === c.code && styles.currencyRowActive,
              ]}
              onPress={() =>
                updateProfile({ currency: c.code, currencySymbol: c.symbol })
              }
            >
              <Text style={styles.currencySymText}>{c.symbol}</Text>
              <Text style={styles.currencyLabel}>{c.label}</Text>
              {profile.currency === c.code && (
                <Text style={{ color: COLORS.primary, fontSize: FONT.lg, fontWeight: '800' }}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.groupLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Daily reminder</Text>
              <Text style={styles.rowSub}>Reminder at 9:00 PM every day</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={v => {
                setNotifications(v);
                updateProfile({ notificationsEnabled: v });
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#000"
            />
          </View>
        </View>

        <Text style={styles.groupLabel}>DATA</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total transactions</Text>
            <Text style={styles.rowVal}>{expenses.length}</Text>
          </View>
          <View style={styles.sep} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => Alert.alert('Export', 'CSV export coming soon!')}
          >
            <Text style={styles.rowLabel}>📤  Export to CSV</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.sep} />
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              Alert.alert(
                'Clear All Data',
                'This will permanently delete all expenses, income, savings, and trading history.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                      clearAllExpenses();
                      Alert.alert('Success', 'All app data cleared successfully.');
                    },
                  },
                ]
              )
            }
          >
            <Text style={[styles.rowLabel, { color: COLORS.pink }]}>🗑 Clear all data</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.groupLabel}>APP</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App name</Text>
            <Text style={[styles.rowVal, { color: COLORS.primary }]}>FlowMint 🌿</Text>
          </View>
          <View style={styles.sep} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowVal}>1.0.0</Text>
          </View>
          <View style={styles.sep} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Built with ❤️</Text>
            <Text style={styles.rowVal}>Expo + React Native</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: Constants.statusBarHeight + rs(10),
    paddingBottom: SPACING.sm,
  },
  headerTitle: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text },
  mintBadge: {
    backgroundColor: COLORS.primary + '18',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  mintBadgeText: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: '600' },
  groupLabel: {
    fontSize: FONT.xs,
    fontWeight: '700',
    color: COLORS.textSub,
    letterSpacing: 0.8,
    marginBottom: rs(6),
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  avatar: {
    width: clamp(rs(50), 42, 60),
    height: clamp(rs(50), 42, 60),
    borderRadius: clamp(rs(25), 21, 30),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FONT.xxl, fontWeight: '800', color: '#000' },
  profileName: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text },
  profileSub: { fontSize: FONT.xs, color: COLORS.textSub, marginTop: rs(2) },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  rowLabel: { fontSize: FONT.md, fontWeight: '500', color: COLORS.text },
  rowVal: { fontSize: FONT.md, color: COLORS.textSub },
  rowSub: { fontSize: FONT.xs, color: COLORS.textSub, marginTop: rs(2) },
  rowArrow: { fontSize: FONT.xl, color: COLORS.textSub },
  sep: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  sym: { fontSize: FONT.xl, color: COLORS.primary, fontWeight: '800' },
  budgetInput: {
    flex: 1,
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONT.lg,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  saveBtnText: { fontSize: FONT.sm, color: '#000', fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currencyRowActive: { backgroundColor: COLORS.primary + '18' },
  currencySymText: {
    fontSize: FONT.lg,
    fontWeight: '800',
    color: COLORS.text,
    width: rs(32),
    textAlign: 'center',
  },
  currencyLabel: { flex: 1, fontSize: FONT.md, color: COLORS.text },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: {
    color: COLORS.textSub,
    fontSize: FONT.sm,
  },
});
