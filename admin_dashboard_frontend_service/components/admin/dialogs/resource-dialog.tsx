'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { LearningResource } from '@/types/admin'

interface ResourceDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (resource: Partial<LearningResource>) => void
  resource?: LearningResource | null
}

const resourceTypes = [
  { value: 'course', label: 'Course' },
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'tutorial', label: 'Tutorial' }
]

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const skillCategories = [
  'JavaScript', 'Python', 'React', 'TypeScript', 'Node.js', 'AWS', "Next.js",
  'Docker', 'SQL', 'Git', 'MongoDB', 'Redux', 'GraphQL', 'Kubernetes',
  'Testing', 'CI/CD', 'System Design', 'HTML', 'CSS'
]

export function ResourceDialog({ isOpen, onClose, onSubmit, resource }: ResourceDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'course' as 'course' | 'video' | 'article' | 'tutorial',
    skillCategory: '',
    url: '',
    duration: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    provider: '',
    isFree: true
  })

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        type: resource.type,
        skillCategory: resource.skillCategory,
        url: resource.url,
        duration: resource.duration || '',
        difficulty: resource.difficulty,
        provider: resource.provider || '',
        isFree: resource.isFree
      })
    } else {
      setFormData({
        title: '',
        type: 'course',
        skillCategory: '',
        url: '',
        duration: '',
        difficulty: 'beginner',
        provider: '',
        isFree: true
      })
    }
  }, [resource, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.skillCategory || !formData.url) {
      alert('Please fill in all required fields')
      return
    }

    const resourceData = {
      ...formData,
      id: resource?.id || Date.now().toString(),
    }

    onSubmit(resourceData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {resource ? 'Edit Resource' : 'Add New Resource'}
          </DialogTitle>
          <DialogDescription>
            {resource ? 'Update learning resource details' : 'Create a new learning resource for skill development'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Resource Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. React - The Complete Guide"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Resource Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {resourceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillCategory">Skill Category *</Label>
              <select
                id="skillCategory"
                value={formData.skillCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, skillCategory: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                required
              >
                <option value="">Select skill</option>
                {skillCategories.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Resource URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com/resource"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g. 40 hours, 2 hours, 15 min read"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {difficultyLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider/Author</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
              placeholder="e.g. Udemy, YouTube - Traversy Media"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFree"
              checked={formData.isFree}
              onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isFree">Free resource</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {resource ? 'Update Resource' : 'Create Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}