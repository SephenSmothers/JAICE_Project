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
    id: String(rawJob.provider_message_id),
    title: rawJob.title || "No Title",
    column: rawJob.app_stage || "applied",
    date: rawJob.received_at
      ? new Date(rawJob.received_at).toLocaleDateString()
      : undefined,
    isArchived: rawJob.is_archived || false,
    isDeleted: rawJob.is_deleted || false,
  };
}

// This converter processes the broadcast event payload to extract job card info.
export function convertBroadcastToJobCard(event: any): JobCardType | null {
  const eventRecord =
    event?.payload?.record ??
    event?.payload?.old ??
    null;

  if (!eventRecord || !eventRecord.provider_message_id) return null;

  return {
    id: String(eventRecord.provider_message_id),
    title: eventRecord.title ?? "No Title",
    column: eventRecord.app_stage ?? "applied",
    date: eventRecord.received_at
      ? new Date(eventRecord.received_at).toLocaleDateString()
      : undefined,
    isArchived: eventRecord.is_archived || false,
    isDeleted: eventRecord.is_deleted || false,
  };
}
