"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FileText,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Rocket,
  TrendingUp,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BookOpen,
  Award,
  Briefcase,
  Zap,
  BarChart3,
  ChevronDown,
  Play,
  Youtube,
  Download,
} from "lucide-react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import jsPDF from "jspdf";

type SkillGap = {
  skill: string;
  priority: "high" | "medium" | "low";
  description?: string;
};

type RoadmapPhase = {
  phase: string;
  duration: string;
  milestones: string[];
  skills: string[];
};

type SkillGapAnalysis = {
  currentSkills: string[];
  missingSkills: SkillGap[];
  recommendations: string[];
  generated: boolean;
};

type Roadmap = {
  topic_to_learn: string[];
  plan: string[][];
  projectideas: string[];
  applyon: string;
  timeframe: string;
  generated: boolean;
};

type YouTubeVideo = {
  title: string;
  url: string;
  img_src?: string;
  iframe_src?: string;
};

type TopicVideos = {
  [topic: string]: YouTubeVideo[];
};

export default function CareerRoadmapPage() {
  const router = useRouter();
  const supabaseClient = useMemo(() => createSupabaseClientSide(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeContext, setResumeContext] = useState<string | null>(null);
  const [hasResumeContext, setHasResumeContext] = useState(false);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [timeframe, setTimeframe] = useState("6");
  const [targetRole, setTargetRole] = useState("");
  const [showRoadmapForm, setShowRoadmapForm] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [detailedAnalysis, setDetailedAnalysis] = useState<string>("");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [topicVideos, setTopicVideos] = useState<TopicVideos>({});
  const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
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
          setError("You are not signed in. Please sign in to access your career roadmap.");
          setIsLoading(false);
        }
        return;
      }

      const { data, error: profileError } = await supabaseClient
        .from("job_seekers")
        .select("resumecontext, preferred_career_track, skills, experience_level, skillgaps")
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

      const context = data?.resumecontext;
      setResumeContext(context);
      setHasResumeContext(!!context && context.trim().length > 0);
      setTargetRole(data?.preferred_career_track || "");
      setExperienceLevel(data?.experience_level || "");

      // Load skillgaps from database (priority) or localStorage (fallback)
      if (data?.skillgaps && data.skillgaps.trim().length > 0) {
        setDetailedAnalysis(data.skillgaps);
        // Mark as generated if we have skillgaps from database
        const analysis: SkillGapAnalysis = {
          currentSkills: Array.isArray(data?.skills) ? data.skills : [],
          missingSkills: [],
          recommendations: [],
          generated: true,
        };
        setSkillGapAnalysis(analysis);
      } else {
        // Fallback to localStorage if no database entry
        const savedAnalysis = localStorage.getItem(`skillGapAnalysis_${session.user.id}`);
        const savedDetailedAnalysis = localStorage.getItem(`detailedAnalysis_${session.user.id}`);
        
        if (savedAnalysis) {
          try {
            setSkillGapAnalysis(JSON.parse(savedAnalysis));
          } catch (e) {
            console.error("Failed to parse saved analysis:", e);
          }
        }

        if (savedDetailedAnalysis) {
          setDetailedAnalysis(savedDetailedAnalysis);
        }
      }

      // Load saved roadmap from localStorage
      const savedRoadmap = localStorage.getItem(`roadmap_${session.user.id}`);
      if (savedRoadmap) {
        try {
          setRoadmap(JSON.parse(savedRoadmap));
        } catch (e) {
          console.error("Failed to parse saved roadmap:", e);
        }
      }

      // Load saved topic videos from localStorage
      const savedVideos = localStorage.getItem(`topicVideos_${session.user.id}`);
      if (savedVideos) {
        try {
          setTopicVideos(JSON.parse(savedVideos));
        } catch (e) {
          console.error("Failed to parse saved videos:", e);
        }
      }

      setIsLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  const handleSkillGapAnalysis = async () => {
    if (!resumeContext) {
      setError("Resume context is required for skill gap analysis.");
      return;
    }

    if (!targetRole || !targetRole.trim()) {
      setError("Please set your preferred career track in your profile.");
      return;
    }

    if (!experienceLevel || !experienceLevel.trim()) {
      setError("Please set your experience level in your profile.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.user) {
        throw new Error("Session expired. Please sign in again.");
      }

      const backendUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL;
      if (!backendUrl) {
        throw new Error("Backend service URL is not configured");
      }

      // Call skill gap analysis API with correct body format
      const response = await fetch(`${backendUrl}/api/analyze-skill-gaps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_context: resumeContext,
          career_track: targetRole,
          experience_level: experienceLevel,
          user_id: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze skill gaps");
      }

      const data = await response.json();

      // Get the detailed_analysis from response
      const analysisText = data.detailed_analysis || "";
      setDetailedAnalysis(analysisText);

      // Also update skill gap analysis state for compatibility
      const { data: profileData } = await supabaseClient
        .from("job_seekers")
        .select("skills")
        .eq("id", session.user.id)
        .single();

      const analysis: SkillGapAnalysis = {
        currentSkills: Array.isArray(profileData?.skills) ? profileData.skills : [],
        missingSkills: [],
        recommendations: [],
        generated: true,
      };

      setSkillGapAnalysis(analysis);
      
      // Note: skillgaps is now stored in database by the backend, so we don't need to save to localStorage
      // But we keep it for backward compatibility
      localStorage.setItem(`skillGapAnalysis_${session.user.id}`, JSON.stringify(analysis));
      localStorage.setItem(`detailedAnalysis_${session.user.id}`, analysisText);
      setShowRoadmapForm(true);
    } catch (err) {
      console.error("Skill gap analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze skill gaps. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!detailedAnalysis || !targetRole.trim()) {
      setError("Please complete skill gap analysis and enter your target role.");
      return;
    }

    setIsGeneratingRoadmap(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.user) {
        throw new Error("Session expired. Please sign in again.");
      }

      const backendUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL;
      if (!backendUrl) {
        throw new Error("Backend service URL is not configured");
      }

      // Call the new career roadmap generation API
      const response = await fetch(`${backendUrl}/api/generate-career-roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill_gaps: detailedAnalysis,
          preferred_career_track: targetRole,
          timeframe: `${timeframe} months`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate roadmap");
      }

      const data = await response.json();

      // Transform API response to our format
      const generatedRoadmap: Roadmap = {
        topic_to_learn: data.topic_to_learn || [],
        plan: data.plan || [],
        projectideas: data.projectideas || [],
        applyon: data.applyon || "",
        timeframe: `${timeframe} months`,
        generated: true,
      };

      setRoadmap(generatedRoadmap);
      localStorage.setItem(`roadmap_${session.user.id}`, JSON.stringify(generatedRoadmap));
      setShowRoadmapForm(false);
    } catch (err) {
      console.error("Roadmap generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate roadmap. Please try again.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const fetchYouTubeVideos = async (topic: string) => {
    // Check if videos are already loaded
    if (topicVideos[topic] && topicVideos[topic].length > 0) {
      toggleTopic(topic);
      return;
    }

    // Check if already loading
    if (loadingVideos.has(topic)) {
      return;
    }

    setLoadingVideos((prev) => new Set(prev).add(topic));

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL;
      if (!backendUrl) {
        throw new Error("Backend service URL is not configured");
      }

      // YouTube API route
      // Expected request body: { query: string }
      // Expected response: Array with single video: [{ title, url, img_src, iframe_src }]
      const youtubeApiRoute = `${backendUrl}/api/youtube-search`;

      const response = await fetch(youtubeApiRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: topic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch YouTube videos");
      }

      const data = await response.json();
      
      // Handle different response formats
      let videos: YouTubeVideo[] = [];
      if (Array.isArray(data)) {
        videos = data;
      } else if (data.videos && Array.isArray(data.videos)) {
        videos = data.videos;
      } else if (data.result && Array.isArray(data.result)) {
        videos = data.result;
      }

      // Update state
      const newTopicVideos = {
        ...topicVideos,
        [topic]: videos,
      };
      setTopicVideos(newTopicVideos);

      // Save to localStorage
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (session?.user) {
        localStorage.setItem(`topicVideos_${session.user.id}`, JSON.stringify(newTopicVideos));
      }

      // Expand the topic
      setExpandedTopics((prev) => new Set(prev).add(topic));
    } catch (err) {
      console.error("Error fetching YouTube videos:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch learning resources");
    } finally {
      setLoadingVideos((prev) => {
        const newSet = new Set(prev);
        newSet.delete(topic);
        return newSet;
      });
    }
  };

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topic)) {
        newSet.delete(topic);
      } else {
        newSet.add(topic);
      }
      return newSet;
    });
  };

  const isTopicExpanded = (topic: string) => {
    return expandedTopics.has(topic);
  };

  const getVideoIdFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleDownloadPDF = () => {
    if (!roadmap) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
      checkPageBreak(fontSize + 5);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * (fontSize * 0.4) + 5;
    };

    // Title
    doc.setTextColor(75, 85, 99); // Gray-600
    addText("Career Roadmap", 24, true, [75, 85, 99]);
    yPosition += 5;

    // Target Role and Timeframe
    addText(`Target Role: ${targetRole}`, 14, true, [99, 102, 241]); // Indigo
    addText(`Timeframe: ${roadmap.timeframe}`, 12, false, [107, 114, 128]);
    addText(`Apply On: ${roadmap.applyon}`, 12, false, [34, 197, 94]); // Green
    yPosition += 10;

    // Topics to Learn Section
    checkPageBreak(30);
    addText("Topics to Learn", 18, true, [99, 102, 241]);
    yPosition += 3;
    
    roadmap.topic_to_learn.forEach((topic, index) => {
      checkPageBreak(10);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81); // Gray-700
      doc.text(`${index + 1}. ${topic}`, margin + 5, yPosition);
      yPosition += 7;
    });
    yPosition += 5;

    // Learning Plan Section
    checkPageBreak(30);
    addText("Learning Plan", 18, true, [139, 92, 246]); // Purple
    yPosition += 3;

    roadmap.plan.forEach((phase, phaseIndex) => {
      checkPageBreak(25);
      
      // Phase Header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text(`Phase ${phaseIndex + 1}`, margin, yPosition);
      yPosition += 8;

      // Phase Topics
      phase.forEach((topic, topicIndex) => {
        checkPageBreak(10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
        doc.text(`  • ${topic}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    });

    // Project Ideas Section
    checkPageBreak(30);
    addText("Project Ideas", 18, true, [34, 197, 94]); // Green
    yPosition += 3;

    roadmap.projectideas.forEach((project, index) => {
      checkPageBreak(15);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      
      const projectLines = doc.splitTextToSize(`${index + 1}. ${project}`, maxWidth - 10);
      doc.text(projectLines, margin + 5, yPosition);
      yPosition += projectLines.length * 5 + 3;
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // Gray-400
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin - 20,
        pageHeight - 10
      );
    }

    // Generate filename
    const filename = `Career_Roadmap_${targetRole.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    
    // Save PDF
    doc.save(filename);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading your career roadmap...</p>
        </div>
      </div>
    );
  }

  if (error && !hasResumeContext) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <CardTitle className="text-red-900 dark:text-red-100">Something went wrong</CardTitle>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => location.reload()} variant="outline">
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show upload resume message if resume context is not available
  if (!hasResumeContext) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-3">
            <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume Required</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Upload and analyze your resume to unlock personalized career insights and roadmap generation.
          </p>
        </div>

        <Card className="border border-gray-200 dark:border-slate-700">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Follow these steps to begin your career journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Go to Profile Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Navigate to your profile edit page to upload your resume
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Upload Your Resume</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload your resume file (PDF, DOC, or image format)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Resume Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your resume will be automatically analyzed to extract key information
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => router.push("/candidate-dashboard/profile/edit")}
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <FileText className="h-5 w-5 mr-2" />
                Go to Profile Settings
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Roadmap</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze your skills and create a personalized career development plan
        </p>
      </div>

      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Gap Analysis Section */}
      <Card className="border border-gray-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle>Skill Gap Analysis</CardTitle>
                <CardDescription>Identify skills you need to develop for your target role</CardDescription>
              </div>
            </div>
            {skillGapAnalysis?.generated && (
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                Completed
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!skillGapAnalysis?.generated ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Generate a detailed skill gap analysis to understand what skills you need to develop for your career goals.
                </p>
              </div>
              <Button
                onClick={handleSkillGapAnalysis}
                disabled={isAnalyzing}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Skills...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Skill Gap Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Detailed Analysis */}
              {detailedAnalysis && (
                <div className="p-6 rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Detailed Skill Gap Analysis
                    </h3>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {detailedAnalysis.split('\n').map((paragraph, index) => {
                        if (paragraph.trim() === '') return <br key={index} />;
                        return (
                          <p key={index} className="mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Current Skills */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Your Current Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGapAnalysis.currentSkills.length > 0 ? (
                    skillGapAnalysis.currentSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No skills listed</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button
                  onClick={handleSkillGapAnalysis}
                  variant="outline"
                  size="sm"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Re-analyzing...
                    </>
                  ) : (
                    "Re-analyze Skills"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roadmap Generation Section */}
      {skillGapAnalysis?.generated && (
        <Card className="border border-gray-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Personalized Career Roadmap</CardTitle>
                  <CardDescription>Create a step-by-step plan to achieve your career goals</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {roadmap?.generated && (
                  <>
                    <Button
                      onClick={handleDownloadPDF}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                      Generated
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!roadmap?.generated ? (
              <div className="space-y-6">
                {!showRoadmapForm ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        Now that you've analyzed your skills, create a personalized roadmap with a custom timeframe.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowRoadmapForm(true)}
                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      Create Personalized Roadmap
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Target Role
                        </label>
                        <input
                          type="text"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="e.g., Senior Frontend Developer"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Timeframe (months)
                        </label>
                        <select
                          value={timeframe}
                          onChange={(e) => setTimeframe(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="3">3 months</option>
                          <option value="6">6 months</option>
                          <option value="9">9 months</option>
                          <option value="12">12 months</option>
                          <option value="18">18 months</option>
                          <option value="24">24 months</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleGenerateRoadmap}
                        disabled={isGeneratingRoadmap || !targetRole.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {isGeneratingRoadmap ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Roadmap...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Roadmap
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowRoadmapForm(false)}
                        variant="outline"
                        disabled={isGeneratingRoadmap}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Target Role</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{targetRole}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Timeframe</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{roadmap.timeframe}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Apply On</p>
                    </div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">{roadmap.applyon}</p>
                  </div>
                </div>

                {/* All Topics to Learn */}
                {roadmap.topic_to_learn && roadmap.topic_to_learn.length > 0 && (
                  <Card className="border border-gray-200 dark:border-slate-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <CardTitle>Topics to Learn</CardTitle>
                          <CardDescription>All topics you need to master for your career track</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {roadmap.topic_to_learn.map((topic, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learning Plan by Phases */}
                {roadmap.plan && roadmap.plan.length > 0 && (
                  <Card className="border border-gray-200 dark:border-slate-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Rocket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle>Learning Plan</CardTitle>
                          <CardDescription>Structured phases to guide your learning journey</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {roadmap.plan.map((phase, index) => (
                        <div
                          key={index}
                          className="p-5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900/50"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Phase {index + 1}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {phase.length} topic{phase.length !== 1 ? 's' : ''} to cover
                              </p>
                            </div>
                          </div>

                          <div className="ml-16">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-indigo-600" />
                              Topics in this Phase
                            </h4>
                            <div className="space-y-2">
                              {phase.map((topic, tIndex) => {
                                const isExpanded = isTopicExpanded(topic);
                                const isLoading = loadingVideos.has(topic);
                                const videos = topicVideos[topic] || [];
                                const hasVideos = videos.length > 0;

                                return (
                                  <div
                                    key={tIndex}
                                    className="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
                                  >
                                    {/* Topic Header */}
                                    <div className="flex items-center justify-between gap-3 p-3">
                                      <div className="flex items-start gap-3 flex-1">
                                        <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                                          {topic}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {hasVideos && (
                                          <>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                              <Youtube className="h-3 w-3" />
                                              {videos.length}
                                            </span>
                                            <button
                                              onClick={() => toggleTopic(topic)}
                                              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                                              aria-label={isExpanded ? "Collapse videos" : "Expand videos"}
                                            >
                                              {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 rotate-180 transition-transform" />
                                              ) : (
                                                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform" />
                                              )}
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Get Learning Resources Button - Only show when no videos */}
                                    {!hasVideos && !isLoading && (
                                      <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-3">
                                        <button
                                          onClick={() => fetchYouTubeVideos(topic)}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors border border-indigo-200 dark:border-indigo-800"
                                        >
                                          <Youtube className="h-4 w-4" />
                                          <span>Get Learning Resources</span>
                                        </button>
                                      </div>
                                    )}

                                    {/* Videos Dropdown */}
                                    {isExpanded && hasVideos && (
                                      <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Youtube className="h-4 w-4 text-red-600 dark:text-red-400" />
                                          <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Learning Resource
                                          </h5>
                                        </div>
                                        <div className="space-y-3">
                                          {videos.map((video, vIndex) => {
                                            // Use iframe_src if available, otherwise extract from URL
                                            const embedUrl = video.iframe_src || (() => {
                                              const videoId = getVideoIdFromUrl(video.url);
                                              return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
                                            })();

                                            return (
                                              <div
                                                key={vIndex}
                                                className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm"
                                              >
                                                {embedUrl ? (
                                                  <div>
                                                    <div className="aspect-video w-full bg-black">
                                                      <iframe
                                                        src={embedUrl}
                                                        title={video.title}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                      />
                                                    </div>
                                                    <div className="p-3 bg-white dark:bg-slate-800">
                                                      <h6 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                                        {video.title}
                                                      </h6>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <a
                                                    href={video.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                                  >
                                                    <div className="flex items-start gap-3">
                                                      {video.img_src ? (
                                                        <img
                                                          src={video.img_src}
                                                          alt={video.title}
                                                          className="w-32 h-20 object-cover rounded"
                                                        />
                                                      ) : (
                                                        <div className="w-32 h-20 bg-red-600 rounded flex items-center justify-center">
                                                          <Play className="h-8 w-8 text-white" />
                                                        </div>
                                                      )}
                                                      <div className="flex-1">
                                                        <h6 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                                                          {video.title}
                                                        </h6>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                          <Youtube className="h-3 w-3" />
                                                          <span>Watch on YouTube</span>
                                                          <ArrowRight className="h-3 w-3" />
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </a>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Loading State */}
                                    {isLoading && (
                                      <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-4">
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                                          <span>Fetching learning resources...</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Project Ideas */}
                {roadmap.projectideas && roadmap.projectideas.length > 0 && (
                  <Card className="border border-gray-200 dark:border-slate-700">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle>Project Ideas</CardTitle>
                          <CardDescription>Practical projects to reinforce your learning</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {roadmap.projectideas.map((project, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{project}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex gap-3">
                  <Button
                    onClick={async () => {
                      const { data: { session } } = await supabaseClient.auth.getSession();
                      if (session?.user) {
                        localStorage.removeItem(`roadmap_${session.user.id}`);
                      }
                      setRoadmap(null);
                      setShowRoadmapForm(true);
                    }}
                    variant="outline"
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Regenerate Roadmap
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
