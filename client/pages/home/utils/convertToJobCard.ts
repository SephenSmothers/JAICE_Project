import type { JobCardType } from "@/types/jobCardType";
// These utility functions convert the raw job data from the database or broadcast events.
// The format for the returned data from the database comes in two forms. One is standard fetch, the other is from the realtime broadcast payload.


// This array converter is for the inital bulk processing/fetch from the database when the user logs in.
export function convertToJobCardArray(rawJobs: any[] = []): JobCardType[] {
  return rawJobs.map(convertToJobCard); 
}

// This single item converter is for processing individual job records from a normal db fetch.
export function convertToJobCard(rawJob: any): JobCardType {
  return {
    id: String(rawJob.id),
    title: rawJob.title || "No Title",
    column: rawJob.app_stage || "applied",
    date: rawJob.received_at
      ? new Date(rawJob.received_at).toLocaleDateString()
      : undefined,
  };
}

// This converter processes the broadcase event payload to extract job card info.
export function convertBroadcastToJobCard(event: any): JobCardType | null {
  const record =
    event?.payload?.record ??
    event?.payload?.old ??
    null;

  if (!record || !record.id) return null;

  return {
    id: String(record.id),
    title: record.title ?? "No Title",
    column: record.app_stage ?? "applied",
    date: record.received_at
      ? new Date(record.received_at).toLocaleDateString()
      : undefined,
  };
}
