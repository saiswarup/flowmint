import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useExpenses, Expense, Category } from '../context/ExpenseContext';
import { CATEGORIES, COLORS } from '../utils/categories';
import { SPACING, FONT, RADIUS, SCREEN, rs, ms, sw, sh, clamp, ICON } from '../utils/responsive';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultType?: 'expense' | 'income';
  editingExpense?: Expense | null;
}

const PAYMENT_METHODS = ['Cash', 'Bank Account', 'Savings', 'Investment'];

export default function AddExpenseModal({ visible, onClose, defaultType = 'expense', editingExpense }: Props) {
  const { addExpense, editExpense } = useExpenses();
  const isEditing = !!editingExpense;
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Food & Dining');
  const [note, setNote] = useState('');
  const [wallet, setWallet] = useState<'Cash' | 'Bank Account' | 'Investment' | 'Savings'>('Cash');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (editingExpense) {
      setType(editingExpense.type); setName(editingExpense.name);
      setAmount(editingExpense.amount.toString()); setSelectedCategory(editingExpense.category);
      setNote(editingExpense.note || ''); setWallet(editingExpense.wallet);
      setIsRecurring(editingExpense.isRecurring || false);
      setRecurringInterval(editingExpense.recurringInterval || 'monthly');
    } else {
      setType(defaultType); setName(''); setAmount(''); setNote('');
      setSelectedCategory('Food & Dining'); setWallet('Cash'); setIsRecurring(false);
    }
  }, [editingExpense, visible]);

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return; }
    const payload = {
      name: name.trim() || selectedCategory, amount: Math.round(amt),
      category: selectedCategory, date: editingExpense?.date || new Date().toISOString(),
      note: note.trim() || undefined, type, wallet, isRecurring,
      recurringInterval: isRecurring ? recurringInterval : undefined,
    };
    isEditing && editingExpense ? editExpense({ ...payload, id: editingExpense.id }) : addExpense(payload);
    onClose();
  };

  const ringSize = clamp(sw(40), 130, 190);
  const activeColor = type === 'expense' ? COLORS.pink : COLORS.primary;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ color: COLORS.textSub, fontSize: FONT.xl }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEditing ? '✏️ Edit Expense' : '🌿 Add Flow'}</Text>
            <View style={{ width: rs(36) }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
            <View style={styles.typeRow}>
              {(['expense', 'income'] as const).map(t => (
                <TouchableOpacity key={t} style={[styles.typeBtn, type === t && { backgroundColor: t === 'expense' ? COLORS.pink : COLORS.primary }]} onPress={() => setType(t)}>
                  <Text style={[styles.typeBtnText, type === t && { color: type === t && t === 'expense' ? '#FFF' : '#000' }]}>
                    {t === 'expense' ? '💸 Expense' : '💰 Income'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.ringWrap}>
              <View style={[styles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderColor: activeColor }]}>
                <Text style={[styles.ringSymbol, { color: activeColor }]}>₹</Text>
                <TextInput
                  style={[styles.amountInput, { fontSize: clamp(ms(38), 28, 52), color: activeColor }]}
                  placeholder="0" placeholderTextColor={COLORS.textSub}
                  keyboardType="numeric" value={amount} onChangeText={setAmount}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput style={styles.input} placeholder="What did you spend on?" placeholderTextColor={COLORS.textSub} value={name} onChangeText={setName} />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat.label} style={styles.catItem} onPress={() => setSelectedCategory(cat.label)}>
                    <View style={[styles.catIcon, { backgroundColor: selectedCategory === cat.label ? cat.color + '30' : cat.bg, borderWidth: selectedCategory === cat.label ? 2 : 1, borderColor: selectedCategory === cat.label ? cat.color : COLORS.border }]}>
                      <Text style={{ fontSize: FONT.xl }}>{cat.emoji}</Text>
                    </View>
                    <Text style={[styles.catName, selectedCategory === cat.label && { color: cat.color }]} numberOfLines={1}>{cat.label.split(' ')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <View style={styles.pillRow}>
                {PAYMENT_METHODS.map(p => (
                  <TouchableOpacity key={p} style={[styles.pill, wallet === p && styles.pillActive]} onPress={() => setWallet(p as any)}>
                    <Text style={[styles.pillText, wallet === p && styles.pillTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Note (optional)</Text>
              <TextInput style={[styles.input, styles.noteInput]} placeholder="Add a note..." placeholderTextColor={COLORS.textSub} value={note} onChangeText={setNote} multiline />
            </View>

            <View style={styles.field}>
              <TouchableOpacity style={styles.recurringRow} onPress={() => setIsRecurring(v => !v)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Recurring expense</Text>
                  <Text style={styles.fieldSub}>Auto-add on a schedule</Text>
                </View>
                <View style={[styles.toggle, isRecurring && { backgroundColor: COLORS.primary }]}>
                  <View style={[styles.thumb, isRecurring && styles.thumbOn]} />
                </View>
              </TouchableOpacity>
              {isRecurring && (
                <View style={styles.pillRow}>
                  {(['daily', 'weekly', 'monthly'] as const).map(i => (
                    <TouchableOpacity key={i} style={[styles.pill, recurringInterval === i && styles.pillActive]} onPress={() => setRecurringInterval(i)}>
                      <Text style={[styles.pillText, recurringInterval === i && styles.pillTextActive]}>{i.charAt(0).toUpperCase() + i.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={{ height: SPACING.lg }} />
          </ScrollView>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: activeColor }]} onPress={handleSave}>
            <Text style={[styles.saveBtnText, { color: type === 'income' ? '#000' : '#FFF' }]}>{isEditing ? '✓ Update' : '🌿 Save Flow'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl, paddingBottom: sh(4), maxHeight: '96%', borderWidth: 1, borderColor: COLORS.border },
  handle: { width: rs(36), height: rs(4), backgroundColor: COLORS.primary + '50', borderRadius: rs(2), alignSelf: 'center', marginBottom: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  closeBtn: { width: rs(36), height: rs(36), alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT.xl, fontWeight: '700', color: COLORS.text },
  typeRow: { flexDirection: 'row', backgroundColor: COLORS.card2, borderRadius: RADIUS.md, padding: rs(4), marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  typeBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center' },
  typeBtnText: { fontSize: FONT.md, fontWeight: '600', color: COLORS.textSub },
  ringWrap: { alignItems: 'center', marginBottom: SPACING.lg },
  ring: { borderWidth: clamp(rs(8), 6, 12), alignItems: 'center', justifyContent: 'center', gap: rs(2) },
  ringSymbol: { fontSize: FONT.xxl, fontWeight: '700' },
  amountInput: { fontWeight: '800', minWidth: rs(80), textAlign: 'center', padding: 0 },
  field: { marginBottom: SPACING.md },
  fieldLabel: { fontSize: FONT.xs, fontWeight: '700', color: COLORS.textSub, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.6 },
  fieldSub: { fontSize: FONT.xs, color: COLORS.textSub },
  input: { backgroundColor: COLORS.card2, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONT.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  noteInput: { height: rs(68), textAlignVertical: 'top' },
  catItem: { alignItems: 'center', marginRight: SPACING.md, width: rs(58) },
  catIcon: { width: rs(46), height: rs(46), borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: rs(4) },
  catName: { fontSize: FONT.xs, color: COLORS.textSub, textAlign: 'center' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
  pill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: rs(20), backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: FONT.xs, color: COLORS.textSub, fontWeight: '500' },
  pillTextActive: { color: '#000' },
  recurringRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  toggle: { width: rs(44), height: rs(24), borderRadius: rs(12), backgroundColor: COLORS.border, padding: rs(2), justifyContent: 'center' },
  thumb: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: '#FFF' },
  thumbOn: { alignSelf: 'flex-end' },
  saveBtn: { borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginTop: SPACING.sm },
  saveBtnText: { fontSize: FONT.lg, fontWeight: '800' },
});
