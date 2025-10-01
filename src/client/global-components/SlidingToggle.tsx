import React, { useState } from "react";

interface SlidingToggleProps {
  leftLabel: string;
  rightLabel: string;
  action: (value: boolean) => void;
  initialValue?: boolean;
}

export function SlidingToggle({ leftLabel, rightLabel, action, initialValue }: SlidingToggleProps) {
  const [isLeft, setIsLeft] = useState(initialValue || false);

  const toggleStyle: React.CSSProperties = {
    appearance: "none",
    width: "100%",
    height: "40px",
    background: "transparent",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
    lineHeight: "40px",
    zIndex: 10,
  };

  const selectedStyle: React.CSSProperties = {
    fontWeight: "bold",
    background: "var(--color-blue-1)",
    width: "50%",
    height: "38px",
    borderRadius: "8px",
    left: isLeft ? "0%" : "50%",
    animation: "slide 0.3s ease-in-out",
    transition: "left 0.3s ease-in-out",
    position: "absolute",
    zIndex: 0,
    boxShadow: "0 0px 10px rgba(var(--color-blue-3-rgb), 0.4)"
  };

  const rightLabelStyle: React.CSSProperties = {
    color: isLeft ? "var(--color-blue-4)" : "var(--color-blue-5)",
  };

  const leftLabelStyle: React.CSSProperties = {
    color: isLeft ? "var(--color-blue-5)" : "var(--color-blue-4)",
  };

  return (
    <div className="flex relative items-center justify-center">
      <div style={selectedStyle} />
      <label className="absolute w-1/2 self-center left-0 z-2" style={leftLabelStyle}>{leftLabel}</label>
      <label className="absolute w-1/2 self-center right-0 z-2" style={rightLabelStyle}>{rightLabel}</label>
      <input
        type="checkbox"
        checked={isLeft}
        onChange={() => {
          setIsLeft(!isLeft);
          action(isLeft);
        }}
        style={toggleStyle}
      />
    </div>
  );
}
