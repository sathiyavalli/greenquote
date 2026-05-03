export default function DocsPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">API Documentation</h1>
        <p className="text-gray-600 mb-6">
          Interactive OpenAPI docs for GreenQuote endpoints.
        </p>
        <div className="bg-white rounded-xl shadow overflow-hidden h-[80vh] border border-gray-200">
          <iframe
            title="GreenQuote OpenAPI Docs"
            src="/api/docs"
            className="w-full h-full"
          />
        </div>
      </div>
    </main>
  );
}
