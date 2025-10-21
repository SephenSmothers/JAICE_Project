import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { ControlBar } from "./home-components/ControlBar";
import { Column } from "./home-components/Column";
import { JobCard } from "./home-components/JobCards";
import type { JobCardType } from "./home-components/JobCards";

import { getLastEmails, convertEmailsToJobCards } from "@/client/global-services/readEmails";

//import mockJobs from "./MockJobCards.json";

export function HomePage() {
  // State Variables
  const [isMultiSelecting, setIsMultiSelecting] = useState(false); // to track if multi-select mode is active
  const [selectedJobs, setSelectedJobs] = useState<JobCardType[]>([]); // to track the selected job cards
  const [selectedOption, setSelectedOption] = useState("default"); // to track the selected sorting option
  const [isMenuOpen, setMenuOpen] = useState(false); // to track if the options menu is open
  const [isSearching, setIsSearching] = useState(false); // to track if the search bar is active
  const [searchQuery, setSearchQuery] = useState(""); // to track the current search query
  const [isAlertOpen, setIsAlertOpen] = useState(false); // to track if the alert box is open
  const [alertMessage] = useState("No Alerts"); // to hold the current alert message
  const [isInfoModalOpen, setInfoModalOpen] = useState(false); // to track if the info modal is open
  const [jobs, setJobs] = useState<JobCardType[]>([]); // to hold the list of job cards (initially set to mock data)
  const [itemDragged, setItemDragged] = useState<JobCardType | null>(null); // to track the item being dragged
  const [isOver, setIsOver] = useState<string | null>(null); // to track which column is being hovered over during drag-and-drop

  const [emailsLoaded, setEmailsLoaded] = useState(false); // to track if emails have been loaded
  const [isLoadingEmails, setIsLoadingEmails] = useState(false); // to prevent multiple email load attempts

  const sortByOptions = [
    { value: "default", label: "Sort by" },
    { value: "new", label: "Newest First" },
    { value: "old", label: "Oldest First" },
    { value: "az", label: "A - Z" },
    { value: "za", label: "Z - A" },
  ];

  // Clear Selected jobs when multi-select mode is turned off
  useEffect(() => {
    async function loadEmails() {
      if (emailsLoaded || isLoadingEmails) return; // Prevent multiple loads

      setIsLoadingEmails(true);

      try {
        const emails = await getLastEmails(10); // Fetch the last 10 emails
        const emailJobCards = convertEmailsToJobCards(emails); // Convert emails to job card format

        setJobs(emailJobCards); // Update state with fetched job cards
        setEmailsLoaded(true); // Mark emails as loaded
      } catch (error) {
        console.error("Failed to load emails:", error);
        setEmailsLoaded(true); // Even on failure mark as loaded to prevent retrying
      }
      finally
      {
        setIsLoadingEmails(false);
      }
    }
    
    loadEmails();
  }, [ emailsLoaded, isLoadingEmails]);

  // Clear selected jobs when multi-select mode is turned off
  useEffect(() => {
    if (!isMultiSelecting) 
    {
      setSelectedJobs([]);
    }
  }, [isMultiSelecting]);

  const handleJobCardClick = useCallback((job: JobCardType) => {
    if (isMultiSelecting) {
      // If in multi-select mode, toggle selection of the clicked job card
      setSelectedJobs((prevSelected) => {
        if (prevSelected.includes(job)) {
          // If the job is already selected, remove it from the selection
          return prevSelected.filter((j) => j !== job);
        } else {
          // If the job is not selected, add it to the selection
          return [...prevSelected, job];
        }
      });
    } else {
      setSelectedJobs([]); // If not in multi-select mode, clear the selection
    }
  }, [isMultiSelecting]);

  // Log selected jobs for debugging purposes
  useEffect(() => {
    console.log("Selected Jobs Updated:", selectedJobs);
  }, [selectedJobs]);

  // Drag and Drop Handlers
  const handleDragStart = (JobCard: JobCardType) => {
    // Currently we can only drag and manually sort one card at a time.
    // we have the selected jobs array.
    // I think in the future we will allow users to drag stacks of cards.
    // or we can display a pop up menu that allows the user to select quick options that will apply to all selected cards.
    setItemDragged(JobCard);
  };

  const handleDragEnterColumn = (columnId: string) => {
    // When a column is entered during drag, set it as the current hovered column
    setIsOver(columnId);
  };

  const handleDragLeaveColumn = () => {
    // When leaving a column during drag, clear the hovered column state
    setIsOver(null);
  };

  const handleDragEnd = () => {
    // If an item was dragged and is over a different column, update its column
    if (itemDragged && isOver && itemDragged.column !== isOver) {
      // Update the job's column in state
      setJobs((prev) =>
        // Find the index of the dragged job and update its column
        prev.map((job) =>
          // If the job id matches the dragged item's id, update its column to the new column (isOver)
          job.id === itemDragged.id ? { ...job, column: isOver } : job
        )
      );
    }
    // Reset drag state
    setItemDragged(null);
    // Reset the hovered column state
    setIsOver(null);
  };

  // Column Height Management for Consistent Heights
  // This ensures all columns have the same height based on the tallest column
  // This prevents layout shifts when dragging items between columns of different heights
  const [columnHeights, setColumnHeights] = useState<Record<string, number>>(
    {}
  );

  // Calculate the maximum height among all columns
  const sharedHeight = useMemo(
    // Return the largest, 0 or the max height found in columnHeights
    () => Math.max(0, ...Object.values(columnHeights)),
    // Recalculate when columnHeights changes (insert/removal of job cards)
    [columnHeights]
  );

  // Callback to report a column's height
  // This is passed down to each Column component which calls it with its id and measured height
  // useCallback is used to memoize the function and prevent unnecessary re-renders
  // It only changes if setColumnHeights changes (which it won't)
  const handleReportHeight = useCallback((columnId: string, height: number) => {
    // Update the columnHeights state with the new height for the given columnId
    setColumnHeights((prev) => {
      // Only update if the height has changed to prevent unnecessary re-renders
      if (prev[columnId] === height) return prev;
      // Return a new object with the updated height for the specified columnId
      return { ...prev, [columnId]: height };
    });
  }, []);

  // Column configuration for the Kanban board
  // Each column has an id, title, and background color
  const columnConfig = [
    { id: "applied", title: "Applied", bg: "var(--color-light-purple)" },
    { id: "interview", title: "Interview", bg: "var(--color-teal)" },
    { id: "offers", title: "Offers", bg: "var(--color-dark-purple)" },
    { id: "accepted", title: "Accepted", bg: "var(--color-blue-gray)" },
  ];
  // Group jobs by their column for rendering
  // This creates a mapping of column ids to arrays of JobCard components
  // useMemo is used to memoize the result and only recalculate when jobs or columnConfig change
  const jobsByColumn = useMemo(() => {
    // Reduce the columnConfig array into an object mapping column ids to arrays of JobCard components
    return columnConfig.reduce<Record<string, JSX.Element[]>>((acc, column) => {
      // Filter jobs to those that belong to the current column and map them to JobCard components
      acc[column.id] = jobs
        .filter((job) => job.column.toLowerCase() === column.id) // filter jobs by column id
        .map(
          (
            job // map each job to a JobCard component
          ) => (
            <JobCard
              key={job.id} // unique key for React
              job={job} // pass down the job data
              onDragStart={handleDragStart} // pass down the drag start handler
              onDragEnd={handleDragEnd} // pass down the drag end handler
              isMultiSelecting={isMultiSelecting} // pass down multi-select state
              handleMultiSelectClick={handleJobCardClick} // handle job card click for selection
            />
          )
        );
      // Return the accumulated object for the next iteration (i.e. the next column)
      return acc;
    }, {});
  }, [jobs, columnConfig, isMultiSelecting, handleJobCardClick]);

  // show loading state while emails are being fetched
  if (isLoadingEmails) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p> Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center flex-col ">
      {/* ^ Page Container ^ */}
      <div className="w-full h-full flex flex-col items-center gap-4 p-4 overflow-y-auto">
        {/* ^ Content Container ^ */}
        <ControlBar // see ControlBar.tsx
          isMultiSelecting={isMultiSelecting}
          setIsMultiSelecting={setIsMultiSelecting}
          multiSelectLabel={isMultiSelecting ? "Multi Select" : ""}
          options={sortByOptions}
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

        {/* show message if no emails are loaded */}
        {jobs.length === 0 && !isLoadingEmails && (
          <div className="text-center">
            <p>No emails found.</p>
          </div>
        )}

        {/* Kan Ban Columns */}
        <div className="flex gap-4 w-full">
          {columnConfig.map(
            (
              column // iterate over each column in the config
            ) => (
              <Column
                key={column.id} // unique key for React
                id={column.id} // column id
                title={column.title} // column title
                bg={column.bg} // column background color
                count={jobsByColumn[column.id]?.length || 0} // pass down the count of job cards in the column
                onDragEnter={handleDragEnterColumn} // pass down drag enter handler
                onDragLeave={handleDragLeaveColumn} // pass down drag leave handler
                sharedHeight={sharedHeight} // pass down the shared height for consistent column heights
                reportHeight={handleReportHeight} // pass down the height reporting callback
              >
                {jobsByColumn[column.id]}{" "}
                {/* render the JobCards associated with the columns id */}
              </Column>
            )
          )}
        </div>
      </div>
    </div>
  );
}
