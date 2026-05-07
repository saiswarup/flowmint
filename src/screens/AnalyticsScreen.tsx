import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import { useExpenses } from '../context/ExpenseContext';
import { COLORS, CATEGORIES } from '../utils/categories';
import {
  SPACING,
  FONT,
  RADIUS,
  rs,
  ms,
  clamp,
  ICON,
} from '../utils/responsive';

import Constants from 'expo-constants';

const CHART_H = clamp(rs(110), 90, 150);

export default function AnalyticsScreen() {
  const { state, formatAmount } = useExpenses();

  const now = new Date();

  /*
   |--------------------------------------------------------------------------
   | REAL DATA CALCULATIONS
   |--------------------------------------------------------------------------
   */

  const totalIncome = state.expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = state.expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSavings = state.expenses
    .filter(
      e =>
        e.wallet === 'Savings' ||
        e.wallet === 'Investment' ||
        e.category === 'Savings' ||
        e.category === 'Investment'
    )
    .reduce((sum, e) => sum + e.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  /*
   |--------------------------------------------------------------------------
   | THIS MONTH DATA
   |--------------------------------------------------------------------------
   */

  const currentMonthExpenses = state.expenses.filter(e => {
    const d = new Date(e.date);

    return (
      e.type === 'expense' &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const monthExpense = currentMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const txCount = currentMonthExpenses.length;

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  const dailyAvg = Math.round(monthExpense / daysInMonth);

  /*
   |--------------------------------------------------------------------------
   | WEEKLY DATA
   |--------------------------------------------------------------------------
   */

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();

    d.setDate(d.getDate() - (6 - i));

    const dayKey = d.toISOString().split('T')[0];

    const expense = state.expenses
      .filter(
        item =>
          item.type === 'expense' &&
          item.date.startsWith(dayKey)
      )
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      label: d.toLocaleDateString('en-IN', {
        weekday: 'short',
      }),
      total: expense,
    };
  });

  const maxW = Math.max(...weeklyData.map(d => d.total), 1);

  /*
   |--------------------------------------------------------------------------
   | CATEGORY DATA
   |--------------------------------------------------------------------------
   */

  const catData = CATEGORIES.map(cat => {
    const total = state.expenses
      .filter(
        e =>
          e.type === 'expense' &&
          e.category === cat.label
      )
      .reduce((s, e) => s + e.amount, 0);

    return {
      ...cat,
      total,
      pct:
        totalExpense > 0
          ? (total / totalExpense) * 100
          : 0,
    };
  })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: rs(120),
        }}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Analytics
          </Text>

          <View style={styles.mintBadge}>
            <Text style={styles.mintBadgeText}>
              🌿 Live Data
            </Text>
          </View>
        </View>

        {/* HERO CARD */}

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <Text style={styles.mainLabel}>
            Total Balance
          </Text>

          <Text
            style={[
              styles.mainAmt,
              {
                color:
                  totalBalance >= 0
                    ? COLORS.primary
                    : COLORS.pink,
              },
            ]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatAmount(totalBalance)}
          </Text>

          <View style={styles.greenBadge}>
            <Text style={styles.greenBadgeText}>
              {txCount} Transactions This Month
            </Text>
          </View>
        </View>

        {/* SUMMARY */}

        <View style={styles.subRow}>
          <View style={styles.subCard}>
            <Text style={styles.subLabel}>
              Total Income
            </Text>

            <Text
              style={[
                styles.subVal,
                { color: COLORS.primary },
              ]}
            >
              {formatAmount(totalIncome)}
            </Text>
          </View>

          <View style={styles.subCard}>
            <Text style={styles.subLabel}>
              Total Expense
            </Text>

            <Text
              style={[
                styles.subVal,
                { color: COLORS.pink },
              ]}
            >
              {formatAmount(totalExpense)}
            </Text>
          </View>
        </View>

        <View style={styles.subRow}>
          <View style={styles.subCard}>
            <Text style={styles.subLabel}>
              Total Savings
            </Text>

            <Text
              style={[
                styles.subVal,
                { color: COLORS.orange },
              ]}
            >
              {formatAmount(totalSavings)}
            </Text>
          </View>

          <View style={styles.subCard}>
            <Text style={styles.subLabel}>
              Daily Average
            </Text>

            <Text style={styles.subVal}>
              {formatAmount(dailyAvg)}
            </Text>
          </View>
        </View>

        {/* WEEKLY FLOW */}

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <Text style={styles.cardTitle}>
            Weekly Expense Flow
          </Text>

          <View style={styles.chartWrap}>
            {[0, 1, 2, 3].map(i => (
              <View
                key={i}
                style={[
                  styles.gridLine,
                  {
                    bottom:
                      (i / 3) * CHART_H,
                  },
                ]}
              />
            ))}

            <View style={styles.barsRow}>
              {weeklyData.map((d, i) => {
                const barH = Math.max(
                  (d.total / maxW) * CHART_H,
                  d.total > 0 ? rs(6) : 0
                );

                return (
                  <View
                    key={i}
                    style={styles.barCol}
                  >
                    {d.total > 0 && (
                      <Text
                        style={styles.barTopLbl}
                        numberOfLines={1}
                      >
                        {formatAmount(d.total)}
                      </Text>
                    )}

                    <View
                      style={[
                        styles.bar,
                        {
                          height: barH,
                          backgroundColor:
                            d.total === maxW
                              ? COLORS.orange
                              : COLORS.primary,
                        },
                      ]}
                    />

                    <Text style={styles.xLbl}>
                      {d.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* CATEGORY */}

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <Text style={styles.cardTitle}>
            Spending by Category
          </Text>

          {catData.length === 0 ? (
            <Text style={styles.emptyText}>
              No expense data available
            </Text>
          ) : (
            catData.map((cat, i) => (
              <View
                key={i}
                style={styles.catRow}
              >
                <View
                  style={[
                    styles.catBadge,
                    {
                      backgroundColor:
                        cat.bg,
                      borderWidth: 1,
                      borderColor:
                        cat.color + '40',
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: FONT.lg,
                    }}
                  >
                    {cat.emoji}
                  </Text>
                </View>

                <View style={styles.catInfo}>
                  <View
                    style={
                      styles.catTopRow
                    }
                  >
                    <Text
                      style={styles.catName}
                    >
                      {cat.label}
                    </Text>

                    <Text
                      style={styles.catAmt}
                    >
                      {formatAmount(
                        cat.total
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.catBarBg
                    }
                  >
                    <View
                      style={[
                        styles.catBarFill,
                        {
                          width: `${Math.min(
                            cat.pct,
                            100
                          )}%`,
                          backgroundColor:
                            cat.color,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={styles.catPct}
                  >
                    {Math.round(cat.pct)}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: SPACING.xl,

    paddingTop:
      Constants.statusBarHeight +
      rs(10),

    paddingBottom: SPACING.md,
  },

  headerTitle: {
    fontSize: FONT.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },

  mintBadge: {
    backgroundColor:
      COLORS.primary + '18',

    paddingHorizontal:
      SPACING.md,

    paddingVertical: SPACING.xs,

    borderRadius: rs(20),

    borderWidth: 1,

    borderColor:
      COLORS.primary + '30',
  },

  mintBadgeText: {
    fontSize: FONT.sm,
    color: COLORS.primary,
    fontWeight: '700',
  },

  heroCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,

    padding: SPACING.xl,

    borderRadius: RADIUS.xxl,

    backgroundColor: '#0F222B',

    borderWidth: 1,

    borderColor: COLORS.border,

    overflow: 'hidden',
  },

  heroGlow: {
    position: 'absolute',

    width: rs(150),
    height: rs(150),

    borderRadius: rs(75),

    backgroundColor:
      COLORS.primary + '15',

    top: -50,
    right: -40,
  },

  mainLabel: {
    fontSize: FONT.sm,
    color: COLORS.textSub,
    marginBottom: rs(5),
  },

  mainAmt: {
    fontSize: clamp(ms(34), 26, 42),
    fontWeight: '800',
    marginBottom: SPACING.md,
  },

  greenBadge: {
    alignSelf: 'flex-start',

    backgroundColor:
      COLORS.primary + '18',

    paddingHorizontal:
      SPACING.md,

    paddingVertical: rs(5),

    borderRadius: rs(20),
  },

  greenBadgeText: {
    color: COLORS.primary,
    fontSize: FONT.xs,
    fontWeight: '700',
  },

  subRow: {
    flexDirection: 'row',
    gap: SPACING.md,

    marginHorizontal:
      SPACING.lg,

    marginBottom: SPACING.md,
  },

  subCard: {
    flex: 1,

    backgroundColor: COLORS.card,

    borderRadius: RADIUS.lg,

    padding: SPACING.md,

    borderWidth: 1,

    borderColor: COLORS.border,
  },

  subLabel: {
    fontSize: FONT.xs,
    color: COLORS.textSub,
    marginBottom: rs(5),
  },

  subVal: {
    fontSize: FONT.lg,
    fontWeight: '800',
    color: COLORS.text,
  },

  cardTitle: {
    fontSize: FONT.lg,
    fontWeight: '700',
    color: COLORS.text,

    marginBottom: SPACING.lg,
  },

  chartWrap: {
    position: 'relative',

    height: CHART_H + rs(50),

    paddingLeft: rs(10),
  },

  gridLine: {
    position: 'absolute',

    left: rs(10),
    right: 0,

    height: 1,

    backgroundColor:
      COLORS.border,
  },

  barsRow: {
    position: 'absolute',

    bottom: rs(24),

    left: rs(10),
    right: 0,
    top: 0,

    flexDirection: 'row',

    alignItems: 'flex-end',
  },

  barCol: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'flex-end',
  },

  barTopLbl: {
    fontSize: rs(9),

    color: COLORS.textSub,

    marginBottom: rs(4),

    textAlign: 'center',
  },

  bar: {
    width: '58%',

    borderRadius: rs(8),

    borderTopLeftRadius: rs(10),
    borderTopRightRadius: rs(10),
  },

  xLbl: {
    fontSize: rs(10),

    color: COLORS.textSub,

    marginTop: rs(6),

    fontWeight: '600',
  },

  catRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: SPACING.md,
  },

  catBadge: {
    width: ICON.sm,
    height: ICON.sm,

    borderRadius: RADIUS.md,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: SPACING.md,
  },

  catInfo: {
    flex: 1,
  },

  catTopRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    marginBottom: rs(5),
  },

  catName: {
    color: COLORS.text,
    fontSize: FONT.sm,
    fontWeight: '600',
  },

  catAmt: {
    color: COLORS.text,
    fontSize: FONT.sm,
    fontWeight: '700',
  },

  catBarBg: {
    height: rs(7),

    backgroundColor:
      COLORS.border,

    borderRadius: rs(4),

    overflow: 'hidden',

    marginBottom: rs(4),
  },

  catBarFill: {
    height: rs(7),

    borderRadius: rs(4),
  },

  catPct: {
    fontSize: FONT.xs,
    color: COLORS.textSub,
  },

  emptyText: {
    color: COLORS.textSub,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});