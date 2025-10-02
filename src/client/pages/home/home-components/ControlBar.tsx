import { CheckBoxToggle } from "@/client/global-components/CheckBoxToggle";
import { DropDownMenu } from "@/client/global-components/DropDownMenu";
import { SearchBar } from "@/client/global-components/SearchBar";
import filterIcon from "@/client/assets/icons/filter.svg";
import { AlertBox } from "./AlertBox";

/**
 * Control Bar Props
 * @param isMultiSelecting - Boolean indicating if multi-select mode is active
 * @param setIsMultiSelecting - Function to update the multi-select state
 * @param multiSelectLabel - Optional label to display next to the multi-select checkbox
 * @param options - Array of option objects with value and label for the menu selector
 * @param isOpen - Boolean indicating if the menu selector is open
 * @param setIsOpen - Function to update the open state of the menu selector
 * @param selectedOption - Currently selected option value in the menu selector
 * @param setSelectedOption - Function to update the selected option in the menu selector
 * @param isSearching - Boolean indicating if the search bar is active
 * @param setIsSearching - Function to update the searching state
 * @param searchQuery - Current value of the search query
 * @param setSearchQuery - Function to update the search query
 */
interface ControlBarProps {
  isMultiSelecting: boolean;
  setIsMultiSelecting: (value: boolean) => void;
  multiSelectLabel?: string;

  options: { value: string; label: string }[];
  isMenuOpen: boolean;
  selectedOption: string;
  setMenuOpen: (value: boolean) => void;
  setSelectedOption: (value: string) => void;

  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;

  isAlertOpen: boolean;
  setIsAlertOpen: (value: boolean) => void;
  alertMessage?: string;
}

/**
 * Control Bar Component
 *
 * A custom component for the homepage that bundles the search bar, the menu selector, and the multi-select checkbox toggle.
 *
 * @param isMultiSelecting - Boolean indicating if multi-select mode is active
 * @param setIsMultiSelecting - Function to update the multi-select state
 * @param multiSelectLabel - Optional label to display next to the multi-select checkbox
 * @param options - Array of option objects with value and label for the menu selector
 * @param isOpen - Boolean indicating if the menu selector is open
 * @param setIsOpen - Function to update the open state of the menu selector
 * @param selectedOption - Currently selected option value in the menu selector
 * @param setSelectedOption - Function to update the selected option in the menu selector
 * @param isSearching - Boolean indicating if the search bar is active
 * @param setIsSearching - Function to update the searching state
 * @param searchQuery - Current value of the search query
 * @param setSearchQuery - Function to update the search query
 * @returns A control bar component containing a search bar, a menu selector, and a multi-select checkbox toggle.
 */
export function ControlBar({
  isMultiSelecting,
  setIsMultiSelecting,
  multiSelectLabel,

  options,
  isMenuOpen,
  setMenuOpen,
  selectedOption,
  setSelectedOption,

  isSearching,
  setIsSearching,
  searchQuery,
  setSearchQuery,

  isAlertOpen,
  setIsAlertOpen,
  alertMessage,
}: ControlBarProps) {
  return (
    <div className="w-full h-[50px] flex items-center justify-between gap-4">
      <div className="">
        <AlertBox
          isOpen={isAlertOpen}
          setIsOpen={setIsAlertOpen}
          alertMessage={alertMessage}
        />
      </div>

      <div className="flex gap-4 justify-center items-center">
        <SearchBar
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <DropDownMenu
          options={options}
          isOpen={isMenuOpen}
          selectedOption={selectedOption}
          setIsOpen={setMenuOpen}
          setSelectedOption={setSelectedOption}
          leftIcon={filterIcon}
        />
        <CheckBoxToggle
          label={multiSelectLabel}
          isChecked={isMultiSelecting}
          setIsChecked={setIsMultiSelecting}
        />
      </div>
    </div>
  );
}
