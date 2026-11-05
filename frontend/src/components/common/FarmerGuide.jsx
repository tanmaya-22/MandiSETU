import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  X, FolderLock, Sparkles, ChevronRight, ChevronLeft, ShieldCheck,
  TrendingUp, Calculator, Scale, Award, MapPin, CheckCircle2,
  FileText, Zap, Compass, HelpCircle, Layers, ArrowRight
} from 'lucide-react'
import { useLangStore } from '../../store/langStore'

// Comprehensive interactive walkthrough tour steps for every module
const MODULE_TOURS = {
  '/dashboard': {
    moduleCode: 'M01',
    icon: '📊',
    title: {
      en: 'Executive Telemetry & Market Intelligence',
      hi: 'डैशबोर्ड इंटेलिजेंस व बाजार डेटा',
      mr: 'डॅशबोर्ड बुद्धिमत्ता आणि बाजार डेटा',
      or: 'ଡ୍ୟାସବୋର୍ଡ ତଥ୍ୟ ଓ ବଜାର ବିଶ୍ଳେଷଣ',
    },
    steps: [
      {
        title: { en: 'Daily Mandi Clearing Scorecard', hi: 'दैनिक मंडी समाशोधन स्कोरकार्ड', mr: 'दैनिक बाजार स्कोरकार्ड', or: 'ଦୈନିକ ମଣ୍ଡି ସ୍କୋରକାର୍ଡ' },
        desc: {
          en: 'Real-time telemetry reports: Today\'s Highest Clearing APMC Rate, Active Escrow Contracts, Net Pending Payouts, and Certified AGMARK Quality Grade.',
          hi: 'लाइव टेलीमेट्री आंकड़े: आज का उच्चतम APMC भाव, सक्रिय एस्क्रो अनुबंध, कुल बकाया भुगतान और प्रमाणित AGMARK गुणवत्ता ग्रेड।',
          mr: 'थेट बाजार माहिती: आजचा कमाल बाजार भाव, सक्रिय एस्क्रो व्यवहार आणि प्रमाणित गुणवत्ता.',
          or: 'ପ୍ଲାଟଫର୍ମ ତଥ୍ୟ: ଆଜିର ସର୍ବୋଚ୍ଚ ମଣ୍ଡି ଦର, ସକ୍ରିୟ ଏସ୍କ୍ରୋ ଚୁକ୍ତି ଏବଂ ମାନକ ଗ୍ରେଡ୍।'
        },
      },
      {
        title: { en: 'MSP Benchmark Verification', hi: 'सरकारी MSP बेंचमार्क सत्यापन', mr: 'सरकारी हमीभाव पडताळणी', or: 'ସରକାରୀ MSP ପରୀକ୍ଷଣ' },
        desc: {
          en: 'Every commodity modal rate is tested against the Central MSP baseline. Green badges indicate profitable trading above MSP, safeguarding farmers from exploitation.',
          hi: 'प्रत्येक फसल का भाव सरकारी MSP से जांचा जाता है। हरा बैज दर्शाता है कि भाव MSP से अधिक है, जिससे किसानों का शोषण रुकता है।',
          mr: 'प्रत्येक पिकाचा भाव हमीभावाशी तपासला जातो. हिरवा रंग हमीभावापेक्षा जास्त नफा दर्शवतो.',
          or: 'ପ୍ରତିଟି ଫସଲ ଦର ସରକାରୀ MSP ସହ ଯାଞ୍ଚ ହୁଏ। ସବୁଜ ରଙ୍ଗ ଲାଭଜନକ ବେପାର ଦର୍ଶାଏ।'
        },
      },
      {
        title: { en: 'Spot Terminal Disparity Index', hi: 'मंडी भाव तुलना व सूचकांक', mr: 'बाजार भाव तुलना आणि निर्देशांक', or: 'ମଣ୍ଡି ଦର ତୁଳନା' },
        desc: {
          en: 'Compare modal rates across nearby mandis in real time to capture spatial arbitrage before booking transportation.',
          hi: 'परिवहन बुक करने से पहले विभिन्न मंडियों के भावों की तुलना करके अधिकतम मुनाफा सुरक्षित करें।',
          mr: 'वाहतूक ठरवण्यापूर्वी शेजारील मंड्यांमधील भावांची तुलना करा.',
          or: 'ଗାଡ଼ି ବୁକିଂ ପୂର୍ବରୁ ବିଭିନ୍ନ ମଣ୍ଡିର ଦର ତୁଳନା କରି ସର୍ବାଧିକ ଲାଭ ପାଆନ୍ତୁ।'
        },
      },
    ],
  },

  '/prices': {
    moduleCode: 'M02',
    icon: '📈',
    title: {
      en: 'AGMARKNET Price Discovery Engine',
      hi: 'एगमार्कनेट मूल्य खोज इंजन',
      mr: 'एगमार्कनेट भाव शोध इंजिन',
      or: 'ଏଗମାର୍କନେଟ ଦର ଅନୁସନ୍ଧାନ ଇଞ୍ଜିନ',
    },
    steps: [
      {
        title: { en: 'Live Terminal Filtering & Querying', hi: 'लाइव मंडी सर्च व स्टेट फ़िल्टर', mr: 'थेट बाजार शोध आणि राज्य फिल्टर', or: 'ଲାଇଭ ମଣ୍ଡି ଖୋଜ ଓ ଫିଲ୍ଟର' },
        desc: {
          en: 'Search through 500+ APMC mandis across India by commodity name or location. Filter by State to view terminal-specific prices.',
          hi: 'देश भर की 500+ APMC मंडियों में से फसल या स्थान के अनुसार खोजें। अपने राज्य की विशिष्ट मंडियां देखें।',
          mr: 'भारतातील 500+ मंड्यांमधून पिकाच्या नावाने किंवा स्थानानुसार शोधा.',
          or: 'ଦେଶର 500+ ମଣ୍ଡି ମଧ୍ୟରୁ ଫସଲ ବା ସ୍ଥାନ ଅନୁସାରେ ତଥ୍ୟ ଖୋଜନ୍ତୁ।'
        },
      },
      {
        title: { en: 'Dynamic Column Sorting Matrix', hi: 'डायनामिक कॉलम सॉर्टिंग मैट्रिक्स', mr: 'स्तंभ क्रमवारी मॅट्रिक्स', or: 'ଡାଇନାମିକ ସର୍ଟିଂ ମ୍ୟାଟ୍ରିକ୍ସ' },
        desc: {
          en: 'Click on Modal Price, Minimum Price, or Maximum Price column headers to instantly sort mandis from highest to lowest clearing rate.',
          hi: 'उच्चतम से निम्नतम दर पर मंडियों को तुरंत क्रमबद्ध करने के लिए कॉलम हेडर (मोडल, न्यूनतम, अधिकतम मूल्य) पर क्लिक करें।',
          mr: 'सर्वाधिक बाजार भाव पाहण्यासाठी कॉलम हेडरवर क्लिक करा.',
          or: 'ସର୍ବୋଚ୍ଚ ଦର ଦେଖିବାକୁ କଲମ ହେଡର ଉପରେ କ୍ଲିକ କରି ସର୍ଟ କରନ୍ତୁ।'
        },
      },
    ],
  },

  '/calculator': {
    moduleCode: 'M03',
    icon: '🧮',
    title: {
      en: 'Net Realization & Haulage Freight Engine',
      hi: 'शुद्ध आय व ढुलाई भाड़ा कैलकुलेटर',
      mr: 'निव्वळ उत्पन्न व वाहतूक खर्च गणक',
      or: 'ନିଟ ଆୟ ଓ ପରିବହନ ଭଡ଼ା କ୍ୟାଲକୁଲେଟର',
    },
    steps: [
      {
        title: { en: 'Input Consignment Parameters', hi: 'फसल मात्रा व कोटेड मूल्य दर्ज करें', mr: 'मालाचे प्रमाण व भाव प्रविष्ट करा', or: 'ଫସଲ ପରିମାଣ ଓ ଦର ପ୍ରବେଶ କରନ୍ତୁ' },
        desc: {
          en: 'Enter harvest quantity in quintals and the quoted rate. The mathematical model calculates gross value and simulates transport deductions.',
          hi: 'फसल की मात्रा (क्विंटल) और कोटेड भाव दर्ज करें। मॉडल कुल मूल्य की गणना कर परिवहन खर्च का विश्लेषण करता है।',
          mr: 'क्विंटलमध्ये प्रमाण आणि भाव टाका. मॉडेल एकूण उत्पन्न व खर्च काढते.',
          or: 'ପରିମାଣ ଓ କୋଟେଡ ଦର ପ୍ରବେଶ କରନ୍ତୁ। ଏହା ମୋଟ ମୂଲ୍ୟର ହିସାବ କରେ।'
        },
      },
      {
        title: { en: 'Unmasking Hidden Intermediary Deductions', hi: 'छुपे मंडी व बिचौलिया खर्चों का संकलन', mr: 'सर्व छुपे खर्च आणि वजावट', or: 'ସମସ୍ତ ଲୁକ୍କାୟିତ ଖର୍ଚ୍ଚର ସଂକଳନ' },
        desc: {
          en: 'Deducts APMC market cess (1-2%), commission (1.5-2.5%), weighment, loading, and distance-based diesel haulage to reveal true in-hand cash.',
          hi: 'मंडी सेस, कमीशन, तुलाई, पल्लेदारी और डीजल भाड़ा घटाकर किसान के हाथ में आने वाली असली शुद्ध रकम दिखाता है।',
          mr: 'बाजार फी, कमिशन, हमाली आणि वाहतूक खर्च वजा करून प्रत्यक्ष हातात येणारी रक्कम दाखवतो.',
          or: 'ମଣ୍ଡି ସେସ୍, କମିଶନ, ଶ୍ରମ ଓ ଡିଜେଲ ଭଡ଼ା କାଟି ହାତକୁ ଆସୁଥିବା ନିଟ ଟଙ୍କା ଦର୍ଶାଏ।'
        },
      },
    ],
  },

  '/listings': {
    moduleCode: 'M04',
    icon: '🌾',
    title: {
      en: 'Digital Produce Listings & Escrow Terms',
      hi: 'डिजिटल फसल लिस्टिंग व एस्क्रो शर्तें',
      mr: 'डिजिटल माल यादी आणि एस्क्रो अटी',
      or: 'ଡିଜିଟାଲ୍ ଫସଲ ତାଲିକା ଓ ଏସ୍କ୍ରୋ ସର୍ତ୍ତ'
    },
    steps: [
      {
        title: { en: 'Verified Producer Identity & KYC', hi: 'सत्यापित किसान प्रोफाइल व KYC', mr: 'सत्यापित शेतकरी प्रोफाइल', or: 'ପ୍ରମାଣିତ କୃଷକ ପରିଚୟ' },
        desc: {
          en: 'Every listing highlights who created it: Farmer/FPO Name, KYC Verification Badge, Farm Acreage, and Mandi Jurisdiction—never squished or hidden.',
          hi: 'प्रत्येक लिस्टिंग स्पष्ट रूप से दिखाती है कि इसे किसने बनाया: किसान का नाम, KYC सत्यापन बैज, खेत का रकबा और मंडी अधिकार क्षेत्र।',
          mr: 'प्रत्येक लॉट कोण तयार केला आहे हे स्पष्टपणे दाखवतो: शेतकऱ्याचे नाव, KYC आणि क्षेत्र.',
          or: 'ପ୍ରତିଟି ଲଟରେ କୃଷକଙ୍କ ନାମ, KYC ପ୍ରମାଣପତ୍ର ଓ ଜମି ପରିମାଣ ସ୍ପଷ୍ଟ ଭାବେ ପ୍ରଦର୍ଶିତ।'
        },
      },
      {
        title: { en: 'Mandatory Trade Conditions & Escrow SLAs', hi: 'अनिवार्य व्यापार शर्तें व एस्क्रो SLA', mr: 'अनिवार्य व्यापार अटी', or: 'ବାଧ୍ୟତାମୂଳକ ବେପାର ସର୍ତ୍ତ' },
        desc: {
          en: 'Listings include 6 strict trade conditions: 100% Escrow deposit before dispatch, APMC weighbridge slips, moisture compliance, 48h dispatch, and T+24h payout.',
          hi: 'लिस्टिंग में 6 अनिवार्य शर्तें शामिल हैं: ट्रक प्रस्थान से पहले 100% एस्क्रो जमा, मंडी तुलाई पर्ची, 48 घंटे में प्रस्थान और T+24 घंटे में भुगतान।',
          mr: 'यादीत 6 महत्त्वाच्या अटी आहेत: 100% एस्क्रो संरक्षण, वजन पावती, आणि 24 तासांत रक्कम वाटप.',
          or: 'ତାଲିକାରେ 6ଟି ବାଧ୍ୟତାମୂଳକ ସର୍ତ୍ତ ରହିଛି: 100% ଏସ୍କ୍ରୋ ଜମା, ଧର୍ମକଣ୍ଟା ରସିଦ ଓ 24 ଘଣ୍ଟା ମଧ୍ୟରେ ଅର୍ଥ ପ୍ରଦାନ।'
        },
      },
      {
        title: { en: 'Secondary Dedicated Detail Inspector', hi: 'समर्पित द्वितीयक विस्तृत पृष्ठ', mr: 'समर्पित सविस्तर पान', or: 'ସମର୍ପିତ ବିସ୍ତୃତ ପୃଷ୍ଠା' },
        desc: {
          en: 'Click "Quick Inspect" or "View Details" to open the rich secondary view with complete seller dossier, GPS coordinates, and bilateral offer ledger.',
          hi: 'किसान की पूरी जानकारी, GPS लोकेशन और खरीदार बोलियों को देखने के लिए "Quick Inspect" या "View Details" पर क्लिक करें।',
          mr: 'शेतकऱ्याची संपूर्ण माहिती आणि खरेदीदार बोली पाहण्यासाठी "View Details" वर क्लिक करा.',
          or: 'ସମ୍ପୂର୍ଣ୍ଣ ତଥ୍ୟ ଓ ଦର ପ୍ରସ୍ତାବ ଦେଖିବାକୁ "View Details" ଉପରେ କ୍ଲିକ କରନ୍ତୁ।'
        },
      },
    ],
  },

  '/transactions': {
    moduleCode: 'M06',
    icon: '🔒',
    title: {
      en: 'Milestone Escrow Vault & State Machine',
      hi: 'एस्क्रो स्मार्ट कॉन्ट्रैक्ट व 7-चरणीय स्टेट मशीन',
      mr: 'एस्क्रो स्मार्ट करार आणि 7-टप्प्यांची स्टेट मशीन',
      or: 'ଏସ୍କ୍ରୋ ସ୍ମାର୍ଟ କଣ୍ଟ୍ରାକ୍ଟ ଓ 7-ପର୍ଯ୍ୟାୟ ସ୍ଥିତି'
    },
    steps: [
      {
        title: { en: 'Multi-Signature Vault Custody', hi: 'मल्टी-सिग्नेचर एस्क्रो तिजोरी', mr: 'मल्टी-सिग्नेचर एस्क्रो सुरक्षा', or: 'ମଲ୍ଟି-ସିଗ୍ନେଚର ଏସ୍କ୍ରୋ ସୁରକ୍ଷା' },
        desc: {
          en: 'Buyer deposits 100% of purchase value into the neutral MandiSetu vault before goods leave the farmer\'s yard. Zero payment default risk.',
          hi: 'फसल रवाना होने से पहले खरीदार 100% रकम मंडीसेतु एस्क्रो तिजोरी में जमा करता है। भुगतान डूबने का शून्य जोखिम।',
          mr: 'माल निघण्यापूर्वी खरेदीदार 100% रक्कम एस्क्रो खात्यात जमा करतो. शून्य फसवणूक.',
          or: 'ଫସଲ ବାହାରିବା ପୂର୍ବରୁ କ୍ରେତା 100% ଟଙ୍କା ଏସ୍କ୍ରୋ ଭଲ୍ଟରେ ଜମା କରନ୍ତି। ଟଙ୍କା ବୁଡ଼ିବାର କୌଣସି ଭୟ ନାହିଁ।'
        },
      },
      {
        title: { en: '7-Stage Milestone Progression', hi: '7-चरणीय अनुबंध प्रगति चक्र', mr: '7-टप्प्यांची व्यवहार प्रगती', or: '7-ପର୍ଯ୍ୟାୟ ଅଗ୍ରଗତି ଚକ୍ର' },
        desc: {
          en: 'Track status in real time: Contract Initialized → Payment Received → Consignment Dispatched → In Transit → Delivered → Verified → Settled.',
          hi: 'अनुबंध से लेकर अंतिम बैंक ट्रांसफर तक 7 चरणों में हर कदम को लाइव ट्रैक करें।',
          mr: 'अनुबंधापासून अंतिम बँक हस्तांतरणापर्यंत प्रत्येक टप्पा थेट ट्रॅक करा.',
          or: 'ଚୁକ୍ତିରୁ ଆରମ୍ଭ କରି ବ୍ୟାଙ୍କ ଖାତାକୁ ଟଙ୍କା ଯିବା ଯାଏଁ ସମସ୍ତ ପଦକ୍ଷେପ ଟ୍ରାକ କରନ୍ତୁ।'
        },
      },
    ],
  },

  '/grading': {
    moduleCode: 'M10',
    icon: '🔬',
    title: {
      en: 'Computer Vision Produce Quality Grading',
      hi: 'कंप्यूटर विज़न फसल गुणवत्ता ग्रेडिंग',
      mr: 'कॉम्प्युटर व्हिजन पीक गुणवत्ता प्रतवारी',
      or: 'କମ୍ପ୍ୟୁଟର ଭିଜନ ଗୁଣବତ୍ତା ନିର୍ଣ୍ଣୟ'
    },
    steps: [
      {
        title: { en: 'Multi-Spectral Colorimetric Analysis', hi: 'मल्टी-स्पेक्ट्रल रंग व सतह विश्लेषण', mr: 'रंग आणि पृष्ठभाग तपासणी', or: 'ରଙ୍ଗ ଓ ଆକାର ବିଶ୍ଳେଷଣ' },
        desc: {
          en: 'Upload harvest photos to scan diameter uniformity, surface blemish index, and moisture compliance according to AGMARK specifications.',
          hi: 'फसल की फोटो अपलोड करें। एआई मॉडल आकार, नमी और दाग-धब्बों की जांच करके सटीक ग्रेड देता है।',
          mr: 'पिकाचा फोटो अपलोड करा. एआय मॉडेल आकार, ओलावा व डाग तपासून प्रत ठरवते.',
          or: 'ଫସଲ ଫଟୋ ଅପଲୋଡ କରନ୍ତୁ। ଏଆଇ ମଡେଲ ଆକାର, ଆର୍ଦ୍ରତା ଓ ଦାଗ ଯାଞ୍ଚ କରିବ।'
        },
      },
      {
        title: { en: 'Verified Grade Premium Bids', hi: 'प्रमाणित ग्रेड पर प्रीमियम मूल्य', mr: 'प्रमाणित गुणवत्तेवर जास्त भाव', or: 'ପ୍ରମାଣିତ ମାନକରେ ଅଧିକ ଦର' },
        desc: {
          en: 'Lots achieving Grade A+ or A unlock up to 25% price premiums from institutional corporate buyers on the exchange.',
          hi: 'A+ या A ग्रेड प्राप्त करने वाले लॉट्स पर संस्थागत खरीदार 25% तक अधिक प्रीमियम भाव प्रदान करते हैं।',
          mr: 'A+ किंवा A ग्रेड मिळालेल्या मालाला संस्थात्मक खरेदीदार 25% जास्त दर देतात.',
          or: 'A+ କିମ୍ବା A ଗ୍ରେଡ୍ ପାଇଥିବା ଫସଲରେ ବଡ଼ ବ୍ୟବସାୟୀମାନେ 25% ଅଧିକ ଦର ଦିଅନ୍ତି।'
        },
      },
    ],
  },

  '/arbitration': {
    moduleCode: 'M09',
    icon: '⚖️',
    title: {
      en: 'APMC Digital Grievance & Arbitration Tribunal',
      hi: 'मंडी डिजिटल शिकायत व मध्यस्थता ट्रिब्यूनल',
      mr: 'तक्रार निवारण आणि मध्यस्थी लवाद',
      or: 'ମଣ୍ଡି ଅଭିଯୋଗ ଓ ମଧ୍ୟସ୍ଥତା ଟ୍ରିବ୍ୟୁନାଲ'
    },
    steps: [
      {
        title: { en: 'Statutory 24-Hour Dispute Window', hi: 'कानूनी 24 घंटे की शिकायत विंडो', mr: '24 तासांची कायदेशीर तक्रार खिडकी', or: '24 ଘଣ୍ଟାର ଆଇନଗତ ଅଭିଯୋଗ ସୁବିଧା' },
        desc: {
          en: 'Upon delivery, buyers or farmers can log quality deviations, transit spoilage, or weighment mismatches with optional document proofs.',
          hi: 'डिलीवरी के बाद 24 घंटे के भीतर गुणवत्ता में अंतर, वजन विसंगति या परिवहन क्षति पर शिकायत दर्ज कर सकते हैं।',
          mr: 'वितरणानंतर 24 तासांच्या आत मालाची गुणवत्ता किंवा वजनातील फरकावर तक्रार दाखल करू शकता.',
          or: 'ଡେଲିଭରୀ ପରେ 24 ଘଣ୍ଟା ମଧ୍ୟରେ ଗୁଣବତ୍ତା ବା ଓଜନରେ ତ୍ରୁଟି ଥିଲେ ଅଭିଯୋଗ ଦାଖଲ କରିପାରିବେ।'
        },
      },
      {
        title: { en: 'Neutral Escrow Hold & Settlement', hi: 'निष्पक्ष एस्क्रो होल्ड व त्वरित निपटारा', mr: 'निष्पक्ष एस्क्रो होल्ड व तोडगा', or: 'ନିରପେକ୍ଷ ଏସ୍କ୍ରୋ ସମାଧାନ' },
        desc: {
          en: 'Disputed escrow funds are instantly frozen in the smart vault until resolved by APMC arbitration officers with documented audit logs.',
          hi: 'विवादित एस्क्रो राशि तुरंत फ्रीज हो जाती है और APMC अधिकारियों द्वारा जांच के बाद उचित रूप से निपटाई जाती है।',
          mr: 'विवादित रक्कम त्वरित फ्रीज होते आणि लवाद अधिकाऱ्यांद्वारे योग्य निर्णय दिला जातो.',
          or: 'ବିବାଦିତ ଟଙ୍କା ତୁରନ୍ତ ଫ୍ରିଜ୍ ହୁଏ ଓ ମଣ୍ଡି ଅଧିକାରୀଙ୍କ ଦ୍ୱାରା ତୁରନ୍ତ ନ୍ୟାୟ ପ୍ରଦାନ କରାଯାଏ।'
        },
      },
    ],
  },

  '/admin': {
    moduleCode: 'ADM',
    icon: '👑',
    title: {
      en: 'TanmayA Root Governance & User Audit Ledger',
      hi: 'तन्मय रूट एडमिन व उपयोगकर्ता ऑडिट लेजर',
      mr: 'तन्मय मुख्य ॲडमिन आणि वापरकर्ता ऑडिट लेजर',
      or: 'ତନ୍ମୟ ମୁଖ୍ୟ ପ୍ରଶାସକ ଓ ଅଡିଟ୍ ଲେଜର'
    },
    steps: [
      {
        title: { en: 'Permanent Row #1 Root Anchor', hi: 'सर्वोच्च पंक्ति #1 रूट एंकर', mr: 'पहिली ओळ - मुख्य ॲडमिन', or: 'ପ୍ରଥମ ଧାଡ଼ି ମୁଖ୍ୟ ପ୍ରଶାସକ' },
        desc: {
          en: 'The TanmayA supreme root administrator account is permanently anchored at Row #1 across all user audit tables and authority grids.',
          hi: 'तन्मय सर्वोच्च रूट एडमिन खाता हमेशा सभी उपयोगकर्ता ऑडिट तालिकाओं और अधिकार सूचियों में शीर्ष पर रहता है।',
          mr: 'तन्मय मुख्य ॲडमिन खाते नेहमी सर्व वापरकर्ता ऑडिट तक्त्यांमध्ये पहिल्या स्थानावर असते.',
          or: 'ତନ୍ମୟ ମୁଖ୍ୟ ପ୍ରଶାସକ ଆକାଉଣ୍ଟ ସର୍ବଦା ତାଲିକାର ପ୍ରଥମ ସ୍ଥାନରେ ସ୍ଥିର ରହିବ।'
        },
      },
      {
        title: { en: 'Granular Multi-Line User Audit History', hi: 'विस्तृत मल्टी-लाइन यूजर ऑडिट इतिहास', mr: 'सविस्तर वापरकर्ता ऑडिट इतिहास', or: 'ବିସ୍ତୃତ ବ୍ୟବହାରକାରୀ ଅଡିଟ୍ ଇତିହାସ' },
        desc: {
          en: 'Inspect any account\'s deep lifecycle: Produce lots listed, escrow contracts executed, bids placed, disputes filed, and granted powers—in dedicated multi-line cards.',
          hi: 'किसी भी खाते की पूरी गतिविधि देखें: लिस्ट किए गए लॉट, एस्क्रो सौदे, बोलियां, विवाद और स्वीकृत अधिकार—अलग समर्पित कार्ड में।',
          mr: 'कोणत्याही खात्याचा संपूर्ण इतिहास तपासा: माल यादी, व्यवहार, बोली आणि अधिकार.',
          or: 'କୌଣସି ଆକାଉଣ୍ଟର ସମ୍ପୂର୍ଣ୍ଣ କାର୍ଯ୍ୟକଳାପ ଯାଞ୍ଚ କରନ୍ତୁ: ଫସଲ ଲଟ, ଏସ୍କ୍ରୋ ଚୁକ୍ତି, ଦର ପ୍ରସ୍ତାବ ଓ ଅଧିକାର।'
        },
      },
      {
        title: { en: 'Secondary Authority Delegation Console', hi: 'समर्पित अधिकार प्रत्यायोजन कंसोल', mr: 'अधिकार वाटप कंसोल', or: 'ଅଧିକାର ପ୍ରଦାନ କନସୋଲ' },
        desc: {
          en: 'Grant or revoke financial, marketplace, and dispute powers with mandatory audit reasons and security risk classification.',
          hi: 'सुरक्षा जोखिम मूल्यांकन और अनिवार्य कारण के साथ वित्तीय व बाजार संचालन अधिकार प्रदान या निरस्त करें।',
          mr: 'सुरक्षिततेच्या निकषांसह आर्थिक आणि बाजार संचालन अधिकार प्रदान किंवा रद्द करा.',
          or: 'ସୁରକ୍ଷା ଯାଞ୍ଚ ସହ ଆର୍ଥିକ ଓ ବଜାର ପରିଚାଳନା ଅଧିକାର ପ୍ରଦାନ କିମ୍ବା ରଦ୍ଦ କରନ୍ତୁ।'
        },
      },
    ],
  },
}

export default function InteractiveTour({ isOpen: forceOpen, onClose: forceClose }) {
  const location = useLocation()
  const { language } = useLangStore()

  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasDismissedCurrentPage, setHasDismissedCurrentPage] = useState(false)

  // Listen for global trigger events from navbar / buttons
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true)
      setCurrentStep(0)
      setHasDismissedCurrentPage(false)
    }
    window.addEventListener('mandisetu_open_guide', handleOpenEvent)
    return () => window.removeEventListener('mandisetu_open_guide', handleOpenEvent)
  }, [])

  // Identify tour data for current route
  const path = location.pathname
  const matchedKey = Object.keys(MODULE_TOURS).find((k) => path === k || (k !== '/' && path.startsWith(k)))
  const tourData = MODULE_TOURS[matchedKey] || MODULE_TOURS['/dashboard']
  const steps = tourData.steps || []
  const totalSteps = steps.length
  const stepObj = steps[currentStep] || steps[0]

  // Reset step when changing routes, and auto-open if first visit to that module
  useEffect(() => {
    setCurrentStep(0)
    const storageKey = `mandisetu_tour_seen_${matchedKey || path}`
    const alreadySeen = sessionStorage.getItem(storageKey)
    if (!alreadySeen && matchedKey) {
      setIsOpen(true)
    }
  }, [location.pathname, matchedKey])

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
      setCurrentStep(0)
    }
  }, [forceOpen])

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = () => {
    setIsOpen(false)
    setHasDismissedCurrentPage(true)
    if (matchedKey) {
      sessionStorage.setItem(`mandisetu_tour_seen_${matchedKey}`, 'true')
    }
    if (forceClose) forceClose()
  }

  const handleSkip = () => {
    handleComplete()
  }

  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 100

  const getLangText = (obj, fallback = '') => {
    if (!obj) return fallback
    if (typeof obj === 'string') return obj
    return obj[language] || obj['en'] || fallback
  }

  return (
    <>
      {/* ── Persistent Floating Tour Guide Trigger Pill (Bottom-Right / Always accessible) ── */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setCurrentStep(0)
          }}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-xs font-bold"
          title="Open Interactive Guided Tour for this Module"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center text-sm">
            {tourData.icon || '🧭'}
          </div>
          <span className="hidden sm:inline text-slate-200 group-hover:text-white">
            {getLangText(tourData.title, 'Interactive Tour')}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] uppercase font-black tracking-wider">
            Tour
          </span>
        </button>
      )}

      {/* ── Exact Match Walkthrough Popover Card (Styled after User Provided Picture) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#111928] border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] p-6 sm:p-7 text-white font-sans overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close Tour"
            >
              <X size={16} />
            </button>

            {/* Header: Rounded Orange Folder Icon + Crisp Title */}
            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shrink-0 shadow-inner">
                <FolderLock size={22} className="text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-0.5">
                  {tourData.moduleCode || 'MANDISETU'} · Guided Walkthrough
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {getLangText(stepObj?.title, getLangText(tourData.title))}
                </h3>
              </div>
            </div>

            {/* Description Text (Light Slate / Clean & Readable) */}
            <p className="text-sm text-slate-300 leading-relaxed mt-4 font-normal">
              {getLangText(stepObj?.desc, 'Navigate this module using the interactive controls below.')}
            </p>

            {/* Progress Bar (Crisp Electric Blue on Dark Track) */}
            <div className="mt-6 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Controls Row: Previous | 3 of 9 | Next */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
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

              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition cursor-pointer"
              >
                {currentStep === totalSteps - 1 ? 'Finish Tour' : 'Next'}
              </button>
            </div>

            {/* Bottom Row: Skip Tour */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
              <button
                onClick={handleSkip}
                className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
              >
                Skip Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
