import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import TimelineScreen from './src/screens/TimelineScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import WalletScreen from './src/screens/WalletScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SetupScreen from './src/screens/SetupScreen';
import AddExpenseModal from './src/components/AddExpenseModal';
import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { COLORS, FONT, rs, ms, sw, sh } from './src/utils/responsive';
import AddTradeScreen from './src/screens/AddTradeScreen';

const Tab = createBottomTabNavigator();

const FlowMintTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: COLORS.bg, card: COLORS.card, text: COLORS.text, border: COLORS.border },
};

const NAV_ITEMS = [
  { name: 'Home',      icon: '🏠', label: 'Home' },
  { name: 'Timeline',  icon: '📋', label: 'Flow' },
  { name: 'Calendar',  icon: '📅', label: 'Calendar' },
  { name: 'FAB',       icon: '+',  label: '' },
  { name: 'Analytics', icon: '📊', label: 'Analytics' },
  { name: 'Wallet',    icon: '👛', label: 'Wallet' },
  { name: 'Settings',  icon: '⚙️', label: 'Settings' },
];

function CustomTabBar({ state, navigation }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;

  const onFabPress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(fabScale, { toValue: 0.85, useNativeDriver: true, speed: 40 }),
        Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]),
      Animated.timing(fabRotate, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => Animated.timing(fabRotate, { toValue: 0, duration: 0, useNativeDriver: true }).start());
    setShowAdd(true);
  };

  const LEFT_TABS = ['Home', 'Timeline', 'Calendar'];
  const RIGHT_TABS = ['Analytics', 'Wallet', 'Settings'];
  const FAB_SIZE = Math.min(rs(58), sw(14));
  const spin = fabRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  const TabBtn = ({ name }: { name: string }) => {
    const item = NAV_ITEMS.find(n => n.name === name)!;
    const route = state.routes.find((r: any) => r.name === name);
    const isFocused = route && state.index === state.routes.indexOf(route);
    return (
      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate(name)} activeOpacity={0.7}>
        <Text style={[styles.tabIcon, { opacity: isFocused ? 1 : 0.35 }]}>{item.icon}</Text>
        <Text style={[styles.tabLabel, { color: isFocused ? COLORS.primary : COLORS.textSub }]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={styles.tabBar}>
        {LEFT_TABS.map(name => <TabBtn key={name} name={name} />)}
        <View style={[styles.fabSlot, { width: FAB_SIZE + sw(4) }]}>
          <Animated.View style={{ transform: [{ scale: fabScale }] }}>
            <TouchableOpacity
              style={[styles.fab, { width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2 }]}
              onPress={onFabPress}
              activeOpacity={0.9}
            >
              <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: spin }] }]}>+</Animated.Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        {RIGHT_TABS.map(name => <TabBtn key={name} name={name} />)}
      </View>
      <AddExpenseModal visible={showAdd} onClose={() => setShowAdd(false)} defaultType="expense" />
    </>
  );
}

function EmptyScreen() { return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />; }

function MainApp() {
  return (
    <NavigationContainer theme={FlowMintTheme}>
      <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Timeline" component={TimelineScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="FAB" component={EmptyScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Wallet" component={WalletScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen
          name="AddTrade"
          component={AddTradeScreen}
          options={{
            tabBarButton: () => null,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const ONBOARDING_KEY = 'flowmint_onboarding_v1';

function AppInner() {
  const { state, isLoading } = useExpenses();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [appState, setAppState] = useState<'loading' | 'onboarding' | 'setup' | 'main'>('loading');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then(val => setOnboardingDone(val === 'true'))
      .catch(() => setOnboardingDone(false));
  }, []);

  useEffect(() => {
    if (isLoading || onboardingDone === null) return;
    let next: typeof appState;
    if (!onboardingDone) next = 'onboarding';
    else if (!state.profile.setupDone) next = 'setup';
    else next = 'main';
    transition(next);
  }, [isLoading, onboardingDone, state.profile.setupDone]);

  const transition = (next: typeof appState) => {
    fadeAnim.setValue(0);
    setAppState(next);
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  };

  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
    transition('setup');
  };

  if (appState === 'loading' || isLoading || onboardingDone === null) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashLogo}>
          <Text style={{ fontSize: rs(40) }}>🌿</Text>
        </View>
        <Text style={styles.splashTitle}>FlowMint</Text>
        <Text style={styles.splashSub}>Loading your finances...</Text>
        <View style={styles.splashDot} />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {appState === 'onboarding' && <OnboardingScreen onGetStarted={handleOnboardingDone} />}
      {appState === 'setup' && <SetupScreen onDone={() => transition('main')} />}
      {appState === 'main' && <MainApp />}
    </Animated.View>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <AppInner />
    </ExpenseProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', gap: rs(8) },
  splashLogo: { width: rs(80), height: rs(80), borderRadius: rs(24), backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.primary + '40', marginBottom: rs(4) },
  splashTitle: { color: COLORS.text, fontSize: ms(28), fontWeight: '800', letterSpacing: 1 },
  splashSub: { color: COLORS.textSub, fontSize: ms(13) },
  splashDot: { width: rs(6), height: rs(6), borderRadius: rs(3), backgroundColor: COLORS.primary, marginTop: rs(8) },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: sh(1.5), paddingTop: sh(0.8), alignItems: 'center', paddingHorizontal: sw(1) },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: rs(2), paddingVertical: rs(2) },
  tabIcon: { fontSize: ms(20) },
  tabLabel: { fontSize: ms(9), fontWeight: '600' },
  fabSlot: { alignItems: 'center', justifyContent: 'center', marginTop: -(rs(58) * 0.5) },
  fab: { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', elevation: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: rs(6) }, shadowOpacity: 0.6, shadowRadius: rs(14) },
  fabIcon: { fontSize: ms(30), color: '#000', fontWeight: '700', lineHeight: ms(34) },
});
