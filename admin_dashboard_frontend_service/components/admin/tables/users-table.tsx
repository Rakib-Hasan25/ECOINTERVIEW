'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import type { User } from '@/types/admin'

interface UsersTableProps {
  users: User[]
  onView: (user: User) => void
  onBlock: (userId: string) => void
  onUnblock: (userId: string) => void
}

export function UsersTable({ 
  users, 
  onView, 
  onBlock,
  onUnblock
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-yellow-100 text-yellow-700'
      case 'blocked': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'inactive': return <Clock className="h-3 w-3" />
      case 'blocked': return <XCircle className="h-3 w-3" />
      default: return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({filteredUsers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Simple Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white text-sm w-32"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Clean User List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(user.status)} border-0 gap-1`}>
                  {getStatusIcon(user.status)}
                  {user.status}
                </Badge>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm font-medium">{formatDate(user.joinedAt)}</p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {user.status === 'blocked' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUnblock(user.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      Unblock
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBlock(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Block
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found
          </div>
        )}
      </CardContent>
    </Card>
  )
}