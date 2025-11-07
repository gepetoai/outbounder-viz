'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function SettingsTab () {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Settings Coming Soon</CardTitle>
        <CardDescription>
          Settings and configuration options will be available here
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Configure your outbound campaign settings, templates, and preferences.
        </p>
      </CardContent>
    </Card>
  )
}

