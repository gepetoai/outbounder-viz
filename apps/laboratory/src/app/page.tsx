'use client'

import { useState } from 'react'
import { AppLayout, AppMain, AppSidebar, SidebarNavItem, AppTitle } from '@248/ui'
import { Sequencer } from '@/components/sequencer/Sequencer'
import { SequencerD3 } from '@/components/sequencer/SequencerD3'
import { SandboxOffline } from '@/components/sandbox'
import { InboxPlaceholder } from '@/components/inbox'
import { SidePanelPlaceholder } from '@/components/side-panel'
import { TableView } from '@/components/table'
import { SearchView } from '@/components/search'
import { SettingsPlaceholder } from '@/components/settings'
import { CardsPlaceholder } from '@/components/cards'
import { LayoutPlaceholder } from '@/components/layout'
import { ComponentsShowcase } from '@/components/components-showcase'

type Tab = 'components' | 'inbox' | 'search' | 'side-panel' | 'table' | 'cards' | 'layout' | 'sequencer' | 'sequencer-d3' | 'sandbox' | 'settings'

export default function LaboratoryPage () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('sequencer-d3')

  const handleSidebarToggle = (isOpen: boolean) => {
    setSidebarOpen(isOpen)
  }

  const tabs = [
    { id: 'components' as const, label: 'Components', iconPath: '/icons/code-dark.svg' },
    { id: 'sequencer-d3' as const, label: 'Sequencer D3', iconPath: '/icons/sparkles-dark.svg' },
    { id: 'sequencer' as const, label: 'Sequencer', iconPath: '/icons/sparkles-dark.svg' },
    { id: 'inbox' as const, label: 'Inbox', iconPath: '/icons/address-book-dark.svg' },
    { id: 'search' as const, label: 'Search', iconPath: '/icons/magnifying-glass-dark.svg' },
    { id: 'side-panel' as const, label: 'Side Panel', iconPath: '/icons/sliders-dark.svg' },
    { id: 'table' as const, label: 'Table', iconPath: '/icons/bars-dark.svg' },
    { id: 'cards' as const, label: 'Cards', iconPath: '/icons/grid-dark.svg' },
    { id: 'layout' as const, label: 'Layout', iconPath: '/icons/layer-group-dark.svg' },
    { id: 'sandbox' as const, label: 'Sandbox', iconPath: '/icons/bolt-dark.svg' },
    { id: 'settings' as const, label: 'Settings', iconPath: '/icons/gear-dark.svg' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'components':
        return <ComponentsShowcase />
      case 'inbox':
        return <InboxPlaceholder />
      case 'search':
        return <SearchView />
      case 'side-panel':
        return <SidePanelPlaceholder />
      case 'table':
        return <TableView />
      case 'cards':
        return <CardsPlaceholder />
      case 'layout':
        return <LayoutPlaceholder />
      case 'sequencer':
        return <Sequencer />
      case 'sequencer-d3':
        return <SequencerD3 />
      case 'sandbox':
        return <SandboxOffline />
      case 'settings':
        return <SettingsPlaceholder />
      default:
        return null
    }
  }

  return (
    <AppLayout>
      <AppSidebar
        appName="Laboratory"
        defaultOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
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
        <AppTitle title={tabs.find(tab => tab.id === activeTab)?.label || ''} />
        {renderContent()}
      </AppMain>
    </AppLayout>
  )
}

