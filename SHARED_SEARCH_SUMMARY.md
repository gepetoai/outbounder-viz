# Shared Search Component - Implementation Summary

## Overview

Successfully extracted and created a reusable search component from the recruiter app's SearchTab, now available as a shared package component for use across all 248.AI applications.

## What Was Created

### 1. Shared UI Components (in `/packages/ui/`)

- **`search-types.ts`** - TypeScript interfaces and types
  - `SearchParams` - All search filter parameters
  - `ProspectProfile` - Profile data structure
  - `SearchFormProps` - Component props interface

- **`search-form.tsx`** - Main reusable search form component
  - Education filters (graduation years)
  - Location filters (state, city, radius)
  - Experience filters (years, positions, connections, time in role)
  - Inclusions (titles, keywords, industries)
  - Exclusions (titles, keywords, management levels)
  - Profile preview side panel
  - Search management (save, update, run)
  - Profile enrichment controls

- **`SEARCH_README.md`** - Comprehensive documentation
  - Usage examples
  - Props reference
  - Brand compliance notes
  - Icon requirements
  - Integration examples

### 2. Laboratory Integration

- **`/apps/laboratory/src/components/search/SearchView.tsx`** - Laboratory wrapper component
  - Implements SearchForm with default state
  - Configured for "prospects" search type
  - Ready to connect to real APIs

- Updated `/apps/laboratory/src/app/page.tsx` to use SearchView instead of SearchPlaceholder

### 3. Custom Icons Copied

Added to `/apps/laboratory/public/icons/`:
- `paper-plane-light.svg` - Send to review
- `loader-light.svg` - Loading states
- `magnifying-glass-dark.svg` - Search button (already existed)

## Brand Compliance ✅

### Icons
- ✅ **All Lucide React icons replaced with 248.AI custom icons**
- ✅ Uses `/icons/` path for all icon assets
- ✅ Grayscale icons only (no bright colors)

### Color Palette
- ✅ `#1C1B20` (Midnight) - Headers, primary buttons
- ✅ `#40404C` (Shadow) - Body text
- ✅ `#777D8D` (Sky) - Supporting text
- ✅ `#B9B8C0` (Sheen) - Subtle elements
- ✅ `#EEEEEE` (Glare) - Dividers, cards
- ✅ `#FFFFFF` - Main backgrounds

### Design Principles
- ✅ Generous white space
- ✅ Clear typographic hierarchy
- ✅ Self-explanatory components (no descriptive text paragraphs)
- ✅ Left-aligned text blocks
- ✅ Clean, modern UI with subtle shadows

### Typography
- ✅ System UI/Inter fonts
- ✅ Proper heading hierarchy (h2, h3)
- ✅ Consistent label sizing (text-xs, text-sm)
- ✅ Bold weights for emphasis

## Key Features

1. **Flexible Search Type**
   - Supports both `candidates` (recruiting) and `prospects` (sales)
   - Configurable context labels

2. **Comprehensive Filters**
   - Education: Graduation year ranges
   - Location: State, city, radius-based
   - Experience: Multiple criteria (years, positions, connections, etc.)
   - Inclusions: Job titles, keywords
   - Exclusions: Titles, keywords, management levels

3. **Profile Management**
   - Preview profiles in staging area
   - Side panel for detailed profile view
   - Batch enrichment with configurable limits
   - Send to review functionality

4. **Search Management**
   - Save searches with custom titles
   - Update existing searches
   - Track modification state
   - Run saved searches

## Usage in Other Apps

### For Recruiting (Candidates)

```tsx
import { SearchForm, SearchParams, ProspectProfile } from '@248/ui'

<SearchForm
  {...standardProps}
  searchType="candidates"
  contextLabel="Job Posting"
  contextId={jobPostingId}
/>
```

### For Sales (Prospects)

```tsx
import { SearchForm, SearchParams, ProspectProfile } from '@248/ui'

<SearchForm
  {...standardProps}
  searchType="prospects"
  contextLabel="Target Market"
  contextId={targetMarketId}
/>
```

## Data Provider Integration

The component is designed to integrate with:

- **Coresignal** - Professional profile data
- **Britedata** - Business intelligence
- **Apollo** - B2B contact database

Integration happens through:
1. Custom hooks for API calls (e.g., `useCreateSearch`, `useEnrichCandidates`)
2. API client functions in `lib/` directories
3. State management at the application level

## Files Modified

### Created
- `/packages/ui/search-types.ts`
- `/packages/ui/search-form.tsx`
- `/packages/ui/SEARCH_README.md`
- `/apps/laboratory/src/components/search/SearchView.tsx`
- `/outbounder-viz/SHARED_SEARCH_SUMMARY.md` (this file)

### Modified
- `/packages/ui/index.ts` - Added exports
- `/apps/laboratory/src/components/search/index.ts` - Added SearchView export
- `/apps/laboratory/src/app/page.tsx` - Use SearchView instead of SearchPlaceholder
- `/apps/laboratory/public/icons/` - Added missing icons

### Unchanged (Reference)
- `/apps/recruiter/src/components/recruiter/SearchTab.tsx` - Original implementation remains unchanged

## Testing

The component can be tested in the Laboratory app:

```bash
cd apps/laboratory
npm run dev
```

Navigate to the "Search" tab to see the new shared SearchForm in action.

## Next Steps

To use in other applications:

1. **Import the component**
   ```tsx
   import { SearchForm, SearchParams, ProspectProfile } from '@248/ui'
   ```

2. **Set up state management**
   - Create state for searchParams, resultCount, profiles, etc.

3. **Implement API integration**
   - Create hooks for search operations
   - Connect to data providers (Coresignal, Britedata, Apollo)

4. **Copy required icons**
   - Ensure all required icons are in `public/icons/`
   - See SEARCH_README.md for full list

5. **Configure for your use case**
   - Set `searchType` to 'candidates' or 'prospects'
   - Set appropriate `contextLabel`
   - Pass relevant `contextId`

## Benefits

✅ **Consistent UX** - Same search experience across all apps  
✅ **Brand Compliant** - Follows 248.AI design system  
✅ **DRY Principle** - No code duplication  
✅ **Maintainable** - Single source of truth for search UI  
✅ **Flexible** - Adapts to different use cases (candidates vs prospects)  
✅ **Type Safe** - Full TypeScript support  

## Architecture

```
outbounder-viz/
├── packages/
│   └── ui/
│       ├── search-form.tsx        # Main component
│       ├── search-types.ts        # TypeScript definitions
│       ├── SEARCH_README.md       # Documentation
│       └── index.ts               # Exports
│
└── apps/
    ├── laboratory/
    │   └── src/
    │       └── components/
    │           └── search/
    │               └── SearchView.tsx   # Laboratory implementation
    │
    └── recruiter/
        └── src/
            └── components/
                └── recruiter/
                    └── SearchTab.tsx    # Original (unchanged)
```

## Maintenance

When adding new features to the search functionality:

1. Add to `/packages/ui/search-form.tsx`
2. Update types in `/packages/ui/search-types.ts`
3. Document in `/packages/ui/SEARCH_README.md`
4. Test in laboratory app
5. Roll out to other apps as needed

## Notes

- The recruiter app's SearchTab was used as the reference implementation
- All Lucide icons have been replaced with 248.AI custom icons
- Color values are hardcoded inline to ensure brand compliance
- The component handles its own internal state but exposes control via props
- Mock data is used in laboratory for testing without API dependencies

