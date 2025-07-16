import type { FoodItem as FoodItemType } from '../types/index.js';

interface FoodItemProps {
  food: FoodItemType;
  onSelect: (food: FoodItemType) => void;
}

export const FoodItem = ({ food, onSelect }: FoodItemProps) => {
  return (
    <view className="food-item" bindtap={() => onSelect(food)}>
      <view className="food-item-main">
        <text className="food-name">{food.name}</text>
        <text className="food-serving">{food.serving}</text>
      </view>
      <view className="food-item-nutrition">
        <text className="food-calories">{food.calories} cal</text>
        <text className="food-macros">
          P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
        </text>
      </view>
    </view>
  );
};
