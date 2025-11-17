"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, ShieldCheck, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { createSupabaseClientSide } from "@/lib/supabase/supabase-client-side"

type FormValues = {
  email: string
  password: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

export default function AdminSigninPage() {
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

    // Check for bypass credentials
    const adminEmail = "admin@gmail.com"
    const adminPassword = "rakibhasan"
    const trimmedEmail = values.email.trim().toLowerCase()

    if (trimmedEmail === adminEmail.toLowerCase() && values.password === adminPassword) {
      // Bypass authentication and redirect to admin service
      setIsSubmitted(true)
      const adminServiceUrl = process.env.NEXT_PUBLIC_MAIN_ADMIN_SERVICE_URL || ""
      const redirectUrl = adminServiceUrl ? `${adminServiceUrl}/admin/analytics` : "/admin/analytics"
      
      // Use window.location for external redirect if it's a different domain
      if (typeof window !== "undefined" && adminServiceUrl) {
        try {
          const currentOrigin = window.location.origin
          if (!adminServiceUrl.startsWith(currentOrigin)) {
            window.location.href = redirectUrl
            setIsSubmitting(false)
            return
          }
        } catch (e) {
          // Fallback to router if window check fails
        }
      }
      
      router.push(redirectUrl)
      setIsSubmitting(false)
      return
    }

    // Proceed with normal authentication
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
      // Redirect to admin dashboard - adjust path as needed
      router.push("/admin/analytics")
    } catch (error) {
      setFormError("Something went wrong. Please try again.")
      console.error("Signin error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-3 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-slate-400">
                Sign in to access the admin dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-300 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={values.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-300 flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-600 bg-slate-700/50 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-lg shadow-lg transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {formError && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-sm">
                  {formError}
                </div>
              )}

              {isSubmitted && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400 backdrop-blur-sm">
                  Successfully signed in! Redirecting...
                </div>
              )}

              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-700/30 px-4 py-3 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span>Your session is secured with enterprise-grade encryption</span>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Not an admin?{" "}
            <Link
              href="/jobseeker/signin"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign in as candidate
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

