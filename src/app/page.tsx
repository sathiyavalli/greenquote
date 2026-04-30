export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">GreenQuote</h1>
        <p className="text-xl text-gray-600 mb-8">Solar Financing Pre-Qualification Platform</p>
        <div className="space-x-4">
          <a
            href="/register"
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Get Started Free
          </a>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  );
}
