# Admin Dashboard - SDG 8 Impact Platform

A clean, minimalist admin dashboard for managing the SDG 8 Youth Employment Platform. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### 📊 Analytics Dashboard
- Real-time metrics display (Total Users, Jobs Suggested, Active Users, Skill Gap Coverage)
- Interactive charts for data visualization:
  - Skills demand analysis
  - Job categories distribution
  - User growth timeline
  - Common skill gaps identification

### 💼 Job Management
- Complete CRUD operations for job postings
- Search and filter functionality
- Quick status toggle (Active/Inactive)
- Detailed job metrics and applicant tracking

### 📚 Learning Resources Management
- Manage educational content across multiple formats (courses, videos, articles, tutorials)
- Filter by type, difficulty, and category
- Track free vs paid resources
- Direct link access to resources

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd admin_dashboard_frontend_service
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
admin_dashboard_frontend_service/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with sidebar
│   │   ├── analytics/          # Analytics dashboard
│   │   ├── jobs/              # Job management
│   │   ├── resources/         # Resource management
│   │   ├── users/             # User management (placeholder)
│   │   └── settings/          # Settings (placeholder)
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   ├── metric-card.tsx    # Metrics display card
│   │   ├── charts/            # Chart components
│   │   └── tables/            # Data table components
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── api.ts                 # API integration
│   └── utils.ts               # Utility functions
├── types/
│   └── admin.ts               # TypeScript type definitions
└── docs/                      # Documentation
\`\`\`

## API Integration

The dashboard is designed to integrate with a backend API. Currently using mock data for development.

### Expected API Endpoints

\`\`\`
GET /api/admin/analytics       # Get analytics data
GET /api/admin/jobs            # Get all jobs
POST /api/admin/jobs           # Create new job
PUT /api/admin/jobs/:id        # Update job
DELETE /api/admin/jobs/:id     # Delete job
GET /api/admin/resources       # Get all resources
POST /api/admin/resources      # Create resource
PUT /api/admin/resources/:id   # Update resource
DELETE /api/admin/resources/:id # Delete resource
\`\`\`

### Connecting to Backend

Update the API base URL in \`lib/api.ts\`:

\`\`\`typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
\`\`\`

## Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_API_URL=http://your-backend-url/api
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run lint\` - Run ESLint

## Key Features Implementation

### Analytics Dashboard
- Displays real-time metrics using card components
- Visualizes data with Recharts (Bar, Line, Pie charts)
- Responsive grid layout for optimal viewing

### Job Management
- Searchable and filterable table
- Status management with visual indicators
- Quick actions for edit/delete operations
- Bulk selection support (can be extended)

### Resource Management
- Multi-type resource support
- Difficulty-based categorization
- Free/Paid resource tracking
- External link integration

## Design Principles

- **Clean & Minimalist**: Focus on functionality with minimal visual clutter
- **Professional**: Enterprise-ready design suitable for admin users
- **Responsive**: Optimized for desktop and tablet viewing
- **Fast**: Optimized loading with efficient data fetching
- **Accessible**: Following WCAG guidelines for accessibility

## Performance Optimizations

- Lazy loading of chart components
- Efficient state management with React hooks
- Optimized re-renders with proper key usage
- Mock data for development to reduce API calls

## Future Enhancements

- Real-time data updates with WebSocket
- Export functionality for analytics data
- Advanced filtering and search capabilities
- User activity logs
- Role-based access control
- Dark mode support
- Mobile responsive design

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is part of the SDG 8 Youth Employment Platform hackathon project.

## Support

For issues or questions, please contact the development team.