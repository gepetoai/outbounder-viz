'use client'

import { useState } from 'react'
import { AppHeader } from './AppHeader'
import { PageTitle } from './PageTitle'
import { Sidebar } from './Sidebar'
import { SidebarItem } from './SidebarItem'
import { SidebarGroup } from './SidebarGroup'
import { SidebarUser } from './SidebarUser'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export function LayoutPlaceholder () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState('home')

  return (
    <div className="space-y-8 pb-8">
      {/* AppHeader Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: '#1C1B20' }}>
          AppHeader Component
        </h3>
        <p className="text-sm" style={{ color: '#777D8D' }}>
          Main application header with logo and actions
        </p>
        
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <AppHeader
            title="Application Name"
            logo={
              <Image
                src="/icons/sparkles-dark.svg"
                alt="Logo"
                width={32}
                height={32}
              />
            }
            actions={
              <>
                <Button variant="outline" size="sm">
                  Help
                </Button>
                <Button size="sm" className="bg-[#1C1B20] hover:bg-[#40404C] text-white">
                  Upgrade
                </Button>
              </>
            }
          />
        </div>

        <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <AppHeader title="Simple Header" />
        </div>
      </section>

      {/* PageTitle Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: '#1C1B20' }}>
          PageTitle Component
        </h3>
        <p className="text-sm" style={{ color: '#777D8D' }}>
          Page-level titles with optional subtitles and actions
        </p>
        
        <div className="border rounded-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <PageTitle
            title="Dashboard"
            subtitle="Overview of your key metrics"
            actions={
              <>
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button size="sm" className="bg-[#1C1B20] hover:bg-[#40404C] text-white">
                  Create New
                </Button>
              </>
            }
          />
        </div>

        <div className="border rounded-lg p-6" style={{ borderColor: '#E5E7EB' }}>
          <PageTitle title="Simple Page Title" />
        </div>
      </section>

      {/* Sidebar Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: '#1C1B20' }}>
          Sidebar Components
        </h3>
        <p className="text-sm" style={{ color: '#777D8D' }}>
          Complete sidebar with items, groups, and user section
        </p>
        
        <div className="border rounded-lg overflow-hidden h-[600px] flex" style={{ borderColor: '#E5E7EB' }}>
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            header={
              <h1 className="text-xl font-bold" style={{ color: '#1C1B20' }}>
                App Name
              </h1>
            }
            footer={
              <SidebarUser
                name="John Doe"
                email="john@example.com"
                isCollapsed={!sidebarOpen}
              />
            }
          >
            <SidebarGroup title="Main" isCollapsed={!sidebarOpen}>
              <SidebarItem
                label="Home"
                icon="/icons/briefcase-light.svg"
                isActive={activeNav === 'home'}
                isCollapsed={!sidebarOpen}
                onClick={() => setActiveNav('home')}
              />
              <SidebarItem
                label="Dashboard"
                icon="/icons/bars-dark.svg"
                isActive={activeNav === 'dashboard'}
                isCollapsed={!sidebarOpen}
                onClick={() => setActiveNav('dashboard')}
                badge={3}
              />
              <SidebarItem
                label="Analytics"
                icon="/icons/sparkles-dark.svg"
                isActive={activeNav === 'analytics'}
                isCollapsed={!sidebarOpen}
                onClick={() => setActiveNav('analytics')}
              />
            </SidebarGroup>

            <SidebarGroup title="Tools" isCollapsed={!sidebarOpen}>
              <SidebarItem
                label="Search"
                icon="/icons/magnifying-glass-dark.svg"
                isActive={activeNav === 'search'}
                isCollapsed={!sidebarOpen}
                onClick={() => setActiveNav('search')}
              />
              <SidebarItem
                label="Messages"
                icon="/icons/address-book-dark.svg"
                isActive={activeNav === 'messages'}
                isCollapsed={!sidebarOpen}
                onClick={() => setActiveNav('messages')}
                badge={12}
              />
            </SidebarGroup>

            <SidebarGroup title="Settings" isCollapsed={!sidebarOpen}>
              <SidebarItem
                label="Preferences"
                icon="/icons/sliders-dark.svg"
                isActive={activeNav === 'preferences'}
                isCollapsed={!sidebarOpen}
                onClick={() => setActiveNav('preferences')}
              />
              <SidebarItem
                label="Account"
                icon="/icons/user-dark.svg"
                isActive={activeNav === 'account'}
                isCollapsed={!sidebarOpen}
                onClick={() => setActiveNav('account')}
              />
            </SidebarGroup>
          </Sidebar>

          {/* Mock content area */}
          <div className="flex-1 p-6 bg-gray-50">
            <div className="text-center py-12">
              <div className="inline-block px-6 py-3 rounded-lg bg-white border" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-sm font-medium" style={{ color: '#40404C' }}>
                  Selected: <span className="font-bold" style={{ color: '#1C1B20' }}>{activeNav}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Code */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: '#1C1B20' }}>
          Usage
        </h3>
        <div className="border rounded-lg p-6 bg-gray-50" style={{ borderColor: '#E5E7EB' }}>
          <pre className="text-xs font-mono overflow-x-auto" style={{ color: '#40404C' }}>
{`import {
  AppHeader,
  PageTitle,
  Sidebar,
  SidebarItem,
  SidebarGroup,
  SidebarUser
} from '@/components/layout'

// Use in your app layout
<AppHeader title="My App" logo={<Logo />} actions={<Actions />} />

<Sidebar
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  header={<h1>App Name</h1>}
  footer={<SidebarUser name="User" />}
>
  <SidebarGroup title="Navigation">
    <SidebarItem label="Home" icon="/icon.svg" />
    <SidebarItem label="Settings" icon="/icon.svg" />
  </SidebarGroup>
</Sidebar>

<PageTitle 
  title="Page Title" 
  subtitle="Description"
  actions={<Button>Action</Button>}
/>`}
          </pre>
        </div>
      </section>
    </div>
  )
}

