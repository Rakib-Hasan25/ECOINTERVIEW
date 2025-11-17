export interface AnalyticsData {
  metrics: {
    totalUsers: number;
    jobsSuggested: number;
    activeToday: number;
    skillGapCoverage: number;
  };
  skillsDemand: Array<{
    skill: string;
    count: number;
  }>;
  jobCategories: Array<{
    category: string;
    percentage: number;
    count: number;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
  commonGaps: Array<{
    skill: string;
    occurrences: number;
  }>;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  requiredSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior';
  isActive: boolean;
  createdAt: string;
  applicants: number;
  location?: string;
  salary?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'course' | 'video' | 'article' | 'tutorial';
  skillCategory: string;
  url: string;
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  provider?: string;
  isFree: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  role: 'user' | 'admin' | 'moderator';
  joinedAt: string;
  lastActiveAt: string;
  skillsAssessed: string[];
  jobsApplied: number;
  profileCompleteness: number;
  location?: string;
  experienceLevel: 'entry' | 'mid' | 'senior';
  currentJob?: string;
  targetRole?: string;
  skillGaps: string[];
  learningProgress: {
    completedCourses: number;
    hoursSpent: number;
    certificationsEarned: number;
  };
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  avgSessionDuration: number; // in minutes
  skillAssessmentsTaken: number;
  jobApplications: number;
  coursesCompleted: number;
  skillsImproved: string[];
  weeklyActivity: Array<{
    date: string;
    sessions: number;
    timeSpent: number;
  }>;
}