'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, ExternalLink, Crown, Loader2, MoreVertical } from 'lucide-react'
import { useLinkedInAccounts, useConnectLinkedInAccount } from '@/hooks/useLinkedInAccounts'

export function LinkedInAccountsTab() {
  const { data: accounts = [], isLoading } = useLinkedInAccounts()
  const connectAccountMutation = useConnectLinkedInAccount()

  const handleConnectAccount = () => {
    connectAccountMutation.mutate()
  }

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
        <Button 
          onClick={handleConnectAccount}
          disabled={connectAccountMutation.isPending}
        >
          {connectAccountMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </>
          )}
        </Button>
      </div>

      {/* Table */}
      <Card className="pt-4">
        <CardContent className="p-0">
          <div className="w-full">
            <Table>
              <TableHeader className="[&_tr]:border-b">
                <TableRow className="border-b">
                  <TableHead className="w-[60px] h-auto px-2 pb-4"></TableHead>
                  <TableHead className="w-[225px] h-auto px-2 pb-4">Name</TableHead>
                  <TableHead className="w-[225px] h-auto px-2 pb-4">Email</TableHead>
                  <TableHead className="w-[120px] h-auto px-2 pb-4">Premium</TableHead>
                  <TableHead className="hidden lg:table-cell w-[150px] h-auto px-2 pb-4">Created</TableHead>
                  <TableHead className="w-[80px] h-auto px-2 pb-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="text-muted-foreground">
                        <p className="text-lg font-medium mb-2">No LinkedIn accounts connected</p>
                        <p className="text-sm mb-4">Connect your LinkedIn account to start outreach</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleConnectAccount}
                          disabled={connectAccountMutation.isPending}
                        >
                          {connectAccountMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Connect Account
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/50">
                      <TableCell className="pl-4 py-4">
                        <div className="flex items-center">
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
                        </div>
                      </TableCell>
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center">
                          <span>{getFullName(account)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[225px] py-4">
                        <div className="flex items-center">
                          <div className="truncate" title={account.email}>
                            {account.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center">
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
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground py-4">
                        <div className="flex items-center">
                          {formatDate(account.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open actions menu</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-1" align="end">
                              <a
                                href={getLinkedInProfileUrl(account.public_identifier)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Profile
                              </a>
                            </PopoverContent>
                          </Popover>
                        </div>
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

