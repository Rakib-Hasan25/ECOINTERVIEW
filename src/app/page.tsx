import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Hello Team Ecointerview! 👋
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Welcome to the project! Please work in your assigned folders below.
          </p>
          <Card className="max-w-3xl mx-auto border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-3xl">👨‍💼</span>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  Project Supervisor: Rakib
                </p>
              </div>
              <p className="text-base text-muted-foreground">
                Rakib supervises all teams and modules. For questions or approvals, please reach out to Rakib.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Bodda & Alvee - Public Pages */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-2xl">🌐 Public Pages</CardTitle>
              <CardDescription>UI & Public Features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg mb-2">Team Members:</p>
                  <p className="text-primary font-medium">Bodda & Alvee</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Work in folder:</p>
                  <code className="block bg-muted p-2 rounded text-sm font-mono">
                    src/app/(public)/
                  </code>
                </div>
                <div>
                  <p className="font-semibold mb-2">Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Landing page</li>
                    <li>Sign in</li>
                    <li>Sign up</li>
                    <li>Job post</li>
                    <li>Job post description</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sojib, Ratna, Adnan - Recruiter */}
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-2xl">👔 Recruiter Module</CardTitle>
              <CardDescription>Recruiter Functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg mb-2">Team Members:</p>
                  <p className="text-primary font-medium">Sojib, Ratna & Adnan</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Work in folder:</p>
                  <code className="block bg-muted p-2 rounded text-sm font-mono">
                    src/app/(recruiter)/
                  </code>
                </div>
                <div>
                  <p className="font-semibold mb-2">Responsibilities:</p>
                  <p className="text-sm text-muted-foreground">
                    All recruiter-related features and functionality
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nahian & Hasnat - User/Candidate */}
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-2xl">👤 Candidate Module</CardTitle>
              <CardDescription>User er jonno (For the user)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg mb-2">Team Members:</p>
                  <p className="text-primary font-medium">Nahian & Hasnat</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Work in folder:</p>
                  <code className="block bg-muted p-2 rounded text-sm font-mono">
                    src/app/(candidate)/
                  </code>
                </div>
                <div>
                  <p className="font-semibold mb-2">Responsibilities:</p>
                  <p className="text-sm text-muted-foreground">
                    All user/candidate-facing features and functionality
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sowrav - Testing */}
          <Card className="border-2 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-2xl">🧪 
                assessment
              </CardTitle>
              <CardDescription>Quality Assurance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-lg mb-2">Team Member:</p>
                  <p className="text-primary font-medium">Sowrav</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Work in folder:</p>
                  <code className="block bg-muted p-2 rounded text-sm font-mono">
                    src/app/(assessment)/
                  </code>
                </div>
                <div>
                  <p className="font-semibold mb-2">Testing Areas:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>UI Testing</li>
                    <li>MCQ Testing</li>
                    <li>CQ Testing</li>
                    <li>Coding Tests</li>
                    <li>Switching Tests</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="pt-6">
              <p className="text-lg font-semibold mb-2">📁 Project Structure</p>
              <p className="text-sm text-muted-foreground">
                Each team has their own folder. Please work within your assigned directory to maintain organization and avoid conflicts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

