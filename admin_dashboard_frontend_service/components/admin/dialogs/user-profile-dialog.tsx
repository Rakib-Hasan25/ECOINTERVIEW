'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  Clock,
  Mail,
  User as UserIcon
} from 'lucide-react'
import type { User } from '@/types/admin'

interface UserProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export function UserProfileDialog({ isOpen, onClose, user }: UserProfileDialogProps) {
  if (!user) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-yellow-100 text-yellow-700'
      case 'blocked': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-xl">{user.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
              <Badge className={`${getStatusColor(user.status)} border-0`}>
                {user.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Role</p>
              <Badge variant="outline">{user.role}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Experience Level</p>
              <p className="text-sm capitalize">{user.experienceLevel}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Profile Completeness</p>
              <p className="text-sm">{user.profileCompleteness}%</p>
            </div>
          </div>

          {/* Location & Job Info */}
          <div className="space-y-3">
            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.location}</span>
              </div>
            )}
            
            {user.currentJob && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{user.currentJob}</span>
              </div>
            )}

            {user.targetRole && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Looking for</p>
                <p className="text-sm">{user.targetRole}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Skills Assessed</p>
            <div className="flex flex-wrap gap-1">
              {user.skillsAssessed.slice(0, 10).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {user.skillsAssessed.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{user.skillsAssessed.length - 10} more
                </Badge>
              )}
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{user.jobsApplied}</p>
              <p className="text-xs text-gray-600">Jobs Applied</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{user.learningProgress.completedCourses}</p>
              <p className="text-xs text-gray-600">Courses Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{user.learningProgress.certificationsEarned}</p>
              <p className="text-xs text-gray-600">Certifications</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex justify-between text-xs text-gray-500 pt-4 border-t">
            <span>Joined {formatDate(user.joinedAt)}</span>
            <span>Last active {formatDate(user.lastActiveAt)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}