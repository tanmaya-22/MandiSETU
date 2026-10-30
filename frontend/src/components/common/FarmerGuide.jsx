import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X, Sparkles, ArrowRight, ArrowLeft, Check, HelpCircle, Info, MessageCircle } from 'lucide-react'
import { useLangStore } from '../../store/langStore'
import { PAGE_EXPLANATIONS } from '../../i18n/translations'

// Stylized Indian Farmer Mascot (Kisan Chacha / Balaram Kaka)
export function FarmerAvatar({ animated = true, size = 64 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-emerald-600 p-1 shadow-2xl flex-shrink-0 cursor-pointer ${
        animated ? 'animate-float' : ''
      }`}
    >
      <div className="w-full h-full rounded-full bg-amber-50 dark:bg-amber-950/80 overflow-hidden flex items-center justify-center border-2 border-white dark:border-amber-400">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform translate-y-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Kurta Body */}
          <path d="M20 90 L30 65 L70 65 L80 90 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          {/* Green Gamcha (Towel over shoulder) */}
          <path d="M25 65 C22 75, 20 85, 22 95 C27 96, 32 94, 30 80 L32 65 Z" fill="#15803D" />
          <path d="M24 75 L30 75" stroke="#FDE047" strokeWidth="1.5" />
          {/* Neck */}
          <rect x="44" y="52" width="12" height="15" fill="#D97706" rx="4" />
          {/* Head & Ears */}
          <circle cx="34" cy="46" r="6" fill="#D97706" />
          <circle cx="66" cy="46" r="6" fill="#D97706" />
          <ellipse cx="50" cy="46" rx="16" ry="18" fill="#F59E0B" />
          {/* Eyes (warm & smiling) */}
          <ellipse cx="44" cy="44" rx="2" ry="2.5" fill="#1F2937" />
          <ellipse cx="56" cy="44" rx="2" ry="2.5" fill="#1F2937" />
          <path d="M41 40 Q44 38 47 40" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M53 40 Q56 38 59 40" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          {/* Traditional Red Tilak */}
          <path d="M49 33 L51 33 L50 38 Z" fill="#DC2626" />
          {/* Big White Mustache (Elder Indian Farmer Look) */}
          <path
            d="M36 53 Q44 51 50 54 Q56 51 64 53 Q57 60 50 56 Q43 60 36 53 Z"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          {/* Smile */}
          <path d="M46 59 Q50 62 54 59" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          {/* Saffron & Orange Pagdi (Indian Turban) */}
          <path
            d="M30 35 C28 20, 42 12, 50 12 C58 12, 72 20, 70 35 C64 28, 36 28, 30 35 Z"
            fill="#EA580C"
          />
          <path
            d="M32 32 C40 24, 60 24, 68 32 C60 38, 40 38, 32 32 Z"
            fill="#F97316"
          />
          <circle cx="50" cy="22" r="5" fill="#FBBF24" />
        </svg>
      </div>
      {/* Live active beacon */}
      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 animate-pulse" />
    </div>
  )
}

export default function FarmerGuide({ isOpen, onClose, pageMode = false }) {
  const { lang, t } = useLangStore()
  const location = useLocation()
  const navigate = useNavigate()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isFirstVisitPrompt, setIsFirstVisitPrompt] = useState(false)
  const [tourStep, setTourStep] = useState(0)

  // Multi-step full platform walkthrough
  const FULL_TOUR_STEPS = [
    {
      route: '/',
      title: {
        en: 'Namaste! Welcome to MandiSetu',
        hi: 'नमस्ते! मंडीसेतु पर आपका स्वागत है',
        mr: 'नमस्कार! मंडीसेतूवर तुमचे स्वागत आहे',
        or: 'ନମସ୍କାର! ମଣ୍ଡିସେତୁରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ',
      },
      content: {
        en: 'I am Kisan Chacha, your guide. MandiSetu connects you directly with buyers and eliminates commission agents. Let me show you how to maximize your farm income!',
        hi: 'मैं किसान चाचा बलराम हूँ। मंडीसेतु आपको सीधे बड़े खरीदारों से जोड़ता है और बिचौलियों का कमीशन खत्म करता है। चलिए मैं आपको दिखाता हूँ कि अपनी आय कैसे बढ़ाएं!',
        mr: 'मी शेतकरी काका बळीराम. मंडीसेतू तुम्हाला थेट मोठ्या व्यापाऱ्यांशी जोडते आणि दलालांचे कमिशन वाचवते. चला जाणून घेऊया शेती नफा कसा वाढवायचा!',
        or: 'ମୁଁ କିଷାନ ମଉସା ବଳରାମ। ମଣ୍ଡିସେତୁ ଆପଣଙ୍କୁ ସିଧାସଳଖ ବ୍ୟବସାୟୀଙ୍କ ସହ ଯୋଡେ। ଆସନ୍ତୁ ଜାଣିବା କିପରି ଅଧିକ ଲାଭ ପାଇବେ!',
      },
    },
    {
      route: '/prices',
      title: {
        en: 'Module 2: Live APMC Prices & Mandi Map',
        hi: 'मॉड्यूल 2: लाइव मंडी भाव और मानचित्र',
        mr: 'मॉड्यूल २: थेट बाजारभाव व नकाशा',
        or: 'ମଡ୍ୟୁଲ୍ ୨: ଲାଇଭ୍ ମଣ୍ଡି ଦର ଓ ମ୍ୟାପ୍',
      },
      content: {
        en: 'Track official Agmarknet prices across 500+ mandis. Click the "Interactive Mandi Map" to see real Google-style map pins with live rates per quintal!',
        hi: 'यहाँ 500 से ज्यादा मंडियों के असली एगमार्कनेट भाव देखें। इंटरैक्टिव मैप पर क्लिक करके सीधे गूगल मैप्स की तरह लाइव भाव के पिन देखें!',
        mr: '५०० हून अधिक बाजार समित्यांचे थेट दर तपासा. नकाशा टॅबवर जाऊन गुगल मॅप्सप्रमाणे थेट बाजारभाव व आवक पहा!',
        or: '୫୦୦ରୁ ଅଧିକ ମଣ୍ଡିର ସରକାରୀ ଏଗମାର୍କନେଟ୍ ଦର ଦେଖନ୍ତୁ। ମାନଚିତ୍ର ବଟନ୍ ଦବାଇ ସିଧାସଳଖ ଲାଇଭ୍ ଦର ଦେଖନ୍ତୁ!',
      },
    },
    {
      route: '/calculator',
      title: {
        en: 'Module 3: Net Realization Calculator',
        hi: 'मॉड्यूल 3: शुद्ध मुनाफा कैलकुलेटर',
        mr: 'मॉड्यूल ३: निव्वळ नफा कॅल्क्युलेटर',
        or: 'ମଡ୍ୟୁଲ୍ ୩: ନିଟ୍ ଲାଭ କାଲକୁଲେଟର',
      },
      content: {
        en: 'Don\'t let high truck freight eat your profits! This calculator deducts transport cost and APMC cess to tell you which mandi gives you the highest cash in hand.',
        hi: 'ज्यादा भाड़े के कारण आपका मुनाफा न घटे! यह कैलकुलेटर गाड़ी भाड़ा और मंडी टैक्स काटकर बताता है कि कहाँ माल बेचने पर सबसे ज्यादा रुपये बचेंगे।',
        mr: 'वाहतूक खर्चामुळे नफा कमी होऊ देऊ नका! हे साधन अंतर व भाडे वजा करून दाखवते की कोणत्या बाजारात प्रत्यक्ष हातात जास्त पैसे मिळतील.',
        or: 'ଗାଡି ଭଡ଼ା ଯୋଗୁଁ ଆପଣଙ୍କ ଲାଭ କମିବ ନାହିଁ! ଏହି ଟୁଲ୍ ସବୁ ଖର୍ଚ୍ଚ କାଟି ପ୍ରକୃତ ଲାଭ ହିସାବ କରେ।',
      },
    },
    {
      route: '/grading',
      title: {
        en: 'Module 10: AI Quality Grading',
        hi: 'मॉड्यूल 10: एआई फसल ग्रेडिंग',
        mr: 'मॉड्यूल १०: एआई गुणवत्ता प्रतवारी',
        or: 'ମଡ୍ୟୁଲ୍ ୧୦: ଏଆଇ ଫସଲ ଗ୍ରେଡିଂ',
      },
      content: {
        en: 'Upload a simple smartphone photo of your crop. Our Computer Vision AI instantly grades it A+, A, or B so buyers pay you premium rates without unfair cuts.',
        hi: 'अपने मोबाइल से फसल की फोटो खींचकर अपलोड करें। हमारा एआई मॉडल तुरंत ग्रेड A+ या A तय करता है, जिससे खरीदार बिना कटौती के पूरा भाव देते हैं।',
        mr: 'मोबाईलने शेतमालाचा फोटो काढून टाका. एआय तात्काळ A+ किंवा A प्रतवारी ठरवते आणि व्यापारी पूर्ण दर देतात.',
        or: 'ମୋବାଇଲ୍ ଫଟୋ ଅପଲୋଡ୍ କରି ଫସଲର ଗ୍ରେଡ୍ ଜାଣନ୍ତୁ। A+ ଗ୍ରେଡ୍ ଥିଲେ ବ୍ୟବସାୟୀ ପୂରା ଦର ଦେବେ।',
      },
    },
    {
      route: '/listings',
      title: {
        en: 'Module 4: Zero-Commission Produce Lots',
        hi: 'मॉड्यूल 4: सीधी फसल बिक्री',
        mr: 'मॉड्यूल ४: थेट शेतमाल विक्री',
        or: 'ମଡ୍ୟୁଲ୍ ୪: ସିଧାସଳଖ ଫସଲ ବିକ୍ରୟ',
      },
      content: {
        en: 'List your produce in 30 seconds. Verified institutional buyers will place bids directly to you, protected by MandiSetu escrow payments!',
        hi: '30 सेकंड में अपनी फसल लिस्ट करें। देश भर के सत्यापित खरीदार आपको सीधे ऑफर भेजेंगे और आपका भुगतान एस्क्रो खाते में सुरक्षित रहेगा!',
        mr: '३० सेकंदात शेतमाल विक्रीसाठी नोंदवा. विश्वासू व्यापारी थेट खरेदी करतील आणि तुमचे पैसे सुरक्षित राहतील!',
        or: '୩୦ ସେକେଣ୍ଡରେ ଆପଣଙ୍କ ଫସଲ ଯୋଡ଼ନ୍ତୁ। ବଡ଼ ବ୍ୟବସାୟୀ ସିଧାସଳଖ କିଣିବେ ଓ ପେମେଣ୍ଟ ସୁରକ୍ଷିତ ରହିବ!',
      },
    },
  ]

  // Prompt on first visit
  useEffect(() => {
    const visited = localStorage.getItem('mandisetu_tour_seen')
    if (!visited) {
      const timer = setTimeout(() => {
        setIsFirstVisitPrompt(true)
        setDialogOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Sync with external trigger (e.g. Header (i) or tour button)
  useEffect(() => {
    if (isOpen) {
      setIsFirstVisitPrompt(false)
      setDialogOpen(true)
    }
  }, [isOpen])

  const handleStartTour = () => {
    setIsFirstVisitPrompt(false)
    setTourStep(0)
    setDialogOpen(true)
    localStorage.setItem('mandisetu_tour_seen', 'true')
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setIsFirstVisitPrompt(false)
    localStorage.setItem('mandisetu_tour_seen', 'true')
    if (onClose) onClose()
  }

  const handleNextStep = () => {
    if (tourStep < FULL_TOUR_STEPS.length - 1) {
      const nextStep = tourStep + 1
      setTourStep(nextStep)
      const targetRoute = FULL_TOUR_STEPS[nextStep].route
      if (location.pathname !== targetRoute) {
        navigate(targetRoute)
      }
    } else {
      handleCloseDialog()
    }
  }

  const handlePrevStep = () => {
    if (tourStep > 0) {
      const prevStep = tourStep - 1
      setTourStep(prevStep)
      const targetRoute = FULL_TOUR_STEPS[prevStep].route
      if (location.pathname !== targetRoute) {
        navigate(targetRoute)
      }
    }
  }

  const currentPath = location.pathname
  const pageExplanation = PAGE_EXPLANATIONS[currentPath]?.[lang] || PAGE_EXPLANATIONS[currentPath]?.en

  return (
    <>
      {/* 1. PERMANENT FLOATING MASCOT BUTTON (Bottom Left) — ALWAYS VISIBLE! */}
      <div className="fixed bottom-5 left-5 z-[9990] flex items-center gap-2">
        <div
          onClick={() => {
            setIsFirstVisitPrompt(false)
            setDialogOpen(true)
          }}
          className="group relative flex items-center gap-2 cursor-pointer transition transform hover:scale-110 active:scale-95"
        >
          <FarmerAvatar size={58} />
          {/* Animated floating prompt bubble next to mascot */}
          {!dialogOpen && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-300 dark:border-amber-500/40 text-xs font-bold text-gray-800 dark:text-gray-100 animate-bounce">
              <span className="text-amber-500">✨</span>
              <span>{t('chacha_name')}</span>
              <span className="text-[10px] text-brand-600 dark:text-emerald-400">({t('nav_tour')})</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. INTERACTIVE DIALOG POPUP WHEN OPEN */}
      {dialogOpen && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-[9999] max-w-md w-[calc(100vw-2rem)] animate-fade-in-up">
          <div className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border-2 border-amber-400 dark:border-amber-500 text-gray-900 dark:text-white relative">
            {/* Close Button */}
            <button
              onClick={handleCloseDialog}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>

            {/* First Visit Prompt */}
            {isFirstVisitPrompt ? (
              <div className="flex items-start gap-3.5">
                <FarmerAvatar size={64} />
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-extrabold text-sm text-brand-700 dark:text-emerald-400">
                      {t('chacha_name')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                      Kisan Guide
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed mb-3.5">
                    {t('tour_welcome_prompt')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleStartTour}
                      className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 font-bold shadow-md"
                    >
                      <Sparkles size={14} />
                      <span>{t('tour_start_btn')}</span>
                    </button>
                    <button
                      onClick={handleCloseDialog}
                      className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                    >
                      {t('tour_skip_btn')}
                    </button>
                  </div>
                </div>
              </div>
            ) : pageMode && pageExplanation ? (
              /* Single Page Explanation Mode (Triggered by (i) button) */
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <FarmerAvatar size={48} />
                  <div>
                    <h4 className="font-extrabold text-sm text-brand-700 dark:text-emerald-400">
                      {pageExplanation.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {t('chacha_name')} · {t('page_tour_title')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-700 dark:text-gray-200">
                  {pageExplanation.steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed">{st}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCloseDialog}
                  className="btn-primary w-full text-xs py-2 mt-2 font-bold flex items-center justify-center gap-1"
                >
                  <Check size={14} />
                  <span>{t('tour_finish_btn')}</span>
                </button>
              </div>
            ) : (
              /* Full Multi-Step Tour Mode */
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <FarmerAvatar size={44} />
                    <div>
                      <h4 className="font-extrabold text-sm text-brand-700 dark:text-emerald-400">
                        {FULL_TOUR_STEPS[tourStep].title[lang] || FULL_TOUR_STEPS[tourStep].title.en}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Step {tourStep + 1} of {FULL_TOUR_STEPS.length}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed min-h-[50px]">
                  {FULL_TOUR_STEPS[tourStep].content[lang] || FULL_TOUR_STEPS[tourStep].content.en}
                </p>

                {/* Stepper Progress dots */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {FULL_TOUR_STEPS.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === tourStep ? 'w-6 bg-brand-600 dark:bg-emerald-400' : 'w-2 bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Tour Controls */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handlePrevStep}
                    disabled={tourStep === 0}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 transition flex items-center gap-1"
                  >
                    <ArrowLeft size={13} />
                    <span>{t('tour_prev_btn')}</span>
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="btn-primary text-xs py-1.5 px-4 font-bold flex items-center gap-1 shadow-md"
                  >
                    <span>{tourStep === FULL_TOUR_STEPS.length - 1 ? t('tour_finish_btn') : t('tour_next_btn')}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
