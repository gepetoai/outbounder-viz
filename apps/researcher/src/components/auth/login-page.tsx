'use client'

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Users, Globe, Search, User, Zap, Shield, CheckCircle } from 'lucide-react'

export function LoginPage () {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">248</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The complete sales automation platform for modern teams
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need to scale your sales
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                From lead generation to candidate recruitment, 248 provides all the tools 
                you need to automate and optimize your sales processes.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Outbounder</h3>
                  <p className="text-sm text-gray-600">Sales outreach automation</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Inbounder</h3>
                  <p className="text-sm text-gray-600">Lead capture and qualification</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Search className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Researcher</h3>
                  <p className="text-sm text-gray-600">Lead research and enrichment</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Recruiter</h3>
                  <p className="text-sm text-gray-600">Talent acquisition tools</p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Fast & Reliable</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign in */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Welcome to 248
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Sign in to access all four platforms
            </p>
            
            <div className="space-y-4">
              <SignInButton mode="modal">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  Sign In
                </button>
              </SignInButton>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <SignUpButton mode="modal">
                <button className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors">
                  Create Account
                </button>
              </SignUpButton>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
