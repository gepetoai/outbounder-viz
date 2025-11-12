# Landing Page Deployment Guide

## Deploy to Vercel

### 1. Initial Setup

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "Add New..." → "Project"
3. Import your repository: `gepetoai/outbounder-viz`
4. Select the repository from the list

### 2. Configure Project Settings

When setting up the project in Vercel:

- **Framework Preset:** Next.js (should auto-detect)
- **Root Directory:** `apps/landing` (IMPORTANT!)
- **Build Command:** `npm run build` (should auto-fill)
- **Output Directory:** `.next` (should auto-fill)
- **Install Command:** `npm install` (should auto-fill)

### 3. Environment Variables

Before deploying, add these environment variables in the Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**To get these values from your local setup:**
- They're in your `apps/landing/.env.local` file
- Copy them to Vercel's Environment Variables section

### 4. Deploy

Click "Deploy" and Vercel will:
- Install dependencies
- Build your Next.js app
- Deploy it to a URL like `your-project-name.vercel.app`

---

## Set Up Custom Domain

### Option A: Subdomain (Recommended)

If you want `landing.248.ai` or `app.248.ai`:

1. In your Vercel project, go to **Settings** → **Domains**
2. Add your desired subdomain (e.g., `landing.248.ai`)
3. Vercel will provide DNS records

4. In your **Webflow DNS settings** (or wherever 248.ai DNS is managed):
   - Add a CNAME record:
     - Type: `CNAME`
     - Name: `landing` (or `app`)
     - Value: `cname.vercel-dns.com`
     - TTL: Auto or 3600

5. Wait for DNS propagation (can take up to 48 hours, usually 5-10 minutes)

### Option B: Replace Main Site

If you want to replace the entire 248.ai site:

1. Export your current Webflow site as backup
2. Point 248.ai DNS to Vercel:
   - A Record: `76.76.21.21`
   - Add domain in Vercel project settings
   
**Note:** This will replace your entire Webflow site

---

## Recommended Setup

For your use case, I recommend:

1. Deploy to Vercel → Get URL like `landing-248ai.vercel.app`
2. Set up subdomain → `landing.248.ai` or `app.248.ai`
3. Keep your current Webflow site at `248.ai`
4. Link from Webflow to your new landing page if needed

This way you can:
- Keep existing Webflow content
- Add your React landing page on a subdomain
- Test everything before making changes
- Have flexibility to iterate quickly

---

## Updating Your Landing Page

After initial deployment, any changes you push to GitHub will:
- Automatically trigger a new deployment on Vercel
- Be live in ~2 minutes

Just commit and push:
```bash
git add .
git commit -m "Your changes"
git push origin individual_applications
```

---

## Testing

Once deployed, test:
1. All form fields work correctly
2. Form submits to Supabase
3. Customer logos display properly
4. Animated dots background renders
5. Mobile responsiveness
6. All links work correctly

