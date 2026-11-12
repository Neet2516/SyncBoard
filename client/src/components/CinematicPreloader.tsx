import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './CinematicPreloader.css'

interface CinematicPreloaderProps {
  isReady: boolean
  onComplete: () => void
}

const BRAND_LETTERS = 'SYNCBOARD'.split('')

export function CinematicPreloader({ isReady, onComplete }: CinematicPreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const coreGroupRef = useRef<HTMLDivElement>(null)
  const morphShapeRef = useRef<HTMLDivElement>(null)
  const innerDiamondRef = useRef<HTMLDivElement>(null)
  const orbitRingRef = useRef<HTMLDivElement>(null)
  const shardLeftRef = useRef<HTMLDivElement>(null)
  const shardRightRef = useRef<HTMLDivElement>(null)
  const shardTopRef = useRef<HTMLDivElement>(null)
  const taglineMaskRef = useRef<HTMLDivElement>(null)
  const portalVeilRef = useRef<HTMLDivElement>(null)

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

      // Continuous morphing & orbital motion of the central geometric sculpture
      gsap.to(orbitRingRef.current, {
        rotation: 360,
        duration: 14,
        repeat: -1,
        ease: 'none',
      })

      gsap.to(innerDiamondRef.current, {
        rotation: -360,
        duration: 10,
        repeat: -1,
        ease: 'none',
      })

      // Continuous morphing clip-path & scale pulse on the central core
      gsap
        .timeline({ repeat: -1, yoyo: true })
        .to(morphShapeRef.current, {
          scale: 1.08,
          rotation: 45,
          borderRadius: '38% 62% 55% 45% / 48% 36% 64% 52%',
          duration: 1.4,
          ease: 'sine.inOut',
        })
        .to(morphShapeRef.current, {
          scale: 0.94,
          rotation: 115,
          borderRadius: '58% 42% 34% 66% / 38% 62% 38% 62%',
          duration: 1.4,
          ease: 'sine.inOut',
        })
        .to(morphShapeRef.current, {
          scale: 1.04,
          rotation: 180,
          borderRadius: '28% 72% 46% 54% / 60% 44% 56% 40%',
          duration: 1.4,
          ease: 'sine.inOut',
        })

      // Abstract floating shards sweeping across the canvas
      gsap.to(shardLeftRef.current, {
        x: 28,
        y: -22,
        rotation: 14,
        scale: 1.06,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to(shardRightRef.current, {
        x: -26,
        y: 24,
        rotation: -18,
        scale: 0.94,
        duration: 2.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to(shardTopRef.current, {
        y: 18,
        rotation: 90,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      })

      // Intro orchestration: typography, geometry, and initial progress climb
      const introTl = gsap.timeline()

      introTl
        .from('.preloader-telemetry', {
          y: 16,
          opacity: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: 'power3.out',
        })
        .from(
          coreGroupRef.current,
          {
            scale: 0.55,
            opacity: 0,
            rotation: -35,
            duration: 0.8,
            ease: 'expo.out',
          },
          0.05
        )
        .from(
          '.preloader-char',
          {
            yPercent: 115,
            rotateZ: 6,
            opacity: 0,
            duration: 0.72,
            stagger: 0.032,
            ease: 'expo.out',
          },
          0.12
        )
        .fromTo(
          taglineMaskRef.current,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.65, ease: 'power3.out' },
          0.32
        )

      // Smoothly climb toward 92% while waiting for page/font readiness and minimum duration
      gsap.to(progressProxyRef.current, {
        value: 92,
        duration: 2.6,
        ease: 'power2.out',
        onUpdate: () => {
          if (!hasStartedExitRef.current) {
            updateCounterText(progressProxyRef.current.value)
          }
        },
      })
    }, rootRef)

    return () => {
      document.documentElement.style.overflow = previousOverflow
      ctx.revert()
    }
  }, [])

  // Trigger final 100% completion and seamless viewport expansion exit once ready
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

      // 1. Finish counter smoothly to 100
      exitTl.to(progressProxyRef.current, {
        value: 100,
        duration: 0.45,
        ease: 'power3.out',
        onUpdate: () => updateCounterText(progressProxyRef.current.value),
      })

      // 2. Crisp typographic & telemetry exit
      exitTl.to(
        '.preloader-char',
        {
          yPercent: -115,
          opacity: 0,
          duration: 0.45,
          stagger: 0.02,
          ease: 'power3.in',
        },
        '>-0.1'
      )

      exitTl.to(
        [taglineMaskRef.current, '.preloader-telemetry', '.preloader-counter-wrap'],
        {
          y: -18,
          opacity: 0,
          duration: 0.36,
          stagger: 0.04,
          ease: 'power2.in',
        },
        '<'
      )

      // 3. Abstract shards sweep out beyond the viewport
      exitTl.to(
        shardLeftRef.current,
        { xPercent: -180, yPercent: -80, scale: 2.2, rotation: -45, opacity: 0, duration: 0.7, ease: 'expo.inOut' },
        '<-0.05'
      )
      exitTl.to(
        shardRightRef.current,
        { xPercent: 180, yPercent: 80, scale: 2.4, rotation: 55, opacity: 0, duration: 0.7, ease: 'expo.inOut' },
        '<'
      )
      exitTl.to(
        shardTopRef.current,
        { yPercent: -220, scale: 1.8, rotation: 180, opacity: 0, duration: 0.65, ease: 'expo.inOut' },
        '<'
      )

      // 4. Central sculpture scales past the viewport while the bright SyncBoard hero veil expands
      exitTl.to(
        coreGroupRef.current,
        {
          scale: 16,
          rotation: 120,
          opacity: 0,
          duration: 0.85,
          ease: 'expo.inOut',
        },
        '<-0.05'
      )

      exitTl.to(
        portalVeilRef.current,
        {
          clipPath: 'circle(145% at 50% 50%)',
          duration: 0.78,
          ease: 'expo.inOut',
        },
        '<0.08'
      )

      // 5. Dissolve the light veil seamlessly into the actual hero canvas underneath
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
      className="preloader-root flex flex-col justify-between p-5 sm:p-8 lg:p-12"
    >
      {/* Layered atmosphere, architectural grid & subtle film grain */}
      <div className="preloader-atmosphere" aria-hidden="true" />
      <div className="preloader-grid" aria-hidden="true" />
      <div className="preloader-grain" aria-hidden="true" />

      {/* Abstract geometric shapes orbiting & overlapping */}
      <div
        ref={shardLeftRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-[18%] h-48 w-48 rounded-[42%] border border-blue-400/25 bg-gradient-to-br from-blue-600/20 to-cyan-400/5 sm:h-72 sm:w-72"
      />
      <div
        ref={shardRightRef}
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 bottom-[14%] h-52 w-52 rounded-full border border-cyan-300/25 bg-gradient-to-tl from-cyan-500/20 to-blue-600/5 sm:h-80 sm:w-80"
      />
      <div
        ref={shardTopRef}
        aria-hidden="true"
        className="pointer-events-none absolute right-[18%] top-[12%] h-14 w-28 rounded-full border border-white/15 bg-white/5 sm:h-16 sm:w-36"
      />

      {/* Top metadata bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400 sm:text-xs">
        <div className="preloader-telemetry flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
          <span>SyncBoard // Studio</span>
        </div>
        <div className="preloader-telemetry hidden sm:block text-slate-500">
          Spatial CRDT Workspace
        </div>
        <div className="preloader-telemetry text-blue-400">Live Engine</div>
      </header>

      {/* Centerpiece: Morphing geometric core + Oversized staggered typography */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        {/* Morphing Geometric Centerpiece */}
        <div
          ref={coreGroupRef}
          aria-hidden="true"
          className="pointer-events-none relative mb-6 flex h-36 w-36 items-center justify-center sm:mb-8 sm:h-48 sm:w-48 lg:h-56 lg:w-56"
        >
          {/* Outer orbital ring */}
          <div
            ref={orbitRingRef}
            className="absolute inset-0 rounded-full border border-dashed border-blue-400/35"
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
          </div>

          {/* Morphing gradient core */}
          <div
            ref={morphShapeRef}
            className="absolute inset-5 rounded-[36%_64%_54%_46%/44%_38%_62%_56%] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 opacity-90 shadow-[0_0_70px_rgba(37,99,235,0.55)]"
          />

          {/* Counter-rotating geometric wireframe */}
          <div
            ref={innerDiamondRef}
            className="absolute inset-9 rounded-2xl border border-white/60 mix-blend-overlay"
          />

          {/* Crisp central emblem */}
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/40 bg-slate-950/60 backdrop-blur-md sm:h-14 sm:w-14">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
              <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
            </svg>
          </div>
        </div>

        {/* Oversized Animated Typography */}
        <h1 className="preloader-wordmark text-center text-white" aria-label="SyncBoard">
          {BRAND_LETTERS.map((char, index) => (
            <span key={`${char}-${index}`} className="preloader-char-mask">
              <span className="preloader-char">{char}</span>
            </span>
          ))}
        </h1>

        <div
          ref={taglineMaskRef}
          className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-blue-300/90 sm:mt-4 sm:text-xs"
        >
          Think Spatially &bull; Create Together
        </div>
      </div>

      {/* Bottom telemetry & dynamic 00-100% counter */}
      <footer className="relative z-10 flex items-end justify-between gap-4">
        <div className="preloader-telemetry max-w-[200px] text-[10px] leading-relaxed tracking-[0.18em] text-slate-500 uppercase sm:max-w-xs sm:text-xs">
          Initializing shared canvas &amp; real-time presence
        </div>

        <div className="preloader-counter-wrap flex items-baseline gap-1 text-right">
          <span ref={counterRef} className="preloader-counter text-white">
            00
          </span>
          <span className="text-lg font-bold text-blue-500 sm:text-2xl">%</span>
        </div>
      </footer>

      {/* Expanding radial portal veil that bridges into the light SyncBoard hero */}
      <div ref={portalVeilRef} className="preloader-portal-veil" aria-hidden="true" />
    </div>
  )
}

