import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to <span className="text-blue-600">JobHub</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          An intelligent job portal connecting job seekers and employers through advanced, AI-based recruitment features.
          Discover personalized job recommendations or find the top matched candidates for your company.
        </p>
        <div className="flex justify-center gap-6 pt-8">
          <Link
            href="/candidate/dashboard"
            className="rounded-lg px-8 py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            I am a Candidate
          </Link>
          <Link
            href="/recruiter/dashboard"
            className="rounded-lg px-8 py-4 bg-white text-gray-900 border border-gray-200 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            I am a Recruiter
          </Link>
        </div>
      </div>
    </main>
  );
}
