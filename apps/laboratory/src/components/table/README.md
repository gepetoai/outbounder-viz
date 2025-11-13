# Reusable Data Table Component

A generic, type-safe table component built with **ZERO external dependencies** beyond what's already in the laboratory.

## Components

### `DataTable<T>`
Generic table component that works with any data type.

### `CandidateTable`
Example implementation showing how to use DataTable with candidate data.

## Usage

### Basic Table

```tsx
import { DataTable, TableColumn } from '@/components/table'

interface User {
  id: string
  name: string
  email: string
}

const columns: TableColumn<User>[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' }
]

<DataTable
  data={users}
  columns={columns}
  getRowId={(user) => user.id}
/>
```

### Table with Custom Rendering

```tsx
const columns: TableColumn<User>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (user) => (
      <span className="font-medium">{user.name}</span>
    )
  },
  {
    key: 'email',
    label: 'Email',
    render: (user) => (
      <span style={{ color: '#777D8D' }}>{user.email}</span>
    )
  }
]
```

### Table with Selection & Bulk Actions

```tsx
import { DataTable, TableAction } from '@/components/table'

const bulkActions: TableAction[] = [
  {
    id: 'delete',
    label: 'Delete',
    icon: '/icons/xmark-light.svg',
    onClick: async (selectedIds) => {
      await deleteUsers(selectedIds)
    }
  },
  {
    id: 'approve',
    label: 'Approve',
    icon: '/icons/thumbs-up-light.svg',
    onClick: async (selectedIds) => {
      await approveUsers(selectedIds)
    },
    variant: 'primary'
  }
]

<DataTable
  data={users}
  columns={columns}
  getRowId={(user) => user.id}
  selectable={true}
  bulkActions={bulkActions}
  onDownload={() => downloadCSV(users)}
/>
```

### Table with Row Click

```tsx
<DataTable
  data={users}
  columns={columns}
  getRowId={(user) => user.id}
  onRowClick={(user) => {
    console.log('Clicked:', user)
    setSelectedUser(user)
  }}
/>
```

## Props

### `DataTable<T>`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | Yes | Array of data items |
| `columns` | `TableColumn<T>[]` | Yes | Column definitions |
| `getRowId` | `(item: T) => string` | Yes | Function to get unique ID |
| `onRowClick` | `(item: T) => void` | No | Row click handler |
| `selectable` | `boolean` | No | Enable row selection |
| `bulkActions` | `TableAction[]` | No | Bulk action buttons |
| `onDownload` | `() => void` | No | Download handler |
| `emptyMessage` | `string` | No | Custom empty message |

### `TableColumn<T>`

```typescript
interface TableColumn<T> {
  key: string                       // Column identifier
  label: string                     // Header label
  width?: string                    // Column width (e.g., '100px')
  render?: (item: T) => ReactNode   // Custom renderer
  className?: string                // Additional CSS classes
}
```

### `TableAction`

```typescript
interface TableAction {
  id: string                        // Action identifier
  label: string                     // Button label
  icon?: string                     // Icon path (248.AI custom icons)
  onClick: (ids: string[]) => void  // Handler function
  variant?: 'default' | 'primary'   // Button style
  disabled?: boolean                // Disabled state
}
```

## Available Icons

All icons in `public/icons/`:
- `thumbs-up-light.svg` - Approval
- `thumbs-down-light.svg` - Rejection
- `arrow-down-to-line-light.svg` - Download
- `check-light.svg` - Success
- `xmark-light.svg` - Close/Delete
- `circle-light.svg` - Status indicator
- `book-light.svg` - Education

## Example: Candidate Table

See `CandidateTable.tsx` for a complete example with:
- Photo rendering
- Status badges
- Location and education with icons
- Approve/reject bulk actions
- CSV download

## Demo

Visit `/table-demo` to see the interactive demo.

## Design Principles

✅ **Zero External Dependencies**
- Uses only what's already in the laboratory
- No package installations needed

✅ **Type-Safe**
- Full TypeScript generic support
- Works with any data structure

✅ **248.AI Brand Compliant**
- Grayscale color palette
- Custom 248.AI icons only
- Clean, modern design

✅ **Reusable**
- Generic component works for any use case
- Easy to customize with render functions

