/**
 * Core utilities for the Cloudflare Agents template
 * STRICTLY DO NOT MODIFY THIS FILE - Hidden from AI to prevent breaking core functionality
 */
import type { AppController } from './app-controller';
import type { EmailTrackerAgent } from './email-agent';
export interface Env {
    EMAIL_TRACKER_AGENT: DurableObjectNamespace<EmailTrackerAgent>;
    APP_CONTROLLER: DurableObjectNamespace<AppController>;
}
/**
 * Get AppController stub for session management
 * Uses a singleton pattern with fixed ID for consistent routing
 */
export function getAppController(env: Env): DurableObjectStub<AppController> {
  const id = env.APP_CONTROLLER.idFromName("controller");
  return env.APP_CONTROLLER.get(id);
}