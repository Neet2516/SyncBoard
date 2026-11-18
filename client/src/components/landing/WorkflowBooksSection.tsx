import { useState } from 'react'

export const WORKFLOW_STEPS = [
  {
    step: '01',
    kicker: 'Free-form Ideation',
    title: 'Pin, color-code, and organize without boundaries',
    desc: 'Break out of linear docs. Drop sticky notes anywhere on an infinite zoomable canvas, choose from 5 vibrant paper themes, and format thoughts with Quill rich text.',
    accent: 'border-amber-300 text-amber-700 bg-amber-500/10',
    tag: '5 Color Themes • Quill Rich Text',
  },
  {
    step: '02',
    kicker: 'Multiplayer Engine',
    title: 'See teammates move and edit in sub-millisecond sync',
    desc: 'Collaborate live with zero conflict locks. Yjs CRDTs and WebSockets synchronize every stroke, cursor motion, and text modification instantly across peers.',
    accent: 'border-blue-300 text-blue-700 bg-blue-500/10',
    tag: 'Live Cursors • Conflict-Free CRDTs',
  },
  {
    step: '03',
    kicker: 'Connect & Export',
    title: 'Draw smart vector connectors and export high-DPI PDFs',
    desc: 'Link cards to build flowcharts and idea maps. When your brainstorm is complete, generate publication-ready high-DPI PDFs with pristine vector lines in one click.',
    accent: 'border-emerald-300 text-emerald-700 bg-emerald-500/10',
    tag: 'Smart Orthogonal Lines • 1-Click PDF',
  },
]

export type BookColorKey = 'amber' | 'blue' | 'emerald' | 'purple' | 'rose'

export interface BookPalette {
  name: string
  dotClass: string
  coverBg: string
  coverBorder: string
  insideCoverBg: string
  spine: string
  ribbon: string
  glow: string
  tagBg: string
  numColor: string
  badge: string
  insideWash: string
  shimmer: string
}

export const BOOK_COLOR_PALETTES: Record<BookColorKey, BookPalette> = {
  amber: {
    name: 'Amber Gold',
    dotClass: 'bg-amber-500 hover:ring-amber-300',
    coverBg: 'bg-[#fef3c7]',
    coverBorder: 'border-amber-300',
    insideCoverBg: 'bg-[#fffbeb]',
    spine: 'bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 border-r border-amber-400',
    ribbon: 'bg-amber-500 shadow-amber-500/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(245,158,11,0.26)]',
    tagBg: 'bg-amber-100 border-amber-300 text-amber-800',
    numColor: 'text-amber-700',
    badge: 'border-amber-400 text-amber-800 bg-amber-100',
    insideWash: 'rgba(245, 158, 11, 0.08)',
    shimmer: 'rgba(251, 191, 36, 0.18)',
  },
  blue: {
    name: 'Sapphire Blue',
    dotClass: 'bg-blue-600 hover:ring-blue-300',
    coverBg: 'bg-[#dbeafe]',
    coverBorder: 'border-blue-300',
    insideCoverBg: 'bg-[#eff6ff]',
    spine: 'bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 border-r border-blue-400',
    ribbon: 'bg-blue-600 shadow-blue-600/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(37,99,235,0.26)]',
    tagBg: 'bg-blue-100 border-blue-300 text-blue-800',
    numColor: 'text-blue-700',
    badge: 'border-blue-400 text-blue-800 bg-blue-100',
    insideWash: 'rgba(37, 99, 235, 0.08)',
    shimmer: 'rgba(59, 130, 246, 0.18)',
  },
  emerald: {
    name: 'Emerald Jade',
    dotClass: 'bg-emerald-500 hover:ring-emerald-300',
    coverBg: 'bg-[#d1fae5]',
    coverBorder: 'border-emerald-300',
    insideCoverBg: 'bg-[#ecfdf5]',
    spine: 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-200 border-r border-emerald-400',
    ribbon: 'bg-emerald-500 shadow-emerald-500/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(16,185,129,0.26)]',
    tagBg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    numColor: 'text-emerald-700',
    badge: 'border-emerald-400 text-emerald-800 bg-emerald-100',
    insideWash: 'rgba(16, 185, 129, 0.08)',
    shimmer: 'rgba(16, 185, 129, 0.18)',
  },
  purple: {
    name: 'Amethyst Purple',
    dotClass: 'bg-purple-600 hover:ring-purple-300',
    coverBg: 'bg-[#f3e8ff]',
    coverBorder: 'border-purple-300',
    insideCoverBg: 'bg-[#faf5ff]',
    spine: 'bg-gradient-to-r from-purple-600 via-purple-400 to-purple-200 border-r border-purple-400',
    ribbon: 'bg-purple-600 shadow-purple-600/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(147,51,234,0.26)]',
    tagBg: 'bg-purple-100 border-purple-300 text-purple-800',
    numColor: 'text-purple-700',
    badge: 'border-purple-400 text-purple-800 bg-purple-100',
    insideWash: 'rgba(147, 51, 234, 0.08)',
    shimmer: 'rgba(147, 51, 234, 0.18)',
  },
  rose: {
    name: 'Ruby Rose',
    dotClass: 'bg-rose-500 hover:ring-rose-300',
    coverBg: 'bg-[#ffe4e6]',
    coverBorder: 'border-rose-300',
    insideCoverBg: 'bg-[#fff1f2]',
    spine: 'bg-gradient-to-r from-rose-600 via-rose-400 to-rose-200 border-r border-rose-400',
    ribbon: 'bg-rose-500 shadow-rose-500/40',
    glow: 'hover:shadow-[0_24px_55px_rgba(244,63,94,0.26)]',
    tagBg: 'bg-rose-100 border-rose-300 text-rose-800',
    numColor: 'text-rose-700',
    badge: 'border-rose-400 text-rose-800 bg-rose-100',
    insideWash: 'rgba(244, 63, 94, 0.08)',
    shimmer: 'rgba(244, 63, 94, 0.18)',
  },
}

export function WorkflowBooksSection() {
  const [openWorkflowCard, setOpenWorkflowCard] = useState<string | null>(null)
  const [bookColors, setBookColors] = useState<Record<string, BookColorKey>>({
    '01': 'amber',
    '02': 'blue',
    '03': 'emerald',
  })

  return (
    <section className="relative z-10 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="brand-kicker">Workflow Architecture</p>
          <h2 className="section-title mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            How SyncBoard Works
          </h2>
          <p className="section-copy mt-4 text-base sm:text-lg">
            From an empty canvas to an interconnected knowledge board in three simple steps.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {WORKFLOW_STEPS.map((step) => {
            const isOpen = openWorkflowCard === step.step
            const colorKey: BookColorKey =
              bookColors[step.step] ||
              (step.step === '01' ? 'amber' : step.step === '02' ? 'blue' : 'emerald')
            const palette = BOOK_COLOR_PALETTES[colorKey]

            return (
              <div
                key={step.step}
                onClick={() => setOpenWorkflowCard(isOpen ? null : step.step)}
                className={`group relative h-full min-h-[350px] sm:min-h-[380px] rounded-[2rem] [perspective:2000px] [transform-style:preserve-3d] transition-all duration-500 hover:z-30 cursor-pointer ${palette.glow}`}
              >
                {/* Hanging Silk Ribbon Bookmark */}
                <div
                  className={`absolute -top-1.5 left-8 z-30 w-4 h-9 ${palette.ribbon} shadow-md transition-all duration-500 group-hover:h-11 pointer-events-none`}
                  style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)',
                  }}
                  title="Bookmark ribbon"
                />

                {/* Inside Book Page (Revealed when cover rotates open, 100% clear with zero cover overlap) */}
                <div
                  className="paper-card relative flex h-full flex-col justify-between rounded-[2rem] bg-white pl-10 pr-8 py-8 shadow-[0_12px_32px_rgba(15,23,42,0.06)] border border-slate-200/80 [transform-style:preserve-3d] transition-all duration-500 overflow-hidden"
                  style={{
                    backgroundColor: '#ffffff',
                    backgroundImage: `radial-gradient(circle at top right, ${palette.insideWash}, transparent 70%)`,
                  }}
                >
                  {/* Realistic Stacked Paper Leaf Texture (Right edge) */}
                  <div className="absolute right-0 top-5 bottom-5 w-1.5 flex flex-col justify-between py-1 opacity-70 pointer-events-none">
                    <div className="w-full h-full border-r-2 border-slate-300/80 rounded-r-sm" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-3xl font-black ${palette.numColor} transition-colors duration-500`}>
                        {step.step}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${palette.badge} transition-colors duration-500`}
                      >
                        {step.kicker}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
                      {step.title}
                    </h3>
                    <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base text-slate-600">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {step.tag}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${palette.tagBg} transition-colors duration-500`}
                    >
                      {palette.name}
                    </span>
                  </div>
                </div>

                {/* 3D Double-Sided Book Cover Wrapper (Swings open to -120deg to completely clear the book's text) */}
                <div
                  className={`absolute inset-0 z-20 origin-left transition-all duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(-120deg)] group-hover:shadow-[-14px_22px_42px_rgba(15,23,42,0.20)] ${
                    isOpen ? '[transform:rotateY(-120deg)] shadow-[-14px_22px_42px_rgba(15,23,42,0.20)]' : ''
                  }`}
                >
                  {/* FRONT COVER (100% Solid, Zero Transparency, [backface-visibility:hidden]) */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-between rounded-[2rem] border ${palette.coverBorder} ${palette.coverBg} p-8 shadow-[1px_1px_16px_rgba(15,23,42,0.08)] cursor-pointer [backface-visibility:hidden]`}
                  >
                    {/* Left book spine crease & hinge */}
                    <div className={`absolute left-0 top-0 bottom-0 w-4 rounded-l-[2rem] ${palette.spine} transition-colors duration-500`} />

                    {/* Top Bar: Volume Label & Interactive Color Swatches */}
                    <div className="flex items-center justify-between relative z-10 pl-2">
                      <span className={`font-mono text-xs font-black uppercase tracking-widest ${palette.numColor} transition-colors duration-500`}>
                        Vol. {step.step}
                      </span>

                      {/* Interactive Color Dots */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 px-2 py-1 shadow-sm"
                        title="Pick book cover color"
                      >
                        {(Object.keys(BOOK_COLOR_PALETTES) as BookColorKey[]).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setBookColors((prev) => ({ ...prev, [step.step]: c }))}
                            className={`h-3 w-3 rounded-full transition-all duration-200 ${BOOK_COLOR_PALETTES[c].dotClass} ${
                              colorKey === c
                                ? 'scale-125 ring-2 ring-offset-1 ring-slate-400'
                                : 'opacity-70 hover:opacity-100 hover:scale-110'
                            }`}
                            aria-label={`Select ${BOOK_COLOR_PALETTES[c].name} color`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Center: Book Cover Title (Clean, 100% opaque, zero bleed-through) */}
                    <div className="my-auto py-4 pl-2 text-center">
                      <p className="text-[20px] sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
                        {step.title}
                      </p>
                    </div>

                    {/* Bottom Bar: Color theme name & interactive prompt */}
                    <div className="flex items-center justify-between pl-2 pt-2 border-t border-slate-300/60 text-[11px] font-semibold text-slate-600">
                      <span className="uppercase tracking-wider font-bold">{palette.name}</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-slate-800">
                        Flip open &rarr;
                      </span>
                    </div>
                  </div>

                  {/* INSIDE OF FRONT COVER (Lining visible when flipped past 90deg, [transform:rotateY(180deg)] [backface-visibility:hidden]) */}
                  <div
                    className={`absolute inset-0 flex flex-col justify-between rounded-[2rem] border ${palette.coverBorder} ${palette.insideCoverBg} p-8 [transform:rotateY(180deg)] [backface-visibility:hidden] cursor-pointer shadow-inner`}
                  >
                    {/* Inside Spine binding on right edge of flipped cover */}
                    <div className="absolute right-0 top-0 bottom-0 w-4 rounded-r-[2rem] bg-gradient-to-l from-slate-300/40 via-transparent to-transparent border-l border-slate-200/50" />

                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 uppercase tracking-widest pr-2">
                      <span>Vol. {step.step}</span>
                      <span>{palette.name}</span>
                    </div>

                    {/* Bookplate emblem */}
                    <div className="my-auto flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-300/80 bg-white/70">
                      <div className={`h-8 w-8 rounded-full ${palette.dotClass.split(' ')[0]} flex items-center justify-center text-white text-xs font-mono font-bold mb-1.5 shadow-sm`}>
                        {step.step}
                      </div>
                      <p className="font-serif italic text-xs text-slate-700 font-medium">
                        SyncBoard Architecture
                      </p>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">
                        {step.kicker}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-400 text-center pr-2">
                      &larr; Click or hover away to close
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
