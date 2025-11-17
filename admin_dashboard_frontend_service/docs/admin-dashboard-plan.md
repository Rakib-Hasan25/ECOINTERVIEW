# Admin Dashboard Implementation Plan

## 🎯 Project Overview
Build a clean, minimalist admin dashboard for SDG 8 Impact Analytics and Job Management using Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts (lightweight, works well with shadcn)
- **State**: React hooks (keep it simple for MVP)
- **Icons**: Lucide React

## 📊 Dashboard Structure

### 1. Analytics Dashboard
**Route**: `/admin/analytics`

#### Key Metrics Cards (Top Row)
- Total Users Analyzed
- Total Jobs Suggested
- Active Users Today
- Skill Gap Coverage Rate

#### Visualizations
- **Skills Demand Chart** (Bar chart - Top 10 skills)
- **Job Categories Distribution** (Pie chart)
- **User Growth Timeline** (Line chart - Last 30 days)
- **Common Skill Gaps** (Horizontal bar chart)

### 2. Job Management Dashboard
**Route**: `/admin/jobs`

#### Features
- Jobs Table with search/filter
- Quick actions (Edit, Delete, Toggle Active)
- Add New Job modal
- Bulk operations

### 3. Learning Resources Management
**Route**: `/admin/resources`

#### Features
- Resources list with categories
- Add/Edit/Delete resources
- Link resources to skill gaps

## 🎨 UI/UX Design Principles

### Layout
```
┌─────────────────────────────────────────┐
│  Sidebar  │      Main Content Area       │
│           │  ┌───────────────────────┐   │
│  Nav      │  │   Metric Cards Row    │   │
│  Items    │  └───────────────────────┘   │
│           │  ┌───────────────────────┐   │
│           │  │   Charts Grid         │   │
│           │  └───────────────────────┘   │
└─────────────────────────────────────────┘
```

### Design System
- **Colors**: Neutral grays, primary blue accent
- **Typography**: Inter font, clear hierarchy
- **Spacing**: Consistent 4/8px grid
- **Components**: shadcn/ui for consistency
- **Animations**: Subtle, functional transitions

## 📝 Data Schema

### Analytics API Response
```typescript
interface AnalyticsData {
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
```

### Job Management Schema
```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  category: string;
  requiredSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior';
  isActive: boolean;
  createdAt: string;
  applicants: number;
}
```

### Learning Resource Schema
```typescript
interface Resource {
  id: string;
  title: string;
  type: 'course' | 'video' | 'article';
  skillCategory: string;
  url: string;
  duration?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

## 🚀 Implementation Steps

### Phase 1: Setup & Layout (1-2 hours)
1. Create admin layout with sidebar
2. Setup routing structure
3. Install and configure shadcn/ui components
4. Create reusable card and table components

### Phase 2: Analytics Dashboard (2-3 hours)
1. Build metric cards component
2. Implement charts with Recharts
3. Add data fetching hooks
4. Create loading states

### Phase 3: Job Management (2-3 hours)
1. Build data table with shadcn/ui
2. Add search and filter functionality
3. Create add/edit job dialog
4. Implement CRUD operations

### Phase 4: Resource Management (1-2 hours)
1. Create resource list view
2. Add resource form
3. Implement category filtering

### Phase 5: Integration & Polish (1-2 hours)
1. Connect to backend APIs
2. Add error handling
3. Implement responsive design
4. Final UI polish

## 🔌 API Endpoints

### Expected Endpoints
```
GET /api/admin/analytics
GET /api/admin/jobs
POST /api/admin/jobs
PUT /api/admin/jobs/:id
DELETE /api/admin/jobs/:id
GET /api/admin/resources
POST /api/admin/resources
PUT /api/admin/resources/:id
DELETE /api/admin/resources/:id
```

## 🎯 MVP Priorities

### Must Have
- Analytics overview with 4 key metrics
- Skills demand chart
- Jobs table with CRUD
- Clean, professional UI

### Nice to Have
- Real-time updates
- Export functionality
- Advanced filtering
- Batch operations

### Skip for MVP
- Complex animations
- Multiple themes
- Detailed user analytics
- Email notifications

## 📁 Folder Structure
```
admin_dashboard_frontend_service/
├── app/
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── jobs/
│   │   │   └── page.tsx
│   │   └── resources/
│   │       └── page.tsx
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx
│   │   ├── metric-card.tsx
│   │   ├── charts/
│   │   │   ├── skills-chart.tsx
│   │   │   ├── growth-chart.tsx
│   │   │   └── category-chart.tsx
│   │   └── tables/
│   │       ├── jobs-table.tsx
│   │       └── resources-table.tsx
├── lib/
│   ├── api.ts
│   └── utils.ts
└── types/
    └── admin.ts
```

## ⚡ Quick Start Commands
```bash
# Install shadcn/ui components needed
npx shadcn-ui@latest add card table dialog button input select tabs chart

# Install additional dependencies
npm install recharts lucide-react
```

## 🏁 Success Metrics
- Clean, intuitive interface
- <3s page load time
- Responsive on tablet/desktop
- All CRUD operations working
- At least 3 meaningful visualizations