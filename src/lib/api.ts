import { TrackedEmail, EmailStatus } from '@/types';
const API_BASE = '/api';
export type AddEmailPayload = Omit<TrackedEmail, 'id' | 'status'>;
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  return result.data;
}
export const api = {
  getEmails: async (): Promise<TrackedEmail[]> => {
    const response = await fetch(`${API_BASE}/emails`);
    const data = await handleResponse<{ emails: TrackedEmail[] }>(response);
    // Dates will be strings over the wire, so we need to convert them back to Date objects
    return data.emails.map(email => ({
      ...email,
      sentAt: new Date(email.sentAt),
    }));
  },
  addEmail: async (email: AddEmailPayload): Promise<TrackedEmail> => {
    const response = await fetch(`${API_BASE}/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
    const data = await handleResponse<{ email: TrackedEmail }>(response);
    return {
        ...data.email,
        sentAt: new Date(data.email.sentAt),
    };
  },
  updateEmailStatus: async (id: string, status: EmailStatus): Promise<TrackedEmail> => {
    const response = await fetch(`${API_BASE}/emails/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await handleResponse<{ email: TrackedEmail }>(response);
    return {
        ...data.email,
        sentAt: new Date(data.email.sentAt),
    };
  },
};