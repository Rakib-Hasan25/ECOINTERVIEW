"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side"

type FormValues = {
  fullName: string
  email: string
  education: string
  experience: string
  careerTrack: string
  password: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const experienceLevels = ["Fresher", "Junior", "Mid", "Senior"]
const careerTracks = [
  "Software Development",
  "Data & Analytics",
  "Product & UX Design",
  "Marketing & Growth",
  "Climate & Sustainability",
  "Operations",
]

export default function JobSeekerSignupPage() {
  const [values, setValues] = useState<FormValues>({
    fullName: "",
    email: "",
    education: "",
    experience: "",
    careerTrack: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const router = useRouter()

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const newErrors: FormErrors = {}

    if (!values.fullName.trim()) {
      newErrors.fullName = "Full name is required."
    }

    if (!values.email.trim()) {
      newErrors.email = "Email is required."
    } else if (
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(values.email.trim())
    ) {
      newErrors.email = "Enter a valid email address."
    }

    if (!values.education.trim()) {
      newErrors.education = "Education level is required."
    }

    if (!values.experience) {
      newErrors.experience = "Experience level is required."
    }

    if (!values.careerTrack) {
      newErrors.careerTrack = "Please choose your preferred track."
    }

    if (!values.password) {
      newErrors.password = "Password is required."
    } else if (values.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(false)
    setFormError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    const supabase = createSupabaseClientSide()

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        // options: {
        //   emailRedirectTo: `${window.location.origin}/auth/callback`,
        // },
      })

      if (signUpError) {
        setFormError(signUpError.message)
        return
      }

      if (!data.user) {
        setFormError("We could not create your account. Please try again.")
        return
      }

      const userId = data.user.id

      console.log(userId)

      const { error: usersInsertError } = await supabase.from("users").insert({
        id: userId,
        email: values.email.trim(),
        role: "job_seeker",
      })

      if (usersInsertError) {
        setFormError("Account created, but we could not save your profile. Please contact support.")
        return
      }

      const { error: jobSeekerInsertError } = await supabase
        .from("job_seekers")
        .insert({
          id: userId,
          full_name: values.fullName.trim(),
          education_level: values.education.trim(),
          experience_level: values.experience,
          preferred_career_track: values.careerTrack,
        })

      if (jobSeekerInsertError) {
        setFormError("Account created, but we could not complete your profile. Please contact support.")
        return
      }

      setIsSubmitted(true)
      router.push("/jobseeker/signin")
    } catch (error) {
      setFormError("Something went wrong. Please try again.")
      console.error("Signup error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <header className="space-y-4 text-balance">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700">
              Ready for your next impact
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Sign up to grow your climate-focused career.
              </h1>
              <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                Build your profile, access curated opportunities, and gain the
                interview practice you need to shine with mission-driven teams.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Guided skill-building journeys tailored to your goals
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Interview simulations with actionable insights
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Direct access to climate-first companies
              </li>
            </ul>
          </header>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-100/40">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Full name"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={values.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  autoComplete="name"
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                />
                <Field
                  label="Education level / department"
                  name="education"
                  placeholder="e.g., BSc Environmental Science"
                  value={values.education}
                  onChange={handleChange}
                  error={errors.education}
                  autoComplete="organization-title"
                  className="sm:col-span-2"
                />
                <SelectField
                  label="Experience level"
                  name="experience"
                  placeholder="Select experience level"
                  value={values.experience}
                  onChange={handleChange}
                  options={experienceLevels}
                  error={errors.experience}
                />
                <SelectField
                  label="Preferred career track"
                  name="careerTrack"
                  placeholder="Choose your focus area"
                  value={values.careerTrack}
                  onChange={handleChange}
                  options={careerTracks}
                  error={errors.careerTrack}
                />
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={values.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="new-password"
                  className="sm:col-span-2"
                  helper="At least 8 characters"
                />
              </div>

              <Button
                type="submit"
                className="w-full justify-center rounded-xl py-5 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating profile...
                  </>
                ) : (
                  "Create your account"
                )}
              </Button>

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              {isSubmitted && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Profile created! Hook this up to your onboarding flow to store
                  the data.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

type FieldProps = {
  label: string
  name: keyof FormValues
  type?: "text" | "email" | "password"
  value: string
  placeholder?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  autoComplete?: string
  className?: string
  helper?: string
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  autoComplete,
  className,
  helper,
}: FieldProps) {
  return (
    <div className={className}>
      <label
        className="mb-2 block text-sm font-semibold text-slate-800"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
          }`}
      />
      {(error || helper) && (
        <p
          className={`mt-1 text-xs ${error ? "text-red-500" : "text-slate-500"
            }`}
        >
          {error ?? helper}
        </p>
      )}
    </div>
  )
}

type SelectFieldProps = {
  label: string
  name: keyof FormValues
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options: string[]
  placeholder?: string
  error?: string
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
}: SelectFieldProps) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-semibold text-slate-800"
        htmlFor={name}
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
          }`}
      >
        <option value="">{placeholder ?? "Select an option"}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

