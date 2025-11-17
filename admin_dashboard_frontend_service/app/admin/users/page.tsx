'use client'

import { useState, useEffect } from 'react'
import { UsersTable } from '@/components/admin/tables/users-table'
import { UserProfileDialog } from '@/components/admin/dialogs/user-profile-dialog'
import { Button } from '@/components/ui/button'
import { Download, FileText, UserPlus, Users as UsersIcon, UserCheck, UserX, Clock } from 'lucide-react'
import type { User } from '@/types/admin'

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    status: 'active',
    role: 'user',
    joinedAt: '2024-09-15',
    lastActiveAt: '2024-11-13T10:30:00Z',
    skillsAssessed: ['JavaScript', 'React', 'CSS', 'HTML'],
    jobsApplied: 12,
    profileCompleteness: 85,
    location: 'New York, NY',
    experienceLevel: 'mid',
    currentJob: 'Frontend Developer at StartupXYZ',
    targetRole: 'Senior Frontend Developer',
    skillGaps: ['TypeScript', 'Node.js'],
    learningProgress: {
      completedCourses: 8,
      hoursSpent: 45,
      certificationsEarned: 2
    }
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    status: 'active',
    role: 'user',
    joinedAt: '2024-10-01',
    lastActiveAt: '2024-11-14T08:15:00Z',
    skillsAssessed: ['Python', 'Django', 'SQL', 'AWS'],
    jobsApplied: 8,
    profileCompleteness: 72,
    location: 'San Francisco, CA',
    experienceLevel: 'senior',
    currentJob: 'Backend Engineer at TechCorp',
    targetRole: 'Lead Backend Engineer',
    skillGaps: ['Kubernetes', 'Microservices'],
    learningProgress: {
      completedCourses: 5,
      hoursSpent: 32,
      certificationsEarned: 1
    }
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    status: 'inactive',
    role: 'user',
    joinedAt: '2024-08-20',
    lastActiveAt: '2024-10-28T14:22:00Z',
    skillsAssessed: ['Java', 'Spring Boot', 'MySQL'],
    jobsApplied: 3,
    profileCompleteness: 45,
    location: 'Austin, TX',
    experienceLevel: 'entry',
    targetRole: 'Junior Java Developer',
    skillGaps: ['React', 'Git', 'Testing'],
    learningProgress: {
      completedCourses: 2,
      hoursSpent: 18,
      certificationsEarned: 0
    }
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    status: 'active',
    role: 'moderator',
    joinedAt: '2024-07-10',
    lastActiveAt: '2024-11-14T11:45:00Z',
    skillsAssessed: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker'],
    jobsApplied: 0,
    profileCompleteness: 95,
    location: 'Seattle, WA',
    experienceLevel: 'senior',
    currentJob: 'Full Stack Developer at CloudTech',
    targetRole: 'Technical Lead',
    skillGaps: ['System Design'],
    learningProgress: {
      completedCourses: 15,
      hoursSpent: 89,
      certificationsEarned: 5
    }
  },
  {
    id: '5',
    name: 'Jessica Brown',
    email: 'jessica.brown@email.com',
    status: 'blocked',
    role: 'user',
    joinedAt: '2024-06-05',
    lastActiveAt: '2024-09-15T16:30:00Z',
    skillsAssessed: ['HTML', 'CSS'],
    jobsApplied: 1,
    profileCompleteness: 25,
    location: 'Los Angeles, CA',
    experienceLevel: 'entry',
    skillGaps: ['JavaScript', 'React', 'Git'],
    learningProgress: {
      completedCourses: 1,
      hoursSpent: 8,
      certificationsEarned: 0
    }
  },
  {
    id: '6',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    status: 'active',
    role: 'user',
    joinedAt: '2024-11-01',
    lastActiveAt: '2024-11-14T09:20:00Z',
    skillsAssessed: ['Python', 'TensorFlow', 'SQL', 'Pandas'],
    jobsApplied: 15,
    profileCompleteness: 78,
    location: 'Boston, MA',
    experienceLevel: 'mid',
    currentJob: 'Data Analyst at FinTech Inc',
    targetRole: 'Data Scientist',
    skillGaps: ['Machine Learning', 'Deep Learning'],
    learningProgress: {
      completedCourses: 6,
      hoursSpent: 42,
      certificationsEarned: 2
    }
  }
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const userData = await response.json()
        setUsers(userData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching users:', error)
        // Fallback to mock data if API fails
        setUsers(mockUsers)
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsProfileDialogOpen(true)
  }


  const handleBlockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'block' })
      })
      
      if (!response.ok) {
        throw new Error('Failed to block user')
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'blocked' as const } : user
      ))
    } catch (error) {
      console.error('Error blocking user:', error)
      alert('Failed to block user. Please try again.')
    }
  }

  const handleUnblockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unblock this user?')) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'unblock' })
      })
      
      if (!response.ok) {
        throw new Error('Failed to unblock user')
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'active' as const } : user
      ))
    } catch (error) {
      console.error('Error unblocking user:', error)
      alert('Failed to unblock user. Please try again.')
    }
  }


  const exportUsersCSV = () => {
    const csvData = users.map(user => ({
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
      completedCourses: user.learningProgress.completedCourses
    }))
    
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => (row as any)[header]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'users-data.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const exportUsersJSON = () => {
    const jsonContent = JSON.stringify(users, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'users-data.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  const activeUsers = users.filter(u => u.status === 'active').length
  const inactiveUsers = users.filter(u => u.status === 'inactive').length
  const blockedUsers = users.filter(u => u.status === 'blocked').length
  const avgProfileCompleteness = Math.round(
    users.reduce((sum, user) => sum + user.profileCompleteness, 0) / users.length
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage platform users and monitor their activity</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={exportUsersCSV}
            className="gap-2 text-sm"
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={exportUsersJSON}
            className="gap-2 text-sm"
            size="sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Export JSON</span>
            <span className="sm:hidden">JSON</span>
          </Button>
        </div>
      </div>

      {/* Simple Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>

        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-2xl font-bold text-yellow-600">{inactiveUsers}</p>
          <p className="text-sm text-gray-600">Inactive</p>
        </div>

        <div className="bg-white rounded-lg p-4 border text-center">
          <p className="text-2xl font-bold text-red-600">{blockedUsers}</p>
          <p className="text-sm text-gray-600">Blocked</p>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        onView={handleViewUser}
        onBlock={handleBlockUser}
        onUnblock={handleUnblockUser}
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        user={selectedUser}
      />
    </div>
  )
}