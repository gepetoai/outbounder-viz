'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useExclusions, useUploadExclusionsCSV } from '@/hooks/useExclusions'
import { ApiError } from '@/lib/api-client'

const ITEMS_PER_PAGE = 10

export function ExclusionsTab() {
  const [currentPage, setCurrentPage] = useState(1)
  const { showToast } = useToast()
  
  // React Query hooks
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  const { data: response, isLoading } = useExclusions(offset, ITEMS_PER_PAGE)
  const uploadMutation = useUploadExclusionsCSV()

  const exclusions = response?.candidates || []
  const totalCount = response?.total_count || 0

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1
  const currentExclusions = exclusions
  const startIndex = offset
  const endIndex = Math.min(offset + exclusions.length, totalCount)

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showToast('Please upload a valid CSV file', 'error')
      event.target.value = ''
      return
    }

    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        const count = data.candidates?.length || data.total_count || 0
        showToast(`Successfully uploaded ${count} exclusion(s)`, 'success')
        event.target.value = ''
      },
      onError: (error: unknown) => {
        let errorMessage = 'Failed to upload CSV file'
        if (error && typeof error === 'object' && 'detail' in error) {
          const apiError = error as ApiError
          errorMessage = apiError.detail || apiError.message || errorMessage
        } else if (error instanceof Error) {
          errorMessage = error.message
        }
        showToast(errorMessage, 'error')
        event.target.value = ''
      },
    })
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage excluded candidates from your outreach campaigns
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            CSV must contain <span className="font-medium">first_name</span> and <span className="font-medium">last_name</span> columns
          </p>
        </div>
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            disabled={uploadMutation.isPending}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="csv-upload-input"
          />
          <Button asChild disabled={uploadMutation.isPending}>
            <label htmlFor="csv-upload-input" className="cursor-pointer">
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </>
              )}
            </label>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="pt-4">
        <CardContent className="p-0">
          <div className="w-full">
            <Table>
              <TableHeader className="[&_tr]:border-b">
                <TableRow className="border-b">
                  <TableHead className="w-[50%] h-auto px-2 pb-4">First Name</TableHead>
                  <TableHead className="w-[50%] h-auto px-2 pb-4">Last Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-12">
                      <div className="text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading exclusions...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : exclusions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-12">
                      <div className="text-muted-foreground">
                        <p className="text-lg font-medium mb-2">No exclusions added</p>
                        <p className="text-sm mb-4">Upload a CSV file to add excluded candidates</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentExclusions.map((exclusion) => (
                    <TableRow key={exclusion.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium py-4 px-4">
                        {exclusion.first_name}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        {exclusion.last_name}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > 0 && exclusions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {totalCount} exclusion(s)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageClick(page)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  )
                }
                return null
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

