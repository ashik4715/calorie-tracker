import { useCallback, useEffect, useState } from "@lynx-js/react";
import { apiService } from "../services/api.js";
import type { User } from "../types/index.js";

interface ReportData {
  date: string;
  calories: number;
  remaining: number;
}

interface ReportScreenProps {
  user: User;
  token: string;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  onNavigateToDashboard: () => void;
}

export const ReportScreen = ({
  user,
  token,
  onLogout,
  onNavigateToProfile,
  onNavigateToDashboard,
}: ReportScreenProps) => {
  const [weeklyData, setWeeklyData] = useState<ReportData[]>([]);
  const [monthlyData, setMonthlyData] = useState<ReportData[]>([]);
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeeklyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // Last 7 days

      const data: ReportData[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];

        try {
          const dailySummary = await apiService.getDailySummary(token, dateStr);
          const calories = dailySummary?.totalCalories || 0;
          const remaining = (user.dailyCalorieGoal || 2000) - calories;

          data.push({
            date: dateStr,
            calories,
            remaining,
          });
        } catch (error) {
          // If no data for this date, add zeros
          data.push({
            date: dateStr,
            calories: 0,
            remaining: user.dailyCalorieGoal || 2000,
          });
        }
      }

      setWeeklyData(data);
    } catch (error) {
      console.error("Failed to fetch weekly data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, user.dailyCalorieGoal]);

  const fetchMonthlyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 29); // Last 30 days

      const data: ReportData[] = [];
      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];

        try {
          const dailySummary = await apiService.getDailySummary(token, dateStr);
          const calories = dailySummary?.totalCalories || 0;
          const remaining = (user.dailyCalorieGoal || 2000) - calories;

          data.push({
            date: dateStr,
            calories,
            remaining,
          });
        } catch (error) {
          // If no data for this date, add zeros
          data.push({
            date: dateStr,
            calories: 0,
            remaining: user.dailyCalorieGoal || 2000,
          });
        }
      }

      setMonthlyData(data);
    } catch (error) {
      console.error("Failed to fetch monthly data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, user.dailyCalorieGoal]);

  useEffect(() => {
    if (activeTab === "weekly") {
      fetchWeeklyData();
    } else {
      fetchMonthlyData();
    }
  }, [activeTab, fetchWeeklyData, fetchMonthlyData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const currentData = activeTab === "weekly" ? weeklyData : monthlyData;

  return (
    <view className="report-screen">
      {/* Header */}
      <view className="dashboard-header">
        <view className="header-content">
          <text className="welcome-text">Reports</text>
          <text className="date-text">Track Your Progress</text>
        </view>
        <view className="header-actions">
          <text className="profile-button" bindtap={onNavigateToProfile}>
            Profile
          </text>
          <text className="dashboard-button" bindtap={onNavigateToDashboard}>
            Dashboard
          </text>
          {/* <text className="logout-button" bindtap={onLogout}>
            Logout
          </text> */}
        </view>
      </view>

      <scroll-view className="report-content" scroll-y={true}>
        {/* Tab Navigation */}
        <view className="report-tabs">
          <text
            className={`tab-button ${activeTab === "weekly" ? "active" : ""}`}
            bindtap={() => setActiveTab("weekly")}
          >
            This Week
          </text>
          <text
            className={`tab-button ${activeTab === "monthly" ? "active" : ""}`}
            bindtap={() => setActiveTab("monthly")}
          >
            This Month
          </text>
        </view>

        {/* Loading State */}
        {isLoading && (
          <view className="loading-container">
            <text className="loading-text">Loading report data...</text>
          </view>
        )}

        {/* Report Table */}
        {!isLoading && (
          <view className="report-table">
            <view className="table-header">
              <text className="table-header-cell">Date</text>
              <text className="table-header-cell">Calories</text>
              <text className="table-header-cell">Remaining</text>
            </view>

            {currentData.map((item, index) => (
              <view key={index} className="table-row">
                <text className="table-cell date-cell">
                  {activeTab === "weekly"
                    ? formatDateFull(item.date)
                    : formatDate(item.date)}
                </text>
                <text className="table-cell calories-cell">
                  {item.calories}
                </text>
                <text
                  className={`table-cell remaining-cell ${
                    item.remaining < 0 ? "over-goal" : "under-goal"
                  }`}
                >
                  {item.remaining}
                </text>
              </view>
            ))}
          </view>
        )}

        {/* Summary Stats */}
        {!isLoading && currentData.length > 0 && (
          <view className="report-summary">
            <text className="summary-title">
              {activeTab === "weekly" ? "Weekly" : "Monthly"} Summary
            </text>
            <view className="summary-stats">
              <view className="stat-item">
                <text className="stat-label">Average Daily Calories</text>
                <text className="stat-value">
                  {Math.round(
                    currentData.reduce((sum, item) => sum + item.calories, 0) /
                      currentData.length
                  )}
                </text>
              </view>
              <view className="stat-item">
                <text className="stat-label">Days Over Goal</text>
                <text className="stat-value">
                  {currentData.filter((item) => item.remaining < 0).length}
                </text>
              </view>
              <view className="stat-item">
                <text className="stat-label">Days Under Goal</text>
                <text className="stat-value">
                  {currentData.filter((item) => item.remaining > 0).length}
                </text>
              </view>
            </view>
          </view>
        )}
      </scroll-view>
    </view>
  );
};
