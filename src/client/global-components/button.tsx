import React from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  selected?: boolean;
}

export default function Button({
  onClick,
  children,
  type = "button",
  disabled = false,
  selected = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="btn"
      type={type}
      disabled={disabled}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}
