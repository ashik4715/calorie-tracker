import { useCallback, useState } from "@lynx-js/react";
import { VirtualKeyboard } from "../components/VirtualKeyboard.js";

interface SignupScreenProps {
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
  error?: string;
}

export const SignupScreen = ({
  onSignup,
  onSwitchToLogin,
  isLoading,
  error,
}: SignupScreenProps) => {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [confirmPassword, setConfirmPassword] = useState("password123");
  const [localError, setLocalError] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmPasswordModal, setShowConfirmPasswordModal] =
    useState(false);

  const handleSignup = useCallback(async () => {
    setLocalError("");

    if (!name.trim()) {
      setLocalError("Name is required");
      return;
    }

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

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      await onSignup(name.trim(), email.trim(), password);
    } catch (err) {
      setLocalError("Signup failed. Please try again.");
    }
  }, [name, email, password, confirmPassword, onSignup]);

  const displayError = error || localError;

  return (
    <view className="auth-screen">
      <view className="auth-container">
        <view className="auth-header">
          <text className="auth-title">Create Account</text>
          <text className="auth-subtitle">
            Join us to start tracking your calories
          </text>
        </view>

        <view className="auth-form">
          {displayError && (
            <view className="error-message">
              <text className="error-text">{displayError}</text>
            </view>
          )}

          <view className="form-field">
            <text className="field-label">Full Name</text>
            <view className="field-input-container">
              <text
                className="field-input clickable"
                bindtap={() => setShowNameModal(true)}
              >
                {name || "Enter your full name"}
              </text>
            </view>
          </view>

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

          <view className="form-field">
            <text className="field-label">Confirm Password</text>
            <view className="field-input-container">
              <text
                className="field-input clickable"
                bindtap={() => setShowConfirmPasswordModal(true)}
              >
                {confirmPassword
                  ? "*".repeat(confirmPassword.length)
                  : "Confirm your password"}
              </text>
            </view>
          </view>

          <view className="auth-actions">
            <view
              className={`auth-button primary ${isLoading ? "loading" : ""}`}
              bindtap={isLoading ? undefined : handleSignup}
            >
              <text className="button-text">
                {isLoading ? "⟳ Creating Account..." : "Create Account"}
              </text>
            </view>

            <view className="auth-switch">
              <text className="switch-text">Already have an account? </text>
              <text className="switch-link" bindtap={onSwitchToLogin}>
                Sign In
              </text>
            </view>
          </view>
        </view>
      </view>

      <VirtualKeyboard
        isVisible={showNameModal}
        placeholder="Enter your full name"
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
        isVisible={showPasswordModal}
        placeholder="Enter your password"
        initialValue={password}
        isPassword={true}
        onTextChange={(text: string) => setPassword(text)}
        onSubmit={() => setShowPasswordModal(false)}
        onClose={() => setShowPasswordModal(false)}
      />

      <VirtualKeyboard
        isVisible={showConfirmPasswordModal}
        placeholder="Confirm your password"
        initialValue={confirmPassword}
        isPassword={true}
        onTextChange={(text: string) => setConfirmPassword(text)}
        onSubmit={() => setShowConfirmPasswordModal(false)}
        onClose={() => setShowConfirmPasswordModal(false)}
      />
    </view>
  );
};
