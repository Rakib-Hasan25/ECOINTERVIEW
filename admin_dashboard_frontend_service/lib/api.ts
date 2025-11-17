// API configuration and helper functions
const API_BASE_URL = '/api'

// Helper function for API calls
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API Error: ${response.status}`)
  }

  return response.json()
}

// Analytics API
export const analyticsAPI = {
  getAnalytics: () => fetchAPI('/admin/analytics'),
  getMetrics: () => fetchAPI('/admin/analytics/metrics'),
  getSkillsDemand: () => fetchAPI('/admin/analytics/skills-demand'),
  getUserGrowth: (days = 30) => fetchAPI(`/admin/analytics/user-growth?days=${days}`),
}

// Jobs API
export const jobsAPI = {
  getJobs: () => fetchAPI('/admin/jobs'),
  getJob: (id: string) => fetchAPI(`/admin/jobs/${id}`),
  createJob: (job: any) => fetchAPI('/admin/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  }),
  updateJob: (id: string, job: any) => fetchAPI(`/admin/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(job),
  }),
  deleteJob: (id: string) => fetchAPI(`/admin/jobs/${id}`, {
    method: 'DELETE',
  }),
  toggleJobStatus: (id: string) => fetchAPI(`/admin/jobs/${id}/toggle`, {
    method: 'PATCH',
  }),
}

// Resources API
export const resourcesAPI = {
  getResources: () => fetchAPI('/admin/resources'),
  getResource: (id: string) => fetchAPI(`/admin/resources/${id}`),
  createResource: (resource: any) => fetchAPI('/admin/resources', {
    method: 'POST',
    body: JSON.stringify(resource),
  }),
  updateResource: (id: string, resource: any) => fetchAPI(`/admin/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(resource),
  }),
  deleteResource: (id: string) => fetchAPI(`/admin/resources/${id}`, {
    method: 'DELETE',
  }),
}

// Users API
export const usersAPI = {
  getUsers: () => fetchAPI('/admin/users'),
  getUser: (id: string) => fetchAPI(`/admin/users/${id}`),
  getUserAnalytics: (id: string) => fetchAPI(`/admin/users/${id}/analytics`),
  updateUser: (id: string, userData: any) => fetchAPI(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
}

export default {
  analytics: analyticsAPI,
  jobs: jobsAPI,
  resources: resourcesAPI,
  users: usersAPI,
}