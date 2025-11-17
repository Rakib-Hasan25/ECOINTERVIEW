"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Award,
  Save,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const supabaseClient = useMemo(() => createSupabaseClientSide(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [profileData, setProfileData] = useState({
    full_name: "",
    about: "",
    skills: [] as string[],
    preferred_career_track: "",
    experience_level: "",
    education_level: "",
    department: "",
    location: "",
    resumelink: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [resumecontext, setResumecontext] = useState<string | null>(null);
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      if (sessionError) {
        if (isMounted) {
          setError("Unable to verify your session. Please sign in again.");
          setIsLoading(false);
        }
        return;
      }

      if (!session?.user) {
        if (isMounted) {
          setError("You are not signed in. Please sign in to edit your profile.");
          setIsLoading(false);
        }
        return;
      }

      const { data, error: profileError } = await supabaseClient
        .from("job_seekers")
        .select(
          `
            full_name,
            about,
            skills,
            preferred_career_track,
            experience_level,
            education_level,
            department,
            location,
            resumelink,
            resumecontext
          `
        )
        .eq("id", session.user.id)
        .single();

      if (!isMounted) {
        return;
      }

      if (profileError) {
        console.error("Failed to load profile:", profileError);
        setError("We couldn't load your profile details yet.");
        setIsLoading(false);
        return;
      }

      setProfileData({
        full_name: data?.full_name ?? "",
        about: data?.about ?? "",
        skills: Array.isArray(data?.skills) ? data.skills : [],
        preferred_career_track: data?.preferred_career_track ?? "",
        experience_level: data?.experience_level ?? "",
        education_level: data?.education_level ?? "",
        department: data?.department ?? "",
        location: data?.location ?? "",
        resumelink: data?.resumelink ?? "",
      });
      setResumecontext(data?.resumecontext ?? null);
      setIsLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!profileData.full_name.trim()) {
      errors.full_name = "Full name is required.";
    }

    if (!profileData.about.trim()) {
      errors.about = "Tell us a bit about yourself.";
    }

    if (!profileData.skills.length) {
      errors.skills = "Add at least one skill.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSkill(e.target.value);
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) {
      return;
    }

    setProfileData((prev) => {
      if (prev.skills.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }

      const updatedSkills = [...prev.skills, trimmed];
      return {
        ...prev,
        skills: updatedSkills,
      };
    });

    setNewSkill("");
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.skills;
      return next;
    });
  };

  const handleAddSkill = () => {
    addSkill(newSkill);
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(newSkill);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleExtractSkills = async () => {
    if (!resumecontext) {
      setSkillsError("Resume context is missing. Please analyze your resume first from the profile page.");
      return;
    }

    setIsExtractingSkills(true);
    setSkillsError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL;
      if (!backendUrl) {
        throw new Error("Backend service URL is not configured");
      }

      const response = await fetch(`${backendUrl}/api/extract-skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: resumecontext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to extract skills");
      }

      const data = await response.json();
      const extractedSkills = Array.isArray(data.skills) ? data.skills : [];

      // Merge extracted skills with existing skills (avoid duplicates)
      setProfileData((prev) => {
        const existingSkillsLower = prev.skills.map((s) => s.toLowerCase());
        const newSkills = extractedSkills.filter(
          (skill: string) => !existingSkillsLower.includes(skill.toLowerCase())
        );
        const mergedSkills = [...prev.skills, ...newSkills];
        return {
          ...prev,
          skills: mergedSkills,
        };
      });

      // Clear any skills validation error
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.skills;
        return next;
      });
    } catch (err) {
      console.error("Skills extraction error:", err);
      setSkillsError(
        err instanceof Error ? err.message : "Failed to extract skills. Please try again."
      );
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setResumeFile(file);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.resumelink;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session?.user) {
      setError("Your session expired. Please sign in again.");
      setIsSaving(false);
      return;
    }

    let resumeUrl = profileData.resumelink.trim();

    if (resumeFile) {
      const sanitizedFileName = resumeFile.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]+/g, "-");
      const filePath = `resumes/${session.user.id}/${Date.now()}-${sanitizedFileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("file-storage")
        .upload(filePath, resumeFile, {
          upsert: true,
          cacheControl: "3600",
          contentType: resumeFile.type,
        });

      if (uploadError) {
        console.error("Failed to upload resume:", uploadError);
        setError("We couldn't upload your resume. Please try again.");
        setIsSaving(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("file-storage").getPublicUrl(filePath);

      resumeUrl = publicUrl;
      setProfileData((prev) => ({
        ...prev,
        resumelink: publicUrl,
      }));
    }

    const { error: updateError } = await supabaseClient
      .from("job_seekers")
      .update({
        full_name: profileData.full_name.trim(),
        about: profileData.about.trim(),
        skills: profileData.skills,
        preferred_career_track: profileData.preferred_career_track.trim(),
        experience_level: profileData.experience_level.trim(),
        education_level: profileData.education_level.trim(),
        department: profileData.department.trim(),
        location: profileData.location.trim(),
        resumelink: resumeUrl,
      })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Failed to save profile:", updateError);
      setError("We couldn't save your changes. Please try again.");
      setIsSaving(false);
      return;
    }

    router.push("/candidate-dashboard/profile");
  };

  const renderFieldError = (field: string) =>
    formErrors[field] ? (
      <p className="text-sm text-red-500 mt-1">{formErrors[field]}</p>
    ) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 mx-auto text-red-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Button onClick={() => location.reload()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="sticky top-16 z-10 -mt-6 -mx-6 md:-mx-10 mb-6 p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit profile
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
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <FormSection title="About you" icon={User}>
          <Input
            label="Full name"
            id="full_name"
            name="full_name"
            value={profileData.full_name}
            onChange={handleChange}
            placeholder="e.g., Priya Das"
          />
          {renderFieldError("full_name")}

          <Textarea
            label="About you"
            id="about"
            name="about"
            value={profileData.about}
            onChange={handleChange}
            placeholder="Share your story, passions, and the kind of impact you want to make."
          />
          {renderFieldError("about")}

          <Input
            label="Location"
            id="location"
            name="location"
            value={profileData.location}
            onChange={handleChange}
            placeholder="City, country"
          />

          <Input
            label="Resume link"
            id="resumelink"
            name="resumelink"
            value={profileData.resumelink}
            onChange={handleChange}
            placeholder="https://your-resume-link.com"
          />
          <div>
            <label
              htmlFor="resume_file"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Upload resume
            </label>
            <input
              id="resume_file"
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleResumeFileChange}
              disabled={isSaving}
              className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-700 dark:file:text-gray-100"
            />
            {resumeFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected file: <span className="font-medium">{resumeFile.name}</span>
              </p>
            )}
            {profileData.resumelink && !resumeFile && (
              <p className="mt-2 text-sm">
                <a
                  href={profileData.resumelink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
                >
                  View current resume
                </a>
              </p>
            )}
          </div>
        </FormSection>

        <FormSection title="Skills" icon={Award}>
          <Input
            label="Add a skill"
            id="skills"
            name="skills"
            value={newSkill}
            onChange={handleSkillsChange}
            onKeyDown={handleSkillKeyDown}
            placeholder="e.g., React, Data Analysis, Climate Research"
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Press Enter or click add to include this skill.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              className="flex items-center gap-2"
            >
              Add skill
            </Button>
          </div>
          {renderFieldError("skills")}
          
          {resumecontext && (
            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-slate-700">
              <Button
                type="button"
                onClick={handleExtractSkills}
                disabled={isExtractingSkills}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isExtractingSkills ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting Skills...
                  </>
                ) : (
                  "Extract Skills from Resume"
                )}
              </Button>
              {skillsError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {skillsError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {profileData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-700 hover:text-indigo-900 dark:text-indigo-200 dark:hover:text-indigo-100"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </FormSection>

        <FormSection title="Additional details" icon={Briefcase}>
          <Input
            label="Preferred career track"
            id="preferred_career_track"
            name="preferred_career_track"
            value={profileData.preferred_career_track}
            onChange={handleChange}
            placeholder="Web Development, Climate Finance, UX Research..."
          />
          <Input
            label="Experience level"
            id="experience_level"
            name="experience_level"
            value={profileData.experience_level}
            onChange={handleChange}
            placeholder="Fresher, Junior, Mid, Senior"
          />
          <Input
            label="Education level"
            id="education_level"
            name="education_level"
            value={profileData.education_level}
            onChange={handleChange}
            placeholder="BSc Environmental Science, MBA, etc."
          />
          <Input
            label="Department / specialisation"
            id="department"
            name="department"
            value={profileData.department}
            onChange={handleChange}
            placeholder="Climate Analytics, Sustainability Operations..."
          />
        </FormSection>
      </form>
    </div>
  );
}
