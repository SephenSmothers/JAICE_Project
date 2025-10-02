//this would realistically be better as a click to open notification center,
//but for now hover is implemented. When we get an alert we can push that to this component
//which would update the alertMessage prop and display the message on hover
//could also implement a timeout to auto-close the alert after a few seconds
//could also add a red dot or number badge for unread notifications
//could also add sound notification option
//could also add different icons for different types of notifications (info, warning, error)

import bellIcon from "@/client/assets/icons/bell-notification-social-media.svg";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
  // Ref to the content div to measure its width
  const contentRef = useRef<HTMLDivElement>(null);
  // State to control the target width of the alert box
  const [targetWidth, setTargetWidth] = useState(40);

  // Update target width when isOpen or alertMessage changes
  useEffect(() => {
    if (!isOpen || !contentRef.current) {
      setTargetWidth(40);
      return;
    }

    // Use requestAnimationFrame to ensure the DOM has updated before measuring
    requestAnimationFrame(() => {
      setTargetWidth(contentRef.current!.offsetWidth + 16);
    });
  }, [isOpen, alertMessage]);

  const iconStyle = {
    filter:
      "brightness(0) saturate(100%) invert(81%) sepia(11%) saturate(464%) hue-rotate(170deg) brightness(95%) contrast(85%)",
  };

  return (
    <motion.div
      className="flex items-center justify-start border gap-2 p-2 rounded cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      animate={{ width: targetWidth }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    > {/* Container div with animated width */}

      {/* Content div to measure width */}
      <div ref={contentRef} className="flex items-center gap-2">
        <img
          src={bellIcon}
          alt="Alert Icon"
          className="w-5 h-5 shrink-0"
          style={iconStyle}
        />

        {/* Conditionally render the alert message if the box is open (on hover)*/}
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <p className="whitespace-nowrap">{alertMessage}</p>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
