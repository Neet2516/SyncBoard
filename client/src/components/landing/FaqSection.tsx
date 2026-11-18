import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const FAQS = [
  {
    q: 'Why should I use the Demo User instead of creating an account?',
    a: 'We built the Demo User for speed and convenience! You do not need to fill out sign-up forms, verify emails, or remember passwords just to test SyncBoard or brainstorm for a quick session. One click gives you full access to create notes, connect them, and export boards.',
    tag: 'Instant Access',
  },
  {
    q: 'Why choose a spatial canvas over standard linear documents?',
    a: 'Linear docs force your thoughts into a strict top-to-bottom hierarchy. A spatial canvas mirrors how human minds naturally organize thoughts—allowing you to cluster related topics, draw arrows between ideas, and see the full map of your project at a single glance.',
    tag: 'Spatial Canvas',
  },
  {
    q: 'How does real-time synchronization work without conflicts?',
    a: 'SyncBoard is powered by Yjs Conflict-Free Replicated Data Types (CRDTs) over WebSockets. Rather than locking notes or relying on last-write-wins collisions, changes are deterministically merged in real time, so every collaborator sees consistent state immediately.',
    tag: 'CRDT Sync',
  },
  {
    q: 'Can I export my board to share with non-SyncBoard users?',
    a: 'Yes! SyncBoard features a custom high-DPI PDF export engine that rasterizes your canvas with full fidelity—preserving note pins, gradient surfaces, rich text styling, and vector connection paths without clipping or blurry artifacts.',
    tag: 'High-DPI PDF',
  },
  {
    q: 'Can I invite other teammates to the same board?',
    a: 'Yes! Every board has a unique Room ID. Simply copy your room link or code and share it with your teammates. They can sign in or jump in as a Demo User and collaborate with you on the same screen instantly.',
    tag: 'Team Presence',
  },
]

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <section className="relative z-10 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            Got questions?
          </span>
          <h2 className="section-title mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="section-copy mt-4 text-base sm:text-lg max-w-2xl mx-auto">
            Everything you need to know about using SyncBoard as a guest, team, or developer.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index
            const num = String(index + 1).padStart(2, '0')

            return (
              <div
                key={faq.q}
                className={`group relative overflow-hidden rounded-[1.6rem] border transition-all duration-300 ${
                  isOpen
                    ? 'border-blue-400/80 bg-white shadow-[0_16px_40px_rgba(37,99,235,0.12)] ring-1 ring-blue-500/15'
                    : 'border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-xl hover:border-blue-300/80 hover:bg-white hover:shadow-[0_10px_28px_rgba(37,99,235,0.06)]'
                }`}
              >
                {/* Left active vertical accent bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[1.6rem] bg-gradient-to-b from-blue-600 via-indigo-600 to-blue-500 transition-all duration-300 ${
                    isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors sm:p-7"
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    {/* Number Index Badge */}
                    <span
                      className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg transition-all duration-300 shrink-0 ${
                        isOpen
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}
                    >
                      {num}
                    </span>

                    <h3
                      className={`text-base font-extrabold tracking-tight sm:text-lg transition-colors duration-200 ${
                        isOpen ? 'text-blue-950' : 'text-slate-900 group-hover:text-blue-600'
                      }`}
                    >
                      {faq.q}
                    </h3>
                  </div>

                  {/* Morphing Animated Plus/Close Toggle Icon */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`hidden sm:inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                        isOpen
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600'
                      }`}
                    >
                      {faq.tag}
                    </span>

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'border-blue-500 bg-blue-600 text-white rotate-45 shadow-sm shadow-blue-500/40'
                          : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}
                    >
                      <svg
                        className="h-4 w-4 transition-transform duration-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Smooth Height Expansion with Framer Motion AnimatePresence */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="faq-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                        transition: {
                          height: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
                          opacity: { duration: 0.25, delay: 0.08 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
                          opacity: { duration: 0.15 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100/90 pl-14 sm:pl-16 pr-6 sm:pr-8 pb-7 pt-4 text-sm sm:text-base leading-relaxed text-slate-600">
                        <p className="section-copy text-slate-600 leading-relaxed font-normal">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
