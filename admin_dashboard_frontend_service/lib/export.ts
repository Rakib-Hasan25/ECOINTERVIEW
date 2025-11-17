import type { AnalyticsData, Job, LearningResource } from '@/types/admin'

// Export data to CSV format
export function exportToCSV(data: any[], filename: string, headers: string[]) {
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = getNestedValue(row, header)
      // Escape commas and quotes in values
      return typeof value === 'string' && (value.includes(',') || value.includes('"'))
        ? `"${value.replace(/"/g, '""')}"`
        : value
    }).join(','))
  ].join('\n')

  downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

// Export data to JSON format
export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

// Helper function to download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj) ?? ''
}

// Specific export functions for different data types
export const exportAnalyticsData = {
  metrics: (data: AnalyticsData) => {
    const metricsData = [
      { metric: 'Total Users Analyzed', value: data.metrics.totalUsers },
      { metric: 'Jobs Suggested', value: data.metrics.jobsSuggested },
      { metric: 'Active Today', value: data.metrics.activeToday },
      { metric: 'Skill Gap Coverage', value: `${data.metrics.skillGapCoverage}%` }
    ]
    exportToCSV(metricsData, 'analytics-metrics', ['metric', 'value'])
  },

  skillsDemand: (data: AnalyticsData) => {
    exportToCSV(data.skillsDemand, 'skills-demand', ['skill', 'count'])
  },

  jobCategories: (data: AnalyticsData) => {
    exportToCSV(data.jobCategories, 'job-categories', ['category', 'percentage', 'count'])
  },

  userGrowth: (data: AnalyticsData) => {
    exportToCSV(data.userGrowth, 'user-growth', ['date', 'users'])
  },

  commonGaps: (data: AnalyticsData) => {
    exportToCSV(data.commonGaps, 'skill-gaps', ['skill', 'occurrences'])
  },

  full: (data: AnalyticsData) => {
    exportToJSON(data, 'full-analytics-data')
  }
}

export const exportJobsData = {
  csv: (jobs: Job[]) => {
    const jobsForExport = jobs.map(job => ({
      ...job,
      requiredSkills: job.requiredSkills.join('; '),
      status: job.isActive ? 'Active' : 'Inactive'
    }))
    exportToCSV(jobsForExport, 'jobs-data', [
      'title', 'company', 'category', 'experienceLevel', 
      'requiredSkills', 'applicants', 'location', 'salary', 
      'status', 'createdAt'
    ])
  },

  json: (jobs: Job[]) => {
    exportToJSON(jobs, 'jobs-data')
  }
}

export const exportResourcesData = {
  csv: (resources: LearningResource[]) => {
    const resourcesForExport = resources.map(resource => ({
      ...resource,
      price: resource.isFree ? 'Free' : 'Paid'
    }))
    exportToCSV(resourcesForExport, 'resources-data', [
      'title', 'type', 'skillCategory', 'difficulty', 
      'duration', 'provider', 'price', 'url'
    ])
  },

  json: (resources: LearningResource[]) => {
    exportToJSON(resources, 'resources-data')
  }
}

export const exportUsersData = {
  csv: (users: any[]) => {
    const usersForExport = users.map(user => ({
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role,
      joinedAt: user.joinedAt,
      lastActiveAt: user.lastActiveAt,
      profileCompleteness: user.profileCompleteness,
      jobsApplied: user.jobsApplied,
      skillsAssessed: user.skillsAssessed.join('; '),
      location: user.location || '',
      experienceLevel: user.experienceLevel,
      targetRole: user.targetRole || '',
      completedCourses: user.learningProgress.completedCourses,
      hoursSpent: user.learningProgress.hoursSpent,
      certificationsEarned: user.learningProgress.certificationsEarned
    }))
    exportToCSV(usersForExport, 'users-data', [
      'name', 'email', 'status', 'role', 'joinedAt', 'lastActiveAt',
      'profileCompleteness', 'jobsApplied', 'skillsAssessed', 'location',
      'experienceLevel', 'targetRole', 'completedCourses', 'hoursSpent', 'certificationsEarned'
    ])
  },

  json: (users: any[]) => {
    exportToJSON(users, 'users-data')
  },

  activeUsers: (users: any[]) => {
    const activeUsers = users.filter(user => user.status === 'active')
    exportToCSV(activeUsers.map(user => ({
      name: user.name,
      email: user.email,
      lastActiveAt: user.lastActiveAt,
      jobsApplied: user.jobsApplied,
      profileCompleteness: user.profileCompleteness,
      targetRole: user.targetRole || 'Not specified'
    })), 'active-users', ['name', 'email', 'lastActiveAt', 'jobsApplied', 'profileCompleteness', 'targetRole'])
  }
}