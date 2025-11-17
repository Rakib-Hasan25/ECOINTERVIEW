"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, Clock } from "lucide-react";

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
  job_title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level?: string;
  description: string;
  skills?: string[];
  salary_min?: number;
  salary_max?: number;
  remote?: boolean;
  apply_url: string;
  posted_date: string;
  source: string;
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

  // Shared filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const router = useRouter();
  const supabase = createSupabaseClientSide();

  // External API base URL
  const externalApiUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL2 || 'https://unstandard-uncarved-sharika.ngrok-free.dev/api/realtime-jobs';

  // Map external job to internal job format
  const mapExternalJob = (externalJob: ExternalJob): Job => {
    // Generate a numeric ID from string ID
    const numericId = externalJob.id ?
      parseInt(externalJob.id) || Math.abs(externalJob.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))
      : Math.floor(Math.random() * 1000000);

    return {
      id: numericId,
      job_title: externalJob.job_title,
      company: externalJob.company,
      location: externalJob.location,
      required_skills: externalJob.skills || [],
      experience_level: (externalJob.experience_level as "Intern" | "Entry" | "Mid") || "Entry",
      job_type: (externalJob.job_type as "Internship" | "Part-time" | "Full-time" | "Freelance") || "Full-time",
      description: externalJob.description,
      created_at: externalJob.posted_date
    };
  };

  // Fetch external jobs
  const fetchExternalJobs = useCallback(async () => {
    setExternalLoading(true);
    setExternalError(null);

    try {
      const params = new URLSearchParams();
      // Default search query if none provided
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
        params.append('job_type', typeMap[selectedType] || selectedType);
      }
      if (selectedExperience !== 'all') {
        const expMap: { [key: string]: string } = {
          'Entry': 'entry',
          'Mid': 'mid',
          'Intern': 'entry'
        };
        params.append('experience_level', expMap[selectedExperience] || selectedExperience);
      }
      params.append('limit', '20'); // Get more results for external

      const url = `${externalApiUrl}/quick-search?${params.toString()}`;
      console.log('Fetching external jobs from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
        mode: 'cors',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Non-JSON response:', responseText.substring(0, 500));
        throw new Error(`Expected JSON response but got ${contentType}. Response starts with: ${responseText.substring(0, 100)}...`);
      }

      const data = await response.json();
      console.log('External API response:', data);

      setExternalJobs(data.jobs || []);
      setExternalTotalCount(data.total || data.jobs?.length || 0);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch external jobs';
      console.error('Error fetching external jobs:', err);
      setExternalError(`External API Error: ${errorMessage}`);

      // Set empty results on error
      setExternalJobs([]);
      setExternalTotalCount(0);
    } finally {
      setExternalLoading(false);
    }
  }, [searchQuery, selectedLocation, selectedType, selectedExperience, externalApiUrl]);

  // Fetch locations for filter (internal jobs only)
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
  }, [supabase, searchQuery, selectedType, selectedExperience, selectedLocation, currentPage, activeTab]);

  // Fetch external jobs when external tab is active or filters change
  useEffect(() => {
    if (activeTab !== "external") return;
    fetchExternalJobs();
  }, [activeTab, fetchExternalJobs]);

  // Reset to page 1 when filters change or tab changes
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">
            Find Your Dream Job
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {activeTab === "internal" ? totalCount : externalTotalCount} open positions from {activeTab === "internal" ? "our platform" : "external platforms"}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("internal")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "internal"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                Our Platform Jobs
                {totalCount > 0 && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-0.5 px-2.5 rounded-full text-xs">
                    {totalCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("external")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "external"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
              >
                External Platform Jobs
                {externalTotalCount > 0 && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-0.5 px-2.5 rounded-full text-xs">
                    {externalTotalCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeTab === "internal" ? (
                  <>
                    Showing <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {loading ? "..." : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}`}
                    </span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{totalCount}</span> job{totalCount !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>
                    Showing <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {externalLoading ? "..." : externalJobs.length}
                    </span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{externalTotalCount}</span> external job{externalTotalCount !== 1 ? "s" : ""}
                  </>
                )}
              </p>
            </div>

            {/* Loading State */}
            {(activeTab === "internal" ? loading : externalLoading) && (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse shadow-sm">
                    <CardHeader>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        <div className="flex gap-2 mt-4">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {((activeTab === "internal" && error && !loading) || (activeTab === "external" && externalError && !externalLoading)) && (
              <Card className="shadow-sm border-red-200 dark:border-red-800">
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
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View Our Jobs Instead
                    </Button>
                  )}
                  {activeTab === "internal" && (
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Job Listings */}
            {((activeTab === "internal" && !loading && !error) || (activeTab === "external" && !externalLoading && !externalError)) && (
              <div className="space-y-4">
                {(activeTab === "internal" ? jobs : externalJobs.map(mapExternalJob)).length === 0 ? (
                  <Card className="shadow-sm">
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
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Browse Our Jobs
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  (activeTab === "internal" ? jobs : externalJobs.map(mapExternalJob)).map((job) => (
                    <Card
                      key={job.id}
                      className={`hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600 group cursor-pointer ${activeTab === "external" ? "hover:border-l-green-500" : ""
                        }`}
                      title="Click to view job details"
                      onClick={() => {
                        if (activeTab === "external") {
                          // For external jobs, store job data and navigate to details page
                          const externalJob = externalJobs.find(ej => mapExternalJob(ej).id === job.id);
                          if (externalJob) {
                            // Store the external job data in localStorage
                            const extJobId = `ext_${externalJob.id}`;
                            localStorage.setItem(`external_job_${extJobId}`, JSON.stringify({
                              id: externalJob.id,
                              title: externalJob.job_title,
                              company: externalJob.company,
                              location: externalJob.location,
                              url: externalJob.apply_url,
                              description: externalJob.description,
                              posted_date: externalJob.posted_date,
                              job_type: externalJob.job_type,
                              experience_level: externalJob.experience_level,
                              skills: externalJob.skills,
                              salary: externalJob.salary_min,
                              source: externalJob.source,
                            }));
                            // Navigate to details page with external job ID
                            router.push(`/jobs/${extJobId}`);
                          }
                        } else {
                          // For internal jobs, navigate to job details page
                          router.push(`/jobs/${job.id}`);
                        }
                      }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {job.job_title}
                            </CardTitle>
                            <CardDescription className="text-base font-semibold text-gray-700 dark:text-gray-300">
                              {job.company}
                              {activeTab === "external" && (
                                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                  ({externalJobs.find(ej => mapExternalJob(ej).id === job.id)?.source})
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${job.experience_level === "Intern"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : job.experience_level === "Entry"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                }`}
                            >
                              {job.experience_level}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(job.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
                              <Briefcase className="w-3 h-3" />
                              {job.job_type}
                            </span>
                            {activeTab === "external" && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-green-600 dark:text-green-300">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                External Link
                              </span>
                            )}
                          </div>
                          {job.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {job.description}
                            </p>
                          )}
                          {job.required_skills && job.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {job.required_skills.slice(0, 4).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.required_skills.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                  +{job.required_skills.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Pagination - Only for internal jobs */}
            {activeTab === "internal" && !loading && !error && totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
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
                        className="w-8 h-8 p-0"
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
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Filters Sidebar */}
          <div className="w-80">
            <Card className="shadow-sm sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Type Filter */}
                <div>
                  <label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">Job Type</label>
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedType === type
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {type === "all" ? "All Types" : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level Filter */}
                <div>
                  <label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">Experience Level</label>
                  <div className="space-y-2">
                    {experienceLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedExperience(level)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedExperience === level
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {level === "all" ? "All Levels" : level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">Location</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedLocation("all")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLocation === "all"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      All Locations
                    </button>
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLocation === location
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedExperience("all");
                    setSelectedLocation("all");
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

