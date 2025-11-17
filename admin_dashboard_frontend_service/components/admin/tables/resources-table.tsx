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
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Code
} from 'lucide-react'
import type { LearningResource } from '@/types/admin'

interface ResourcesTableProps {
  resources: LearningResource[]
  onEdit: (resource: LearningResource) => void
  onDelete: (resourceId: string) => void
  onAdd: () => void
}

export function ResourcesTable({ 
  resources, 
  onEdit, 
  onDelete, 
  onAdd 
}: ResourcesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.skillCategory.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty
    return matchesSearch && matchesType && matchesDifficulty
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return BookOpen
      case 'video': return Video
      case 'article': return FileText
      case 'tutorial': return Code
      default: return BookOpen
    }
  }

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'destructive'
      default: return 'default'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Learning Resources</CardTitle>
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="video">Videos</option>
            <option value="article">Articles</option>
            <option value="tutorial">Tutorials</option>
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white text-sm"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-gray-600">Resource</th>
                <th className="text-left p-4 font-medium text-gray-600">Type</th>
                <th className="text-left p-4 font-medium text-gray-600">Skill Category</th>
                <th className="text-left p-4 font-medium text-gray-600">Difficulty</th>
                <th className="text-left p-4 font-medium text-gray-600">Duration</th>
                <th className="text-left p-4 font-medium text-gray-600">Price</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource) => {
                const TypeIcon = getTypeIcon(resource.type)
                return (
                  <tr key={resource.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <TypeIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          {resource.provider && (
                            <p className="text-sm text-gray-500">by {resource.provider}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {resource.type}
                      </Badge>
                    </td>
                    <td className="p-4">{resource.skillCategory}</td>
                    <td className="p-4">
                      <Badge variant={getDifficultyVariant(resource.difficulty) as any}>
                        {resource.difficulty}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {resource.duration || '-'}
                    </td>
                    <td className="p-4">
                      <Badge variant={resource.isFree ? 'success' : 'default'} className="capitalize">
                        {resource.isFree ? 'Free' : 'Paid'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(resource)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(resource.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No resources found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  )
}