export type EmailStatus = 'WAITING' | 'REPLIED' | 'FOLLOW_UP_SENT';
export interface TrackedEmail {
  id: string;
  recipient: string;
  subject: string;
  sentAt: Date;
  followUpInterval: number; // in days
  status: EmailStatus;
}