// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./home-components/"
// import public from "/asset-filename.ext"

import { useState } from "react";
import { ControlBar } from "./home-components/ControlBar";
import { Column } from "./home-components/Column";

export function HomePage() {
  /*
  Props are passed from the home page to the control bar so we can maintain central state.
  This allows us to manage the state of multi-selection, filtering, searching, and alerts from one place.
  Those changes are then passed back up to the home page and can be passed down to the columns as needed.
  */
  // State for multi-selection
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  // State and filter options
  const [selectedOption, setSelectedOption] = useState("default");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const options = [
    { value: "default", label: "Sort by" },
    { value: "new", label: "Newest First" },
    { value: "old", label: "Oldest First" },
    { value: "az", label: "A - Z" },
    { value: "za", label: "Z - A" },
  ];
  //State for search
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  //State for alerts
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, ] = useState("No Alerts");

  //State for Info Modal
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);

  /*
  The column meta data will be moved into the meta file for the data when we get to that point.
  Currently it's hard coded here for demonstration purposes. Eventually, we would recieve the data
  as a prop from the meta file and provide that data directly to the column component here.

  When we filter, search, or multi-select, we can either pass that up to the meta file to handle
  or we can handle it here and just provide the filtered data to the columns for rendering components.
  */
  //Column Meta Data
  const columns = [
    { id: 1, title: "Applied", bg: "var(--color-light-purple)", count: 10 },
    { id: 2, title: "Interview", bg: "var(--color-teal)", count: 5 },
    { id: 3, title: "Offers", bg: "var(--color-dark-purple)", count: 35 },
    { id: 4, title: "Accepted", bg: "var(--color-blue-gray)", count: 8 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center flex-col ">
      {/* ^ Page Container ^ */}
      <div className="w-full h-full flex flex-col items-center gap-4 p-4 overflow-y-auto">
        {/* ^ Content Container ^ */}
        <ControlBar
          isMultiSelecting={isMultiSelecting}
          setIsMultiSelecting={setIsMultiSelecting}
          multiSelectLabel={isMultiSelecting ? "Multi Select" : ""}
          options={options}
          isMenuOpen={isMenuOpen}
          setMenuOpen={setMenuOpen}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAlertOpen={isAlertOpen}
          setIsAlertOpen={setIsAlertOpen}
          alertMessage={alertMessage}
          infoModalLabel={isInfoModalOpen ? "Info" : ""}
          isInfoModalOpen={isInfoModalOpen}
          setInfoModalOpen={setInfoModalOpen}
        />
        {/* When we get to the point of dynamic data, we can provide the states directly to the column keeping the home page lean and clean */}
        {/* Kan Ban Columns */}
        <div className="flex gap-4 w-full">
          {columns.map((column) => (
            <Column
              key={column.id}
              title={column.title}
              backgroundColor={column.bg}
              count={column.count}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
