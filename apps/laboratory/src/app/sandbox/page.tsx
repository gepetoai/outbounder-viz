'use client'

import { SandboxOffline } from '@/components/sandbox'

/**
 * Standalone Sandbox Page - No Authentication Required
 * 
 * Access at: http://localhost:3005/sandbox
 * 
 * This page runs the sandbox component completely independently:
 * - No login required
 * - Uses mock data (localStorage)
 * - Perfect for testing and demos
 */
export default function SandboxPage () {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sandbox - Prompt Engineering Lab</h1>
          <p className="text-gray-600 mt-1">Test AI agent conversations with different roles, candidates, and feedback</p>
        </div>
        
        <SandboxOffline />
      </div>
    </div>
  )
}

