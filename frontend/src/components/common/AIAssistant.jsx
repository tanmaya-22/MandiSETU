import { useState } from 'react'
import { Bot, X, Send, Sparkles, HelpCircle, MessageSquare, CornerDownLeft } from 'lucide-react'
import { useLangStore } from '../../store/langStore'

// Comprehensive knowledge base with minimal, crisp answers in 4 languages
const AI_KNOWLEDGE = [
  {
    keywords: ['onion', 'lasalgaon', 'pyaj', 'kanda', 'प्याज', 'कांदा', 'ପିଆଜ'],
    en: 'Today\'s Onion modal rate at Lasalgaon APMC (Nashik) is ₹3,250/Qtl (₹32.5/kg), with arrivals of 850 tonnes.',
    hi: 'आज लासलगांव मंडी (नासिक) में प्याज का मॉडल भाव ₹3,250 प्रति क्विंटल (₹32.5 प्रति किलो) है, और आवक 850 टन रही।',
    mr: 'आज लासलगाव बाजार समितीत कांद्याचा सरासरी भाव ₹३,२५० प्रति क्विंटल (₹३२.५/किलो) आहे, आणि आवक ८५० टन झाली आहे.',
    or: 'ଆଜି ଲାସଲଗାଓଁ ମଣ୍ଡିରେ ପିଆଜର ହାରାହାରି ଦର କ୍ୱିଣ୍ଟାଲ ପିଛା ₹୩,୨୫୦ (କେଜି ପିଛା ₹୩୨.୫) ରହିଛି।',
  },
  {
    keywords: ['wheat', 'gehu', 'gahu', 'forecast', 'गेहूं', 'गहू', 'ଗହମ'],
    en: 'Wheat (Sharbati/Dara) trades at ₹2,485/Qtl in Azadpur and ₹2,375/Qtl in Khanna. The 14-day ML forecast shows a rising trend of +₹60–90/Qtl.',
    hi: 'आजादपुर में गेहूं का भाव ₹2,485/क्विंटल और खन्ना में ₹2,375 है। 14-दिवसीय एमएल पूर्वानुमान के अनुसार भाव में ₹60–90 की बढ़त की संभावना है।',
    mr: 'आझादपूरमध्ये गव्हाचा भाव ₹२,४८५ आणि खन्ना येथे ₹२,३७५ आहे. पुढील १४ दिवसांत भावात ₹६०-९० ची वाढ होण्याची शक्यता आहे.',
    or: 'ଗହମର ଦର ଆଜାଦପୁରରେ ₹୨,୪୮୫ ଏବଂ ଖାନ୍ନାରେ ₹୨,୩୭୫ ରହିଛି। ଆଗାମୀ ୧୪ ଦିନରେ ଦର ବୃଦ୍ଧି ହେବାର ସମ୍ଭାବନା ଅଛି।',
  },
  {
    keywords: ['net', 'realization', 'calculator', 'profit', 'munafa', 'nafa', 'मुनाफा', 'नफा', 'ଲାଭ'],
    en: 'Net Realization = (Mandi Price × Quantity) - (Freight Cost + APMC Cess + Storage). It tells you which mandi leaves the most cash in your pocket.',
    hi: 'शुद्ध मुनाफा = (मंडी भाव × वजन) - (वाहन भाड़ा + मंडी टैक्स + भंडारण)। यह आपको बताता है कि किस मंडी में बेचने से आपके हाथ में सबसे ज्यादा रुपये बचेंगे।',
    mr: 'निव्वळ नफा = (बाजारभाव × वजन) - (वाहतूक भाडे + सेस + साठवणूक). हे टूल सांगते कोणत्या बाजारात प्रत्यक्ष जास्त नफा मिळेल.',
    or: 'ନିଟ୍ ଲାଭ = (ମଣ୍ଡି ଦର × ପରିମାଣ) - (ଗାଡି ଭଡ଼ା + କମିଶନ + ଷ୍ଟୋରେଜ୍)। ଏହା ସର୍ବାଧିକ ଲାଭ ମିଳୁଥିବା ମଣ୍ଡି ଦର୍ଶାଏ।',
  },
  {
    keywords: ['grade', 'grading', 'photo', 'camera', 'quality', 'ग्रेडिंग', 'प्रतवारी', 'ଗ୍ରେଡିଂ'],
    en: 'Upload a clear crop photo under Module 10. Our Computer Vision AI checks color, size, and blemishes to award Grades A+, A, B, or C.',
    hi: 'मॉड्यूल 10 में फसल की फोटो अपलोड करें। हमारा एआई मॉडल रंग, आकार और दागों की जांच कर तुरंत A+, A या B ग्रेड देता है।',
    mr: 'मॉड्यूल १० मध्ये शेतमालाचा फोटो टाका. एआय रंग, आकार आणि डागांचे विश्लेषण करून तात्काळ A+, A किंवा B प्रतवारी निश्चित करते.',
    or: 'ମଡ୍ୟୁଲ୍ ୧୦ରେ ଫସଲର ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ। ଏଆଇ ମଡେଲ୍ ରଙ୍ଗ ଓ ଗୁଣ ଯାଞ୍ଚ କରି A+, A ବା B ଗ୍ରେଡ୍ ଦିଏ।',
  },
  {
    keywords: ['list', 'lot', 'sell', 'bechna', 'vikri', 'बेचना', 'विक्री', 'ବିକ୍ରୟ'],
    en: 'Go to Module 4 (Produce Listings) → Click "Create Lot". Set your quantity, minimum price, and harvest date in 30 seconds.',
    hi: 'मॉड्यूल 4 (फसल लिस्टिंग) में जाएं → "Create Lot" पर क्लिक करें। केवल 30 सेकंड में अपनी फसल का वजन और न्यूनतम भाव तय करें।',
    mr: 'मॉड्यूल ४ वर जाऊन "Create Lot" वर क्लिक करा. ३० सेकंदात शेतमालाचे वजन व अपेक्षित भाव नोंदवा.',
    or: 'ମଡ୍ୟୁଲ୍ ୪କୁ ଯାଇ "Create Lot" କ୍ଲିକ୍ କରନ୍ତୁ। ୩୦ ସେକେଣ୍ଡରେ ଆପଣଙ୍କ ଫସଲର ପରିମାଣ ଓ ମୂଲ୍ୟ ଧାର୍ଯ୍ୟ କରନ୍ତୁ।',
  },
]

export default function AIAssistant() {
  const { lang, t } = useLangStore()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: t('ai_greeting'),
    },
  ])

  const handleSend = (queryText) => {
    const q = queryText || input
    if (!q.trim()) return

    const newMsgs = [...messages, { role: 'user', text: q }]
    setMessages(newMsgs)
    setInput('')

    // Match keywords
    const lower = q.toLowerCase()
    const matched = AI_KNOWLEDGE.find((item) =>
      item.keywords.some((kw) => lower.includes(kw.toLowerCase()))
    )

    let reply = ''
    if (matched) {
      reply = matched[lang] || matched.en
    } else {
      const defaultReplies = {
        en: 'MandiSetu provides 12 modules including real-time Agmarknet prices, distance-based net realization, AI quality grading, and direct buyer matching. Which module would you like help with?',
        hi: 'मंडीसेतु में 12 मॉड्यूल हैं, जिनमें लाइव एगमार्कनेट भाव, शुद्ध मुनाफा कैलकुलेटर, एआई फसल ग्रेडिंग और सीधी बिक्री शामिल है। आप किस विषय में जानकारी चाहते हैं?',
        mr: 'मंडीसेतूवर थेट बाजारभाव, नफा कॅल्क्युलेटर, एआय प्रतवारी आणि थेट खरेदीदार असे १२ मॉड्यूल आहेत. आपल्याला कशाबद्दल मदत हवी आहे?',
        or: 'ମଣ୍ଡିସେତୁରେ ଲାଇଭ୍ ମଣ୍ଡି ଦର, ନିଟ୍ ଲାଭ କାଲକୁଲେଟର, ଏଆଇ ଗ୍ରେଡିଂ ସହ ୧୨ଟି ମଡ୍ୟୁଲ୍ ରହିଛି। ଆପଣ କେଉଁ ବିଷୟରେ ଜାଣିବାକୁ ଚାହାନ୍ତି?',
      }
      reply = defaultReplies[lang] || defaultReplies.en
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    }, 350)
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9998]">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-700 text-white rounded-full shadow-2xl hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-xs"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={17} className="animate-pulse" />
          </div>
          <span className="hidden sm:inline-block tracking-wide">{t('ai_title')}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping absolute -top-1 -right-1" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-[520px] overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-700 via-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                <Bot size={20} className="text-emerald-200" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">{t('ai_title')}</h3>
                <p className="text-[10px] text-emerald-200">{t('ai_subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-emerald-50/70 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() => handleSend(t('ai_quick_onion'))}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-emerald-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 whitespace-nowrap hover:bg-emerald-100 transition font-medium"
            >
              {t('ai_quick_onion')}
            </button>
            <button
              onClick={() => handleSend(t('ai_quick_wheat'))}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-emerald-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 whitespace-nowrap hover:bg-emerald-100 transition font-medium"
            >
              {t('ai_quick_wheat')}
            </button>
            <button
              onClick={() => handleSend(t('ai_quick_net'))}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-emerald-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 whitespace-nowrap hover:bg-emerald-100 transition font-medium"
            >
              {t('ai_quick_net')}
            </button>
            <button
              onClick={() => handleSend(t('ai_quick_grade'))}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-emerald-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 whitespace-nowrap hover:bg-emerald-100 transition font-medium"
            >
              {t('ai_quick_grade')}
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200/50 dark:border-gray-700'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai_ask_placeholder')}
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition shadow-sm disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
