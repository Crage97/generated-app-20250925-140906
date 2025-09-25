# MomentumMail: AI-Powered Email Follow-ups

An intelligent, minimalist web app that automates email follow-ups to ensure your conversations never go cold.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Crage97/generated-app-20250925-140906)

## About The Project

MomentumMail is a minimalist, intelligent web application designed to automate email follow-ups, ensuring no conversation gets dropped. Users can connect their email account and designate specific sent emails for tracking. An AI-powered agent then monitors these emails for replies. If no response is received within a user-defined timeframe (e.g., 3, 5, or 7 days), the agent automatically sends a polite, context-aware follow-up email.

The application provides a clean, focused dashboard to visualize the status of all tracked emails—seeing which are awaiting a reply, which have been replied to, and which have had follow-ups sent. The core of the experience is a serene, uncluttered interface that removes the anxiety of manual follow-ups and empowers users to maintain momentum in their professional communications.

## Key Features

- **Automated Follow-ups:** Set a timer (e.g., 3, 5, 7 days) and let the AI agent send a follow-up if you don't get a reply.
- **Email Tracking:** Add emails to your dashboard to monitor their status.
- **Status Visualization:** See at a glance which emails are `Waiting`, have been `Replied` to, or have had a `Follow-up Sent`.
- **Minimalist Dashboard:** A clean, uncluttered interface designed for focus and clarity.
- **Client-Side First:** Fully interactive and demoable experience running entirely in the browser for the initial phase.

## Technology Stack

This project is built with a modern, high-performance tech stack:

- **Frontend:**
    - **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
    - **Language:** [TypeScript](https://www.typescriptlang.org/)
    - **Styling:** [Tailwind CSS](https://tailwindcss.com/)
    - **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
    - **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
    - **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
    - **Animation:** [Framer Motion](https://www.framer.com/motion/)
    - **Icons:** [Lucide React](https://lucide.dev/)

- **Backend:**
    - **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/)
    - **Framework:** [Hono](https://hono.dev/)
    - **Stateful Agents:** [Cloudflare Agents](https://developers.cloudflare.com/workers/agents/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Bun](https://bun.sh/) package manager

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/momentum-mail.git
    cd momentum-mail
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.dev.vars` file in the root of the project for local development. This file is used by Wrangler to load environment variables.
    ```ini
    # .dev.vars

    # Cloudflare AI Gateway URL
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"

    # Cloudflare AI Gateway API Key
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```
    *Note: While Phase 1 is frontend-only, setting up these variables is good practice for future phases.*

## Development

To start the local development server, which includes the Vite frontend and the Cloudflare Worker backend, run:

```sh
bun run dev
```

This will start the application, typically on `http://localhost:3000`. The frontend will hot-reload on changes, providing a seamless development experience.

## Deployment

This application is designed to be deployed on the Cloudflare network.

1.  **Login to Cloudflare:**
    If you haven't already, authenticate with your Cloudflare account.
    ```sh
    bunx wrangler login
    ```

2.  **Configure Production Secrets:**
    For a production deployment, you must set your environment variables as secrets in your Cloudflare dashboard or via the command line.
    ```sh
    bunx wrangler secret put CF_AI_BASE_URL
    bunx wrangler secret put CF_AI_API_KEY
    ```

3.  **Deploy the application:**
    Run the deploy script to build the application and deploy it to your Cloudflare account.
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Crage97/generated-app-20250925-140906)

## Project Structure

- `src/`: Contains all the frontend React application code.
    - `pages/`: Top-level page components.
    - `components/`: Reusable React components, including `ui/` for shadcn components.
    - `lib/`: Utility functions and state management stores.
    - `hooks/`: Custom React hooks.
- `worker/`: Contains all the backend Cloudflare Worker and Agent code.
    - `index.ts`: The entry point for the worker.
    - `agent.ts`: The core `ChatAgent` class for stateful logic.
    - `userRoutes.ts`: Hono routes for the API.
- `wrangler.jsonc`: Configuration file for the Cloudflare Worker.

## License

Distributed under the MIT License. See `LICENSE` for more information.