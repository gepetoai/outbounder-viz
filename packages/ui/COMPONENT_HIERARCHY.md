# 248.AI Application Component Hierarchy

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ AppLayout                                                       │
│ (Full screen container, #FAFAFA background)                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐│
│  │ AppSidebar       │  │ AppMain                              ││
│  │ (Collapsible)    │  │ (Main content area)                  ││
│  │                  │  │                                      ││
│  │ ┌──────────────┐ │  │ ┌──────────────────────────────────┐││
│  │ │ Header       │ │  │ │ AppTitle                         │││
│  │ │ "Laboratory" │ │  │ │ "Sequencer D3"                   │││
│  │ │ [X Button]   │ │  │ │ (with optional subtitle)         │││
│  │ └──────────────┘ │  │ └──────────────────────────────────┘││
│  │                  │  │                                      ││
│  │ ┌──────────────┐ │  │ ┌──────────────────────────────────┐││
│  │ │ Navigation   │ │  │ │ Your Content                     │││
│  │ │              │ │  │ │                                  │││
│  │ │ [✨] Item 1  │ │  │ │ <YourComponent />                │││
│  │ │ [📖] Item 2  │ │  │ │                                  │││
│  │ │ [🔍] Item 3  │ │  │ │                                  │││
│  │ │ [⚙️] Item 4  │ │  │ │                                  │││
│  │ │              │ │  │ │                                  │││
│  │ └──────────────┘ │  │ │                                  │││
│  │                  │  │ │                                  │││
│  │ ┌──────────────┐ │  │ └──────────────────────────────────┘││
│  │ │ User Section │ │  │                                      ││
│  │ │ [👤] User    │ │  │                                      ││
│  │ └──────────────┘ │  │                                      ││
│  └──────────────────┘  └──────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Component Tree

```tsx
<AppLayout>
  └─ <AppSidebar 
       appName="Your App"
       defaultOpen={true}
       onToggle={handleToggle}
     >
       ├─ <SidebarNavItem
            id="item1"
            label="Dashboard"
            iconPath="/icons/sparkles-dark.svg"
            isActive={true}
            onClick={handleClick}
          />
       ├─ <SidebarNavItem ... />
       ├─ <SidebarNavItem ... />
       └─ <SidebarNavItem ... />
     </AppSidebar>

  └─ <AppMain>
       ├─ <AppTitle 
            title="Page Title"
            subtitle="Optional subtitle"
          />
       └─ <YourContentComponent />
     </AppMain>
</AppLayout>
```

## Optional: With Header

```
┌─────────────────────────────────────────────────────────────────┐
│ AppLayout                                                       │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ AppHeader (Optional)                                       ││
│  │ [248.AI Logo]                      [Actions] [User Menu]   ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐│
│  │ AppSidebar       │  │ AppMain                              ││
│  │ ...              │  │ ...                                  ││
│  └──────────────────┘  └──────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

```tsx
<AppLayout>
  <AppHeader logoSrc="/icons/logo.svg">
    <Button>Settings</Button>
    <UserMenu />
  </AppHeader>

  <div className="flex flex-1">
    <AppSidebar ...>
      {/* nav items */}
    </AppSidebar>

    <AppMain>
      {/* content */}
    </AppMain>
  </div>
</AppLayout>
```

## State Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Parent Component (Your Page)                                │
│                                                             │
│ State:                                                      │
│  - sidebarOpen: boolean                                     │
│  - activeTab: string                                        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ AppSidebar                                              │ │
│ │   props.onToggle(isOpen) → setSidebarOpen(isOpen)      │ │
│ │                                                         │ │
│ │   ┌──────────────────────────────────────────────────┐ │ │
│ │   │ SidebarNavItem                                   │ │ │
│ │   │   props.onClick() → setActiveTab(id)             │ │ │
│ │   │   props.isActive = (activeTab === id)            │ │ │
│ │   │   props.isCollapsed = !sidebarOpen               │ │ │
│ │   └──────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ AppMain                                                 │ │
│ │   <AppTitle title={getCurrentTitle(activeTab)} />      │ │
│ │   {renderContent(activeTab)}                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Styling Architecture

### Color Palette (248.AI Branding)

```
Sidebar Background:    #FFFFFF (Pure White)
Sidebar Borders:       #EEEEEE (Glare)
App Background:        #FAFAFA (Light Gray)

Text - Primary:        #1C1B20 (Midnight)
Text - Body:           #40404C (Shadow)
Text - Supporting:     #777D8D (Sky)
Text - Subtle:         #B9B8C0 (Sheen)

Active State:          #1C1B20 (Midnight bg, White text)
Hover State:           #F5F5F5 (Light gray bg)
```

### Spacing

```
Sidebar Width (Open):      256px (w-64)
Sidebar Width (Collapsed): 48px (w-12)
Header Height:             72px
Main Content Padding:      24px (p-6)
Nav Item Height:           36px (h-9)
Nav Item Spacing:          8px (space-y-2)
```

### Typography

```
Sidebar Title:        text-xl (20px), font-bold
Page Title:           text-2xl (24px), font-bold
Subtitle:             text-sm (14px), regular
Nav Item:             text-base (16px), regular
```

## Responsive Behavior

### Desktop (Default)
- Sidebar: 256px wide when open
- Full navigation labels visible
- User section shows avatar + name

### Tablet (< 1024px)
- Consider collapsing sidebar by default
- Icon-only navigation
- Toggle to expand

### Mobile (< 768px)
- Sidebar overlays content when open
- Backdrop/overlay when sidebar is open
- Touch-friendly tap targets

## Best Practices

### Do's ✅
- Keep navigation items to 8-10 max
- Use semantic icon names
- Provide meaningful alt text
- Handle sidebar state in parent
- Use AppTitle for consistent headings
- Follow 248.AI color palette strictly

### Don'ts ❌
- Don't nest AppLayout components
- Don't use bright colors (blues, greens, etc.)
- Don't hardcode sidebar state in component
- Don't mix Lucide icons with 248.AI icons
- Don't center-align large text blocks
- Don't add excessive animations

## Accessibility

- All icons have alt text
- Keyboard navigation supported
- Focus states visible
- ARIA labels on interactive elements
- Semantic HTML structure
- Color contrast meets WCAG AA standards

## Performance

- React.memo() for nav items (optional)
- useCallback for click handlers
- CSS transitions (hardware accelerated)
- No inline styles (except brand colors)
- Lazy load content components

## Testing

```tsx
// Test sidebar toggle
const { getByRole } = render(<AppSidebar appName="Test" />)
const toggleButton = getByRole('button')
fireEvent.click(toggleButton)
expect(onToggle).toHaveBeenCalledWith(false)

// Test nav item activation
const { getByText } = render(
  <SidebarNavItem 
    id="test"
    label="Test"
    iconPath="/test.svg"
    onClick={handleClick}
  />
)
fireEvent.click(getByText('Test'))
expect(handleClick).toHaveBeenCalled()
```

