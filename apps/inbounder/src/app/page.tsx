'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, User, Rocket, Settings, Database, Box, Inbox } from 'lucide-react'
import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { LeadSourcesTab } from '@/components/inbounder/LeadSourcesTab'
import { SequencerTab } from '@/components/inbounder/SequencerTab'
import { SettingsTab } from '@/components/inbounder/SettingsTab'

export default function InbounderApp () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [inbounderTab, setInbounderTab] = useState('sequencer')

  // Inbounder tabs
  const inbounderTabs = [
    { id: 'lead-sources', label: 'Lead Sources', icon: Database },
    { id: 'sequencer', label: 'Sequencer', icon: Rocket },
    { id: 'sandbox', label: 'Sandbox', icon: Box },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderInbounderContent = () => {
    switch (inbounderTab) {
      case 'lead-sources':
        return <LeadSourcesTab />
      case 'sequencer':
        return <SequencerTab />
      case 'sandbox':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Box className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">Sandbox</h2>
              <p className="text-gray-600">In development</p>
            </div>
          </div>
        )
      case 'inbox':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">Inbox</h2>
              <p className="text-gray-600">In development</p>
            </div>
          </div>
        )
      case 'settings':
        return <SettingsTab />
      default:
        return null
    }
  }

  return (
    <AuthWrapper>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-12'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
          {/* Header */}
          <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-b border-border min-h-[72px] flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">Inbounder</h1>
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
            {inbounderTabs.map((tab) => {
              const Icon = tab.icon
              
              return (
                <Button
                  key={tab.id}
                  variant={inbounderTab === tab.id ? 'default' : 'ghost'}
                  size={sidebarOpen ? 'default' : 'icon'}
                  className={`w-full h-9 flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center px-2'}`}
                  onClick={() => setInbounderTab(tab.id)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
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
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6">
            <div className="mb-5">
              <h1 className="text-xl font-bold text-foreground">
                {inbounderTabs.find(tab => tab.id === inbounderTab)?.label}
              </h1>
            </div>
            
            {renderInbounderContent()}
          </main>
        </div>
      </div>
    </AuthWrapper>
  )
}

