import { useState } from "@lynx-js/react";
import { VirtualKeyboard } from "./VirtualKeyboard.js";
import type { MealEntry } from "../types/index.js";

interface EditFoodModalProps {
  isVisible: boolean;
  mealEntry: MealEntry | null;
  onSave: (updatedEntry: MealEntry) => void;
  onDelete: (entryId: string) => void;
  onClose: () => void;
}

export const EditFoodModal = ({
  isVisible,
  mealEntry,
  onSave,
  onDelete,
  onClose,
}: EditFoodModalProps) => {
  const [quantity, setQuantity] = useState(mealEntry?.quantity?.toString() || "1");
  const [showQuantityModal, setShowQuantityModal] = useState(false);

  if (!isVisible || !mealEntry) return null;

  const handleSave = () => {
    const updatedEntry: MealEntry = {
      ...mealEntry,
      quantity: parseFloat(quantity),
      calories: (mealEntry.calories / mealEntry.quantity) * parseFloat(quantity),
      protein: (mealEntry.protein / mealEntry.quantity) * parseFloat(quantity),
      carbs: (mealEntry.carbs / mealEntry.quantity) * parseFloat(quantity),
      fat: (mealEntry.fat / mealEntry.quantity) * parseFloat(quantity),
    };
    onSave(updatedEntry);
  };

  const handleDelete = () => {
    onDelete(mealEntry.id);
  };

  return (
    <view className="edit-food-modal">
      <view className="edit-food-content">
        <view className="edit-food-header">
          <text className="edit-food-title">Edit Food Item</text>
          <text className="modal-close" bindtap={onClose}>×</text>
        </view>

        <view className="edit-food-body">
          <view className="food-info">
            <text className="food-name">{mealEntry.foodName}</text>
            <text className="food-serving">{mealEntry.serving}</text>
          </view>

          <view className="edit-field">
            <text className="field-label">Quantity:</text>
            <text 
              className="field-input" 
              bindtap={() => setShowQuantityModal(true)}
            >
              {quantity}
            </text>
          </view>

          <view className="nutrition-preview">
            <text className="nutrition-title">Nutrition (for {quantity} serving{parseFloat(quantity) !== 1 ? 's' : ''}):</text>
            <view className="nutrition-grid">
              <view className="nutrition-item">
                <text className="nutrition-label">Calories</text>
                <text className="nutrition-value">
                  {Math.round((mealEntry.calories / mealEntry.quantity) * parseFloat(quantity))}
                </text>
              </view>
              <view className="nutrition-item">
                <text className="nutrition-label">Protein</text>
                <text className="nutrition-value">
                  {Math.round((mealEntry.protein / mealEntry.quantity) * parseFloat(quantity) * 10) / 10}g
                </text>
              </view>
              <view className="nutrition-item">
                <text className="nutrition-label">Carbs</text>
                <text className="nutrition-value">
                  {Math.round((mealEntry.carbs / mealEntry.quantity) * parseFloat(quantity) * 10) / 10}g
                </text>
              </view>
              <view className="nutrition-item">
                <text className="nutrition-label">Fat</text>
                <text className="nutrition-value">
                  {Math.round((mealEntry.fat / mealEntry.quantity) * parseFloat(quantity) * 10) / 10}g
                </text>
              </view>
            </view>
          </view>
        </view>

        <view className="edit-food-actions">
          <text className="delete-button" bindtap={handleDelete}>
            Delete
          </text>
          <text className="save-button" bindtap={handleSave}>
            Save Changes
          </text>
        </view>
      </view>

      <VirtualKeyboard
        isVisible={showQuantityModal}
        placeholder="Enter quantity"
        initialValue={quantity}
        onTextChange={(text: string) => setQuantity(text)}
        onSubmit={() => setShowQuantityModal(false)}
        onClose={() => setShowQuantityModal(false)}
      />
    </view>
  );
};
