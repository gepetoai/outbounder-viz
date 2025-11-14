# Laboratory - Universal Component Development

**Port: 3004** | http://localhost:3004

## Overview

This is the dedicated laboratory workspace for building, testing, and showcasing universal components that will be used across all 248 apps (recruiter, inbounder, outbounder, researcher).

The laboratory uses a **configuration-driven architecture** that makes it easy to add new components and features without touching the core code.

## Sequencer Component

A production-ready workflow builder with organic "bubble" layout physics. Built with React Flow and WebCola for automatic collision avoidance and smooth animations.

### Key Features

✅ **11 Action Types:**
- Connection Request
- View Profile  
- Like Post
- Send Message (multi-channel)
- Send Email
- Wait/Delay
- If/Then Conditionals (with branching)
- Rescind Connection Request
- Update Salesforce
- Webhook
- End Sequence

✅ **Physics-Based Layout:**
- WebCola integration for bubble-like node positioning
- Automatic collision avoidance
- Smooth 1-second animations when adding nodes
- Vertical top-to-bottom flow
- Nodes freeze after animation (no jitter)

✅ **User Interface:**
- "Add Action" button at top (opens modal with categorized actions)
- "+" buttons under each node for inline insertion
- Gear icon on nodes for configuration
- Delete button with warning (removes all child nodes)
- Right-sliding configuration panel
- Template save/load system (localStorage)

✅ **Configuration Panels:**
Each action type has a custom configuration interface:
- **Connection Request**: AI instructions + variables + samples + LinkedIn char limit
- **Send Message**: Channel selector (LinkedIn/Instagram/Messenger/SMS/Email) + AI config
- **Wait**: Duration input (1-99) + unit dropdown (Minutes/Hours/Days)
- **If/Then**: Condition selector (Message replied/not replied, Connection accepted/ignored)
- **Salesforce**: Output mapping to 6 placeholder fields
- **Webhook**: URL + method + headers + payload
- **Like Post**: Post selection (last one/specific topic/random)
- **View Profile**: Time of day selector
- And more...

✅ **Branching Logic:**
- If/Then nodes have Yes/No branches
- Each branch gets its own "+ button for adding actions
- Nested conditionals supported
- No loops (prevents infinite sequences)
- Paths cannot merge back together

✅ **Templates:**
- Save sequences with custom names
- Load templates (replaces entire canvas)
- Stored in localStorage (API integration ready)
- Dropdown selector for quick access

### Design Principles

- **Black & White**: Minimalist, flat design with no colors except gray
- **Large Nodes**: Variable size based on content, easy to follow
- **Organic Lines**: Gray 2px smooth step edges with rounded corners
- **No Manual Dragging**: Auto-layout only, physics-driven positioning
- **Smooth Animations**: 1-second cubic-bezier transitions
- **Start Node**: Always present, can't be deleted, slightly larger
- **End Sequence Required**: Can't go live without proper termination

### Architecture

```
src/
├── app/
│   └── page.tsx                  # Main lab page (config-driven)
├── config/
│   └── lab-sections.tsx          # Section configuration & status
├── components/
│   ├── common/
│   │   └── FeaturePlaceholder.tsx  # Generic placeholder component
│   ├── demos/
│   │   ├── CardsDemo.tsx          # Card components showcase
│   │   └── LayoutDemo.tsx         # Layout components showcase
│   ├── cards/                     # StatCard, ContentCard, MetricGrid
│   ├── layout/                    # AppHeader, Sidebar, PageTitle
│   ├── table/                     # DataTable, TableView
│   ├── sequencer/                 # Workflow builder (see below)
│   ├── sandbox/                   # Experimental features
│   └── components-showcase/       # UI component documentation
└── lib/                           # Utilities and API clients
```

### Sequencer Architecture

```
src/components/sequencer/
├── Sequencer.tsx              # Main component with React Flow
├── actionTypes.ts             # All 11 action type definitions
├── ActionSelectorModal.tsx    # Categorized action picker
├── ConfigurationPanel.tsx     # Right sidebar with node-specific forms
├── TemplateManager.tsx        # Save/load template interface
├── nodes/
│   ├── StartNode.tsx          # Fixed start node (can't delete)
│   ├── ActionNode.tsx         # Standard action node
│   ├── ConditionalNode.tsx    # If/Then with dual branches
│   └── EndNode.tsx            # Sequence termination node
└── layout/
    └── colaLayout.ts          # WebCola physics simulation
```

### Next Steps

Once complete and tested:
1. Move to `packages/ui/sequencer/`
2. Export from `packages/ui/index.ts`
3. Import in all apps: `import { Sequencer } from '@248/ui'`
4. Configure via props for app-specific behavior

### Tech Stack

- React Flow 11.11.4
- WebCola (cola.js) for physics
- Tailwind CSS for styling
- TypeScript for type safety
- localStorage for template persistence

### Development

```bash
cd apps/laboratory
npm run dev
```

Open http://localhost:3004

### Testing the Sequencer

1. Click "Add Action" or "+" button
2. Select an action type from modal
3. Node appears with smooth animation
4. Click gear icon to configure
5. Right panel slides in with settings
6. Save configuration
7. Add more nodes to build sequence
8. Test branching with If/Then nodes
9. Save as template
10. Load template to verify persistence

## Available Sections

The laboratory is organized into sections, each with a status indicator:

| Section | Status | Description |
|---------|--------|-------------|
| Layout | ✓ Ready | |
| Components | ✓ Ready | Core UI component library showcase |
| Cards | ✓ Ready | |
| Table | ✓ Ready | |
| Sequencer D3 | ✓ Ready | Visual workflow builder with physics-based layout |
| Settings | ✓ Ready | Application settings and preferences |
| Search | ⚙ In Progress | |
| Sequencer | ⚙ In Progress | Alternative sequencer implementation |
| Sandbox | ⚙ In Progress | |
| Messages | ⚙ In Progress | Message management interface |
| Inbox | ✓ Ready | Email review interface with response type and user filters |

## Adding New Sections

To add a new section to the laboratory, edit `src/config/lab-sections.tsx`:

```tsx
{
  id: 'new-feature',
  label: 'New Feature',
  iconPath: '/icons/icon-dark.svg',
  component: NewFeatureComponent,
  status: 'ready' | 'in-progress' | 'planned',
  description: 'Brief description of the feature'
}
```

No changes needed elsewhere - the system automatically:
- Adds the section to the sidebar
- Displays the status badge
- Routes to the component
- Shows the description

## Refactoring

The laboratory was recently refactored to improve maintainability. See `REFACTORING_SUMMARY.md` for details.

Key improvements:
- **80% less placeholder code** (generic FeaturePlaceholder component)
- **Config-driven architecture** (add sections via config, not code)
- **Status system** (visual indicators for component readiness)
- **Better organization** (demos/ directory for showcase components)

---

**Built with Cursor AI** 🚀

