
'use client'
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from 'clsx';
import {
  User,
  MapPin,
  Briefcase,
  Award,
  Download,
  Pencil,
  Loader2,
  AlertCircle,
  FileText,
  Bot,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import "katex/dist/katex.min.css";


interface CodeBlockProps {
  children: string;
  className?: string;
}

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
    <section className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 m-4">
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

function stripFence(input: string | null | undefined) {
  if (!input) return input ?? "";
  const trimmed = input.trim();
  const fenceMatch = trimmed.match(/^```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```$/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return trimmed;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const language = className?.replace('language-', '') || 'plaintext';

  return (
    <div className="group relative my-4 m-8">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="rounded-md bg-slate-800/90 dark:bg-slate-700/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700/50">
          {language}
        </span>
        <button
          className="rounded-md p-1.5 bg-slate-800/90 dark:bg-slate-700/90 backdrop-blur-sm text-slate-300 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700/50 transition-colors"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="mt-0 overflow-x-auto rounded-xl bg-slate-900 dark:bg-slate-950 p-4 text-sm border border-slate-800/50 shadow-lg">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
const ChatMessage = ({ type, content }: { type: any; content: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex mb-4 ${type === "user" ? "justify-end" : "justify-start"
        }`}
    >
      <div className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${type === "user" ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${type === "user"
          ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
          : "bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 shadow-lg"
          }`}>
          {type === "user" ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 break-words rounded-2xl shadow-lg ${type === "user"
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm"
            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
            }`}
        >
          {type !== "user" ? (
            <div className={clsx([
              'prose prose-slate dark:prose-invert max-w-none',
              'prose-p:my-2 prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-200',
              'prose-headings:border-b prose-headings:border-slate-200 dark:prose-headings:border-slate-700 prose-headings:pb-2 prose-headings:text-slate-900 dark:prose-headings:text-slate-100',
              'prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-3 prose-th:text-left prose-th:font-semibold',
              'prose-td:p-3 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700',
              'prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700',
              '[&_table]:mt-0 [&_table]:rounded-lg [&_table]:overflow-hidden',
              'prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline',
              'prose-strong:text-slate-900 dark:prose-strong:text-slate-100',
              'prose-code:text-indigo-600 dark:prose-code:text-indigo-400',
            ])}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  pre: ({ children }) => <>{children}</>,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !className?.includes('language-');
                    if (className?.includes('math')) {
                      return <code {...props} className={className}>{children}</code>;
                    }
                    return !isInline && match ? (
                      <CodeBlock className={className}>{String(children).replace(/\n$/, '')}</CodeBlock>
                    ) : (
                      <code {...props} className="rounded-md bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 text-sm font-mono text-indigo-600 dark:text-indigo-400">
                        {children}
                      </code>
                    );
                  },
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
                      <table>{children}</table>
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CandidateProfilePage() {
  const supabaseClient = useMemo(() => createSupabaseClientSide(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    id: string;
    email: string | null;
    full_name: string | null;
    preferred_career_track: string | null;
    experience_level: string | null;
    education_level: string | null;
    department: string | null;
    resumelink: string | null;
    resumecontext: string | null;
    location: string | null;
    about: string | null;
    skills: string[];
    created_at: string | null;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [dataReceived, setDataReceived] = useState(false);

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
          setError("You are not signed in. Please sign in to view your profile.");
          setIsLoading(false);
        }
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
            resumecontext,
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
        resumecontext: data?.resumecontext ?? null,
        location: data?.location ?? null,
        about: data?.about ?? null,
        skills: Array.isArray(data?.skills) ? data.skills : [],
        created_at: data?.created_at ?? null,
      });
      setAnalysisResult(data?.resumecontext ?? null);
      setIsLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  // Effect to show dummy logs during PDF processing
  useEffect(() => {
    if (!isAnalyzing || dataReceived) {
      setProcessingLogs([]);
      return;
    }

    const logs = [
      "resume is downloaded",
      "resume data analyzing",
      "resume data analyzed",
      "ready to response"
    ];

    const timeouts: NodeJS.Timeout[] = [];

    logs.forEach((log, index) => {
      const timeout = setTimeout(() => {
        if (!dataReceived) {
          setProcessingLogs((prev) => [...prev, log]);
        }
      }, (index + 1) * 4000); // 4 seconds for each log
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [isAnalyzing, dataReceived]);

  const renderPlaceholder = (text: string) => (
    <span className="text-gray-400 italic dark:text-gray-500">{text}</span>
  );

  const handleResumeAnalysis = async () => {
    if (!profile?.resumelink || !profile?.id) {
      setAnalysisError("Resume link or profile ID is missing");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setDataReceived(false);
    setProcessingLogs([]);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL;
      if (!backendUrl) {
        throw new Error("Backend service URL is not configured");
      }

      const response = await fetch(`${backendUrl}/api/get-resume-context`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileurl: profile.resumelink,
          filetype: "pdf",
          chatId: profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data = await response.json();
      const context = data.context || data.message || "Analysis completed";

      // Mark data as received to stop showing logs
      setDataReceived(true);
      setAnalysisResult(context);
      setProfile((prev) => (prev ? { ...prev, resumecontext: context } : prev));

      const { error: updateError } = await supabaseClient
        .from("job_seekers")
        .update({ resumecontext: context })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Failed to store resume analysis:", updateError);
        throw new Error("Resume analyzed but storing the result failed. Please try again.");
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      setDataReceived(true); // Stop logs on error too
      setAnalysisError(
        err instanceof Error ? err.message : "Failed to analyze resume. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };



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
          We hit a snag
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Button onClick={() => location.reload()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 mx-auto text-indigo-500" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Profile not ready
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          We couldn't find your profile yet. Please complete your onboarding or contact support if you believe this is a mistake.
        </p>
        <Button asChild>
          <Link href="/candidate-dashboard/profile/edit">Complete profile</Link>
        </Button>
      </div>
    );
  }

  const displayAnalysis = analysisResult ?? profile?.resumecontext ?? null;
  const resolvedAnalysis =
    typeof displayAnalysis === "string"
      ? displayAnalysis
      : displayAnalysis
        ? JSON.stringify(displayAnalysis, null, 2)
        : null;
  const markdownAnalysis = resolvedAnalysis
    ? stripFence(resolvedAnalysis)
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-8">
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {profile.full_name ||
                renderPlaceholder("Add your full name in profile settings")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {profile.preferred_career_track ||
                renderPlaceholder("Share your preferred career track")}
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-500 mt-1">
              <MapPin className="h-4 w-4" />{" "}
              {profile.location || renderPlaceholder("Add your location")}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {profile.email ||
                renderPlaceholder("Your email will appear here once available")}
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-2 mt-4 sm:mt-0">
            {profile.resumelink ? (
              <a
                href={profile.resumelink}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
            ) : (
              <Link
                href="/candidate-dashboard/profile/edit"
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                Upload CV
              </Link>
            )}
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

      <ProfileSection title="About" icon={User}>
        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
          {profile.about ||
            renderPlaceholder(
              "Tell us about yourself, your goals, and passions"
            )}
        </p>
      </ProfileSection>

      <ProfileSection title="Skills" icon={Award}>
        {profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          renderPlaceholder(
            "Add the skills you feel confident using so companies can discover you"
          )
        )}
      </ProfileSection>

      <ProfileSection title="Core Details" icon={Briefcase}>
        <div className="flex flex-wrap gap-2">
          <DetailPill label="Preferred track" value={profile.preferred_career_track} />
          <DetailPill label="Experience level" value={profile.experience_level} />
          <DetailPill label="Education level" value={profile.education_level} />
          <DetailPill label="Department" value={profile.department} />
          <DetailPill label="Resume link" value={profile.resumelink} isLink />
          <DetailPill
            label="Profile created"
            value={
              profile.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : null
            }
          />
        </div>
      </ProfileSection>

      {profile.resumelink && (
        <ProfileSection title="Resume Analysis" icon={FileText}>
          {!analysisResult && !isAnalyzing && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Get insights about your resume. Click the button below to analyze your uploaded resume.
              </p>
              <Button
                onClick={handleResumeAnalysis}
                disabled={isAnalyzing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Analyze Resume
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-gray-600 dark:text-gray-400">
                Analyzing your resume...
              </p>
              {processingLogs.length > 0 && !dataReceived && (
                <div className="w-full max-w-md mt-4 space-y-2">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="space-y-2">
                      {processingLogs.map((log, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {analysisError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Analysis Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {analysisError}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResumeAnalysis}
                disabled={isAnalyzing}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}

          {markdownAnalysis && !isAnalyzing && (
            <div className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                    Analysis Result
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAnalysisExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-200 hover:text-indigo-900 dark:hover:text-white transition-colors"
                  >
                    {isAnalysisExpanded ? "Hide details" : "Show details"}
                    {isAnalysisExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {isAnalysisExpanded && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line space-y-4">
                    <div
                      className={clsx([
                        "prose prose-slate dark:prose-invert max-w-none",
                        "prose-p:my-2 prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-200",
                        "prose-headings:border-b prose-headings:border-slate-200 dark:prose-headings:border-slate-700 prose-headings:pb-2 prose-headings:text-slate-900 dark:prose-headings:text-slate-100",
                        "prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-3 prose-th:text-left prose-th:font-semibold",
                        "prose-td:p-3 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700",
                        "prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700",
                        "[&_table]:mt-0 [&_table]:rounded-lg [&_table]:overflow-hidden",
                        "prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline",
                        "prose-strong:text-slate-900 dark:prose-strong:text-slate-100",
                        "prose-code:text-indigo-600 dark:prose-code:text-indigo-400",
                      ])}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          pre: ({ children }) => <>{children}</>,
                          code: ({ node, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || "");
                            const isInline = !className?.includes("language-");
                            if (className?.includes("math")) {
                              return (
                                <code {...props} className={className}>
                                  {children}
                                </code>
                              );
                            }
                            return !isInline && match ? (
                              <CodeBlock className={className}>
                                {String(children).replace(/\n$/, "")}
                              </CodeBlock>
                            ) : (
                              <code
                                {...props}
                                className="rounded-md bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 text-sm font-mono text-indigo-600 dark:text-indigo-400"
                              >
                                {children}
                              </code>
                            );
                          },
                          table: ({ children }) => (
                            <div className="my-4 overflow-x-auto rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
                              <table>{children}</table>
                            </div>
                          ),
                        }}
                      >
                        {markdownAnalysis}
                      </ReactMarkdown>
                    </div>
                    {/* {resolvedAnalysis && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <p className="font-semibold uppercase tracking-wide text-[10px] text-gray-400 dark:text-gray-500">
                          Raw output
                        </p>
                        <pre className="mt-2 rounded-md bg-slate-900/5 dark:bg-slate-900 p-3 text-[11px] leading-relaxed overflow-x-auto border border-slate-200 dark:border-slate-800">
                          {resolvedAnalysis}
                        </pre>
                      </div>
                    )} */}
                  </div>
                )}
              </div>
              <Button
                onClick={handleResumeAnalysis}
                disabled={isAnalyzing}
                variant="outline"
              >
                Re-analyze Resume
              </Button>
            </div>
          )}
        </ProfileSection>
      )}

      <ProfileSection title="What's next?" icon={Briefcase}>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Keep your profile up to date so employers can learn about your strengths.
          Add more details from the edit profile page whenever you are ready.
        </p>
        <Button asChild className="mt-4">
          <Link href="/candidate-dashboard/profile/edit">Update profile</Link>
        </Button>
      </ProfileSection>
    </div>
  );
}

function DetailPill({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string | null;
  isLink?: boolean;
}) {
  if (!value) {
    return (
      <span className="bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-gray-500 text-sm font-medium px-3 py-1 rounded-full">
        {label}: fill this in your profile
      </span>
    );
  }

  if (isLink) {
    return (
      <Link
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
      >
        {label}: View
      </Link>
    );
  }

  return (
    <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 text-sm font-medium px-3 py-1 rounded-full">
      {label}: {value}
    </span>
  );
}
