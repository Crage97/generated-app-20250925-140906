export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type EmailStatus = 'WAITING' | 'REPLIED' | 'FOLLOW_UP_SENT';
export interface TrackedEmail {
  id: string;
  recipient: string;
  subject: string;
  sentAt: Date | string; // Allow string for serialization
  followUpInterval: number; // in days
  status: EmailStatus;
}
export interface EmailTrackerState {
  emails: TrackedEmail[];
}