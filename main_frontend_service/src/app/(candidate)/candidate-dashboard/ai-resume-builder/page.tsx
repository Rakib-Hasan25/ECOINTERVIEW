"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle,
  RefreshCw,
  User,
  Brain,
  X,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Target,
  Globe,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import { useResumeBuilder } from "@/hooks/useResumeBuilder";
import { TemplateGenerator } from "@/lib/resume/template-generator";
import { EnhancedResume } from "@/lib/resume/types";

interface UserResumeData {
  id: string;
  full_name: string;
  resumelink: string | null;
  education_level: string | null;
  department: string | null;
  experience_level: string | null;
  preferred_career_track: string | null;
  resumeContext?: string | null;
}

export type { UserResumeData };

export default function AIResumeBuilder() {
  const [previewTemplate, setPreviewTemplate] = useState<number | null>(null);
  const [userResumeData, setUserResumeData] = useState<UserResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [resumeSuggestions, setResumeSuggestions] = useState<{
    professional_summary: string;
    suggestions: string[];
    bullet_points: string[];
  } | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<{
    detailed_analysis: string;
    improvements: Array<{
      category: string;
      priority: string;
      issue: string;
      recommendation: string;
      impact: string;
    }>;
  } | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const supabase = createSupabaseClientSide();

  // Use our modular resume builder hook
  const resumeBuilder = useResumeBuilder({
    openaiApiKey: process.env.NEXT_PUBLIC_OPENAI_KEY || '',
    onProgress: (step) => setProgressMessage(step),
    onError: (error) => setError(error)
  });

  // Extract state from hook
  const {
    isProcessing,
    extractedText,
    enhancedResume,
    enhancedResumes,
    enhancementResult,
    currentStep,
    enhanceResume,
    isEnhanced,
    hasExtractedText,
    hasMultipleVariations
  } = resumeBuilder;

  // Fetch user resume data from Supabase
  useEffect(() => {
    const fetchUserResumeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error("Failed to get user session");
        }

        if (!session?.user) {
          throw new Error("User not authenticated");
        }

        // Fetch user resume data from job_seekers table (including resumecontext)
        const { data: resumeData, error: resumeError } = await supabase
          .from('job_seekers')
          .select('id, full_name, resumelink, education_level, department, experience_level, preferred_career_track, resumecontext')
          .eq('id', session.user.id)
          .single();

        if (resumeError) {
          throw new Error("Failed to fetch resume data: " + resumeError.message);
        }

        // Combine the data
        const fullResumeData = {
          ...resumeData,
          resumeContext: resumeData?.resumecontext || null
        };

        if (!fullResumeData) {
          throw new Error("No resume data found");
        }

        console.log('📊 Full resume data with context:', fullResumeData);
        setUserResumeData(fullResumeData);
        
        // Extract filename from resume URL if available
        if (fullResumeData.resumelink) {
          const urlParts = fullResumeData.resumelink.split('/');
          const fileName = urlParts[urlParts.length - 1];
          setResumeFileName(fileName || 'resume.pdf');
        }

      } catch (err) {
        console.error('Error fetching resume data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resume data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserResumeData();
  }, [supabase]);

  // Handle AI enhancement using our modular system
  const handleStartAnalysis = async () => {
    if (!userResumeData?.resumelink) {
      setError("No resume found to analyze");
      return;
    }

    try {
      setError(null);
      
      console.log('🚀 Starting AI Enhancement Process...');
      const result = await enhanceResume(userResumeData);
      
      console.log('✅ AI Enhancement Complete!');
      console.log('📄 Original Text:', result.original.substring(0, 200) + '...');
      console.log('🤖 Enhanced Resume:', result.enhanced);
      console.log('💡 Improvements:', result.improvements);
      console.log('📊 Score:', result.score);
      
    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    }
  };

  // Handle resume suggestions generation
  const handleGenerateSuggestions = async () => {
    if (!userResumeData?.resumeContext || !userResumeData?.preferred_career_track) {
      setSuggestionsError("Resume context and preferred career track are required");
      return;
    }

    setIsLoadingSuggestions(true);
    setSuggestionsError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL;
      if (!backendUrl) {
        throw new Error("Backend service URL is not configured");
      }

      const response = await fetch(`${backendUrl}/api/generate-resume-suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_context: userResumeData.resumeContext,
          preferred_career_track: userResumeData.preferred_career_track,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate suggestions");
      }

      const data = await response.json();
      setResumeSuggestions(data);
    } catch (err) {
      console.error('❌ Suggestions error:', err);
      setSuggestionsError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle portfolio analysis
  const handleAnalyzePortfolio = async () => {
    if (!portfolioUrl || !portfolioUrl.trim()) {
      setPortfolioError("Please enter a portfolio URL");
      return;
    }

    setIsLoadingPortfolio(true);
    setPortfolioError(null);
    setPortfolioAnalysis(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MAIN_BACKEND_SERVICE_URL;
      if (!backendUrl) {
        throw new Error("Backend service URL is not configured");
      }

      const response = await fetch(`${backendUrl}/api/analyze-portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolio_url: portfolioUrl.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze portfolio");
      }

      const data = await response.json();
      setPortfolioAnalysis(data);
    } catch (err) {
      console.error('❌ Portfolio analysis error:', err);
      setPortfolioError(err instanceof Error ? err.message : 'Failed to analyze portfolio');
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  // Use templates from our modular system
  const templates = TemplateGenerator.templates;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-100/80 text-xs font-semibold text-emerald-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h.01M12 12h.01M15 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AI-Powered Builder
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Build Your Perfect <span className="text-emerald-600">Resume</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Enhance your resume with AI-powered suggestions and download in professional templates
          </p>
        </div>

        {/* Current Resume Section */}
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg shadow-emerald-100/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <User className="w-5 h-5 text-emerald-600" />
            Your Current Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mr-3" />
              <span className="text-slate-600">Loading your resume...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">{error}</span>
              </div>
            </div>
          ) : !userResumeData?.resumelink ? (
            <div className="p-6 text-center bg-emerald-50/50 rounded-lg">
              <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-medium text-slate-900 mb-2">No Resume Found</h3>
              <p className="text-sm text-slate-600">
                Please upload your resume to your profile first.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">
                    {resumeFileName || `${userResumeData.full_name}_Resume.pdf`}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {userResumeData.experience_level || 'Experience level not specified'} • {userResumeData.department || 'Department not specified'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEnhanced && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Enhanced</span>
                  </div>
                )}
                <Button
                  onClick={handleStartAnalysis}
                  disabled={isProcessing || !userResumeData.resumelink}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50 disabled:bg-gray-400 rounded-lg"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {currentStep || "Processing..."}
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      {isEnhanced ? "Re-enhance" : "Enhance with AI"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {isEnhanced && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Resume enhanced successfully with AI</span>
              </div>
            </div>
          )}

          {/* AI Improvement Suggestions */}
          {isEnhanced && enhancementResult?.improvements && (
            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  AI-Powered Improvements Applied
                </span>
              </div>
              <div className="space-y-2">
                {enhancementResult.improvements.slice(0, 4).map((improvement, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-700">
                      {improvement}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <p className="text-xs text-emerald-600 font-medium">
                  ✨ Each template below showcases these enhancements with different styles
                </p>
              </div>
            </div>
          )}

          {/* Resume Suggestions Section */}
          {userResumeData?.resumeContext && userResumeData?.preferred_career_track && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    AI Resume Suggestions
                  </h3>
                </div>
                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={isLoadingSuggestions}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50 disabled:bg-gray-400 rounded-lg"
                >
                  {isLoadingSuggestions ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Get Suggestions
                    </>
                  )}
                </Button>
              </div>

              {suggestionsError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{suggestionsError}</span>
                  </div>
                </div>
              )}

              {resumeSuggestions && (
                <div className="space-y-4">
                  {/* Professional Summary */}
                  {resumeSuggestions.professional_summary && (
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 rounded-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <User className="w-4 h-4 text-emerald-600" />
                          Professional Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {resumeSuggestions.professional_summary}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Suggestions */}
                  {resumeSuggestions.suggestions && resumeSuggestions.suggestions.length > 0 && (
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Lightbulb className="w-4 h-4 text-amber-600" />
                          Improvement Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {resumeSuggestions.suggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-semibold text-amber-700">{idx + 1}</span>
                              </div>
                              <p className="text-sm text-slate-700 flex-1">
                                {suggestion}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Bullet Points */}
                  {resumeSuggestions.bullet_points && resumeSuggestions.bullet_points.length > 0 && (
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 rounded-xl">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Target className="w-4 h-4 text-emerald-600" />
                          Strong Bullet Points
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Use these impactful bullet points for your projects and work experience
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2.5">
                          {resumeSuggestions.bullet_points.map((bullet, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-emerald-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                              <p className="text-sm text-slate-700 flex-1">
                                {bullet}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        </Card>

      {/* Portfolio Analysis Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Globe className="w-5 h-5 text-indigo-600" />
            Portfolio Analysis
          </CardTitle>
          <CardDescription>
            Get AI-powered recommendations to improve your portfolio website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Portfolio URL Input */}
            <div className="flex gap-3">
              <Input
                type="url"
                placeholder="https://yourportfolio.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoadingPortfolio) {
                    handleAnalyzePortfolio();
                  }
                }}
                className="flex-1"
                disabled={isLoadingPortfolio}
              />
              <Button
                onClick={handleAnalyzePortfolio}
                disabled={isLoadingPortfolio || !portfolioUrl.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-400"
              >
                {isLoadingPortfolio ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            {/* Error Message */}
            {portfolioError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">{portfolioError}</span>
                </div>
              </div>
            )}

            {/* Portfolio Analysis Results */}
            {portfolioAnalysis && (
              <div className="space-y-4 mt-6">
                {/* Detailed Analysis */}
                {portfolioAnalysis.detailed_analysis && (
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Detailed Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {portfolioAnalysis.detailed_analysis}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Improvements */}
                {portfolioAnalysis.improvements && portfolioAnalysis.improvements.length > 0 && (
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        Improvement Recommendations
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {portfolioAnalysis.improvements.length} recommendations to enhance your portfolio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {portfolioAnalysis.improvements.map((improvement, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-amber-100 dark:border-amber-800/50"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    improvement.priority === 'high'
                                      ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                      : improvement.priority === 'medium'
                                      ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  {improvement.priority.toUpperCase()}
                                </span>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {improvement.category}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                  Issue
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {improvement.issue}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                  Recommendation
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {improvement.recommendation}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                  Expected Impact
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {improvement.impact}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates Section */}
      {!isLoading && userResumeData?.resumelink && (isEnhanced || !isProcessing) && (
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Resume Templates
            </h2>
            <p className="text-slate-600 text-sm">
              Select a template and download your {isEnhanced ? 'AI-enhanced' : ''} resume as PDF
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm border border-slate-200 hover:border-emerald-300 rounded-xl">
                <CardContent className="p-0">
                  {/* Template Preview */}
                  <div className={`h-48 ${template.preview} relative group border-b`}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white"
                          onClick={() => setPreviewTemplate(template.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    
                    {/* Template-specific resume content */}
                    <div className="absolute top-3 left-3 right-3">
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded p-2 text-xs">
                        <div className="font-bold mb-1">
                          {(hasMultipleVariations && enhancedResumes[template.id - 1]?.name) || enhancedResume?.name || userResumeData?.full_name || "Your Name"}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 mb-2 text-xs">
                          {(hasMultipleVariations && enhancedResumes[template.id - 1]?.title) || enhancedResume?.title || userResumeData?.preferred_career_track || userResumeData?.department || "Professional"}
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                          <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-3">
                      {template.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setPreviewTemplate(template.id)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50 text-xs rounded-lg"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-[9999] p-4" onClick={(e) => e.target === e.currentTarget && setPreviewTemplate(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {templates.find(t => t.id === previewTemplate)?.name} Template Preview
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] [&::-webkit-scrollbar]:hidden"
                 style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg mx-auto max-w-2xl">
                {/* Enhanced Resume Content for Selected Template */}
                <div className="p-8 space-y-6">
                  {/* Header - Uses template-specific variation */}
                  {(() => {
                    const templateResume = hasMultipleVariations && enhancedResumes[previewTemplate - 1] 
                      ? enhancedResumes[previewTemplate - 1] 
                      : enhancedResume;
                    
                    return (
                      <div className="text-center border-b pb-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {templateResume?.name || userResumeData?.full_name || "Your Name"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                          {templateResume?.title || userResumeData?.preferred_career_track || "Professional"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {templateResume?.contact?.email || "contact@email.com"} • 
                          {templateResume?.contact?.phone || "+1 (555) 123-4567"}
                          {templateResume?.contact?.location && ` • ${templateResume.contact.location}`}
                        </p>
                      </div>
                    );
                  })()}
                  
                  {/* Professional Summary - Template-specific */}
                  {(() => {
                    const templateResume = hasMultipleVariations && enhancedResumes[previewTemplate - 1] 
                      ? enhancedResumes[previewTemplate - 1] 
                      : enhancedResume;
                    
                    return templateResume?.summary ? (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional Summary</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          {templateResume.summary}
                        </p>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Experience - Template-specific */}
                  {(() => {
                    const templateResume = hasMultipleVariations && enhancedResumes[previewTemplate - 1] 
                      ? enhancedResumes[previewTemplate - 1] 
                      : enhancedResume;
                    
                    return templateResume?.experience && templateResume.experience.length > 0 ? (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Experience</h2>
                        <div className="space-y-4">
                          {templateResume.experience.map((exp, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">{exp.title}</h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{exp.duration}</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{exp.company}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{exp.description}</p>
                              {exp.achievements && (
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                                  {exp.achievements.map((achievement, i) => (
                                    <li key={i}>• {achievement}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Education - Template-specific */}
                  {(() => {
                    const templateResume = hasMultipleVariations && enhancedResumes[previewTemplate - 1] 
                      ? enhancedResumes[previewTemplate - 1] 
                      : enhancedResume;
                    
                    return templateResume?.education && templateResume.education.length > 0 ? (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Education</h2>
                        <div className="space-y-3">
                          {templateResume.education.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{edu.degree}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{edu.school}</p>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">{edu.year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Skills - Template-specific */}
                  {(() => {
                    const templateResume = hasMultipleVariations && enhancedResumes[previewTemplate - 1] 
                      ? enhancedResumes[previewTemplate - 1] 
                      : enhancedResume;
                    
                    const skills = templateResume?.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'];
                    
                    return (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Projects - Template-specific (if available) */}
                  {(() => {
                    const templateResume = hasMultipleVariations && enhancedResumes[previewTemplate - 1] 
                      ? enhancedResumes[previewTemplate - 1] 
                      : enhancedResume;
                    
                    return templateResume?.projects && templateResume.projects.length > 0 ? (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Projects</h2>
                        <div className="space-y-3">
                          {templateResume.projects.map((project, idx) => (
                            <div key={idx}>
                              <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{project.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Technologies: {project.technologies.join(', ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This is a preview of how your {isEnhanced ? 'AI-enhanced' : ''} resume will look in this template.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50 rounded-lg">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}