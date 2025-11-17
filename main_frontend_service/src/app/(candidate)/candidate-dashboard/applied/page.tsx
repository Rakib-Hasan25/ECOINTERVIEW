"use client"; // This page needs to be a Client Component for the tabs

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Clock, XCircle, Briefcase, CheckCircle } from "lucide-react";

// --- Mock Data ---
// In a real app, you'd fetch this data
const allApplications = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp",
    dateApplied: "Nov 10, 2025",
    status: "Under Review",
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Innovate Inc.",
    dateApplied: "Nov 8, 2025",
    status: "Interview Scheduled",
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Creative Solutions",
    dateApplied: "Nov 5, 2025",
    status: "Not Selected",
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "DataTrack",
    dateApplied: "Oct 30, 2025",
    status: "Under Review",
  },
  {
    id: 5,
    title: "Marketing Specialist",
    company: "MarketPro",
    dateApplied: "Oct 28, 2025",
    status: "Offer Extended",
  },
];
// --- End Mock Data ---

// --- Helper object for styling statuses ---
const statusStyles: {
  [key: string]: { icon: React.ElementType; color: string };
} = {
  "Under Review": { icon: FileText, color: "text-indigo-500" },
  "Interview Scheduled": { icon: Clock, color: "text-yellow-500" },
  "Offer Extended": { icon: CheckCircle, color: "text-green-500" },
  "Not Selected": { icon: XCircle, color: "text-red-500" },
};

export default function MyApplicationsPage() {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Active", "Interview", "Archived"];

  const filteredApplications = allApplications.filter((app) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") {
      return app.status === "Under Review";
    }
    if (activeTab === "Interview") {
      return (
        app.status === "Interview Scheduled" || app.status === "Offer Extended"
      );
    }
    if (activeTab === "Archived") {
      return app.status === "Not Selected";
    }
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        My Applications
      </h1>

      {/* --- Filter Tabs --- */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex -mb-px space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* --- Applications List --- */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => {
            const StatusIcon = statusStyles[app.status]?.icon || FileText;
            const statusColor =
              statusStyles[app.status]?.color || "text-gray-500";

            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <Link
                    href={`/find-jobs/${app.id}`} // Assuming this links to a job detail page
                    className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {app.title}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {app.company}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Applied on {app.dateApplied}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} bg-opacity-10 ${statusColor.replace(
                      "text",
                      "bg"
                    )}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {app.status}
                  </span>
                  <Link
                    href={`/my-applications/${app.id}`} // This would link to the specific application detail
                    className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          // --- Empty State ---
          <div className="text-center bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
              No applications found
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              You haven't applied for any jobs in this category yet.
            </p>
            <div className="mt-6">
              <Link
                href="/find-jobs"
                className="inline-flex items-center bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Find Jobs
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
