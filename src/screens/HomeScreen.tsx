import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useExpenses, Expense } from '../context/ExpenseContext';
import { COLORS, formatTime, getCategoryMeta } from '../utils/categories';
import { SPACING, FONT, RADIUS, SCREEN, rs, ms, sw, sh, clamp, ICON } from '../utils/responsive';
import AddExpenseModal from '../components/AddExpenseModal';
import Constants from 'expo-constants';


export default function HomeScreen() {
  const { state, getMonthExpenses, getMonthIncome, deleteExpense, formatAmount } = useExpenses();
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'expense' | 'income'>('expense');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const totalBalance = state.wallets.reduce((s, w) => s + w.balance, 0);
  const monthExp = getMonthExpenses();
  const monthInc = getMonthIncome();
  const recentExp = state.expenses.slice(0, 8);
  const userName = state.profile.name || 'Friend';
  const budgetPct = Math.min((monthExp / state.profile.monthlyBudget) * 100, 100);
  const savings = Math.max(0, (monthInc || 78500) - (monthExp || 0));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting} numberOfLines={1}>Hey, {userName} 👋</Text>
            <Text style={styles.greetingSub}>Your money is flowing smart</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(userName.charAt(0) || 'F').toUpperCase()}</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balCard}>
          {/* Mint glow */}
          <View style={styles.glowCircle} />
          <Text style={styles.balLabel}>Total Balance</Text>
          <Text style={styles.balAmount} adjustsFontSizeToFit numberOfLines={1}>{formatAmount(totalBalance)}</Text>
          <View style={styles.changeRow}>
            <View style={styles.changeBadge}><Text style={styles.changeBadgeText}>↑ +12.5%</Text></View>
            <Text style={styles.changeLabel}>vs last month</Text>
          </View>

          {/* Flow bar chart */}
          <View style={styles.sparkline}>
            {[20, 45, 35, 60, 50, 72, 58, 80, 68, 90].map((h, i) => (
              <View key={i} style={styles.sparkBarWrap}>
                <View style={[styles.sparkBar, {
                  height: `${h}%`,
                  backgroundColor: h > 70 ? COLORS.accent : COLORS.primary,
                }]} />
              </View>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: '↑', label: 'Income', amount: formatAmount(monthInc || 78500), color: COLORS.primary, bg: COLORS.primary + '18' },
              { icon: '↓', label: 'Expense', amount: formatAmount(monthExp || 29750), color: COLORS.pink, bg: COLORS.pink + '18' },
              { icon: '🌿', label: 'Savings', amount: formatAmount(savings || 48750), color: COLORS.accent, bg: COLORS.accent + '18' },
            ].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                    <Text style={{ fontSize: FONT.sm, color: item.color }}>{item.icon}</Text>
                  </View>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={[styles.statAmt, { color: item.color }]} numberOfLines={1} adjustsFontSizeToFit>{item.amount}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Budget bar */}
          <View style={styles.budgetWrap}>
            <View style={styles.budgetLabels}>
              <Text style={styles.budgetLabel}>Monthly Budget Flow</Text>
              <Text style={[styles.budgetPct, { color: budgetPct > 85 ? COLORS.pink : COLORS.primary }]}>{Math.round(budgetPct)}%</Text>
            </View>
            <View style={styles.budgetBg}>
              <View style={[styles.budgetFill, {
                width: `${budgetPct}%`,
                backgroundColor: budgetPct > 85 ? COLORS.pink : budgetPct > 60 ? COLORS.orange : COLORS.primary,
              }]} />
            </View>
          </View>
        </View>

        {/* Budget alert */}
        {budgetPct > 80 && (
          <View style={[styles.alertBanner, { backgroundColor: budgetPct > 95 ? COLORS.pink + '18' : COLORS.orange + '18', borderColor: budgetPct > 95 ? COLORS.pink + '40' : COLORS.orange + '40' }]}>
            <Text style={{ fontSize: FONT.xl }}>⚠️</Text>
            <Text style={[styles.alertText, { color: budgetPct > 95 ? COLORS.pink : COLORS.orange }]}>
              {budgetPct > 95 ? 'Budget exceeded! Time to pause spending.' : `${Math.round(100 - budgetPct)}% of budget remaining this month`}
            </Text>
          </View>
        )}

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            {[
              { icon: '➕', label: 'Add\nExpense', color: COLORS.primary, onPress: () => { setEditingExpense(null); setAddType('expense'); setShowAdd(true); } },
              { icon: '💰', label: 'Add\nIncome', color: COLORS.secondary, onPress: () => { setEditingExpense(null); setAddType('income'); setShowAdd(true); } },
              { icon: '↔️', label: 'Transfer', color: COLORS.orange, onPress: () => {} },
              { icon: '📊', label: 'Reports', color: COLORS.purple, onPress: () => {} },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.quickItem} onPress={item.onPress}>
                <View style={[styles.quickIcon, { backgroundColor: item.color + '18', borderWidth: 1, borderColor: item.color + '30' }]}>
                  <Text style={{ fontSize: FONT.xxl }}>{item.icon}</Text>
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Flow</Text>
            <Text style={styles.hint}>Tap = edit · Hold = delete</Text>
          </View>

          {recentExp.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: rs(40) }}>🌿</Text>
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptySub}>Tap + to start tracking your flow</Text>
            </View>
          ) : (
            recentExp.map(exp => {
              const meta = getCategoryMeta(exp.category);
              return (
                <TouchableOpacity key={exp.id} style={styles.expRow}
                  onPress={() => { setEditingExpense(exp); setShowAdd(true); }}
                  onLongPress={() => Alert.alert('Delete', 'Remove this expense?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(exp.id) },
                  ])}
                >
                  <View style={[styles.expIcon, { backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color + '30' }]}>
                    <Text style={{ fontSize: FONT.xl }}>{meta.emoji}</Text>
                  </View>
                  <View style={styles.expInfo}>
                    <Text style={styles.expName} numberOfLines={1}>{exp.name}</Text>
                    <Text style={styles.expCat} numberOfLines={1}>{exp.category}{exp.isRecurring ? ' 🔁' : ''}</Text>
                  </View>
                  <View style={styles.expRight}>
                    <Text style={[styles.expAmt, { color: exp.type === 'income' ? COLORS.primary : COLORS.pink }]}>
                      {exp.type === 'income' ? '+' : '-'}{formatAmount(exp.amount)}
                    </Text>
                    <Text style={styles.expTime}>{formatTime(exp.date)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        <View style={{ height: rs(100) }} />
      </ScrollView>

      <AddExpenseModal
        visible={showAdd}
        onClose={() => { setShowAdd(false); setEditingExpense(null); }}
        defaultType={addType}
        editingExpense={editingExpense}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1 },
  topBar: {  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl,paddingTop: Constants.statusBarHeight + rs(10),paddingBottom: SPACING.sm  },
  greeting: { fontSize: clamp(ms(20), 16, 26), fontWeight: '800', color: COLORS.text },
  greetingSub: { fontSize: FONT.sm, color: COLORS.textSub, marginTop: rs(2) },
  avatar: { width: ICON.md, height: ICON.md, borderRadius: ICON.md / 2, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: FONT.lg, fontWeight: '800', color: '#000' },
  balCard: { marginHorizontal: SPACING.lg, marginVertical: SPACING.sm, backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.xl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  glowCircle: { position: 'absolute', width: sw(60), height: sw(60), borderRadius: sw(30), backgroundColor: COLORS.primary + '10', top: -sw(20), right: -sw(10) },
  balLabel: { fontSize: FONT.sm, color: COLORS.textSub, marginBottom: rs(4) },
  balAmount: { fontSize: clamp(ms(28), 22, 36), fontWeight: '800', color: COLORS.text },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: rs(4), marginBottom: SPACING.md },
  changeBadge: { paddingHorizontal: rs(8), paddingVertical: rs(2), borderRadius: rs(20), backgroundColor: COLORS.primary + '20' },
  changeBadgeText: { color: COLORS.primary, fontSize: FONT.xs, fontWeight: '700' },
  changeLabel: { fontSize: FONT.xs, color: COLORS.textSub },
  sparkline: { height: rs(44), flexDirection: "row", alignItems: "flex-end", gap: rs(3), marginBottom: SPACING.md },
  sparkBarWrap: { flex: 1, height: "100%", justifyContent: "flex-end" },
  sparkBar: { width: "100%", borderRadius: rs(3), minHeight: rs(2) },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.card2, borderRadius: RADIUS.lg, padding: SPACING.sm, marginBottom: SPACING.sm },
  statItem: { flex: 1, alignItems: 'center', gap: rs(3), paddingHorizontal: rs(2) },
  statIcon: { width: rs(28), height: rs(28), borderRadius: rs(14), alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: FONT.xs, color: COLORS.textSub },
  statAmt: { fontSize: FONT.sm, fontWeight: '700', textAlign: 'center', width: '100%' },
  divider: { width: 1, backgroundColor: COLORS.border },
  budgetWrap: { marginTop: SPACING.sm },
  budgetLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: rs(5) },
  budgetLabel: { fontSize: FONT.xs, color: COLORS.textSub },
  budgetPct: { fontSize: FONT.xs, fontWeight: '700' },
  budgetBg: { height: rs(6), backgroundColor: COLORS.border, borderRadius: rs(3), overflow: 'hidden' },
  budgetFill: { height: rs(6), borderRadius: rs(3) },
  alertBanner: { marginHorizontal: SPACING.lg, marginTop: SPACING.sm, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderWidth: 1 },
  alertText: { fontSize: FONT.sm, fontWeight: '600', flex: 1 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  hint: { fontSize: FONT.xs, color: COLORS.textSub },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { alignItems: 'center', gap: SPACING.sm, flex: 1 },
  quickIcon: { width: sw(13), height: sw(13), maxWidth: rs(56), maxHeight: rs(56), borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: FONT.xs, color: COLORS.textSub, textAlign: 'center' },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  expIcon: { width: ICON.md, height: ICON.md, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  expInfo: { flex: 1, minWidth: 0 },
  expName: { fontSize: FONT.md, fontWeight: '600', color: COLORS.text },
  expCat: { fontSize: FONT.xs, color: COLORS.textSub, marginTop: rs(2) },
  expRight: { alignItems: 'flex-end', flexShrink: 0 },
  expAmt: { fontSize: FONT.md, fontWeight: '700' },
  expTime: { fontSize: FONT.xs, color: COLORS.textSub, marginTop: rs(2) },
  emptyCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.xxl, alignItems: 'center', gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  emptyTitle: { fontSize: FONT.lg, fontWeight: '600', color: COLORS.text },
  emptySub: { fontSize: FONT.sm, color: COLORS.textSub },
});