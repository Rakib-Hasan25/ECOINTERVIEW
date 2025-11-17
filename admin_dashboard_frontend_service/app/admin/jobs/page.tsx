'use client'

import { useState, useEffect } from 'react'
import { JobsTable } from '@/components/admin/tables/jobs-table'
import { JobDialog } from '@/components/admin/dialogs/job-dialog'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { exportJobsData } from '@/lib/export'
import type { Job } from '@/types/admin'

// Mock data for development
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Corp',
    category: 'Frontend',
    requiredSkills: ['React', 'TypeScript', 'CSS', 'HTML'],
    experienceLevel: 'mid',
    isActive: true,
    createdAt: '2024-11-01',
    applicants: 45,
    location: 'Remote',
    salary: '৳60k-80k'
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'StartupXYZ',
    category: 'Backend',
    requiredSkills: ['Node.js', 'MongoDB', 'Express', 'AWS'],
    experienceLevel: 'senior',
    isActive: true,
    createdAt: '2024-11-02',
    applicants: 32,
    location: 'New York, NY',
    salary: '৳100k-120k'
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Innovation Labs',
    category: 'Full Stack',
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    experienceLevel: 'mid',
    isActive: true,
    createdAt: '2024-11-03',
    applicants: 67,
    location: 'San Francisco, CA',
    salary: '৳90k-110k'
  },
  {
    id: '4',
    title: 'Junior React Developer',
    company: 'WebDev Solutions',
    category: 'Frontend',
    requiredSkills: ['React', 'JavaScript', 'CSS'],
    experienceLevel: 'entry',
    isActive: true,
    createdAt: '2024-11-04',
    applicants: 89,
    location: 'Remote',
    salary: '৳40k-50k'
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'Data Insights Co',
    category: 'Data Science',
    requiredSkills: ['Python', 'TensorFlow', 'SQL', 'Pandas'],
    experienceLevel: 'mid',
    isActive: false,
    createdAt: '2024-11-05',
    applicants: 23,
    location: 'Boston, MA',
    salary: '৳85k-100k'
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'Cloud Systems Inc',
    category: 'DevOps',
    requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD'],
    experienceLevel: 'senior',
    isActive: true,
    createdAt: '2024-11-06',
    applicants: 18,
    location: 'Seattle, WA',
    salary: '৳110k-130k'
  },
  {
    id: '7',
    title: 'Mobile App Developer',
    company: 'AppCraft Studio',
    category: 'Mobile',
    requiredSkills: ['React Native', 'JavaScript', 'iOS', 'Android'],
    experienceLevel: 'mid',
    isActive: true,
    createdAt: '2024-11-07',
    applicants: 41,
    location: 'Austin, TX',
    salary: '৳70k-90k'
  },
  {
    id: '8',
    title: 'Python Backend Developer',
    company: 'Python Solutions',
    category: 'Backend',
    requiredSkills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    experienceLevel: 'entry',
    isActive: true,
    createdAt: '2024-11-08',
    applicants: 56,
    location: 'Remote',
    salary: '৳45k-60k'
  }
]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/admin/jobs')
        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }
        const jobsData = await response.json()
        setJobs(jobsData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        // Fallback to mock data if API fails
        setJobs(mockJobs)
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setIsDialogOpen(true)
  }

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        const response = await fetch(`/api/admin/jobs?id=${jobId}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error('Failed to delete job')
        }
        setJobs(jobs.filter(job => job.id !== jobId))
      } catch (error) {
        console.error('Error deleting job:', error)
        alert('Failed to delete job. Please try again.')
      }
    }
  }

  const handleToggleActive = (jobId: string) => {
    setJobs(jobs.map(job =>
      job.id === jobId ? { ...job, isActive: !job.isActive } : job
    ))
  }

  const handleAdd = () => {
    setEditingJob(null)
    setIsDialogOpen(true)
  }

  const handleJobSubmit = async (jobData: Partial<Job>) => {
    try {
      if (editingJob) {
        // Update existing job
        const response = await fetch('/api/admin/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingJob.id, ...jobData })
        })
        if (!response.ok) {
          throw new Error('Failed to update job')
        }
        setJobs(jobs.map(job =>
          job.id === editingJob.id ? { ...job, ...jobData } as Job : job
        ))
      } else {
        // Add new job
        const response = await fetch('/api/admin/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...jobData, id: Date.now().toString() })
        })
        if (!response.ok) {
          throw new Error('Failed to create job')
        }
        const newJob = await response.json()
        setJobs([...jobs, { ...jobData, id: newJob.id || Date.now().toString() } as Job])
      }
    } catch (error) {
      console.error('Error saving job:', error)
      alert('Failed to save job. Please try again.')
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingJob(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Manage job postings and opportunities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => exportJobsData.csv(jobs)}
            className="gap-2 text-sm"
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportJobsData.json(jobs)}
            className="gap-2 text-sm"
            size="sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Export JSON</span>
            <span className="sm:hidden">JSON</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-2xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Active Jobs</p>
          <p className="text-2xl font-bold">{jobs.filter(j => j.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Total Applicants</p>
          <p className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + job.applicants, 0)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Avg. Applicants/Job</p>
          <p className="text-2xl font-bold">
            {Math.round(jobs.reduce((sum, job) => sum + job.applicants, 0) / jobs.length)}
          </p>
        </div>
      </div>

      <JobsTable
        jobs={jobs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onAdd={handleAdd}
      />

      <JobDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleJobSubmit}
        job={editingJob}
      />
    </div>
  )
}