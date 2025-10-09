/*
This modal is meant to be configurable for various informational purposes.
It takes three props:
1. title: A string to set the title of the modal.
2. content: A React component or JSX to display as the main content of the modal.
3. setIsOpen: A function to control the visibility of the modal from the parent component.

This means that where the modal is injected, you need to define a state variable to manage it's open/close state.
This may be triggered by a button or some other UI element. At the very least you need a boolean state and a function to update it.

Usage Example:
const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); <- Hooks to manage modal state

<InfoModal
  title="Home Info"                   <- Title for the modal
  content={<HomeInfoContent />}       <- Custom content component for the modal
  setIsOpen={setIsInfoModalOpen}      <- Function to close the modal from it's interal Close Button
/>


When defining the content component, you need to be mindful of the modal's fixed size and scrolling behavior. 
Scrolling is enabled for the content area, but the modal does not provide any formatting/styling for the content area.
This means that content will naturally fill the width and height of the container, unless you add your own padding/margin/styling.
This is intentional to allow for maximum flexibility in how the content is presented. Be it text, images, forms, or any other
nested componentry that you can think of. The idea is that information is presented in a clear and concise manner with a 
consistent modal framework. 

I think we may revisit centralizing the padding/margin of the content container here, so that content is consistent regardless of it's shape.
*/


import  { PlaceHolderContent } from "./PlaceHolderText";

// Define the props for the InfoModal component
interface InfoModalProps {
  title?: string; // Optional title prop
  content?: React.ReactNode; // Optional content prop
  setIsOpen: (value: boolean) => void; // Function to control modal visibility
}

// The info modal component
// It is a fixed size and positioned in the bottom right of the viewport
// It has a semi-transparent background with a blur effect for increased visibility
export function InfoModal({ title, content, setIsOpen }: InfoModalProps) {
  //defined to be fixed in size and centered on the bottom half of the pages viewport.
  const modalStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "2rem", //1 rem from bottom edge of viewport
    right: "2rem", //2 rem from right edge of viewport
    height: "30vh", //30% of viewport height
    margin: "0 0 0 7rem",
    maxHeight: "40rem", //max height of 40rem
    minHeight: "20rem", //min height of 20rem
    maxWidth: "60rem", //max width of 60rem
    minWidth: "40rem", //min width of 40rem
    borderRadius: "0.5rem",
    outline: "none",
    backgroundColor: "rgba(var(--color-bg-rgb), 0.5)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 0 5px rgba(255, 255, 255, 0.3)",
    zIndex: 90,
  };

  return (
    <div style={modalStyle} className="backdrop-blur-md">
      {/* Header with Title and Close Button */}
      <div className="flex justify-between p-4 items-center w-full">
        <h2 className="whitespace-nowrap">{title || "Info Modal Title (EX: Home Info)"}</h2>
        <p onClick={() => setIsOpen(false)}>X</p>
      </div>
      <hr className="w-full mb-1 border-white/20" />
      
      {/* Content Area */}
      <div className="overflow-y-auto overflow-hidden">
        {content || <PlaceHolderContent />}
      </div>
    </div>
  );
}




