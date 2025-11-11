"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // <-- IMPORT THIS
import {
  User,
  MapPin,
  Briefcase,
  School,
  Award,
  Download,
  Pencil,
  GanttChartSquare,
  Upload,
  Save,
  Trash2,
  Plus,
} from "lucide-react";

// --- Mock Data: In a real app, you'd fetch this ---
// We use this to pre-fill the form
const mockCandidateData = {
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
  ],
  education: [
    {
      id: 1,
      school: "University of Technology",
      degree: "Master of Science in Computer Science",
      dates: "2017 - 2019",
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
  ],
  projects: [
    {
      id: 1,
      name: "EcoInterview (This Project!)",
      description:
        "A fullstack job hiring platform built with Next.js, TypeScript, and Tailwind CSS.",
      url: "#",
    },
  ],
};
// --- End Mock Data ---

// --- Reusable Form Components ---

// A wrapper for each form section
function FormSection({
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
      <div className="p-6 space-y-4">{children}</div>
    </section>
  );
}

// A reusable Input component
function Input({
  label,
  id,
  ...props
}: {
  label: string;
  id: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white sm:text-sm"
      />
    </div>
  );
}

// A reusable Textarea component
function Textarea({
  label,
  id,
  ...props
}: {
  label: string;
  id: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        {...props}
        className="block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white sm:text-sm"
      />
    </div>
  );
}
// --- End Reusable Form Components ---

export default function EditProfilePage() {
  const [profileData, setProfileData] = useState(mockCandidateData);
  const router = useRouter(); // <-- INITIALIZE ROUTER

  // --- Form Handlers ---

  // Handle simple top-level changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle changes in "skills"
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setProfileData((prev) => ({
      ...prev,
      skills: skills,
    }));
  };

  // --- Handlers for dynamic lists (Experience, Education, etc.) ---

  // A generic handler to update an item in any list
  const handleListChange = (
    listName: "experience" | "education" | "projects",
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const list = [...profileData[listName]];
    // @ts-ignore
    list[index][name] = value;
    setProfileData((prev) => ({
      ...prev,
      [listName]: list,
    }));
  };

  // A generic handler to add a new item to any list
  const addListItem = (listName: "experience" | "education" | "projects") => {
    let newItem;
    if (listName === "experience") {
      newItem = {
        id: Date.now(),
        role: "",
        company: "",
        dates: "",
        description: "",
      };
    } else if (listName === "education") {
      newItem = { id: Date.now(), school: "", degree: "", dates: "" };
    } else {
      newItem = { id: Date.now(), name: "", description: "", url: "" };
    }

    setProfileData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], newItem],
    }));
  };

  // A generic handler to remove an item from any list
  const removeListItem = (
    listName: "experience" | "education" | "projects",
    index: number
  ) => {
    const list = [...profileData[listName]];
    list.splice(index, 1);
    setProfileData((prev) => ({
      ...prev,
      [listName]: list,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send 'profileData' to your API
    console.log("Profile Data Saved:", profileData);
    // We'll replace the alert with a redirect
    // alert("Profile Saved!"); // You can remove this
    router.push("/candidate-dashboard/profile"); // <-- ADD THIS LINE
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <form onSubmit={handleSubmit}>
        {/* --- Sticky Save Header --- */}
        <div className="sticky top-16 z-10 -mt-6 -mx-6 md:-mx-10 mb-6 p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </h1>
            <div className="flex gap-2">
              <Link
                href="/candidate-dashboard/profile"
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* --- 1. Personal Info --- */}
        <FormSection title="Personal Information" icon={User}>
          <div className="flex items-center gap-4">
            <img
              src={profileData.avatarUrl}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover"
            />
            <button
              type="button"
              className="relative inline-flex items-center gap-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Avatar
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </button>
          </div>
          <Input
            label="Full Name"
            id="name"
            name="name"
            value={profileData.name}
            onChange={handleChange}
          />
          <Input
            label="Headline"
            id="headline"
            name="headline"
            value={profileData.headline}
            onChange={handleChange}
            placeholder="e.g., Senior Fullstack Engineer"
          />
          <Input
            label="Location"
            id="location"
            name="location"
            value={profileData.location}
            onChange={handleChange}
            placeholder="e.g., San Francisco, CA"
          />
          <div>
            <label
              htmlFor="cv"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Upload CV
            </label>
            <input
              type="file"
              id="cv"
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-100 file:text-indigo-700
                dark:file:bg-indigo-900 dark:file:text-indigo-300
                hover:file:bg-indigo-200 dark:hover:file:bg-indigo-800
                cursor-pointer"
            />
          </div>
        </FormSection>

        {/* --- 2. About --- */}
        <FormSection title="About" icon={Pencil}>
          <Textarea
            label="Summary"
            id="summary"
            name="summary"
            value={profileData.summary}
            onChange={handleChange}
            placeholder="Tell recruiters a bit about yourself..."
          />
        </FormSection>

        {/* --- 3. Skills --- */}
        <FormSection title="Skills" icon={Award}>
          <Input
            label="Skills (comma-separated)"
            id="skills"
            name="skills"
            value={profileData.skills.join(", ")}
            onChange={handleSkillsChange}
            placeholder="e.g., React, Node.js, Tailwind CSS"
          />
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((skill) => (
              <span
                key={skill}
                className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </FormSection>

        {/* --- 4. Experience --- */}
        <FormSection title="Experience" icon={Briefcase}>
          {profileData.experience.map((exp, index) => (
            <div
              key={exp.id}
              className="p-4 rounded-md border border-gray-200 dark:border-slate-700 space-y-4"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeListItem("experience", index)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <Input
                label="Role"
                id={`exp-role-${index}`}
                name="role"
                value={exp.role}
                onChange={(e) => handleListChange("experience", index, e)}
              />
              <Input
                label="Company"
                id={`exp-company-${index}`}
                name="company"
                value={exp.company}
                onChange={(e) => handleListChange("experience", index, e)}
              />
              <Input
                label="Dates"
                id={`exp-dates-${index}`}
                name="dates"
                value={exp.dates}
                onChange={(e) => handleListChange("experience", index, e)}
                placeholder="e.g., 2022 - Present"
              />
              <Textarea
                label="Description"
                id={`exp-desc-${index}`}
                name="description"
                value={exp.description}
                onChange={(e) => handleListChange("experience", index, e)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem("experience")}
            className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium py-2 px-4 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Experience
          </button>
        </FormSection>

        {/* --- 5. Education --- */}
        <FormSection title="Education" icon={School}>
          {profileData.education.map((edu, index) => (
            <div
              key={edu.id}
              className="p-4 rounded-md border border-gray-200 dark:border-slate-700 space-y-4"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeListItem("education", index)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <Input
                label="Degree"
                id={`edu-degree-${index}`}
                name="degree"
                value={edu.degree}
                onChange={(e) => handleListChange("education", index, e)}
              />
              <Input
                label="School"
                id={`edu-school-${index}`}
                name="school"
                value={edu.school}
                onChange={(e) => handleListChange("education", index, e)}
              />
              <Input
                label="Dates"
                id={`edu-dates-${index}`}
                name="dates"
                value={edu.dates}
                onChange={(e) => handleListChange("education", index, e)}
                placeholder="e.g., 2017 - 2019"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem("education")}
            className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium py-2 px-4 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Education
          </button>
        </FormSection>

        {/* --- 6. Projects --- */}
        <FormSection title="Projects" icon={GanttChartSquare}>
          {profileData.projects.map((project, index) => (
            <div
              key={project.id}
              className="p-4 rounded-md border border-gray-200 dark:border-slate-700 space-y-4"
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeListItem("projects", index)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <Input
                label="Project Name"
                id={`proj-name-${index}`}
                name="name"
                value={project.name}
                onChange={(e) => handleListChange("projects", index, e)}
              />
              <Input
                label="Project URL"
                id={`proj-url-${index}`}
                name="url"
                value={project.url}
                onChange={(e) => handleListChange("projects", index, e)}
                placeholder="httpsE.g., //github.com/your-repo"
              />
              <Textarea
                label="Description"
                id={`proj-desc-${index}`}
                name="description"
                value={project.description}
                onChange={(e) => handleListChange("projects", index, e)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem("projects")}
            className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium py-2 px-4 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </FormSection>

        {/* --- Final Save Button --- */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
}
