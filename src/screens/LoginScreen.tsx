import { useCallback, useState } from "@lynx-js/react";
import { VirtualKeyboard } from "../components/VirtualKeyboard.js";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToSignup: () => void;
  isLoading?: boolean;
  error?: string;
}

export const LoginScreen = ({
  onLogin,
  onSwitchToSignup,
  isLoading,
  error,
}: LoginScreenProps) => {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [localError, setLocalError] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogin = useCallback(async () => {
    setLocalError("");

    if (!email.trim()) {
      setLocalError("Email is required");
      return;
    }

    if (!password.trim()) {
      setLocalError("Password is required");
      return;
    }

    if (!email.includes("@")) {
      setLocalError("Please enter a valid email address");
      return;
    }

    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setLocalError("Login failed. Please try again.");
    }
  }, [email, password, onLogin]);

  const displayError = error || localError;

  return (
    <view className="auth-screen">
      <view className="auth-container">
        <view className="auth-header">
          <text className="auth-title">Welcome User</text>
          <text className="auth-subtitle">Sign in to your account</text>
        </view>

        <view className="auth-form">
          {displayError && (
            <view className="error-message">
              <text className="error-text">{displayError}</text>
            </view>
          )}

          <view className="form-field">
            <text className="field-label">Email</text>
            <view className="field-input-container">
              <text
                className="field-input clickable"
                bindtap={() => setShowEmailModal(true)}
              >
                {email || "Enter your email"}
              </text>
            </view>
          </view>

          <view className="form-field">
            <text className="field-label">Password</text>
            <view className="field-input-container">
              <text
                className="field-input clickable"
                bindtap={() => setShowPasswordModal(true)}
              >
                {password ? "*".repeat(password.length) : "Enter your password"}
              </text>
            </view>
          </view>

          <view className="auth-actions">
            <view
              className={`auth-button primary ${isLoading ? "loading" : ""}`}
              bindtap={isLoading ? undefined : handleLogin}
            >
              <text className="button-text">
                {isLoading ? "⟳ Signing In..." : "Sign In"}
              </text>
            </view>

            <view className="auth-switch">
              <text className="switch-text">Don't have an account? </text>
              <text className="switch-link" bindtap={onSwitchToSignup}>
                Sign Up
              </text>
            </view>
          </view>
        </view>
      </view>

      <VirtualKeyboard
        isVisible={showEmailModal}
        placeholder="Enter your email"
        initialValue={email}
        onTextChange={(text: string) => setEmail(text)}
        onSubmit={() => setShowEmailModal(false)}
        onClose={() => setShowEmailModal(false)}
      />

      <VirtualKeyboard
        isVisible={showPasswordModal}
        placeholder="Enter your password"
        initialValue={password}
        isPassword={true}
        onTextChange={(text: string) => setPassword(text)}
        onSubmit={() => setShowPasswordModal(false)}
        onClose={() => setShowPasswordModal(false)}
      />
    </view>
  );
};
