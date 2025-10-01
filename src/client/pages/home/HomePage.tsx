// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./home-components/"
// import public from "/asset-filename.ext"

import { useState } from "react";
import { ControlBar } from "./home-components/ControlBar";
import { Column } from "./home-components/Column";

export function HomePage() {
  // State for multi-selection
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  // State and filter options
  const [selectedOption, setSelectedOption] = useState("default");
  const [isOpen, setIsOpen] = useState(false);
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
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

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
