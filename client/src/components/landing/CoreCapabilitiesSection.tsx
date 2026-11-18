export function CoreCapabilitiesSection() {
  return (
    <section className="relative z-10 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="paper-card rounded-[2rem] p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="panel-title mb-3 text-xl text-gray-900">Instant Sync</h3>
            <p className="section-copy text-base">
              Powered by Y.js, experience sub-millisecond synchronization across all connected clients.
            </p>
          </div>

          <div className="paper-card rounded-[2rem] p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
              <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="panel-title mb-3 text-xl text-gray-900">Team Presence</h3>
            <p className="section-copy text-base">
              See who&apos;s working with real-time cursors and status indicators for every collaborator.
            </p>
          </div>

          <div className="paper-card rounded-[2rem] p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <svg className="h-6 w-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="panel-title mb-3 text-xl text-gray-900">Persistent Notes</h3>
            <p className="section-copy text-base">
              Your ideas stay safe. Every stroke and note is carried forward with durable persistence.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
