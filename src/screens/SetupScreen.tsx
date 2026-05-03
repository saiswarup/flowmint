import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { COLORS, SPACING, FONT, RADIUS, rs, ms, sw, sh, clamp } from '../utils/responsive';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
];

const BUDGETS = [10000, 25000, 50000, 75000, 100000];

interface Props { onDone: () => void; }

export default function SetupScreen({ onDone }: Props) {
  const { updateProfile } = useExpenses();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [budget, setBudget] = useState(25000);
  const [customBudget, setCustomBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const handleDone = async () => {
    setSaving(true);
    try {
      // Await the save so data is on disk BEFORE navigating away
      await updateProfile({
        name: name.trim() || 'Friend',
        currency: currency.code,
        currencySymbol: currency.symbol,
        monthlyBudget: customBudget ? parseInt(customBudget) : budget,
        setupDone: true,
      });
      onDone();
    } catch (e) {
      console.warn('Setup save failed:', e);
      onDone(); // navigate anyway
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    <View key={0} style={styles.stepWrap}>
      <Text style={styles.stepEmoji}>👋</Text>
      <Text style={styles.stepTitle}>What's your name?</Text>
      <Text style={styles.stepSub}>We'll personalise your dashboard</Text>
      <TextInput
        style={styles.bigInput}
        placeholder="Enter your name"
        placeholderTextColor={COLORS.textSub}
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="next"
        onSubmitEditing={() => setStep(1)}
      />
    </View>,

    <View key={1} style={styles.stepWrap}>
      <Text style={styles.stepEmoji}>🌐</Text>
      <Text style={styles.stepTitle}>Your currency</Text>
      <Text style={styles.stepSub}>Choose your preferred currency</Text>
      <View style={{ width: '100%' }}>
        {CURRENCIES.map(c => (
          <TouchableOpacity
            key={c.code}
            style={[styles.optionRow, currency.code === c.code && styles.optionRowActive]}
            onPress={() => setCurrency(c)}
          >
            <Text style={styles.optionSymbol}>{c.symbol}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{c.label}</Text>
              <Text style={styles.optionCode}>{c.code}</Text>
            </View>
            {currency.code === c.code && (
              <Text style={{ color: COLORS.purple, fontSize: FONT.xl, fontWeight: '800' }}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    <View key={2} style={styles.stepWrap}>
      <Text style={styles.stepEmoji}>🎯</Text>
      <Text style={styles.stepTitle}>Monthly budget</Text>
      <Text style={styles.stepSub}>Set your spending limit for each month</Text>
      <View style={styles.budgetGrid}>
        {BUDGETS.map(b => (
          <TouchableOpacity
            key={b}
            style={[styles.budgetPill, budget === b && !customBudget && styles.budgetPillActive]}
            onPress={() => { setBudget(b); setCustomBudget(''); }}
          >
            <Text style={[styles.budgetText, budget === b && !customBudget && styles.budgetTextActive]}>
              {currency.symbol}{(b / 1000).toFixed(0)}k
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.orText}>— or enter custom amount —</Text>
      <TextInput
        style={styles.budgetInput}
        placeholder={`${currency.symbol} Enter amount`}
        placeholderTextColor={COLORS.textSub}
        keyboardType="numeric"
        value={customBudget}
        onChangeText={setCustomBudget}
      />
    </View>,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? COLORS.purple : COLORS.border }]} />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {steps[step]}
        </ScrollView>

        {/* Nav buttons */}
        <View style={styles.navRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, { flex: step === 0 ? 1 : 0.65 }, saving && { opacity: 0.7 }]}
            onPress={() => step < 2 ? setStep(s => s + 1) : handleDone()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.nextBtnText}>
                {step === 2 ? "Let's Go 🚀" : 'Continue →'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  progressBar: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, marginBottom: SPACING.sm },
  progressSeg: { flex: 1, height: rs(4), borderRadius: rs(2) },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingTop: sh(3), paddingBottom: SPACING.xl },
  stepWrap: { alignItems: 'center', width: '100%' },
  stepEmoji: { fontSize: clamp(ms(52), 40, 70), marginBottom: SPACING.lg },
  stepTitle: { fontSize: clamp(ms(24), 20, 30), fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  stepSub: { fontSize: FONT.md, color: COLORS.textSub, textAlign: 'center', marginBottom: sh(3) },
  bigInput: { width: '100%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, fontSize: FONT.xl, color: COLORS.text, fontWeight: '600', borderWidth: 1, borderColor: COLORS.border, textAlign: 'center' },
  optionRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  optionRowActive: { borderColor: COLORS.purple, backgroundColor: COLORS.purple + '18' },
  optionSymbol: { fontSize: FONT.xl, fontWeight: '800', color: COLORS.text, width: rs(36), textAlign: 'center' },
  optionLabel: { fontSize: FONT.md, fontWeight: '600', color: COLORS.text },
  optionCode: { fontSize: FONT.xs, color: COLORS.textSub },
  budgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center', marginBottom: SPACING.lg, width: '100%' },
  budgetPill: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  budgetPillActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  budgetText: { fontSize: FONT.lg, fontWeight: '700', color: COLORS.textSub },
  budgetTextActive: { color: '#FFF' },
  orText: { fontSize: FONT.xs, color: COLORS.textSub, marginBottom: SPACING.md, marginTop: SPACING.xs },
  budgetInput: { width: '100%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, fontSize: FONT.lg, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, textAlign: 'center' },
  navRow: { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.xl, paddingBottom: sh(3), paddingTop: SPACING.md },
  backBtn: { flex: 0.35, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  backBtnText: { fontSize: FONT.md, color: COLORS.textSub, fontWeight: '600' },
  nextBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  nextBtnText: { fontSize: FONT.lg, fontWeight: '800', color: '#FFF' },
});
