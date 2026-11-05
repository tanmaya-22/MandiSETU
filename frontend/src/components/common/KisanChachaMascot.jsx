import { useState, useEffect, useRef } from 'react'

/**
 * KisanChachaMascot — Authentic, wholesome Indian farmer game mascot
 * Modeled directly on traditional Indian agrarian folk illustration:
 * - Authentic layered emerald/teal Indian Pagri (turban) with folded turra crest & dynamic cloth wraps
 * - Warm golden-wheat Indian skin tone, kind twinkling eyes with organic blinking
 * - Classic magnificent curled mustache (moochein) tapering to pointed tips
 * - Traditional yellow shirt, slate-teal vest (bundi), and crimson sash
 * - 2.5D multi-axis parallax tracking (head shift, facial feature parallax, torso lean)
 * - Gentle sinusoidal breathing cycle and bamboo pointer cane with golden sparkle
 */
export default function KisanChachaMascot({
  size = 'md',
  isPointing = true,
  pointingDirection = 'left', // 'left', 'right', 'down', 'up'
  mood = 'happy',
  className = '',
  speechBubble = null,
}) {
  const containerRef = useRef(null)

  // Cursor tracking kinematics
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })
  const [headOffset, setHeadOffset] = useState({ x: 0, y: 0 })
  const [headTilt, setHeadTilt] = useState(0)
  const [faceParallax, setFaceParallax] = useState({ x: 0, y: 0 })
  const [eyebrowRaise, setEyebrowRaise] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)

  // 1. Natural Organic Blinking Cycle (Every 3.2s - 5.5s for 140ms)
  useEffect(() => {
    let blinkTimeout
    const triggerBlink = () => {
      setIsBlinking(true)
      setTimeout(() => {
        setIsBlinking(false)
        const nextDelay = 3200 + Math.random() * 2300
        blinkTimeout = setTimeout(triggerBlink, nextDelay)
      }, 140)
    }

    const initialDelay = 1600 + Math.random() * 1400
    blinkTimeout = setTimeout(triggerBlink, initialDelay)
    return () => clearTimeout(blinkTimeout)
  }, [])

  // 2. Smooth Cursor Motion Tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height * 0.4 // eye center

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      const angle = Math.atan2(deltaY, deltaX)
      const distance = Math.min(1, Math.hypot(deltaX, deltaY) / 380)

      // Pupil travel
      const maxPupilDist = 4.2
      setPupilOffset({
        x: Math.cos(angle) * maxPupilDist * distance,
        y: Math.sin(angle) * maxPupilDist * distance,
      })

      // Head translation towards mouse
      setHeadOffset({
        x: Math.cos(angle) * 5 * distance,
        y: Math.sin(angle) * 3 * distance,
      })

      // Head tilt angle: clamped between -10 and +10 degrees
      const tilt = Math.max(-10, Math.min(10, (deltaX / window.innerWidth) * 20))
      setHeadTilt(tilt)

      // 2.5D Facial features parallax
      setFaceParallax({
        x: Math.cos(angle) * 3.2 * distance,
        y: Math.sin(angle) * 2 * distance,
      })

      // Eyebrow reactivity
      setEyebrowRaise(deltaY < -40 ? -2.2 : deltaY > 80 ? 1 : 0)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Responsive dimensions map
  const sizeMap = {
    xs: { width: 75, height: 95 },
    sm: { width: 95, height: 120 },
    md: { width: 135, height: 170 },
    lg: { width: 185, height: 235 },
    xl: { width: 235, height: 300 },
    full: { width: 290, height: 370 },
  }
  const dims = sizeMap[size] || sizeMap.md

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center select-none pointer-events-auto transition-transform ${className}`}
      style={{ width: dims.width, height: dims.height }}
    >
      <style>{`
        @keyframes chachaBreathingHarmonic {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes goldenSparkle {
          0%, 100% { opacity: 0.35; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.25) rotate(45deg); }
        }
        .chacha-torso-anim {
          animation: chachaBreathingHarmonic 4s ease-in-out infinite;
          transform-origin: 100px 240px;
        }
      `}</style>

      {/* Wholesome Speech Bubble */}
      {speechBubble && (
        <div className="absolute -top-10 z-30 px-3 py-1 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-amber-300 text-[11px] font-extrabold border-2 border-amber-300 dark:border-amber-600 shadow-xl whitespace-nowrap animate-bounce">
          <span className="flex items-center gap-1.5">
            <span className="text-amber-500">🌾</span>
            <span>{speechBubble}</span>
          </span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-amber-50 dark:bg-slate-900 border-r-2 border-b-2 border-amber-300 dark:border-amber-600 rotate-45" />
        </div>
      )}

      {/* High-Resolution Vector Mascot SVG */}
      <svg
        viewBox="0 0 200 250"
        className="w-full h-full drop-shadow-2xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Authentic Indian Emerald/Teal Pagri Gradients (from reference image) */}
          <linearGradient id="pagriBaseTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="35%" stopColor="#14b8a6" />
            <stop offset="70%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>

          <linearGradient id="pagriShadowTeal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>

          <linearGradient id="pagriHighlightTeal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          {/* Warm Golden-Wheat Indian Skin Tone */}
          <linearGradient id="farmerSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="45%" stopColor="#fdba74" />
            <stop offset="90%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Blushing Cheeks Radial Gradient */}
          <radialGradient id="farmerBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#fb7185" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>

          {/* Yellow Shirt Gradient (from reference image) */}
          <linearGradient id="shirtYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Dark Teal Bundi / Waistcoat (from reference image) */}
          <linearGradient id="vestTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#134e4a" />
            <stop offset="60%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>

          {/* Crimson Red Waist Sash (from reference image) */}
          <linearGradient id="sashRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Gold Wrist Bangle / Kada */}
          <radialGradient id="goldKada" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#854d0e" />
          </radialGradient>

          {/* Iris Gradient */}
          <radialGradient id="eyeIris" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="90%" stopColor="#0f172a" />
          </radialGradient>

          {/* Soft Shadow Filter */}
          <filter id="chachaShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ── 1. Torso, Bundi Vest & Yellow Shirt (With Idle Breathing) ── */}
        <g id="torsoGroup" className="chacha-torso-anim">
          {/* Base Yellow Farmer Shirt */}
          <path
            d="M50 165 C46 154 75 148 100 148 C125 148 154 154 150 165 L164 240 C164 245 138 248 100 248 C62 248 36 245 36 240 Z"
            fill="url(#shirtYellow)"
            stroke="#ca8a04"
            strokeWidth="1.6"
            filter="url(#chachaShadow)"
          />

          {/* Open Mandarin Collar Shirt Detail */}
          <path d="M88 150 L100 168 L112 150" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
          <path d="M92 150 L100 165 L108 150" fill="url(#farmerSkin)" />

          {/* Dark Teal Bundi / Waistcoat (Over Shirt) */}
          {/* Left half of vest */}
          <path
            d="M50 165 C54 182 60 215 62 242 C48 241 38 238 36 240 L48 165 Z"
            fill="url(#vestTeal)"
            stroke="#042f2e"
            strokeWidth="1.2"
          />
          {/* Right half of vest */}
          <path
            d="M150 165 C146 182 140 215 138 242 C152 241 162 238 164 240 L150 165 Z"
            fill="url(#vestTeal)"
            stroke="#042f2e"
            strokeWidth="1.2"
          />

          {/* Crimson Red Sash / Kamarbandh (Cross-Body) */}
          <path
            d="M62 166 L144 235 L132 244 L52 176 Z"
            fill="url(#sashRed)"
            stroke="#991b1b"
            strokeWidth="1.2"
          />
          {/* Sash knot/pleats */}
          <path d="M52 176 Q58 184 64 178" stroke="#fca5a5" strokeWidth="1.5" fill="none" />
          <path d="M120 226 Q128 234 136 228" stroke="#fca5a5" strokeWidth="1.5" fill="none" />
        </g>

        {/* ── 2. Head Group: Multi-Axis Parallax Tracking ── */}
        <g
          id="headGroup"
          style={{
            transform: `translate(${headOffset.x}px, ${headOffset.y}px) rotate(${headTilt}deg)`,
            transformOrigin: '100px 115px',
            transition: 'transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* Neck */}
          <rect x="88" y="130" width="24" height="24" rx="5" fill="url(#farmerSkin)" />
          <path d="M88 138 Q100 145 112 138" fill="none" stroke="#ea580c" strokeWidth="1.2" opacity="0.6" />

          {/* Friendly Ears with Golden Kundal Earrings */}
          <circle cx="54" cy="100" r="10.5" fill="url(#farmerSkin)" stroke="#ea580c" strokeWidth="1" />
          <circle cx="146" cy="100" r="10.5" fill="url(#farmerSkin)" stroke="#ea580c" strokeWidth="1" />
          <circle cx="52" cy="107" r="3.2" fill="url(#goldKada)" stroke="#854d0e" strokeWidth="0.8" />
          <circle cx="148" cy="107" r="3.2" fill="url(#goldKada)" stroke="#854d0e" strokeWidth="0.8" />

          {/* Head Shape Base */}
          <ellipse cx="100" cy="100" rx="45" ry="48" fill="url(#farmerSkin)" />

          {/* ── 3. Internal Face Parallax (Shift inside head contour for 2.5D depth) ── */}
          <g
            id="faceFeatures"
            style={{
              transform: `translate(${faceParallax.x}px, ${faceParallax.y}px)`,
              transition: 'transform 0.08s ease-out',
            }}
          >
            {/* Soft Warm Rosy Cheeks */}
            <ellipse cx="70" cy="110" rx="11" ry="6.5" fill="url(#farmerBlush)" />
            <ellipse cx="130" cy="110" rx="11" ry="6.5" fill="url(#farmerBlush)" />

            {/* Forehead Chandhan Tilak */}
            <path d="M97 66 L103 66 L100 77 Z" fill="#dc2626" />
            <line x1="94" y1="64" x2="106" y2="64" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />

            {/* Expressive Arched Eyebrows (Dynamic Vertical Reactivity) */}
            <g style={{ transform: `translateY(${eyebrowRaise}px)`, transition: 'transform 0.15s ease' }}>
              <path
                d="M66 80 Q78 72 90 79"
                fill="none"
                stroke="#0f172a"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
              <path
                d="M110 79 Q122 72 134 80"
                fill="none"
                stroke="#0f172a"
                strokeWidth="3.6"
                strokeLinecap="round"
              />
            </g>

            {/* ── 4. Eyes: Natural Blinking + Mouse Tracking ── */}
            {/* Left Eye */}
            <g id="leftEye">
              <ellipse cx="78" cy="91" rx="10.5" ry="8.8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.6" />
              {!isBlinking ? (
                <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                  <circle cx="78" cy="91" r="5.2" fill="url(#eyeIris)" />
                  <circle cx="78" cy="91" r="3" fill="#0f172a" />
                  <circle cx="76.3" cy="89" r="1.7" fill="#ffffff" />
                  <circle cx="79.6" cy="92.6" r="0.8" fill="#ffffff" opacity="0.8" />
                </g>
              ) : (
                <path d="M68 91 Q78 96 88 91" fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
              )}
            </g>

            {/* Right Eye */}
            <g id="rightEye">
              <ellipse cx="122" cy="91" rx="10.5" ry="8.8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.6" />
              {!isBlinking ? (
                <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                  <circle cx="122" cy="91" r="5.2" fill="url(#eyeIris)" />
                  <circle cx="122" cy="91" r="3" fill="#0f172a" />
                  <circle cx="120.3" cy="89" r="1.7" fill="#ffffff" />
                  <circle cx="123.6" cy="92.6" r="0.8" fill="#ffffff" opacity="0.8" />
                </g>
              ) : (
                <path d="M112 91 Q122 96 132 91" fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
              )}
            </g>

            {/* Kind Indian Farmer Nose */}
            <path
              d="M97 90 Q103 103 97 107 Q100 109 104 106"
              fill="none"
              stroke="#ea580c"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* ── 5. Magnificent Curled Indian Mustache (Moochein - Exactly like Photo 3) ── */}
            <path
              d="M100 114 C84 106 64 112 52 124 C68 123 86 119 100 117 C114 119 132 123 148 124 C136 112 116 106 100 114 Z"
              fill="#0f172a"
              stroke="#020617"
              strokeWidth="1.6"
            />
            {/* Upward tapered curl tips */}
            <path
              d="M52 124 Q48 122 47 116 Q52 120 58 122"
              fill="#0f172a"
            />
            <path
              d="M148 124 Q152 122 153 116 Q148 120 142 122"
              fill="#0f172a"
            />
            {/* Luster sheen on mustache */}
            <path d="M58 121 Q76 116 96 115" fill="none" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M142 121 Q124 116 104 115" fill="none" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />

            {/* Warm Smiling Mouth (Visible White Teeth) */}
            <path
              d="M87 124 Q100 134 113 124"
              fill="#881337"
              stroke="#4c0519"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path d="M91 125 Q100 129 109 125" fill="#ffffff" />

            {/* Friendly Chin Crease */}
            <path d="M95 138 Q100 141 105 138" fill="none" stroke="#ea580c" strokeWidth="1.3" opacity="0.8" />
          </g>

          {/* ── 6. Authentic Layered Emerald/Teal Indian Turban (Pagri/Pheta - Reference Photo 3) ── */}
          <g id="authenticPagri" filter="url(#chachaShadow)">
            {/* Back Crown Volume */}
            <path
              d="M48 76 C36 40 55 12 100 10 C145 12 164 40 152 76 Z"
              fill="url(#pagriShadowTeal)"
            />

            {/* Tall Angular Turra / Top Crest (Rising majestically like Photo 3) */}
            <path
              d="M80 18 L100 -6 L120 18 L100 24 Z"
              fill="url(#pagriHighlightTeal)"
              stroke="#0f766e"
              strokeWidth="1.5"
            />
            <line x1="100" y1="-6" x2="100" y2="24" stroke="#042f2e" strokeWidth="1.5" />
            {/* Fan pleats on crest */}
            <line x1="88" y1="8" x2="100" y2="24" stroke="#5eead4" strokeWidth="1.2" />
            <line x1="112" y1="8" x2="100" y2="24" stroke="#5eead4" strokeWidth="1.2" />

            {/* Left Diagonal Wrap Fold (Crossing from upper left to center) */}
            <path
              d="M44 76 C40 50 62 26 95 24 L105 52 L54 84 Z"
              fill="url(#pagriBaseTeal)"
              stroke="#0f766e"
              strokeWidth="1.5"
            />

            {/* Right Diagonal Wrap Fold (Crossing from upper right to center) */}
            <path
              d="M156 76 C160 50 138 26 105 24 L95 52 L146 84 Z"
              fill="url(#pagriHighlightTeal)"
              stroke="#0f766e"
              strokeWidth="1.5"
            />

            {/* Dynamic Overlapping Front Cross-Folds (Intersecting V-Shape on Forehead) */}
            <path
              d="M42 76 Q100 44 158 76 Q138 90 100 80 Q62 90 42 76 Z"
              fill="url(#pagriBaseTeal)"
              stroke="#042f2e"
              strokeWidth="1.8"
            />

            {/* Crisp Cloth Fold Creases & Shading (Gives 3D hand-folded volume) */}
            <path
              d="M48 64 Q100 34 152 64"
              fill="none"
              stroke="url(#pagriHighlightTeal)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M58 52 Q100 26 142 52"
              fill="none"
              stroke="#5eead4"
              strokeWidth="2"
              opacity="0.9"
              strokeLinecap="round"
            />
            <path
              d="M70 40 Q100 20 130 40"
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="1.8"
              opacity="0.8"
            />

            {/* Imperial Gold Brooch on Pagri Crest with Ruby Gem */}
            <circle cx="100" cy="50" r="6" fill="url(#goldKada)" stroke="#854d0e" strokeWidth="1.5" />
            <circle cx="100" cy="50" r="2.6" fill="#dc2626" />
          </g>
        </g>

        {/* ── 7. Interactive Pointer Arm & Bamboo Cane with Golden Sparkle ── */}
        {isPointing && (
          <g id="pointerArmGroup">
            {pointingDirection === 'left' ? (
              <>
                {/* Arm extended left with Gold Kada */}
                <path
                  d="M54 168 Q18 148 -14 128"
                  fill="none"
                  stroke="url(#farmerSkin)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="-14" cy="128" r="7.5" fill="url(#farmerSkin)" />
                {/* Gold Wrist Kada */}
                <circle cx="-6" cy="134" r="5" fill="none" stroke="url(#goldKada)" strokeWidth="3" />

                {/* Bamboo Staff / Cane */}
                <line x1="-14" y1="128" x2="-64" y2="98" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                {/* Brass Tip */}
                <polygon points="-64,98 -74,93 -67,88" fill="url(#goldKada)" stroke="#ca8a04" strokeWidth="1" />
                {/* Twinkling Golden Star */}
                <g transform="translate(-78, 92)" style={{ animation: 'goldenSparkle 1.8s ease-in-out infinite' }}>
                  <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#facc15" />
                </g>
              </>
            ) : pointingDirection === 'right' ? (
              <>
                {/* Arm extended right with Gold Kada */}
                <path
                  d="M146 168 Q182 148 214 128"
                  fill="none"
                  stroke="url(#farmerSkin)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="214" cy="128" r="7.5" fill="url(#farmerSkin)" />
                {/* Gold Wrist Kada */}
                <circle cx="206" cy="134" r="5" fill="none" stroke="url(#goldKada)" strokeWidth="3" />

                {/* Bamboo Cane */}
                <line x1="214" y1="128" x2="264" y2="98" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                {/* Brass Tip */}
                <polygon points="264,98 274,93 267,88" fill="url(#goldKada)" stroke="#ca8a04" strokeWidth="1" />
                {/* Twinkling Star */}
                <g transform="translate(278, 92)" style={{ animation: 'goldenSparkle 1.8s ease-in-out infinite' }}>
                  <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#facc15" />
                </g>
              </>
            ) : (
              <>
                {/* Pointing downward */}
                <path
                  d="M146 168 Q168 198 158 228"
                  fill="none"
                  stroke="url(#farmerSkin)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="158" cy="228" r="7.5" fill="url(#farmerSkin)" />
                <circle cx="154" cy="220" r="5" fill="none" stroke="url(#goldKada)" strokeWidth="3" />
                <line x1="158" y1="228" x2="158" y2="266" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                <polygon points="154,266 162,266 158,276" fill="url(#goldKada)" />
                <g transform="translate(158, 280)" style={{ animation: 'goldenSparkle 1.8s ease-in-out infinite' }}>
                  <path d="M0 -6 L2 -2 L6 0 L2 2 L0 6 L-2 2 L-6 0 L-2 -2 Z" fill="#facc15" />
                </g>
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  )
}
