// FILE: src/app/(candidate)/layout.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  PanelRightClose, // <-- ADDED
} from "lucide-react";

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
      className="p-2 rounded-full text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
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
  const pathname = usePathname();

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
    {
      name: "My Applications",
      href: "/candidate-dashboard/applied",
      icon: FileText,
    },
    { name: "Find Jobs", href: "/jobs", icon: Briefcase },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* --- Mobile Sidebar Backdrop --- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* --- Modernized, Collapsible Sidebar --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-slate-950 text-white flex flex-col transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
            {/* Desktop Toggle Button - wrapped around logo */}
            <button
              onClick={toggleDesktopSidebar}
              className="hidden lg:flex items-center gap-2"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {/* ===-== MODIFIED ICON ===-== */}
              {isCollapsed ? (
                <PanelRightClose className="h-6 w-6 flex-shrink-0" />
              ) : (
                <PanelLeftClose className="h-6 w-6 flex-shrink-0" />
              )}
              {/* ===-== END MODIFICATION ===-== */}

              <span
                className={`text-2xl font-bold text-white ${
                  isCollapsed ? "lg:hidden" : ""
                }`}
              >
                Eco<span className="text-indigo-400">Interview</span>
              </span>
            </button>

            {/* Mobile-only Logo */}
            <Link
              href="/candidate-dashboard"
              className="text-2xl font-bold text-white lg:hidden"
            >
              Eco<span className="text-indigo-400">Interview</span>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-400 hover:text-white lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 py-3 rounded-lg transition-all
                  ${isCollapsed ? "lg:px-4 lg:justify-center" : "px-4"}
                  ${
                    pathname === item.href
                      ? "bg-indigo-600 text-white font-semibold shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-slate-900"
                  }`}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.name : undefined} // Show tooltip when collapsed
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`text-sm font-medium ${
                    isCollapsed ? "lg:hidden" : ""
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* ===-== MODIFIED USER/FOOTER ===-== */}
          {/* The p-4 and border-t are on the outer div for structure */}
          <div className="p-4 border-t border-slate-800">
            {/* The Link component is now the clickable wrapper */}
            <Link
              href="/candidate-dashboard/profile"
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900 transition-colors
                ${isCollapsed ? "lg:justify-center" : ""}
              `}
              title="View Profile" // Tooltip for collapsed and screen readers
            >
              <img
                className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                src="https://placehold.co/100x100/f0f0f0/333?text=User"
                alt="User"
              />
              <div className={isCollapsed ? "lg:hidden" : ""}>
                <p className="text-sm font-medium text-white">Candidate Name</p>
                <p className="text-xs text-indigo-300">View Profile</p>
              </div>
            </Link>
          </div>
          {/* ===-== END OF MODIFICATION ===-== */}
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}
      `}
      >
        {/* --- NEW STICKY HEADER --- */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white dark:bg-slate-800 shadow-sm px-4 md:px-8">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setIsMobileOpen(true)} // This opens the mobile overlay
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Spacer to push toggle to the right */}
          <div className="lg:flex-1"></div>

          <div className="flex items-center gap-4">
            <SimpleThemeToggle />
          </div>
        </header>

        {/* --- UPDATED MAIN CONTENT --- */}
        <main className="flex-1 p-6 md:p-10 bg-gray-100 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
