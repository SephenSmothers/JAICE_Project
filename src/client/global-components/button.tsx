import React from "react";

export default function Button({
  onClick,
  children,
  isSelected = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  isSelected?: boolean;
}) {
  return (
    <button onClick={() => { 
      onClick?.();            // run onClick function if it exists
      
    }} className={`button ${isSelected ? "selected" : ""}`}
      >
      {children}
    </button>
  );
}
