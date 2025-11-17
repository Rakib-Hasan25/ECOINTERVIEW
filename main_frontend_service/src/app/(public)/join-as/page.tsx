import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, Leaf, UserRoundSearch } from "lucide-react"

const options = [
  {
    title: "Join as a Job Seeker",
    description:
      "Find climate-forward roles, practice interviews, and grow a purpose-driven career.",
    href: "/jobseeker/signin",
    icon: UserRoundSearch,
    cta: "I’m looking for a job",
  },
  {
    title: "Hire as a Company",
    description:
      "Connect with sustainability-minded talent and streamline your hiring journey.",
    href: "/company/signin",
    icon: Building2,
    cta: "I’m hiring talent",
  },
]

export default function JoinAsPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-12 px-6 py-20 sm:px-10 lg:px-12">
        <header className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
            <Leaf className="h-4 w-4" />
            ecoInterview
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Choose the way you want to join our sustainable hiring community.
            </h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Pick the path that fits your goal and get tools designed for
              climate-conscious careers and teams.
            </p>
          </div>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <div
                key={option.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="mt-6 space-y-2">
                  <h2 className="text-xl font-semibold">{option.title}</h2>
                  <p className="text-sm text-slate-600">{option.description}</p>
                </div>
                <div className="mt-8">
                  <Button
                    asChild
                    className="w-full justify-between rounded-xl px-4 py-3 text-base bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Link href={option.href} prefetch={false}>
                      {option.cta}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

