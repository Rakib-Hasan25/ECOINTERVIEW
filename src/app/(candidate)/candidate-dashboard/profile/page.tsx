import Link from "next/link";
import {
  User,
  MapPin,
  Briefcase,
  School,
  Award,
  Download,
  Pencil,
  ExternalLink,
  GanttChartSquare, // Using this for Projects
} from "lucide-react";

// --- Mock Data: In a real app, you'd fetch this ---
const candidate = {
  name: "Candidate Name",
  headline: "Senior Fullstack Engineer | React, Node.js, & TypeScript",
  location: "San Francisco, CA",
  avatarUrl: "https://placehold.co/100x100/f0f0f0/333?text=User",
  cvUrl: "/api/candidate/cv/download", // A mock API route
  summary:
    "Experienced software engineer with over 8 years of experience in developing scalable web applications. Passionate about creating clean, efficient code and building user-centric products. Proven ability to lead and mentor junior developers.",
  experience: [
    {
      id: 1,
      role: "Senior Software Engineer",
      company: "TechCorp",
      dates: "2022 - Present",
      description:
        "Led the development of a new microservices architecture, improving system scalability by 40%. Mentored a team of 4 junior engineers.",
    },
    {
      id: 2,
      role: "Software Engineer",
      company: "Innovate Inc.",
      dates: "2019 - 2022",
      description:
        "Developed and maintained core features for a high-traffic e-commerce platform using React and Node.js.",
    },
  ],
  education: [
    {
      id: 1,
      school: "University of Technology",
      degree: "Master of Science in Computer Science",
      dates: "2017 - 2019",
    },
    {
      id: 2,
      school: "State University",
      degree: "Bachelor of Science in Information Technology",
      dates: "2013 - 2017",
    },
  ],
  skills: [
    "JavaScript (ES6+)",
    "TypeScript",
    "React",
    "Node.js",
    "Next.js",
    "Tailwind CSS",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Agile Methodologies",
  ],
  projects: [
    {
      id: 1,
      name: "EcoInterview (This Project!)",
      description:
        "A fullstack job hiring platform built with Next.js, TypeScript, and Tailwind CSS.",
      url: "#", // Link to the project's repo or live site
    },
    {
      id: 2,
      name: "DataVisualizer",
      description:
        "A D3.js-based tool for creating interactive charts and graphs from CSV data.",
      url: "#",
    },
  ],
};
// --- End Mock Data ---

// A reusable component for section cards
function ProfileSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-700">
        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

// A reusable component for list items (Experience, Education, etc.)
function ListItem({
  title,
  subtitle,
  meta,
  description,
  url,
}: {
  title: string;
  subtitle: string;
  meta: string;
  description?: string;
  url?: string;
}) {
  return (
    <li className="py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        {url && (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        )}
      </div>
      <p className="text-sm text-indigo-600 dark:text-indigo-400">{subtitle}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{meta}</p>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {description}
        </p>
      )}
    </li>
  );
}

// --- The Main Profile Page ---
export default function CandidateProfilePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* --- 1. Hero Card --- */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          {/* Left Side: Avatar & Info */}
          <div className="flex items-center gap-4">
            <img
              src={candidate.avatarUrl}
              alt={candidate.name}
              className="h-24 w-24 rounded-full border-4 border-indigo-200 dark:border-indigo-700 object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {candidate.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {candidate.headline}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-500 mt-1">
                <MapPin className="h-4 w-4" /> {candidate.location}
              </span>
            </div>
          </div>
          {/* Right Side: Buttons */}
          <div className="flex-shrink-0 flex gap-2 mt-4 sm:mt-0">
            <Link
              href={candidate.cvUrl}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download CV
            </Link>
            <Link
              href="/candidate-dashboard/profile/edit"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        </div>
      </section>

      {/* --- 2. About Section --- */}
      <ProfileSection title="About" icon={User}>
        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
          {candidate.summary}
        </p>
      </ProfileSection>

      {/* --- 3. Experience Section --- */}
      <ProfileSection title="Experience" icon={Briefcase}>
        <ul className="divide-y divide-gray-200 dark:divide-slate-700">
          {candidate.experience.map((job) => (
            <ListItem
              key={job.id}
              title={job.role}
              subtitle={job.company}
              meta={job.dates}
              description={job.description}
            />
          ))}
        </ul>
      </ProfileSection>

      {/* --- 4. Education Section --- */}
      <ProfileSection title="Education" icon={School}>
        <ul className="divide-y divide-gray-200 dark:divide-slate-700">
          {candidate.education.map((edu) => (
            <ListItem
              key={edu.id}
              title={edu.degree}
              subtitle={edu.school}
              meta={edu.dates}
            />
          ))}
        </ul>
      </ProfileSection>

      {/* --- 5. Skills Section --- */}
      <ProfileSection title="Skills" icon={Award}>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.map((skill) => (
            <span
              key={skill}
              className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </ProfileSection>

      {/* --- 6. Projects Section --- */}
      <ProfileSection title="Projects" icon={GanttChartSquare}>
        <ul className="divide-y divide-gray-200 dark:divide-slate-700">
          {candidate.projects.map((project) => (
            <ListItem
              key={project.id}
              title={project.name}
              subtitle=""
              meta=""
              description={project.description}
              url={project.url}
            />
          ))}
        </ul>
      </ProfileSection>
    </div>
  );
}
