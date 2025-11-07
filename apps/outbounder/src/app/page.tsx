'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, User, GitBranch, Settings } from 'lucide-react'
import { AuthWrapper } from '@/components/auth/auth-wrapper'
import SequencerTab from '@/components/outbounder/SequencerTab'
import SettingsTab from '@/components/outbounder/SettingsTab'

type Tab = 'sequencer' | 'settings'

export default function OutbounderApp () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('sequencer')

  return (
    <AuthWrapper>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-12'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
          {/* Header */}
          <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-b border-border min-h-[72px] flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">Outbounder</h1>
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

          {/* Navigation Tabs */}
          <nav className={`flex-1 ${sidebarOpen ? 'p-2 space-y-2' : 'p-2 space-y-2'}`}>
            <Button
              variant={activeTab === 'sequencer' ? 'default' : 'ghost'}
              size={sidebarOpen ? 'default' : 'icon'}
              className={`w-full h-9 flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center px-2'}`}
              onClick={() => setActiveTab('sequencer')}
            >
              <GitBranch className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && (
                <span className="ml-2 flex items-center">Sequencer</span>
              )}
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              size={sidebarOpen ? 'default' : 'icon'}
              className={`w-full h-9 flex items-center ${sidebarOpen ? 'justify-start px-3' : 'justify-center px-2'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && (
                <span className="ml-2 flex items-center">Settings</span>
              )}
            </Button>
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
                {activeTab === 'sequencer' ? 'Sequencer' : 'Settings'}
              </h1>
            </div>
            
            {activeTab === 'sequencer' && <SequencerTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </main>
        </div>
      </div>
    </AuthWrapper>
  )
}

