import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { EmailTrackerState, TrackedEmail, EmailStatus } from './types';
// Using a simple date-fns alternative for worker environment
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const isAfter = (date1: Date, date2: Date): boolean => {
  return date1.getTime() > date2.getTime();
};
export class EmailTrackerAgent extends Agent<Env, EmailTrackerState> {
  initialState: EmailTrackerState = {
    emails: [],
  };
  private checkFollowUps(): void {
    const now = new Date();
    let changed = false;
    const updatedEmails = this.state.emails.map(email => {
      if (email.status === 'WAITING') {
        const sentAt = typeof email.sentAt === 'string' ? new Date(email.sentAt) : email.sentAt;
        const followUpDate = addDays(sentAt, email.followUpInterval);
        if (isAfter(now, followUpDate)) {
          changed = true;
          return { ...email, status: 'FOLLOW_UP_SENT' as EmailStatus };
        }
      }
      return email;
    });
    if (changed) {
      this.setState({ emails: updatedEmails });
    }
  }
  async onStart(): Promise<void> {
    // Periodically check for follow-ups.
    // In a real production app, this would be better handled by Alarms.
    this.ctx.setInterval(() => this.checkFollowUps(), 60000); // Every minute
  }
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    try {
      if (method === 'GET' && url.pathname === '/') {
        this.checkFollowUps(); // Check on every fetch
        return Response.json({ success: true, data: { emails: this.state.emails } });
      }
      if (method === 'POST' && url.pathname === '/') {
        const newEmailData = await request.json<Omit<TrackedEmail, 'id' | 'status'>>();
        const newEmail: TrackedEmail = {
          ...newEmailData,
          id: crypto.randomUUID(),
          status: 'WAITING',
          sentAt: new Date(newEmailData.sentAt),
        };
        this.setState({ emails: [...this.state.emails, newEmail] });
        return Response.json({ success: true, data: { email: newEmail } });
      }
      const statusMatch = url.pathname.match(/^\/([a-zA-Z0-9-]+)\/status$/);
      if (method === 'PUT' && statusMatch) {
        const emailId = statusMatch[1];
        const { status } = await request.json<{ status: EmailStatus }>();
        let updatedEmail: TrackedEmail | undefined;
        const updatedEmails = this.state.emails.map(email => {
          if (email.id === emailId) {
            updatedEmail = { ...email, status };
            return updatedEmail;
          }
          return email;
        });
        if (updatedEmail) {
          this.setState({ emails: updatedEmails });
          return Response.json({ success: true, data: { email: updatedEmail } });
        } else {
          return Response.json({ success: false, error: 'Email not found' }, { status: 404 });
        }
      }
      return Response.json({ success: false, error: 'Not Found' }, { status: 404 });
    } catch (error) {
      console.error('EmailTrackerAgent Error:', error);
      return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
  }
}