"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";

interface LearningResource {
  id: number;
  title: string;
  platform: string;
  url: string;
  related_skills: string;
  cost_indicator: "Free" | "Paid" | "Free (Audit) / Paid (Certificate)";
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function LearningPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedCost, setSelectedCost] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const supabase = createSupabaseClientSide();

  // Fetch platforms for filter
  useEffect(() => {
    const fetchPlatforms = async () => {
      const { data, error } = await supabase
        .from("learning_resources")
        .select("platform")
        .order("platform");

      if (!error && data) {
        const uniquePlatforms = Array.from(
          new Set(data.map((item: { platform: string }) => item.platform))
        ) as string[];
        setPlatforms(uniquePlatforms);
      }
    };

    fetchPlatforms();
  }, [supabase]);

  // Fetch resources with pagination and filters
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("learning_resources")
          .select("*", { count: "exact" });

        // Apply search filter
        if (searchQuery.trim()) {
          query = query.or(
            `title.ilike.%${searchQuery}%,related_skills.ilike.%${searchQuery}%`
          );
        }

        // Apply platform filter
        if (selectedPlatform !== "all") {
          query = query.eq("platform", selectedPlatform);
        }

        // Apply cost filter
        if (selectedCost !== "all") {
          query = query.eq("cost_indicator", selectedCost);
        }

        // Apply pagination
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to).order("created_at", { ascending: false });

        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        setResources(data || []);
        setTotalCount(count || 0);
      } catch (err: any) {
        setError(err.message || "Failed to fetch learning resources");
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [supabase, searchQuery, selectedPlatform, selectedCost, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlatform, selectedCost]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const costOptions = [
    "all",
    "Free",
    "Paid",
    "Free (Audit) / Paid (Certificate)",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-100/80 text-xs font-semibold text-emerald-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Learning Resources
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Enhance Your <span className="text-emerald-600">Green Skills</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover courses and learning materials to advance your sustainability and environmental career
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg shadow-emerald-100/40 mb-8">
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by title or related skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Platform Filter */}
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Platform</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedPlatform === "all" ? "default" : "outline"}
                      onClick={() => setSelectedPlatform("all")}
                      size="sm"
                      className={`text-xs h-8 px-3 rounded-lg transition-all duration-300 ${
                        selectedPlatform === "all" 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50" 
                          : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      All Platforms
                    </Button>
                    {platforms.map((platform) => (
                      <Button
                        key={platform}
                        variant={selectedPlatform === platform ? "default" : "outline"}
                        onClick={() => setSelectedPlatform(platform)}
                        size="sm"
                        className={`text-xs h-8 px-3 rounded-lg transition-all duration-300 ${
                          selectedPlatform === platform 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50" 
                            : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Cost Filter */}
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Cost</label>
                  <div className="flex flex-wrap gap-2">
                    {costOptions.map((cost) => (
                      <Button
                        key={cost}
                        variant={selectedCost === cost ? "default" : "outline"}
                        onClick={() => setSelectedCost(cost)}
                        size="sm"
                        className={`text-xs h-8 px-3 rounded-lg transition-all duration-300 capitalize ${
                          selectedCost === cost 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50" 
                            : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {cost === "all" ? "All Costs" : cost}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">
              {loading ? "..." : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}`}
            </span> of <span className="font-semibold text-foreground">{totalCount}</span> resource{totalCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/95 backdrop-blur-sm shadow-lg shadow-emerald-100/20 rounded-2xl">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg shadow-emerald-100/20 rounded-2xl">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-lg text-destructive mb-2">Error loading resources</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Resource Listings */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6">
            {resources.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg shadow-emerald-100/20 rounded-2xl">
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No resources found matching your criteria. Try adjusting your search or filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              resources.map((resource) => {
                const skills = resource.related_skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0);

                return (
                  <Card key={resource.id} className="hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-emerald-300 bg-white/95 backdrop-blur-sm shadow-lg shadow-emerald-100/20 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2 group-hover:text-emerald-600 transition-colors">{resource.title}</CardTitle>
                          <CardDescription className="text-base font-medium text-foreground">
                            {resource.platform}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              resource.cost_indicator === "Free"
                                ? "bg-emerald-100 text-emerald-800"
                                : resource.cost_indicator === "Paid"
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-200 text-emerald-900"
                            }`}
                          >
                            {resource.cost_indicator}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            className="flex-1 md:flex-initial bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50 rounded-xl"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            Visit Resource
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
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
                    className={`min-w-[40px] ${
                      currentPage === pageNum 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
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
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

