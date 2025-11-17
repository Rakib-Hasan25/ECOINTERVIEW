"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side"

type FormValues = {
  email: string
  password: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

export default function JobSeekerSigninPage() {
  const [values, setValues] = useState<FormValues>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const router = useRouter()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const newErrors: FormErrors = {}

    if (!values.email.trim()) {
      newErrors.email = "Email is required."
    } else if (
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(values.email.trim())
    ) {
      newErrors.email = "Enter a valid email address."
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
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email: values.email.trim(),
          password: values.password,
        }
      )

      if (signInError) {
        setFormError(signInError.message)
        return
      }

      if (!data.session) {
        setFormError("Unable to sign you in right now. Please try again.")
        return
      }

      const accessToken = data.session.access_token
      try {
        localStorage.setItem("ecoInterviewAccessToken", accessToken)
      } catch (storageError) {
        console.warn("Failed to persist access token:", storageError)
      }

      setIsSubmitted(true)
      router.push("/candidate-dashboard")
    } catch (error) {
      setFormError("Something went wrong. Please try again.")
      console.error("Signin error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <header className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700">
              Welcome back
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Sign in to continue your climate career journey.
              </h1>
              <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                Access your saved interviews, track applications, and stay in
                sync with mission-driven opportunities.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              We keep your data secure with industry-standard encryption.
            </div>
          </header>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-emerald-100/40">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full justify-center rounded-xl py-4 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <p className="text-center text-sm text-slate-600">
                New to ecoInterview?{" "}
                <Link
                  href="/jobseeker/signup"
                  className="font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Create an account
                </Link>
              </p>

              {isSubmitted && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Signed in! Connect this form to your authentication logic to
                  complete the flow.
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
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  type?: "text" | "email" | "password"
  placeholder?: string
  error?: string
  autoComplete?: string
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
}: FieldProps) {
  return (
    <div>
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
        className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
          error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

