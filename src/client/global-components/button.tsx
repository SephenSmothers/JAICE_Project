import React from "react";

export default function Button({
  onClick,
  children,
  isSelected = false,
  type = "button",
}: {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  isSelected?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const selectedClass = isSelected ? "selected" : "";
  return (
    <button
      type={type}
      onClick={(event) =>  onClick?.(event) }
      className={`${selectedClass}`}
    >
      {children}
    </button>
  );
}
