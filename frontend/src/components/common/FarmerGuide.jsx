import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  X, FolderLock, Sparkles, ChevronRight, ChevronLeft, ArrowRight,
  CheckCircle2, Compass, MapPin, Eye, ShieldCheck, Scale, Award, HelpCircle
} from 'lucide-react'
import { useLangStore } from '../../store/langStore'
import KisanChachaMascot from './KisanChachaMascot'

// Module-by-module guided tour sequence across MandiSetu
const TOUR_SEQUENCE = [
  { path: '/dashboard', label: 'Dashboard Intelligence', nextPath: '/prices', nextLabel: 'Market Prices' },
  { path: '/prices', label: 'Price Discovery Engine', nextPath: '/calculator', nextLabel: 'Net Calculator' },
  { path: '/calculator', label: 'Realization Calculator', nextPath: '/listings', nextLabel: 'Produce Listings' },
  { path: '/listings', label: 'Produce Listings & Escrow', nextPath: '/transactions', nextLabel: 'Escrow Transactions' },
  { path: '/transactions', label: 'Escrow State Machine', nextPath: '/grading', nextLabel: 'AI Quality Grading' },
  { path: '/grading', label: 'Computer Vision Grading', nextPath: '/arbitration', nextLabel: 'Grievance Tribunal' },
  { path: '/arbitration', label: 'Dispute & Grievance Desk', nextPath: '/mandi-map', nextLabel: 'Mandi Map Network' },
  { path: '/mandi-map', label: 'OpenStreetMap Mandi Network', nextPath: '/dashboard', nextLabel: 'Complete Tour' },
]

const MODULE_TOURS = {
  '/dashboard': {
    moduleCode: 'M01',
    steps: [
      {
        targetSelector: '[data-tour="metric-kpis"], .grid-cols-2, .grid-cols-4',
        title: {
          en: 'Real-Time Clearing Scorecards',
          hi: 'लाइव मंडी समाशोधन स्कोरकार्ड',
          mr: 'दैनिक बाजार स्कोरकार्ड',
          or: 'ଦୈନିକ ମଣ୍ଡି ସ୍କୋରକାର୍ଡ',
        },
        desc: {
          en: 'These 4 key metrics monitor today\'s highest clearing rates, active multi-signature escrow volume, pending farm payouts, and AGMARK quality grading score.',
          hi: 'ये 4 मुख्य कार्ड आज के उच्चतम भाव, सक्रिय एस्क्रो अनुबंध, बकाया किसान भुगतान और AGMARK गुणवत्ता स्कोर की रीयल-टाइम जानकारी देते हैं।',
          mr: 'हे 4 कार्ड आजचा सर्वाधिक भाव, चालू एस्क्रो व्यवहार आणि प्रमाणित गुणवत्ता दाखवतात.',
          or: 'ଏହି 4ଟି କାର୍ଡ ଆଜିର ସର୍ବୋଚ୍ଚ ଦର, ସକ୍ରିୟ ଏସ୍କ୍ରୋ ଓ କୃଷକଙ୍କ ବକେୟା ଟଙ୍କା ଦର୍ଶାଏ।'
        },
        chachaBubble: 'राम राम! Welcome to MandiSetu!'
      },
      {
        targetSelector: '[data-tour="msp-benchmark"], table',
        title: {
          en: 'MSP Baseline Enforcement',
          hi: 'सरकारी MSP बेंचमार्क तुलना',
          mr: 'सरकारी हमीभाव पडताळणी',
          or: 'ସରକାରୀ MSP ପରୀକ୍ଷଣ',
        },
        desc: {
          en: 'Every commodity is cross-referenced with Central MSP standards. Green checkmarks denote profitable trade above MSP, preventing intermediary exploitation.',
          hi: 'प्रत्येक फसल की जांच सरकारी MSP से होती है। हरा टिक मार्क यानी भाव MSP से अधिक है, जिससे बिचौलियों द्वारा शोषण नहीं हो सकता।',
          mr: 'प्रत्येक भाव हमीभावाशी तपासला जातो. हिरवा रंग हमीभावापेक्षा जास्त नफा दर्शवतो.',
          or: 'ପ୍ରତିଟି ଫସଲ ଦର ସରକାରୀ MSP ସହ ଯାଞ୍ଚ ହୁଏ। ସବୁଜ ମାନେ MSP ଠାରୁ ଅଧିକ ଲାଭ।'
        },
        chachaBubble: 'Never sell below MSP!'
      },
      {
        targetSelector: '[data-tour="market-snapshot"]',
        title: {
          en: 'Spatial Arbitrage Comparison',
          hi: 'मंडी भाव तुलना व स्थानिक आर्बिट्राज',
          mr: 'बाजार भाव तुलना',
          or: 'ମଣ୍ଡି ଦର ତୁଳନା',
        },
        desc: {
          en: 'Compare modal rates across nearby and distant mandis in real time to capture maximum price spreads before hiring transport.',
          hi: 'वाहन किराए पर लेने से पहले आसपास और दूर की मंडियों के भावों की तुलना करके अधिकतम मुनाफा सुरक्षित करें।',
          mr: 'वाहतूक ठरवण्यापूर्वी शेजारील मंड्यांमधील भावांची तुलना करा.',
          or: 'ଗାଡ଼ି ବୁକିଂ ପୂର୍ବରୁ ବିଭିନ୍ନ ମଣ୍ଡିର ଦର ତୁଳନା କରି ସର୍ବାଧିକ ଲାଭ ପାଆନ୍ତୁ।'
        },
        chachaBubble: 'Find the highest rate!'
      }
    ]
  },

  '/prices': {
    moduleCode: 'M02',
    steps: [
      {
        targetSelector: 'input[placeholder*="Search"], input[type="text"]',
        title: {
          en: 'Multi-Terminal Query Engine',
          hi: '500+ मंडियों में फसल खोजें',
          mr: 'थेट बाजार शोध आणि राज्य फिल्टर',
          or: 'ଲାଇଭ ମଣ୍ଡି ଖୋଜ ଓ ଫିଲ୍ଟର',
        },
        desc: {
          en: 'Filter over 500+ regulated APMC yards across India by commodity name or location to locate active wholesale buyers.',
          hi: 'सर्च बार में फसल (जैसे गेहूं, प्याज, टमाटर) या मंडी का नाम लिखकर तुरंत थोक खरीदारों और ताजा भावों की सूची देखें।',
          mr: 'भारतातील 500+ मंड्यांमधून पिकाच्या नावाने किंवा स्थानानुसार शोधा.',
          or: 'ଦେଶର 500+ ମଣ୍ଡି ମଧ୍ୟରୁ ଫସଲ ବା ସ୍ଥାନ ଅନୁସାରେ ତଥ୍ୟ ଖୋଜନ୍ତୁ।'
        },
        chachaBubble: 'Search any crop or mandi!'
      },
      {
        targetSelector: 'table th, .divide-y',
        title: {
          en: 'Dynamic Sorting Columns',
          hi: 'कॉलम हेडर पर क्लिक करके सॉर्ट करें',
          mr: 'स्तंभ क्रमवारी लावा',
          or: 'କଲମ ସର୍ଟିଂ ମ୍ୟାଟ୍ରିକ୍ସ',
        },
        desc: {
          en: 'Click on Modal Price, Min Price, or Max Price headers to dynamically re-index the list from highest to lowest clearing rate.',
          hi: 'उच्चतम से निम्नतम दर पर मंडियों को तुरंत क्रमबद्ध करने के लिए कॉलम हेडर (मोडल, न्यूनतम, अधिकतम मूल्य) पर क्लिक करें।',
          mr: 'सर्वाधिक बाजार भाव पाहण्यासाठी कॉलम हेडरवर क्लिक करा.',
          or: 'ସର୍ବୋଚ୍ଚ ଦର ଦେଖିବାକୁ କଲମ ହେଡର ଉପରେ କ୍ଲିକ କରି ସର୍ଟ କରନ୍ତୁ।'
        },
        chachaBubble: 'Sort from high to low!'
      }
    ]
  },

  '/calculator': {
    moduleCode: 'M03',
    steps: [
      {
        targetSelector: 'form, input[type="number"]',
        title: {
          en: 'Harvest Volume & Quoted Rate',
          hi: 'फसल मात्रा व कोटेड भाव दर्ज करें',
          mr: 'मालाचे प्रमाण व भाव प्रविष्ट करा',
          or: 'ଫସଲ ପରିମାଣ ଓ ଦର ପ୍ରବେଶ କରନ୍ତୁ',
        },
        desc: {
          en: 'Enter consignment weight in quintals and quoted mandi price. This forms the baseline for the realization algorithm.',
          hi: 'अपनी फसल की मात्रा (क्विंटल) और कोटेड भाव दर्ज करें। यह आपकी कुल बिक्री की गणना करता है।',
          mr: 'आपल्या मालाचे प्रमाण (क्विंटल) आणि मंडी भाव टाका.',
          or: 'ନିଜ ଫସଲର ପରିମାଣ ଓ ମଣ୍ଡି ଦର ପ୍ରବେଶ କରନ୍ତୁ।'
        },
        chachaBubble: 'Calculate exact take-home cash!'
      },
      {
        targetSelector: '.bg-emerald-50, .border-emerald-200, .bg-gradient-to-br',
        title: {
          en: 'Intermediary Cost Deductions',
          hi: 'मंडी सेस व भाड़ा कटौती का विश्लेषण',
          mr: 'सर्व छुपे खर्च आणि वजावट',
          or: 'ସମସ୍ତ କାଟତିର ଗଣନା',
        },
        desc: {
          en: 'The engine strips APMC cess (1-2%), commission (1.5-2.5%), weighbridge charges, and distance-based diesel freight to compute true in-hand cash.',
          hi: 'कैलकुलेटर मंडी सेस, दलाली, तुलाई और डीजल भाड़ा घटाकर किसान के हाथ में आने वाली असली शुद्ध रकम दिखाता है।',
          mr: 'बाजार फी, कमिशन आणि वाहतूक खर्च वजा करून खरी रक्कम दाखवतो.',
          or: 'ମଣ୍ଡି ସେସ୍, କମିଶନ ଓ ଗାଡ଼ି ଭଡ଼ା କାଟି ହାତକୁ ଆସୁଥିବା ନିଟ ଟଙ୍କା ଦେଖାଏ।'
        },
        chachaBubble: 'Zero hidden surprises!'
      }
    ]
  },

  '/listings': {
    moduleCode: 'M04',
    steps: [
      {
        targetSelector: '.border-emerald-100, .bg-emerald-50, .grid-cols-1.md\\:grid-cols-2',
        title: {
          en: 'Verified Producer Identity',
          hi: 'सत्यापित किसान व FPO क्रेडेंशियल्स',
          mr: 'सत्यापित शेतकरी प्रोफाइल',
          or: 'ପ୍ରମାଣିତ କୃଷକ ପରିଚୟ',
        },
        desc: {
          en: 'Each listing clearly shows who created it: Verified Farmer/FPO Name, KYC Badge, Cultivation Acreage, and Mandi Jurisdiction.',
          hi: 'प्रत्येक लिस्टिंग में स्पष्ट दिखता है कि इसे किसने बनाया: सत्यापित किसान का नाम, KYC बैज, खेत का रकबा और मंडी अधिकार क्षेत्र।',
          mr: 'प्रत्येक लॉट कोण तयार केला आहे हे स्पष्टपणे दाखवतो: नाव, KYC आणि क्षेत्र.',
          or: 'ପ୍ରତିଟି ଲଟରେ କୃଷକଙ୍କ ନାମ, KYC ପ୍ରମାଣପତ୍ର ଓ ଜମି ପରିମାଣ ସ୍ପଷ୍ଟ ଭାବେ ପ୍ରଦର୍ଶିତ।'
        },
        chachaBubble: 'Real farmers, verified KYC!'
      },
      {
        targetSelector: 'button:has(svg), a[href*="/listings/"]',
        title: {
          en: 'Escrow Terms & Secondary Inspector',
          hi: '100% एस्क्रो सुरक्षा व समर्पित द्वितीयक पृष्ठ',
          mr: '100% एस्क्रो संरक्षण व सविस्तर पान',
          or: '100% ଏସ୍କ୍ରୋ ସୁରକ୍ଷା ଓ ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ',
        },
        desc: {
          en: 'Includes 6 mandatory trade conditions: 100% Escrow deposit before truck dispatch, APMC weighbridge slips, and 48h dispatch commitment.',
          hi: '6 अनिवार्य व्यापार शर्तें: ट्रक प्रस्थान से पहले 100% एस्क्रो जमा, मंडी तुलाई पर्ची और 48 घंटे में प्रस्थान की गारंटी।',
          mr: '6 महत्त्वाच्या अटी: 100% एस्क्रो संरक्षण, वजन पावती, आणि 48 तासांत माल रवानगी.',
          or: '6ଟି ବାଧ୍ୟତାମୂଳକ ସର୍ତ୍ତ: 100% ଏସ୍କ୍ରୋ ଜମା, ଧର୍ମକଣ୍ଟା ରସିଦ ଓ 48 ଘଣ୍ଟା ମଧ୍ୟରେ ଗାଡ଼ି ରବାନା।'
        },
        chachaBubble: '100% payment guarantee!'
      }
    ]
  },

  '/transactions': {
    moduleCode: 'M06',
    steps: [
      {
        targetSelector: '.divide-y, table, .space-y-4',
        title: {
          en: '7-Stage Milestone Escrow Vault',
          hi: '7-चरणीय एस्क्रो स्टेट मशीन',
          mr: '7-टप्प्यांची एस्क्रो सुरक्षा',
          or: '7-ପର୍ଯ୍ୟାୟ ଏସ୍କ୍ରୋ ସୁରକ୍ଷା',
        },
        desc: {
          en: 'Buyer deposits 100% funds into the neutral MandiSetu vault before goods leave the farm. Real-time GPS e-Waybill tracking follows the consignment.',
          hi: 'फसल रवाना होने से पहले खरीदार 100% रकम मंडीसेतु एस्क्रो तिजोरी में जमा करता है। GPS ई-वे बिल के साथ वाहन को लाइव ट्रैक करें।',
          mr: 'माल निघण्यापूर्वी खरेदीदार 100% रक्कम एस्क्रो खात्यात जमा करतो. शून्य फसवणूक.',
          or: 'ଫସଲ ବାହାରିବା ପୂର୍ବରୁ କ୍ରେତା 100% ଟଙ୍କା ଏସ୍କ୍ରୋ ଭଲ୍ଟରେ ଜମା କରନ୍ତି।'
        },
        chachaBubble: 'Zero default payment risk!'
      }
    ]
  },

  '/grading': {
    moduleCode: 'M10',
    steps: [
      {
        targetSelector: 'input[type="file"], form, .border-dashed',
        title: {
          en: 'Computer Vision Harvest Appraisal',
          hi: 'एआई फसल गुणवत्ता व ग्रेडिंग स्कैन',
          mr: 'एआई गुणवत्ता प्रतवारी',
          or: 'ଏଆଇ ଗୁଣବତ୍ତା ନିର୍ଣ୍ଣୟ',
        },
        desc: {
          en: 'Upload harvest photos to scan diameter uniformity, surface blemish index, and moisture compliance according to AGMARK benchmarks.',
          hi: 'फसल की फोटो अपलोड करें। हमारा एआई मॉडल आकार, नमी और रंग की जांच कर AGMARK प्रमाणित ग्रेड निर्धारित करता है।',
          mr: 'पिकाचा फोटो अपलोड करा. एआय मॉडेल आकार, ओलावा व डाग तपासून प्रत ठरवते.',
          or: 'ଫସଲ ଫଟୋ ଅପଲୋଡ କରନ୍ତୁ। ଏଆଇ ମଡେଲ ଆକାର, ଆର୍ଦ୍ରତା ଓ ଦାଗ ଯାଞ୍ଚ କରିବ।'
        },
        chachaBubble: 'Grade A+ gets 25% premium!'
      }
    ]
  },

  '/arbitration': {
    moduleCode: 'M09',
    steps: [
      {
        targetSelector: 'form, button[type="submit"], table',
        title: {
          en: 'Statutory 24-Hour Dispute Window',
          hi: 'मंडी डिजिटल शिकायत व मध्यस्थता ट्रिब्यूनल',
          mr: 'तक्रार निवारण आणि मध्यस्थी लवाद',
          or: 'ମଣ୍ଡି ଅଭିଯୋଗ ଓ ମଧ୍ୟସ୍ଥତା ଟ୍ରିବ୍ୟୁନାଲ',
        },
        desc: {
          en: 'Post-delivery, parties have 24 hours to file evidence-backed quality or weighment discrepancy claims with automatic escrow hold until resolved.',
          hi: 'डिलीवरी के बाद 24 घंटे के भीतर गुणवत्ता में अंतर या वजन विसंगति पर शिकायत दर्ज करें। एस्क्रो राशि तुरंत सुरक्षित हो जाती है।',
          mr: 'वितरणानंतर 24 तासांच्या आत मालाची गुणवत्ता किंवा वजनातील फरकावर तक्रार दाखल करू शकता.',
          or: 'ଡେଲିଭରୀ ପରେ 24 ଘଣ୍ଟା ମଧ୍ୟରେ ଗୁଣବତ୍ତା ବା ଓଜନରେ ତ୍ରୁଟି ଥିଲେ ଅଭିଯୋଗ ଦାଖଲ କରିପାରିବେ।'
        },
        chachaBubble: 'Fair APMC arbitration!'
      }
    ]
  },
}

export default function FarmerGuide({ isOpen: forceOpen, onClose: forceClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { language } = useLangStore()

  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [pointerSide, setPointerSide] = useState('left')

  // Auto-launch on first visit to any module if never taken
  useEffect(() => {
    const hasTakenTour = localStorage.getItem('mandisetu_tour_completed')
    if (!hasTakenTour) {
      setIsOpen(true)
    }
  }, [])

  // Listen for navbar trigger event
  useEffect(() => {
    const handleTrigger = () => {
      setIsOpen(true)
      setCurrentStep(0)
    }
    window.addEventListener('mandisetu_open_guide', handleTrigger)
    return () => window.removeEventListener('mandisetu_open_guide', handleTrigger)
  }, [])

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
      setCurrentStep(0)
    }
  }, [forceOpen])

  // Get current module tour definition
  const path = location.pathname
  const tourData = MODULE_TOURS[path] || MODULE_TOURS['/dashboard']
  const steps = tourData.steps || []
  const totalSteps = steps.length
  const stepObj = steps[currentStep] || steps[0]

  // Track next route in tour sequence
  const currentTourSeq = TOUR_SEQUENCE.find(s => s.path === path) || TOUR_SEQUENCE[0]

  // Calculate target element bounding rect & highlight position
  useEffect(() => {
    if (!isOpen || !stepObj) return

    const updateTargetPosition = () => {
      let el = null
      if (stepObj.targetSelector) {
        const selectors = stepObj.targetSelector.split(',').map(s => s.trim())
        for (const sel of selectors) {
          try {
            const found = document.querySelector(sel)
            if (found) {
              el = found
              break
            }
          } catch {}
        }
      }

      if (el) {
        const rect = el.getBoundingClientRect()
        // Scroll smoothly into view if offscreen
        if (rect.top < 60 || rect.bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom,
        })

        // Determine which side to place tooltip: prefer right if space, else left or bottom
        if (rect.right + 420 < window.innerWidth) {
          setPointerSide('left') // Arrow points left towards element on its left
        } else if (rect.left - 420 > 0) {
          setPointerSide('right') // Arrow points right towards element on its right
        } else {
          setPointerSide('top') // Arrow points up towards element above
        }
      } else {
        setTargetRect(null)
      }
    }

    const timer = setTimeout(updateTargetPosition, 250)
    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition)
    }
  }, [isOpen, currentStep, path, stepObj])

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Last step of this page: advance to next module or finish
      handleGoToNextPage()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleGoToNextPage = () => {
    if (currentTourSeq.nextPath && currentTourSeq.nextPath !== path) {
      setCurrentStep(0)
      navigate(currentTourSeq.nextPath)
    } else {
      handleCompleteTour()
    }
  }

  const handleCompleteTour = () => {
    setIsOpen(false)
    localStorage.setItem('mandisetu_tour_completed', 'true')
    if (forceClose) forceClose()
  }

  const getLangText = (obj, fallback = '') => {
    if (!obj) return fallback
    if (typeof obj === 'string') return obj
    return obj[language] || obj['en'] || fallback
  }

  if (!isOpen) return null

  const isLastStepOfModule = currentStep === totalSteps - 1
  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 100

  // Calculate Popover coordinates anchored to target rect if available
  let popoverStyle = {}
  if (targetRect) {
    if (pointerSide === 'left') {
      popoverStyle = {
        position: 'fixed',
        top: Math.max(80, Math.min(window.innerHeight - 380, targetRect.top - 20)),
        left: Math.min(window.innerWidth - 440, targetRect.right + 24),
      }
    } else if (pointerSide === 'right') {
      popoverStyle = {
        position: 'fixed',
        top: Math.max(80, Math.min(window.innerHeight - 380, targetRect.top - 20)),
        right: Math.min(window.innerWidth - 440, window.innerWidth - targetRect.left + 24),
      }
    } else {
      popoverStyle = {
        position: 'fixed',
        top: Math.min(window.innerHeight - 380, targetRect.bottom + 24),
        left: Math.max(20, Math.min(window.innerWidth - 440, targetRect.left)),
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden animate-in fade-in duration-200">
      {/* ── Semi-transparent Dimming Backdrop ── */}
      <div
        onClick={handleCompleteTour}
        className="absolute inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
      />

      {/* ── Spotlight Cutout & Glowing Ring on Active Target Element ── */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-2xl transition-all duration-300 ease-out z-50 ring-4 ring-blue-500/80 shadow-[0_0_40px_rgba(59,130,246,0.6)]"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* ── Main Interactive Walkthrough Card & Kisan Chacha Mascot ── */}
      <div
        className={`fixed z-50 flex items-end gap-3 transition-all duration-300 ${
          targetRect ? '' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        style={targetRect ? popoverStyle : {}}
      >
        {/* Animated Kisan Chacha Game Mascot standing beside the card */}
        <div className="hidden sm:block shrink-0 -mb-2">
          <KisanChachaMascot
            size="md"
            isPointing={true}
            pointingDirection={pointerSide === 'right' ? 'right' : 'left'}
            speechBubble={stepObj?.chachaBubble || 'Let me show you!'}
          />
        </div>

        {/* ── Exact Match Walkthrough Popover Card (LPULive / Modern Game Guide Style) ── */}
        <div className="relative w-[360px] sm:w-[420px] rounded-2xl bg-[#111928] border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 sm:p-7 text-white font-sans overflow-visible">
          {/* ── Directional Pointer Arrow (Triangle pointing to highlighted element) ── */}
          {targetRect && pointerSide === 'left' && (
            <div className="absolute top-10 -left-3 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[12px] border-r-[#111928] drop-shadow-md" />
          )}
          {targetRect && pointerSide === 'right' && (
            <div className="absolute top-10 -right-3 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[12px] border-l-[#111928] drop-shadow-md" />
          )}
          {targetRect && pointerSide === 'top' && (
            <div className="absolute -top-3 left-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-[#111928] drop-shadow-md" />
          )}

          {/* Close / Dismiss 'X' Button */}
          <button
            onClick={handleCompleteTour}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss Tour"
          >
            <X size={16} />
          </button>

          {/* Header: Rounded Orange Folder/Icon + Bold Crisp Title */}
          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shrink-0 shadow-inner">
              <FolderLock size={22} className="text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-0.5">
                Kisan Chacha (बलराम जी) · {currentTourSeq.label}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                {getLangText(stepObj?.title)}
              </h3>
            </div>
          </div>

          {/* Description Text */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3.5 font-normal">
            {getLangText(stepObj?.desc)}
          </p>

          {/* Electric Blue Progress Bar */}
          <div className="mt-5 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Controls Bar: Previous | X of Y | Next / Next Module */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                currentStep === 0
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95'
              }`}
            >
              Previous
            </button>

            <span className="text-xs font-semibold text-slate-400 select-none">
              {currentStep + 1} of {totalSteps}
            </span>

            {isLastStepOfModule ? (
              <button
                onClick={handleGoToNextPage}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 active:scale-95 transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Next Page: {currentTourSeq.nextLabel}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition cursor-pointer"
              >
                Next
              </button>
            )}
          </div>

          {/* Bottom Actions Row: End Tour option on last step or Skip Tour */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
            <button
              onClick={handleCompleteTour}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Skip Tour
            </button>
            {isLastStepOfModule && (
              <button
                onClick={handleCompleteTour}
                className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                End Tour Here
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
