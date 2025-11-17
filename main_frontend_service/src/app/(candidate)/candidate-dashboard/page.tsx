"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";

type JobSeekerProfile = {
  id: string;
  full_name: string | null;
  preferred_career_track: string | null;
  experience_level: string | null;
  education_level: string | null;
  department: string | null;
  resumelink: string | null;
  location: string | null;
  about: string | null;
  skills: string[];
  created_at: string | null;
  email: string | null;
};

type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  description: string;
};

export default function CandidateDashboardPage() {
  const supabaseClient = useMemo(() => createSupabaseClientSide(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError) {
        console.error("Failed to get session:", sessionError);
        setError("Unable to verify your session. Please sign in again.");
        setIsLoading(false);
        return;
      }

      if (!session?.user) {
        setError("You are not signed in. Please sign in to view your dashboard.");
        setIsLoading(false);
        return;
      }

      const { data, error: profileError } = await supabaseClient
        .from("job_seekers")
        .select(
          `
            id,
            full_name,
            about,
            skills,
            preferred_career_track,
            experience_level,
            education_level,
            department,
            resumelink,
            location,
            created_at,
            users!inner (
              email
            )
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

      const userEmail = Array.isArray(data?.users)
        ? data?.users?.[0]?.email ?? null
        : (data?.users as { email?: string } | null)?.email ?? null;

      setProfile({
        id: session.user.id,
        email: userEmail ?? session.user.email ?? null,
        full_name: data?.full_name ?? null,
        preferred_career_track: data?.preferred_career_track ?? null,
        experience_level: data?.experience_level ?? null,
        education_level: data?.education_level ?? null,
        department: data?.department ?? null,
        resumelink: data?.resumelink ?? null,
        location: data?.location ?? null,
        about: data?.about ?? null,
        skills: Array.isArray(data?.skills) ? data.skills : [],
        created_at: data?.created_at ?? null,
      });

      setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  const getProfileCompleteness = (profile: JobSeekerProfile | null) => {
    if (!profile) return 0;
    const fieldsToCheck: (keyof JobSeekerProfile)[] = [
      "full_name",
      "about",
      "skills",
      "preferred_career_track",
      "experience_level",
      "education_level",
      "department",
      "location",
      "resumelink",
    ];
    const filled = fieldsToCheck.reduce((count, field) => {
      const value = profile[field];
      if (Array.isArray(value)) {
        return value.length > 0 ? count + 1 : count;
      }
      return value && value.toString().trim().length > 0 ? count + 1 : count;
    }, 0);

    return Math.round((filled / fieldsToCheck.length) * 100);
  };

  const profileCompleteness = getProfileCompleteness(profile);

  const nextSteps: UpcomingEvent[] = [
    {
      id: "profile",
      title: profileCompleteness >= 90 ? "Profile looking strong!" : "Complete your profile",
      date: profileCompleteness >= 90 ? "Keep it fresh" : "Finish remaining sections",
      description:
        profileCompleteness >= 90
          ? "Stay active on the platform so recruiters see the latest version of you."
          : "Add more details to your profile to help employers discover you faster.",
    },
    {
      id: "resume",
      title: profile?.resumelink ? "Resume ready to share" : "Upload your resume",
      date: profile?.resumelink ? "Last uploaded resume available" : "Upload to get noticed",
      description: profile?.resumelink
        ? "Your resume is stored securely. Share it with employers directly from your profile."
        : "Make it easy for recruiters to learn more about you by uploading your resume.",
    },
    {
      id: "skills",
      title: profile?.skills.length ? "Skills spotlight" : "Add your skills",
      date: profile?.skills.length ? `${profile.skills.length} skill${profile.skills.length > 1 ? "s" : ""} listed` : "Highlight your strengths",
      description: profile?.skills.length
        ? "Consider adding specific tools, frameworks, or areas of expertise relevant to your goals."
        : "Add skills to show what you bring to the table and improve your matches.",
    },
  ];

  const primaryStatCards = [
    {
      id: "completeness",
      label: "Profile completeness",
      value: `${profileCompleteness}%`,
      icon: Target,
      caption:
        profileCompleteness >= 80
          ? "Nice! Your profile is nearly complete."
          : "Add a few more details to boost visibility.",
    },
    {
      id: "resume-status",
      label: "Resume",
      value: profile?.resumelink ? "Uploaded" : "Missing",
      icon: FileText,
      caption: profile?.resumelink
        ? "Your resume link is visible to recruiters."
        : "Upload a resume to strengthen your profile.",
    },
    {
      id: "skills",
      label: "Skills listed",
      value: profile?.skills.length ? profile.skills.length.toString() : "0",
      icon: Sparkles,
      caption: profile?.skills.length
        ? "Consider prioritising your strongest skills."
        : "Add skills so we can personalise recommendations.",
    },
  ];

  const recommendedJobs = (profile?.skills.slice(0, 3) ?? []).map((skill, index) => ({
    id: `skill-${index}`,
    title: `${skill} Specialist`,
    company: "Suggested Match",
    location: profile?.location ?? "Global",
    skill,
  }));

  const scheduledInterviews: UpcomingEvent[] = [
    {
      id: "interview-placeholder",
      title: "No interviews scheduled yet",
      date: "Use your profile to attract opportunities",
      description:
        "Once you start applying to roles, your interview schedule will appear here automatically.",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-slate-600 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <AlertBanner
            title="Something went wrong"
            message={error}
            actionLabel="Try again"
            onAction={() => location.reload()}
          />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <AlertBanner
            title="Profile not ready"
            message="We couldn't find your profile yet. Please complete onboarding to access the dashboard."
            actionLabel="Complete profile"
            actionHref="/candidate-dashboard/profile/edit"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]" 
           style={{
             backgroundImage: `radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)`,
             backgroundSize: '40px 40px'
           }}>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10 px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in-up">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-100/80 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3 w-3" />
              Your dashboard
            </div>
            <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">
              Hi {profile.full_name ? profile.full_name.split(" ")[0] : "there"}! 👋
            </h1>
            <p className="text-slate-600 text-lg">
              {profile.preferred_career_track
                ? `You're tracking roles in ${profile.preferred_career_track}.`
                : "Let us know the roles you're exploring to tailor your matches."}
            </p>
          </div>
          <Link
            href="/candidate-dashboard/profile/edit"
            className="inline-flex items-center gap-2 self-start bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-200/50"
          >
            <User className="h-4 w-4" />
            Update profile
          </Link>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {primaryStatCards.map((card, index) => (
            <div key={card.id} style={{animationDelay: `${0.3 + index * 0.1}s`}}>
              <StatCard {...card} />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-emerald-100/40 hover:shadow-xl hover:shadow-emerald-100/60 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Quick profile recap
                </h2>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileDetail label="Career focus" value={profile.preferred_career_track} />
                <ProfileDetail label="Experience level" value={profile.experience_level} />
                <ProfileDetail label="Education" value={profile.education_level} />
                <ProfileDetail label="Department" value={profile.department} />
                <ProfileDetail label="Location" value={profile.location} />
                <ProfileDetail
                  label="Resume"
                  value={
                    profile.resumelink ? (
                      <a
                        href={profile.resumelink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 underline font-medium transition-colors"
                      >
                        View resume
                      </a>
                    ) : (
                      null
                    )
                  }
                  placeholder="Upload your resume to share with recruiters"
                />
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-emerald-100/40 overflow-hidden hover:shadow-xl hover:shadow-emerald-100/60 transition-all duration-500">
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 bg-emerald-50/50">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Upcoming & next steps
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Stay ahead by keeping an eye on important actions.
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-emerald-500" />
              </div>
              <ul className="divide-y divide-slate-200">
                {nextSteps.map((step) => (
                  <li key={step.id} className="px-8 py-6 hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                    <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{step.title}</p>
                    <p className="text-sm text-emerald-600 mt-1 font-medium">{step.date}</p>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{step.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-emerald-100/40 overflow-hidden hover:shadow-xl hover:shadow-emerald-100/60 transition-all duration-500">
              <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200 bg-emerald-50/50">
                <h2 className="text-xl font-semibold text-slate-900">
                  Interview schedule
                </h2>
                <Clock className="h-5 w-5 text-emerald-500" />
              </div>
              <ul className="divide-y divide-slate-200">
                {scheduledInterviews.map((event) => (
                  <li key={event.id} className="px-6 py-6 hover:bg-emerald-50/30 transition-colors">
                    <p className="font-semibold text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{event.date}</p>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{event.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-emerald-100/40 overflow-hidden hover:shadow-xl hover:shadow-emerald-100/60 transition-all duration-500">
              <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200 bg-emerald-50/50">
                <h2 className="text-xl font-semibold text-slate-900">
                  Recommended for you
                </h2>
                <Briefcase className="h-5 w-5 text-emerald-500" />
              </div>
              {recommendedJobs.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {recommendedJobs.map((job) => (
                    <li key={job.id} className="px-6 py-6 hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                      <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {job.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {job.company}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          {job.skill}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-8 text-sm text-slate-500 text-center">
                  Add skills to start receiving personalised job suggestions.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: React.ElementType;
}) {
  return (
    <div className="group animate-fade-in-up">
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg shadow-emerald-100/40 group-hover:shadow-xl group-hover:shadow-emerald-100/60 group-hover:-translate-y-1 transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6 text-emerald-600" />
          </div>
          <span className="text-3xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300">
            {value}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
          {label}
        </p>
        <p className="text-sm text-slate-500 leading-relaxed">{caption}</p>
      </div>
    </div>
  );
}

function ProfileDetail({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="group">
      <dt className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{label}</dt>
      <dd className="text-base text-slate-900 mt-2 group-hover:text-emerald-700 transition-colors duration-300">
        {value ?? (
          <span className="text-sm text-slate-400 italic">
            {placeholder ?? "Add this to your profile"}
          </span>
        )}
      </dd>
    </div>
  );
}

function AlertBanner({
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-emerald-100/40 space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
        <Sparkles className="h-8 w-8 text-emerald-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-slate-600 leading-relaxed">{message}</p>
      </div>
      {actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-200/50"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-200/50"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
