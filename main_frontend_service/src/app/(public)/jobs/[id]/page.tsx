"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Clock, 
  Building, 
  Heart,
  Share2,
  ExternalLink,
  User,
  Calendar,
  Award,
  Target
} from "lucide-react";

interface Job {
  id: number;
  job_title: string;
  company: string;
  location: string;
  required_skills: string[];
  experience_level: "Intern" | "Entry" | "Mid";
  job_type: "Internship" | "Part-time" | "Full-time" | "Freelance";
  description: string | null;
  created_at: string;
}

interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description?: string;
  posted_date?: string;
  job_type?: string;
  experience_level?: string;
  skills?: string[];
  salary?: string;
  source?: string;
}

export default function JobDetailsPage() {
  const [job, setJob] = useState<Job | null>(null);
  const [externalJob, setExternalJob] = useState<ExternalJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isExternal, setIsExternal] = useState(false);
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseClientSide();

  useEffect(() => {
    const fetchJob = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      // Check if this is an external job (starts with "ext_")
      const jobId = params.id as string;
      if (jobId.startsWith("ext_")) {
        setIsExternal(true);
        try {
          // For external jobs, we'll store the job data in localStorage
          // when navigating from the jobs page
          const storedJob = localStorage.getItem(`external_job_${jobId}`);
          if (storedJob) {
            const parsedJob = JSON.parse(storedJob);
            setExternalJob(parsedJob);
          } else {
            throw new Error("External job data not found");
          }
        } catch (err: any) {
          setError(err.message || "Failed to fetch external job details");
          console.error("Error fetching external job:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setIsExternal(false);
        try {
          const { data, error: fetchError } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", params.id)
            .single();

          if (fetchError) {
            throw fetchError;
          }

          setJob(data);
        } catch (err: any) {
          setError(err.message || "Failed to fetch job details");
          console.error("Error fetching job:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchJob();
  }, [params.id, supabase]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get normalized job data
  const getCurrentJob = () => {
    if (isExternal && externalJob) {
      return {
        id: externalJob.id,
        job_title: externalJob.title,
        company: externalJob.company,
        location: externalJob.location,
        required_skills: externalJob.skills || [],
        experience_level: (externalJob.experience_level as "Intern" | "Entry" | "Mid") || "Entry",
        job_type: (externalJob.job_type as "Internship" | "Part-time" | "Full-time" | "Freelance") || "Full-time",
        description: externalJob.description || null,
        created_at: externalJob.posted_date || new Date().toISOString(),
        url: externalJob.url,
        salary: externalJob.salary,
        source: externalJob.source,
        isExternal: true
      };
    } else if (!isExternal && job) {
      return {
        ...job,
        url: null,
        salary: null,
        source: null,
        isExternal: false
      };
    }
    return null;
  };

  const currentJob = getCurrentJob();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="shadow-lg border-red-200 dark:border-red-800">
            <CardContent className="pt-6 text-center py-16">
              <div className="text-6xl mb-6">😞</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Job Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {error || "The job you're looking for doesn't exist or has been removed."}
              </p>
              <Button
                onClick={() => router.push("/jobs")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight">
                    {currentJob.job_title}
                  </h1>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
                      <Building className="w-5 h-5 text-blue-600" />
                      {currentJob.company}
                    </div>
                    {currentJob.isExternal && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium rounded-full">
                        External Job
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Info Tags */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  {currentJob.location}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Briefcase className="w-4 h-4" />
                  {currentJob.job_type}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  {currentJob.experience_level} Level
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4" />
                  Posted {formatDate(currentJob.created_at)}
                </div>
                {currentJob.salary && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm font-medium text-green-700 dark:text-green-300">
                    💰 {currentJob.salary}
                  </div>
                )}
                {currentJob.source && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-300">
                    🔗 {currentJob.source}
                  </div>
                )}
              </div>

              {/* Experience Level Badge */}
              <div className="inline-flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    currentJob.experience_level === "Intern"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      : currentJob.experience_level === "Entry"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                >
                  {currentJob.experience_level === "Intern"
                    ? "Perfect for New Graduates"
                    : currentJob.experience_level === "Entry"
                    ? "0-2 Years Experience"
                    : "2-5 Years Experience"}
                </span>
              </div>
            </div>

            {/* Job Description */}
            {currentJob.description && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Job Description
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                    {currentJob.description}
                  </p>
                </div>
              </div>
            )}

            {/* Required Skills */}
            {currentJob.required_skills && currentJob.required_skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  Required Skills
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentJob.required_skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 sticky top-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Ready to Apply?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Take the next step in your career
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => {
                    if (currentJob.isExternal && currentJob.url) {
                      window.open(currentJob.url, '_blank');
                    } else {
                      // Add internal apply functionality
                      console.log('Apply to internal job:', currentJob.id);
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {currentJob.isExternal ? 'Apply on External Site' : 'Apply Now'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Job'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: currentJob.job_title,
                        text: `Check out this ${currentJob.job_title} position at ${currentJob.company}`,
                        url: window.location.href
                      });
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Job Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Job Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">Job Type</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {currentJob.job_type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Experience</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {currentJob.experience_level}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Location</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {currentJob.location}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Posted</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(currentJob.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                About {currentJob.company}
              </h3>
              {currentJob.isExternal && currentJob.source && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Source:</strong> {currentJob.source}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {currentJob.isExternal 
                  ? "This is an external job posting from another platform. Click 'Apply on External Site' to view the full details and apply directly on their website."
                  : currentJob.job_type === "Full-time"
                  ? "This company offers full-time positions with comprehensive benefits and growth opportunities."
                  : currentJob.job_type === "Part-time"
                  ? "This company provides flexible part-time opportunities with work-life balance."
                  : currentJob.job_type === "Internship"
                  ? "This company offers valuable internship programs for students and new graduates."
                  : "This company provides freelance opportunities with flexible schedules."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

