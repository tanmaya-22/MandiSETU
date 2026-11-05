import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  X, FolderLock, Sparkles, ChevronRight, ChevronLeft, ArrowRight,
  CheckCircle2, Compass, MapPin, Eye, ShieldCheck, Scale, Award,
  HelpCircle, Languages, UserCheck, TrendingUp, Calculator, CloudRain,
  LogIn, UserPlus, Layers, ExternalLink
} from 'lucide-react'
import { useLangStore } from '../../store/langStore'
import { useAuthStore } from '../../store/authStore'
import KisanChachaMascot from './KisanChachaMascot'

// ── Complete Master Tour Sequence Across Free Public Tools & Member Modules ──
const TOUR_SEQUENCE = [
  { path: '/', label: 'Platform Home & Overview', nextPath: '/prices', nextLabel: 'Live Mandi Prices' },
  { path: '/prices', label: 'Price Discovery Engine', nextPath: '/calculator', nextLabel: 'Net Calculator' },
  { path: '/calculator', label: 'Realization Calculator', nextPath: '/mandi-map', nextLabel: 'Mandi Map Network' },
  { path: '/mandi-map', label: 'Geospatial Mandi Network', nextPath: '/weather', nextLabel: 'Weather Advisory' },
  { path: '/weather', label: 'Transit Weather Risk', nextPath: '/dashboard', nextLabel: 'Member Dashboard' },
  { path: '/dashboard', label: 'Dashboard Intelligence', nextPath: '/listings', nextLabel: 'Produce Listings' },
  { path: '/listings', label: 'Produce Listings & Escrow', nextPath: '/transactions', nextLabel: 'Escrow Transactions' },
  { path: '/transactions', label: 'Escrow State Machine', nextPath: '/grading', nextLabel: 'AI Quality Grading' },
  { path: '/grading', label: 'Computer Vision Grading', nextPath: '/disputes', nextLabel: 'Dispute & Grievance Desk' },
  { path: '/disputes', label: 'Dispute & Grievance Desk', nextPath: '/', nextLabel: 'Tour Complete' },
]

const MODULE_TOURS = {
  // ── 0. Landing Page Overview ──
  '/': {
    moduleCode: 'M00',
    steps: [
      {
        targetSelector: '#tour-lang-controls, [data-tour="lang-controls"]',
        title: {
          en: 'Multilingual Access & Dark Mode',
          hi: 'बहुभाषी पहुंच व रात्रि थीम (4 भाषाएं)',
          mr: 'बहुभाषिक प्रवेश व डार्क मोड',
          or: 'ବହୁଭାଷୀ ସୁବିଧା ଓ ଡାର୍କ ମୋଡ୍',
        },
        desc: {
          en: 'MandiSetu is natively built for Indian farmers. Toggle between English, हिंदी, मराठी, and ଓଡ଼ିଆ with automatic Devanagari and Odia numeral localization.',
          hi: 'मंडीसेतु भारतीय किसानों के लिए समर्पित है। एक क्लिक में अंग्रेजी, हिंदी, मराठी और ओडिया में बदलें। सभी आंकड़े आपकी चुनी हुई भाषा में दिखेंगे।',
          mr: 'मंडीसेतू भारतीय शेतकऱ्यांसाठी समर्पित आहे. एका क्लिकवर इंग्रजी, हिंदी, मराठी आणि ओडियामध्ये बदला.',
          or: 'ମଣ୍ଡିସେତୁ ଭାରତୀୟ କୃଷକଙ୍କ ପାଇଁ ନିର୍ମିତ। ଇଂରାଜୀ, ହିନ୍ଦୀ, ମରାଠୀ ଓ ଓଡ଼ିଆ ମଧ୍ୟରେ ସହଜରେ ବଦଳାନ୍ତୁ।'
        },
        chachaBubble: 'अपनी भाषा में मंडी भाव देखें!'
      },
      {
        targetSelector: '#tour-auth-cta, [data-tour="auth-cta"]',
        title: {
          en: 'Free Preview & Member Access',
          hi: 'निशुल्क पंजीकरण व सदस्य सुविधाएं',
          mr: 'विनामूल्य नोंदणी व सदस्य प्रवेश',
          or: 'ମାଗଣା ପଞ୍ଜୀକରଣ ଓ ସଦସ୍ୟ ସୁବିଧା',
        },
        desc: {
          en: 'Public market prices, haulage calculators, and mandi maps are 100% free with no login required! Sign in or register as a Farmer, FPO, or Buyer to unlock verified trade listings, escrow vault payments, and AI grading.',
          hi: 'मंडी भाव, भाड़ा कैलकुलेटर और मंडी मैप पूरी तरह से फ्री हैं! सत्यापित फसल लिस्टिंग, सुरक्षित एस्क्रो बैंक भुगतान और एआई ग्रेडिंग के लिए किसान या खरीदार के रूप में रजिस्टर करें।',
          mr: 'बाजार भाव आणि कॅल्क्युलेटर सर्वांसाठी मोफत आहेत! एस्क्रो सुरक्षा व एआई ग्रेडिंगसाठी नोंदणी करा.',
          or: 'ମଣ୍ଡି ଦର ଓ କାଲକୁଲେଟର ସମ୍ପୂର୍ଣ୍ଣ ମାଗଣା! ଏସ୍କ୍ରୋ ପେମେଣ୍ଟ ଓ ଏଆଇ ଗ୍ରେଡିଂ ପାଇଁ ମାଗଣାରେ ଆକାଉଣ୍ଟ ଖୋଲନ୍ତୁ।'
        },
        chachaBubble: 'Free access for every farmer!'
      },
      {
        targetSelector: '#tour-live-ticker, [data-tour="live-ticker"]',
        title: {
          en: 'Real-Time Agmarknet APMC Ticker',
          hi: 'लाइव सरकारी एगमार्कनेट मंडी टिकर',
          mr: 'थेट एगमार्कनेट बाजार समिती टिकर',
          or: 'ଲାଇଭ୍ ଏଗମାର୍କନେଟ୍ ମଣ୍ଡି ଟିକର',
        },
        desc: {
          en: 'Live streaming modal rates across 500+ APMC yards in India. Highlights positive and negative price swings for wheat, onion, tomato, potato, and cotton.',
          hi: 'देश भर की 500+ मंडियों के ताजा थोक भावों का लाइव टिकर। गेहूं, प्याज, टमाटर, आलू और कपास में दैनिक उतार-चढ़ाव की सटीक जानकारी।',
          mr: 'भारतातील 500+ बाजार समित्यांमधील ताज्या भावांचा थेट टिकर.',
          or: 'ଦେଶର 500+ ମଣ୍ଡିର ଲାଇଭ୍ ହୋଲସେଲ ଦର। ଟମାଟୋ, ପିଆଜ, ଗହମର ଦୈନିକ ପରିବର୍ତ୍ତନ ଦେଖନ୍ତୁ।'
        },
        chachaBubble: '500+ मंडियों के लाइव भाव!'
      },
      {
        targetSelector: '#tour-hero-calculator, [data-tour="hero-calculator"]',
        title: {
          en: 'Live Haversine Profit Calculator',
          hi: 'शुद्ध बचत व दूरी आधारित मुनाफा कैलकुलेटर',
          mr: 'दूरी व नफा कॅल्क्युलेटर',
          or: 'ନିଟ୍ ଲାଭ ଓ ଗାଡ଼ି ଭଡ଼ା କାଲକୁଲେଟର',
        },
        desc: {
          en: 'Move the slider to see your true take-home cash after deducting diesel transport and APMC market cess. Instantly compare local village brokers vs terminal city mandis.',
          hi: 'मात्रा का स्लाइडर हिलाकर देखें कि डीजल भाड़ा और मंडी सेस कटने के बाद आपके हाथ में कितने रुपये आएंगे। गांव के दलाल बनाम बड़ी मंडी के मुनाफे की सीधी तुलना।',
          mr: 'डीझेल वाहतूक खर्च व बाजार फी वजा करून शेतकर्‍यांच्या हातात येणारा खरा नफा मोजा.',
          or: 'ଗାଡ଼ି ଭଡ଼ା ଓ ମଣ୍ଡି ସେସ୍ କଟିବା ପରେ ଆପଣଙ୍କ ହାତକୁ ଆସୁଥିବା ନିଟ୍ ଟଙ୍କା ତୁରନ୍ତ ହିସାବ କରନ୍ତୁ।'
        },
        chachaBubble: 'Calculate real take-home cash!'
      },
      {
        targetSelector: '#tour-modules-grid, [data-tour="modules-grid"]',
        title: {
          en: '12 Comprehensive Trading Modules',
          hi: '12 समग्र डिजिटल कृषि व्यापार मॉड्यूल',
          mr: '12 एकात्मिक शेती व्यापार मॉड्युल्स',
          or: '12ଟି ସମ୍ପୂର୍ଣ୍ଣ କୃଷି ବାଣିଜ୍ୟ ମଡ୍ୟୁଲ',
        },
        desc: {
          en: 'MandiSetu unifies Prophet ML price forecasts, computer vision AGMARK grading, buyer-farmer bilateral matching, and multi-signature escrow into a single unified architecture.',
          hi: 'मंडीसेतु 12 शक्तिशाली मॉड्यूल्स को एक साथ लाता है: एआई फसल ग्रेडिंग, खरीदार मैचिंग, 7-चरणीय एस्क्रो भुगतान और मध्यस्थता ट्रिब्यूनल।',
          mr: 'एआय ग्रेडिंग, खरेदीदार जुळणी आणि सुरक्षित एस्क्रो व्यवहार एकाच ठिकाणी.',
          or: 'ଏଆଇ ଗ୍ରେଡିଂ, କ୍ରେତା-ଚାଷୀ ଯୋଡ଼ି ଓ ସୁରକ୍ଷିତ ଏସ୍କ୍ରୋ ବ୍ୟବସ୍ଥା ଗୋଟିଏ ପ୍ଲାଟଫର୍ମରେ।'
        },
        chachaBubble: 'Explore all 12 modules!'
      }
    ]
  },

  // ── 1. Live Prices (Free Public Tool) ──
  '/prices': {
    moduleCode: 'M02',
    steps: [
      {
        targetSelector: 'input[placeholder*="Search by mandi name"], input[placeholder*="Search"], input[type="text"]',
        title: {
          en: 'Multi-Terminal Query Engine',
          hi: '500+ मंडियों में फसल खोजें',
          mr: 'थेट बाजार शोध आणि राज्य फिल्टर',
          or: 'ଲାଇଭ ମଣ୍ଡି ଖୋଜ ଓ ଫିଲ୍ଟର',
        },
        desc: {
          en: 'Filter over 500+ regulated APMC yards across India by commodity name, district, or variety to locate active wholesale buyers.',
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

  // ── 2. Realization Calculator (Free Public Tool) ──
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

  // ── 3. Mandi Map Network (Free Public Tool) ──
  '/mandi-map': {
    moduleCode: 'M11',
    steps: [
      {
        targetSelector: '.leaflet-container, #map, .relative.h-\\[500px\\], .relative.h-\\[600px\\]',
        title: {
          en: 'Interactive OpenStreetMap APMC Clusters',
          hi: 'देशव्यापी एपीएमसी मंडी जीआईएस नेटवर्क',
          mr: 'अखिल भारतीय बाजार समिती नकाशा',
          or: 'ସାରା ଭାରତର ଏପିଏମସି ମଣ୍ଡି ମାନଚିତ୍ର',
        },
        desc: {
          en: 'Explore pan-India regulated APMC yards with live hover telemetry preview cards showing modal price, arrivals, and distance. Click the Maximize button for full-screen view!',
          hi: 'पूरे भारत की मंडियों का नक्शा। किसी भी मंडी पर माउस ले जाकर ताजा भाव, आवक और दूरी का प्रीव्यू कार्ड देखें। फुल-स्क्रीन बटन से बड़ा नक्शा खोलें।',
          mr: 'नकाशावर माऊस नेऊन बाजार भाव, आवक आणि अंतर तपासा. फुल-स्क्रीन मोड उपलब्ध.',
          or: 'ମାନଚିତ୍ରରେ କୌଣସି ମଣ୍ଡି ଉପରେ ହୋଭର କରି ଦର ଓ ଆଗମନ ଦେଖନ୍ତୁ। ଫୁଲ-ସ୍କ୍ରିନ ମୋଡ୍ ବ୍ୟବହାର କରନ୍ତୁ।'
        },
        chachaBubble: 'Hover to see mandi telemetry!'
      }
    ]
  },

  // ── 4. Weather Advisory (Free Public Tool) ──
  '/weather': {
    moduleCode: 'M12',
    steps: [
      {
        targetSelector: '.grid, .bg-sky-50, .border-sky-200, form',
        title: {
          en: 'Transit Spoilage Weather Advisory',
          hi: 'परिवहन व मौसम जोखिम सलाहकार',
          mr: 'हवामान अंदाज व वाहतूक सल्ला',
          or: 'ପାଣିପାଗ ଓ ପରିବହନ ସତର୍କତା',
        },
        desc: {
          en: 'Hyperlocal weather risk matrix warning against unseasonal rain during transit or harvest to protect perishable produce before dispatch.',
          hi: 'फसल की तुड़ाई या वाहन रवानगी से पहले बिन मौसम बारिश और नमी की चेतावनी ताकि आपकी फसल खराब होने से बच सके।',
          mr: 'अवेळी पाऊस व आर्द्रतेपासून पिकाचे संरक्षण करण्यासाठी पूर्वसूचना.',
          or: 'ଅଦିନିଆ ବର୍ଷା ଓ ପରିବହନ ବିପଦରୁ ଫସଲକୁ ସୁରକ୍ଷିତ ରଖିବାକୁ ପାଣିପାଗ ସତର୍କତା।'
        },
        chachaBubble: 'Check weather before dispatch!'
      }
    ]
  },

  // ── 5. Member Dashboard (Protected) ──
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
        chachaBubble: 'Welcome to your Dashboard!'
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
      }
    ]
  },

  // ── 6. Produce Listings (Protected) ──
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

  // ── 7. Transactions & Escrow (Protected) ──
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

  // ── 8. AI Produce Grading (Protected) ──
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

  // ── 9. Disputes & Grievance (Protected) ──
  '/disputes': {
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
  const { isAuthenticated } = useAuthStore()

  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)
  const [placement, setPlacement] = useState({
    side: 'top', // 'top' (arrow on top), 'bottom' (arrow on bottom), 'left', 'right', 'center'
    top: 100,
    left: 100,
    arrowTop: 40,
    arrowLeft: 40,
    showMascotBeside: false,
  })

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
  const tourData = MODULE_TOURS[path] || (path.startsWith('/listings') ? MODULE_TOURS['/listings'] : MODULE_TOURS['/'])
  const steps = tourData.steps || []
  const totalSteps = steps.length
  const stepObj = steps[currentStep] || steps[0]

  // Track next route in tour sequence
  const currentTourSeq = TOUR_SEQUENCE.find(s => s.path === path) || TOUR_SEQUENCE[0]

  // ── MATHEMATICALLY BULLETPROOF VIEWPORT CLAMPING & POSITIONING ──
  useEffect(() => {
    if (!isOpen || !stepObj) return

    const updateTargetPosition = () => {
      let el = null
      if (stepObj.targetSelector) {
        const selectors = stepObj.targetSelector.split(',').map(s => s.trim())
        for (const sel of selectors) {
          try {
            const found = document.querySelector(sel)
            if (found && found.offsetParent !== null) {
              el = found
              break
            }
          } catch {}
        }
      }

      if (el) {
        // Smoothly scroll target into view center
        const initialRect = el.getBoundingClientRect()
        if (initialRect.top < 80 || initialRect.bottom > window.innerHeight - 80) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }

        const rect = el.getBoundingClientRect()
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom,
        })

        const vpW = window.innerWidth
        const vpH = window.innerHeight
        const cardW = Math.min(380, vpW - 32)
        const cardH = 320 // estimated max height of popover
        const pad = 16

        const targetMidX = (rect.left + rect.right) / 2
        const targetMidY = (rect.top + rect.bottom) / 2

        // CRITICAL CHECK: Is the target element wide?
        // (Search bars, tables, tickers, cards span wide. NEVER place to the side of wide elements!)
        const isWideTarget = rect.width > 320 || rect.width > vpW * 0.4 || rect.right > vpW - 340 || rect.left < 200

        const spaceBelow = vpH - rect.bottom - pad
        const spaceAbove = rect.top - 60 - pad
        const spaceRight = vpW - rect.right - pad
        const spaceLeft = rect.left - pad

        let side = 'top' // default: card is below target, arrow points up ('top')
        let top = 100
        let left = 100
        let showMascotBeside = false

        if (isWideTarget || (spaceRight < cardW + 20 && spaceLeft < cardW + 20)) {
          // MUST PLACE VERTICALLY (Above or Below)!
          if (spaceBelow >= cardH || spaceBelow >= spaceAbove) {
            // Place below target
            side = 'top' // Arrow is on top of card, pointing up at target
            top = rect.bottom + 14
            left = targetMidX - cardW / 2
          } else {
            // Place above target
            side = 'bottom' // Arrow is on bottom of card, pointing down at target
            top = rect.top - cardH - 14
            left = targetMidX - cardW / 2
          }
        } else {
          // Target is compact: can consider horizontal placement
          if (spaceRight >= cardW + 20) {
            side = 'left' // Arrow on left of card, pointing left at target
            left = rect.right + 14
            top = targetMidY - 80
          } else if (spaceLeft >= cardW + 20) {
            side = 'right' // Arrow on right of card, pointing right at target
            left = rect.left - cardW - 14
            top = targetMidY - 80
          } else if (spaceBelow >= cardH) {
            side = 'top'
            top = rect.bottom + 14
            left = targetMidX - cardW / 2
          } else {
            side = 'bottom'
            top = rect.top - cardH - 14
            left = targetMidX - cardW / 2
          }
        }

        // STRICT ABSOLUTE VIEWPORT CLAMPING:
        // Guarantees left + cardW <= vpW - pad (Never clipped on right!)
        // Guarantees top + cardH <= vpH - pad (Never clipped on bottom!)
        left = Math.max(pad, Math.min(vpW - cardW - pad, left))
        top = Math.max(76, Math.min(vpH - cardH - pad, top))

        // Dynamic Arrow alignment along card edge to point precisely at target
        let arrowLeft = 40
        let arrowTop = 40
        if (side === 'top' || side === 'bottom') {
          arrowLeft = Math.max(24, Math.min(cardW - 36, targetMidX - left))
        } else {
          arrowTop = Math.max(24, Math.min(cardH - 36, targetMidY - top))
        }

        // Check if there is ample room to show full Chacha beside the card
        if (vpW >= 1024 && (left >= 150 || vpW - (left + cardW) >= 150)) {
          showMascotBeside = true
        }

        setPlacement({ side, top, left, arrowTop, arrowLeft, showMascotBeside })
      } else {
        setTargetRect(null)
        const vpW = window.innerWidth
        const vpH = window.innerHeight
        const cardW = Math.min(380, vpW - 32)
        setPlacement({
          side: 'center',
          top: Math.max(80, (vpH - 340) / 2),
          left: Math.max(16, (vpW - cardW) / 2),
          arrowTop: 40,
          arrowLeft: 40,
          showMascotBeside: vpW >= 1024,
        })
      }
    }

    const timer = setTimeout(updateTargetPosition, 200)
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
      handleGoToNextPage()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleGoToNextPage = () => {
    const nextRoute = currentTourSeq.nextPath
    if (!nextRoute || nextRoute === path) {
      handleCompleteTour()
      return
    }

    // Free Public Tools to Protected Member Modules transition:
    const isProtectedTarget = ['/dashboard', '/listings', '/transactions', '/grading', '/disputes'].includes(nextRoute)
    if (isProtectedTarget && !isAuthenticated) {
      setCurrentStep(0)
      navigate('/register')
      return
    }

    setCurrentStep(0)
    navigate(nextRoute)
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

      {/* ── Main Walkthrough Card Container (100% Guaranteed On-Screen) ── */}
      <div
        className="fixed z-50 transition-all duration-300 pointer-events-auto"
        style={{
          top: placement.top,
          left: placement.left,
          width: Math.min(380, window.innerWidth - 32),
        }}
      >
        {/* Floating Mascot Beside Card (Only when ample screen room exists) */}
        {placement.showMascotBeside && (
          <div
            className="absolute -top-12 hidden lg:block pointer-events-none"
            style={{
              left: placement.left > 160 ? -110 : 'auto',
              right: placement.left > 160 ? 'auto' : -110,
            }}
          >
            <KisanChachaMascot
              size="sm"
              isPointing={true}
              pointingDirection={placement.left > 160 ? 'right' : 'left'}
              speechBubble={stepObj?.chachaBubble || 'Let me guide you!'}
            />
          </div>
        )}

        {/* ── Walkthrough Popover Card (LPULive Aesthetic, Pinned Action Footer) ── */}
        <div className="relative w-full max-h-[min(88vh,460px)] rounded-3xl bg-[#111928] border border-slate-700/85 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-5 text-white font-sans flex flex-col overflow-visible">
          
          {/* ── Directional Pointer Arrow (Triangle pointing directly at target) ── */}
          {targetRect && placement.side === 'left' && (
            <div
              className="absolute -left-3 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[12px] border-r-[#111928] drop-shadow-md"
              style={{ top: placement.arrowTop }}
            />
          )}
          {targetRect && placement.side === 'right' && (
            <div
              className="absolute -right-3 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[12px] border-l-[#111928] drop-shadow-md"
              style={{ top: placement.arrowTop }}
            />
          )}
          {targetRect && placement.side === 'top' && (
            <div
              className="absolute -top-3 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[12px] border-b-[#111928] drop-shadow-md"
              style={{ left: placement.arrowLeft }}
            />
          )}
          {targetRect && placement.side === 'bottom' && (
            <div
              className="absolute -bottom-3 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[12px] border-t-[#111928] drop-shadow-md"
              style={{ left: placement.arrowLeft }}
            />
          )}

          {/* Close 'X' Button */}
          <button
            onClick={handleCompleteTour}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss Tour"
          >
            <X size={16} />
          </button>

          {/* ── Card Header (Shrink-0): Featuring Chacha Mascot Avatar ── */}
          <div className="shrink-0 flex items-start gap-3 pr-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/35 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
              <KisanChachaMascot
                size="xs"
                isPointing={false}
                className="scale-125 translate-y-1"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-0.5 truncate">
                Kisan Chacha (बलराम जी) · {currentTourSeq.label}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                {getLangText(stepObj?.title)}
              </h3>
            </div>
          </div>

          {/* ── Scrollable Description Body (Flex-1) ── */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-2.5 pr-1">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {getLangText(stepObj?.desc)}
            </p>
          </div>

          {/* ── Electric Blue Progress Bar (Shrink-0) ── */}
          <div className="shrink-0 mt-3.5 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* ── Pinned Action Controls Bar (Shrink-0: 100% Guaranteed On-Screen) ── */}
          <div className="shrink-0 mt-3.5 pt-2.5 border-t border-slate-800/90 flex items-center justify-between gap-2.5">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
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
                <span>Next: {currentTourSeq.nextLabel}</span>
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

          {/* ── Bottom Links: Skip Tour & End Tour Here (Shrink-0) ── */}
          <div className="shrink-0 mt-2 flex items-center justify-between text-xs font-semibold text-slate-400">
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
