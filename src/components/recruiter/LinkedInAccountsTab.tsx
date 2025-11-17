'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, ExternalLink, Crown } from 'lucide-react'
import { useLinkedInAccounts } from '@/hooks/useLinkedInAccounts'

export function LinkedInAccountsTab() {
  const { data: accounts = [], isLoading } = useLinkedInAccounts()

  const getFullName = (account: { first_name: string; last_name: string }) => {
    return `${account.first_name} ${account.last_name}`.trim()
  }

  const getLinkedInProfileUrl = (publicIdentifier: string) => {
    return `https://www.linkedin.com/in/${publicIdentifier}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'N/A'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Loading LinkedIn accounts...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Account Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">LinkedIn Accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your connected LinkedIn accounts for outreach
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[250px]">Email</TableHead>
                  <TableHead className="w-[120px]">Premium</TableHead>
                  <TableHead className="hidden lg:table-cell w-[150px]">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="text-muted-foreground">
                        <p className="text-lg font-medium mb-2">No LinkedIn accounts connected</p>
                        <p className="text-sm mb-4">Connect your LinkedIn account to start outreach</p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Connect Account
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/50">
                      <TableCell className="pl-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                          {account.profile_picture_url ? (
                            <img
                              src={account.profile_picture_url}
                              alt={getFullName(account)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to a placeholder if image fails to load
                                const target = e.target as HTMLImageElement
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMEMxNi4xMzQgMTAgMTMgMTMuMTM0IDEzIDE3QzEzIDIwLjg2NiAxNi4xMzQgMjQgMjAgMjRDMjMuODY2IDI0IDI3IDIwLjg2NiAyNyAxN0MyNyAxMy4xMzQgMjMuODY2IDEwIDIwIDEwWk0yMCAyNkMxNi42NzcgMjYgMTAgMjguMjIzIDEwIDMxLjVWMzVIMzBWMzEuNUMzMCAyOC4yMjMgMjMuMzIzIDI2IDIwIDI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs font-medium">
                                {getFullName(account)}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{getFullName(account)}</span>
                          <a
                            href={getLinkedInProfileUrl(account.public_identifier)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Profile
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="truncate" title={account.email}>
                          {account.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {account.is_premium ? (
                          <Badge variant="default" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                            Free
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(account.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

