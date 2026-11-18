export const TECH_STACK = [
  {
    name: 'ReactFlow & GSAP',
    category: 'Canvas Engine & Motion',
    desc: 'Hardware-accelerated infinite panning, smooth zooming, physics-based note pins, and fluid transitions.',
  },
  {
    name: 'Y.js & WebSockets',
    category: 'CRDT Sync Engine',
    desc: 'Sub-millisecond state convergence ensuring deterministic multi-user editing without central locks.',
  },
  {
    name: 'Redis Pub/Sub',
    category: 'Real-Time Messaging',
    desc: 'High-throughput cluster communication and fast room presence dispatching for distributed instances.',
  },
  {
    name: 'MongoDB & Docker',
    category: 'Persistence & Cloud',
    desc: 'Containerized micro-services with automatic board state recovery and persistent user documents.',
  },
]

export function TechStackSection() {
  return (
    <section className="relative z-10 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="brand-kicker">Architecture & Stack</p>
          <h2 className="section-title mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Modern Collaborative Stack
          </h2>
          <p className="section-copy mt-4 text-base sm:text-lg">
            Engineered from ground up with real-time primitives and state-of-the-art web technologies.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK.map((item) => (
            <div
              key={item.name}
              className="paper-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                {item.category}
              </span>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{item.name}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
