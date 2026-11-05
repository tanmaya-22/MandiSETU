import { useState, useEffect, useRef } from 'react'

/**
 * KisanChachaMascot — High-fidelity, wholesome Indian farmer game mascot
 * Features:
 * - Full 2.5D multi-axis parallax tracking (head shift, facial feature parallax, torso lean)
 * - Organic blinking engine (blinks naturally every 3-5 seconds to remove stare/creepiness)
 * - Expressive eyebrow and smile dynamics that react warmly to cursor interaction
 * - Gentle idle breathing cycle that keeps the character alive even when mouse is still
 * - Handcrafted traditional Indian farmer illustration: Saffron Pagri with turra & brooch,
 *   warm twinkling eyes, grand curled mustache, white kurta, green gamcha, and brass pointer cane
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

  // Cursor tracking kinematics
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })
  const [headOffset, setHeadOffset] = useState({ x: 0, y: 0 })
  const [headTilt, setHeadTilt] = useState(0)
  const [faceParallax, setFaceParallax] = useState({ x: 0, y: 0 })
  const [eyebrowRaise, setEyebrowRaise] = useState(0)
  const [isBlinking, setIsBlinking] = useState(false)

  // 1. Natural Blinking Loop: Blinks every 3.5s - 5.5s for 140ms
  useEffect(() => {
    let blinkTimeout
    const triggerBlink = () => {
      setIsBlinking(true)
      setTimeout(() => {
        setIsBlinking(false)
        const nextDelay = 3200 + Math.random() * 2400
        blinkTimeout = setTimeout(triggerBlink, nextDelay)
      }, 140)
    }

    const initialDelay = 1800 + Math.random() * 1500
    blinkTimeout = setTimeout(triggerBlink, initialDelay)
    return () => clearTimeout(blinkTimeout)
  }, [])

  // 2. Trigonometric Cursor Tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height * 0.35 // eye center

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      const angle = Math.atan2(deltaY, deltaX)
      const distance = Math.min(1, Math.hypot(deltaX, deltaY) / 360)

      // Pupils: smooth travel within eye boundary
      const maxPupilDist = 4.2
      const px = Math.cos(angle) * maxPupilDist * distance
      const py = Math.sin(angle) * maxPupilDist * distance
      setPupilOffset({ x: px, y: py })

      // Head translation towards cursor (3.5px max)
      setHeadOffset({
        x: Math.cos(angle) * 5 * distance,
        y: Math.sin(angle) * 3 * distance,
      })

      // Head tilt angle: clamped between -10 and +10 degrees
      const tilt = Math.max(-10, Math.min(10, (deltaX / window.innerWidth) * 20))
      setHeadTilt(tilt)

      // 2.5D Face parallax (features shift inside head outline)
      setFaceParallax({
        x: Math.cos(angle) * 3.5 * distance,
        y: Math.sin(angle) * 2 * distance,
      })

      // Eyebrow responsiveness: raise when looking up, settle when looking down
      setEyebrowRaise(deltaY < -40 ? -2.5 : deltaY > 80 ? 1 : 0)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Sizing dimensions scale
  const sizeMap = {
    sm: { width: 95, height: 125, scale: 0.5 },
    md: { width: 140, height: 180, scale: 0.72 },
    lg: { width: 195, height: 245, scale: 1 },
    xl: { width: 250, height: 320, scale: 1.28 },
    full: { width: 310, height: 390, scale: 1.55 },
  }
  const dims = sizeMap[size] || sizeMap.md

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center select-none pointer-events-auto transition-transform ${className}`}
      style={{ width: dims.width, height: dims.height }}
    >
      <style>{`
        @keyframes chachaBreathing {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.008); }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
        }
        @keyframes gamchaFlutter {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.5deg); }
        }
        .chacha-body-anim {
          animation: chachaBreathing 4.2s ease-in-out infinite;
          transform-origin: 100px 240px;
        }
        .chacha-gamcha-anim {
          animation: gamchaFlutter 5s ease-in-out infinite;
          transform-origin: 50px 165px;
        }
      `}</style>

      {/* Wholesome Speech Bubble */}
      {speechBubble && (
        <div className="absolute -top-11 z-30 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-amber-300 text-xs font-extrabold border-2 border-amber-300 dark:border-amber-600 shadow-xl whitespace-nowrap animate-bounce">
          <span className="flex items-center gap-1.5">
            <span className="text-amber-500">🌾</span>
            <span>{speechBubble}</span>
          </span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-50 dark:bg-slate-900 border-r-2 border-b-2 border-amber-300 dark:border-amber-600 rotate-45" />
        </div>
      )}

      {/* High-Resolution Wholesome Mascot Vector */}
      <svg
        viewBox="0 0 200 250"
        className="w-full h-full drop-shadow-2xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Turban Saffron Radial/Linear Gradients */}
          <linearGradient id="pagriGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="85%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="pagriFoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="35%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Warm Wholesome Skin Tone */}
          <linearGradient id="wholesomeSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="50%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.85" />
          </linearGradient>

          {/* Radiant Cheeks Blush */}
          <radialGradient id="blushGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#fb7185" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>

          {/* Pure Cotton Kurta */}
          <linearGradient id="kurtaFabric" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="75%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Gamcha Emerald Green */}
          <linearGradient id="gamchaFabric" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Golden Brooch & Kundal */}
          <radialGradient id="goldShine" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#facc15" />
            <stop offset="85%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </radialGradient>

          {/* Warm Eye Iris Gradient */}
          <radialGradient id="irisGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#0284c7" />
            <stop offset="85%" stopColor="#0f172a" />
          </radialGradient>

          {/* Soft Drop Filter */}
          <filter id="mascotShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* ── 1. Torso & Kurta (With Idle Breathing Animation) ── */}
        <g id="bodyGroup" className="chacha-body-anim">
          {/* Subtle Torso Shadow */}
          <ellipse cx="100" cy="242" rx="68" ry="12" fill="#000000" opacity="0.12" />

          {/* White Cotton Kurta Body */}
          <path
            d="M48 162 C45 152 75 146 100 146 C125 146 155 152 152 162 L166 238 C166 244 140 248 100 248 C60 248 34 244 34 238 Z"
            fill="url(#kurtaFabric)"
            stroke="#cbd5e1"
            strokeWidth="1.8"
            filter="url(#mascotShadow)"
          />

          {/* Mandarin Collar Placket & Golden Buttons */}
          <path d="M88 150 L100 168 L112 150" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="168" x2="100" y2="230" stroke="#e2e8f0" strokeWidth="2" />
          <circle cx="100" cy="182" r="3" fill="url(#goldShine)" />
          <circle cx="100" cy="202" r="3" fill="url(#goldShine)" />
          <circle cx="100" cy="222" r="3" fill="url(#goldShine)" />

          {/* Green Agricultural Gamcha (Towel on Shoulder with subtle flutter) */}
          <g className="chacha-gamcha-anim">
            <path
              d="M48 158 C38 178 39 216 45 242 C52 243 62 238 60 212 C58 188 66 172 68 158 Z"
              fill="url(#gamchaFabric)"
              stroke="#065f46"
              strokeWidth="1.5"
            />
            {/* Gamcha Yellow Zari Borders */}
            <line x1="41" y1="228" x2="57" y2="228" stroke="#fde047" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="43" y1="234" x2="54" y2="234" stroke="#fde047" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </g>

        {/* ── 2. Head & Face Group (Tracks Mouse with Translation & Tilt) ── */}
        <g
          id="headGroup"
          style={{
            transform: `translate(${headOffset.x}px, ${headOffset.y}px) rotate(${headTilt}deg)`,
            transformOrigin: '100px 115px',
            transition: 'transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {/* Neck */}
          <rect x="87" y="128" width="26" height="26" rx="6" fill="url(#wholesomeSkin)" />
          <path d="M87 138 Q100 146 113 138" fill="none" stroke="#ea580c" strokeWidth="1.2" opacity="0.6" />

          {/* Warm Friendly Ears with Kundal / Gold Rings */}
          <circle cx="54" cy="98" r="11" fill="url(#wholesomeSkin)" stroke="#ea580c" strokeWidth="1" />
          <circle cx="146" cy="98" r="11" fill="url(#wholesomeSkin)" stroke="#ea580c" strokeWidth="1" />
          {/* Kundal Earrings */}
          <circle cx="52" cy="106" r="3.5" fill="url(#goldShine)" stroke="#854d0e" strokeWidth="0.8" />
          <circle cx="148" cy="106" r="3.5" fill="url(#goldShine)" stroke="#854d0e" strokeWidth="0.8" />

          {/* Wholesome Face Base */}
          <ellipse cx="100" cy="98" rx="46" ry="49" fill="url(#wholesomeSkin)" />

          {/* ── 3. Parallax Face Features (Shift slightly inside face outline for 2.5D depth) ── */}
          <g
            id="faceFeatures"
            style={{
              transform: `translate(${faceParallax.x}px, ${faceParallax.y}px)`,
              transition: 'transform 0.08s ease-out',
            }}
          >
            {/* Rosy Blushing Cheeks (Warm, cute, friendly) */}
            <ellipse cx="70" cy="108" rx="12" ry="7" fill="url(#blushGlow)" />
            <ellipse cx="130" cy="108" rx="12" ry="7" fill="url(#blushGlow)" />

            {/* Traditional Chandhan & Kumkum Tilak on Forehead */}
            <path d="M96 64 L104 64 L100 77 Z" fill="#dc2626" />
            <line x1="93" y1="62" x2="107" y2="62" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />

            {/* Expressive Friendly Eyebrows (React to cursor vertical position) */}
            <g style={{ transform: `translateY(${eyebrowRaise}px)`, transition: 'transform 0.15s ease' }}>
              <path
                d="M66 79 Q78 72 90 78"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M110 78 Q122 72 134 79"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>

            {/* ── 4. Eyes: Natural Blinking + Smooth Mouse Tracking ── */}
            {/* Left Eye */}
            <g id="leftEyeGroup">
              <ellipse cx="78" cy="90" rx="11" ry="9" fill="#ffffff" stroke="#0f172a" strokeWidth="1.6" />
              {!isBlinking ? (
                <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                  {/* Iris */}
                  <circle cx="78" cy="90" r="5.5" fill="url(#irisGrad)" />
                  {/* Inner pupil */}
                  <circle cx="78" cy="90" r="3.2" fill="#0f172a" />
                  {/* Big Specular Catchlight (Twinkling wholesome gaze) */}
                  <circle cx="76.2" cy="88" r="1.8" fill="#ffffff" />
                  {/* Small secondary bounce shine */}
                  <circle cx="79.5" cy="91.8" r="0.8" fill="#ffffff" opacity="0.8" />
                </g>
              ) : (
                /* Natural Closed Eyelid when Blinking */
                <path
                  d="M67 90 Q78 95 89 90"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* Right Eye */}
            <g id="rightEyeGroup">
              <ellipse cx="122" cy="90" rx="11" ry="9" fill="#ffffff" stroke="#0f172a" strokeWidth="1.6" />
              {!isBlinking ? (
                <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                  {/* Iris */}
                  <circle cx="122" cy="90" r="5.5" fill="url(#irisGrad)" />
                  {/* Inner pupil */}
                  <circle cx="122" cy="90" r="3.2" fill="#0f172a" />
                  {/* Big Specular Catchlight */}
                  <circle cx="120.2" cy="88" r="1.8" fill="#ffffff" />
                  {/* Small secondary bounce shine */}
                  <circle cx="123.5" cy="91.8" r="0.8" fill="#ffffff" opacity="0.8" />
                </g>
              ) : (
                /* Natural Closed Eyelid when Blinking */
                <path
                  d="M111 90 Q122 95 133 90"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* Kind, Rounded Button Nose */}
            <path
              d="M97 89 Q103 103 97 107 Q100 109 104 106"
              fill="none"
              stroke="#ea580c"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* ── 5. Magnificent Proud Farmer Mustache (*Moochein*) ── */}
            <path
              d="M100 112 C86 106 68 111 58 122 C74 122 88 118 100 115 C112 118 126 122 142 122 C132 111 114 106 100 112 Z"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="1.6"
            />
            {/* Curled mustache highlight */}
            <path
              d="M62 120 Q78 116 96 113"
              fill="none"
              stroke="#475569"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M138 120 Q122 116 104 113"
              fill="none"
              stroke="#475569"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Warm Friendly Smiling Mouth (Gleaming teeth visible) */}
            <path
              d="M86 122 Q100 133 114 122"
              fill="#881337"
              stroke="#4c0519"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* White teeth shine */}
            <path d="M91 123 Q100 128 109 123" fill="#ffffff" />

            {/* Dimpled Chin */}
            <path d="M95 137 Q100 140 105 137" fill="none" stroke="#ea580c" strokeWidth="1.4" opacity="0.8" />
          </g>

          {/* ── 6. Saffron Pagri / Turban (Traditional Hand-Woven Wrap) ── */}
          <g id="pagriGroup">
            {/* Base Turban Wrap */}
            <path
              d="M44 76 C36 36 68 14 100 14 C136 14 166 36 156 76 C148 62 132 50 100 50 C68 50 52 62 44 76 Z"
              fill="url(#pagriGradMain)"
              filter="url(#mascotShadow)"
            />

            {/* Front Diagonally Folded Bands */}
            <path
              d="M42 74 Q100 42 158 74 Q142 88 100 80 Q58 88 42 74 Z"
              fill="#ea580c"
              stroke="#c2410c"
              strokeWidth="1.5"
            />
            <path
              d="M48 62 Q100 34 152 62"
              fill="none"
              stroke="url(#pagriFoldGrad)"
              strokeWidth="2.8"
            />
            <path
              d="M56 48 Q100 24 144 48"
              fill="none"
              stroke="#fed7aa"
              strokeWidth="2.2"
              opacity="0.85"
            />

            {/* Turra (Feathered Fan on Top of Turban) */}
            <path
              d="M88 18 C90 -2 110 -2 112 18 Z"
              fill="url(#goldShine)"
              stroke="#b45309"
              strokeWidth="1.5"
            />
            <line x1="100" y1="0" x2="100" y2="18" stroke="#fef08a" strokeWidth="1.5" />

            {/* Imperial Golden Brooch with Ruby Center */}
            <circle cx="100" cy="54" r="6.5" fill="url(#goldShine)" stroke="#854d0e" strokeWidth="1.5" />
            <circle cx="100" cy="54" r="2.8" fill="#dc2626" />
          </g>
        </g>

        {/* ── 7. Interactive Pointer Arm & Brass-Tipped Cane ── */}
        {isPointing && (
          <g id="pointingArmGroup">
            {pointingDirection === 'left' ? (
              <>
                {/* Left Arm extending outward */}
                <path
                  d="M56 168 Q18 148 -14 128"
                  fill="none"
                  stroke="url(#wholesomeSkin)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="-14" cy="128" r="7.5" fill="url(#wholesomeSkin)" />

                {/* Wooden Bamboo Pointer Cane */}
                <line x1="-14" y1="128" x2="-62" y2="98" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                {/* Brass / Gold Tip */}
                <polygon points="-62,98 -72,93 -65,88" fill="url(#goldShine)" stroke="#ca8a04" strokeWidth="1" />
                {/* Warm Golden Twinkling Sparkle Star */}
                <g transform="translate(-76, 92)" style={{ animation: 'sparkleTwinkle 1.8s ease-in-out infinite' }}>
                  <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#facc15" />
                </g>
              </>
            ) : pointingDirection === 'right' ? (
              <>
                {/* Right Arm extending outward */}
                <path
                  d="M144 168 Q182 148 214 128"
                  fill="none"
                  stroke="url(#wholesomeSkin)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="214" cy="128" r="7.5" fill="url(#wholesomeSkin)" />

                {/* Wooden Pointer Cane */}
                <line x1="214" y1="128" x2="262" y2="98" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                {/* Brass Tip */}
                <polygon points="262,98 272,93 265,88" fill="url(#goldShine)" stroke="#ca8a04" strokeWidth="1" />
                {/* Twinkling Sparkle Star */}
                <g transform="translate(276, 92)" style={{ animation: 'sparkleTwinkle 1.8s ease-in-out infinite' }}>
                  <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#facc15" />
                </g>
              </>
            ) : (
              <>
                {/* Pointing Downward towards page elements */}
                <path
                  d="M144 168 Q168 198 158 228"
                  fill="none"
                  stroke="url(#wholesomeSkin)"
                  strokeWidth="13"
                  strokeLinecap="round"
                />
                <circle cx="158" cy="228" r="7.5" fill="url(#wholesomeSkin)" />
                <line x1="158" y1="228" x2="158" y2="266" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                <polygon points="154,266 162,266 158,276" fill="url(#goldShine)" />
                <g transform="translate(158, 280)" style={{ animation: 'sparkleTwinkle 1.8s ease-in-out infinite' }}>
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
