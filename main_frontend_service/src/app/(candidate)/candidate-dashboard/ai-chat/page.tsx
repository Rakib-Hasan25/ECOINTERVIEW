"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import ProfessionalAIChatScreen from "@/components/ai_chat_screen";
import { Loader2 } from "lucide-react";

export default function AIChatPage() {
  const supabaseClient = useMemo(() => createSupabaseClientSide(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [resumeContext, setResumeContext] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
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
        setError("You are not signed in. Please sign in to access AI Chat.");
        setIsLoading(false);
        return;
      }

      // Fetch resume context from job_seekers table
      const { data, error: profileError } = await supabaseClient
        .from("job_seekers")
        .select("resumecontext")
        .eq("id", session.user.id)
        .single();

      // console.log("resume sdffdsfdsf",data?.resumecontext)

      if (!isMounted) {
        return;
      }

      if (profileError) {
        console.error("Failed to load resume context:", profileError);
        // Continue even if resume context is not available
        setResumeContext(null);
      } else {
        setResumeContext(data?.resumecontext || null);
      }

      // Use user ID as unique_id for the chat
      setUniqueId(session.user.id);
      console.log(session.user.id, "session.user.id");
      setIsLoading(false);
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-100/80 text-xs font-semibold text-emerald-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.41-2.1L3 21l2.9-4.59A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            AI Assistant
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-slate-600">Initializing your AI career advisor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-lg shadow-emerald-100/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 bg-red-100/80 text-xs font-semibold text-red-700 mx-auto">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Error
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Something went wrong
          </h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!uniqueId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-lg shadow-emerald-100/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-amber-100/80 text-xs font-semibold text-amber-700 mx-auto">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Initialization Issue
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Unable to initialize chat
          </h2>
          <p className="text-slate-600">
            Please refresh the page to try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col overflow-hidden">
        {/* Compact Header */}
        <div className="mb-4 text-center space-y-2 flex-shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-100/80 text-xs font-semibold text-emerald-700">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.41-2.1L3 21l2.9-4.59A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            AI Career Advisor
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Chat with Your <span className="text-emerald-600">AI Assistant</span>
          </h1>
        </div>

        {/* Chat Container - takes remaining height */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg shadow-emerald-100/20 overflow-hidden">
          <ProfessionalAIChatScreen
            unique_id={uniqueId}
            content=""
            resume_context={resumeContext || ""}
          />
        </div>
      </div>
    </div>
  );
}

