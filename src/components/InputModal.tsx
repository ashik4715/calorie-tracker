import { useEffect, useState } from "@lynx-js/react";

interface InputModalProps {
  isVisible: boolean;
  title: string;
  placeholder: string;
  value: string;
  isPassword?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const InputModal = ({
  isVisible,
  title,
  placeholder,
  value,
  isPassword = false,
  onConfirm,
  onCancel,
}: InputModalProps) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  if (!isVisible) return null;

  const handleConfirm = () => {
    onConfirm(inputValue);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <view className="input-modal-overlay">
      <view className="input-modal">
        <view className="input-modal-header">
          <text className="input-modal-title">{title}</text>
          <text className="close-button" bindtap={handleCancel}>
            ×
          </text>
        </view>

        <view className="input-modal-body">
          <view className="native-input-container">
            <text className="input-placeholder">{placeholder}</text>
            <text
              className="native-input"
              bindtap={() => {
                const result = prompt(title, inputValue || "");
                if (result !== null) {
                  setInputValue(result);
                }
              }}
            >
              {isPassword && inputValue
                ? "*".repeat(inputValue.length)
                : inputValue || "Tap to edit"}
            </text>
          </view>
        </view>

        <view className="input-modal-actions">
          <text className="modal-button cancel-button" bindtap={handleCancel}>
            Cancel
          </text>
          <text className="modal-button confirm-button" bindtap={handleConfirm}>
            OK
          </text>
        </view>
      </view>
    </view>
  );
};
