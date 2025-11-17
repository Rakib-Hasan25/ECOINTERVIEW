'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/admin/metric-card'
import { SkillsChart } from '@/components/admin/charts/skills-chart'
import { GrowthChart } from '@/components/admin/charts/growth-chart'
import { CategoryChart } from '@/components/admin/charts/category-chart'
import { GapsChart } from '@/components/admin/charts/gaps-chart'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, TrendingUp, Target, Download, BarChart } from 'lucide-react'
import { exportAnalyticsData } from '@/lib/export'
import type { AnalyticsData } from '@/types/admin'

// Mock data for development
const mockData: AnalyticsData = {
  metrics: {
    totalUsers: 2847,
    jobsSuggested: 8392,
    activeToday: 342,
    skillGapCoverage: 78
  },
  skillsDemand: [
    { skill: 'JavaScript', count: 450 },
    { skill: 'Python', count: 380 },
    { skill: 'React', count: 320 },
    { skill: 'TypeScript', count: 290 },
    { skill: 'Node.js', count: 270 },
    { skill: 'AWS', count: 250 },
    { skill: 'Docker', count: 220 },
    { skill: 'SQL', count: 210 },
    { skill: 'Git', count: 200 },
    { skill: 'MongoDB', count: 180 }
  ],
  jobCategories: [
    { category: 'Frontend', percentage: 28, count: 2349 },
    { category: 'Backend', percentage: 24, count: 2014 },
    { category: 'Full Stack', percentage: 18, count: 1511 },
    { category: 'Data Science', percentage: 15, count: 1259 },
    { category: 'DevOps', percentage: 10, count: 839 },
    { category: 'Mobile', percentage: 5, count: 420 }
  ],
  userGrowth: [
    { date: 'Oct 15', users: 2100 },
    { date: 'Oct 18', users: 2250 },
    { date: 'Oct 21', users: 2380 },
    { date: 'Oct 24', users: 2450 },
    { date: 'Oct 27', users: 2580 },
    { date: 'Oct 30', users: 2650 },
    { date: 'Nov 2', users: 2720 },
    { date: 'Nov 5', users: 2780 },
    { date: 'Nov 8', users: 2820 },
    { date: 'Nov 11', users: 2847 }
  ],
  commonGaps: [
    { skill: 'Redux', occurrences: 320 },
    { skill: 'GraphQL', occurrences: 280 },
    { skill: 'Kubernetes', occurrences: 260 },
    { skill: 'Testing', occurrences: 240 },
    { skill: 'CI/CD', occurrences: 220 },
    { skill: 'TypeScript', occurrences: 200 },
    { skill: 'System Design', occurrences: 180 },
    { skill: 'AWS', occurrences: 160 },
    { skill: 'Docker', occurrences: 150 },
    { skill: 'Microservices', occurrences: 140 },
    { skill: 'Redis', occurrences: 130 },
    { skill: 'Elasticsearch', occurrences: 120 },
    { skill: 'RabbitMQ', occurrences: 110 },
    { skill: 'MongoDB', occurrences: 100 },
    { skill: 'PostgreSQL', occurrences: 95 },
    { skill: 'Next.js', occurrences: 90 },
    { skill: 'Vue.js', occurrences: 85 },
    { skill: 'Angular', occurrences: 80 },
    { skill: 'TensorFlow', occurrences: 75 },
    { skill: 'PyTorch', occurrences: 70 },
    { skill: 'Machine Learning', occurrences: 65 },
    { skill: 'Data Structures', occurrences: 60 },
    { skill: 'Algorithms', occurrences: 55 },
    { skill: 'REST API', occurrences: 50 },
    { skill: 'OAuth', occurrences: 45 },
    { skill: 'JWT', occurrences: 40 },
    { skill: 'WebSocket', occurrences: 35 },
    { skill: 'Serverless', occurrences: 25 },
    { skill: 'Terraform', occurrences: 20 }
  ]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        const analyticsData = await response.json()
        setData(analyticsData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        // Fallback to mock data if API fails
        setData(mockData)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-sm text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
          <p className="text-gray-700 dark:text-gray-300 mt-2 text-base">Monitor platform impact and user engagement</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => exportAnalyticsData.full(data)}
            className="gap-2 text-sm"
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export All Data</span>
            <span className="sm:hidden">All Data</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportAnalyticsData.metrics(data)}
            className="gap-2 text-sm"
            size="sm"
          >
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Export Metrics</span>
            <span className="sm:hidden">Metrics</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users Analyzed"
          value={data.metrics.totalUsers.toLocaleString()}
          description="All-time registered users"
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Jobs Suggested"
          value={data.metrics.jobsSuggested.toLocaleString()}
          description="Total job recommendations"
          icon={Briefcase}
          trend={{ value: 8.3, isPositive: true }}
        />
        <MetricCard
          title="Active Today"
          value={data.metrics.activeToday}
          description="Users active in last 24h"
          icon={TrendingUp}
          trend={{ value: 5.2, isPositive: false }}
        />
        <MetricCard
          title="Skill Gap Coverage"
          value={`${data.metrics.skillGapCoverage}%`}
          description="Resources available for gaps"
          icon={Target}
          trend={{ value: 3.1, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkillsChart data={data.skillsDemand} />
        <CategoryChart data={data.jobCategories} />
        <GrowthChart data={data.userGrowth} />
        <div className="lg:col-span-2">
          <GapsChart data={data.commonGaps} />
        </div>
      </div>
    </div>
  )
}