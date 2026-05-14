
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export type Category =
  | 'Food & Dining'
  | 'Transport'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health'
  | 'Education'
  | 'Rent'
  | 'Groceries'
  | 'Fuel'
  | 'Mobile Recharge'
  | 'Internet'
  | 'Electricity'
  | 'Water Bill'
  | 'Gas'
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Savings'
  | 'Investment'
  | 'Insurance'
  | 'Travel'
  | 'Subscription'
  | 'Gym'
  | 'Pet Care'
  | 'Kids'
  | 'Gifts'
  | 'Charity'
  | 'Other'
  | 'Stock';

export type WalletType =
  | 'Cash'
  | 'Bank Account'
  | 'Investment'
  | 'Savings';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string;
  note?: string;
  type: 'expense' | 'income';
  wallet: WalletType;

  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly';

  // Trading Fields
  tradeType?: 'profit' | 'loss';
  stockName?: string;
  entryPrice?: number;
  exitPrice?: number;
  quantity?: number;
  strategy?: string;
  lossReason?: string;
  mistake?: string;
  emotion?: string;
  riskReward?: string;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  deadline: string;
  color: string;
}

export interface Wallet {
  id: string;
  name: WalletType;
  balance: number;
  color: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  currency: string;
  currencySymbol: string;
  monthlyBudget: number;
  setupDone: boolean;
  notificationsEnabled: boolean;
  reminderTime: string;
  theme: 'dark' | 'light';
}

interface State {
  expenses: Expense[];
  goals: Goal[];
  wallets: Wallet[];
  profile: UserProfile;
}

type Action =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'EDIT_EXPENSE'; payload: Expense }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'LOAD_DATA'; payload: State }
  | { type: 'CLEAR_ALL_EXPENSES' };

const defaultProfile: UserProfile = {
  name: '',
  currency: 'INR',
  currencySymbol: '₹',
  monthlyBudget: 25000,
  setupDone: false,
  notificationsEnabled: true,
  reminderTime: '21:00',
  theme: 'dark',
};

const defaultWallets: Wallet[] = [
  {
    id: '1',
    name: 'Cash',
    balance: 10000,
    color: '#43D39E',
    icon: '💵',
  },
  {
    id: '2',
    name: 'Bank Account',
    balance: 42500,
    color: '#6C63FF',
    icon: '🏦',
  },
  {
    id: '3',
    name: 'Investment',
    balance: 125000,
    color: '#FF9F43',
    icon: '📈',
  },
  {
    id: '4',
    name: 'Savings',
    balance: 28000,
    color: '#FF6584',
    icon: '🐷',
  },
];

const defaultGoals: Goal[] = [
  {
    id: '1',
    name: 'Goa Trip',
    emoji: '✈️',
    target: 50000,
    saved: 25000,
    deadline: '2025-08-30',
    color: '#6C63FF',
  },
  {
    id: '2',
    name: 'New Bike',
    emoji: '🏍️',
    target: 80000,
    saved: 40000,
    deadline: '2025-12-15',
    color: '#FF6584',
  },
  {
    id: '3',
    name: 'Emergency Fund',
    emoji: '🔥',
    target: 20000,
    saved: 15000,
    deadline: '2025-11-30',
    color: '#43D39E',
  },
];

const initialState: State = {
  expenses: [],
  goals: defaultGoals,
  wallets: defaultWallets,
  profile: defaultProfile,
};

const KEYS = {
  profile: 'ss_profile_v4',
  expenses: 'ss_expenses_v4',
  goals: 'ss_goals_v4',
  wallets: 'ss_wallets_v4',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(
          e => e.id !== action.payload
        ),
      };

    case 'EDIT_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id
            ? action.payload
            : e
        ),
      };

    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload],
      };

    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.payload.id
            ? action.payload
            : g
        ),
      };

    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(
          g => g.id !== action.payload
        ),
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
      };

    case 'CLEAR_ALL_EXPENSES':
      return {
        ...state,
        expenses: [],
      };

    case 'LOAD_DATA':
      return action.payload;

    default:
      return state;
  }
}

interface ContextType {
  state: State;
  isLoading: boolean;

  addExpense: (
    e: Omit<Expense, 'id'>
  ) => void;

  deleteExpense: (
    id: string
  ) => void;

  editExpense: (
    e: Expense
  ) => void;

  addGoal: (
    g: Omit<Goal, 'id'>
  ) => void;

  updateGoal: (
    g: Goal
  ) => void;

  deleteGoal: (
    id: string
  ) => void;

  updateProfile: (
    p: Partial<UserProfile>
  ) => Promise<void>;

  clearAllExpenses: () => Promise<void>;

  getMonthExpenses: () => number;
  getMonthIncome: () => number;

  getTodayExpenses: () => Expense[];

  getExpensesByDate: (
    date: string
  ) => Expense[];

  formatAmount: (
    n: number
  ) => string;
}

const ExpenseContext =
  createContext<ContextType | null>(null);

async function saveKey(
  key: string,
  value: any
) {
  try {
    await AsyncStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (e) {
    console.warn('Save failed:', key, e);
  }
}

async function loadKey(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);

    return raw
      ? JSON.parse(raw)
      : null;
  } catch (e) {
    return null;
  }
}

export const ExpenseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    (async () => {
      try {
        const [
          profile,
          expenses,
          goals,
          wallets,
        ] = await Promise.all([
          loadKey(KEYS.profile),
          loadKey(KEYS.expenses),
          loadKey(KEYS.goals),
          loadKey(KEYS.wallets),
        ]);

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            profile:
              profile &&
              typeof profile === 'object'
                ? {
                    ...defaultProfile,
                    ...profile,
                  }
                : defaultProfile,

            expenses: Array.isArray(expenses)
              ? expenses
              : [],

            goals:
              Array.isArray(goals) &&
              goals.length > 0
                ? goals
                : defaultGoals,

            wallets:
              Array.isArray(wallets) &&
              wallets.length > 0
                ? wallets
                : defaultWallets,
          },
        });
      } catch (e) {
        console.warn('Load failed:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const addExpense = (
    e: Omit<Expense, 'id'>
  ) => {
    const expense: Expense = {
      ...e,
      id: Date.now().toString(),
    };

    dispatch({
      type: 'ADD_EXPENSE',
      payload: expense,
    });

    const updated = [
      expense,
      ...stateRef.current.expenses,
    ];

    saveKey(KEYS.expenses, updated);
  };

  const deleteExpense = (
    id: string
  ) => {
    dispatch({
      type: 'DELETE_EXPENSE',
      payload: id,
    });

    saveKey(
      KEYS.expenses,
      stateRef.current.expenses.filter(
        e => e.id !== id
      )
    );
  };

  const clearAllExpenses =
    async () => {
      dispatch({
        type: 'CLEAR_ALL_EXPENSES',
      });

      await saveKey(
        KEYS.expenses,
        []
      );
    };

  const editExpense = (
    e: Expense
  ) => {
    dispatch({
      type: 'EDIT_EXPENSE',
      payload: e,
    });

    saveKey(
      KEYS.expenses,
      stateRef.current.expenses.map(
        ex =>
          ex.id === e.id
            ? e
            : ex
      )
    );
  };

  const addGoal = (
    g: Omit<Goal, 'id'>
  ) => {
    const goal: Goal = {
      ...g,
      id: Date.now().toString(),
    };

    dispatch({
      type: 'ADD_GOAL',
      payload: goal,
    });

    saveKey(KEYS.goals, [
      ...stateRef.current.goals,
      goal,
    ]);
  };

  const updateGoal = (
    g: Goal
  ) => {
    dispatch({
      type: 'UPDATE_GOAL',
      payload: g,
    });

    saveKey(
      KEYS.goals,
      stateRef.current.goals.map(
        goal =>
          goal.id === g.id
            ? g
            : goal
      )
    );
  };

  const deleteGoal = (
    id: string
  ) => {
    dispatch({
      type: 'DELETE_GOAL',
      payload: id,
    });

    saveKey(
      KEYS.goals,
      stateRef.current.goals.filter(
        g => g.id !== id
      )
    );
  };

  const updateProfile = async (
    p: Partial<UserProfile>
  ) => {
    const updated = {
      ...stateRef.current.profile,
      ...p,
    };

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: p,
    });

    await saveKey(
      KEYS.profile,
      updated
    );
  };

  const getMonthExpenses = () => {
    const now = new Date();

    return state.expenses
      .filter(e => {
        const d = new Date(e.date);

        return (
          e.type === 'expense' &&
          d.getMonth() ===
            now.getMonth() &&
          d.getFullYear() ===
            now.getFullYear()
        );
      })
      .reduce(
        (s, e) => s + e.amount,
        0
      );
  };

  const getMonthIncome = () => {
    const now = new Date();

    return state.expenses
      .filter(e => {
        const d = new Date(e.date);

        return (
          e.type === 'income' &&
          d.getMonth() ===
            now.getMonth() &&
          d.getFullYear() ===
            now.getFullYear()
        );
      })
      .reduce(
        (s, e) => s + e.amount,
        0
      );
  };

  const getTodayExpenses = () => {
    const today =
      new Date().toDateString();

    return state.expenses.filter(
      e =>
        new Date(
          e.date
        ).toDateString() === today
    );
  };

  const getExpensesByDate = (
    date: string
  ) =>
    state.expenses.filter(
      e =>
        new Date(
          e.date
        ).toDateString() ===
        new Date(
          date
        ).toDateString()
    );

  const formatAmount = (
    n: number
  ) =>
    `${state.profile.currencySymbol}${n.toLocaleString(
      'en-IN'
    )}`;

  return (
    <ExpenseContext.Provider
      value={{
        state,
        isLoading,

        addExpense,
        deleteExpense,
        editExpense,

        addGoal,
        updateGoal,
        deleteGoal,

        updateProfile,
        clearAllExpenses,

        getMonthExpenses,
        getMonthIncome,

        getTodayExpenses,
        getExpensesByDate,

        formatAmount,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const ctx =
    useContext(ExpenseContext);

  if (!ctx) {
    throw new Error(
      'useExpenses must be used within ExpenseProvider'
    );
  }

  return ctx;
};
