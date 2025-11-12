import React from "react";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="recruiter-layout" style={{ minHeight: "100vh" }}>
            {children}
        </div>
    );
}