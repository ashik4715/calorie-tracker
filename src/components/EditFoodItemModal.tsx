import { useState } from "@lynx-js/react";
import { VirtualKeyboard } from "./VirtualKeyboard.js";
import type { FoodItem } from "../types/index.js";

interface EditFoodItemModalProps {
  isVisible: boolean;
  foodItem: FoodItem | null;
  onSave: (updatedItem: FoodItem) => void;
  onDelete: (itemId: string) => void;
  onClose: () => void;
}

export const EditFoodItemModal = ({
  isVisible,
  foodItem,
  onSave,
  onDelete,
  onClose,
}: EditFoodItemModalProps) => {
  const [name, setName] = useState(foodItem?.name || "");
  const [calories, setCalories] = useState(foodItem?.calories?.toString() || "");
  const [protein, setProtein] = useState(foodItem?.protein?.toString() || "");
  const [carbs, setCarbs] = useState(foodItem?.carbs?.toString() || "");
  const [fat, setFat] = useState(foodItem?.fat?.toString() || "");
  const [serving, setServing] = useState(foodItem?.serving || "");

  const [showNameModal, setShowNameModal] = useState(false);
  const [showCaloriesModal, setShowCaloriesModal] = useState(false);
  const [showProteinModal, setShowProteinModal] = useState(false);
  const [showCarbsModal, setShowCarbsModal] = useState(false);
  const [showFatModal, setShowFatModal] = useState(false);
  const [showServingModal, setShowServingModal] = useState(false);

  if (!isVisible || !foodItem) return null;

  const handleSave = () => {
    const updatedItem: FoodItem = {
      ...foodItem,
      name,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
      serving,
    };
    onSave(updatedItem);
  };

  const handleDelete = () => {
    onDelete(foodItem.id);
  };

  return (
    <view className="edit-food-item-modal">
      <view className="edit-food-item-content">
        <view className="edit-food-item-header">
          <text className="edit-food-item-title">Edit Food Item</text>
          <text className="modal-close" bindtap={onClose}>×</text>
        </view>

        <view className="edit-food-item-body">
          <view className="edit-field">
            <text className="field-label">Name:</text>
            <text 
              className="field-input" 
              bindtap={() => setShowNameModal(true)}
            >
              {name || "Tap to edit"}
            </text>
          </view>

          <view className="edit-field">
            <text className="field-label">Calories:</text>
            <text 
              className="field-input" 
              bindtap={() => setShowCaloriesModal(true)}
            >
              {calories}
            </text>
          </view>

          <view className="edit-field">
            <text className="field-label">Protein (g):</text>
            <text 
              className="field-input" 
              bindtap={() => setShowProteinModal(true)}
            >
              {protein}
            </text>
          </view>

          <view className="edit-field">
            <text className="field-label">Carbs (g):</text>
            <text 
              className="field-input" 
              bindtap={() => setShowCarbsModal(true)}
            >
              {carbs}
            </text>
          </view>

          <view className="edit-field">
            <text className="field-label">Fat (g):</text>
            <text 
              className="field-input" 
              bindtap={() => setShowFatModal(true)}
            >
              {fat}
            </text>
          </view>

          <view className="edit-field">
            <text className="field-label">Serving:</text>
            <text 
              className="field-input" 
              bindtap={() => setShowServingModal(true)}
            >
              {serving || "Tap to edit"}
            </text>
          </view>
        </view>

        <view className="edit-food-item-actions">
          <text className="delete-button" bindtap={handleDelete}>
            Delete
          </text>
          <text className="save-button" bindtap={handleSave}>
            Save Changes
          </text>
        </view>
      </view>

      {/* Virtual Keyboards */}
      <VirtualKeyboard
        isVisible={showNameModal}
        placeholder="Enter food name"
        initialValue={name}
        onTextChange={(text: string) => setName(text)}
        onSubmit={() => setShowNameModal(false)}
        onClose={() => setShowNameModal(false)}
      />

      <VirtualKeyboard
        isVisible={showCaloriesModal}
        placeholder="Enter calories"
        initialValue={calories}
        onTextChange={(text: string) => setCalories(text)}
        onSubmit={() => setShowCaloriesModal(false)}
        onClose={() => setShowCaloriesModal(false)}
      />

      <VirtualKeyboard
        isVisible={showProteinModal}
        placeholder="Enter protein (g)"
        initialValue={protein}
        onTextChange={(text: string) => setProtein(text)}
        onSubmit={() => setShowProteinModal(false)}
        onClose={() => setShowProteinModal(false)}
      />

      <VirtualKeyboard
        isVisible={showCarbsModal}
        placeholder="Enter carbs (g)"
        initialValue={carbs}
        onTextChange={(text: string) => setCarbs(text)}
        onSubmit={() => setShowCarbsModal(false)}
        onClose={() => setShowCarbsModal(false)}
      />

      <VirtualKeyboard
        isVisible={showFatModal}
        placeholder="Enter fat (g)"
        initialValue={fat}
        onTextChange={(text: string) => setFat(text)}
        onSubmit={() => setShowFatModal(false)}
        onClose={() => setShowFatModal(false)}
      />

      <VirtualKeyboard
        isVisible={showServingModal}
        placeholder="Enter serving size"
        initialValue={serving}
        onTextChange={(text: string) => setServing(text)}
        onSubmit={() => setShowServingModal(false)}
        onClose={() => setShowServingModal(false)}
      />
    </view>
  );
};
