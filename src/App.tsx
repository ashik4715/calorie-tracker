import { useEffect, useState } from "@lynx-js/react";
import { sampleFoods } from "./data/foods.js";
import { DashboardScreen } from "./screens/DashboardScreen.js";
import { FoodDatabaseScreen } from "./screens/FoodDatabaseScreen.js";
import { LoginScreen } from "./screens/LoginScreen.js";
import { ProfileScreen } from "./screens/ProfileScreen.js";
import { SignupScreen } from "./screens/SignupScreen.js";
import { useStore } from "./store/index.js";

import "./App.css";

type Screen = "dashboard" | "food-database" | "profile" | "login" | "signup";

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [authScreen, setAuthScreen] = useState<"login" | "signup">("login");
  const {
    initialize,
    addFoodItem,
    foodItems,
    auth,
    login,
    signup,
    logout,
    updateUser,
  } = useStore();

  useEffect(() => {
    const initializeApp = async () => {
      await initialize();

      // Add sample foods if none exist
      const state = useStore.getState();
      if (state.foodItems.length === 0) {
        sampleFoods.forEach((food) => {
          const { id, ...foodWithoutId } = food;
          addFoodItem(foodWithoutId);
        });
      }
    };

    initializeApp();
  }, [initialize, addFoodItem]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      await signup(name, email, password);
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // If not authenticated, show auth screens
  if (!auth.isAuthenticated) {
    if (authScreen === "login") {
      return (
        <LoginScreen
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthScreen("signup")}
          isLoading={auth.isLoading}
          error={auth.error || undefined}
        />
      );
    } else {
      return (
        <SignupScreen
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthScreen("login")}
          isLoading={auth.isLoading}
          error={auth.error || undefined}
        />
      );
    }
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return (
          <DashboardScreen
            user={auth.user}
            token={auth.token || ""}
            onLogout={logout}
            onNavigateToProfile={() => setCurrentScreen("profile")}
          />
        );
      case "food-database":
        return (
          <FoodDatabaseScreen onBack={() => setCurrentScreen("dashboard")} />
        );
      case "profile":
        return auth.user ? (
          <ProfileScreen
            user={auth.user}
            token={auth.token || ""}
            onBack={() => setCurrentScreen("dashboard")}
            onUserUpdate={(user) => {
              // Update the user in the store
              updateUser(user);
            }}
          />
        ) : (
          <DashboardScreen
            user={auth.user}
            token={auth.token || ""}
            onLogout={logout}
            onNavigateToProfile={() => setCurrentScreen("profile")}
          />
        );
      default:
        return (
          <DashboardScreen
            user={auth.user}
            token={auth.token || ""}
            onLogout={logout}
            onNavigateToProfile={() => setCurrentScreen("profile")}
          />
        );
    }
  };

  return (
    <view className="app">
      <view className="header">
        <text className="app-title">Calorie Tracker</text>
        <text className="logout-btn" bindtap={handleLogout}>
          Logout
        </text>
      </view>

      <view className="main-content">{renderScreen()}</view>

      <view className="tab-bar">
        <text
          className={`tab-item ${
            currentScreen === "dashboard" ? "active" : ""
          }`}
          bindtap={() => setCurrentScreen("dashboard")}
        >
          Dashboard
        </text>
        <text
          className={`tab-item ${
            currentScreen === "food-database" ? "active" : ""
          }`}
          bindtap={() => setCurrentScreen("food-database")}
        >
          Foods
        </text>
        <text
          className={`tab-item ${currentScreen === "profile" ? "active" : ""}`}
          bindtap={() => setCurrentScreen("profile")}
        >
          Profile
        </text>
      </view>
    </view>
  );
}
