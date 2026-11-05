import { useState, useEffect, useRef } from 'react'

/**
 * KisanChachaMascot — High-fidelity animated Indian farmer game mascot
 * Features:
 * - Real-time trigonometric cursor tracking: eyes and pupils follow mouse coordinates
 * - Interactive head tilt based on horizontal cursor displacement
 * - Expressive Indian farmer styling: Saffron Pagri (turban), mustache, tilak, gamcha
 * - Animated pointing arm and cane targeting UI elements
 * - Responsive sizing (sm, md, lg, xl, full)
 */
export default function KisanChachaMascot({
  size = 'md',
  isPointing = true,
  pointingDirection = 'left', // 'left', 'right', 'down', 'up'
  mood = 'happy', // 'happy', 'explaining', 'proud', 'waving'
  className = '',
  speechBubble = null,
}) {
  const containerRef = useRef(null)
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })
  const [headTilt, setHeadTilt] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height * 0.35 // eye level

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      // Calculate angle and distance
      const angle = Math.atan2(deltaY, deltaX)
      const distance = Math.min(1, Math.hypot(deltaX, deltaY) / 300)

      // Max eye travel: 4.5px
      const maxPupilDist = 4.5
      setPupilOffset({
        x: Math.cos(angle) * maxPupilDist * distance,
        y: Math.sin(angle) * maxPupilDist * distance,
      })

      // Head tilt angle: clamped between -12 and +12 degrees
      const tilt = Math.max(-12, Math.min(12, (deltaX / window.innerWidth) * 24))
      setHeadTilt(tilt)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Sizing scale
  const sizeMap = {
    sm: { width: 100, height: 130 },
    md: { width: 140, height: 180 },
    lg: { width: 190, height: 240 },
    xl: { width: 250, height: 320 },
    full: { width: 320, height: 400 },
  }
  const dims = sizeMap[size] || sizeMap.md

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center select-none pointer-events-auto ${className}`}
      style={{ width: dims.width, height: dims.height }}
    >
      {/* Optional Speech Bubble above Chacha */}
      {speechBubble && (
        <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-600 shadow-md whitespace-nowrap animate-bounce">
          {speechBubble}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-50 dark:bg-slate-800 border-r border-b border-amber-300 dark:border-amber-600 rotate-45" />
        </div>
      )}

      {/* High-Resolution Vector Mascot SVG */}
      <svg
        viewBox="0 0 200 250"
        className="w-full h-full drop-shadow-xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Turban Saffron Gradient */}
          <linearGradient id="pagriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* Skin Tone Gradient */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="60%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>

          {/* Kurta Gradient */}
          <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Gamcha / Angavastram Gradient */}
          <linearGradient id="gamchaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ── Torso & Traditional Kurta ── */}
        <g id="bodyGroup">
          {/* White Cotton Kurta */}
          <path
            d="M50 160 Q100 150 150 160 L165 240 Q100 250 35 240 Z"
            fill="url(#kurtaGrad)"
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {/* Kurta Collar & Buttons */}
          <path d="M90 160 L100 185 L110 160" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="100" cy="195" r="2.5" fill="#475569" />
          <circle cx="100" cy="210" r="2.5" fill="#475569" />
          <circle cx="100" cy="225" r="2.5" fill="#475569" />

          {/* Green Agricultural Gamcha (Towel on Shoulder) */}
          <path
            d="M50 162 C40 180 42 220 48 245 C55 245 65 240 62 210 C60 185 68 170 70 162 Z"
            fill="url(#gamchaGrad)"
            stroke="#065f46"
            strokeWidth="1.5"
          />
          {/* Gamcha stripes */}
          <line x1="43" y1="230" x2="60" y2="230" stroke="#fef08a" strokeWidth="2" />
          <line x1="45" y1="236" x2="57" y2="236" stroke="#fef08a" strokeWidth="2" />
        </g>

        {/* ── Head Group with Dynamic Tilt Tracking ── */}
        <g
          id="headGroup"
          style={{
            transform: `rotate(${headTilt}deg)`,
            transformOrigin: '100px 115px',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Neck */}
          <rect x="88" y="130" width="24" height="25" rx="5" fill="url(#skinGrad)" />

          {/* Ears with Kundal / Gold Earring */}
          <circle cx="56" cy="100" r="10" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="0.8" />
          <circle cx="144" cy="100" r="10" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="0.8" />
          <circle cx="54" cy="106" r="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="146" cy="106" r="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />

          {/* Face Base */}
          <ellipse cx="100" cy="100" rx="44" ry="48" fill="url(#skinGrad)" />

          {/* Cheeks with Warm Glow */}
          <circle cx="72" cy="112" r="9" fill="#f87171" opacity="0.25" />
          <circle cx="128" cy="112" r="9" fill="#f87171" opacity="0.25" />

          {/* ── Saffron Pagri / Turban (Game Graphic Style) ── */}
          <g id="pagri">
            {/* Base Turban Wrap */}
            <path
              d="M48 78 C40 40 70 20 100 20 C135 20 162 40 152 78 C145 65 130 55 100 55 C70 55 55 65 48 78 Z"
              fill="url(#pagriGrad)"
              filter="url(#softShadow)"
            />
            {/* Turban Folds and Creases */}
            <path
              d="M45 74 Q100 45 155 74 Q140 88 100 82 Q60 88 45 74 Z"
              fill="#ea580c"
              stroke="#c2410c"
              strokeWidth="1.5"
            />
            <path
              d="M52 62 Q100 36 148 62"
              fill="none"
              stroke="#fb923c"
              strokeWidth="2.5"
            />
            <path
              d="M60 50 Q100 28 140 50"
              fill="none"
              stroke="#fdba74"
              strokeWidth="2"
            />

            {/* Turra (Feathered Fan on Top of Turban) */}
            <path
              d="M90 22 C92 2 108 2 110 22 Z"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            {/* Golden Brooch on Pagri */}
            <circle cx="100" cy="58" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="100" cy="58" r="2.5" fill="#dc2626" />
          </g>

          {/* Traditional Tilak (Chandhan & Kumkum) */}
          <path d="M96 66 L104 66 L100 78 Z" fill="#dc2626" />
          <line x1="94" y1="64" x2="106" y2="64" stroke="#fef08a" strokeWidth="1.5" />

          {/* Expressive Eyebrows */}
          <path
            d="M66 82 Q78 76 90 82"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M110 82 Q122 76 134 82"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* ── Eyes with Mouse-Tracking Dynamic Pupils ── */}
          {/* Left Eye */}
          <ellipse cx="78" cy="92" rx="10" ry="8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
            <circle cx="78" cy="92" r="5" fill="#1e293b" />
            <circle cx="78" cy="92" r="3.2" fill="#0284c7" />
            {/* Catchlight reflection */}
            <circle cx="76.5" cy="90.5" r="1.5" fill="#ffffff" />
          </g>

          {/* Right Eye */}
          <ellipse cx="122" cy="92" rx="10" ry="8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
            <circle cx="122" cy="92" r="5" fill="#1e293b" />
            <circle cx="122" cy="92" r="3.2" fill="#0284c7" />
            {/* Catchlight reflection */}
            <circle cx="120.5" cy="90.5" r="1.5" fill="#ffffff" />
          </g>

          {/* Friendly Curved Nose */}
          <path
            d="M98 90 Q104 105 97 110 Q102 112 105 109"
            fill="none"
            stroke="#ea580c"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* ── Magnificent Indian Farmer Mustache (Moochein) ── */}
          <path
            d="M100 115 C85 110 68 116 60 126 C75 125 90 122 100 118 C110 122 125 125 140 126 C132 116 115 110 100 115 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="1.5"
          />

          {/* Smiling Mouth */}
          <path
            d="M86 126 Q100 136 114 126"
            fill="#881337"
            stroke="#4c0519"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Teeth shine */}
          <path d="M92 127 Q100 131 108 127" fill="#ffffff" />

          {/* Chin Line */}
          <path d="M94 139 Q100 142 106 139" fill="none" stroke="#ea580c" strokeWidth="1.5" />
        </g>

        {/* ── Dynamic Pointing Arm & Walking Stick / Pointer ── */}
        {isPointing && (
          <g id="pointingArmGroup">
            {pointingDirection === 'left' ? (
              <>
                {/* Left Arm extended to the left */}
                <path
                  d="M55 170 Q10 150 -15 130"
                  fill="none"
                  stroke="url(#skinGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <circle cx="-15" cy="130" r="8" fill="url(#skinGrad)" />
                {/* Wooden Pointer Stick with Golden Tip */}
                <line x1="-15" y1="130" x2="-65" y2="100" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                <polygon points="-65,100 -75,95 -68,90" fill="#facc15" />
                {/* Target Laser Glow */}
                <circle cx="-75" cy="95" r="4" fill="#38bdf8" className="animate-ping" />
              </>
            ) : pointingDirection === 'right' ? (
              <>
                {/* Right Arm extended to the right */}
                <path
                  d="M145 170 Q190 150 215 130"
                  fill="none"
                  stroke="url(#skinGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <circle cx="215" cy="130" r="8" fill="url(#skinGrad)" />
                {/* Wooden Pointer Stick with Golden Tip */}
                <line x1="215" y1="130" x2="265" y2="100" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                <polygon points="265,100 275,95 268,90" fill="#facc15" />
                {/* Target Laser Glow */}
                <circle cx="275" cy="95" r="4" fill="#38bdf8" className="animate-ping" />
              </>
            ) : (
              <>
                {/* Pointing Downward towards page elements */}
                <path
                  d="M145 170 Q170 200 160 230"
                  fill="none"
                  stroke="url(#skinGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <circle cx="160" cy="230" r="8" fill="url(#skinGrad)" />
                <line x1="160" y1="230" x2="160" y2="270" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                <polygon points="156,270 164,270 160,280" fill="#facc15" />
                <circle cx="160" cy="280" r="4" fill="#38bdf8" className="animate-ping" />
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  )
}
