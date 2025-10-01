import checkIcon from "@/client/assets/icons/check-icon.svg";
import uncheckIcon from "@/client/assets/icons/uncheck-icon.svg";

/**
 * CheckBox Toggle Props
 * @param label - Optional label to display next to the checkbox
 * @param isChecked - Boolean indicating if the checkbox is checked
 * @param setIsChecked - Function to update the checked state
 */
interface CheckBoxToggleProps {
  label?: string;
  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
}

/**
 * Check Box Toggle Component
 * 
 * Takes an optional label, a boolean for checked state, and a function to cycle that state.
 * @param label - Optional label to display next to the checkbox
 * @param isChecked - Boolean indicating if the checkbox is checked
 * @param setIsChecked - Function to update the checked state
 * @returns A checkbox toggle component, with the label if provided. The hit area is the entire component.
 */
export function CheckBoxToggle({
  label,
  isChecked,
  setIsChecked,
}: CheckBoxToggleProps) {
  const iconStyle = {
    filter:
      "brightness(0) saturate(100%) invert(81%) sepia(11%) saturate(464%) hue-rotate(170deg) brightness(95%) contrast(85%)",
  };

  return (
    <div className="flex relative items-center justify-center border p-2 gap-4 rounded cursor-pointer">
      <img
        src={isChecked ? checkIcon : uncheckIcon}
        alt="Toggle Icon"
        className="w-5 h-5 flex-shrink-0"
        style={iconStyle}
      />
      <input
        type="checkbox"
        checked={isChecked}
        onClick={() => { setIsChecked(!isChecked); }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {label ? (
        <label className="select-none whitespace-nowrap ">{label}</label>
      ) : null}
    </div>
  );
}
