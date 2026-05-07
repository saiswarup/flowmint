import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

import {
  useExpenses,
  Expense,
  Category,
} from '../context/ExpenseContext';

import {
  CATEGORIES,
  COLORS,
} from '../utils/categories';

import {
  SPACING,
  FONT,
  RADIUS,
  rs,
  ms,
  sw,
  sh,
  clamp,
} from '../utils/responsive';

interface Props {
  visible: boolean;
  onClose: () => void;
  defaultType?: 'expense' | 'income';
  editingExpense?: Expense | null;
}

const PAYMENT_METHODS = [
  {
    label: 'Cash',
    emoji: '💵',
  },
  {
    label: 'Bank Account',
    emoji: '🏦',
  },
  {
    label: 'Savings',
    emoji: '🌿',
  },
  {
    label: 'Investment',
    emoji: '📈',
  },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function AddExpenseModal({
  visible,
  onClose,
  defaultType = 'expense',
  editingExpense,
}: Props) {
  const { addExpense, editExpense } = useExpenses();

  const isEditing = !!editingExpense;

  const [type, setType] = useState<'expense' | 'income'>(defaultType);

  const [name, setName] = useState('');

  const [amount, setAmount] = useState('');

  const [selectedCategory, setSelectedCategory] =
    useState<Category>('Food & Dining');

  const [note, setNote] = useState('');

  const [wallet, setWallet] = useState<
    'Cash' | 'Bank Account' | 'Investment' | 'Savings'
  >('Cash');

  const [isRecurring, setIsRecurring] = useState(false);

  const [recurringInterval, setRecurringInterval] = useState<
    'daily' | 'weekly' | 'monthly'
  >('monthly');

  useEffect(() => {
    if (editingExpense) {
      setType(editingExpense.type);
      setName(editingExpense.name);
      setAmount(editingExpense.amount.toString());
      setSelectedCategory(editingExpense.category);
      setNote(editingExpense.note || '');
      setWallet(editingExpense.wallet);
      setIsRecurring(editingExpense.isRecurring || false);
      setRecurringInterval(
        editingExpense.recurringInterval || 'monthly'
      );
    } else {
      setType(defaultType);
      setName('');
      setAmount('');
      setNote('');
      setSelectedCategory('Food & Dining');
      setWallet('Cash');
      setIsRecurring(false);
    }
  }, [editingExpense, visible]);

  const activeColor =
    type === 'expense'
      ? COLORS.pink
      : COLORS.primary;

  const ringSize = clamp(sw(42), 145, 210);

  const handleSave = async () => {
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid amount.'
      );
      return;
    }

    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );

    const payload = {
      name: name.trim() || selectedCategory,
      amount: Math.round(amt),
      category: selectedCategory,
      date:
        editingExpense?.date ||
        new Date().toISOString(),
      note: note.trim() || undefined,
      type,
      wallet,
      isRecurring,
      recurringInterval: isRecurring
        ? recurringInterval
        : undefined,
    };

    if (isEditing && editingExpense) {
      editExpense({
        ...payload,
        id: editingExpense.id,
      });
    } else {
      addExpense(payload);
    }

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView
        intensity={40}
        tint="dark"
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <TouchableOpacity
            style={styles.backdrop}
            onPress={onClose}
            activeOpacity={1}
          />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>

              <View style={{ alignItems: 'center' }}>
                <Text style={styles.headerTitle}>
                  {isEditing
                    ? '✏️ Edit Flow'
                    : '🌿 Add Flow'}
                </Text>

                <Text style={styles.headerSub}>
                  Track your money smartly
                </Text>
              </View>

              <View style={{ width: rs(40) }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.typeRow}>
                {(['expense', 'income'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeBtn,
                      type === t && {
                        backgroundColor:
                          t === 'expense'
                            ? COLORS.pink
                            : COLORS.primary,
                      },
                    ]}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setType(t);
                    }}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        type === t && {
                          color:
                            t === 'expense'
                              ? '#FFF'
                              : '#000',
                        },
                      ]}
                    >
                      {t === 'expense'
                        ? '💸 Expense'
                        : '💰 Income'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.ringWrap}>
                <View
                  style={[
                    styles.amountGlow,
                    {
                      backgroundColor:
                        activeColor + '18',
                    },
                  ]}
                />

                <View
                  style={[
                    styles.ring,
                    {
                      width: ringSize,
                      height: ringSize,
                      borderRadius: ringSize / 2,
                      borderColor: activeColor,
                      shadowColor: activeColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.ringSymbol,
                      { color: activeColor },
                    ]}
                  >
                    ₹
                  </Text>

                  <TextInput
                    style={[
                      styles.amountInput,
                      {
                        color: activeColor,
                        fontSize: clamp(ms(40), 30, 56),
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor={COLORS.textSub}
                    keyboardType="number-pad"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
              </View>

              <Text style={styles.liveText}>
                {type === 'expense'
                  ? `Spending ₹${amount || 0}`
                  : `Income ₹${amount || 0}`}
              </Text>

              <View style={styles.quickAmounts}>
                {QUICK_AMOUNTS.map(v => (
                  <TouchableOpacity
                    key={v}
                    style={styles.quickChip}
                    onPress={() => setAmount(String(v))}
                  >
                    <Text style={styles.quickChipText}>
                      ₹{v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Description
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="What is this for?"
                  placeholderTextColor={COLORS.textSub}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Category
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {CATEGORIES.map(cat => {
                    const selected =
                      selectedCategory === cat.label;

                    return (
                      <TouchableOpacity
                        key={cat.label}
                        style={styles.catItem}
                        onPress={async () => {
                          await Haptics.selectionAsync();
                          setSelectedCategory(cat.label);
                        }}
                      >
                        <View
                          style={[
                            styles.catIcon,
                            {
                              backgroundColor: selected
                                ? cat.color + '25'
                                : cat.bg,
                              borderColor: selected
                                ? cat.color
                                : COLORS.border,
                              borderWidth: selected ? 2 : 1,
                              transform: [
                                {
                                  scale: selected
                                    ? 1.05
                                    : 1,
                                },
                              ],
                            },
                          ]}
                        >
                          <Text style={{ fontSize: FONT.xxl }}>
                            {cat.emoji}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.catName,
                            selected && {
                              color: cat.color,
                              fontWeight: '700',
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Payment Method
                </Text>

                <View style={styles.pillRow}>
                  {PAYMENT_METHODS.map(p => {
                    const selected = wallet === p.label;

                    return (
                      <TouchableOpacity
                        key={p.label}
                        style={[
                          styles.pill,
                          selected && {
                            backgroundColor:
                              activeColor + '22',
                            borderColor: activeColor,
                          },
                        ]}
                        onPress={async () => {
                          await Haptics.selectionAsync();
                          setWallet(p.label as any);
                        }}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            selected && {
                              color: activeColor,
                            },
                          ]}
                        >
                          {p.emoji} {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Note
                </Text>

                <TextInput
                  style={[styles.input, styles.noteInput]}
                  placeholder="Add note..."
                  placeholderTextColor={COLORS.textSub}
                  value={note}
                  onChangeText={setNote}
                  multiline
                />
              </View>

              <View style={styles.field}>
                <TouchableOpacity
                  style={styles.recurringRow}
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setIsRecurring(v => !v);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>
                      Recurring Flow
                    </Text>

                    <Text style={styles.fieldSub}>
                      Automatically repeat transaction
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.toggle,
                      isRecurring && {
                        backgroundColor: activeColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.thumb,
                        isRecurring && styles.thumbOn,
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {isRecurring && (
                  <View style={styles.pillRow}>
                    {(['daily', 'weekly', 'monthly'] as const).map(i => {
                      const selected = recurringInterval === i;

                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.pill,
                            selected && {
                              backgroundColor:
                                activeColor + '22',
                              borderColor: activeColor,
                            },
                          ]}
                          onPress={() =>
                            setRecurringInterval(i)
                          }
                        >
                          <Text
                            style={[
                              styles.pillText,
                              selected && {
                                color: activeColor,
                              },
                            ]}
                          >
                            {i.charAt(0).toUpperCase() +
                              i.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={{ height: rs(20) }} />
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: activeColor,
                  shadowColor: activeColor,
                },
              ]}
              onPress={handleSave}
            >
              <Text
                style={[
                  styles.saveBtnText,
                  {
                    color:
                      type === 'income'
                        ? '#000'
                        : '#FFF',
                  },
                ]}
              >
                {isEditing
                  ? '✓ Update Flow'
                  : '🌿 Save Flow'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  sheet: {
    backgroundColor: '#0B1720',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    paddingBottom: sh(5),
    maxHeight: '96%',
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  handle: {
    width: rs(42),
    height: rs(5),
    borderRadius: rs(10),
    backgroundColor: COLORS.primary + '55',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  closeBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: COLORS.card2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: COLORS.textSub,
    fontSize: FONT.xl,
  },

  headerTitle: {
    fontSize: FONT.xl,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerSub: {
    fontSize: FONT.sm,
    color: COLORS.textSub,
    marginTop: rs(2),
  },

  typeRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.lg,
    padding: rs(4),
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  typeBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  typeBtnText: {
    fontSize: FONT.md,
    fontWeight: '700',
    color: COLORS.textSub,
  },

  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },

  amountGlow: {
    position: 'absolute',
    width: rs(220),
    height: rs(220),
    borderRadius: rs(110),
  },

  ring: {
    borderWidth: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card2,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },

  ringSymbol: {
    fontSize: FONT.xxl,
    fontWeight: '800',
  },

  amountInput: {
    fontWeight: '900',
    minWidth: rs(100),
    textAlign: 'center',
    padding: 0,
  },

  liveText: {
    textAlign: 'center',
    color: COLORS.textSub,
    fontSize: FONT.sm,
    marginBottom: SPACING.md,
  },

  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(10),
    marginBottom: SPACING.xl,
  },

  quickChip: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(8),
    borderRadius: rs(20),
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  quickChipText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: FONT.sm,
  },

  field: {
    marginBottom: SPACING.lg,
  },

  fieldLabel: {
    fontSize: FONT.xs,
    fontWeight: '800',
    color: COLORS.textSub,
    marginBottom: SPACING.sm,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },

  fieldSub: {
    color: COLORS.textSub,
    fontSize: FONT.xs,
  },

  input: {
    backgroundColor: COLORS.card2,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONT.md,
  },

  noteInput: {
    height: rs(80),
    textAlignVertical: 'top',
  },

  catItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: rs(84),
  },

  catIcon: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rs(6),
  },

  catName: {
    fontSize: FONT.xs,
    color: COLORS.textSub,
    textAlign: 'center',
  },

  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },

  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: rs(30),
    backgroundColor: '#13242D',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  pillText: {
    color: COLORS.textSub,
    fontWeight: '700',
    fontSize: FONT.sm,
  },

  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  toggle: {
    width: rs(48),
    height: rs(26),
    borderRadius: rs(20),
    backgroundColor: COLORS.border,
    padding: rs(3),
    justifyContent: 'center',
  },

  thumb: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: '#FFF',
  },

  thumbOn: {
    alignSelf: 'flex-end',
  },

  saveBtn: {
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },

  saveBtnText: {
    fontSize: FONT.lg,
    fontWeight: '900',
  },
});