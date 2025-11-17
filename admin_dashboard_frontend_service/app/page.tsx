'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, BarChart3, Users, Briefcase } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to admin dashboard after 2 seconds
    const timer = setTimeout(() => {
      router.push('/admin/analytics')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <TrendingUp className="h-16 w-16 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            SDG 8 Impact Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Empowering youth employment through data-driven insights
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="bg-white/80 backdrop-blur p-4 rounded-lg">
            <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Analytics</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-4 rounded-lg">
            <Briefcase className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Jobs</p>
          </div>
          <div className="bg-white/80 backdrop-blur p-4 rounded-lg">
            <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Users</p>
          </div>
        </div>

        <div className="pt-4">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/admin/analytics')}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  )
}