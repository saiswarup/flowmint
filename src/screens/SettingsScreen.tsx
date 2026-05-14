import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { COLORS, SPACING, FONT, RADIUS, rs, ms, sh, clamp } from '../utils/responsive';
import Constants from 'expo-constants';


const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

export default function SettingsScreen() {
  const {
    state,
    updateProfile,
    formatAmount,
    clearAllExpenses,
  } = useExpenses();
  const { profile, expenses } = state;
  const [budgetInput, setBudgetInput] = useState(profile.monthlyBudget.toString());
  const [notifications, setNotifications] = useState(profile.notificationsEnabled);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.mintBadge}><Text style={styles.mintBadgeText}>🌿 FlowMint</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rs(100) }}>

        {/* Profile */}
        <Text style={styles.groupLabel}>PROFILE</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(profile.name || 'F').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile.name || 'Set your name'}</Text>
              <Text style={styles.profileSub}>FlowMint Member 🌿</Text>
            </View>
          </View>
        </View>

        {/* Budget */}
        <Text style={styles.groupLabel}>BUDGET</Text>
        <View style={styles.card}>
          <Text style={styles.rowLabel}>Monthly budget</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.sym}>{profile.currencySymbol}</Text>
            <TextInput style={styles.budgetInput} value={budgetInput} onChangeText={setBudgetInput} keyboardType="numeric" placeholderTextColor={COLORS.textSub} />
            <TouchableOpacity style={styles.saveBtn} onPress={() => {
              const val = parseInt(budgetInput);
              if (!isNaN(val) && val > 0) { updateProfile({ monthlyBudget: val }); Alert.alert('✅ Saved', `Budget updated to ${formatAmount(val)}`); }
            }}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency */}
        <Text style={styles.groupLabel}>CURRENCY</Text>
        <View style={styles.card}>
          {CURRENCIES.map(c => (
            <TouchableOpacity key={c.code} style={[styles.currencyRow, profile.currency === c.code && styles.currencyRowActive]} onPress={() => updateProfile({ currency: c.code, currencySymbol: c.symbol })}>
              <Text style={styles.currencySymText}>{c.symbol}</Text>
              <Text style={styles.currencyLabel}>{c.label}</Text>
              {profile.currency === c.code && <Text style={{ color: COLORS.primary, fontSize: FONT.lg, fontWeight: '800' }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications */}
        <Text style={styles.groupLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Daily reminder</Text>
              <Text style={styles.rowSub}>Reminder at 9:00 PM every day</Text>
            </View>
            <Switch value={notifications} onValueChange={v => { setNotifications(v); updateProfile({ notificationsEnabled: v }); }} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor="#000" />
          </View>
        </View>

        {/* Data */}
        <Text style={styles.groupLabel}>DATA</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total transactions</Text>
            <Text style={styles.rowVal}>{expenses.length}</Text>
          </View>
          <View style={styles.sep} />
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Export', 'CSV export coming soon!')}>
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearAllExpenses();

            Alert.alert(
              '✅ Success',
              'All app data cleared successfully.'
            );
          },
        },
      ]
    )
  }
>
  <Text
    style={[
      styles.rowLabel,
      { color: COLORS.pink },
    ]}
  >
    🗑 Clear all data
  </Text>
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
  header: {  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl,paddingTop: Constants.statusBarHeight + rs(10),paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text },
  mintBadge: { backgroundColor: COLORS.primary + '18', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: rs(20), borderWidth: 1, borderColor: COLORS.primary + '30' },
  mintBadgeText: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: '600' },
  groupLabel: { fontSize: FONT.xs, fontWeight: '700', color: COLORS.textSub, letterSpacing: 0.8, marginBottom: rs(6), marginTop: SPACING.lg, paddingHorizontal: SPACING.xl },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, marginHorizontal: SPACING.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg },
  avatar: { width: clamp(rs(50), 42, 60), height: clamp(rs(50), 42, 60), borderRadius: clamp(rs(25), 21, 30), backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FONT.xxl, fontWeight: '800', color: '#000' },
  profileName: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text },
  profileSub: { fontSize: FONT.xs, color: COLORS.textSub, marginTop: rs(2) },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  rowLabel: { fontSize: FONT.md, fontWeight: '500', color: COLORS.text },
  rowVal: { fontSize: FONT.md, color: COLORS.textSub },
  rowSub: { fontSize: FONT.xs, color: COLORS.textSub, marginTop: rs(2) },
  rowArrow: { fontSize: FONT.xl, color: COLORS.textSub },
  sep: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  sym: { fontSize: FONT.xl, color: COLORS.primary, fontWeight: '800' },
  budgetInput: { flex: 1, backgroundColor: COLORS.card2, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: FONT.lg, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  saveBtnText: { fontSize: FONT.sm, color: '#000', fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  currencyRowActive: { backgroundColor: COLORS.primary + '18' },
  currencySymText: { fontSize: FONT.lg, fontWeight: '800', color: COLORS.text, width: rs(32), textAlign: 'center' },
  currencyLabel: { flex: 1, fontSize: FONT.md, color: COLORS.text },
});
