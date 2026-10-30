import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, MessageCircle, Move, HelpCircle } from 'lucide-react'
import { useLangStore } from '../../store/langStore'

const KNOWLEDGE_BASE = {
  prices: {
    en: 'Real-time Agmarknet prices update automatically every 15 minutes. Wheat is trading around ₹2,485/Qtl in Azadpur, and Onion is ₹3,250/Qtl in Lasalgaon APMC. Check the Market Prices page for full live listings and 14-day forecasts.',
    hi: 'मंडी भाव हर 15 मिनट में एगमार्कनेट से लाइव अपडेट होते हैं। आज़ादपुर में गेहूं ₹2,485/क्विंटल और लासलगांव में प्याज ₹3,250/क्विंटल पर चल रहा है। विस्तृत दरों के लिए मंडी भाव पेज देखें।',
    mr: 'रिअल-टाइम एगमार्कनेट भाव दर 15 मिनिटांनी आपोआप अपडेट होतात. लासलगाव एपीएमसीमध्ये कांदा ₹3,250/क्विंटल आहे आणि आझादपूरमध्ये गहू ₹2,485/क्विंटल आहे.',
    or: 'ରିଅଲ-ଟାଇମ ଏଗମାର୍କନେଟ ଦର ପ୍ରତି 15 ମିନିଟରେ ଅପଡେଟ ହୁଏ। ଆଜାଦପୁରରେ ଗହମ ₹2,485/କ୍ୱିଣ୍ଟାଲ ଓ ଲାସଲଗାଓଁରେ ପିଆଜ ₹3,250/କ୍ୱିଣ୍ଟାଲ।'
  },
  msp: {
    en: 'Govt MSP Benchmarks for 2026: Paddy (Common) ₹2,300/Qtl, Cotton ₹7,121/Qtl, Soybean ₹4,892/Qtl, Wheat ₹2,275/Qtl. The Net Realization Calculator automatically flags whether an offer beats the official MSP.',
    hi: 'वर्ष 2026 के लिए सरकारी MSP दरें: धान ₹2,300/क्विंटल, कपास ₹7,121/क्विंटल, सोयाबीन ₹4,892/क्विंटल, गेहूं ₹2,275/क्विंटल। कैलकुलेटर स्वतः बताता है कि क्या आपको MSP से अधिक भाव मिल रहा है।',
    mr: '2026 चे सरकारी MSP दर: धान ₹2,300/क्विंटल, कापूस ₹7,121/क्विंटल, सोयाबीन ₹4,892/क्विंटल. कॅल्क्युलेटर आपोआप सांगतो की भाव MSP पेक्षा जास्त आहे का.',
    or: '2026 ସରକାରୀ MSP ଦର: ଧାନ ₹2,300/କ୍ୱିଣ୍ଟାଲ, କପା ₹7,121/କ୍ୱିଣ୍ଟାଲ, ସୋୟାବିନ ₹4,892/କ୍ୱିଣ୍ଟାଲ। କ୍ୟାଲକୁଲେଟର ଆପେ ଆପେ MSP ତୁଳନା ଦେଖାଏ।'
  },
  weather: {
    en: 'Weather intelligence is powered by live satellite data from OpenWeatherMap. Check the Weather page for 5-day rain probabilities, wind speeds, and harvest advisories.',
    hi: 'मौसम की जानकारी ओपनवेदरमैप उपग्रह से लाइव है। 5 दिनों का वर्षा पूर्वानुमान और फसल कटाई सलाह मौसम पेज पर उपलब्ध है।',
    mr: 'हवामानाची माहिती ओपनवेदरमॅप उपग्रहावरून थेट आहे. 5 दिवसांचा पावसाचा अंदाज आणि पीक सल्ला हवामान पानावर पहा.',
    or: 'ପାଣିପାଗ ତଥ୍ୟ ଓପନଓ୍ୱେଦରମ୍ୟାପ ସାଟେଲାଇଟରୁ ଲାଇଭ। 5-ଦିନର ବର୍ଷା ପୂର୍ବାନୁମାନ ଓ ଅମଳ ପରାମର୍ଶ ପାଣିପାଗ ପୃଷ୍ଠାରେ ଉପଲବ୍ଧ।'
  },
  calculator: {
    en: 'The Net-Realization Calculator subtracts transport freight, loading charges, weighing fees, and APMC cess from gross revenue so you know your exact take-home in-hand cash.',
    hi: 'शुद्ध आय कैलकुलेटर कुल बिक्री में से परिवहन, लोडिंग, तुलाई और मंडी सेस काटकर आपकी असली नकद इन-हैंड कमाई दिखाता है।',
    mr: 'निव्वळ उत्पन्न कॅल्क्युलेटर वाहतूक खर्च, हमाली, तोलाई आणि बाजार सेस वजा करून तुमच्या हातात येणारी खरी कमाई दाखवतो.',
    or: 'ନିଟ ଆୟ କ୍ୟାଲକୁଲେଟର ପରିବହନ, ଶ୍ରମ, ଓଜନ ଖର୍ଚ୍ଚ ଓ ମଣ୍ଡି ଫି କାଟି ଆପଣଙ୍କ ହାତକୁ ଆସୁଥିବା ପ୍ରକୃତ ଟଙ୍କା ଗଣନା କରେ।'
  },
  grading: {
    en: 'AI Produce Grading uses AGMARK quality guidelines (Grade A+, A, B, C) inspecting size uniformity, moisture percentage, and foreign matter. Grade A+ fetches 15-25% price premiums.',
    hi: 'एआई उपज ग्रेडिंग एगमार्क मानकों (A+, A, B, C) पर आधारित है जो दानों का आकार, नमी और सफाई जांचती है। A+ ग्रेड पर 15-25% अतिरिक्त भाव मिलता है।',
    mr: 'उत्पादन ग्रेडिंग एगमार्क मानकांवर आधारित आहे (A+, A, B, C). A+ ग्रेडला 15-25% जास्त भाव मिळतो.',
    or: 'ଏଆଇ ଉତ୍ପାଦ ଗ୍ରେଡିଂ ଏଗମାର୍କ ମାନଦଣ୍ଡ (A+, A, B, C) ଅନୁସାରେ ଆକାର, ଆର୍ଦ୍ରତା ଓ ସଫା ପରୀକ୍ଷା କରେ। A+ ଗ୍ରେଡରେ 15-25% ଅଧିକ ଦର ମିଳେ।'
  },
}

const GREETINGS = {
  en: [
    'Hello farmer friend! 🌾 I am Kisan AI Assistant. How can I help you today?',
    'Namaste! Welcome to MandiSetu. Ask me about mandi prices, weather, or calculating your profit!',
    'Hi there! Looking for the best crop prices or MSP rates today? Ask away!'
  ],
  hi: [
    'नमस्ते किसान भाई! 🌾 मैं किसान एआई सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    'राम राम भाई! मंडी भाव, मौसम, या मुनाफे की गणना के बारे में कुछ भी पूछें।',
    'प्रणाम! MandiSetu में आपका स्वागत है। बताइए, क्या जानना चाहते हैं?'
  ],
  mr: [
    'नमस्कार शेतकरी बंधू! 🌾 मी किसान AI सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?',
    'राम राम! मंडी भाव, हवामान किंवा नफा मोजण्याबद्दल काहीही विचारा!',
    'प्रणाम! MandiSetu मध्ये आपले स्वागत आहे.'
  ],
  or: [
    'ନମସ୍କାର ଚାଷୀ ଭାଇ! 🌾 ମୁଁ କିସାନ ଏଆଇ ସହାୟକ। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିବି?',
    'ଜୟ ଜଗନ୍ନାଥ! 🙏 ମଣ୍ଡି ଦର, ପାଣିପାଗ କିମ୍ବା ଲାଭ ବିଷୟରେ ପଚାରନ୍ତୁ।',
    'ପ୍ରଣାମ! MandiSetu ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ।'
  ]
}

const GREETING_TRIGGERS = [
  'hi', 'hello', 'hey', 'namaste', 'namaskar', 'ram ram', 'kem cho', 'jai jagannath',
  'good morning', 'good evening', 'kaisa hai', 'kaise ho', 'how are you', 'pranam', 'kemcho'
]

export default function AIAssistant() {
  const { language } = useLangStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  // Drag and Drop state
  const [position, setPosition] = useState({ x: window.innerWidth - 90, y: window.innerHeight - 100 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 })
  const hasMovedRef = useRef(false)

  // Handle window resizing safely
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 90),
      }))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Draggable logic for Kisan AI button
  const handleMouseDown = (e) => {
    // Only drag with left click and when clicking header or drag button
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
        x: Math.max(10, Math.min(window.innerWidth - 70, dragStartRef.current.posX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy)),
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

  // Initialize greeting when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const gList = GREETINGS[language] || GREETINGS.en
      const initial = gList[0]
      setMessages([{ role: 'ai', text: initial }])
    }
  }, [isOpen, language])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getAIResponse = (userMsg) => {
    const lower = userMsg.toLowerCase().trim()

    // 1. Check conversational greetings
    if (GREETING_TRIGGERS.some(g => lower.includes(g))) {
      const gList = GREETINGS[language] || GREETINGS.en
      return gList[Math.floor(Math.random() * gList.length)]
    }

    // 2. Check knowledge base
    if (lower.includes('price') || lower.includes('rate') || lower.includes('bhav') || lower.includes('daam') || lower.includes('mandi') || lower.includes('bazaar')) {
      return KNOWLEDGE_BASE.prices[language] || KNOWLEDGE_BASE.prices.en
    }
    if (lower.includes('msp') || lower.includes('minimum support') || lower.includes('nyuntam')) {
      return KNOWLEDGE_BASE.msp[language] || KNOWLEDGE_BASE.msp.en
    }
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('mausam') || lower.includes('barish') || lower.includes('forecast')) {
      return KNOWLEDGE_BASE.weather[language] || KNOWLEDGE_BASE.weather.en
    }
    if (lower.includes('calc') || lower.includes('take-home') || lower.includes('commission') || lower.includes('freight') || lower.includes('profit')) {
      return KNOWLEDGE_BASE.calculator[language] || KNOWLEDGE_BASE.calculator.en
    }
    if (lower.includes('grade') || lower.includes('quality') || lower.includes('agmark') || lower.includes('gunvatta')) {
      return KNOWLEDGE_BASE.grading[language] || KNOWLEDGE_BASE.grading.en
    }

    // Default Fallback
    const fallbacks = {
      en: 'I can assist you with real-time Agmarknet mandi prices, MSP benchmark comparisons, weather advisories, transport calculators, and produce quality grading. Ask me anything! 🌾',
      hi: 'मैं आपको रीयल-टाइम एगमार्कनेट मंडी भाव, MSP बेंचमार्क, मौसम सलाह, परिवहन कैलकुलेटर और उपज गुणवत्ता ग्रेडिंग में सहायता कर सकता हूँ। कुछ भी पूछें! 🌾',
      mr: 'मी आपल्याला थेट एगमार्कनेट मंडी भाव, MSP दर, हवामान सल्ला, वाहतूक कॅल्क्युलेटर आणि पीक ग्रेडिंगमध्ये मदत करू शकतो. विचारा! 🌾',
      or: 'ମୁଁ ଆପଣଙ୍କୁ ଲାଇଭ ଏଗମାର୍କନେଟ ମଣ୍ଡି ଦର, MSP ତୁଳନା, ପାଣିପାଗ, ପରିବହନ କ୍ୟାଲକୁଲେଟର ଓ ଗ୍ରେଡିଂରେ ସାହାଯ୍ୟ କରିପାରିବି। ଯାହା ଇଚ୍ଛା ପଚାରନ୍ତୁ! 🌾'
    }
    return fallbacks[language] || fallbacks.en
  }

  const handleSend = (e) => {
    e?.preventDefault()
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getAIResponse(userMsg) }])
    }, 400)
  }

  if (isDismissed) return null

  return (
    <>
      {/* ── Draggable Floating Action Button & Mascot (Positioned dynamically) ── */}
      <div
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="fixed z-50 select-none touch-none"
      >
        <div className="relative group">
          {/* Main Bot Circle Button */}
          <button
            onMouseDown={handleMouseDown}
            onClick={() => {
              // Only open if didn't drag
              if (!hasMovedRef.current) setIsOpen(!isOpen)
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 ${
              isOpen
                ? 'bg-gray-900 dark:bg-gray-800 ring-4 ring-brand-500/30'
                : 'bg-gradient-to-tr from-brand-600 via-emerald-600 to-teal-500 shadow-brand-500/40'
            }`}
            title="Kisan AI Assistant (Drag to move anywhere!)"
          >
            {isOpen ? <X size={22} /> : <Bot size={26} className="animate-pulse" />}
          </button>

          {/* Cross / Remove Button on top-right of the bot avatar */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsDismissed(true)
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs shadow-md"
            title="Hide AI Assistant (Click to remove)"
          >
            ✕
          </button>

          {/* Drag Handle Indicator Tooltip */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap pointer-events-none">
            ⠿ Drag me
          </div>
        </div>
      </div>

      {/* ── Chatbot Window (Positioned relative to bottom-right or user screen) ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>Kisan AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                </h3>
                <span className="text-[10px] text-emerald-100 font-medium">
                  Multilingual Agri Intelligence · Drag anywhere
                </span>
              </div>
            </div>

            {/* Header Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/40">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-gray-100/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() => {
                setInput('What are the latest mandi prices today?')
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap hover:border-brand-500"
            >
              🌾 Mandi Prices
            </button>
            <button
              onClick={() => {
                setInput('What is the MSP benchmark for my crops?')
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap hover:border-brand-500"
            >
              ⚖️ MSP Rates
            </button>
            <button
              onClick={() => {
                setInput('Is rain expected in the next 48 hours?')
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap hover:border-brand-500"
            >
              🌦️ Rain Forecast
            </button>
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. Namaste, wheat prices, weather)..."
              className="flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center justify-center transition-all"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
