
/**
 * Column Props
 *
 * These props are currently incomplete. When ready the columns will need to be provided
 * Job objects and will nest inside the columns
 */
interface ColumnProps {
  title: string;
  count: number;
  backgroundColor: string;
}

export function Column({ title, count, backgroundColor }: ColumnProps) {
  const columnStyle = {
    backgroundColor: backgroundColor,
    borderRadius: "8px",
    width: "100%",
    border: "1px solid #ccc",
    height: "fit-content",
    minWidth: "15rem"
  };

  return (
    <div style={columnStyle}>
      <div className="flex items-center justify-between p-4">
        <h3>+</h3>
        <h3>{title}</h3>
        <h3>{count}</h3>
      </div>
      <div className="flex border-b mx-4 mb-2"/>
      {/* Cards would go here */}
    </div>
  );
}
