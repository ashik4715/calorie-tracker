import { useState } from '@lynx-js/react';
import type { FoodItem, MealType } from '../types/index.js';
import { useStore } from '../store/index.js';

interface FoodSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMealType: MealType;
  foodItems: FoodItem[];
}

export const FoodSelectionModal = ({
  isVisible,
  onClose,
  selectedMealType,
  foodItems
}: FoodSelectionModalProps) => {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addMealEntry, currentDate } = useStore();

  const handleAddFood = () => {
    if (selectedFood) {
      addMealEntry({
        foodItemId: selectedFood.id,
        foodName: selectedFood.name,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        quantity: quantity,
        mealType: selectedMealType,
        date: currentDate,
        serving: selectedFood.serving
      });
      
      setSelectedFood(null);
      setQuantity(1);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <view className="modal-overlay">
      <view className="modal-content">
        <view className="modal-header">
          <text className="modal-title">Add Food to {selectedMealType}</text>
          <text className="modal-close" bindtap={onClose}>×</text>
        </view>
        
        <view className="modal-body">
          <view className="food-selection-list">
            {foodItems.map((food) => (
              <view
                key={food.id}
                className={`food-selection-item ${selectedFood?.id === food.id ? 'selected' : ''}`}
                bindtap={() => setSelectedFood(food)}
              >
                <view className="food-selection-info">
                  <text className="food-selection-name">{food.name}</text>
                  <text className="food-selection-serving">{food.serving}</text>
                </view>
                <view className="food-selection-nutrition">
                  <text className="food-selection-calories">{food.calories} cal</text>
                  <text className="food-selection-macros">
                    P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                  </text>
                </view>
              </view>
            ))}
          </view>
          
          {selectedFood && (
            <view className="quantity-selector">
              <text className="quantity-label">Quantity:</text>
              <view className="quantity-controls">
                <text
                  className="quantity-btn"
                  bindtap={() => setQuantity(Math.max(0.25, quantity - 0.25))}
                >
                  -
                </text>
                <text className="quantity-value">{quantity}</text>
                <text
                  className="quantity-btn"
                  bindtap={() => setQuantity(quantity + 0.25)}
                >
                  +
                </text>
              </view>
            </view>
          )}
        </view>
        
        <view className="modal-footer">
          <text className="modal-btn cancel" bindtap={onClose}>Cancel</text>
          <text
            className={`modal-btn add ${selectedFood ? 'enabled' : 'disabled'}`}
            bindtap={handleAddFood}
          >
            Add Food
          </text>
        </view>
      </view>
    </view>
  );
};
