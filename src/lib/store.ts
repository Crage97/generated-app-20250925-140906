import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TrackedEmail, EmailStatus } from '@/types';
import { api, AddEmailPayload } from '@/lib/api';
interface EmailState {
  emails: TrackedEmail[];
  isLoading: boolean;
  error: string | null;
  fetchEmails: () => Promise<void>;
  addEmail: (email: AddEmailPayload) => Promise<void>;
  updateEmailStatus: (id: string, status: EmailStatus) => Promise<void>;
}
export const useEmailStore = create<EmailState>()(
  immer((set) => ({
    emails: [],
    isLoading: true,
    error: null,
    fetchEmails: async () => {
      try {
        set({ isLoading: true, error: null });
        const emails = await api.getEmails();
        set({ emails, isLoading: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch emails';
        set({ isLoading: false, error: errorMessage });
      }
    },
    addEmail: async (email) => {
      try {
        const newEmail = await api.addEmail(email);
        set((state) => {
          state.emails.push(newEmail);
        });
      } catch (error) {
        console.error("Failed to add email:", error);
        // Optionally, set an error state to show in the UI
      }
    },
    updateEmailStatus: async (id, status) => {
      try {
        const updatedEmail = await api.updateEmailStatus(id, status);
        set((state) => {
          const index = state.emails.findIndex((e) => e.id === id);
          if (index !== -1) {
            state.emails[index] = updatedEmail;
          }
        });
      } catch (error) {
        console.error("Failed to update email status:", error);
        // Optionally, set an error state
      }
    },
  }))
);
// Initial fetch when the store is created
useEmailStore.getState().fetchEmails();