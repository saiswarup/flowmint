import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { COLORS, formatDate, formatTime, getCategoryMeta } from '../utils/categories';
import { SPACING, FONT, RADIUS, rs, sw, sh, ICON } from '../utils/responsive';

type Filter = 'All' | 'Expense' | 'Income';

export default function TimelineScreen() {
  const { state, deleteExpense, formatAmount } = useExpenses();
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = state.expenses.filter(e =>
    filter === 'All' || (filter === 'Expense' ? e.type === 'expense' : e.type === 'income')
  );

  const groups: Record<string, typeof filtered> = {};
  filtered.forEach(e => {
    const k = new Date(e.date).toDateString();
    if (!groups[k]) groups[k] = [];
    groups[k].push(e);
  });

  const sections = Object.entries(groups)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([d, data]) => ({
      title: formatDate(new Date(d).toISOString()),
      total: data.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
      data,
    }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flow Timeline</Text>
        <TouchableOpacity style={styles.iconBtn}><Text style={{ fontSize: FONT.lg }}>🔍</Text></TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {(['All', 'Expense', 'Income'] as Filter[]).map(f => (
          <TouchableOpacity key={f} style={[styles.pill, filter === f && styles.pillActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: rs(44) }}>🌿</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySub}>Start tracking your flow</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.dateDot} />
              <Text style={styles.sectionDate}>{section.title}</Text>
              {section.total > 0 && <Text style={styles.sectionTotal}>{formatAmount(section.total)}</Text>}
            </View>
          )}
          renderItem={({ item }) => {
            const meta = getCategoryMeta(item.category);
            return (
              <TouchableOpacity style={styles.txRow}
                onLongPress={() => Alert.alert('Delete', 'Remove this?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(item.id) },
                ])}>
                <View style={[styles.txIcon, { backgroundColor: meta.bg, borderWidth: 1, borderColor: meta.color + '30' }]}>
                  <Text style={{ fontSize: FONT.xl }}>{meta.emoji}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.txCat} numberOfLines={1}>{item.category}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmt, { color: item.type === 'income' ? COLORS.primary : COLORS.pink }]}>
                    {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
                  </Text>
                  <Text style={styles.txTime}>{formatTime(item.date)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: rs(100), paddingHorizontal: SPACING.lg }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  headerTitle: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text },
  iconBtn: { width: rs(38), height: rs(38), borderRadius: rs(19), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg },
  pill: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: rs(20), backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: FONT.sm, fontWeight: '600', color: COLORS.textSub },
  pillTextActive: { color: '#000' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  dateDot: { width: rs(10), height: rs(10), borderRadius: rs(5), backgroundColor: COLORS.primary },
  sectionDate: { flex: 1, fontSize: FONT.sm, fontWeight: '600', color: COLORS.textSub },
  sectionTotal: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.pink },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  txIcon: { width: ICON.md, height: ICON.md, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txInfo: { flex: 1, minWidth: 0 },
  txName: { fontSize: FONT.md, fontWeight: '600', color: COLORS.text },
  txCat: { fontSize: FONT.xs, color: COLORS.textSub, marginTop: rs(2) },
  txRight: { alignItems: 'flex-end', flexShrink: 0 },
  txAmt: { fontSize: FONT.md, fontWeight: '700' },
  txTime: { fontSize: FONT.xs, color: COLORS.textSub, marginTop: rs(2) },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  emptyText: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: FONT.sm, color: COLORS.textSub },
});
