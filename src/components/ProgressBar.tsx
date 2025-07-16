interface ProgressBarProps {
  current: number;
  goal: number;
  color: string;
  label: string;
}

export const ProgressBar = ({ current, goal, color, label }: ProgressBarProps) => {
  const percentage = Math.min((current / goal) * 100, 100);
  
  return (
    <view className="progress-container">
      <view className="progress-header">
        <text className="progress-label">{label}</text>
        <text className="progress-values">{current} / {goal}</text>
      </view>
      <view className="progress-bar">
        <view
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </view>
      <text className="progress-percentage">{Math.round(percentage)}%</text>
    </view>
  );
};
