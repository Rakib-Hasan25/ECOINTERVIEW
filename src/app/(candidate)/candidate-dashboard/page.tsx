// FILE: src/app/(candidate)/dashboard/page.tsx

import { FileText, Briefcase, Clock, MapPin } from "lucide-react";
import Link from "next/link";

// --- Data (Mock) ---
const stats = [
  {
    name: "Jobs Applied",
    value: "12",
    icon: Briefcase,
    color: "text-blue-500",
  },
  { name: "Interviews", value: "2", icon: Clock, color: "text-yellow-500" },
  {
    name: "Active Applications",
    value: "5",
    icon: FileText,
    color: "text-indigo-500",
  },
];

const scheduledInterviews = [
  {
    id: 1,
    title: "Technical Interview",
    company: "TechCorp",
    date: "November 14, 2025",
    time: "2:00 PM EST",
  },
  {
    id: 2,
    title: "Behavioral Interview",
    company: "Innovate Inc.",
    date: "November 16, 2025",
    time: "10:30 AM EST",
  },
];

const recommendedJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Vercel",
    location: "Remote",
  },
  {
    id: 2,
    title: "Fullstack Engineer",
    company: "Google",
    location: "New York, NY",
  },
];
// --- End Data ---

export default function CandidateDashboardPage() {
  const profileCompleteness = 75; // Example value

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Welcome back, Candidate!
      </h1>

      {/* --- 1. Profile Completeness Prompt --- */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative">
            {/* Profile completeness circle */}
            <svg className="h-20 w-20" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-gray-200 dark:text-slate-700"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-indigo-600"
                strokeWidth="3"
                strokeDasharray={`${profileCompleteness}, 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white">
              {profileCompleteness}%
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              A complete profile gets 3x more views from recruiters.
            </p>
          </div>
          <Link
            href="/candidate-dashboard/profile"
            className="mt-2 md:mt-0 flex-shrink-0 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Update Profile
          </Link>
        </div>
      </section>

      {/* --- 2. Stats Cards --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700"
          >
            <stat.icon
              className={`h-8 w-8 ${stat.color} mb-4`}
              aria-hidden="true"
            />
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.name}
            </p>
          </div>
        ))}
      </section>

      {/* --- 3. Main Content (Interviews & Recommended) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Scheduled Interviews --- */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Scheduled Interviews
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {scheduledInterviews.map((interview) => (
                <li
                  key={interview.id}
                  className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <div className="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full text-yellow-600 dark:text-yellow-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {interview.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {interview.company}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {interview.date}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {interview.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Recommended Jobs --- */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            For You
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-slate-700">
              {recommendedJobs.map((job) => (
                <li
                  key={job.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {job.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {job.company}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </span>
                    <Link
                      href={`/find-jobs/${job.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
