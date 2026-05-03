import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { COLORS, rs, ms, sw, sh, SPACING, FONT, RADIUS, SCREEN, clamp } from '../utils/responsive';

const SLIDES = [
  {
    id: '1', emoji: '💸',
    title: 'Track Your\nMoney Flow',
    subtitle: 'Every rupee tracked. Know exactly where your money flows every single day.',
    accent: COLORS.primary,
    stats: [
      { label: 'Today', value: '₹1,850', icon: '📅', color: COLORS.primary },
      { label: 'This Month', value: '₹29,750', icon: '📊', color: COLORS.secondary },
      { label: 'Saved', value: '₹48,750', icon: '🌿', color: COLORS.accent },
    ],
  },
  {
    id: '2', emoji: '📊',
    title: 'Smart Analytics\nBeautifully',
    subtitle: 'Visual charts and insights help you understand and improve your spending habits.',
    accent: COLORS.secondary,
    stats: [
      { label: 'Food', value: '42%', icon: '🍔', color: COLORS.orange },
      { label: 'Transport', value: '20%', icon: '🚗', color: COLORS.secondary },
      { label: 'Shopping', value: '16%', icon: '🛍️', color: COLORS.pink },
    ],
  },
  {
    id: '3', emoji: '🎯',
    title: 'Set Goals\n& Grow',
    subtitle: 'Dream big. Set financial goals and watch your savings grow mint-fresh every day.',
    accent: COLORS.accent,
    stats: [
      { label: 'Goa Trip', value: '50%', icon: '🏖️', color: COLORS.primary },
      { label: 'New Bike', value: '50%', icon: '🏍️', color: COLORS.pink },
      { label: 'Emergency', value: '75%', icon: '🏠', color: COLORS.accent },
    ],
  },
];

interface Props { onGetStarted: () => void; }

export default function OnboardingScreen({ onGetStarted }: Props) {
  const [idx, setIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const go = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setIdx(next); slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
      ]).start();
    });
  };

  const slide = SLIDES[idx];
  const emojiSize = clamp(sw(38), 120, 200);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={[styles.blob1, { backgroundColor: slide.accent + '12', width: sw(70), height: sw(70), borderRadius: sw(35) }]} />
      <View style={[styles.blob2, { backgroundColor: slide.accent + '08', width: sw(50), height: sw(50), borderRadius: sw(25) }]} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
            <Text style={styles.logoText}>FlowMint</Text>
          </View>
          <TouchableOpacity onPress={onGetStarted} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.emojiWrap, { width: emojiSize, height: emojiSize, borderRadius: emojiSize / 2, backgroundColor: slide.accent + '15', borderColor: slide.accent + '40' }]}>
            <Text style={{ fontSize: emojiSize * 0.42 }}>{slide.emoji}</Text>
            <View style={[styles.badge, styles.badgeTR, { backgroundColor: slide.accent }]}>
              <Text style={styles.badgeText}>Smart</Text>
            </View>
            <View style={[styles.badge, styles.badgeBL, { backgroundColor: COLORS.card }]}>
              <Text style={[styles.badgeText, { color: slide.accent }]}>Mint Fresh</Text>
            </View>
          </View>

          <Text style={[styles.title, { fontSize: clamp(ms(26), 20, 34) }]}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>

          <View style={styles.statsRow}>
            {slide.stats.map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1} adjustsFontSizeToFit>{s.value}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => i !== idx && go(i)}>
                <View style={[styles.dot, i === idx && { width: sw(6), backgroundColor: slide.accent }]} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cta, { backgroundColor: slide.accent }]}
            onPress={() => idx < SLIDES.length - 1 ? go(idx + 1) : onGetStarted()}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{idx === SLIDES.length - 1 ? "Start Flowing 🌿" : 'Continue →'}</Text>
          </TouchableOpacity>

          <View style={styles.pills}>
            {['🔒 Secure', '📱 Offline', '🆓 Free'].map((p, i) => (
              <View key={i} style={styles.pill}><Text style={styles.pillText}>{p}</Text></View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  blob1: { position: 'absolute', top: -sw(15), right: -sw(15) },
  blob2: { position: 'absolute', bottom: sh(10), left: -sw(10) },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.xs },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logoIcon: { width: rs(32), height: rs(32), borderRadius: rs(10), backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: ms(18) },
  logoText: { fontSize: FONT.xl, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
  skipBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: rs(20), backgroundColor: COLORS.card },
  skipText: { fontSize: FONT.sm, color: COLORS.textSub, fontWeight: '600' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  emojiWrap: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: sh(2) },
  badge: { position: 'absolute', paddingHorizontal: rs(10), paddingVertical: rs(4), borderRadius: rs(20) },
  badgeTR: { top: rs(10), right: -rs(6) },
  badgeBL: { bottom: rs(10), left: -rs(6) },
  badgeText: { fontSize: FONT.xs, fontWeight: '700', color: '#000' },
  title: { fontWeight: '800', color: COLORS.text, textAlign: 'center', lineHeight: clamp(ms(34), 26, 44), marginBottom: SPACING.sm, marginTop: sh(1.5) },
  subtitle: { fontSize: clamp(ms(13), 11, 16), color: COLORS.textSub, textAlign: 'center', lineHeight: clamp(ms(20), 16, 26), marginBottom: sh(2.5), paddingHorizontal: SPACING.sm },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, width: '100%' },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, paddingVertical: sh(1.2), paddingHorizontal: SPACING.sm, alignItems: 'center', gap: rs(3), borderWidth: 1, borderColor: COLORS.border },
  statIcon: { fontSize: FONT.xl },
  statValue: { fontSize: FONT.md, fontWeight: '800', width: '100%', textAlign: 'center' },
  statLabel: { fontSize: FONT.xs, color: COLORS.textSub, textAlign: 'center' },
  bottom: { paddingHorizontal: SPACING.xl, paddingBottom: sh(2) },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm, marginBottom: sh(1.5) },
  dot: { width: sw(2.2), height: rs(8), borderRadius: rs(4), backgroundColor: COLORS.border },
  cta: { borderRadius: RADIUS.xl, paddingVertical: sh(1.8), alignItems: 'center', marginBottom: sh(1.2), elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: rs(4) }, shadowOpacity: 0.4, shadowRadius: rs(10) },
  ctaText: { fontSize: FONT.lg, fontWeight: '800', color: '#000', letterSpacing: 0.3 },
  pills: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md },
  pill: { backgroundColor: COLORS.card, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: rs(20), borderWidth: 1, borderColor: COLORS.border },
  pillText: { fontSize: FONT.xs, color: COLORS.textSub, fontWeight: '500' },
});
