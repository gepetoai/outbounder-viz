# Landing Page - 248 Sales Automation Platform

This is the landing/login page for the 248 platform, ported from the alternative version in `src/components/auth/login-page.tsx`.

## Running the App

To start the development server:

```bash
cd /Users/mertiseri/Documents/248/Prototyping/outbounder-viz/apps/landing
rm -rf .next && npm run dev
```

The app will start on port 3003 by default: http://localhost:3003

To use a different port:

```bash
PORT=3005 npm run dev
```

## Making Copy Changes

The main landing page content is in:
- `src/app/page.tsx`

You can edit the following sections:
- **Header title and tagline** (lines 16-21)
- **Main headline** (lines 28-30)
- **Feature descriptions** for each product (lines 36-79)
- **"Why choose 248?" benefits** (lines 83-104)
- **Login card title and description** (lines 112-115)

## Features

The landing page includes:
- Responsive two-column layout
- Features showcase for all 4 products (Outbounder, Inbounder, Researcher, Recruiter)
- "Why choose 248?" section with benefits
- Sign In / Create Account buttons powered by Clerk
- Beautiful gradient background

## Notes

- This app is configured to run independently from the other apps in the monorepo
- Clerk authentication is integrated but can be disabled if needed
- The page uses Tailwind CSS for styling
- UI components (Button, Card) are local to this app in `src/components/ui/`

