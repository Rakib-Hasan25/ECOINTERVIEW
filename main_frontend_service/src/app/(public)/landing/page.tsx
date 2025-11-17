// src/app/(public)/landing/page.tsx
"use client";


import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center justify-center text-center py-24 px-4">
      <h1 className="text-5xl font-bold mb-6">
        Welcome to <span className="text-blue-600">Jobly</span>
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-8">
        Find your dream job or hire the right talent — all in one platform.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.push("/auth/login")}>Get Started</Button>
        <Button
          onClick={() => router.push("/about")}
          variant="outline"
        >
          Learn More
        </Button>
      </div>
    </section>
  );
}
