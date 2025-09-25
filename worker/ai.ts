import OpenAI from 'openai';
import type { Env } from './core-utils';
import type { TrackedEmail } from './types';
export async function generateFollowUpDraft(env: Env, email: TrackedEmail): Promise<string> {
  if (!env.CF_AI_BASE_URL || !env.CF_AI_API_KEY) {
    console.error("AI environment variables not set.");
    return "AI configuration is missing. Please check server setup.";
  }
  const openai = new OpenAI({
    baseURL: env.CF_AI_BASE_URL,
    apiKey: env.CF_AI_API_KEY,
  });
  const prompt = `
    You are an AI assistant for a tool called MomentumMail that helps users follow up on emails.
    A user sent an email and has not received a response.
    Your task is to write a polite, concise, and professional follow-up email draft.
    Keep it short and to the point, under 75 words.
    Do not include a subject line, only the body of the email.
    Original Email Details:
    - Recipient: ${email.recipient}
    - Subject: "${email.subject}"
    - Sent: ${new Date(email.sentAt).toDateString()}
    Generate the follow-up email body now.
  `;
  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });
    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("AI returned empty content.");
    }
    return content;
  } catch (error) {
    console.error("Error generating follow-up draft from AI:", error);
    throw new Error("Failed to communicate with AI service.");
  }
}