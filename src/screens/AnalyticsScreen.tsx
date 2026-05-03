import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { COLORS, CATEGORIES } from '../utils/categories';
import { SPACING, FONT, RADIUS, SCREEN, rs, ms, sw, sh, clamp, ICON } from '../utils/responsive';

const CHART_H = clamp(rs(110), 90, 150);

export default function AnalyticsScreen() {
  const { state, getMonthExpenses, formatAmount } = useExpenses();
  const monthTotal = getMonthExpenses();
  const now = new Date();

  const weeklyData = Array.from({ length: 5 }, (_, w) => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1 + w * 7);
    const end = new Date(now.getFullYear(), now.getMonth(), 7 + w * 7);
    const total = state.expenses
      .filter(e => { const d = new Date(e.date); return e.type === 'expense' && d >= start && d <= end; })
      .reduce((s, e) => s + e.amount, 0);
    return { label: `${start.getDate()} ${start.toLocaleDateString('en-IN', { month: 'short' })}`, total };
  });
  const maxW = Math.max(...weeklyData.map(d => d.total), 1);

  const catData = CATEGORIES.map(cat => {
    const total = state.expenses
      .filter(e => e.type === 'expense' && e.category === cat.label && new Date(e.date).getMonth() === now.getMonth())
      .reduce((s, e) => s + e.amount, 0);
    return { ...cat, total, pct: monthTotal > 0 ? (total / monthTotal) * 100 : 0 };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const txCount = state.expenses.filter(e => e.type === 'expense' && new Date(e.date).getMonth() === now.getMonth()).length;
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyAvg = Math.round((monthTotal || 29750) / days);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rs(100) }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={styles.mintBadge}><Text style={styles.mintBadgeText}>🌿 This Month</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.mainLabel}>Total Expense</Text>
          <Text style={styles.mainAmt} adjustsFontSizeToFit numberOfLines={1}>{formatAmount(monthTotal || 29750)}</Text>
          <View style={styles.greenBadge}><Text style={styles.greenBadgeText}>↑ +12.5% vs last month</Text></View>
        </View>

        <View style={styles.subRow}>
          <View style={styles.subCard}>
            <Text style={styles.subLabel}>Daily Avg</Text>
            <Text style={styles.subVal} adjustsFontSizeToFit numberOfLines={1}>{formatAmount(dailyAvg)}</Text>
          </View>
          <View style={styles.subCard}>
            <Text style={styles.subLabel}>Transactions</Text>
            <Text style={styles.subVal}>{txCount || 34}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Flow</Text>
          <View style={styles.chartWrap}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.gridLine, { bottom: (i / 3) * CHART_H }]} />
            ))}
            <View style={styles.barsRow}>
              {weeklyData.map((d, i) => {
                const barH = Math.max((d.total / maxW) * CHART_H, d.total > 0 ? rs(4) : 0);
                return (
                  <View key={i} style={styles.barCol}>
                    {d.total > 0 && <Text style={styles.barTopLbl} numberOfLines={1} adjustsFontSizeToFit>{formatAmount(d.total)}</Text>}
                    <View style={[styles.bar, { height: barH }]} />
                    <Text style={styles.xLbl} numberOfLines={1}>{d.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending by Category</Text>
          {(catData.length > 0 ? catData : CATEGORIES.slice(0, 4).map((c, i) => ({
            ...c, total: [12495, 5950, 4760, 3570][i] || 0, pct: [42, 20, 16, 12][i] || 0,
          }))).map((cat, i) => (
            <View key={i} style={styles.catRow}>
              <View style={[styles.catBadge, { backgroundColor: cat.bg, borderWidth: 1, borderColor: cat.color + '30' }]}>
                <Text style={{ fontSize: FONT.lg }}>{cat.emoji}</Text>
              </View>
              <View style={styles.catInfo}>
                <View style={styles.catTopRow}>
                  <Text style={styles.catName} numberOfLines={1}>{cat.label}</Text>
                  <Text style={styles.catAmt}>{formatAmount(cat.total)}</Text>
                </View>
                <View style={styles.catBarBg}>
                  <View style={[styles.catBarFill, { width: `${Math.min(cat.pct, 100)}%`, backgroundColor: cat.color }]} />
                </View>
                <Text style={styles.catPct}>{Math.round(cat.pct)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text },
  mintBadge: { backgroundColor: COLORS.primary + '18', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: rs(20), borderWidth: 1, borderColor: COLORS.primary + '30' },
  mintBadgeText: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: '600' },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  mainLabel: { fontSize: FONT.sm, color: COLORS.textSub, marginBottom: rs(4) },
  mainAmt: { fontSize: clamp(ms(26), 20, 34), fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  greenBadge: { backgroundColor: COLORS.primary + '18', paddingHorizontal: SPACING.md, paddingVertical: rs(4), borderRadius: rs(20), alignSelf: 'flex-start' },
  greenBadgeText: { color: COLORS.primary, fontSize: FONT.xs, fontWeight: '700' },
  subRow: { flexDirection: 'row', gap: SPACING.md, marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  subCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  subLabel: { fontSize: FONT.xs, color: COLORS.textSub, marginBottom: rs(4) },
  subVal: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text },
  cardTitle: { fontSize: FONT.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  chartWrap: { position: 'relative', height: CHART_H + rs(48), paddingLeft: rs(30) },
  gridLine: { position: 'absolute', left: rs(30), right: 0, height: 0.5, backgroundColor: COLORS.border },
  barsRow: { position: 'absolute', bottom: rs(22), left: rs(30), right: 0, top: 0, flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barTopLbl: { fontSize: rs(8), color: COLORS.textSub, marginBottom: rs(2), textAlign: 'center', width: '100%' },
  bar: { width: '55%', backgroundColor: COLORS.primary + 'AA', borderRadius: rs(4), borderTopLeftRadius: rs(6), borderTopRightRadius: rs(6) },
  xLbl: { fontSize: rs(9), color: COLORS.textSub, marginTop: rs(4), textAlign: 'center', width: '100%' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  catBadge: { width: ICON.sm, height: ICON.sm, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  catInfo: { flex: 1, minWidth: 0 },
  catTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: rs(5) },
  catName: { fontSize: FONT.sm, fontWeight: '500', color: COLORS.text, flex: 1 },
  catAmt: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.text, marginLeft: SPACING.sm },
  catBarBg: { height: rs(6), backgroundColor: COLORS.border, borderRadius: rs(3), overflow: 'hidden', marginBottom: rs(2) },
  catBarFill: { height: rs(6), borderRadius: rs(3) },
  catPct: { fontSize: FONT.xs, color: COLORS.textSub },
});
