// Defines the structure of a job card used in the client application

export type JobCardType = {
  id: string;
  title: string;
  column: string;
  date?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
};