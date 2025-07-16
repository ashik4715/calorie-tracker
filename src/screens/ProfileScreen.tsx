import { useCallback, useEffect, useState } from "@lynx-js/react";
import { VirtualKeyboard } from "../components/VirtualKeyboard.js";
import { apiService } from "../services/api.js";
import type { User } from "../types/index.js";

interface ProfileScreenProps {
  user: User;
  token: string;
  onBack: () => void;
  onUserUpdate: (user: User) => void;
}

export const ProfileScreen = ({
  user,
  token,
  onBack,
  onUserUpdate,
}: ProfileScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(
    (user.dailyCalorieGoal || 2000).toString()
  );
  const [dailyProteinGoal, setDailyProteinGoal] = useState(
    (user.dailyProteinGoal || 150).toString()
  );
  const [dailyCarbsGoal, setDailyCarbsGoal] = useState(
    (user.dailyCarbsGoal || 250).toString()
  );
  const [dailyFatGoal, setDailyFatGoal] = useState(
    (user.dailyFatGoal || 65).toString()
  );

  // Update state when user prop changes
  useEffect(() => {
    setName(user.name || "");
    setEmail(user.email || "");
    setDailyCalorieGoal((user.dailyCalorieGoal || 2000).toString());
    setDailyProteinGoal((user.dailyProteinGoal || 150).toString());
    setDailyCarbsGoal((user.dailyCarbsGoal || 250).toString());
    setDailyFatGoal((user.dailyFatGoal || 65).toString());
  }, [user]);

  // Modal states
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [showProteinModal, setShowProteinModal] = useState(false);
  const [showCarbsModal, setShowCarbsModal] = useState(false);
  const [showFatModal, setShowFatModal] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const updatedProfile = {
        name,
        email,
        dailyCalorieGoal: parseInt(dailyCalorieGoal),
        dailyProteinGoal: parseInt(dailyProteinGoal),
        dailyCarbsGoal: parseInt(dailyCarbsGoal),
        dailyFatGoal: parseInt(dailyFatGoal),
      };

      const response = await apiService.updateProfile(token, updatedProfile);

      setSuccess("Profile updated successfully!");
      onUserUpdate(response.user);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }, [
    name,
    email,
    dailyCalorieGoal,
    dailyProteinGoal,
    dailyCarbsGoal,
    dailyFatGoal,
    token,
    onUserUpdate,
  ]);

  return (
    <view className="profile-screen">
      <view className="profile-header">
        <text className="back-button" bindtap={onBack}>
          ← Back
        </text>
        <text className="profile-title">Profile Settings</text>
        <view></view>
      </view>

      <scroll-view className="profile-content" scroll-y={true}>
        {error && (
          <view className="error-message">
            <text className="error-text">{error}</text>
          </view>
        )}

        {success && (
          <view className="success-message">
            <text className="success-text">{success}</text>
          </view>
        )}

        {/* Personal Information */}
        <view className="profile-section">
          <text className="section-title">Personal Information</text>

          <view className="profile-field">
            <text className="field-label">Name</text>
            <text
              className="field-value"
              bindtap={() => setShowNameModal(true)}
            >
              {name || "Tap to edit"}
            </text>
          </view>

          <view className="profile-field">
            <text className="field-label">Email</text>
            <text
              className="field-value"
              bindtap={() => setShowEmailModal(true)}
            >
              {email || "Tap to edit"}
            </text>
          </view>
        </view>

        {/* Daily Goals */}
        <view className="profile-section">
          <text className="section-title">Daily Goals</text>

          <view className="profile-field">
            <text className="field-label">Calories</text>
            <text
              className="field-value"
              bindtap={() => setShowCalorieModal(true)}
            >
              {dailyCalorieGoal} cal
            </text>
          </view>

          <view className="profile-field">
            <text className="field-label">Protein</text>
            <text
              className="field-value"
              bindtap={() => setShowProteinModal(true)}
            >
              {dailyProteinGoal} g
            </text>
          </view>

          <view className="profile-field">
            <text className="field-label">Carbs</text>
            <text
              className="field-value"
              bindtap={() => setShowCarbsModal(true)}
            >
              {dailyCarbsGoal} g
            </text>
          </view>

          <view className="profile-field">
            <text className="field-label">Fat</text>
            <text className="field-value" bindtap={() => setShowFatModal(true)}>
              {dailyFatGoal} g
            </text>
          </view>
        </view>

        {/* Save Button */}
        <view className="profile-actions">
          <text
            className={`save-button ${isLoading ? "loading" : ""}`}
            bindtap={handleSave}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </text>
        </view>
      </scroll-view>

      {/* Virtual Keyboards */}
      <VirtualKeyboard
        isVisible={showNameModal}
        placeholder="Enter your name"
        initialValue={name}
        onTextChange={(text: string) => setName(text)}
        onSubmit={() => setShowNameModal(false)}
        onClose={() => setShowNameModal(false)}
      />

      <VirtualKeyboard
        isVisible={showEmailModal}
        placeholder="Enter your email"
        initialValue={email}
        onTextChange={(text: string) => setEmail(text)}
        onSubmit={() => setShowEmailModal(false)}
        onClose={() => setShowEmailModal(false)}
      />

      <VirtualKeyboard
        isVisible={showCalorieModal}
        placeholder="Daily calorie goal"
        initialValue={dailyCalorieGoal}
        onTextChange={(text: string) => setDailyCalorieGoal(text)}
        onSubmit={() => setShowCalorieModal(false)}
        onClose={() => setShowCalorieModal(false)}
      />

      <VirtualKeyboard
        isVisible={showProteinModal}
        placeholder="Daily protein goal (g)"
        initialValue={dailyProteinGoal}
        onTextChange={(text: string) => setDailyProteinGoal(text)}
        onSubmit={() => setShowProteinModal(false)}
        onClose={() => setShowProteinModal(false)}
      />

      <VirtualKeyboard
        isVisible={showCarbsModal}
        placeholder="Daily carbs goal (g)"
        initialValue={dailyCarbsGoal}
        onTextChange={(text: string) => setDailyCarbsGoal(text)}
        onSubmit={() => setShowCarbsModal(false)}
        onClose={() => setShowCarbsModal(false)}
      />

      <VirtualKeyboard
        isVisible={showFatModal}
        placeholder="Daily fat goal (g)"
        initialValue={dailyFatGoal}
        onTextChange={(text: string) => setDailyFatGoal(text)}
        onSubmit={() => setShowFatModal(false)}
        onClose={() => setShowFatModal(false)}
      />
    </view>
  );
};
