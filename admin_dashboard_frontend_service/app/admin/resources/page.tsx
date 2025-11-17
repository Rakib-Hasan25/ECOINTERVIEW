'use client'

import { useState, useEffect } from 'react'
import { ResourcesTable } from '@/components/admin/tables/resources-table'
import { ResourceDialog } from '@/components/admin/dialogs/resource-dialog'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { exportResourcesData } from '@/lib/export'
import type { LearningResource } from '@/types/admin'

// Mock data for development
const mockResources: LearningResource[] = [
  {
    id: '1',
    title: 'React - The Complete Guide',
    type: 'course',
    skillCategory: 'React',
    url: 'https://example.com/react-course',
    duration: '40 hours',
    difficulty: 'beginner',
    provider: 'Udemy',
    isFree: false
  },
  {
    id: '2',
    title: 'JavaScript Fundamentals',
    type: 'video',
    skillCategory: 'JavaScript',
    url: 'https://youtube.com/watch?v=example',
    duration: '2 hours',
    difficulty: 'beginner',
    provider: 'YouTube - Traversy Media',
    isFree: true
  },
  {
    id: '3',
    title: 'Advanced TypeScript Patterns',
    type: 'article',
    skillCategory: 'TypeScript',
    url: 'https://medium.com/typescript-patterns',
    duration: '15 min read',
    difficulty: 'advanced',
    provider: 'Medium',
    isFree: true
  },
  {
    id: '4',
    title: 'Node.js Backend Development',
    type: 'course',
    skillCategory: 'Node.js',
    url: 'https://coursera.org/nodejs',
    duration: '30 hours',
    difficulty: 'intermediate',
    provider: 'Coursera',
    isFree: false
  },
  {
    id: '5',
    title: 'Docker for Beginners',
    type: 'tutorial',
    skillCategory: 'Docker',
    url: 'https://docker.com/get-started',
    duration: '3 hours',
    difficulty: 'beginner',
    provider: 'Docker Official',
    isFree: true
  },
  {
    id: '6',
    title: 'AWS Cloud Practitioner',
    type: 'course',
    skillCategory: 'AWS',
    url: 'https://aws.training',
    duration: '15 hours',
    difficulty: 'beginner',
    provider: 'AWS Training',
    isFree: false
  },
  {
    id: '7',
    title: 'Python Data Science Handbook',
    type: 'article',
    skillCategory: 'Python',
    url: 'https://jakevdp.github.io/PythonDataScienceHandbook/',
    duration: '8 hours',
    difficulty: 'intermediate',
    provider: 'O\'Reilly',
    isFree: true
  },
  {
    id: '8',
    title: 'GraphQL Full Course',
    type: 'video',
    skillCategory: 'GraphQL',
    url: 'https://youtube.com/graphql-course',
    duration: '4 hours',
    difficulty: 'intermediate',
    provider: 'FreeCodeCamp',
    isFree: true
  },
  {
    id: '9',
    title: 'System Design Interview Prep',
    type: 'course',
    skillCategory: 'System Design',
    url: 'https://educative.io/system-design',
    duration: '25 hours',
    difficulty: 'advanced',
    provider: 'Educative',
    isFree: false
  },
  {
    id: '10',
    title: 'Git and GitHub Tutorial',
    type: 'tutorial',
    skillCategory: 'Git',
    url: 'https://guides.github.com',
    duration: '1 hour',
    difficulty: 'beginner',
    provider: 'GitHub Guides',
    isFree: true
  }
]

export default function ResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/admin/resources')
        if (!response.ok) {
          throw new Error('Failed to fetch resources')
        }
        const resourcesData = await response.json()
        setResources(resourcesData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching resources:', error)
        // Fallback to mock data if API fails
        setResources(mockResources)
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  const handleEdit = (resource: LearningResource) => {
    setEditingResource(resource)
    setIsDialogOpen(true)
  }

  const handleDelete = async (resourceId: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await fetch(`/api/admin/resources?id=${resourceId}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error('Failed to delete resource')
        }
        setResources(resources.filter(r => r.id !== resourceId))
      } catch (error) {
        console.error('Error deleting resource:', error)
        alert('Failed to delete resource. Please try again.')
      }
    }
  }

  const handleAdd = () => {
    setEditingResource(null)
    setIsDialogOpen(true)
  }

  const handleResourceSubmit = async (resourceData: Partial<LearningResource>) => {
    try {
      if (editingResource) {
        // Update existing resource
        const response = await fetch('/api/admin/resources', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingResource.id, ...resourceData })
        })
        if (!response.ok) {
          throw new Error('Failed to update resource')
        }
        setResources(resources.map(resource => 
          resource.id === editingResource.id ? { ...resource, ...resourceData } as LearningResource : resource
        ))
      } else {
        // Add new resource
        const response = await fetch('/api/admin/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceData)
        })
        if (!response.ok) {
          throw new Error('Failed to create resource')
        }
        const newResource = await response.json()
        setResources([...resources, { ...resourceData, id: newResource.id || Date.now().toString() } as LearningResource])
      }
    } catch (error) {
      console.error('Error saving resource:', error)
      alert('Failed to save resource. Please try again.')
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingResource(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Learning Resources</h1>
          <p className="text-gray-600 mt-2">Manage educational content and skill development resources</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => exportResourcesData.csv(resources)}
            className="gap-2 text-sm"
            size="sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportResourcesData.json(resources)}
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
          <p className="text-sm text-gray-600">Total Resources</p>
          <p className="text-2xl font-bold">{resources.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Free Resources</p>
          <p className="text-2xl font-bold">{resources.filter(r => r.isFree).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Skill Categories</p>
          <p className="text-2xl font-bold">{new Set(resources.map(r => r.skillCategory)).size}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-600">Resource Types</p>
          <p className="text-2xl font-bold">{new Set(resources.map(r => r.type)).size}</p>
        </div>
      </div>

      <ResourcesTable
        resources={resources}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <ResourceDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleResourceSubmit}
        resource={editingResource}
      />
    </div>
  )
}