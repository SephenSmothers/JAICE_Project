import searchIcon from "@/client/assets/icons/search.svg";
import circleXIcon from "@/client/assets/icons/circle-xmark.svg";

/**
 * Search Bar Props
 * @param isSearching - Boolean indicating if the search bar is active
 * @param setIsSearching - Function to update the searching state
 * @param searchQuery - Current value of the search query
 * @param setSearchQuery - Function to update the search query
 */
interface SearchBarProps {
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

/**
 * Search Bar Component
 * 
 * A search bar that expands on hover and allows input. Displays a clear icon when there is text in the input and will collapse when empty and not hovered.
 * 
 * @param isSearching - Boolean indicating if the search bar is active
 * @param setIsSearching - Function to update the searching state
 * @param searchQuery - Current value of the search query
 * @param setSearchQuery - Function to update the search query
 * @returns A search bar component
 */
export function SearchBar({
  isSearching,
  setIsSearching,
  searchQuery,
  setSearchQuery,
}: SearchBarProps) {
  const iconStyle = {
    filter:
      "brightness(0) saturate(100%) invert(81%) sepia(11%) saturate(464%) hue-rotate(170deg) brightness(95%) contrast(85%)",
  };

  return (
    <div
      className="flex group items-center justify-center border gap-2 p-2 rounded cursor-pointer"
      onMouseEnter={() => setIsSearching(true)}
      onMouseLeave={() => {
        if (searchQuery === "") {
          setIsSearching(false);
        }
      }}
    >
      <img
        src={searchIcon}
        alt="Search Icon"
        className="w-5 h-5 shrink-0"
        style={iconStyle}
      />
      {isSearching ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full border-transparent focus:border-transparent focus:ring-0 outline-none bg-[var(--color-gray-2)] rounded"
          />
          <img
            src={circleXIcon}
            alt="Clear Search Icon"
            className={`w-3 h-3 shrink-0`}
            style={{ ...iconStyle, cursor: "pointer", visibility: searchQuery !== "" ? "visible" : "hidden" }}
            onClick={() => setSearchQuery("")}
          />
        
        </div>
      ) : null}
    </div>
  );
}
