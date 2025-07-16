export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

export interface MealEntry {
  id: string;
  foodItemId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  mealType: MealType;
  date: string;
  serving: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: {
    breakfast: MealEntry[];
    lunch: MealEntry[];
    dinner: MealEntry[];
    snacks: MealEntry[];
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
}

export interface UserProfile {
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  // Authentication
  auth: AuthState;

  // App Data
  foodItems: FoodItem[];
  mealEntries: MealEntry[];
  userProfile: UserProfile;
  currentDate: string;
  isLoading: boolean;

  // Authentication Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuthStatus: () => Promise<void>;

  // Data Actions
  fetchState: () => Promise<void>;
  saveState: () => Promise<void>;
  addFoodItem: (foodItem: Omit<FoodItem, 'id'>) => void;
  addMealEntry: (entry: Omit<MealEntry, 'id'>) => void;
  updateProfile: (profile: UserProfile) => void;
  getDailySummary: () => DailySummary;
  changeDate: (date: string) => void;
  initialize: () => Promise<void>;
}
