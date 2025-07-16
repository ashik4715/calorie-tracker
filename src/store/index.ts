import { create } from 'zustand';
import { apiService } from '../services/api.js';
import type { AppState, FoodItem, MealEntry, User, UserProfile } from '../types/index.js';
import { calculateDailySummary, generateId, getTodayDate } from '../utils/index.js';

const STORAGE_KEY = 'calorie_tracker_state';
const AUTH_STORAGE_KEY = 'calorie_tracker_auth';

const memoryStorage: Record<string, string> = {};

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = memoryStorage[key];
      return value || null;
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (value && value.trim()) {
        memoryStorage[key] = value;
      } else {
        delete memoryStorage[key];
      }
    } catch (error) {
      console.warn('Storage setItem error:', error);
    }
  }
};

// Optional helper
const safeParse = <T = any>(json: string): T | null => {
  try {
    if (typeof json !== 'string' || json.trim() === '' || json.trim() === 'undefined') {
      console.warn('[safeParse] Invalid JSON string input:', json);
      return null;
    }
    return JSON.parse(json);
  } catch (err) {
    console.warn('[safeParse] JSON.parse failed:', err, 'Input:', json);
    return null;
  }
};

export const useStore = create<AppState>((set, get) => ({
  foodItems: [],
  mealEntries: [],
  userProfile: {
    dailyCalorieGoal: 2000,
    dailyProteinGoal: 150,
    dailyCarbsGoal: 250,
    dailyFatGoal: 70,
  },
  currentDate: getTodayDate(),
  isLoading: false,

  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    error: null,
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.login(email, password);
      set({
        auth: {
          isAuthenticated: true,
          user: response.user,
          token: response.token,
          isLoading: false,
          error: null,
        },
        isLoading: false,
      });
      await storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
    } catch (e) {
      set((state) => ({
        auth: {
          ...state.auth,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Login failed',
        },
        isLoading: false,
      }));
      throw e;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.signup(name, email, password);
      set({
        auth: {
          isAuthenticated: true,
          user: response.user,
          token: response.token,
          isLoading: false,
          error: null,
        },
        isLoading: false,
      });
      await storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
    } catch (e) {
      set((state) => ({
        auth: {
          ...state.auth,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Signup failed',
        },
        isLoading: false,
      }));
      throw e;
    }
  },

  logout: async () => {
    set({
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      }
    });
    // Store `null` instead of empty string to avoid JSON.parse issues
    await storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(null));
  },

  updateUser: (user: User) => {
    set((state) => ({
      auth: {
        ...state.auth,
        user,
      }
    }));
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const raw = await storage.getItem(AUTH_STORAGE_KEY);

      // ✅ Check for null first
      if (!raw) {
        console.warn('[checkAuthStatus] No auth data found.');
        set({
          auth: {
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
          },
          isLoading: false,
        });
        return;
      }

      const auth = safeParse(raw); // now safeParse gets only a non-null string

      if (auth && typeof auth === 'object' && 'token' in auth) {
        set({
          auth: {
            isAuthenticated: !!auth.token,
            user: auth.user,
            token: auth.token,
            isLoading: false,
            error: null,
          },
          isLoading: false,
        });
      } else {
        console.warn('[checkAuthStatus] Invalid auth structure:', auth);
        set({
          auth: {
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
          },
          isLoading: false,
        });
      }
    } catch (e) {
      console.warn('[checkAuthStatus] Unexpected error:', e);
      set({
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Auth check failed',
        },
        isLoading: false,
      });
    }
  },

  fetchState: async () => {
    set({ isLoading: true });
    try {
      const json = await storage.getItem(STORAGE_KEY);
      const state = json && json.trim() ? safeParse(json) : null;

      if (state) {
        set({
          foodItems: state.foodItems || [],
          mealEntries: state.mealEntries || [],
          userProfile: state.userProfile || {
            dailyCalorieGoal: 2000,
            dailyProteinGoal: 150,
            dailyCarbsGoal: 250,
            dailyFatGoal: 70,
          },
          currentDate: state.currentDate || getTodayDate(),
          isLoading: false,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch state:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  saveState: async () => {
    try {
      const state = get();
      const json = JSON.stringify(state);
      await storage.setItem(STORAGE_KEY, json);
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  },

  addFoodItem: (foodItem: Omit<FoodItem, 'id'>) => {
    const newItem = { ...foodItem, id: generateId() };
    set((state) => ({ foodItems: [...state.foodItems, newItem] }));
    get().saveState();
  },

  addMealEntry: (entry: Omit<MealEntry, 'id'>) => {
    const newEntry = { ...entry, id: generateId() };
    set((state) => ({ mealEntries: [...state.mealEntries, newEntry] }));
    get().saveState();
  },

  updateProfile: (profile: UserProfile) => {
    set(() => ({ userProfile: profile }));
    get().saveState();
  },

  getDailySummary: () => {
    const { mealEntries, currentDate } = get();
    return calculateDailySummary(mealEntries, currentDate);
  },

  changeDate: (date: string) => {
    set({ currentDate: date });
  },

  initialize: async () => {
    await get().fetchState();
    await get().checkAuthStatus();
  },

}));
