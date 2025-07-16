import { useCallback, useState } from "@lynx-js/react";
import { EditFoodItemModal } from "../components/EditFoodItemModal.js";
import { FoodItem } from "../components/FoodItem.js";
import { useStore } from "../store/index.js";
import type { FoodItem as FoodItemType } from "../types/index.js";

interface FoodDatabaseScreenProps {
  onBack?: () => void;
}

export const FoodDatabaseScreen = ({ onBack }: FoodDatabaseScreenProps) => {
  const { foodItems } = useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItemType | null>(
    null
  );

  const onSelectFood = useCallback((foodItem: FoodItemType) => {
    // Add logic to select food and add to meal
    console.log(`Selected food: ${foodItem.name}`);
  }, []);

  const handleEditFood = (foodItem: FoodItemType) => {
    setSelectedFoodItem(foodItem);
    setShowEditModal(true);
  };

  const handleSaveFood = (updatedItem: FoodItemType) => {
    // Update food item in database
    console.log("Saving food item:", updatedItem);
    setShowEditModal(false);
    setSelectedFoodItem(null);
  };

  const handleDeleteFood = (itemId: string) => {
    // Delete food item from database
    console.log("Deleting food item:", itemId);
    setShowEditModal(false);
    setSelectedFoodItem(null);
  };

  return (
    <view className="food-database-screen">
      {onBack && (
        <text className="back-button" bindtap={onBack}>
          ← Back
        </text>
      )}
      <text className="screen-title">Food Database</text>
      <scroll-view className="food-list" scroll-y={true}>
        {foodItems.map((food) => (
          <view key={food.id} className="food-database-item">
            <FoodItem food={food} onSelect={onSelectFood} />
            <view className="food-item-actions">
              <text
                className="edit-food-button"
                bindtap={() => handleEditFood(food)}
              >
                ✏️ Edit
              </text>
              <text
                className="delete-food-button"
                bindtap={() => handleDeleteFood(food.id)}
              >
                🗑️ Delete
              </text>
            </view>
          </view>
        ))}
      </scroll-view>

      <EditFoodItemModal
        isVisible={showEditModal}
        foodItem={selectedFoodItem}
        onSave={handleSaveFood}
        onDelete={handleDeleteFood}
        onClose={() => {
          setShowEditModal(false);
          setSelectedFoodItem(null);
        }}
      />
    </view>
  );
};
