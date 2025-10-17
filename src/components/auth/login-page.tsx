import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Globe, Search, User, Zap, Shield, CheckCircle } from 'lucide-react'

export function LoginPage() {
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

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Why choose 248?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Automated lead generation and qualification</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">AI-powered candidate matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Multi-channel outreach campaigns</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Advanced analytics and reporting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Welcome to 248</CardTitle>
                <CardDescription className="text-base">
                  Sign in to access your sales automation dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <SignInButton mode="modal">
                    <Button className="w-full h-12 text-base font-medium">
                      Sign In
                    </Button>
                  </SignInButton>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  
                  <SignUpButton mode="modal">
                    <Button variant="outline" className="w-full h-12 text-base font-medium">
                      Create Account
                    </Button>
                  </SignUpButton>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Secure authentication powered by{' '}
                    <span className="font-medium text-blue-600">Clerk</span>
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Enterprise Security</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
