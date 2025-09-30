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
    background: "rgba(0, 0, 0, 0)",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
    lineHeight: "40px",
    zIndex: 1,
  };

  const selectedStyle: React.CSSProperties = {
    fontWeight: "bold",
    background: "black",
    width: "50%",
    height: "38px",
    borderRadius: "8px",
    left: isLeft ? "0%" : "50%",
    animation: "slide 0.3s ease-in-out",
    transition: "left 0.3s ease-in-out",
    position: "absolute",
    zIndex: -1,
  };

  return (
    <div className="flex relative items-center justify-center">
      <div style={selectedStyle} />
      <label className="absolute w-1/2 self-center left-0">{leftLabel}</label>
      <label className="absolute w-1/2 self-center right-0">{rightLabel}</label>
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
