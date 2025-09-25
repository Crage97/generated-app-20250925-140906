import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { EmailTrackerState, TrackedEmail, EmailStatus } from './types';
import { generateFollowUpDraft } from './ai';
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
export class EmailTrackerAgent extends Agent<Env, EmailTrackerState> {
  initialState: EmailTrackerState = {
    emails: [],
  };
  async alarm(): Promise<void> {
    const now = new Date();
    let changed = false;
    const emailUpdatePromises = this.state.emails.map(async (email) => {
      if (email.status === 'WAITING') {
        const sentAt = typeof email.sentAt === 'string' ? new Date(email.sentAt) : email.sentAt;
        const followUpDate = addDays(sentAt, email.followUpInterval);
        if (now.getTime() >= followUpDate.getTime()) {
          changed = true;
          try {
            const draft = await generateFollowUpDraft(this.env, email);
            return { ...email, status: 'FOLLOW_UP_SENT' as EmailStatus, followUpContent: draft };
          } catch (error) {
            console.error(`Failed to generate draft for email ${email.id}:`, error);
            // Still mark as sent, but with an error message in the content
            return { ...email, status: 'FOLLOW_UP_SENT' as EmailStatus, followUpContent: "Error: Could not generate AI draft." };
          }
        }
      }
      return email;
    });
    const updatedEmails = await Promise.all(emailUpdatePromises);
    if (changed) {
      this.setState({ emails: updatedEmails });
    }
    // Set the next alarm
    await this.ctx.storage.setAlarm(Date.now() + 60 * 60 * 1000); // Check again in 1 hour
  }
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    try {
      // Ensure an alarm is set if it doesn't exist
      const currentAlarm = await this.ctx.storage.getAlarm();
      if (currentAlarm === null) {
        await this.ctx.storage.setAlarm(Date.now() + 5000); // Set initial alarm 5s from now
      }
      if (method === 'GET' && url.pathname === '/') {
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