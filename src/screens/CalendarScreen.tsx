import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { COLORS, getCategoryMeta, formatTime } from '../utils/categories';
import { SPACING, FONT, RADIUS, SCREEN, rs, ms, sw, sh, clamp, ICON } from '../utils/responsive';
import Constants from 'expo-constants';


const DAYS = ['S','M','T','W','T','F','S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarScreen() {
  const { state, formatAmount } = useExpenses();
  const [curr, setCurr] = useState(new Date());
  const [sel, setSel] = useState<string | null>(null);

  const year = curr.getFullYear(), month = curr.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dailySpend: Record<number, number> = {};
  state.expenses.forEach(e => {
    if (e.type !== 'expense') return;
    const d = new Date(e.date);
    if (d.getMonth() === month && d.getFullYear() === year)
      dailySpend[d.getDate()] = (dailySpend[d.getDate()] || 0) + e.amount;
  });
  const maxSpend = Math.max(...Object.values(dailySpend), 1);

  const getDotColor = (amt: number) => {
    if (!amt) return 'transparent';
    const r = amt / maxSpend;
    if (r < 0.25) return COLORS.primary;
    if (r < 0.5) return COLORS.yellow;
    if (r < 0.75) return COLORS.orange;
    return COLORS.pink;
  };
  const getCellBg = (amt: number) => {
    if (!amt) return 'transparent';
    const r = amt / maxSpend;
    if (r < 0.25) return COLORS.primary + '18';
    if (r < 0.5) return COLORS.yellow + '18';
    if (r < 0.75) return COLORS.orange + '18';
    return COLORS.pink + '18';
  };

  const cellSize = Math.floor((SCREEN.width - SPACING.lg * 2 - SPACING.xs * 6) / 7);
  const selExps = sel ? state.expenses.filter(e => new Date(e.date).toDateString() === new Date(sel).toDateString()) : [];
  const selTotal = selExps.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rs(100) }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Flow Calendar</Text>
        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => setCurr(new Date(year, month - 1, 1))}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity style={styles.navBtn} onPress={() => setCurr(new Date(year, month + 1, 1))}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calWrap}>
          {DAYS.map((d, i) => (
            <View key={i} style={[styles.dayHeader, { width: cellSize }]}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`e${i}`} style={{ width: cellSize, height: cellSize }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = new Date(year, month, day).toDateString();
            const spend = dailySpend[day] || 0;
            const isSel = sel === dateStr;
            const isToday = new Date().toDateString() === dateStr;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.cell, { width: cellSize, height: cellSize, backgroundColor: isSel ? COLORS.primary : getCellBg(spend) },
                  isToday && !isSel && styles.cellToday,
                ]}
                onPress={() => setSel(isSel ? null : dateStr)}
              >
                <Text style={[styles.cellNum, isSel && { color: '#000' }, isToday && !isSel && { color: COLORS.primary }]}>{day}</Text>
                {spend > 0 && <View style={[styles.dot, { backgroundColor: isSel ? '#000' : getDotColor(spend) }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.legend}>
          {[COLORS.primary, COLORS.yellow, COLORS.orange, COLORS.pink].map((c, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
              {i === 0 && <Text style={styles.legendLabel}>Low</Text>}
              {i === 3 && <Text style={styles.legendLabel}>High</Text>}
            </View>
          ))}
        </View>

        {sel && (
          <View style={styles.selSection}>
            <View style={styles.selHeader}>
              <Text style={styles.selDate}>{new Date(sel).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              {selTotal > 0 && <Text style={styles.selTotal}>{formatAmount(selTotal)}</Text>}
            </View>
            {selExps.length === 0 ? (
              <View style={styles.emptyDay}>
                <Text style={{ fontSize: rs(28) }}>🌿</Text>
                <Text style={styles.emptyDayText}>No expenses — great day!</Text>
              </View>
            ) : selExps.map(exp => {
              const meta = getCategoryMeta(exp.category);
              return (
                <View key={exp.id} style={styles.expRow}>
                  <View style={[styles.expIcon, { backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color + '30' }]}><Text style={{ fontSize: FONT.lg }}>{meta.emoji}</Text></View>
                  <View style={styles.expInfo}>
                    <Text style={styles.expName} numberOfLines={1}>{exp.name}</Text>
                    <Text style={styles.expCat}>{exp.category}</Text>
                  </View>
                  <View style={styles.expRight}>
                    <Text style={[styles.expAmt, { color: exp.type === 'income' ? COLORS.primary : COLORS.pink }]}>
                      {exp.type === 'income' ? '+' : '-'}{formatAmount(exp.amount)}
                    </Text>
                    <Text style={styles.expTime}>{formatTime(exp.date)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl,paddingTop: Constants.statusBarHeight + rs(10),paddingBottom: SPACING.sm},
  headerTitle: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, marginBottom: SPACING.md },
  navBtn: { width: rs(36), height: rs(36), borderRadius: rs(18), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  navArrow: { fontSize: FONT.xxl, color: COLORS.text, lineHeight: FONT.xxl * 1.3 },
  monthLabel: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.text },
  calWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: SPACING.xs },
  dayHeader: { alignItems: 'center', paddingBottom: SPACING.sm },
  dayHeaderText: { fontSize: FONT.xs, fontWeight: '600', color: COLORS.textSub },
  cell: { borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', gap: rs(2) },
  cellToday: { borderWidth: 1.5, borderColor: COLORS.primary },
  cellNum: { fontSize: FONT.sm, fontWeight: '600', color: COLORS.text },
  dot: { width: rs(5), height: rs(5), borderRadius: rs(2.5) },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
  legendDot: { width: rs(10), height: rs(10), borderRadius: rs(5) },
  legendLabel: { fontSize: FONT.xs, color: COLORS.textSub },
  selSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.sm },
  selHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  selDate: { fontSize: FONT.md, fontWeight: '700', color: COLORS.text },
  selTotal: { fontSize: FONT.md, fontWeight: '700', color: COLORS.pink },
  emptyDay: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  emptyDayText: { fontSize: FONT.md, color: COLORS.textSub },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  expIcon: { width: ICON.sm, height: ICON.sm, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  expInfo: { flex: 1, minWidth: 0 },
  expName: { fontSize: FONT.md, fontWeight: '600', color: COLORS.text },
  expCat: { fontSize: FONT.xs, color: COLORS.textSub },
  expRight: { alignItems: 'flex-end', flexShrink: 0 },
  expAmt: { fontSize: FONT.md, fontWeight: '700' },
  expTime: { fontSize: FONT.xs, color: COLORS.textSub },
});
