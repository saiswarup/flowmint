import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ImageBackground } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { COLORS } from '../utils/categories';
import { SPACING, FONT, RADIUS, SCREEN, rs, ms, sw, sh, clamp, ICON } from '../utils/responsive';
import Constants from 'expo-constants';


const GOAL_IMAGES: Record<string, string> = {
  'goa':       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'bike':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'emergency': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
  'default':   'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
};
const getImg = (name: string) => {
  const k = Object.keys(GOAL_IMAGES).find(k => name.toLowerCase().includes(k));
  return GOAL_IMAGES[k || 'default'];
};

export default function WalletScreen() {
  const { state, formatAmount } = useExpenses();
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const imgH = clamp(sh(18), 120, 200);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rs(100) }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Wallets</Text>
          <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>+ Add</Text></TouchableOpacity>
        </View>

        {state.wallets.map(w => (
          <View key={w.id} style={[styles.walletCard, { backgroundColor: w.color }]}>
            <View style={styles.walletTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletName}>{w.name}</Text>
                <Text style={styles.walletSub}>Available Balance</Text>
              </View>
              <Text style={{ fontSize: clamp(rs(32), 26, 42) }}>{w.icon}</Text>
            </View>
            <Text style={styles.walletAmt} adjustsFontSizeToFit numberOfLines={1}>{formatAmount(w.balance)}.00</Text>
          </View>
        ))}

        <View style={styles.goalsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Goals 🎯</Text>
            <TouchableOpacity><Text style={styles.addGoalText}>+ Add Goal</Text></TouchableOpacity>
          </View>

          {state.goals.map(goal => {
            const pct = Math.round((goal.saved / goal.target) * 100);
            const deadline = new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <View key={goal.id} style={styles.goalCard}>
                <ImageBackground source={{ uri: getImg(goal.name) }} style={[styles.goalImg, { height: imgH }]} imageStyle={styles.goalImgStyle}>
                  <View style={styles.goalOverlay} />
                  <View style={styles.goalImgContent}>
                    <Text style={styles.goalImgName} numberOfLines={1}>{goal.name} {goal.emoji}</Text>
                    <Text style={styles.goalImgTarget}>{formatAmount(goal.target)}</Text>
                  </View>
                </ImageBackground>
                <View style={styles.goalDetails}>
                  <View style={styles.goalTopRow}>
                    <Text style={styles.goalName} numberOfLines={1}>{goal.name} {goal.emoji}</Text>
                    <Text style={[styles.goalPct, { color: goal.color }]}>{pct}%</Text>
                  </View>
                  <Text style={styles.goalAmts}>{formatAmount(goal.saved)}{' '}<Text style={styles.goalOf}>of {formatAmount(goal.target)}</Text></Text>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: goal.color }]} />
                  </View>
                  <Text style={styles.goalDeadline}>Due: {deadline}</Text>
                </View>
              </View>
            );
          })}

          <View style={styles.totalCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>Total Saved Across Goals</Text>
              <Text style={styles.totalAmt} adjustsFontSizeToFit numberOfLines={1}>{formatAmount(totalSaved)}</Text>
            </View>
            <Text style={{ fontSize: clamp(rs(36), 28, 48) }}>🐷</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl,paddingTop: Constants.statusBarHeight + rs(10),paddingBottom: SPACING.sm },
  headerTitle: { fontSize: FONT.xxl, fontWeight: '800', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.card, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: rs(20), borderWidth: 1, borderColor: COLORS.border },
  addBtnText: { fontSize: FONT.sm, color: COLORS.primary, fontWeight: '600' },
  walletCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.xl },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  walletName: { fontSize: FONT.lg, fontWeight: '700', color: '#FFF' },
  walletSub: { fontSize: FONT.xs, color: 'rgba(255,255,255,0.7)', marginTop: rs(2) },
  walletAmt: { fontSize: clamp(ms(24), 18, 32), fontWeight: '800', color: '#FFF' },
  goalsSection: { paddingHorizontal: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.text },
  addGoalText: { fontSize: FONT.md, color: COLORS.primary, fontWeight: '600' },
  goalCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, marginBottom: SPACING.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  goalImg: { justifyContent: 'flex-end' },
  goalImgStyle: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl },
  goalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },
  goalImgContent: { padding: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  goalImgName: { fontSize: clamp(ms(18), 14, 24), fontWeight: '800', color: '#FFF', flex: 1 },
  goalImgTarget: { fontSize: FONT.md, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  goalDetails: { padding: SPACING.lg },
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(4) },
  goalName: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.text, flex: 1 },
  goalPct: { fontSize: FONT.md, fontWeight: '800', marginLeft: SPACING.sm },
  goalAmts: { fontSize: FONT.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  goalOf: { fontSize: FONT.sm, fontWeight: '400', color: COLORS.textSub },
  progressBg: { height: rs(8), backgroundColor: COLORS.border, borderRadius: rs(4), overflow: 'hidden', marginBottom: SPACING.sm },
  progressFill: { height: rs(8), borderRadius: rs(4) },
  goalDeadline: { fontSize: FONT.xs, color: COLORS.textSub },
  totalCard: { backgroundColor: COLORS.card2, borderRadius: RADIUS.xl, padding: SPACING.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  totalLabel: { fontSize: FONT.sm, color: COLORS.textSub, marginBottom: SPACING.sm },
  totalAmt: { fontSize: clamp(ms(24), 18, 32), fontWeight: '800', color: COLORS.text },
});
