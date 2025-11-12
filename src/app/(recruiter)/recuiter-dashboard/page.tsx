"use client";

import React, { useState } from "react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  location: string;
  postedAt: string;
  status?: string;
};

const mockJobs: Job[] = [
  { id: "1", title: "Frontend Engineer", location: "Remote", postedAt: "2 days ago", status: "Open" },
  { id: "2", title: "Backend Developer", location: "New York, NY", postedAt: "1 week ago", status: "Open" },
  { id: "3", title: "Product Manager", location: "San Francisco, CA", postedAt: "3 weeks ago", status: "Closed" },
];

export default function RecruiterDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 240 : 64, transition: "width 180ms ease", background: "#0f172a", color: "#fff", padding: "16px 12px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{sidebarOpen ? "Recruiter" : "R"}</div>
          </div>
          <button onClick={() => setSidebarOpen((s) => !s)} style={{ background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", padding: 6 }}>
            ☰
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/recruiter-dashboard" style={linkStyle(sidebarOpen)}>🏠 {sidebarOpen && <span>Home</span>}</Link>
          <Link href="/post-job" style={linkStyle(sidebarOpen)}>✚ {sidebarOpen && <span>Post a Job</span>}</Link>
          <Link href="/postings" style={linkStyle(sidebarOpen)}>📋 {sidebarOpen && <span>See Job Postings</span>}</Link>
          <Link href="/profile" style={linkStyle(sidebarOpen)}>👤 {sidebarOpen && <span>Profile</span>}</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 24, background: "#f8fafc", overflow: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Recruiter Dashboard</h1>
          <Link href="/post-job">
            <button style={primaryButtonStyle}>Post a Job</button>
          </Link>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          <div>
            <div style={cardStyle}>
              <h2>Recent Job Postings</h2>
              {mockJobs.length === 0 ? <p>No recent job postings.</p> : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                  {mockJobs.map((job) => (
                    <li key={job.id} style={jobCardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{job.title}</div>
                          <div style={{ color: "#475569", fontSize: 13 }}>{job.location}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{job.postedAt}</div>
                          <div style={{ fontSize: 12, marginTop: 6, color: job.status === "Open" ? "#16a34a" : "#64748b" }}>{job.status}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <Link href={`/postings/${job.id}`}><button style={secondaryButtonStyle}>View</button></Link>
                        <Link href={`/postings/${job.id}/edit`}><button style={ghostButtonStyle}>Edit</button></Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={cardStyle}>
              <h3>Company Overview</h3>
              <p style={{ color: "#475569", marginBottom: 8 }}>Acme Corp — 12 active roles</p>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/post-job"><button style={primaryButtonStyleSmall}>Post Job</button></Link>
                <Link href="/postings"><button style={secondaryButtonStyleSmall}>All Postings</button></Link>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

/* Styles */
function linkStyle(expanded: boolean): React.CSSProperties {
  return { display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderRadius: 8, color: "#e6eef8", textDecoration: "none", background: "transparent", fontSize: 14 };
}

const cardStyle: React.CSSProperties = { background: "#ffffff", padding: 16, borderRadius: 12, boxShadow: "0 1px 2px rgba(2,6,23,0.06)" };
const jobCardStyle: React.CSSProperties = { background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" };
const primaryButtonStyle: React.CSSProperties = { background: "#0ea5a4", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600 };
const primaryButtonStyleSmall: React.CSSProperties = { ...primaryButtonStyle, padding: "6px 10px", fontSize: 13 };
const secondaryButtonStyle: React.CSSProperties = { background: "#1e293b", color: "#fff", border: "none", padding: "8px 10px", borderRadius: 8, cursor: "pointer" };
const secondaryButtonStyleSmall: React.CSSProperties = { ...secondaryButtonStyle, padding: "6px 10px", fontSize: 13 };
const ghostButtonStyle: React.CSSProperties = { background: "transparent", color: "#0f172a", border: "1px solid #e2e8f0", padding: "7px 10px", borderRadius: 8, cursor: "pointer" };
