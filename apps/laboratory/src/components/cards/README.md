# Generic Card Components

Reusable card components following 248.AI design language. These components are fully generalized and can be used across any application.

## Components

### StatCard

Display metrics, counts, and statistics with optional icons and progress bars.

**Props:**
- `value` (string | number) - The main metric value to display
- `label` (string) - Label text below the value
- `icon` (ReactNode, optional) - Icon to display above the value
- `onClick` (function, optional) - Click handler
- `isActive` (boolean, default: false) - Active state styling
- `showProgressBar` (boolean, default: false) - Show progress bar at bottom
- `progressPercent` (number, default: 0) - Progress bar percentage (0-100)
- `variant` ('default' | 'outlined' | 'filled', default: 'default') - Visual variant
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { StatCard } from '@/components/cards'

<StatCard
  value={125}
  label="Total Items"
  icon={<Icon />}
  showProgressBar
  progressPercent={75}
/>
```

### ContentCard

Flexible content containers with optional headers and footers.

**Props:**
- `children` (ReactNode) - Card content
- `header` (ReactNode, optional) - Header content
- `footer` (ReactNode, optional) - Footer content
- `onClick` (function, optional) - Click handler
- `variant` ('default' | 'elevated' | 'flat', default: 'default') - Shadow variant
- `padding` ('none' | 'sm' | 'md' | 'lg', default: 'md') - Content padding
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { ContentCard } from '@/components/cards'

<ContentCard
  header={<h4>Card Title</h4>}
  footer={<Button>Action</Button>}
  variant="elevated"
>
  <p>Card content goes here</p>
</ContentCard>
```

### MetricGrid

Layout component for organizing multiple StatCards in a responsive grid.

**Props:**
- `children` (ReactNode) - Grid items (typically StatCards)
- `columns` (2 | 3 | 4, default: 3) - Number of columns
- `gap` ('sm' | 'md' | 'lg', default: 'md') - Gap between items
- `className` (string, optional) - Additional CSS classes

**Example:**
```tsx
import { MetricGrid, StatCard } from '@/components/cards'

<MetricGrid columns={3}>
  <StatCard value={100} label="Metric 1" />
  <StatCard value={200} label="Metric 2" />
  <StatCard value={300} label="Metric 3" />
</MetricGrid>
```

## Design Language

All components follow 248.AI brand guidelines:

**Colors:**
- Primary Text: `#1C1B20` (Midnight)
- Secondary Text: `#777D8D` (Sky)
- Body Text: `#40404C` (Shadow)
- Backgrounds: White, `#EEEEEE` (Glare), `#F5F5F5`
- Borders: Gray shades (`#E5E7EB`, `#D1D5DB`)

**Typography:**
- Large numbers: `3xl` (36px), bold
- Labels: `xs` (12px), uppercase, medium weight, letter-spacing
- Body text: `sm` (14px), regular

**Spacing:**
- Cards use consistent padding (16px - 32px)
- Border radius: 8px
- Shadows: Subtle (`0 1px 3px rgba(0,0,0,0.1)`)

## Usage Across Applications

These components can be imported directly into any app:

```tsx
import { StatCard, ContentCard, MetricGrid } from '@/components/cards'
```

Or copy the component files to your application:
- `StatCard.tsx`
- `ContentCard.tsx`
- `MetricGrid.tsx`

All components are self-contained with no external dependencies beyond:
- React
- Tailwind CSS
- Shadcn UI Card component

