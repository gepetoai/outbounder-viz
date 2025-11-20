'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Plus, ExternalLink, Crown, Loader2, MoreVertical, LogOut } from 'lucide-react'
import { useLinkedInAccounts, useDisconnectLinkedInAccount } from '@/hooks/useLinkedInAccounts'
import type { LinkedInAccount } from '@/hooks/useLinkedInAccounts'
import { useToast } from '@/components/ui/toast'

export function LinkedInAccountsTab() {
  const CHROME_WEBSTORE_URL = 'https://chromewebstore.google.com/detail/248-recruiter-connector/dpoiockpdkpgocjdnooilcpfnhclbifl?authuser=0&hl=en-GB'
  const { data: accounts = [], isLoading } = useLinkedInAccounts()
  const disconnectAccountMutation = useDisconnectLinkedInAccount()
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false)
  const [accountToDisconnect, setAccountToDisconnect] = useState<LinkedInAccount | null>(null)
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null)
  const { showToast } = useToast()

  const handleOpenDisconnectDialog = (account: LinkedInAccount) => {
    setOpenPopoverId(null) // Close the popover
    setAccountToDisconnect(account)
    setDisconnectDialogOpen(true)
  }

  const handleConfirmDisconnect = () => {
    if (accountToDisconnect) {
      disconnectAccountMutation.mutate(accountToDisconnect.id, {
        onSuccess: () => {
          setDisconnectDialogOpen(false)
          setAccountToDisconnect(null)
        },
        onError: (error) => {
          // Keep dialog open and show error
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          showToast(`Failed to disconnect account: ${errorMessage}`, 'error')
          console.error('Failed to disconnect account:', error)
        },
      })
    }
  }

  const handleCancelDisconnect = () => {
    setDisconnectDialogOpen(false)
    setAccountToDisconnect(null)
  }

  const getFullName = (account: { first_name: string; last_name: string }) => {
    return `${account.first_name} ${account.last_name}`.trim()
  }

  const getInitials = (account: { first_name: string; last_name: string }) => {
    const first = account.first_name?.charAt(0)?.toUpperCase() || ''
    const last = account.last_name?.charAt(0)?.toUpperCase() || ''
    return `${first}${last}`
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
          onClick={() => {
            window.open(CHROME_WEBSTORE_URL, '_blank', 'noopener,noreferrer')
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Account
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
                          onClick={() => {
                            window.open(CHROME_WEBSTORE_URL, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          Connect Account
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
                                <span className="text-gray-500 text-sm font-semibold">
                                  {getInitials(account)}
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
                          <Popover open={openPopoverId === account.id} onOpenChange={(open) => setOpenPopoverId(open ? account.id : null)}>
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
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenPopoverId(null)
                                }}
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Profile
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenDisconnectDialog(account)
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors cursor-pointer w-full text-left text-red-600 hover:text-red-700"
                              >
                                <LogOut className="h-4 w-4" />
                                Disconnect Account
                              </button>
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

      {/* Disconnect Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
        title="Disconnect LinkedIn Account"
        description={`Are you sure you want to disconnect ${accountToDisconnect ? getFullName(accountToDisconnect) : 'this account'}? This will remove the account from your connected accounts and you'll need to reconnect it to use it again.`}
        onConfirm={handleConfirmDisconnect}
        onCancel={handleCancelDisconnect}
        isLoading={disconnectAccountMutation.isPending}
        confirmText="Disconnect"
      />
    </div>
  )
}

