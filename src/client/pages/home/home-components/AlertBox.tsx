import bellIcon from "@/client/assets/icons/bell-notification-social-media.svg";

/**
 * Props for the AlertBox component.
 * @param isOpen - Boolean indicating if the alert box is expanded
 * @param setIsOpen - Function to update the open state of the alert box
 * @param alertMessage - Optional message to display in the alert box
 */
interface AlertBoxProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  alertMessage?: string;
}


/**
 * AlertBox Component
 * 
 * A component that displays an alert icon and expands to show an alert message on hover.
 * 
 * Intended to be a quick notification center related to application status updates.
 * @param isOpen - Boolean indicating if the alert box is expanded
 * @param setIsOpen - Function to update the open state of the alert box
 * @param alertMessage - Optional message to display in the alert box
 * @returns An expandable alert box that shows an alert message on hover.
 */
export function AlertBox({ isOpen, setIsOpen, alertMessage }: AlertBoxProps) {
  const iconStyle = {
    filter:
      "brightness(0) saturate(100%) invert(81%) sepia(11%) saturate(464%) hue-rotate(170deg) brightness(95%) contrast(85%)",
  };

  return (
    <div
      className="flex items-center justify-center border gap-2 p-2 rounded cursor-pointer"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <img
        src={bellIcon}
        alt="Alert Icon"
        className="w-5 h-5 shrink-0"
        style={iconStyle}
      />
      {isOpen ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly={true}
            value={alertMessage}
            onChange={() => setIsOpen(true)}
            className="w-full h-full border-transparent focus:border-transparent focus:ring-0 outline-none bg-[var(--color-gray-2)] rounded"
          />
        </div>
      ) : null}
    </div>
  );
}
