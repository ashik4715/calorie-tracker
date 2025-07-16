import type { MealEntry, DailySummary, MealType } from '../types/index.js';

export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const formatDate = (date: string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const calculateDailySummary = (mealEntries: MealEntry[], date: string): DailySummary => {
  const dayEntries = mealEntries.filter(entry => entry.date === date);
  
  const meals: DailySummary['meals'] = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  };
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  dayEntries.forEach(entry => {
    const mealType = entry.mealType as MealType;
    meals[mealType].push(entry);
    
    const multiplier = entry.quantity;
    totalCalories += entry.calories * multiplier;
    totalProtein += entry.protein * multiplier;
    totalCarbs += entry.carbs * multiplier;
    totalFat += entry.fat * multiplier;
  });
  
  return {
    date,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFat: Math.round(totalFat),
    meals
  };
};

export const calculatePercentage = (current: number, goal: number): number => {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

export const getMealTypeColor = (mealType: MealType): string => {
  switch (mealType) {
    case 'breakfast':
      return '#FFB347'; // Orange
    case 'lunch':
      return '#87CEEB'; // Sky Blue
    case 'dinner':
      return '#DDA0DD'; // Plum
    case 'snacks':
      return '#98FB98'; // Pale Green
    default:
      return '#D3D3D3'; // Light Gray
  }
};

export const getMealTypeLabel = (mealType: MealType): string => {
  switch (mealType) {
    case 'breakfast':
      return 'Breakfast';
    case 'lunch':
      return 'Lunch';
    case 'dinner':
      return 'Dinner';
    case 'snacks':
      return 'Snacks';
    default:
      return 'Unknown';
  }
};
