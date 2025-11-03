'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Menu, X, User, MessageSquare } from 'lucide-react'
import { AuthWrapper } from '@/components/auth/auth-wrapper''

export default function OutbounderApp () {
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
              <h1 className="text-xl font-bold text-foreground">Outbounder</h1>
              <p className="text-muted-foreground mt-2">Outbound sales automation</p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle>Welcome to Outbounder</CardTitle>
                      <CardDescription>
                        Automate your outbound sales campaigns
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This application is under development. Lead management, sequencing, and messaging features will be available soon.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </AuthWrapper>
  )
}

