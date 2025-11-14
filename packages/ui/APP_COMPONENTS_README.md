# 248.AI Application Components

Generalized, reusable components for building 248.AI applications with consistent branding and UX.

## Components Overview

### 1. AppLayout
Main layout wrapper for the entire application.

```tsx
import { AppLayout } from '@248/ui'

<AppLayout>
  {/* Your app content */}
</AppLayout>
```

**Props:**
- `children: ReactNode` - Content to render
- `className?: string` - Optional additional classes

**Features:**
- Sets consistent background color (#FAFAFA)
- Provides flex container for sidebar + main content
- Full-screen height layout

---

### 2. AppSidebar
Collapsible navigation sidebar with header and user section.

```tsx
import { AppSidebar, SidebarNavItem } from '@248/ui'

<AppSidebar
  appName="Laboratory"
  defaultOpen={true}
  onToggle={(isOpen) => console.log(isOpen)}
>
  <SidebarNavItem
    id="dashboard"
    label="Dashboard"
    iconPath="/icons/sparkles-dark.svg"
    isActive={true}
    onClick={() => navigate('dashboard')}
  />
  {/* More nav items */}
</AppSidebar>
```

**Props:**
- `appName: string` - Name displayed in sidebar header
- `children: ReactNode` - Navigation items (typically SidebarNavItem components)
- `defaultOpen?: boolean` - Initial open state (default: true)
- `userIcon?: string` - Path to user icon (default: '/icons/user-dark.svg')
- `showUser?: boolean` - Show user section at bottom (default: true)
- `onToggle?: (isOpen: boolean) => void` - Callback when sidebar toggles

**Features:**
- Smooth collapse animation (64px → 12px width)
- Auto-switches between hamburger and X icons
- User avatar section at bottom
- Follows 248.AI grayscale color palette
- White background with #EEEEEE borders

---

### 3. SidebarNavItem
Individual navigation button for the sidebar.

```tsx
import { SidebarNavItem } from '@248/ui'

<SidebarNavItem
  id="search"
  label="Search"
  iconPath="/icons/magnifying-glass-dark.svg"
  isActive={activeTab === 'search'}
  isCollapsed={!sidebarOpen}
  onClick={() => setActiveTab('search')}
/>
```

**Props:**
- `id: string` - Unique identifier
- `label: string` - Display text
- `iconPath: string` - Path to icon SVG
- `isActive?: boolean` - Whether item is currently active (default: false)
- `isCollapsed?: boolean` - Whether sidebar is collapsed (default: false)
- `onClick?: () => void` - Click handler

**Features:**
- Active state styling (Midnight #1C1B20 background)
- Icon-only mode when collapsed
- Custom 248.AI icons from branding assets
- Smooth transitions

**Icon Paths:**
Available in `/public/icons/` (copy from `/Branding Assets/Custom Icons/Dark/SVGs/`):
- `address-book-dark.svg` - Contacts/Inbox
- `sparkles-dark.svg` - AI/Magic features
- `magnifying-glass-dark.svg` - Search
- `sliders-dark.svg` - Settings/Controls
- `bars-dark.svg` - List/Table view
- `grid-dark.svg` - Card/Grid view
- `bolt-dark.svg` - Power/Speed features
- `gear-dark.svg` - Settings
- `user-dark.svg` - User profile

---

### 4. AppMain
Main content area wrapper.

```tsx
import { AppMain } from '@248/ui'

<AppMain>
  <AppTitle title="Dashboard" subtitle="Overview of your workspace" />
  {/* Your content */}
</AppMain>
```

**Props:**
- `children: ReactNode` - Main content
- `className?: string` - Optional additional classes

**Features:**
- Handles overflow and scrolling
- 24px padding on all sides
- Flex layout for content

---

### 5. AppTitle
Page title with optional subtitle.

```tsx
import { AppTitle } from '@248/ui'

<AppTitle 
  title="Sequencer D3"
  subtitle="Visualize candidate sequences"
/>
```

**Props:**
- `title: string` - Main title text
- `subtitle?: string` - Optional subtitle/description
- `className?: string` - Optional additional classes

**Features:**
- Follows 248.AI typography hierarchy
- Title: 24px, bold, Midnight (#1C1B20)
- Subtitle: 14px, regular, Sky (#777D8D)
- Bottom margin for spacing

---

### 6. AppHeader
Top navigation header bar (optional).

```tsx
import { AppHeader } from '@248/ui'
import { Button } from '@248/ui'

<AppHeader
  logoSrc="/icons/248ai-logo-light.svg"
  logoAlt="248.AI"
>
  <Button>Settings</Button>
  <Button>Logout</Button>
</AppHeader>
```

**Props:**
- `logoSrc?: string` - Path to logo (default: '/icons/248ai-logo-light.svg')
- `logoAlt?: string` - Logo alt text (default: '248.AI')
- `children?: ReactNode` - Right-side content (buttons, user menu, etc.)
- `className?: string` - Optional additional classes

**Features:**
- Fixed 64px height
- White background with subtle border
- Logo on left, actions on right
- Follows 248.AI header pattern

---

## Complete Example

Here's a full implementation example from the Laboratory app:

```tsx
'use client'

import { useState } from 'react'
import { AppLayout, AppMain, AppSidebar, SidebarNavItem, AppTitle } from '@248/ui'

type Tab = 'dashboard' | 'search' | 'settings'

export default function MyApp () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', iconPath: '/icons/sparkles-dark.svg' },
    { id: 'search' as const, label: 'Search', iconPath: '/icons/magnifying-glass-dark.svg' },
    { id: 'settings' as const, label: 'Settings', iconPath: '/icons/gear-dark.svg' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />
      case 'search':
        return <SearchView />
      case 'settings':
        return <SettingsView />
      default:
        return null
    }
  }

  return (
    <AppLayout>
      <AppSidebar
        appName="My Application"
        defaultOpen={sidebarOpen}
        onToggle={(isOpen) => setSidebarOpen(isOpen)}
      >
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
        <AppTitle 
          title={tabs.find(tab => tab.id === activeTab)?.label || ''}
          subtitle="Subtitle text here"
        />
        {renderContent()}
      </AppMain>
    </AppLayout>
  )
}
```

---

## Branding Guidelines

These components follow 248.AI branding standards:

### Colors
- **Midnight** (#1C1B20) - Primary dark, headers, active states
- **Shadow** (#40404C) - Body text
- **Sky** (#777D8D) - Supporting text, subtitles
- **Sheen** (#B9B8C0) - Subtle elements
- **Glare** (#EEEEEE) - Borders, subtle backgrounds
- **Pure White** (#FFFFFF) - Main backgrounds
- **Light Gray** (#F5F5F5 - #FAFAFA) - Section backgrounds

### Icons
- Use custom 248.AI icons from `/Branding Assets/Custom Icons/Dark/SVGs/`
- Copy needed icons to `/public/icons/` in your app
- Line-based design, ~2px stroke width
- 16x16px default size in navigation
- Always provide alt text for accessibility

### Typography
- **Bold** for titles and headings
- **Regular** for body text
- **Grayscale only** - no bright colors
- Left-align text blocks
- Generous spacing and white space

---

## Migration Guide

To migrate existing apps to use these components:

1. **Replace layout wrapper:**
```tsx
// Before
<div className="flex h-screen bg-background">
  {/* content */}
</div>

// After
<AppLayout>
  {/* content */}
</AppLayout>
```

2. **Replace sidebar:**
```tsx
// Before
<div className={`${sidebarOpen ? 'w-64' : 'w-12'} ...`}>
  {/* sidebar content */}
</div>

// After
<AppSidebar appName="Your App" defaultOpen={sidebarOpen}>
  {/* nav items */}
</AppSidebar>
```

3. **Replace nav items:**
```tsx
// Before
<Button onClick={...}>
  <Image src={icon} />
  {label}
</Button>

// After
<SidebarNavItem
  id={id}
  label={label}
  iconPath={icon}
  isActive={active}
  onClick={...}
/>
```

4. **Replace main content wrapper:**
```tsx
// Before
<div className="flex-1 flex flex-col overflow-hidden">
  <main className="flex-1 overflow-auto p-6">
    {/* content */}
  </main>
</div>

// After
<AppMain>
  {/* content */}
</AppMain>
```

5. **Replace page title:**
```tsx
// Before
<h1 className="text-xl font-bold">{title}</h1>

// After
<AppTitle title={title} subtitle={subtitle} />
```

---

## Benefits

- **Consistency**: All apps look and feel the same
- **Maintainability**: Update once, applies everywhere
- **Branding**: Follows 248.AI design system
- **Accessibility**: Built-in ARIA attributes and semantic HTML
- **Responsive**: Works on all screen sizes
- **Type-safe**: Full TypeScript support
- **Flexible**: Composable and customizable

---

## Future Enhancements

Potential additions:
- AppBreadcrumbs - Navigation breadcrumbs
- AppSearch - Global search component
- AppNotifications - Notification center
- AppUserMenu - User dropdown menu
- AppTabs - Tab navigation component
- AppCard - Standardized card component
- AppEmptyState - Empty state patterns
- AppLoadingState - Loading indicators

---

## Support

For questions or issues, refer to:
- `/Branding Assets/248-BRANDING-GUIDE.md` - Complete branding guide
- `/Branding Assets/Custom Icons/` - Icon library
- Repository rules - React and TypeScript best practices


