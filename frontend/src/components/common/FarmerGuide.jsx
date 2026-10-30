import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  X, Sparkles, ChevronRight, ChevronLeft, Volume2, HelpCircle,
  Play, CheckCircle2, ArrowRight, Move
} from 'lucide-react'
import { useLangStore } from '../../store/langStore'

// Comprehensive Interactive Walkthroughs by Page in all 4 languages
const PAGE_INTERACTIVE_TOURS = {
  '/dashboard': {
    title: { en: 'Dashboard Walkthrough', hi: 'डैशबोर्ड गाइड', mr: 'डॅशबोर्ड माहिती', or: 'ଡ୍ୟାସବୋର୍ଡ ମାର୍ଗଦର୍ଶିକା' },
    steps: [
      {
        title: { en: 'Welcome to your Farm Command Center', hi: 'आपके फार्म कमांड सेंटर में स्वागत है', mr: 'तुमच्या मुख्य केंद्रावर स्वागत', or: 'ଆପଣଙ୍କ ମୁଖ୍ୟ କେନ୍ଦ୍ରକୁ ସ୍ୱାଗତ' },
        desc: {
          en: 'Namaste! Here you get a daily pulse of all 12 modules. The top 4 cards show Today’s Best Local Price, Active Contracts, Pending Escrow Payments, and Certified Produce Grade.',
          hi: 'नमस्ते भाई! यहाँ आपको सभी 12 मॉड्यूल का दैनिक सार मिलता है। ऊपर के 4 कार्ड आपको सर्वश्रेष्ठ भाव, सक्रिय अनुबंध और बकाया भुगतान दिखाते हैं।',
          mr: 'नमस्कार! येथे तुम्हाला 12 मॉड्यूल्सचा दैनिक गोषवारा मिळतो. वरील 4 कार्ड सर्वोत्तम भाव आणि सक्रिय करार दर्शवतात.',
          or: 'ନମସ୍କାର! ଏଠାରେ ଆପଣ ସମସ୍ତ 12ଟି ମଡ୍ୟୁଲର ଦୈନିକ ସାରାଂଶ ପାଇବେ। ଉପର କାର୍ଡରେ ଆଜିର ସର୍ବୋତ୍ତମ ଦର ଓ ସକ୍ରିୟ ଚୁକ୍ତି ଦେଖାଏ।'
        },
        actionHint: {
          en: 'Tip: Click any stat card to jump straight to that module.',
          hi: 'सुझाव: सीधे उस मॉड्यूल में जाने के लिए किसी भी कार्ड पर क्लिक करें।',
          mr: 'टीप: त्या मॉड्यूलवर जाण्यासाठी कोणत्याही कार्डवर क्लिक करा.',
          or: 'ଟିପ୍ପଣୀ: ସିଧାସଳଖ ସେହି ମଡ୍ୟୁଲକୁ ଯିବା ପାଇଁ କାର୍ଡ ଉପରେ କ୍ଲିକ କରନ୍ତୁ।'
        }
      },
      {
        title: { en: 'Market Snapshot & MSP Check', hi: 'बाज़ार स्नैपशॉट और MSP जांच', mr: 'बाजार आढावा आणि MSP तपासणी', or: 'ବଜାର ସାରାଂଶ ଓ MSP ଯାଞ୍ଚ' },
        desc: {
          en: 'Look at the Market Snapshot on your screen. The green percentages indicate rates trading above the Govt MSP benchmark, while red warns you of temporary price drops.',
          hi: 'बाज़ार स्नैपशॉट देखें। हरे रंग का प्रतिशत सरकारी MSP से अधिक भाव दर्शाता है, जबकि लाल रंग अस्थायी मंदी की चेतावनी देता है।',
          mr: 'मार्केट स्नॅपशॉट पहा. हिरवी टक्केवारी सरकारी MSP पेक्षा जास्त भाव दर्शवते.',
          or: 'ମାର୍କେଟ ସ୍ନାପସଟ ଦେଖନ୍ତୁ। ସବୁଜ ରଙ୍ଗ ସରକାରୀ MSP ଠାରୁ ଅଧିକ ଦର ଦର୍ଶାଏ।'
        },
        actionHint: {
          en: 'How to change: Select your target crop to view 14-day AI price trajectory forecasts.',
          hi: 'बदलने का तरीका: 14 दिनों का मूल्य पूर्वानुमान देखने के लिए अपनी फसल चुनें।',
          mr: 'बदलण्याचा मार्ग: 14 दिवसांचा अंदाज पाहण्यासाठी आपले पीक निवडा.',
          or: 'ପରିବର୍ତ୍ତନ କିପରି କରିବେ: 14-ଦିନର ମୂଲ୍ୟ ପୂର୍ବାନୁମାନ ଦେଖିବାକୁ ଫସଲ ବାଛନ୍ତୁ।'
        }
      }
    ]
  },

  '/prices': {
    title: { en: 'Price Discovery & Sorting Tour', hi: 'मंडी भाव व सॉर्टिंग गाइड', mr: 'भाव शोध आणि सॉर्टिंग मार्गदर्शक', or: 'ଦର ଖୋଜ ଓ ସର୍ଟିଂ ମାର୍ଗଦର୍ଶିକା' },
    steps: [
      {
        title: { en: 'Real-Time Agmarknet Mandi Rates', hi: 'रीयल-टाइम एगमार्कनेट मंडी भाव', mr: 'थेट एगमार्कनेट मंडी दर', or: 'ଲାଇଭ ଏଗମାର୍କନେଟ ମଣ୍ଡି ଦର' },
        desc: {
          en: 'This table compiles official APMC rates from over 500 mandis across India. Each row lists Min, Max, and Modal (most frequent) clearing rates.',
          hi: 'यह तालिका भारत भर की 500 से अधिक मंडियों के आधिकारिक APMC भाव दिखाती है। प्रत्येक पंक्ति में न्यूनतम, अधिकतम और मोडल दरें हैं।',
          mr: 'हा तक्ता भारतातील 500 हून अधिक मंड्यांमधील अधिकृत दर दाखवतो.',
          or: 'ଏହି ତାଲିକା ଭାରତର 500ରୁ ଅଧିକ ମଣ୍ଡିର ସରକାରୀ ଦର ଦେଖାଏ।'
        },
        actionHint: {
          en: 'Interactive: Click on any column header like "Modal ₹/qtl" or "Mandi" to sort from highest to lowest rate.',
          hi: 'इंटरएक्टिव: उच्चतम से निम्नतम दर सॉर्ट करने के लिए "Modal ₹/qtl" कॉलम हेडर पर क्लिक करें।',
          mr: 'सॉर्ट करण्यासाठी "Modal ₹/qtl" हेडरवर क्लिक करा.',
          or: 'ଉଚ୍ଚରୁ ନିମ୍ନ ଦର ସର୍ଟ କରିବାକୁ "Modal ₹/qtl" ଉପରେ କ୍ଲିକ କରନ୍ତୁ।'
        }
      },
      {
        title: { en: 'What the Green Checkmark (✓) Means', hi: 'हरे टिक (✓) का क्या अर्थ है', mr: 'हिरव्या टिकचा (✓) अर्थ काय', or: 'ସବୁଜ ଚିହ୍ନର (✓) ଅର୍ଥ କ’ଣ' },
        desc: {
          en: 'Whenever you see a green checkmark next to the price, that mandi is offering rates strictly ABOVE the central government MSP benchmark. A red cross warns you it is below MSP.',
          hi: 'जब भी आप भाव के पास हरा टिक देखें, इसका मतलब है कि वह मंडी सरकारी MSP से अधिक दाम दे रही है। लाल क्रॉस का मतलब भाव MSP से कम है।',
          mr: 'हिरवा टिक म्हणजे तो भाव सरकारी MSP पेक्षा जास्त आहे.',
          or: 'ସବୁଜ ଚିହ୍ନ ଥିଲେ ମଣ୍ଡିଟି ସରକାରୀ MSP ଠାରୁ ଅଧିକ ଦର ଦେଉଛି।'
        },
        actionHint: {
          en: 'Use the State dropdown at top to filter only mandis in your region.',
          hi: 'शीर्ष पर राज्य ड्रॉपडाउन का उपयोग करके केवल अपने क्षेत्र की मंडियों को फ़िल्टर करें।',
          mr: 'फक्त तुमच्या राज्यातील मंड्या पाहण्यासाठी फिल्टर वापरा.',
          or: 'କେବଳ ଆପଣଙ୍କ ରାଜ୍ୟର ମଣ୍ଡି ଦେଖିବାକୁ ଫିଲ୍ଟର ବ୍ୟବହାର କରନ୍ତୁ।'
        }
      }
    ]
  },

  '/calculator': {
    title: { en: 'Net Realization Calculator Demo', hi: 'शुद्ध आय कैलकुलेटर गाइड', mr: 'कॅल्क्युलेटर डेमो', or: 'କ୍ୟାଲକୁଲେଟର ଡେମୋ' },
    steps: [
      {
        title: { en: 'Why Gross Price is Not Your Take-Home', hi: 'सकल भाव आपकी असली कमाई क्यों नहीं है', mr: 'एकूण भाव तुमची खरी कमाई का नाही', or: 'ମୋଟ ଦର ଆପଣଙ୍କ ପ୍ରକୃତ ଆୟ କାହିଁକି ନୁହେଁ' },
        desc: {
          en: 'Mandi buyers often quote ₹2,500/qtl, but after transport fuel, commission, weighbridge cess, and bag packaging, your actual realization may drop to ₹2,200/qtl. This tool calculates every rupee accurately.',
          hi: 'मंडी में व्यापारी ₹2,500/क्विंटल बोलते हैं, लेकिन भाड़ा, दलाली, तुलाई और बोरी खर्च के बाद आपके हाथ में ₹2,200 ही बचते हैं। यह टूल हर एक रुपये की सही गणना करता है।',
          mr: 'वाहतूक, हमाली आणि कमिशन वजा केल्यानंतर तुमच्या हातात येणारी खरी रक्कम हा कॅल्क्युलेटर दाखवतो.',
          or: 'ପରିବହନ, ଦଲାଲି ଓ ବସ୍ତା ଖର୍ଚ୍ଚ କାଟିବା ପରେ ହାତକୁ ଆସୁଥିବା ନିଟ ଟଙ୍କା ଏଠାରେ ସଠିକ ଗଣନା ହୁଏ।'
        },
        actionHint: {
          en: 'How to use: Change the Quantity input and watch the Cost Breakdown update instantly on the right.',
          hi: 'उपयोग कैसे करें: मात्रा (क्विंटल) बदलें और दाईं ओर लागत विवरण को तुरंत बदलते हुए देखें।',
          mr: 'कसे वापरावे: प्रमाण बदला आणि उजवीकडील खर्च आपोआप बदलताना पहा.',
          or: 'ପରିମାଣ ବଦଳାନ୍ତୁ ଓ ଡାହାଣ ପଟେ ଖର୍ଚ୍ଚ ପରିବର୍ତ୍ତନ ଦେଖନ୍ତୁ।'
        }
      },
      {
        title: { en: 'Transport Distance & Packaging Variables', hi: 'परिवहन दूरी व पैकेजिंग विकल्प', mr: 'वाहतूक खर्च आणि पॅकिंग', or: 'ପରିବହନ ଓ ପ୍ୟାକିଂ ଖର୍ଚ୍ଚ' },
        desc: {
          en: 'Increasing transport cost directly reduces your net realization. Try comparing a closer mandi with slightly lower rate vs a distant mandi with higher rate to see where you make more profit!',
          hi: 'परिवहन लागत बढ़ने से आपका मुनाफा घटता है। पास की मंडी बनाम दूर की मंडी की तुलना करें और देखें कि किसमें ज़्यादा बचत होगी!',
          mr: 'जवळची मंडी आणि लांबची मंडी यांच्या नफ्याची तुलना करून पहा!',
          or: 'ପାଖ ମଣ୍ଡି ଓ ଦୂର ମଣ୍ଡିର ଖର୍ଚ୍ଚ ତୁଳନା କରି ପ୍ରକୃତ ଲାଭ ବାଛନ୍ତୁ।'
        },
        actionHint: {
          en: 'Check the Net Realization card: Green means your net profit safely exceeds Govt MSP!',
          hi: 'नेट रियलाइजेशन कार्ड देखें: हरा रंग बताता है कि आपका शुद्ध मुनाफा MSP से अधिक है!',
          mr: 'हिरवा रंग म्हणजे तुमचा निव्वळ नफा MSP पेक्षा सुरक्षितपणे जास्त आहे!',
          or: 'ସବୁଜ ରଙ୍ଗ ଦର୍ଶାଏ ଆପଣଙ୍କ ନିଟ ଲାଭ MSP ଠାରୁ ଅଧିକ।'
        }
      }
    ]
  },

  '/mandi-map': {
    title: { en: 'OpenStreetMap Mandi Guide', hi: 'मंडी मानचित्र व लोकेशन गाइड', mr: 'मंडी नकाशा मार्गदर्शक', or: 'ମଣ୍ଡି ମାନଚିତ୍ର ମାର୍ଗଦର୍ଶିକା' },
    steps: [
      {
        title: { en: 'Zero API Keys & Real Public Map', hi: 'बिना किसी API Key के खुला मानचित्र', mr: 'मोफत ओपन मॅप', or: 'ମାଗଣା ଓପନ ମାନଚିତ୍ର' },
        desc: {
          en: 'This interactive map uses OpenStreetMap with zero proprietary Google API keys. Every marker shows an active APMC market with live contact numbers and daily arrival volumes.',
          hi: 'यह मानचित्र ओपनस्ट्रीटमैप पर आधारित है जिसमें किसी गूगल एपीआई की आवश्यकता नहीं है। हर मार्कर पर मंडी का फोन नंबर व सुविधाएं उपलब्ध हैं।',
          mr: 'हा नकाशा ओपनस्ट्रीटमॅपवर आधारित आहे. प्रत्येक मार्करवर फोन नंबर आणि सुविधा आहेत.',
          or: 'ଏହି ମାନଚିତ୍ରରେ କୌଣସି ଗୁଗଲ API କି ଦରକାର ନାହିଁ। ପ୍ରତି ମାର୍କରରେ ଫୋନ ନମ୍ବର ଓ ସୁବିଧା ଅଛି।'
        },
        actionHint: {
          en: 'Interactive: Click "📍 Use My Location" to automatically find and center the nearest mandi to your farm!',
          hi: 'इंटरएक्टिव: अपने खेत से सबसे नज़दीकी मंडी खोजने के लिए "📍 Use My Location" बटन दबाएँ!',
          mr: 'जवळची मंडी शोधण्यासाठी "📍 Use My Location" बटणावर क्लिक करा!',
          or: 'ନିକଟତମ ମଣ୍ଡି ଖୋଜିବାକୁ "📍 Use My Location" ବଟନ ଦବାନ୍ତୁ।'
        }
      }
    ]
  }
}

export default function FarmerGuide({ isOpen: forceOpen, onClose: forceClose, pageMode: forcePageMode }) {
  const location = useLocation()
  const { language } = useLangStore()

  // State
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [isTourActive, setIsTourActive] = useState(false)

  // Drag and Drop state
  const [position, setPosition] = useState({ x: 24, y: window.innerHeight - 110 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 })
  const hasMovedRef = useRef(false)

  // Current page tour
  const currentTour = PAGE_INTERACTIVE_TOURS[location.pathname] || PAGE_INTERACTIVE_TOURS['/dashboard']
  const steps = currentTour.steps
  const activeStep = steps[tourStep] || steps[0]

  // Respond to global custom events
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
      setIsTourActive(true)
      setIsDismissed(false)
    }
  }, [forceOpen])

  // Reset tour step when route changes
  useEffect(() => {
    setTourStep(0)
  }, [location.pathname])

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 110),
      }))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Draggable logic for Chacha avatar
  const handleMouseDown = (e) => {
    setIsDragging(true)
    hasMovedRef.current = false
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return
      const dx = e.clientX - dragStartRef.current.mouseX
      const dy = e.clientY - dragStartRef.current.mouseY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true
      }
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.posX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 90, dragStartRef.current.posY + dy)),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Labels across 4 languages
  const labels = {
    en: { name: 'Kisan Chacha (AI Guide)', next: 'Next Step', prev: 'Back', close: 'Close Tour', startTour: 'Take Interactive Tour', hint: 'Interactive Action' },
    hi: { name: 'किसान चाचा (मार्गदर्शक)', next: 'अगला चरण', prev: 'पीछे', close: 'टूर बंद करें', startTour: 'इंटरएक्टिव टूर लें', hint: 'कार्रवाई सुझाव' },
    mr: { name: 'किसान काका (AI मार्गदर्शक)', next: 'पुढील पायरी', prev: 'मागे', close: 'टूर बंद करा', startTour: 'टूर सुरू करा', hint: 'कृती सूचना' },
    or: { name: 'କିସାନ କକା (ମାର୍ଗଦର୍ଶକ)', next: 'ପରବର୍ତ୍ତୀ', prev: 'ପଛକୁ', close: 'ଟୁର ବନ୍ଦ', startTour: 'ଇଣ୍ଟରାକ୍ଟିଭ ଟୁର ନିଅନ୍ତୁ', hint: 'ପଦକ୍ଷେପ ସୂଚନା' },
  }
  const l = labels[language] || labels.en

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 left-4 z-40 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
        title="Reopen Kisan Chacha Tour Guide"
      >
        <span>🌾</span>
        <span>Kisan Chacha Guide</span>
      </button>
    )
  }

  return (
    <>
      {/* ── Draggable Floating Chacha Mascot on Left ── */}
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-50 select-none touch-none"
      >
        <div className="relative group">
          {/* Animated Avatar Circle */}
          <div
            onMouseDown={handleMouseDown}
            onClick={() => {
              if (!hasMovedRef.current) {
                setIsOpen(!isOpen)
                setIsTourActive(true)
              }
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all border-4 ${
              isOpen
                ? 'border-amber-400 bg-amber-600 scale-105 ring-4 ring-amber-400/30'
                : 'border-white dark:border-gray-800 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/30 hover:scale-110 active:scale-95'
            }`}
            title="Kisan Chacha — Interactive Page Guide (Drag anywhere on page!)"
          >
            {/* Animated Indian Farmer Emoji/Icon */}
            <span className="text-3xl select-none filter drop-shadow">👨‍🌾</span>
          </div>

          {/* Dedicated Cancel / Dismiss Button (Cross on top-right of Chacha) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsDismissed(true)
              setIsOpen(false)
              if (forceClose) forceClose()
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs shadow-md transition-colors"
            title="Dismiss Kisan Chacha from screen"
          >
            ✕
          </button>

          {/* Drag me indicator */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap pointer-events-none">
            ⠿ Drag me
          </div>
        </div>
      </div>

      {/* ── Interactive Tour Dialogue Box (Clean, Solid, No overlapping) ── */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 sm:left-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border-2 border-amber-400 dark:border-amber-500 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between shadow">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🌾</span>
              <div>
                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>{l.name}</span>
                </h3>
                <span className="text-[10px] text-amber-100 font-medium">
                  {currentTour.title[language] || currentTour.title.en} · Step {tourStep + 1} of {steps.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false)
                if (forceClose) forceClose()
              }}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <X size={17} />
            </button>
          </div>

          {/* Step Content */}
          <div className="p-5 space-y-3.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                {activeStep.title[language] || activeStep.title.en}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                {activeStep.desc[language] || activeStep.desc.en}
              </p>
            </div>

            {/* Action Hint / How to change value */}
            {activeStep.actionHint && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Sparkles size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{activeStep.actionHint[language] || activeStep.actionHint.en}</span>
              </div>
            )}
          </div>

          {/* Footer Controls (Prev, Next, Close) */}
          <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button
              onClick={() => {
                setIsOpen(false)
                if (forceClose) forceClose()
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {l.close}
            </button>

            <div className="flex items-center gap-2">
              {tourStep > 0 && (
                <button
                  onClick={() => setTourStep(tourStep - 1)}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {l.prev}
                </button>
              )}

              {tourStep < steps.length - 1 ? (
                <button
                  onClick={() => setTourStep(tourStep + 1)}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow flex items-center gap-1"
                >
                  <span>{l.next}</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    if (forceClose) forceClose()
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1"
                >
                  <CheckCircle2 size={14} />
                  <span>Finish Tour</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
