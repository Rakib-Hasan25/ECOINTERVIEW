'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react'
import type { Job } from '@/types/admin'

interface JobsTableProps {
  jobs: Job[]
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
  onToggleActive: (jobId: string) => void
  onAdd: () => void
}

export function JobsTable({ 
  jobs, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onAdd 
}: JobsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(jobs.map(job => job.category)))]

  const getExperienceBadgeVariant = (level: string) => {
    switch (level) {
      case 'entry': return 'success'
      case 'mid': return 'warning'
      case 'senior': return 'destructive'
      default: return 'default'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Job Postings</CardTitle>
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Job
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-gray-600">Job Title</th>
                <th className="text-left p-4 font-medium text-gray-600">Company</th>
                <th className="text-left p-4 font-medium text-gray-600">Category</th>
                <th className="text-left p-4 font-medium text-gray-600">Level</th>
                <th className="text-left p-4 font-medium text-gray-600">Applicants</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-500">
                        {job.requiredSkills.slice(0, 3).join(', ')}
                        {job.requiredSkills.length > 3 && '...'}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">{job.company}</td>
                  <td className="p-4">
                    <Badge variant="outline">{job.category}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={getExperienceBadgeVariant(job.experienceLevel) as any}>
                      {job.experienceLevel}
                    </Badge>
                  </td>
                  <td className="p-4">{job.applicants}</td>
                  <td className="p-4">
                    <button
                      onClick={() => onToggleActive(job.id)}
                      className="flex items-center gap-1"
                    >
                      {job.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(job)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No jobs found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  )
}