import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

interface DeveloperProfile {
  name: string
  role: string
  blurb: string
  email: string
  github: string
  linkedin: string
  discord: string
}

const DEVELOPER_PROFILE: DeveloperProfile = {
  name: 'Navneet',
  role: 'Full-stack developer',
  blurb:
    'SyncBoard was designed and built by Navneet as a real-time collaboration workspace for teams that think visually and move fast.',
  email: 'getneet.25@gmail.com',
  github: 'https://github.com/Neet2516',
  linkedin: 'https://www.linkedin.com/in/sinha-navneet/',
  discord: 'https://discord.com/users/kailler_53339',
}

type Direction = 'top' | 'right' | 'bottom' | 'left'

interface SelectionRect {
  top: number
  left: number
  width: number
  height: number
  rawWidth: number
  rawHeight: number
  borderRadius: string
}

/**
 * Calculates pointer entry/exit direction relative to an element
 * 0: right, 1: bottom, 2: left, 3: top
 */
function getEntryDirection(e: React.MouseEvent<HTMLElement>, el: HTMLElement): Direction {
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  const rad = Math.atan2(y / (rect.height || 1), x / (rect.width || 1))
  const d = Math.round(rad / (Math.PI / 2) + 4) % 4
  const directions: Direction[] = ['right', 'bottom', 'left', 'top']
  return directions[d]
}

const iconFillVariants: Variants = {
  initial: (dir: Direction) => ({
    x: dir === 'left' ? '-100%' : dir === 'right' ? '100%' : 0,
    y: dir === 'top' ? '-100%' : dir === 'bottom' ? '100%' : 0,
    opacity: 0.9,
  }),
  animate: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 28,
      mass: 0.7,
    },
  },
  exit: (dir: Direction) => ({
    x: dir === 'left' ? '-100%' : dir === 'right' ? '100%' : 0,
    y: dir === 'top' ? '-100%' : dir === 'bottom' ? '100%' : 0,
    opacity: 0.7,
    transition: {
      duration: 0.22,
      ease: 'easeOut' as const,
    },
  }),
}

interface DirectionAwareContactCardProps {
  href: string
  label: string
  value: string
  icon: React.ReactNode
  onHoverTarget: (el: HTMLElement | null) => void
  reducedMotion: boolean
}

function DirectionAwareContactCard({
  href,
  label,
  value,
  icon,
  onHoverTarget,
  reducedMotion,
}: DirectionAwareContactCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const [direction, setDirection] = useState<Direction>('left')
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const dir = getEntryDirection(e, iconRef.current || e.currentTarget)
    setDirection(dir)
    setIsHovered(true)
    if (cardRef.current) {
      onHoverTarget(cardRef.current)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const dir = getEntryDirection(e, iconRef.current || e.currentTarget)
    setDirection(dir)
    setIsHovered(false)
  }

  const handleFocus = () => {
    if (cardRef.current) {
      setIsHovered(true)
      onHoverTarget(cardRef.current)
    }
  }

  const handleBlur = () => {
    setIsHovered(false)
  }

  return (
    <a
      ref={cardRef}
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      data-card="true"
      className="group relative flex min-w-[220px] flex-1 items-center gap-4 rounded-[1.4rem] border border-white/70 bg-white/58 px-4 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/80 hover:bg-white/80 hover:shadow-[0_20px_45px_rgba(37,99,235,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:max-w-[260px]"
    >
      {/* Direction-Aware Icon Badge Container */}
      <div
        ref={iconRef}
        onMouseEnter={(e) => {
          e.stopPropagation()
          const dir = getEntryDirection(e, e.currentTarget)
          setDirection(dir)
          setIsHovered(true)
        }}
        onMouseLeave={(e) => {
          e.stopPropagation()
          const dir = getEntryDirection(e, e.currentTarget)
          setDirection(dir)
        }}
        className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-200/70 bg-blue-50/90 text-blue-600 shadow-[0_8px_18px_rgba(37,99,235,0.12)] transition-all duration-300 group-hover:border-blue-400/80 group-hover:shadow-[0_12px_24px_rgba(37,99,235,0.24)]"
      >
        {/* Base Icon */}
        <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
          {icon}
        </span>

        {/* Directional Color-Fill Overlay (Royal Blue) */}
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.div
              key="fill-overlay"
              custom={direction}
              variants={reducedMotion ? undefined : iconFillVariants}
              initial={reducedMotion ? { opacity: 0 } : 'initial'}
              animate={reducedMotion ? { opacity: 1 } : 'animate'}
              exit={reducedMotion ? { opacity: 0 } : 'exit'}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.35)]"
            >
              <span className="scale-105">{icon}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Label and Value */}
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-900 transition-colors duration-200 group-hover:text-blue-600">
          {label}
        </span>
        <span className="block truncate text-sm text-slate-500 transition-colors duration-200 group-hover:text-slate-700">
          {value}
        </span>
      </span>
    </a>
  )
}

export function DirectionAwareFooter() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null)
  const [rect, setRect] = useState<SelectionRect | null>(null)
  const [isFinePointer, setIsFinePointer] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Detect pointer capability and user motion preference
  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    setIsFinePointer(pointerQuery.matches)
    setReducedMotion(motionQuery.matches)

    const updatePointer = (e: MediaQueryListEvent) => setIsFinePointer(e.matches)
    const updateMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches)

    pointerQuery.addEventListener('change', updatePointer)
    motionQuery.addEventListener('change', updateMotion)

    return () => {
      pointerQuery.removeEventListener('change', updatePointer)
      motionQuery.removeEventListener('change', updateMotion)
    }
  }, [])

  // Calculate target element rect relative to the footer container
  const updateRect = useCallback(() => {
    if (!activeElement || !containerRef.current) {
      setRect(null)
      return
    }

    const cRect = containerRef.current.getBoundingClientRect()
    const eRect = activeElement.getBoundingClientRect()

    const isCard = activeElement.hasAttribute('data-card')
    const padX = isCard ? 0 : 8
    const padY = isCard ? 0 : 4

    setRect({
      top: eRect.top - cRect.top - padY,
      left: eRect.left - cRect.left - padX,
      width: eRect.width + padX * 2,
      height: eRect.height + padY * 2,
      rawWidth: Math.round(eRect.width),
      rawHeight: Math.round(eRect.height),
      borderRadius: isCard ? '1.4rem' : '0.5rem',
    })
  }, [activeElement])

  // Synchronize on scroll, resize, or element changes
  useEffect(() => {
    if (!activeElement) return
    updateRect()

    const handleResize = () => updateRect()
    const handleScroll = () => updateRect()

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    const ro = new ResizeObserver(updateRect)
    if (containerRef.current) ro.observe(containerRef.current)
    ro.observe(activeElement)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      ro.disconnect()
    }
  }, [activeElement, updateRect])

  const handleElementHover = (el: HTMLElement | null) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    if (el) {
      setActiveElement(el)
    }
  }

  const handleContainerMouseLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
    }
    leaveTimerRef.current = setTimeout(() => {
      setActiveElement(null)
    }, 140)
  }

  return (
    <footer className="relative z-10 border-t border-white/60 bg-white/42 py-12 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Glassmorphic Container with Direction-Aware Selection */}
        <div
          ref={containerRef}
          onMouseLeave={handleContainerMouseLeave}
          className="relative rounded-[2rem] border border-white/60 bg-white/42 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        >
          {/* Shared Figma-Style Selection Frame */}
          <AnimatePresence>
            {rect && isFinePointer && (
              <motion.div
                key="shared-selection-frame"
                initial={
                  reducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        borderRadius: rect.borderRadius,
                      }
                }
                animate={{
                  opacity: 1,
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                  borderRadius: rect.borderRadius,
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.16, ease: 'easeOut' },
                }}
                transition={
                  reducedMotion
                    ? { duration: 0.1 }
                    : {
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                        mass: 0.75,
                      }
                }
                className="pointer-events-none absolute z-30 border-[1.5px] border-blue-500 bg-blue-500/[0.035] shadow-[0_0_0_1px_rgba(37,99,235,0.18),0_8px_20px_-4px_rgba(37,99,235,0.12)]"
                style={{
                  willChange: 'top, left, width, height',
                }}
              >
                {/* 4 Corner Resize Handles */}
                <div className="absolute -top-1.5 -left-1.5 h-2.5 w-2.5 rounded-[1.5px] border-[1.5px] border-blue-600 bg-white shadow-sm" />
                <div className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-[1.5px] border-[1.5px] border-blue-600 bg-white shadow-sm" />
                <div className="absolute -bottom-1.5 -left-1.5 h-2.5 w-2.5 rounded-[1.5px] border-[1.5px] border-blue-600 bg-white shadow-sm" />
                <div className="absolute -bottom-1.5 -right-1.5 h-2.5 w-2.5 rounded-[1.5px] border-[1.5px] border-blue-600 bg-white shadow-sm" />

                {/* 4 Edge Midpoint Resize Handles */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-[1.5px] border-[1.5px] border-blue-600 bg-white shadow-sm" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-[1.5px] border-[1.5px] border-blue-600 bg-white shadow-sm" />
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-2.5 w-2.5 rounded-[1.5px] border-[1.5px] border-blue-600 bg-white shadow-sm" />
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-2.5 w-2.5 rounded-[1.5px] border-[1.5px] border-blue-600 bg-white shadow-sm" />

                {/* Floating Dimension Indicator (Figma HUD pill) */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded bg-blue-600 px-2 py-0.5 text-[9px] font-mono font-bold text-white shadow-md pointer-events-none whitespace-nowrap"
                  style={{
                    top:
                      rect.top + rect.height >
                      (containerRef.current?.clientHeight || 450) - 35
                        ? '-24px'
                        : undefined,
                    bottom:
                      rect.top + rect.height >
                      (containerRef.current?.clientHeight || 450) - 35
                        ? undefined
                        : '-24px',
                  }}
                >
                  <span className="opacity-80">W:</span>
                  <span>{rect.rawWidth}</span>
                  <span className="opacity-50">×</span>
                  <span className="opacity-80">H:</span>
                  <span>{rect.rawHeight}</span>
                  <span className="text-[8px] opacity-70 font-normal">px</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            {/* Eyebrow Header */}
            <p className="brand-kicker mb-3">About the developer</p>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                {/* 1. Heading: Built by Navneet */}
                <h2
                  onMouseEnter={(e) => handleElementHover(e.currentTarget)}
                  onFocus={(e) => handleElementHover(e.currentTarget)}
                  tabIndex={0}
                  className="section-title text-3xl text-slate-950 inline-block w-fit cursor-default rounded focus:outline-none"
                >
                  Built by {DEVELOPER_PROFILE.name}
                </h2>

                {/* 2. Designation: FULL-STACK DEVELOPER */}
                <div>
                  <p
                    onMouseEnter={(e) => handleElementHover(e.currentTarget)}
                    onFocus={(e) => handleElementHover(e.currentTarget)}
                    tabIndex={0}
                    className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600/90 inline-block w-fit cursor-default rounded focus:outline-none"
                  >
                    {DEVELOPER_PROFILE.role}
                  </p>
                </div>

                {/* 3. Developer Description */}
                <p
                  onMouseEnter={(e) => handleElementHover(e.currentTarget)}
                  onFocus={(e) => handleElementHover(e.currentTarget)}
                  tabIndex={0}
                  className="section-copy mt-4 text-base cursor-default rounded focus:outline-none"
                >
                  {DEVELOPER_PROFILE.blurb} It blends shared presence, sticky-note thinking, and a board-first workflow into one polished canvas.
                </p>
              </div>

              {/* 4 Contact Cards (Email, LinkedIn, GitHub, Discord) */}
              <div className="flex flex-wrap gap-3 lg:max-w-[38rem] lg:justify-end">
                {/* 4. Email Contact Card */}
                <DirectionAwareContactCard
                  href={`mailto:${DEVELOPER_PROFILE.email}`}
                  label="Email"
                  value={DEVELOPER_PROFILE.email}
                  icon={<MailIcon />}
                  onHoverTarget={handleElementHover}
                  reducedMotion={reducedMotion}
                />

                {/* 5. LinkedIn Contact Card */}
                <DirectionAwareContactCard
                  href={DEVELOPER_PROFILE.linkedin}
                  label="LinkedIn"
                  value="in/sinha-navneet"
                  icon={<LinkedInIcon />}
                  onHoverTarget={handleElementHover}
                  reducedMotion={reducedMotion}
                />

                {/* 6. GitHub Contact Card */}
                <DirectionAwareContactCard
                  href={DEVELOPER_PROFILE.github}
                  label="GitHub"
                  value="@Neet2516"
                  icon={<GitHubIcon />}
                  onHoverTarget={handleElementHover}
                  reducedMotion={reducedMotion}
                />

                {/* 7. Discord Contact Card */}
                <DirectionAwareContactCard
                  href={DEVELOPER_PROFILE.discord}
                  label="Discord"
                  value="Direct message"
                  icon={<DiscordIcon />}
                  onHoverTarget={handleElementHover}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-6 border-t border-white/55 pt-5">
            {/* 8. Closing Footer Statement */}
            <p
              onMouseEnter={(e) => handleElementHover(e.currentTarget)}
              onFocus={(e) => handleElementHover(e.currentTarget)}
              tabIndex={0}
              className="section-copy text-sm text-slate-500 inline-block w-fit cursor-default rounded focus:outline-none"
            >
              Designed for collaborative thinking, persistent notes, and a smoother team flow.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <span className="stat-label text-sm text-slate-500">
            &copy; 2026 SyncBoard. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 8.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88ZM5.7 9.74h2.5V18H5.7V9.74Zm4.07 0h2.4v1.13h.03c.33-.63 1.15-1.29 2.37-1.29 2.54 0 3.01 1.67 3.01 3.83V18h-2.5v-4.04c0-.97-.02-2.22-1.35-2.22-1.36 0-1.57 1.06-1.57 2.15V18h-2.4V9.74Z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.8 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.08 1.84 2.84 1.31 3.54 1 .11-.79.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.53.11-3.19 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.89.12 3.19.77.84 1.24 1.92 1.24 3.23 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.11.82 2.23v3.31c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.32 4.37a16.7 16.7 0 0 0-4.1-1.28.06.06 0 0 0-.07.03c-.18.32-.38.74-.52 1.07a15.48 15.48 0 0 0-4.67 0 10.7 10.7 0 0 0-.53-1.07.06.06 0 0 0-.07-.03 16.62 16.62 0 0 0-4.1 1.28.05.05 0 0 0-.03.02C3.63 8.18 2.9 11.87 3.26 15.52a.07.07 0 0 0 .03.05 16.8 16.8 0 0 0 4.94 2.5.06.06 0 0 0 .07-.02c.38-.52.73-1.07 1.03-1.64a.06.06 0 0 0-.03-.08 10.9 10.9 0 0 1-1.57-.75.06.06 0 0 1-.01-.1c.1-.08.2-.16.29-.24a.06.06 0 0 1 .07-.01c3.3 1.5 6.87 1.5 10.13 0a.06.06 0 0 1 .07 0c.1.08.2.16.3.24a.06.06 0 0 1-.01.1c-.5.3-1.03.56-1.57.75a.06.06 0 0 0-.03.08c.3.57.65 1.12 1.03 1.64a.06.06 0 0 0 .07.02 16.74 16.74 0 0 0 4.94-2.5.06.06 0 0 0 .03-.05c.43-4.22-.72-7.88-2.97-11.13a.05.05 0 0 0-.03-.02ZM9.85 13.3c-.99 0-1.8-.91-1.8-2.03 0-1.12.8-2.03 1.8-2.03 1 0 1.81.92 1.8 2.03 0 1.12-.8 2.03-1.8 2.03Zm4.3 0c-.99 0-1.8-.91-1.8-2.03 0-1.12.8-2.03 1.8-2.03 1 0 1.81.92 1.8 2.03 0 1.12-.8 2.03-1.8 2.03Z" />
    </svg>
  )
}
