import { useState } from "@lynx-js/react";

interface VirtualKeyboardProps {
  isVisible: boolean;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  placeholder?: string;
  isPassword?: boolean;
  initialValue?: string;
}

export const VirtualKeyboard = ({
  isVisible,
  onTextChange,
  onSubmit,
  onClose,
  placeholder = "Type here...",
  isPassword = false,
  initialValue = "",
}: VirtualKeyboardProps) => {
  const [text, setText] = useState(initialValue);
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);

  if (!isVisible) return null;

  const qwertyRows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  const shiftSymbols: { [key: string]: string } = {
    "1": "!",
    "2": "@",
    "3": "#",
    "4": "$",
    "5": "%",
    "6": "^",
    "7": "&",
    "8": "*",
    "9": "(",
    "0": ")",
  };

  const handleKeyPress = (key: string) => {
    let newText = text;

    if (key === "BACKSPACE") {
      newText = text.slice(0, -1);
    } else if (key === "SPACE") {
      newText = text + " ";
    } else if (key === "SHIFT") {
      setIsShift(!isShift);
      return;
    } else if (key === "CAPS") {
      setIsCaps(!isCaps);
      return;
    } else if (key === "ENTER") {
      onTextChange(text);
      onSubmit();
      return;
    } else if (key === ".COM") {
      newText = text + ".com";
    } else {
      // Handle character input
      let char = key;

      // Apply shift/caps logic
      if (isShift && shiftSymbols[key]) {
        char = shiftSymbols[key];
      } else if ((isShift || isCaps) && /[a-z]/.test(key)) {
        char = key.toUpperCase();
      }

      newText = text + char;
    }

    setText(newText);
    onTextChange(newText);

    // Reset shift after character input
    if (isShift && key !== "SHIFT") {
      setIsShift(false);
    }
  };

  const handleClose = () => {
    setText("");
    onClose();
  };

  const displayText = isPassword ? "*".repeat(text.length) : text;

  return (
    <view className="virtual-keyboard-overlay">
      <view className="virtual-keyboard">
        {/* Header */}
        <view className="keyboard-header">
          <text className="keyboard-title">{placeholder}</text>
          <text className="keyboard-close" bindtap={handleClose}>
            ×
          </text>
        </view>

        {/* Text Display */}
        <view className="keyboard-display">
          <text className="keyboard-text">{displayText || placeholder}</text>
        </view>

        {/* Keyboard Rows */}
        <view className="keyboard-rows">
          {qwertyRows.map((row, rowIndex) => (
            <view key={rowIndex} className="keyboard-row">
              {row.map((key) => {
                const displayKey =
                  isShift && shiftSymbols[key]
                    ? shiftSymbols[key]
                    : (isShift || isCaps) && /[a-z]/.test(key)
                    ? key.toUpperCase()
                    : key;

                return (
                  <text
                    key={key}
                    className="keyboard-key"
                    bindtap={() => handleKeyPress(key)}
                  >
                    {displayKey}
                  </text>
                );
              })}
            </view>
          ))}

          {/* Special Keys Row */}
          <view className="keyboard-row">
            <text
              className={`keyboard-key special-key ${isCaps ? "active" : ""}`}
              bindtap={() => handleKeyPress("CAPS")}
            >
              CAPS
            </text>
            <text
              className={`keyboard-key special-key ${isShift ? "active" : ""}`}
              bindtap={() => handleKeyPress("SHIFT")}
            >
              {isShift ? "." : "SHIFT"}
            </text>
            <text
              className="keyboard-key space-key"
              bindtap={() => handleKeyPress("SPACE")}
            >
              SPACE
            </text>
            <text
              className="keyboard-key special-key"
              bindtap={() => handleKeyPress("BACKSPACE")}
            >
              ⌫
            </text>
          </view>

          {/* Email Helper Row */}
          <view className="keyboard-row">
            <text
              className="keyboard-key special-key"
              bindtap={() => handleKeyPress(".")}
            >
              .
            </text>
            <text
              className="keyboard-key special-key"
              bindtap={() => handleKeyPress(".COM")}
            >
              .com
            </text>
            <text
              className="keyboard-key special-key"
              bindtap={() => handleKeyPress("@")}
            >
              @
            </text>
          </view>

          {/* Action Row */}
          <view className="keyboard-row">
            <text
              className="keyboard-key action-key cancel"
              bindtap={handleClose}
            >
              Cancel
            </text>
            <text
              className="keyboard-key action-key submit"
              bindtap={() => handleKeyPress("ENTER")}
            >
              Done
            </text>
          </view>
        </view>
      </view>
    </view>
  );
};
