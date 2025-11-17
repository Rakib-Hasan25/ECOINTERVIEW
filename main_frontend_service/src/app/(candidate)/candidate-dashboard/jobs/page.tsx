"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import { useRouter } from "next/navigation";

interface Job {
  id: number | string;
  job_title: string;
  company: string;
  location: string;
  required_skills: string[];
  experience_level: "Intern" | "Entry" | "Mid" | string;
  job_type: "Internship" | "Part-time" | "Full-time" | "Freelance" | string;
  description: string | null;
  created_at: string;
  company_logo?: string;
  remote?: boolean;
  apply_url?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
}

interface ExternalJob {
  job_id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  remote?: boolean;
  job_type: string;
  experience_level: string;
  posted_date: string;
  apply_url?: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  skills: string[];
  requirements?: string;
  description?: string;
  benefits?: string;
  source?: string;
  external_job_id?: string;
  external_platform?: string;
}

interface ExternalJobsResponse {
  jobs: ExternalJob[];
  platform_links?: {
    platform_name: string;
  };
  stats?: {
    returned: number;
    total: number;
    by_source?: {
      adzuna?: number;
      jsearch?: number;
      remotive?: number;
      themuse?: number;
    };
  };
  query_log?: {
    query: string;
    location: string;
    timestamp: string;
    success: boolean;
  };
}

const ITEMS_PER_PAGE = 10;

export default function JobsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");

  // Internal jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [locations, setLocations] = useState<string[]>([]);

  // External jobs state
  const [externalJobs, setExternalJobs] = useState<ExternalJob[]>([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState<string | null>(null);
  const [externalTotalCount, setExternalTotalCount] = useState(0);
  const [expandedExternalJob, setExpandedExternalJob] = useState<string | null>(null);

  // Shared filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  
  const router = useRouter();
  const supabase = createSupabaseClientSide();

  // External API base URL
  const externalApiUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL2 || 'https://unstandard-uncarved-sharika.ngrok-free.dev/api/realtime-jobs';

  // Fetch external jobs
  const fetchExternalJobs = useCallback(async () => {
    setExternalLoading(true);
    setExternalError(null);

    try {
      const params = new URLSearchParams();
      const query = searchQuery.trim() || 'developer';
      params.append('q', query);

      if (selectedLocation !== 'all') params.append('location', selectedLocation);
      if (selectedType !== 'all') {
        const typeMap: { [key: string]: string } = {
          'Full-time': 'full-time',
          'Part-time': 'part-time',
          'Internship': 'internship',
          'Freelance': 'contract'
        };
        params.append('job_type', typeMap[selectedType] || selectedType.toLowerCase());
      }
      if (selectedExperience !== 'all') {
        const expMap: { [key: string]: string } = {
          'Intern': 'entry',
          'Entry': 'entry',
          'Mid': 'senior'
        };
        params.append('experience_level', expMap[selectedExperience] || selectedExperience.toLowerCase());
      }

      const url = `${externalApiUrl}/quick-search?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Expected JSON response but got ${contentType}. Response starts with: ${responseText.substring(0, 100)}...`);
      }

      const data = await response.json();

      setExternalJobs(data.jobs || []);
      setExternalTotalCount(data.total || data.jobs?.length || 0);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch external jobs';
      console.error('Error fetching external jobs:', err);
      setExternalError(`External API Error: ${errorMessage}`);
      setExternalJobs([]);
      setExternalTotalCount(0);
    } finally {
      setExternalLoading(false);
    }
  }, [searchQuery, selectedLocation, selectedType, selectedExperience, externalApiUrl]);

  // Fetch locations for filter
  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("location")
        .order("location");

      if (!error && data) {
        const uniqueLocations = Array.from(
          new Set(data.map((item: { location: string }) => item.location))
        ) as string[];
        setLocations(uniqueLocations);
      }
    };

    fetchLocations();
  }, [supabase]);

  // Map external job to internal job format
  const mapExternalJob = (externalJob: ExternalJob): Job => {
    // Generate a numeric ID from string ID
    const numericId = externalJob.external_job_id ?
      parseInt(externalJob.external_job_id) || Math.abs(externalJob.external_job_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))
      : Math.floor(Math.random() * 1000000);

    return {
      id: numericId,
      job_title: externalJob.title,
      company: externalJob.company,
      location: externalJob.location,
      required_skills: externalJob.skills || [],
      experience_level: (externalJob.experience_level as "Intern" | "Entry" | "Mid") || "Entry",
      job_type: (externalJob.job_type as "Internship" | "Part-time" | "Full-time" | "Freelance") || "Full-time",
      description: externalJob.description || externalJob.requirements || null,
      created_at: externalJob.posted_date || new Date().toISOString(),
      company_logo: externalJob.company_logo,
      remote: externalJob.remote,
      apply_url: externalJob.apply_url,
      salary_min: externalJob.salary_min,
      salary_max: externalJob.salary_max,
      salary_currency: externalJob.salary_currency,
    };
  };

  // Fetch internal jobs with pagination and filters
  useEffect(() => {
    if (activeTab !== "internal") return;

    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("jobs")
          .select("*", { count: "exact" });

        // Apply search filter
        if (searchQuery.trim()) {
          query = query.or(
            `job_title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
          );
        }

        // Apply job type filter
        if (selectedType !== "all") {
          query = query.eq("job_type", selectedType);
        }

        // Apply experience level filter
        if (selectedExperience !== "all") {
          query = query.eq("experience_level", selectedExperience);
        }

        // Apply location filter
        if (selectedLocation !== "all") {
          query = query.eq("location", selectedLocation);
        }

        // Apply pagination
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to).order("created_at", { ascending: false });

        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        setJobs(data || []);
        setTotalCount(count || 0);
      } catch (err: any) {
        setError(err.message || "Failed to fetch jobs");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchQuery, selectedType, selectedExperience, selectedLocation, currentPage, activeTab, supabase]);

  // Fetch external jobs when external tab is active
  useEffect(() => {
    if (activeTab !== "external") return;
    fetchExternalJobs();
  }, [activeTab, fetchExternalJobs]);

  // Reset to page 1 when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedExperience, selectedLocation, activeTab]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const jobTypes = ["all", "Full-time", "Part-time", "Internship", "Freelance"];
  const experienceLevels = ["all", "Intern", "Entry", "Mid"];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-100/80 text-xs font-semibold text-emerald-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Job Search
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Find Your Dream <span className="text-emerald-600">Green Job</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover opportunities that match your skills and passion for sustainability
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-1 shadow-lg shadow-emerald-100/40">
              <nav className="flex space-x-1" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("internal")}
                  className={`py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                    activeTab === "internal"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200/50"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  Our Green Jobs
                  {totalCount > 0 && (
                    <span className={`ml-2 py-1 px-2 rounded-full text-xs ${
                      activeTab === "internal" 
                        ? "bg-white/20 text-white" 
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {totalCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("external")}
                  className={`py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                    activeTab === "external"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200/50"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  External Jobs
                  {externalTotalCount > 0 && (
                    <span className={`ml-2 py-1 px-2 rounded-full text-xs ${
                      activeTab === "external" 
                        ? "bg-white/20 text-white" 
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {externalTotalCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-emerald-100/40 mb-8">
          <div className="p-6">
            <div className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sustainable jobs, green companies, eco-friendly locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
                <svg
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Compact Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Job Type Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900 block">Job Type</label>
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map((type) => (
                      <Button
                        key={type}
                        variant={selectedType === type ? "default" : "outline"}
                        onClick={() => setSelectedType(type)}
                        size="sm"
                        className={`text-xs h-8 px-3 rounded-lg transition-all duration-300 ${
                          selectedType === type 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50" 
                            : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {type === "all" ? "All Types" : type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Experience Level Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900 block">Experience Level</label>
                  <div className="flex flex-wrap gap-2">
                    {experienceLevels.map((level) => (
                      <Button
                        key={level}
                        variant={selectedExperience === level ? "default" : "outline"}
                        onClick={() => setSelectedExperience(level)}
                        size="sm"
                        className={`text-xs h-8 px-3 rounded-lg transition-all duration-300 ${
                          selectedExperience === level 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50" 
                            : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {level === "all" ? "All Levels" : level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900 block">Location</label>
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                    <Button
                      variant={selectedLocation === "all" ? "default" : "outline"}
                      onClick={() => setSelectedLocation("all")}
                      size="sm"
                      className={`text-xs h-8 px-3 rounded-lg transition-all duration-300 ${
                        selectedLocation === "all" 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50" 
                          : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      All Locations
                    </Button>
                    {locations.slice(0, 4).map((location) => (
                      <Button
                        key={location}
                        variant={selectedLocation === location ? "default" : "outline"}
                        onClick={() => setSelectedLocation(location)}
                        size="sm"
                        className={`text-xs h-8 px-3 rounded-lg transition-all duration-300 ${
                          selectedLocation === location 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50" 
                            : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {location.length > 10 ? location.substring(0, 10) + "..." : location}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {activeTab === "internal" ? (
              <>
                Showing <span className="font-semibold text-foreground">
                  {loading ? "..." : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}`}
                </span> of <span className="font-semibold text-foreground">{totalCount}</span> job{totalCount !== 1 ? "s" : ""}
              </>
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">
                  {externalLoading ? "..." : externalJobs.length}
                </span> of <span className="font-semibold text-foreground">{externalTotalCount}</span> external job{externalTotalCount !== 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {((activeTab === "internal" && loading) || (activeTab === "external" && externalLoading)) && (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse shadow-lg">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {((activeTab === "internal" && error && !loading) || (activeTab === "external" && externalError && !externalLoading)) && (
          <Card className="shadow-lg border-red-200 bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg text-destructive mb-3 font-semibold">
                {activeTab === "external" ? "External Jobs Unavailable" : "Error Loading Jobs"}
              </p>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                {activeTab === "internal" ? error :
                  "The external job service is currently unavailable. Please try again later or check our internal job listings."}
              </p>
              {activeTab === "external" && (
                <Button
                  onClick={() => setActiveTab("internal")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  View Our Jobs Instead
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Job Listings */}
        {((activeTab === "internal" && !loading && !error) || (activeTab === "external" && !externalLoading && !externalError)) && (
          <div className="grid grid-cols-1 gap-6">
            {(activeTab === "internal" ? jobs : externalJobs.map(mapExternalJob)).length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="pt-6 text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-lg text-muted-foreground font-medium">
                    {activeTab === "external" ? "No external jobs found" : "No jobs found matching your criteria"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    {activeTab === "external"
                      ? "Try different search terms or check back later for new opportunities from external platforms."
                      : "Try adjusting your search or filters to find more opportunities."
                    }
                  </p>
                  {activeTab === "external" && (
                    <Button
                      onClick={() => setActiveTab("internal")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      View Our Jobs Instead
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              (activeTab === "internal" ? jobs : externalJobs.map(mapExternalJob)).map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-emerald-300 bg-white/95 backdrop-blur-sm shadow-lg shadow-emerald-100/20 group cursor-pointer rounded-2xl overflow-hidden"
                  onClick={() => {
                    if (activeTab === "external") {
                      // For external jobs, toggle expanded view
                      const externalJob = externalJobs.find(ej => mapExternalJob(ej).id === job.id);
                      if (externalJob) {
                        setExpandedExternalJob(
                          expandedExternalJob === externalJob.external_job_id ? null : externalJob.external_job_id
                        );
                      }
                    } else {
                      // For internal jobs, navigate to job details page
                      router.push(`/candidate-dashboard/jobs/${job.id}`);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 flex gap-3">
                        {job.company_logo && (
                          <img
                            src={job.company_logo}
                            alt={job.company}
                            className="w-12 h-12 rounded-lg object-contain border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2 group-hover:text-emerald-600 transition-colors">
                            {job.job_title}
                          </CardTitle>
                          <CardDescription className="text-lg font-semibold text-foreground">
                            {job.company}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            job.experience_level === "Intern"
                              ? "bg-emerald-100 text-emerald-800"
                              : job.experience_level === "Entry"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {job.experience_level}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(job.created_at)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.location}
                        </span>
                        {job.remote && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Remote
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {job.job_type}
                        </span>
                        {job.salary_min && job.salary_max && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.salary_currency || "$"}{job.salary_min.toLocaleString()} - {job.salary_currency || "$"}{job.salary_max.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.slice(0, 6).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.required_skills.length > 6 && (
                            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                              +{job.required_skills.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        {activeTab === "external" ? (
                          <Button
                            className="flex-1 md:flex-initial bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              const externalJob = externalJobs.find(ej => mapExternalJob(ej).id === job.id);
                              if (externalJob) {
                                setExpandedExternalJob(
                                  expandedExternalJob === externalJob.external_job_id ? null : externalJob.external_job_id
                                );
                              }
                            }}
                          >
                            {(() => {
                              const externalJob = externalJobs.find(ej => mapExternalJob(ej).id === job.id);
                              return externalJob && expandedExternalJob === externalJob.external_job_id ? 'Show Less' : 'Show More';
                            })()}
                          </Button>
                        ) : (
                          <Button
                            className="flex-1 md:flex-initial bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/candidate-dashboard/jobs/${job.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        )}
                        {job.apply_url && (
                          <Button
                            variant="outline"
                            className="flex-1 md:flex-initial border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(job.apply_url, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                      
                      {/* Expanded Content for External Jobs */}
                      {activeTab === "external" && (() => {
                        const externalJob = externalJobs.find(ej => mapExternalJob(ej).id === job.id);
                        return externalJob && expandedExternalJob === externalJob.external_job_id ? (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            {/* Full Description */}
                            {externalJob.description && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 text-foreground">Full Description</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {externalJob.description}
                                </p>
                              </div>
                            )}
                            
                            {/* Requirements */}
                            {externalJob.requirements && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 text-foreground">Requirements</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {externalJob.requirements}
                                </p>
                              </div>
                            )}
                            
                            {/* Benefits */}
                            {externalJob.benefits && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 text-foreground">Benefits</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {externalJob.benefits}
                                </p>
                              </div>
                            )}
                            
                            {/* External Source Info */}
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-emerald-700">
                                  This job is from {externalJob.source || externalJob.external_platform || 'an external platform'}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">
                                  Click "Apply on External Site" to apply directly on their platform
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (externalJob.apply_url) {
                                    window.open(externalJob.apply_url, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                              >
                                Apply on External Site →
                              </Button>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4"
            >
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    size="sm"
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

