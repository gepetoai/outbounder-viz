'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Sequencer } from '@/components/sequencer/Sequencer'
import { SequencerD3 } from '@/components/sequencer/SequencerD3'
import { SandboxOffline } from '@/components/sandbox'
import { InboxPlaceholder } from '@/components/inbox'
import { SidePanelPlaceholder } from '@/components/side-panel'
import { TablePlaceholder } from '@/components/table'
import { SearchPlaceholder } from '@/components/search'
import { SettingsPlaceholder } from '@/components/settings'
import Image from 'next/image'

type Tab = 'inbox' | 'search' | 'side-panel' | 'table' | 'sequencer' | 'sequencer-d3' | 'sandbox' | 'settings'

export default function LaboratoryPage () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('sequencer-d3')

  const tabs = [
    { id: 'sequencer-d3' as const, label: 'Sequencer D3', iconPath: '/icons/sparkles-dark.svg' },
    { id: 'inbox' as const, label: 'Inbox', iconPath: '/icons/address-book-dark.svg' },
    { id: 'search' as const, label: 'Search', iconPath: '/icons/magnifying-glass-dark.svg' },
    { id: 'side-panel' as const, label: 'Side Panel', iconPath: '/icons/sliders-dark.svg' },
    { id: 'table' as const, label: 'Table', iconPath: '/icons/bars-dark.svg' },
    { id: 'sequencer' as const, label: 'Sequencer', iconPath: '/icons/sparkles-dark.svg' },
    { id: 'sandbox' as const, label: 'Sandbox', iconPath: '/icons/bolt-dark.svg' },
    { id: 'settings' as const, label: 'Settings', iconPath: '/icons/gear-dark.svg' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'inbox':
        return <InboxPlaceholder />
      case 'search':
        return <SearchPlaceholder />
      case 'side-panel':
        return <SidePanelPlaceholder />
      case 'table':
        return <TablePlaceholder />
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-12'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
        {/* Header */}
        <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-b border-border min-h-[72px] flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-foreground">Laboratory</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={sidebarOpen ? 'ml-auto' : ''}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarOpen ? 'p-2 space-y-2' : 'p-2 space-y-2'}`}>
          {tabs.map((tab) => {
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size={sidebarOpen ? 'default' : 'icon'}
                className={`w-full h-9 flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center px-2'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Image
                  src={tab.iconPath}
                  alt={tab.label}
                  width={16}
                  height={16}
                  className="flex-shrink-0"
                />
                {sidebarOpen && (
                  <span className="ml-2 flex items-center">{tab.label}</span>
                )}
              </Button>
            )
          })}
        </nav>

        {/* User Button */}
        <div className="mt-auto p-2 border-t border-border">
          <div className="flex items-center gap-2 p-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEEEEE' }}>
              <Image
                src="/icons/user-dark.svg"
                alt="User"
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-5">
            <h1 className="text-xl font-bold text-foreground">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h1>
          </div>
          
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

