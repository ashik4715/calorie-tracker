import type { MealEntry, MealType } from '../types/index.js';
import { getMealTypeColor, getMealTypeLabel } from '../utils/index.js';

interface MealSectionProps {
  mealType: MealType;
  entries: MealEntry[];
  onAddFood: (mealType: MealType) => void;
}

export const MealSection = ({ mealType, entries, onAddFood }: MealSectionProps) => {
  const mealColor = getMealTypeColor(mealType);
  const mealLabel = getMealTypeLabel(mealType);
  
  const totalCalories = entries.reduce((sum, entry) => sum + (entry.calories * entry.quantity), 0);
  
  return (
    <view className="meal-section">
      <view className="meal-header">
        <view className="meal-title-container">
          <view 
            className="meal-color-indicator" 
            style={{ backgroundColor: mealColor }}
          />
          <text className="meal-title">{mealLabel}</text>
          <text className="meal-calories">{Math.round(totalCalories)} cal</text>
        </view>
        <text 
          className="add-food-btn"
          bindtap={() => onAddFood(mealType)}
        >
          + Add Food
        </text>
      </view>
      
      {entries.length > 0 && (
        <view className="meal-entries">
          {entries.map((entry) => (
            <view key={entry.id} className="meal-entry">
              <view className="meal-entry-info">
                <text className="food-name">{entry.foodName}</text>
                <text className="food-serving">
                  {entry.quantity} × {entry.serving}
                </text>
              </view>
              <view className="meal-entry-nutrition">
                <text className="nutrition-calories">
                  {Math.round(entry.calories * entry.quantity)} cal
                </text>
                <text className="nutrition-macros">
                  P: {Math.round(entry.protein * entry.quantity)}g | 
                  C: {Math.round(entry.carbs * entry.quantity)}g | 
                  F: {Math.round(entry.fat * entry.quantity)}g
                </text>
              </view>
            </view>
          ))}
        </view>
      )}
      
      {entries.length === 0 && (
        <view className="empty-meal">
          <text className="empty-meal-text">No food added yet</text>
        </view>
      )}
    </view>
  );
};
