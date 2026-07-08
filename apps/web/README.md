# @rpos/web

Author/editor-facing web app.

## Frontend stack (project standard, applies to every RPOS app)

| Purpose        | Library                              | Status              |
| -------------- | ------------------------------------ | ------------------- |
| Framework      | Next.js 15 + React 19                | in use              |
| Styling        | Tailwind CSS v4                      | in use              |
| Components     | shadcn/ui (`components/ui/*`)        | in use              |
| Accessibility  | Radix UI primitives                  | in use (via shadcn) |
| Icons          | Lucide React                         | in use              |
| Forms          | React Hook Form + Zod                | in use              |
| Data fetching  | TanStack Query                       | provider wired      |
| State          | Zustand                              | add on first need   |
| Charts         | Apache ECharts                       | add on first need   |
| Tables         | TanStack Table                       | add on first need   |
| Drag & drop    | dnd-kit                              | add on first need   |
| Animation      | Framer Motion                        | add on first need   |

Add shadcn components with `pnpm dlx shadcn@latest add <component>` (configured via
`components.json`). Form schemas come from `@rpos/validation` so client and server
validate identically.

## Auth model

Login/register call the auth service from server actions and store the JWT in an
httpOnly cookie; every service request happens server-side (`lib/api.ts`), so no
tokens are exposed to browser JS and no CORS setup is needed.
