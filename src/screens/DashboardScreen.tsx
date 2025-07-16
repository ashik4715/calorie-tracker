import { useCallback, useEffect, useState } from "@lynx-js/react";
import { EditFoodModal } from "../components/EditFoodModal.js";
import { apiService } from "../services/api.js";
import type {
  DailySummary,
  FoodItem,
  MealEntry,
  MealType,
} from "../types/index.js";

interface DashboardScreenProps {
  user: any;
  token: string;
  onLogout: () => void;
  onNavigateToProfile?: () => void;
}

export const DashboardScreen = ({
  user,
  token,
  onLogout,
  onNavigateToProfile,
}: DashboardScreenProps) => {
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("breakfast");
  const [showEditFood, setShowEditFood] = useState(false);
  const [selectedMealEntry, setSelectedMealEntry] = useState<MealEntry | null>(
    null
  );
  const [userProfile, setUserProfile] = useState(user);

  const fetchUserProfile = useCallback(async () => {
    try {
      const data = await apiService.getProfile(token);
      setUserProfile(data.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, [token]);

  const fetchDailySummary = useCallback(async () => {
    try {
      const data = await apiService.getDailySummary(token, currentDate);
      setDailySummary(data);
    } catch (error) {
      console.error("Failed to fetch daily summary:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, token]);

  const fetchFoodItems = useCallback(async () => {
    try {
      const items = await apiService.getFoodItems(token);
      setFoodItems(items);
    } catch (error) {
      console.error("Failed to fetch food items:", error);
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDailySummary(),
        fetchFoodItems(),
        fetchUserProfile(),
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchDailySummary, fetchFoodItems, fetchUserProfile]);

  const addMealEntry = async (foodItem: FoodItem, quantity: number) => {
    try {
      const mealEntry = {
        foodItemId: foodItem.id,
        foodName: foodItem.name,
        calories: foodItem.calories * quantity,
        protein: foodItem.protein * quantity,
        carbs: foodItem.carbs * quantity,
        fat: foodItem.fat * quantity,
        quantity,
        mealType: selectedMealType,
        serving: foodItem.serving,
        date: currentDate,
      };

      await apiService.addMealEntry(token, mealEntry);
      await fetchDailySummary();
      setShowAddFood(false);
    } catch (error) {
      console.error("Failed to add meal entry:", error);
    }
  };

  const handleEditMealEntry = (mealEntry: MealEntry) => {
    setSelectedMealEntry(mealEntry);
    setShowEditFood(true);
  };

  const handleUpdateMealEntry = async (updatedEntry: MealEntry) => {
    try {
      await apiService.updateMealEntry(token, updatedEntry.id, updatedEntry);
      await fetchDailySummary();
      setShowEditFood(false);
      setSelectedMealEntry(null);
    } catch (error) {
      console.error("Failed to update meal entry:", error);
    }
  };

  const handleDeleteMealEntry = async (entryId: string) => {
    try {
      await apiService.deleteMealEntry(token, entryId);
      await fetchDailySummary();
      setShowEditFood(false);
      setSelectedMealEntry(null);
    } catch (error) {
      console.error("Failed to delete meal entry:", error);
    }
  };

  const calorieProgress =
    dailySummary && userProfile?.dailyCalorieGoal
      ? (dailySummary.totalCalories / userProfile.dailyCalorieGoal) * 100
      : 0;

  if (isLoading) {
    return (
      <view className="dashboard-screen">
        <view className="loading-container">
          <text className="loading-text">Loading your dashboard...</text>
        </view>
      </view>
    );
  }

  return (
    <view className="dashboard-screen">
      {/* Header */}
      <view className="dashboard-header">
        <view className="header-content">
          <text className="welcome-text">Hello, {user.name}!</text>
          <text className="date-text">
            {new Date(currentDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </text>
        </view>
        <view className="header-actions">
          {onNavigateToProfile && (
            <text className="profile-button" bindtap={onNavigateToProfile}>
              Profile
            </text>
          )}
          <text className="logout-button" bindtap={onLogout}>
            Logout
          </text>
        </view>
      </view>

      <scroll-view className="dashboard-content" scroll-y={true}>
        {/* Calorie Progress Circle */}
        <view className="calorie-progress-section">
          <view className="progress-circle">
            <view className="progress-inner">
              <text className="calories-consumed">
                {dailySummary?.totalCalories || 0}
              </text>
              <text className="calories-goal">
                / {userProfile?.dailyCalorieGoal || 2000}
              </text>
              <text className="calories-label">calories</text>
            </view>
          </view>
          <view className="progress-bar">
            <view
              className="progress-fill"
              style={{ width: `${Math.min(calorieProgress, 100)}%` }}
            ></view>
          </view>
        </view>

        {/* Macros Summary */}
        <view className="macros-section">
          <view className="macro-item">
            <text className="macro-value">
              {dailySummary?.totalProtein || 0}g
            </text>
            <text className="macro-label">Protein</text>
          </view>
          <view className="macro-item">
            <text className="macro-value">
              {dailySummary?.totalCarbs || 0}g
            </text>
            <text className="macro-label">Carbs</text>
          </view>
          <view className="macro-item">
            <text className="macro-value">{dailySummary?.totalFat || 0}g</text>
            <text className="macro-label">Fat</text>
          </view>
        </view>

        {/* Meals Section */}
        <view className="meals-section">
          <text className="section-title">Today's Meals</text>

          {(["breakfast", "lunch", "dinner", "snacks"] as MealType[]).map(
            (mealType) => (
              <view key={mealType} className="meal-card">
                <view className="meal-header">
                  <text className="meal-title">
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </text>
                  <text
                    className="add-food-button"
                    bindtap={() => {
                      setSelectedMealType(mealType);
                      setShowAddFood(true);
                    }}
                  >
                    + Add Food
                  </text>
                </view>

                <view className="meal-entries">
                  {dailySummary?.meals[mealType]?.length ? (
                    dailySummary.meals[mealType].map((entry: MealEntry) => (
                      <view key={entry.id} className="meal-entry">
                        <view className="meal-entry-info">
                          <text className="food-name">{entry.foodName}</text>
                          <text className="food-details">
                            {entry.quantity} × {entry.serving} -{" "}
                            {Math.round(entry.calories * entry.quantity)} cal
                          </text>
                        </view>
                        <view className="meal-entry-actions">
                          <text
                            className="edit-entry-button"
                            bindtap={() => handleEditMealEntry(entry)}
                          >
                            ✏️
                          </text>
                          <text
                            className="delete-entry-button"
                            bindtap={() => handleDeleteMealEntry(entry.id)}
                          >
                            🗑️
                          </text>
                        </view>
                      </view>
                    ))
                  ) : (
                    <text className="no-meals">No meals logged yet</text>
                  )}
                </view>
              </view>
            )
          )}
        </view>

        {/* Add Food Modal */}
        {showAddFood && (
          <view className="add-food-modal">
            <view className="modal-content">
              <view className="modal-header">
                <text className="modal-title">Add to {selectedMealType}</text>
                <text
                  className="close-button"
                  bindtap={() => setShowAddFood(false)}
                >
                  ×
                </text>
              </view>

              <view className="food-list">
                {foodItems.map((food) => (
                  <view key={food.id} className="food-item">
                    <view className="food-info">
                      <text className="food-name">{food.name}</text>
                      <text className="food-nutrition">
                        {food.calories} cal, {food.protein}g protein -{" "}
                        {food.serving}
                      </text>
                    </view>
                    <text
                      className="add-button"
                      bindtap={() => addMealEntry(food, 1)}
                    >
                      Add
                    </text>
                  </view>
                ))}
              </view>
            </view>
          </view>
        )}

        <EditFoodModal
          isVisible={showEditFood}
          mealEntry={selectedMealEntry}
          onSave={handleUpdateMealEntry}
          onDelete={handleDeleteMealEntry}
          onClose={() => {
            setShowEditFood(false);
            setSelectedMealEntry(null);
          }}
        />
      </scroll-view>
    </view>
  );
};
