"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Wave Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* First Wave */}
            <path d="M0,200 C300,100 600,300 900,200 C1050,150 1200,250 1200,200 L1200,0 L0,0 Z"
              fill="url(#waveGradient1)"
              className="animate-[wave_20s_ease-in-out_infinite]">
              <animate attributeName="d" dur="20s" repeatCount="indefinite"
                values="M0,200 C300,100 600,300 900,200 C1050,150 1200,250 1200,200 L1200,0 L0,0 Z;
                        M0,250 C300,150 600,50 900,150 C1050,100 1200,200 1200,150 L1200,0 L0,0 Z;
                        M0,200 C300,100 600,300 900,200 C1050,150 1200,250 1200,200 L1200,0 L0,0 Z"/>
            </path>

            {/* Second Wave */}
            <path d="M0,300 C250,200 550,400 850,300 C1000,250 1200,350 1200,300 L1200,0 L0,0 Z"
              fill="url(#waveGradient2)"
              className="animate-[wave_25s_ease-in-out_infinite_reverse]">
              <animate attributeName="d" dur="25s" repeatCount="indefinite"
                values="M0,300 C250,200 550,400 850,300 C1000,250 1200,350 1200,300 L1200,0 L0,0 Z;
                        M0,350 C250,250 550,150 850,250 C1000,200 1200,300 1200,250 L1200,0 L0,0 Z;
                        M0,300 C250,200 550,400 850,300 C1000,250 1200,350 1200,300 L1200,0 L0,0 Z"/>
            </path>
          </svg>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-emerald-300/20 rounded-full animate-float-${i % 3 + 1}`}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${8 + i}s`
              }}
            />
          ))}
        </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}>
        </div>
      </div>

      {/* Floating Navigation Bar */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 animate-fade-in-up">
        <div className="w-full max-w-4xl rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg shadow-emerald-100/20 hover:shadow-xl hover:shadow-emerald-100/30 transition-all duration-300">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300">
                  ECOINTERVIEW
                </span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => router.push("/jobs")}
                  className="text-sm font-medium text-slate-600 hover:text-emerald-700 hover:scale-105 transition-all duration-300"
                >
                  Jobs
                </button>
                <button
                  onClick={() => router.push("/learning")}
                  className="text-sm font-medium text-slate-600 hover:text-emerald-700 hover:scale-105 transition-all duration-300"
                >
                  Learning
                </button>
                <Button
                  variant="ghost"
                  className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => router.push("/jobseeker/signin")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl hover:scale-105 transition-all duration-300"
                  onClick={() => router.push("/join-as")}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative bg-gradient-to-br from-emerald-50/60 via-emerald-25/30 to-slate-50">
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-emerald-50/20 to-transparent pointer-events-none"></div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)`,
            backgroundSize: '60px 60px'
          }}>
        </div>

        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-100/90 to-emerald-50/80 backdrop-blur-sm text-xs font-semibold text-emerald-700 animate-fade-in-up hover:scale-105 transition-transform duration-300 shadow-sm shadow-emerald-200/50">
              <Sparkles className="h-4 w-4 animate-pulse text-emerald-500" />
              Trusted by 10,000+ professionals worldwide
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-tight">
                Your <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent animate-gradient">sustainable career</span> journey starts here
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Connect with mission-driven companies, discover green opportunities, and accelerate your impact with our comprehensive platform.
              </p>
            </div>

            {/* Trust Indicator */}
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur-sm px-6 py-4 text-sm text-slate-600 shadow-sm max-w-md mx-auto animate-fade-in-up hover:shadow-md transition-all duration-300" style={{ animationDelay: '0.4s' }}>
              <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 animate-bounce-slow" />
              <span>Connecting sustainable careers since 2024</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                onClick={() => router.push("/join-as")}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold border-2 border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                onClick={() => router.push("/jobs")}
              >
                Browse Green Jobs
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="text-center group cursor-default">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors duration-300">10K+</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors duration-300">5K+</div>
                <div className="text-sm text-slate-600">Green Jobs</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors duration-300">500+</div>
                <div className="text-sm text-slate-600">Courses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Everything you need for sustainable careers
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools designed to connect purpose-driven talent with mission-driven companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-emerald-100/40 group-hover:shadow-xl group-hover:shadow-emerald-100/60 group-hover:-translate-y-2 transition-all duration-500">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300">Green Job Posting</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Post mission-driven positions and connect with talented professionals who share your sustainability values and vision.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-emerald-100/40 group-hover:shadow-xl group-hover:shadow-emerald-100/60 group-hover:-translate-y-2 transition-all duration-500">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300">Smart Job Matching</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Discover opportunities aligned with your values. Our AI matches you with companies making real environmental impact.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-emerald-100/40 group-hover:shadow-xl group-hover:shadow-emerald-100/60 group-hover:-translate-y-2 transition-all duration-500">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300">Sustainability Learning</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Access curated courses on green skills, climate solutions, and sustainable business practices from industry experts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
                  Why choose <span className="text-emerald-600">ECOINTERVIEW</span> for your climate career?
                </h2>
                <p className="text-lg text-slate-600">
                  Join the movement of professionals building a sustainable future
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">Mission-Driven Matching</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Connect with companies that share your passion for environmental and social impact.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">Green Skills Development</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Access specialized courses in renewable energy, ESG, sustainability reporting, and more.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">Verified Impact Companies</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Every company is verified for authentic sustainability commitments and measurable impact.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-emerald-200/10 rounded-3xl blur-xl"></div>
              <div className="relative rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-8 shadow-lg shadow-emerald-100/40 hover:shadow-xl hover:shadow-emerald-100/60 hover:-translate-y-1 transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-lg hover:scale-110 transition-transform duration-300">
                      SS
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Sarah Silva</h4>
                      <p className="text-sm text-slate-600">Sustainability Manager at GreenTech</p>
                    </div>
                  </div>
                  <p className="text-slate-600 italic leading-relaxed">
                    "ECOINTERVIEW connected me with my dream role at a B-Corp working on carbon capture technology. The focus on mission-driven careers made all the difference."
                  </p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400 hover:scale-125 transition-transform duration-200" style={{ animationDelay: `${i * 0.1}s` }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-3xl blur-2xl"></div>
            <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-12 text-center space-y-8 shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:shadow-emerald-200/70 transition-all duration-500 animate-fade-in-up">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ready to build a sustainable career?</h2>
                <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of mission-driven professionals making real impact through meaningful work
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="px-8 py-4 text-base font-semibold bg-white text-emerald-700 hover:bg-emerald-50 hover:scale-105 rounded-xl shadow-lg transition-all duration-300"
                  onClick={() => router.push("/signin")}
                >
                  Start Your Journey
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-base font-semibold bg-transparent border-2 border-white text-white hover:bg-white/10 hover:scale-105 rounded-xl transition-all duration-300"
                  onClick={() => router.push("/jobs")}
                >
                  Explore Green Jobs
                </Button>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4 group">
                <TrendingUp className="h-5 w-5 opacity-75 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm opacity-75">Average 40% salary increase after joining sustainable companies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold text-slate-900">ECOINTERVIEW</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connecting mission-driven professionals with sustainable career opportunities.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><button onClick={() => router.push("/jobs")} className="hover:text-slate-900 transition-colors">Browse Green Jobs</button></li>
                <li><button onClick={() => router.push("/learning")} className="hover:text-slate-900 transition-colors">Sustainability Courses</button></li>
                <li><button onClick={() => router.push("/signin")} className="hover:text-slate-900 transition-colors">Sign In</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">For Employers</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><button className="hover:text-slate-900 transition-colors">Post Green Jobs</button></li>
                <li><button className="hover:text-slate-900 transition-colors">Find Talent</button></li>
                <li><button className="hover:text-slate-900 transition-colors">Impact Reporting</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li><button className="hover:text-slate-900 transition-colors">Help Center</button></li>
                <li><button className="hover:text-slate-900 transition-colors">Contact Us</button></li>
                <li><button className="hover:text-slate-900 transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
            © 2024 ECOINTERVIEW. Building sustainable careers for a better tomorrow.
          </div>
        </div>
      </footer>
    </div>
  );
}
