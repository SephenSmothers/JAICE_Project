// import { localfiles } from "@/directory/path/to/localimport";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { ControlBar } from "@/pages/home/home-components/ControlBar";
import { Column } from "@/pages/home/home-components/Column";
import { JobCard } from "@/pages/home/home-components/JobCards";
import type { JobCardType } from "@/types/jobCardType";
import { convertToJobCardArray } from "@/pages/home/utils/convertToJobCard";
import { api } from "@/global-services/api";
import { useJobRealtime } from "@/pages/home/hooks/useJobRealtime";
import { applyJobChange } from "@/pages/home/utils/applyJobChange";
import { getCurrentUserInfo } from "@/global-services/auth";
import { MultiSelectBar } from "@/pages/home/home-components/MultiSelectBar";

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
  const itemDraggedRef = useRef<JobCardType | null>(null); // to track the item being dragged
  const isOverRef = useRef<string | null>(null); // to track which column is being hovered over during drag-and-drop
  const [emailsLoaded, setEmailsLoaded] = useState(false); // to track if emails have been loaded
  const [isLoadingEmails, setIsLoadingEmails] = useState(false); // to prevent multiple email load attempts
  const [rlsToken, setRlsToken] = useState<string | null>(null); // to hold the RLS JWT token

  const sortByOptions = [
    { value: "default", label: "Sort by" },
    { value: "new", label: "Newest First" },
    { value: "old", label: "Oldest First" },
    { value: "az", label: "A - Z" },
    { value: "za", label: "Z - A" },
  ];

  //Loading user data from supabase and setting up web socket for real-time updates
  //THIS ORDER MATTERS DO NOT SHIFT THE LINES BETWEEN ################################
  // ###########################################################################################
  const userInfo = getCurrentUserInfo();
  const userId = userInfo?.uid || "";

  //Pull emails already in the job apps table
  useEffect(() => {
    loadEmails();
  }, []);

  async function loadEmails() {
    if (emailsLoaded || isLoadingEmails) return; // Prevent multiple loads

    setIsLoadingEmails(true);

    try {
      const res = await api("/api/jobs/latest-jobs");

      if (res.status == "success") {
        const cards = convertToJobCardArray(res.jobs);
        console.log("Transformed Job Cards:", cards);
        setJobs(cards);
        setEmailsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load emails:", error);
    } finally {
      setIsLoadingEmails(false);
    }
  }

  // Mint rls jwt token for realtime subscription (30 min expiry)
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await api("/api/auth/setup-frontend-rls-session", {
          method: "POST",
        });
        if (!cancelled) setRlsToken(res?.rls_jwt ?? null);
      } catch (e) {
        console.error("Failed to mint RLS JWT:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Refresh the rls token every 25 minutes
  // a JWT token will be minted each time the user navigates to the home page
  // If the user leaves the home page up and running for long periods the token will be refreshed
  // This ensures that we dont invalidate or miss any realtime updates while the user is active.
  useEffect(() => {
    if (!userId) return;

    const REFRESH_MS = 25 * 60 * 1000;
    let alive = true;

    const tick = async () => {
      try {
        // Optional: skip refresh if tab hidden to reduce churn
        if (document.visibilityState === "hidden") return;

        const res = await api("/api/auth/setup-frontend-rls-session", {
          method: "POST",
        });
        if (alive) {
          setRlsToken(res?.rls_jwt ?? null);
          console.log("🔄 Refreshed RLS token");
        }
      } catch (e) {
        console.warn(
          "RLS token refresh failed; will retry on next interval:",
          e
        );
      }
    };
    const id = setInterval(tick, REFRESH_MS);

    // cleanup on unmount / user change
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [userId]);

  const handleRealtimeChange = useCallback((event: any) => {
    setJobs((prev) => applyJobChange(prev, event));
  }, []);

  //subscribe to realtime changes using the rls token
  useJobRealtime(userId, rlsToken, handleRealtimeChange);

  // ###########################################################################################

  // Clear selected jobs when multi-select mode is turned off
  useEffect(() => {
    if (!isMultiSelecting) {
      setSelectedJobs([]);
    }
  }, [isMultiSelecting]);

  const handleJobCardClick = useCallback(
    (job: JobCardType) => {
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
    },
    [isMultiSelecting]
  );

  // Log selected jobs for debugging purposes
  useEffect(() => {
    console.log("Selected Jobs Updated:", selectedJobs);
  }, [selectedJobs]);

  const handleDragStart = (JobCard: JobCardType) => {
    setIsMultiSelecting(false);
    itemDraggedRef.current = JobCard;
  };

  const handleDragEnterColumn = (columnId: string) => {
    isOverRef.current = columnId;
  };

  const handleDragLeaveColumn = () => {
    isOverRef.current = null;
  };

  const handleDragEnd = async () => {
    // If an item was dragged and is over a different column, update its column
    const itemDragged = itemDraggedRef.current;
    const isOver = isOverRef.current;

    if (itemDragged && isOver && itemDragged.column !== isOver) {
      console.log(`Dropped item ${itemDragged.id} into column ${isOver}`);

      const updatedCard = { ...itemDragged, column: isOver };

      setJobs((prev) =>
        prev.map((job) =>
          job.id === itemDragged.id ? { ...job, column: isOver } : job
        )
      );

      try {
        await api("/api/jobs/update-stage", {
          method: "POST",
          body: JSON.stringify({
            provider_message_id: updatedCard.id,
            app_stage: updatedCard.column,
          }),
        });
        console.log("Job stage updated successfully");
      } catch (error) {
        console.error("Failed to update job stage:", error);
      }
    }
    itemDraggedRef.current = null;
    isOverRef.current = null;
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

  const baseColumnConfig = [
    { id: "applied", title: "Applied", bg: "var(--color-light-purple)" },
    { id: "interview", title: "Interview", bg: "var(--color-teal)" },
    { id: "offer", title: "Offer", bg: "var(--color-dark-purple)" },
    { id: "accepted", title: "Accepted", bg: "var(--color-blue-gray)" },
  ];

  const columnConfig = useMemo(() => {
    const hasStagingJobs = jobs.some(
      (job) => job.column?.toLowerCase() === "staging"
    );

    const columns = [...baseColumnConfig];
    if (hasStagingJobs) {
      columns.push({
        id: "staging",
        title: "Processing",
        bg: "var(--color-light-gray)",
      });
    }
    return columns;
  }, [jobs]);

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
      {isMultiSelecting && (
        <MultiSelectBar
          selectedJobs={selectedJobs}
          setSelectedJobs={setSelectedJobs}
          setIsMultiSelecting={setIsMultiSelecting}
        />
      )}
    </div>
  );
}
