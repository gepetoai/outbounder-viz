# Generic Layout Components

Reusable layout components for headers, titles, and sidebars following 248.AI design language. These components are fully generalized and can be used across any application.

## Components

### AppHeader

Main application header with optional logo and action buttons.

**Props:**
- `title` (string) - Application title
- `logo` (ReactNode, optional) - Logo element or image
- `actions` (ReactNode, optional) - Action buttons or menu
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { AppHeader } from '@/components/layout'

<AppHeader
  title="My Application"
  logo={<Logo />}
  actions={
    <>
      <Button variant="outline">Help</Button>
      <Button>Upgrade</Button>
    </>
  }
/>
```

### PageTitle

Page-level title with optional subtitle and actions.

**Props:**
- `title` (string) - Page title
- `subtitle` (string, optional) - Descriptive subtitle
- `actions` (ReactNode, optional) - Action buttons
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { PageTitle } from '@/components/layout'

<PageTitle
  title="Dashboard"
  subtitle="Overview of your key metrics"
  actions={
    <>
      <Button variant="outline">Export</Button>
      <Button>Create New</Button>
    </>
  }
/>
```

### Sidebar

Collapsible sidebar container with header and footer support.

**Props:**
- `children` (ReactNode) - Sidebar content (typically SidebarGroups)
- `isOpen` (boolean) - Open/collapsed state
- `onToggle` (function) - Toggle handler
- `header` (ReactNode, optional) - Header content
- `footer` (ReactNode, optional) - Footer content (typically SidebarUser)
- `width` ('sm' | 'md' | 'lg', default: 'md') - Sidebar width when open
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { Sidebar } from '@/components/layout'

<Sidebar
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  header={<h1>App Name</h1>}
  footer={<SidebarUser name="User" />}
  width="md"
>
  {/* Sidebar content */}
</Sidebar>
```

### SidebarItem

Individual sidebar navigation item with icon and badge support.

**Props:**
- `label` (string) - Item label
- `icon` (string | ReactNode, optional) - Icon path or element
- `isActive` (boolean, default: false) - Active state
- `isCollapsed` (boolean, default: false) - Collapsed sidebar state
- `onClick` (function, optional) - Click handler
- `badge` (string | number, optional) - Badge value
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { SidebarItem } from '@/components/layout'

<SidebarItem
  label="Dashboard"
  icon="/icons/dashboard.svg"
  isActive={active === 'dashboard'}
  onClick={() => navigate('/dashboard')}
  badge={5}
/>
```

### SidebarGroup

Groups related sidebar items with optional title.

**Props:**
- `title` (string, optional) - Group title
- `children` (ReactNode) - SidebarItems
- `isCollapsed` (boolean, default: false) - Collapsed sidebar state
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { SidebarGroup, SidebarItem } from '@/components/layout'

<SidebarGroup title="Main Navigation">
  <SidebarItem label="Home" icon="/icons/home.svg" />
  <SidebarItem label="Settings" icon="/icons/settings.svg" />
</SidebarGroup>
```

### SidebarUser

User profile section for sidebar footer.

**Props:**
- `name` (string, optional) - User name
- `email` (string, optional) - User email
- `avatar` (string | ReactNode, optional) - Avatar URL or element
- `isCollapsed` (boolean, default: false) - Collapsed sidebar state
- `onClick` (function, optional) - Click handler
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { SidebarUser } from '@/components/layout'

<SidebarUser
  name="John Doe"
  email="john@example.com"
  avatar="/avatars/john.jpg"
  onClick={() => openProfile()}
/>
```

## Complete Example

```tsx
import {
  AppHeader,
  PageTitle,
  Sidebar,
  SidebarItem,
  SidebarGroup,
  SidebarUser
} from '@/components/layout'

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState('home')

  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        header={<h1>My App</h1>}
        footer={
          <SidebarUser
            name="John Doe"
            email="john@example.com"
            isCollapsed={!sidebarOpen}
          />
        }
      >
        <SidebarGroup title="Navigation" isCollapsed={!sidebarOpen}>
          <SidebarItem
            label="Home"
            icon="/icons/home.svg"
            isActive={activePage === 'home'}
            isCollapsed={!sidebarOpen}
            onClick={() => setActivePage('home')}
          />
          <SidebarItem
            label="Dashboard"
            icon="/icons/dashboard.svg"
            isActive={activePage === 'dashboard'}
            isCollapsed={!sidebarOpen}
            onClick={() => setActivePage('dashboard')}
            badge={3}
          />
        </SidebarGroup>
      </Sidebar>

      <div className="flex-1 flex flex-col">
        <AppHeader
          title="My Application"
          logo={<Logo />}
          actions={<Button>Action</Button>}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <PageTitle
            title="Page Title"
            subtitle="Description"
            actions={<Button>Create</Button>}
          />
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Design Language

All components follow 248.AI brand guidelines:

**Colors:**
- Primary Text: `#1C1B20` (Midnight)
- Secondary Text: `#777D8D` (Sky)
- Body Text: `#40404C` (Shadow)
- Backgrounds: White, `#F5F5F5`
- Borders: `#E5E7EB`

**Typography:**
- App Headers: `2xl` (24px), bold
- Page Titles: `xl` (20px), bold
- Sidebar Items: `sm` (14px), regular
- Group Titles: `xs` (12px), uppercase, semibold

**Spacing:**
- Consistent padding and margins
- 248.AI standard spacing scale
- Smooth transitions (300ms)

## Usage Across Applications

Import directly into any app:

```tsx
import { AppHeader, PageTitle, Sidebar, SidebarItem, SidebarGroup, SidebarUser } from '@/components/layout'
```

Or copy component files to your application. All components are self-contained with minimal dependencies:
- React
- Next.js Image
- Tailwind CSS
- Shadcn UI Button component


