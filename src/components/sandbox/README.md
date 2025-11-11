# Sandbox Component

A reusable prompt engineering sandbox for testing AI agents with different roles, candidates, and feedback scenarios.

## 📁 Structure

```
sandbox/
├── sandbox.tsx                    ← Online version (requires backend API)
├── sandbox-offline.tsx            ← Offline version (uses mock data)
├── hooks/
│   ├── useMockJobPostings.ts     ← Mock hook for job postings
│   └── useMockCandidates.ts      ← Mock hook for candidates
├── ChatInterface.tsx              ← Chat UI with message history
├── ChatMessage.tsx                ← Individual message rendering
├── SelectionPanel.tsx             ← Role & candidate selector
├── FeedbackSection.tsx            ← Feedback management
├── FeedbackButton.tsx             ← Feedback item button
├── index.ts                       ← Clean exports
└── README.md                      ← This file
```

## 🚀 Usage

### Option 1: Online Version (Requires Backend)

Use this when you have a live backend API:

```typescript
import { Sandbox } from '@/components/sandbox'

function MyApp() {
  return <Sandbox />
}
```

**Requirements:**
- Backend API running at `NEXT_PUBLIC_API_BASE_URL`
- `/job-description/` endpoint for job postings
- `/candidate-generation/job-description/:id` endpoint for candidates

---

### Option 2: Offline Version (No Backend Required) ⭐ RECOMMENDED

Use this for local development, demos, or when porting to new apps:

```typescript
import { SandboxOffline } from '@/components/sandbox'

function MyApp() {
  return <SandboxOffline />
}
```

**Benefits:**
- ✅ Works completely offline
- ✅ Uses localStorage-backed mock data
- ✅ 275 realistic generated candidates
- ✅ 2 default job postings
- ✅ No backend setup required
- ✅ Perfect for demos and testing

---

## 🎯 Features

### 1. Chat Interface
- View conversation history between agent and candidate
- Step through messages with "Next" button
- Send test messages to simulate agent responses
- Auto-scrolls to latest message

### 2. Selection Panel
- **Select Open Role**: Choose which job posting to test
- **Select Candidate**: Choose which candidate profile to use
- **Candidate Photo**: Click to view full profile details

### 3. Feedback Section
- Add custom feedback/instructions for the agent
- Select/deselect feedback items
- Remove feedback items (hover to see trash icon)
- Empty state message when no feedback exists

### 4. Candidate Detail Panel
- Opens when clicking candidate photo
- Shows full LinkedIn-style profile
- Experience history
- Education
- Skills
- Contact information

---

## 📦 Dependencies

### Shared Dependencies (both versions)
- React Query (`@tanstack/react-query`) - for data fetching
- Lucide React - for icons
- Tailwind CSS - for styling
- Shadcn UI components - for UI elements

### Online Version Additional Dependencies
- `useJobPostings` hook from `@/hooks/useJobPostings`
- `useCandidatesByJobDescription` hook from `@/hooks/useSearch`
- Backend API endpoints

### Offline Version Additional Dependencies
- Mock data functions from `@/lib/mock-data`
- LocalStorage for data persistence

---

## 🔌 Porting to Other Applications

### Step 1: Copy the Component

Copy the entire `/src/components/sandbox/` directory to your new app:

```bash
cp -r src/components/sandbox /path/to/new-app/src/components/
```

### Step 2: Ensure Required Files Exist

Make sure these files exist in your new app:

1. `/src/lib/mock-data.ts` - Mock data generators
2. `/src/lib/utils.ts` - Utility functions (mapEnrichedCandidateToCandidate)
3. `/src/components/recruiter/CandidateDetailPanel.tsx` - Or create a generic version
4. All Shadcn UI components used (Button, Input, Select, etc.)

### Step 3: Use the Offline Version

In your app, import and use the offline version:

```typescript
import { SandboxOffline } from '@/components/sandbox'

export default function MyPage() {
  return (
    <div>
      <SandboxOffline />
    </div>
  )
}
```

### Step 4: (Optional) Customize Mock Data

Edit `/src/lib/mock-data.ts` to customize:
- Job postings
- Candidate generation
- Number of candidates
- Skills, companies, titles, etc.

---

## 🎨 Styling

The component uses:
- **Tailwind CSS** for layout and utilities
- **Black & white design language** (as per project standards)
- **Responsive grid layout** (2/3 chat, 1/3 controls)
- **Border-based UI** with minimal color

---

## 🧪 Mock Data Details

### Generated Candidates
- **Total**: 275 candidates
- **Job 1** (Senior Full Stack Engineer): 150 candidates
- **Job 2** (Territory Manager): 125 candidates
- **Realistic profiles** with:
  - Random names, locations, companies
  - 3-5 work experiences per candidate
  - Education history
  - 8-20 skills per candidate
  - Profile photos from pravatar.cc

### Job Postings
1. **Senior Full Stack Engineer**
   - Target: 500 candidates
   - URL: jobs.example.com/senior-full-stack-engineer

2. **Territory Manager**
   - Target: 500 candidates  
   - URL: jobs.example.com/territory-manager

### Data Persistence
- Stored in **localStorage** (browser-based)
- Persists across page refreshes
- Can be reset by clearing localStorage

---

## 🔧 Troubleshooting

### "No candidates loading"
- Check browser console for errors
- Ensure `initializeMockData()` is being called
- Clear localStorage and refresh page

### "CandidateDetailPanel not found"
- Ensure you have the CandidateDetailPanel component
- Or create a generic version without recruiter-specific dependencies

### "Type errors on import"
- Ensure all type definitions are imported correctly
- Check that `@/lib/utils` exports `Candidate` type
- Check that `@/lib/search-api` exports required types

---

## 📝 Future Enhancements

Potential improvements:
- [ ] Add AI service integration for real responses
- [ ] Export/import conversation history
- [ ] Save feedback templates
- [ ] Multi-message undo/redo
- [ ] Conversation branching
- [ ] A/B testing different prompts
- [ ] Performance metrics tracking

---

## 🤝 Contributing

When making changes:
1. Maintain both online and offline versions
2. Follow Standard.js code style
3. Keep components small and focused
4. Add comments for complex logic
5. Update this README with changes

---

## 📄 License

Part of the 248 project. Internal use only.

