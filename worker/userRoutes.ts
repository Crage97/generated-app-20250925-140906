import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { EmailTrackerAgent } from './email-agent';
import { Env } from "./core-utils";
const USER_ID = 'default-user'; // In a real app, this would come from authentication
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // This function is now empty as the chat agent is removed.
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/emails/*', async (c) => {
        try {
            const agent = await getAgentByName<Env, EmailTrackerAgent>(c.env.EMAIL_TRACKER_AGENT, USER_ID);
            const url = new URL(c.req.url);
            // Strip the base path to route correctly within the agent
            url.pathname = url.pathname.replace('/api/emails', '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            console.error('Agent routing error:', error);
            return c.json({
                success: false,
                error: 'Agent routing failed'
            }, { status: 500 });
        }
    });
}