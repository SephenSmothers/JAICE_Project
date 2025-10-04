import React, { useLayoutEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
  bg: string;
  count: number;
  onDragEnter: (columnId: string) => void;
  onDragLeave: () => void;
  reportHeight: (columnId: string, height: number) => void;
  sharedHeight: number;
};

export function Column({
  id,
  title,
  children,
  bg,
  count,
  onDragEnter,
  onDragLeave,
  reportHeight,
  sharedHeight,
}: ColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);  // Ref to the column div

  // This allows us to measure the height of each column and report it upstream
  useLayoutEffect(() => {
    const node = columnRef.current;                // sets node to the current column ref (in this case since we iteratively create columns, each column will have its own ref)
    if (!node) return;                             // if no node, exit early
    const prev = node.style.minHeight;             // previous height is stored
    node.style.minHeight = "auto";                 // min height is set to auto to get the actual height of the column and it's children
    const measured = node.offsetHeight;            // measured height is stored
    node.style.minHeight = prev;                   // previous height is restored
    reportHeight(id, measured);                    // report the measured height to the parent component

    // dependency array ensures this effect runs when children change (i.e. when a job card is added or removed)
  }, [children, id, reportHeight]);

  const columnStyle = {
    backgroundColor: bg,
    borderRadius: "8px",
    width: "100%",
    border: "1px solid #ccc",
    height: "fit-content",
    minWidth: "15rem",
    minHeight: sharedHeight || "50rem",   // this ensures all columns share the same height or default to 50rem if no children exist.
  };

  // useCallback is used to memoize the drag handlers to prevent unnecessary re-renders
  const handlePointerEnter = useCallback(() => {
    onDragEnter(id);
  }, [onDragEnter, id]);

  const handlePointerLeave = useCallback(() => {
    onDragLeave();
  }, [onDragLeave]);

  // onPointerEnter and onPointerLeave are used to send the column id up to the parent for drag and drop handling
  // layout is used for smooth animations when removing or adding job cards (drag and drop)
  // React.Children.count(children) is the safe way to count the number of cards a columns has
  return (
    <motion.div
      id={id}
      ref={columnRef}
      style={columnStyle}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`flex flex-col m-2 p-2 border-4 border-white`}
      layout
    >
      <div className="flex items-center justify-between p-4 select-none">
        <h3>+</h3>
        <h3>{title}</h3>
        <h3>{count}</h3>
      </div>
      <div className="flex border-b mx-4 mb-2" />
      <div className="flex flex-col items-center p-2 gap-4">{children}</div>
    </motion.div>
  );
}
