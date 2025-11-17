// FILE: src/app/(candidate)/layout.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Menu,
  X,
  User,
  Sun,
  Moon,
  PanelLeftClose, // <-- ADDED
  PanelRightClose,
  Book, // <-- ADDED
  MessageCircle,
} from "lucide-react";
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side";
import { Button } from "@/components/ui/button";

// --- Simple Theme Toggle Button ---
// This is a self-contained component that manages its own state
// and applies the theme to the whole page.
function SimpleThemeToggle() {
  // 1. Start with 'light' theme by default
  const [theme, setTheme] = useState("light");

  // 2. On initial load, check localStorage for a saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    // We also check if the user's system prefers dark mode
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme("dark"); // Set to dark if system prefers it and no theme is saved
    }
  }, []); // This empty array means it only runs once on load

  // 3. Whenever the 'theme' state changes, update the <html> tag and localStorage
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark"); // This is what Tailwind looks for
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]); // This runs every time 'theme' changes

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {/* Show the correct icon based on the current theme */}
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
// --- End Theme Toggle ---

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false); // For mobile overlay
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop collapse
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<{
    full_name: string | null;
    preferred_career_track: string | null;
  } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabaseClient = useMemo(() => createSupabaseClientSide(), []);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      setIsLoadingUser(true);
      setUserError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabaseClient.auth.getSession();

      if (sessionError) {
        if (!isMounted) return;
        setUserError("Unable to verify your session. Please sign in again.");
        setIsLoadingUser(false);
        return;
      }

      if (!session?.user) {
        if (!isMounted) return;
        router.replace("/jobseeker/signin");
        return;
      }

      if (isMounted) {
        setUserSession({
          id: session.user.id,
          email: session.user.email ?? "",
        });
      }

      const { data: profile, error: profileError } = await supabaseClient
        .from("job_seekers")
        .select("full_name, preferred_career_track")
        .eq("id", session.user.id)
        .single();

      if (!isMounted) {
        return;
      }

      if (profileError) {
        console.error("Failed to load profile:", profileError);
        setUserError("We couldn't load your profile details.");
      } else {
        setUserProfile({
          full_name: profile?.full_name ?? null,
          preferred_career_track: profile?.preferred_career_track ?? null,
        });
      }

      setIsLoadingUser(false);
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router, supabaseClient]);

  const handleSignOut = async () => {
    setIsLoadingUser(true);
    setUserError(null);
    try {
      await supabaseClient.auth.signOut();
      try {
        localStorage.removeItem("ecoInterviewAccessToken");
      } catch (storageError) {
        console.warn("Failed to remove stored token:", storageError);
      }
      router.replace("/jobseeker/signin");
    } catch (error) {
      console.error("Sign out failed:", error);
      setUserError("We couldn't sign you out. Please try again.");
      setIsLoadingUser(false);
    }
  };

  // Load collapsed state from localStorage on component mount (client-side)
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  // Toggle desktop collapse and save to localStorage
  const toggleDesktopSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  // --- Nav items (Settings removed) ---
  const navItems = [
    { name: "Dashboard", href: "/candidate-dashboard", icon: LayoutDashboard },
    // {
    //   name: "My Applications",
    //   href: "/candidate-dashboard/applied",
    //   icon: FileText,
    // },
    { name: "Find Jobs", href: "/candidate-dashboard/jobs", icon: Briefcase },

    { name: "Carrer Roadmap", href: "/candidate-dashboard/career-roadmap", icon: Briefcase },


    { name: "Learning", href: "/candidate-dashboard/learning", icon: Book },
    { name: "AI Chat", href: "/candidate-dashboard/ai-chat", icon: MessageCircle },
    { name: "CV/Profile Assistant", href: "/candidate-dashboard/ai-resume-builder", icon: FileText },
    { name: "Profile", href: "/candidate-dashboard/profile", icon: User },

  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
      {/* --- Mobile Sidebar Backdrop --- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-emerald-950/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* --- Modernized, Collapsible Sidebar --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-white/95 backdrop-blur-xl border-r border-emerald-100 shadow-xl shadow-emerald-100/20 flex flex-col transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className={`flex items-center h-16 border-b border-emerald-100 bg-emerald-50/50 ${isCollapsed ? "justify-center px-3" : "justify-between px-4"}`}>
            {/* Desktop Toggle Button - wrapped around logo */}
            <button
              onClick={toggleDesktopSidebar}
              className="hidden lg:flex items-center gap-3 group min-w-0"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <span className="text-white font-bold text-lg">E</span>
              </div>

              {!isCollapsed && (
                <span className="text-lg font-bold text-slate-900 whitespace-nowrap overflow-hidden">
                  ECO<span className="text-emerald-600">INTERVIEW</span>
                </span>
              )}
            </button>

            {/* Mobile-only Logo */}
            <Link
              href="/candidate-dashboard"
              className="text-xl font-bold text-slate-900 lg:hidden flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              ECO<span className="text-emerald-600">INTERVIEW</span>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-slate-600 hover:text-slate-900 lg:hidden p-2 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-4 space-y-1 ${isCollapsed ? "px-2" : "px-3"}`}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center py-2.5 rounded-lg transition-all duration-300
                  ${isCollapsed ? "lg:px-2 lg:justify-center" : "px-3 gap-3"}
                  ${pathname === item.href
                    ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-200/50"
                    : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.name : undefined}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300
                  ${pathname === item.href
                    ? "bg-white/20"
                    : "bg-slate-100 group-hover:bg-emerald-100"
                  }`}>
                  <item.icon className={`h-4 w-4 ${pathname === item.href ? "text-white" : "text-slate-600 group-hover:text-emerald-700"}`} />
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className={`border-t border-emerald-100 bg-emerald-50/50 space-y-3 ${isCollapsed ? "p-2" : "p-4"}`}>
            <Link
              href="/candidate-dashboard/profile"
              className={`group flex items-center p-2 rounded-lg hover:bg-white/80 transition-all duration-300
                ${isCollapsed ? "lg:justify-center" : "gap-2"}
              `}
              title="View Profile"
            >
              <div className="relative flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-lg object-cover border-2 border-emerald-200 group-hover:border-emerald-300 transition-colors"
                  src="https://placehold.co/100x100/10b981/ffffff?text=U"
                  alt="User"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {isLoadingUser
                      ? "Loading..."
                      : userProfile?.full_name ||
                      userSession?.email ||
                      "Your profile"}
                  </p>
                  <p className="text-xs text-emerald-600 truncate">
                    {userProfile?.preferred_career_track
                      ? userProfile.preferred_career_track
                      : userError
                        ? "Profile unavailable"
                        : "View Profile"}
                  </p>
                </div>
              )}
            </Link>

            {!isCollapsed && (
              <Button
                onClick={handleSignOut}
                disabled={isLoadingUser}
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all duration-300 hover:scale-105"
              >
                Sign out
              </Button>
            )}
            {!isCollapsed && userError && (
              <p className="text-xs text-red-500 text-center bg-red-50 rounded-lg px-2 py-1">{userError}</p>
            )}
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}
      `}
      >
        {/* --- NEW STICKY HEADER --- */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white/80 backdrop-blur-xl border-b border-emerald-100 shadow-sm px-6 md:px-8">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="text-slate-600 hover:text-slate-900 lg:hidden p-2 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Spacer to push toggle to the right */}
          <div className="lg:flex-1"></div>

          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg hover:bg-emerald-100 transition-colors">
              <SimpleThemeToggle />
            </div>
          </div>
        </header>

        {/* --- UPDATED MAIN CONTENT --- */}
        <main className="flex-1 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
