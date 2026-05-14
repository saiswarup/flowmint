import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useExpenses } from '../context/ExpenseContext';

const COLORS = {
  bg: '#08131B',
  card: '#0D1E28',
  border: '#1C3545',
  primary: '#00C48C',
  pink: '#FF5A7A',
  text: '#FFFFFF',
  sub: '#3A7080',
  yellow: '#F5A623',
};

export default function AddTradeScreen() {
  const navigation = useNavigation();
  const { addExpense } = useExpenses();

  const [tradeType, setTradeType] = useState<'profit' | 'loss'>('profit');

  const [stockName, setStockName] = useState('');
  const [tradeAmount, setTradeAmount] = useState('');

  const [strategy, setStrategy] = useState('');
  const [emotion, setEmotion] = useState('');
  const [notes, setNotes] = useState('');
  const [mistake, setMistake] = useState('');
  const [lossReason, setLossReason] = useState('');

  const [rating, setRating] = useState(0);

  const pnlData = useMemo(() => {
    const amount = Number(tradeAmount);

    return {
      pnl: amount || 0,
      percentage: 0,
    };
  }, [tradeAmount]);

  const saveTrade = () => {
    const pnl = Number(tradeAmount);

    addExpense({
      name: stockName || 'Trade',
      amount: pnl,
      category: 'Stock',
      date: new Date().toISOString(),
      type: tradeType === 'profit' ? 'income' : 'expense',
      wallet: 'Investment',

      tradeType,
      stockName,
      strategy,
      emotion,
      lossReason,
      mistake,
      note: notes,
    });

    navigation.goBack();
  };

  const strategies = [
    'Breakout',
    'Reversal',
    'Scalp',
    'Trend',
    'Options',
    'Swing',
  ];

  const emotions = [
    '😌 Calm',
    '🔥 FOMO',
    '😨 Fear',
    '😡 Revenge',
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: COLORS.text }}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Add Trade</Text>
        </View>

        {/* Profit Loss Toggle */}
        <Text style={styles.label}>TRADE OUTCOME</Text>

        <View style={styles.toggleWrap}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              tradeType === 'profit' && styles.activeProfit,
            ]}
            onPress={() => setTradeType('profit')}
          >
            <Text style={styles.toggleText}>📈 Profit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              tradeType === 'loss' && styles.activeLoss,
            ]}
            onPress={() => setTradeType('loss')}
          >
            <Text style={styles.toggleText}>📉 Loss</Text>
          </TouchableOpacity>
        </View>

        {/* Trade Details */}
        <Text style={styles.label}>TRADE DETAILS</Text>

        <TextInput
          placeholder="Stock Name"
          placeholderTextColor={COLORS.sub}
          style={styles.input}
          value={stockName}
          onChangeText={setStockName}
        />

        <TextInput
          placeholder={
            tradeType === 'profit'
              ? 'Profit Amount'
              : 'Loss Amount'
          }
          keyboardType="numeric"
          placeholderTextColor={COLORS.sub}
          style={styles.input}
          value={tradeAmount}
          onChangeText={setTradeAmount}
        />

        {/* PNL Card */}
        <Text style={styles.label}>P&L SUMMARY</Text>

        <View style={styles.pnlCard}>
          <View>
            <Text style={styles.pnlLabel}>Trade Result</Text>

            <Text
              style={[
                styles.pnlAmount,
                {
                  color:
                    tradeType === 'profit'
                      ? COLORS.primary
                      : COLORS.pink,
                },
              ]}
            >
              {tradeType === 'profit' ? '+' : '-'}₹
              {Number(tradeAmount || 0).toFixed(2)}
            </Text>
          </View>

          <View
            style={[
              styles.percentBadge,
              {
                backgroundColor:
                  tradeType === 'profit'
                    ? 'rgba(0,196,140,0.15)'
                    : 'rgba(255,90,122,0.15)',
              },
            ]}
          >
            <Text
              style={{
                color:
                  tradeType === 'profit'
                    ? COLORS.primary
                    : COLORS.pink,
                fontWeight: '700',
              }}
            >
              {tradeType === 'profit'
                ? 'WIN'
                : 'LOSS'}
            </Text>
          </View>
        </View>

        {/* Strategy */}
        <Text style={styles.label}>STRATEGY</Text>

        <View style={styles.chipWrap}>
          {strategies.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                strategy === item && styles.activeChip,
              ]}
              onPress={() => setStrategy(item)}
            >
              <Text
                style={{
                  color:
                    strategy === item
                      ? COLORS.primary
                      : COLORS.sub,
                  fontWeight: '600',
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Setup Rating */}
        <Text style={styles.label}>SETUP QUALITY</Text>

        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
            >
              <Text
                style={{
                  fontSize: 32,
                  color:
                    star <= rating
                      ? COLORS.yellow
                      : COLORS.border,
                }}
              >
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emotion */}
        <Text style={styles.label}>TRADER EMOTION</Text>

        <View style={styles.chipWrap}>
          {emotions.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                emotion === item && styles.activeChip,
              ]}
              onPress={() => setEmotion(item)}
            >
              <Text
                style={{
                  color:
                    emotion === item
                      ? COLORS.primary
                      : COLORS.sub,
                  fontWeight: '600',
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loss Analysis */}
        {tradeType === 'loss' && (
          <>
            <Text
              style={[
                styles.label,
                { color: COLORS.pink },
              ]}
            >
              LOSS ANALYSIS
            </Text>

            <TextInput
              placeholder="Why Loss Happened?"
              placeholderTextColor={COLORS.sub}
              style={[styles.input, styles.textArea]}
              multiline
              value={lossReason}
              onChangeText={setLossReason}
            />

            <TextInput
              placeholder="What mistake did you make?"
              placeholderTextColor={COLORS.sub}
              style={[styles.input, styles.textArea]}
              multiline
              value={mistake}
              onChangeText={setMistake}
            />
          </>
        )}

        {/* Notes */}
        <Text style={styles.label}>TRADING NOTES</Text>

        <TextInput
          placeholder="Write your trade notes..."
          placeholderTextColor={COLORS.sub}
          style={[styles.input, styles.textArea]}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor:
                tradeType === 'profit'
                  ? COLORS.primary
                  : COLORS.pink,
            },
          ]}
          onPress={saveTrade}
        >
          <Text style={styles.saveText}>
            💾 Save Trade
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    flex: 1,
    padding: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },

  label: {
    color: COLORS.sub,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 24,
    letterSpacing: 1.2,
  },

  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#0C1C26',
    padding: 4,
    borderRadius: 16,
    gap: 8,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  activeProfit: {
    backgroundColor: COLORS.primary,
  },

  activeLoss: {
    backgroundColor: COLORS.pink,
  },

  toggleText: {
    color: '#fff',
    fontWeight: '700',
  },

  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    color: COLORS.text,
    marginBottom: 14,
  },

  pnlCard: {
    backgroundColor: '#0C1C26',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pnlLabel: {
    color: COLORS.sub,
    fontSize: 12,
  },

  pnlAmount: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 6,
  },

  percentBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeChip: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0,196,140,0.12)',
  },

  starRow: {
    flexDirection: 'row',
    gap: 10,
  },

  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },

  saveBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 32,
  },

  saveText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 18,
  },
});