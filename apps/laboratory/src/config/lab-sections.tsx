'use client'

import { ComponentsShowcase } from '@/components/components-showcase'
import { CardsDemo, LayoutDemo } from '@/components/demos'
import { TableView } from '@/components/table'
import { SearchView } from '@/components/search'
import { SequencerContainer } from '@/components/sequencer/SequencerContainer'
import { SandboxOffline, SandboxTableDemo } from '@/components/sandbox'
import { SettingsPlaceholder } from '@/components/settings'
import { InboxView } from '@/components/inbox'
import { AnalyticsDashboard } from '@/components/analytics'
import { FeaturePlaceholder } from '@/components/common'

export type SectionStatus = 'ready' | 'in-progress' | 'planned'

export interface LabSection {
  id: string
  label: string
  iconPath: string
  component: React.ComponentType
  status: SectionStatus
  description?: string
}

export const labSections: LabSection[] = [
  {
    id: 'layout',
    label: 'Layout',
    iconPath: '/icons/layer-group-dark.svg',
    component: LayoutDemo,
    status: 'ready'
  },
  {
    id: 'components',
    label: 'Components',
    iconPath: '/icons/code-dark.svg',
    component: ComponentsShowcase,
    status: 'ready'
  },
  {
    id: 'search',
    label: 'Search',
    iconPath: '/icons/magnifying-glass-dark.svg',
    component: SearchView,
    status: 'in-progress'
  },
  {
    id: 'cards',
    label: 'Cards',
    iconPath: '/icons/grid-dark.svg',
    component: CardsDemo,
    status: 'ready'
  },
  {
    id: 'table',
    label: 'Table',
    iconPath: '/icons/bars-dark.svg',
    component: TableView,
    status: 'ready'
  },
  {
    id: 'sequencer',
    label: 'Sequencer',
    iconPath: '/icons/sparkles-dark.svg',
    component: SequencerContainer,
    status: 'ready'
  },
  {
    id: 'sandbox',
    label: 'Sandbox',
    iconPath: '/icons/bolt-dark.svg',
    component: SandboxOffline,
    status: 'in-progress'
  },
  {
    id: 'messages-table',
    label: 'Initial Messages',
    iconPath: '/icons/paper-plane-light.svg',
    component: SandboxTableDemo,
    status: 'ready'
  },
  {
    id: 'inbox',
    label: 'Inbox',
    iconPath: '/icons/address-book-dark.svg',
    component: InboxView,
    status: 'ready'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    iconPath: '/icons/signal-bars-light.svg',
    component: AnalyticsDashboard,
    status: 'ready'
  },
  {
    id: 'settings',
    label: 'Settings',
    iconPath: '/icons/gear-dark.svg',
    component: SettingsPlaceholder,
    status: 'ready'
  }
]

export const statusConfig = {
  ready: {
    color: '#1C1B20',
    label: 'Ready',
    icon: '✓'
  },
  'in-progress': {
    color: '#777D8D',
    label: 'In Progress',
    icon: '⚙'
  },
  planned: {
    color: '#B9B8C0',
    label: 'Planned',
    icon: '○'
  }
} as const

