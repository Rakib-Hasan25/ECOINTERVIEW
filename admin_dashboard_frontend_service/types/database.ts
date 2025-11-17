// Database schema types for Supabase

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          status: 'active' | 'inactive' | 'blocked'
          role: 'user' | 'admin' | 'moderator'
          created_at: string
          updated_at: string
          last_active_at: string
          profile_data: {
            location?: string
            experience_level: 'entry' | 'mid' | 'senior'
            current_job?: string
            target_role?: string
            profile_completeness: number
          }
          learning_progress: {
            completed_courses: number
            hours_spent: number
            certifications_earned: number
          }
        }
        Insert: {
          id?: string
          email: string
          name: string
          status?: 'active' | 'inactive' | 'blocked'
          role?: 'user' | 'admin' | 'moderator'
          created_at?: string
          updated_at?: string
          last_active_at?: string
          profile_data?: any
          learning_progress?: any
        }
        Update: {
          id?: string
          email?: string
          name?: string
          status?: 'active' | 'inactive' | 'blocked'
          role?: 'user' | 'admin' | 'moderator'
          updated_at?: string
          last_active_at?: string
          profile_data?: any
          learning_progress?: any
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          category: string
          required_skills: string[]
          experience_level: 'entry' | 'mid' | 'senior'
          location?: string
          salary?: string
          is_active: boolean
          created_at: string
          updated_at: string
          applicants_count: number
        }
        Insert: {
          id?: string
          title: string
          company: string
          category: string
          required_skills: string[]
          experience_level: 'entry' | 'mid' | 'senior'
          location?: string
          salary?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          applicants_count?: number
        }
        Update: {
          id?: string
          title?: string
          company?: string
          category?: string
          required_skills?: string[]
          experience_level?: 'entry' | 'mid' | 'senior'
          location?: string
          salary?: string
          is_active?: boolean
          updated_at?: string
          applicants_count?: number
        }
      }
      learning_resources: {
        Row: {
          id: string
          title: string
          type: 'course' | 'video' | 'article' | 'tutorial'
          skill_category: string
          url: string
          duration?: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          provider?: string
          is_free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          type: 'course' | 'video' | 'article' | 'tutorial'
          skill_category: string
          url: string
          duration?: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          provider?: string
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'course' | 'video' | 'article' | 'tutorial'
          skill_category?: string
          url?: string
          duration?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          provider?: string
          is_free?: boolean
          updated_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          assessment_score?: number
          is_gap: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          assessment_score?: number
          is_gap?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_name?: string
          assessment_score?: number
          is_gap?: boolean
        }
      }
      job_applications: {
        Row: {
          id: string
          user_id: string
          job_id: string
          status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          applied_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          applied_at?: string
        }
        Update: {
          id?: string
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status: 'active' | 'inactive' | 'blocked'
      user_role: 'user' | 'admin' | 'moderator'
      experience_level: 'entry' | 'mid' | 'senior'
      resource_type: 'course' | 'video' | 'article' | 'tutorial'
      difficulty_level: 'beginner' | 'intermediate' | 'advanced'
    }
  }
}