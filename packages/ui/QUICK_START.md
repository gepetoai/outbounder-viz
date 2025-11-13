# 248.AI App Components - Quick Start

## 5-Minute Setup

### 1. Install Dependencies

Already included in `@248/ui` package.

### 2. Copy Icons to Your App

Copy needed icons from `/Branding Assets/Custom Icons/Dark/SVGs/` to your app's `/public/icons/` directory.

**Essential Icons:**
```bash
# From Branding Assets/Custom Icons/Dark/SVGs/
cp address-book-dark.svg public/icons/
cp sparkles-dark.svg public/icons/
cp magnifying-glass-dark.svg public/icons/
cp sliders-dark.svg public/icons/
cp bars-dark.svg public/icons/
cp grid-dark.svg public/icons/
cp list-dark.svg public/icons/
cp bolt-dark.svg public/icons/
cp gear-dark.svg public/icons/
cp user-dark.svg public/icons/
cp xmark-dark.svg public/icons/
```

### 3. Basic Implementation

```tsx
'use client'

import { useState } from 'react'
import { 
  AppLayout, 
  AppMain, 
  AppSidebar, 
  SidebarNavItem, 
  AppTitle 
} from '@248/ui'

export default function MyApp () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <AppLayout>
      {/* Sidebar Navigation */}
      <AppSidebar
        appName="My App"
        defaultOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      >
        <SidebarNavItem
          id="dashboard"
          label="Dashboard"
          iconPath="/icons/sparkles-dark.svg"
          isActive={activeTab === 'dashboard'}
          isCollapsed={!sidebarOpen}
          onClick={() => setActiveTab('dashboard')}
        />
        <SidebarNavItem
          id="search"
          label="Search"
          iconPath="/icons/magnifying-glass-dark.svg"
          isActive={activeTab === 'search'}
          isCollapsed={!sidebarOpen}
          onClick={() => setActiveTab('search')}
        />
      </AppSidebar>

      {/* Main Content */}
      <AppMain>
        <AppTitle title="Dashboard" subtitle="Welcome back!" />
        <div>Your content here</div>
      </AppMain>
    </AppLayout>
  )
}
```

### 4. With TypeScript

```tsx
type Tab = 'dashboard' | 'search' | 'settings'

interface NavTab {
  id: Tab
  label: string
  iconPath: string
}

const tabs: NavTab[] = [
  { id: 'dashboard', label: 'Dashboard', iconPath: '/icons/sparkles-dark.svg' },
  { id: 'search', label: 'Search', iconPath: '/icons/magnifying-glass-dark.svg' },
  { id: 'settings', label: 'Settings', iconPath: '/icons/gear-dark.svg' }
]

export default function MyApp () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <AppLayout>
      <AppSidebar appName="My App" onToggle={setSidebarOpen}>
        {tabs.map((tab) => (
          <SidebarNavItem
            key={tab.id}
            id={tab.id}
            label={tab.label}
            iconPath={tab.iconPath}
            isActive={activeTab === tab.id}
            isCollapsed={!sidebarOpen}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </AppSidebar>

      <AppMain>
        <AppTitle title={tabs.find(t => t.id === activeTab)?.label || ''} />
        {/* Content based on activeTab */}
      </AppMain>
    </AppLayout>
  )
}
```

## Component Cheat Sheet

### AppLayout
```tsx
<AppLayout>{/* children */}</AppLayout>
```
**What it does:** Full-screen container with #FAFAFA background

---

### AppSidebar
```tsx
<AppSidebar
  appName="String"           // Required: App name in header
  defaultOpen={true}         // Optional: Initial state
  onToggle={(bool) => {}}    // Optional: Callback on toggle
  showUser={true}            // Optional: Show user section
  userIcon="/path.svg"       // Optional: User icon path
>
  {/* SidebarNavItem components */}
</AppSidebar>
```
**What it does:** Collapsible sidebar (256px → 48px)

---

### SidebarNavItem
```tsx
<SidebarNavItem
  id="unique-id"             // Required: Unique identifier
  label="Label"              // Required: Display text
  iconPath="/icons/x.svg"    // Required: Icon path
  isActive={false}           // Optional: Active state
  isCollapsed={false}        // Optional: Collapsed state
  onClick={() => {}}         // Optional: Click handler
/>
```
**What it does:** Navigation button with icon

---

### AppMain
```tsx
<AppMain>{/* content */}</AppMain>
```
**What it does:** Main content area with padding & scroll

---

### AppTitle
```tsx
<AppTitle
  title="Title"              // Required: Main title
  subtitle="Subtitle"        // Optional: Subtitle text
/>
```
**What it does:** Page title with optional subtitle

---

### AppHeader (Optional)
```tsx
<AppHeader
  logoSrc="/logo.svg"        // Optional: Logo path
  logoAlt="Alt text"         // Optional: Logo alt
>
  {/* Right-side content */}
</AppHeader>
```
**What it does:** Top navigation bar

---

## Common Patterns

### Pattern 1: Simple Navigation
```tsx
const [active, setActive] = useState('home')

<SidebarNavItem
  id="home"
  label="Home"
  iconPath="/icons/sparkles-dark.svg"
  isActive={active === 'home'}
  onClick={() => setActive('home')}
/>
```

### Pattern 2: Dynamic Content Rendering
```tsx
const renderContent = () => {
  switch (activeTab) {
    case 'dashboard': return <Dashboard />
    case 'search': return <Search />
    default: return null
  }
}

<AppMain>
  <AppTitle title={getTitle(activeTab)} />
  {renderContent()}
</AppMain>
```

### Pattern 3: URL-Based Navigation
```tsx
import { useRouter, usePathname } from 'next/navigation'

const router = useRouter()
const pathname = usePathname()

<SidebarNavItem
  id="settings"
  label="Settings"
  iconPath="/icons/gear-dark.svg"
  isActive={pathname === '/settings'}
  onClick={() => router.push('/settings')}
/>
```

### Pattern 4: Conditional User Section
```tsx
const { user } = useAuth()

<AppSidebar
  appName="My App"
  showUser={!!user}
  userIcon={user?.avatar || '/icons/user-dark.svg'}
>
  {/* nav items */}
</AppSidebar>
```

## Customization

### Custom Sidebar Width
```tsx
// In your styles or Tailwind config
<div className="custom-sidebar">
  <AppSidebar ... />
</div>

// CSS
.custom-sidebar [class*="w-64"] {
  width: 320px; // Custom width
}
```

### Custom Colors (Not Recommended)
Follow 248.AI branding, but if needed:
```tsx
<AppSidebar appName="Test">
  <div style={{ backgroundColor: '#1C1B20' }}>
    {/* Custom styled content */}
  </div>
</AppSidebar>
```

### Custom Title Styling
```tsx
<AppTitle 
  title="Custom Title"
  className="text-3xl mb-8"
/>
```

## Troubleshooting

### Icons not showing
- ✅ Check icon path is correct
- ✅ Verify icons are in `/public/icons/`
- ✅ Use correct file name (e.g., `sparkles-dark.svg`)
- ✅ Check browser console for 404 errors

### Sidebar not collapsing
- ✅ Pass `onToggle` handler
- ✅ Update state in parent component
- ✅ Pass `isCollapsed={!sidebarOpen}` to nav items

### Active state not working
- ✅ Set `isActive={activeTab === item.id}`
- ✅ Update `activeTab` state in `onClick`
- ✅ Use unique `id` for each nav item

### TypeScript errors
- ✅ Import types from `@248/ui`
- ✅ Check prop types match interface
- ✅ Ensure required props are provided

## Migration from Old Code

### Before (Manual Implementation)
```tsx
<div className="flex h-screen">
  <div className="w-64 border-r">
    <h1>App Name</h1>
    <Button onClick={...}>
      <Icon /> Label
    </Button>
  </div>
  <div className="flex-1">
    <h1>Title</h1>
    <Content />
  </div>
</div>
```

### After (Using Components)
```tsx
<AppLayout>
  <AppSidebar appName="App Name">
    <SidebarNavItem
      id="item"
      label="Label"
      iconPath="/icons/icon.svg"
      onClick={...}
    />
  </AppSidebar>
  <AppMain>
    <AppTitle title="Title" />
    <Content />
  </AppMain>
</AppLayout>
```

## Next Steps

1. ✅ Copy icons to `/public/icons/`
2. ✅ Replace manual layouts with `<AppLayout>`
3. ✅ Replace sidebars with `<AppSidebar>`
4. ✅ Replace nav buttons with `<SidebarNavItem>`
5. ✅ Replace titles with `<AppTitle>`
6. ✅ Test sidebar collapse/expand
7. ✅ Test navigation flow
8. ✅ Verify branding consistency

## Examples

See full examples in:
- `/apps/laboratory/src/app/page.tsx` - Complete implementation
- `/packages/ui/APP_COMPONENTS_README.md` - Detailed documentation
- `/packages/ui/COMPONENT_HIERARCHY.md` - Visual structure

## Support

Questions? Check:
- `APP_COMPONENTS_README.md` - Full documentation
- `COMPONENT_HIERARCHY.md` - Architecture
- `/Branding Assets/248-BRANDING-GUIDE.md` - Branding rules

