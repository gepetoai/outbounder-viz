'use client'

import { useState } from 'react'
import { AppLayout, AppMain, AppSidebar, SidebarNavItem, AppTitle } from '@248/ui'
import { labSections } from '@/config/lab-sections'

export default function LaboratoryPage () {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState(labSections[0].id) // Default to Layout

  const handleSidebarToggle = (isOpen: boolean) => {
    setSidebarOpen(isOpen)
  }

  // Find active section and render its component
  const activeSection = labSections.find(section => section.id === activeTab)
  const ActiveComponent = activeSection?.component

  return (
    <AppLayout>
      <AppSidebar
        appName="Laboratory"
        defaultOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
      >
        {labSections.map((section) => (
          <SidebarNavItem
            key={section.id}
            id={section.id}
            label={section.label}
            iconPath={section.iconPath}
            isActive={activeTab === section.id}
            isCollapsed={!sidebarOpen}
            onClick={() => setActiveTab(section.id)}
          />
        ))}
      </AppSidebar>

      <AppMain>
        <AppTitle title={activeSection?.label || ''} />
        {ActiveComponent && <ActiveComponent />}
      </AppMain>
    </AppLayout>
  )
}

