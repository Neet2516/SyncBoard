import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './CinematicPreloader.css'

interface CinematicPreloaderProps {
  isReady: boolean
  onComplete: () => void
}

interface TrailNote {
  id: string
  title: string
  body: string
  color: {
    surface: string
    border: string
    header: string
    pin: string
    text: string
  }
}

const TRAIL_NOTES: TrailNote[] = [
  {
    id: 'note-1',
    title: 'Idea Flow',
    body: 'Infinite visual canvas',
    color: {
      surface: 'linear-gradient(165deg, #fefce8 0%, #fef08a 100%)',
      border: '#fde047',
      header: 'rgba(254, 240, 138, 0.6)',
      pin: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
      text: '#854d0e',
    },
  },
  {
    id: 'note-2',
    title: 'Live Sync',
    body: 'Conflict-free CRDTs',
    color: {
      surface: 'linear-gradient(165deg, #eff6ff 0%, #bfdbfe 100%)',
      border: '#93c5fd',
      header: 'rgba(191, 219, 254, 0.6)',
      pin: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
      text: '#1e40af',
    },
  },
  {
    id: 'note-3',
    title: 'Creative Wall',
    body: 'Pin, connect & organize',
    color: {
      surface: 'linear-gradient(165deg, #fff1f2 0%, #fecdd3 100%)',
      border: '#fda4af',
      header: 'rgba(254, 205, 211, 0.6)',
      pin: 'linear-gradient(180deg, #e11d48 0%, #be123c 100%)',
      text: '#9f1239',
    },
  },
  {
    id: 'note-4',
    title: 'Multiplayer',
    body: 'Real-time collaborative cursors',
    color: {
      surface: 'linear-gradient(165deg, #f0fdf4 0%, #bbf7d0 100%)',
      border: '#86efac',
      header: 'rgba(187, 247, 208, 0.6)',
      pin: 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
      text: '#166534',
    },
  },
  {
    id: 'note-5',
    title: 'Spatial Notes',
    body: 'Think without borders',
    color: {
      surface: 'linear-gradient(165deg, #faf5ff 0%, #e9d5ff 100%)',
      border: '#d8b4fe',
      header: 'rgba(233, 213, 255, 0.6)',
      pin: 'linear-gradient(180deg, #9333ea 0%, #7e22ce 100%)',
      text: '#6b21a8',
    },
  },
  {
    id: 'note-6',
    title: 'Flow State',
    body: 'Draw, drag & drop notes',
    color: {
      surface: 'linear-gradient(165deg, #ecfeff 0%, #a5f3fc 100%)',
      border: '#67e8f9',
      header: 'rgba(165, 243, 252, 0.6)',
      pin: 'linear-gradient(180deg, #0891b2 0%, #0e7490 100%)',
      text: '#155e75',
    },
  },
  {
    id: 'note-7',
    title: 'SyncBoard',
    body: 'Everything stays in sync',
    color: {
      surface: 'linear-gradient(165deg, #ffffff 0%, #f1f5f9 100%)',
      border: '#cbd5e1',
      header: 'rgba(241, 245, 249, 0.7)',
      pin: 'linear-gradient(180deg, #0f172a 0%, #334155 100%)',
      text: '#334155',
    },
  },
]

export function CinematicPreloader({ isReady, onComplete }: CinematicPreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const trailContainerRef = useRef<HTMLDivElement>(null)
  const noteElementsRef = useRef<(HTMLDivElement | null)[]>([])
  const svgConnectorsRef = useRef<SVGSVGElement>(null)
  const connectorPathsRef = useRef<(SVGPathElement | null)[]>([])

  const progressProxyRef = useRef({ value: 0 })
  const hasStartedExitRef = useRef(false)
  const isReadyRef = useRef(isReady)
  const onCompleteRef = useRef(onComplete)

  isReadyRef.current = isReady
  onCompleteRef.current = onComplete

  const updateCounterText = (val: number) => {
    if (!counterRef.current) return
    const clamped = Math.min(100, Math.max(0, Math.round(val)))
    counterRef.current.textContent = String(clamped).padStart(2, '0')
  }

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      updateCounterText(100)
    }

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return

      // Fluid unorganised floating path for the NoteNode trail
      // Each note follows these waypoints with a progressive phase offset
      const waypoints = [
        { x: -160, y: -110, rotate: -14, scale: 0.94 },
        { x: 120, y: -180, rotate: 10, scale: 1.05 },
        { x: 280, y: -30, rotate: -8, scale: 0.96 },
        { x: 160, y: 150, rotate: 16, scale: 1.06 },
        { x: -110, y: 180, rotate: -12, scale: 0.92 },
        { x: -280, y: 50, rotate: 8, scale: 1.02 },
        { x: -160, y: -110, rotate: -14, scale: 0.94 },
      ]

      const loopDuration = 6.8
      const noteCount = TRAIL_NOTES.length

      noteElementsRef.current.forEach((el, index) => {
        if (!el) return

        // Time offset creates the "follow-the-leader" organic snake trail
        const delayOffset = (index / noteCount) * loopDuration

        // Intrinsic unique micro-tilt for unorganised character
        const naturalTilt = ((index % 5) - 2) * 3

        const tl = gsap.timeline({ repeat: -1 })

        waypoints.forEach((wp) => {
          tl.to(el, {
            x: wp.x + ((index % 3) - 1) * 25,
            y: wp.y + ((index % 2) === 0 ? 15 : -15),
            rotation: wp.rotate + naturalTilt,
            scale: wp.scale,
            duration: loopDuration / (waypoints.length - 1),
            ease: 'sine.inOut',
          })
        })

        // Seek forward by the delay offset so they start spread out along the curve
        tl.seek(delayOffset)
      })

      // Frame-by-frame connector edge updater (dashed lines linking trailing notes)
      const updateConnectors = () => {
        if (!svgConnectorsRef.current) return
        const rootRect = rootRef.current?.getBoundingClientRect()
        if (!rootRect) return

        for (let i = 0; i < noteCount - 1; i++) {
          const fromEl = noteElementsRef.current[i]
          const toEl = noteElementsRef.current[i + 1]
          const pathEl = connectorPathsRef.current[i]

          if (!fromEl || !toEl || !pathEl) continue

          const r1 = fromEl.getBoundingClientRect()
          const r2 = toEl.getBoundingClientRect()

          const x1 = r1.left + r1.width / 2 - rootRect.left
          const y1 = r1.top + r1.height / 2 - rootRect.top
          const x2 = r2.left + r2.width / 2 - rootRect.left
          const y2 = r2.top + r2.height / 2 - rootRect.top

          const dx = (x2 - x1) * 0.4
          const dy = (y2 - y1) * 0.4

          // Cubic bezier curve between connected trailing notes
          const d = `M ${x1} ${y1} C ${x1 + dx} ${y1 - dy}, ${x2 - dx} ${y2 + dy}, ${x2} ${y2}`
          pathEl.setAttribute('d', d)
        }
      }

      gsap.ticker.add(updateConnectors)

      // Smooth counter climb toward 92%
      gsap.to(progressProxyRef.current, {
        value: 92,
        duration: 2.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (!hasStartedExitRef.current) {
            updateCounterText(progressProxyRef.current.value)
          }
        },
      })

      return () => {
        gsap.ticker.remove(updateConnectors)
      }
    }, rootRef)

    return () => {
      document.documentElement.style.overflow = previousOverflow
      ctx.revert()
    }
  }, [])

  // Exit animation once ready: counter finishes to 100%, notes scatter gracefully, screen dissolves
  useEffect(() => {
    if (!isReady || hasStartedExitRef.current) return
    hasStartedExitRef.current = true

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.out',
          onComplete: () => {
            document.documentElement.style.overflow = ''
            onCompleteRef.current()
          },
        })
        return
      }

      gsap.killTweensOf(progressProxyRef.current)

      const exitTl = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = ''
          onCompleteRef.current()
        },
      })

      // 1. Finish counter to 100%
      exitTl.to(progressProxyRef.current, {
        value: 100,
        duration: 0.45,
        ease: 'power3.out',
        onUpdate: () => updateCounterText(progressProxyRef.current.value),
      })

      // 2. NoteNodes accelerate and scatter outward past viewport
      exitTl.to(
        noteElementsRef.current,
        {
          x: (i) => (i % 2 === 0 ? '-=450' : '+=450'),
          y: (i) => (i < 3 ? '-=350' : '+=350'),
          rotation: (i) => (i % 2 === 0 ? -45 : 45),
          scale: 1.35,
          opacity: 0,
          duration: 0.65,
          stagger: 0.03,
          ease: 'expo.in',
        },
        '>-0.1'
      )

      exitTl.to(
        svgConnectorsRef.current,
        {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
        },
        '<'
      )

      // 3. Counter exit
      exitTl.to(
        counterRef.current?.parentElement || '.preloader-counter-wrap',
        {
          scale: 0.85,
          y: -24,
          opacity: 0,
          duration: 0.4,
          ease: 'power3.in',
        },
        '<-0.05'
      )

      // 4. Clean dissolution to reveal the website
      exitTl.set(rootRef.current, { pointerEvents: 'none' })
      exitTl.to(rootRef.current, {
        opacity: 0,
        duration: 0.42,
        ease: 'power2.out',
      })
    }, rootRef)

    return () => {
      ctx.revert()
    }
  }, [isReady])

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading SyncBoard"
      className="preloader-root flex flex-col items-center justify-center p-6"
    >
      {/* Dynamic SVG dashed lines trailing between NoteNodes */}
      <svg
        ref={svgConnectorsRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 5 }}
      >
        {TRAIL_NOTES.slice(0, -1).map((_, i) => (
          <path
            key={`connector-${i}`}
            ref={(el) => (connectorPathsRef.current[i] = el)}
            fill="none"
            stroke="rgba(148, 163, 184, 0.45)"
            strokeWidth="2.5"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Floating Trail of NoteNodes following each other */}
      <div
        ref={trailContainerRef}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        {TRAIL_NOTES.map((note, index) => (
          <div
            key={note.id}
            ref={(el) => (noteElementsRef.current[index] = el)}
            className="preloader-note-trail-item -ml-[85px] -mt-[62px] sm:-ml-[100px] sm:-mt-[72px]"
            style={{ zIndex: 10 + index }}
          >
            {/* The signature SyncBoard Push-Pin */}
            <div className="trail-pin" style={{ background: note.color.pin }}>
              <div className="trail-pin-shine" />
              <div className="trail-pin-needle" />
            </div>

            {/* NoteNode Card Body */}
            <div
              className="trail-note-card"
              style={{
                background: note.color.surface,
                borderColor: note.color.border,
              }}
            >
              {/* Header with Grip handle */}
              <div
                className="flex h-7 shrink-0 items-center justify-between px-3"
                style={{
                  background: note.color.header,
                  borderBottom: `1px solid ${note.color.border}`,
                }}
              >
                <div className="flex items-center gap-1 opacity-70">
                  <span className="h-2 w-2 rounded-full bg-black/20" />
                  <span className="h-2 w-2 rounded-full bg-black/20" />
                  <span className="h-2 w-2 rounded-full bg-black/20" />
                </div>
                {/* Micro grip icon */}
                <div className="flex gap-1 text-[10px] text-black/35 font-bold">
                  :::
                </div>
              </div>

              {/* Note Content */}
              <div className="flex flex-1 flex-col justify-center px-3.5 py-2">
                <p
                  className="truncate text-xs font-bold tracking-tight sm:text-sm"
                  style={{ color: note.color.text }}
                >
                  {note.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-slate-600 sm:text-xs">
                  {note.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pure animation count on clean white background */}
      <div
        className="preloader-counter-wrap relative z-20 flex select-none items-baseline gap-1.5"
      >
        <span ref={counterRef} className="preloader-counter">
          00
        </span>
        <span className="text-3xl font-extrabold text-blue-600 sm:text-5xl lg:text-6xl">
          %
        </span>
      </div>
    </div>
  )
}
