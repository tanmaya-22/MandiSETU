import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import {
  X, Sparkles, ChevronRight, ChevronLeft, Target,
  Play, CheckCircle2, ArrowRight, Lightbulb, Compass
} from 'lucide-react'
import { useLangStore } from '../../store/langStore'

// Comprehensive placement drive compiler-style interactive walkthroughs for every module
const MODULE_TOURS = {
  '/dashboard': {
    moduleName: { en: 'Module 01: Dashboard Intelligence', hi: 'मॉड्यूल 01: डैशबोर्ड बुद्धिमत्ता', mr: 'मॉड्यूल 01: डॅशबोर्ड', or: 'ମଡ୍ୟୁଲ୍ 01: ଡ୍ୟାସବୋର୍ଡ' },
    steps: [
      {
        badge: 'Step 1: Metric KPI Indicators',
        title: { en: 'Live Platform Overview', hi: 'प्लेटफॉर्म का दैनिक अवलोकन', mr: 'दैनिक डॅशबोर्ड आढावा', or: 'ଦୈନିକ ପ୍ଲାଟଫର୍ମ ଅବଲୋକନ' },
        desc: {
          en: 'Just like test case scorecards in a coding platform, these 4 metric cards report: Today\'s Highest Clearing APMC Rate, Verified Active Escrows, Pending Payouts, and Certified AGMARK Quality Grade.',
          hi: 'जैसे कोडिंग टेस्ट में स्कोरकार्ड होता है, ये 4 कार्ड दिखाते हैं: आज का सर्वश्रेष्ठ APMC भाव, सक्रिय एस्क्रो अनुबंध, बकाया भुगतान और प्रमाणित गुणवत्ता ग्रेड।',
          mr: 'जसे कोडिंग चाचणीत स्कोअरकार्ड असते, तसे हे 4 कार्ड आजचा सर्वोत्तम भाव आणि चालू व्यवहार दर्शवतात.',
          or: 'କୋଡିଂ ଟେଷ୍ଟ କାର୍ଡ ଭଳି, ଏହି 4ଟି କାର୍ଡ ଆଜିର ସର୍ବୋତ୍ତମ ଦର ଓ ସକ୍ରିୟ ଚୁକ୍ତି ଦର୍ଶାଏ।'
        },
        action: {
          en: '👉 Hover over any card to inspect live telemetry and sub-market variance.',
          hi: '👉 विस्तृत डेटा देखने के लिए किसी भी कार्ड पर कर्सर ले जाएँ।',
          mr: '👉 तपशील पाहण्यासाठी कोणत्याही कार्डवर कर्सर न्या.',
          or: '👉 ସବିଶେଷ ତଥ୍ୟ ପାଇଁ କାର୍ଡ ଉପରେ କର୍ସର ରଖନ୍ତୁ।'
        }
      },
      {
        badge: 'Step 2: Real-time Benchmark Comparison',
        title: { en: 'MSP Verification Test Case', hi: 'MSP सरकारी बेंचमार्क टेस्ट केस', mr: 'MSP सरकारी हमीभाव पडताळणी', or: 'MSP ସରକାରୀ ଦର ପରୀକ୍ଷା' },
        desc: {
          en: 'Every commodity price is tested against the Central Govt MSP benchmark. Green badges signify "Test Passed" (Trading above MSP), while red indicates "Warning: Below MSP".',
          hi: 'प्रत्येक फसल की कीमत सरकारी MSP से जांची जाती है। हरा बैज यानी भाव MSP से अधिक (टेस्ट पास), लाल यानी भाव कम है।',
          mr: 'प्रत्येक भाव सरकारी हमीभावाशी तपासला जातो. हिरवा रंग म्हणजे भाव हमीभावापेक्षा जास्त आहे.',
          or: 'ପ୍ରତିଟି ଫସଲ ଦର ସରକାରୀ MSP ସହ ତୁଳନା କରାଯାଏ। ସବୁଜ ମାନେ MSP ଠାରୁ ଅଧିକ।'
        },
        action: {
          en: '👉 Check the Market Snapshot table to compare spot rates across mandis.',
          hi: '👉 विभिन्न मंडियों के भावों की तुलना के लिए मार्केट स्नैपशॉट तालिका देखें।',
          mr: '👉 विविध मंडयांमधील भावांची तुलना करण्यासाठी मार्केट स्नॅपशॉट तक्ता पहा.',
          or: '👉 ମଣ୍ଡି ମଧ୍ୟରେ ଦର ତୁଳନା କରିବାକୁ ମାର୍କେଟ ସ୍ନାପସଟ ଟେବୁଲ ଦେଖନ୍ତୁ।'
        }
      }
    ]
  },

  '/prices': {
    moduleName: { en: 'Module 02: Price Discovery & Sort Engine', hi: 'मॉड्यूल 02: मंडी भाव व सॉर्ट इंजन', mr: 'मॉड्यूल 02: मंडी भाव शोध', or: 'ମଡ୍ୟୁଲ୍ 02: ମଣ୍ଡି ଦର ଖୋଜ' },
    steps: [
      {
        badge: 'Step 1: Input Search & State Filtering',
        title: { en: 'Filtering Agmarknet Datasets', hi: 'एगमार्कनेट डेटासेट को फ़िल्टर करना', mr: 'डेटा फिल्टर करणे', or: 'ତଥ୍ୟ ଫିଲ୍ଟର କରିବା' },
        desc: {
          en: 'Here you filter through 500+ mandis. Type any commodity (e.g. "Wheat", "Onion") or APMC market name in the search bar to isolate targeted rows.',
          hi: 'यहाँ आप 500 से अधिक मंडियों को फ़िल्टर कर सकते हैं। सर्च बॉक्स में फसल या मंडी का नाम लिखें।',
          mr: 'येथे 500+ मंड्या फिल्टर करता येतात. सर्च बॉक्समध्ये पिकाचे नाव टाका.',
          or: 'ଏଠାରେ 500+ ମଣ୍ଡି ଫିଲ୍ଟର କରିହେବ। ସର୍ଚ୍ଚ ବକ୍ସରେ ଫସଲର ନାମ ଲେଖନ୍ତୁ।'
        },
        action: {
          en: '👉 Click the State dropdown to view only your state\'s active APMC terminals.',
          hi: '👉 केवल अपने राज्य की मंडियों को देखने के लिए राज्य ड्रॉपडाउन चुनें।',
          mr: '👉 आपल्या राज्यातील मंड्या पाहण्यासाठी राज्य निवडा.',
          or: '👉 ନିଜ ରାଜ୍ୟର ମଣ୍ଡି ଦେଖିବାକୁ ଡ୍ରପଡାଉନ ବାଛନ୍ତୁ।'
        }
      },
      {
        badge: 'Step 2: Sorting Column Keys',
        title: { en: 'Sort Columns Like a Test Case Compiler', hi: 'कॉलम हेडर पर क्लिक करके सॉर्ट करें', mr: 'स्तंभ हेडरवर क्लिक करून क्रमवारी लावा', or: 'ହେଡର କ୍ଲିକ କରି ସର୍ଟ କରନ୍ତୁ' },
        desc: {
          en: 'Click on any column header like "Modal ₹/qtl" or "Max ₹/qtl". The engine re-indexes the array instantly in ascending (↑) or descending (↓) order.',
          hi: '"Modal ₹/qtl" या "Max ₹/qtl" कॉलम हेडर पर क्लिक करें। तालिका तुरंत उच्चतम से निम्नतम दर के अनुसार सॉर्ट हो जाएगी।',
          mr: '"Modal ₹/qtl" हेडरवर क्लिक करा. सर्वाधिक दराप्रमाणे तक्ता आपोआप क्रमबद्ध होईल.',
          or: '"Modal ₹/qtl" ଉପରେ କ୍ଲିକ କରି ସର୍ବୋଚ୍ଚରୁ ସର୍ବନିମ୍ନ ଦର ସର୍ଟ କରନ୍ତୁ।'
        },
        action: {
          en: '👉 Look for the green ✓ badge next to MSP column for maximum profit.',
          hi: '👉 अधिकतम मुनाफे के लिए MSP कॉलम के बगल में हरा ✓ चिह्न देखें।',
          mr: '👉 जास्तीत जास्त नफ्यासाठी हमीभावाशेजारील हिरवा ✓ टिक तपासा.',
          or: '👉 ସର୍ବାଧିକ ଲାଭ ପାଇଁ ସବୁଜ ✓ ଚିହ୍ନ ଲକ୍ଷ୍ୟ କରନ୍ତୁ।'
        }
      }
    ]
  },

  '/calculator': {
    moduleName: { en: 'Module 03: Net Realization Calculator', hi: 'मॉड्यूल 03: शुद्ध आय कैलकुलेटर', mr: 'मॉड्यूल 03: निव्वळ उत्पन्न कॅल्क्युलेटर', or: 'ମଡ୍ୟୁଲ୍ 03: ନିଟ ଆୟ କ୍ୟାଲକୁଲେଟର' },
    steps: [
      {
        badge: 'Step 1: Set Input Parameters',
        title: { en: 'Configuring Batch Quantities & Quoted Price', hi: 'मात्रा और बोली मूल्य दर्ज करें', mr: 'प्रमाण आणि भाव टाका', or: 'ପରିମାଣ ଓ ଦର ଦର୍ଜ କରନ୍ତୁ' },
        desc: {
          en: 'Enter your Harvest Quantity (Quintals) and Quoted Mandi Price. This acts as the raw input to our economic realization pipeline.',
          hi: 'अपनी फसल की मात्रा (क्विंटल) और मंडी में मिला भाव दर्ज करें। यह आपकी कुल बिक्री की गणना करता है।',
          mr: 'आपल्या मालाचे प्रमाण (क्विंटल) आणि मंडी भाव टाका.',
          or: 'ନିଜ ଫସଲର ପରିମାଣ (କ୍ୱିଣ୍ଟାଲ) ଓ ମଣ୍ଡି ଦର ପ୍ରବେଶ କରନ୍ତୁ।'
        },
        action: {
          en: '👉 Change quantity to 100 quintals and see how gross earnings scale.',
          hi: '👉 मात्रा को 100 क्विंटल करके देखें कि कुल राजस्व कैसे बढ़ता है।',
          mr: '👉 प्रमाण 100 क्विंटल करून एकूण उत्पन्न कसे वाढते ते पहा.',
          or: '👉 ପରିମାଣ 100 କ୍ୱିଣ୍ଟାଲ କରି ମୋଟ ଆୟ ଦେଖନ୍ତୁ।'
        }
      },
      {
        badge: 'Step 2: Execution & Freight Deductions',
        title: { en: 'Compiling All Hidden Mandi Deductions', hi: 'सभी मंडी कटौतियों का संकलन', mr: 'सर्व छुपे खर्च आणि वजावट', or: 'ସମସ୍ତ କାଟତିର ଗଣନା' },
        desc: {
          en: 'The calculator deducts APMC market cess (1-2%), commission (1.5-2.5%), loading charges, transport fuel, and packaging. The large green card displays your exact take-home cash!',
          hi: 'कैलकुलेटर मंडी सेस, दलाली, तुलाई, भाड़ा और बोरी का खर्च घटाता है। बड़ा हरा कार्ड आपकी असली इन-हैंड कमाई दिखाता है!',
          mr: 'कॅल्क्युलेटर बाजार फी, कमिशन, हमाली आणि वाहतूक खर्च वजा करून खरी रक्कम दाखवतो.',
          or: 'କ୍ୟାଲକୁଲେଟର ମଣ୍ଡି ଫି, କମିଶନ, ଶ୍ରମ ଓ ଗାଡ଼ି ଭଡ଼ା କାଟି ହାତକୁ ଆସୁଥିବା ନିଟ ଟଙ୍କା ଦେଖାଏ।'
        },
        action: {
          en: '👉 Compare local mandi take-home vs distant high-rate mandi net realization.',
          hi: '👉 पास की मंडी बनाम दूर की मंडी के शुद्ध मुनाफे की तुलना करें।',
          mr: '👉 जवळची मंडी आणि लांबची मंडी यांच्या नफ्याची तुलना करून पहा.',
          or: '👉 ନିକଟ ଓ ଦୂର ମଣ୍ଡିର ନିଟ ଲାଭ ତୁଳନା କରନ୍ତୁ।'
        }
      }
    ]
  },

  '/grading': {
    moduleName: { en: 'Module 04: Computer Vision Produce Grading', hi: 'मॉड्यूल 04: एआई फसल गुणवत्ता ग्रेडिंग', mr: 'मॉड्यूल 04: एआय प्रतवारी', or: 'ମଡ୍ୟୁଲ୍ 04: ଏଆଇ ଗୁଣବତ୍ତା ନିର୍ଣ୍ଣୟ' },
    steps: [
      {
        badge: 'Step 1: Upload Photo or Enter Specs',
        title: { en: 'Feeding Computer Vision Data', hi: 'फसल की फोटो अपलोड करना', mr: 'मालाचा फोटो अपलोड करा', or: 'ଫସଲ ଫଟୋ ଅପଲୋଡ କରନ୍ତୁ' },
        desc: {
          en: 'Upload a smartphone photo of your harvest. Our model scans for diameter uniformity, moisture percentage, and surface blemishes following AGMARK benchmarks.',
          hi: 'फसल की साफ फोटो अपलोड करें। हमारा एआई मॉडल आकार, नमी और रंग की जांच कर गुणवत्ता परखता है।',
          mr: 'स्मार्टफोनवरून फोटो अपलोड करा. एआय मॉडेल आकार व रंगाची तपासणी करेल.',
          or: 'ଫସଲର ଫଟୋ ଅପଲୋଡ କରନ୍ତୁ। ଏଆଇ ମଡେଲ ଆକାର ଓ ଆର୍ଦ୍ରତା ପରୀକ୍ଷା କରିବ।'
        },
        action: {
          en: '👉 Grade A+ produce secures 15% to 25% premium bids from verified buyers.',
          hi: '👉 A+ ग्रेड मिलने पर खरीदार 15% से 25% अधिक भाव देते हैं।',
          mr: '👉 A+ ग्रेडमुळे खरेदीदार 15% ते 25% अधिक दर देतात.',
          or: '👉 A+ ଗ୍ରେଡରେ ବ୍ୟବସାୟୀମାନେ 15%ରୁ 25% ଅଧିକ ଦର ଦିଅନ୍ତି।'
        }
      }
    ]
  },

  '/mandi-map': {
    moduleName: { en: 'Module 10: OpenStreetMap Mandi Network', hi: 'मॉड्यूल 10: ओपनस्ट्रीटमैप मंडी नेटवर्क', mr: 'मॉड्यूल 10: मंडी नकाशा', or: 'ମଡ୍ୟୁଲ୍ 10: ମଣ୍ଡି ମାନଚିତ୍ର' },
    steps: [
      {
        badge: 'Step 1: Automated Location Detection',
        title: { en: 'One-Click "📍 Use My Location"', hi: '"📍 Use My Location" एक-क्लिक लोकेशन', mr: 'एका क्लिकवर आपले स्थान', or: 'ଗୋଟିଏ କ୍ଲିକରେ ନିଜ ସ୍ଥାନ' },
        desc: {
          en: 'No need to type difficult latitudes or longitudes! Click "📍 Use My Location" and the system automatically calculates road distance (in km) to all APMCs and highlights the nearest.',
          hi: 'अक्षांश या देशांतर लिखने की कोई ज़रूरत नहीं! बस "📍 Use My Location" पर क्लिक करें और सिस्टम सबसे नज़दीकी मंडी तुरंत खोज लेगा।',
          mr: 'अक्षांश किंवा रेखांश टाईप करण्याची गरज नाही! "📍 Use My Location" दाबा आणि जवळची मंडी पहा.',
          or: 'ଅକ୍ଷାଂଶ ବା ଦ୍ରାଘିମା ଲେଖିବା ଦରକାର ନାହିଁ! "📍 Use My Location" ଦବାଇ ନିକଟତମ ମଣ୍ଡି ଖୋଜନ୍ତୁ।'
        },
        action: {
          en: '👉 Click any map marker to view operating hours, facilities, and contact phone numbers.',
          hi: '👉 मंडी के समय, फोन नंबर और सुविधाएं देखने के लिए किसी भी पिन पर क्लिक करें।',
          mr: '👉 वेळ आणि फोन नंबर पाहण्यासाठी कोणत्याही पिनवर क्लिक करा.',
          or: '👉 ସମୟ ଓ ଫୋନ ନମ୍ବର ଦେଖିବାକୁ ପିନ ଉପରେ କ୍ଲିକ କରନ୍ତୁ।'
        }
      }
    ]
  },

  '/weather': {
    moduleName: { en: 'Module 11: Weather Intelligence & Satellite Alerts', hi: 'मॉड्यूल 11: मौसम उपग्रह इंटेलिजेंस', mr: 'मॉड्यूल 11: उपग्रह हवामान अंदाज', or: 'ମଡ୍ୟୁଲ୍ 11: ପାଣିପାଗ ଉପଗ୍ରହ ସୂଚନା' },
    steps: [
      {
        badge: 'Step 1: 5-Day Precision Outlook',
        title: { en: 'Rain Probability & Harvest Safety', hi: 'वर्षा संभावना और फसल कटाई सुरक्षा', mr: 'पावसाचा अंदाज आणि पीक संरक्षण', or: 'ବର୍ଷା ସମ୍ଭାବନା ଓ ଫସଲ ସୁରକ୍ଷା' },
        desc: {
          en: 'Live satellite data from OpenWeatherMap updates temperature, humidity, wind, and 5-day rain probabilities. Use this to schedule chemical spraying and transport.',
          hi: 'ओपनवेदरमैप उपग्रह से लाइव मौसम, आर्द्रता और 5 दिन की बारिश का पूर्वानुमान। कटाई और छिड़काव की योजना इसके आधार पर बनाएं।',
          mr: 'थेट उपग्रह माहितीद्वारे 5 दिवसांचा पावसाचा अंदाज मिळतो. काढणीचे नियोजन यावर करा.',
          or: 'ଓପନଓ୍ୱେଦରମ୍ୟାପ ସାଟେଲାଇଟରୁ ଲାଇଭ 5-ଦିନର ବର୍ଷା ପୂର୍ବାନୁମାନ।'
        },
        action: {
          en: '👉 Check Agricultural Advisories at bottom for specific crop protection steps.',
          hi: '👉 फसल सुरक्षा के लिए नीचे कृषि सलाह कार्ड अवश्य देखें।',
          mr: '👉 पीक संरक्षणासाठी खालील कृषी सल्ला तपासा.',
          or: '👉 ଫସଲ ସୁରକ୍ଷା ପାଇଁ କୃଷି ପରାମର୍ଶ କାର୍ଡ ଦେଖନ୍ତୁ।'
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

  // Drag and drop state: always resets to original default on page reload
  const getInitialPos = () => ({ x: 24, y: window.innerHeight - 110 })
  const [position, setPosition] = useState(getInitialPos)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 })
  const hasMovedRef = useRef(false)

  // Clear previous persisted storage so reload always returns to original position
  useEffect(() => {
    try {
      localStorage.removeItem('mandisetu_chacha_pos')
    } catch {}
  }, [])

  // Get tour for current module
  const currentTour = MODULE_TOURS[location.pathname] || MODULE_TOURS['/dashboard']
  const steps = currentTour.steps
  const activeStep = steps[tourStep] || steps[0]

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
      setIsDismissed(false)
      setTourStep(0)
    }
  }, [forceOpen, location.pathname])

  // Reset step on navigation
  useEffect(() => {
    setTourStep(0)
  }, [location.pathname])

  // Mouse drag logic
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
      const newX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.posX + dx))
      const newY = Math.max(10, Math.min(window.innerHeight - 90, dragStartRef.current.posY + dy))
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, position])

  // Localized buttons
  const labels = {
    en: { name: 'Kisan Chacha (Interactive Walkthrough)', next: 'Next Step', prev: 'Previous', close: 'Close Tour', finish: 'Complete Walkthrough' },
    hi: { name: 'किसान चाचा (इंटरएक्टिव गाइड)', next: 'अगला चरण', prev: 'पिछला चरण', close: 'टूर बंद करें', finish: 'टूर संपन्न' },
    mr: { name: 'किसान काका (मार्गदर्शक)', next: 'पुढील पायरी', prev: 'मागील', close: 'बंद करा', finish: 'मार्गदर्शन पूर्ण' },
    or: { name: 'କିସାନ କକା (ମାର୍ଗଦର୍ଶକ)', next: 'ପରବର୍ତ୍ତୀ', prev: 'ପୂର୍ବବର୍ତ୍ତୀ', close: 'ବନ୍ଦ କରନ୍ତୁ', finish: 'ଟୁର ସମାପ୍ତ' },
  }
  const l = labels[language] || labels.en

  // Calculate dynamic walkthrough box position anchored to Chacha avatar wherever dragged
  const boxWidth = typeof window !== 'undefined' ? Math.min(420, window.innerWidth - 24) : 420
  const boxHeight = 440

  let boxLeft = position.x
  if (typeof window !== 'undefined') {
    if (boxLeft + boxWidth > window.innerWidth - 16) {
      boxLeft = Math.max(12, window.innerWidth - boxWidth - 16)
    }
    if (boxLeft < 12) boxLeft = 12
  }

  let boxTop = position.y - boxHeight - 12
  if (typeof window !== 'undefined') {
    if (boxTop < 20) {
      boxTop = Math.min(window.innerHeight - boxHeight - 20, position.y + 72)
    }
  }

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 left-4 z-40 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
        title="Reopen Kisan Chacha Tour Guide"
      >
        <span>👨‍🌾</span>
        <span>Kisan Chacha Tour</span>
      </button>
    )
  }

  return (
    <>
      {/* ── Draggable Floating Chacha Avatar (Resets on reload, moveable anywhere) ── */}
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-50 select-none touch-none"
      >
        <div className="relative group">
          {/* Avatar Button */}
          <div
            onMouseDown={handleMouseDown}
            onClick={() => {
              if (!hasMovedRef.current) setIsOpen(!isOpen)
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all border-4 ${
              isOpen
                ? 'border-amber-400 bg-amber-600 scale-105 ring-4 ring-amber-400/30'
                : 'border-white dark:border-gray-800 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/30 hover:scale-110 active:scale-95'
            }`}
            title="Kisan Chacha Interactive Tour Guide (Drag & Drop anywhere!)"
          >
            <span className="text-3xl select-none filter drop-shadow">👨‍🌾</span>
          </div>

          {/* Dismiss Cross Button on Top-Right */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsDismissed(true)
              setIsOpen(false)
              if (forceClose) forceClose()
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs shadow-md transition-colors"
            title="Dismiss Kisan Chacha"
          >
            ✕
          </button>

          {/* Reset position button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setPosition(getInitialPos())
            }}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-800 text-gray-200 hover:text-white flex items-center justify-center text-[10px] shadow"
            title="Reset to original corner position"
          >
            <RotateCcw size={10} />
          </button>

          {/* Drag me hint */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap pointer-events-none">
            ⠿ Drag & Drop me
          </div>
        </div>
      </div>

      {/* ── Interactive Compiler-Style Walkthrough Box (Directly follows dragged avatar) ── */}
      {isOpen && (
        <div
          style={{ left: `${boxLeft}px`, top: `${boxTop}px` }}
          className="fixed z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border-2 border-amber-400 dark:border-amber-500 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 text-white flex items-center justify-between shadow">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👨‍🌾</span>
              <div>
                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>{l.name}</span>
                </h3>
                <span className="text-[10px] text-amber-100 font-medium">
                  {currentTour.moduleName[language] || currentTour.moduleName.en} · {tourStep + 1} / {steps.length}
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

          {/* Step Walkthrough Details (Compiler placement style) */}
          <div className="p-5 space-y-3.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            {/* Step Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Target size={12} className="text-amber-600" />
              <span>{activeStep.badge}</span>
            </div>

            <div>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-1">
                {activeStep.title[language] || activeStep.title.en}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                {activeStep.desc[language] || activeStep.desc.en}
              </p>
            </div>

            {/* Placement Drive Style Action Hint */}
            {activeStep.action && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <Lightbulb size={14} />
                  <span>How to Test & Execute:</span>
                </div>
                <p className="leading-snug pl-5 font-medium">
                  {activeStep.action[language] || activeStep.action.en}
                </p>
              </div>
            )}
          </div>

          {/* Footer Controls */}
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
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow flex items-center gap-1 hover:scale-105 transition-transform"
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
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1 hover:scale-105 transition-transform"
                >
                  <CheckCircle2 size={14} />
                  <span>{l.finish}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
