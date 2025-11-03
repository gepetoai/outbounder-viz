# 248 Platform - Monorepo

This is a monorepo containing four independent applications for sales and recruiting automation.

## Applications

### 🎯 Recruiter
Talent acquisition tools for finding and managing candidates.
- **Run:** `npm run dev:recruiter`
- **Port:** localhost:3000

### 📨 Inbounder
Lead capture and qualification for inbound sales.
- **Run:** `npm run dev:inbounder`
- **Port:** localhost:3000

### 🚀 Outbounder
Outbound sales automation and campaign management.
- **Run:** `npm run dev:outbounder`
- **Port:** localhost:3000

### 🔍 Researcher
Lead research and enrichment tools.
- **Run:** `npm run dev:researcher`
- **Port:** localhost:3000

## Structure

```
outbounder-viz/
├── apps/                      # Independent Next.js applications
│   ├── recruiter/            # Full-featured recruiter app
│   ├── inbounder/            # Inbounder app (placeholder)
│   ├── outbounder/           # Outbounder app (placeholder)
│   └── researcher/           # Researcher app (placeholder)
├── packages/                  # Shared code
│   ├── ui/                   # Shared UI components (Shadcn)
│   ├── auth/                 # Unified auth wrapper (Clerk)
│   └── lib/                  # Shared utilities, API client, hooks
└── package.json              # Root scripts
```

## Getting Started

1. **Install dependencies for all apps:**
   ```bash
   npm run install:all
   ```

2. **Run an application:**
   ```bash
   npm run dev:recruiter    # or inbounder, outbounder, researcher
   ```

3. **Important:** Only run ONE app at a time since they all use port 3000.

## Development Workflow

### Switching Between Apps

Since all apps run on `localhost:3000`, you need to stop the current server before starting a new one:

```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Then start the app you want
npm run dev:recruiter
```

### Working on Shared Code

- **UI Components:** Edit files in `packages/ui/`
- **Auth Logic:** Edit files in `packages/auth/`
- **Utilities/Hooks:** Edit files in `packages/lib/`

All apps automatically import from these packages using the `@248/` namespace:
```typescript
import { Button } from '@248/ui/button'
import { AuthWrapper } from '@248/auth'
import { useJobPostings } from '@248/lib'
```

## Building for Production

Build individual apps:
```bash
npm run build:recruiter
npm run build:inbounder
npm run build:outbounder
npm run build:researcher
```

## Technical Details

- **Framework:** Next.js 15.5.4
- **React:** 19.1.0
- **Styling:** Tailwind CSS 4 + Stylus modules
- **UI Components:** Shadcn UI + Radix UI
- **State Management:** Zustand + React Query
- **Auth:** Clerk (shared across all apps)

## Notes

- Each app is completely independent and can be deployed separately
- Shared packages reduce code duplication
- All apps share the same design system and authentication
- Each app has its own `node_modules` and can have app-specific dependencies
