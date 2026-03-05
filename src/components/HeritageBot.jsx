import { useEffect, useRef, useState } from 'react';
import { Clock, Globe, MessageSquare, Send, Sparkles, X } from 'lucide-react';

const API_ENDPOINT = import.meta.env.VITE_HERITAGE_API_URL || '/api/heritage-chat';

const SUGGESTIONS = {
  en: [
    'How did William Jack Towell start in 1866?',
    'Tell me about the 1970 renaissance era',
    'What sectors does Towell operate in today?',
    'Who was Mohamed Fadhel?'
  ],
  ar: [
    'كيف بدأ ويليام جاك تاول في عام 1866؟',
    'أخبرني عن عصر النهضة في 1970',
    'ما هي القطاعات التي تعمل فيها تاول اليوم؟',
    'من كان محمد فاضل؟'
  ]
};

const INTRO_MESSAGE = {
  role: 'assistant',
  content:
    "مرحباً! Welcome to Towell Heritage Guide. I can share stories from our 160-year journey since 1866. Ask me about our founders, milestones, or legacy across Oman, UAE, and India.",
  timestamp: Date.now()
};

export default function HeritageBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INTRO_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || isTyping) return;

    const cleanText = text.trim();
    const userMsg = { role: 'user', content: cleanText, timestamp: Date.now() };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          language,
          conversationHistory: messages.slice(-6)
        })
      });

      if (!response.ok) throw new Error('Network response failed');

      const data = await response.json();
      const botMsg = {
        role: 'assistant',
        content: data.reply,
        sources: data.sources,
        relatedEvents: data.relatedEvents,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Heritage bot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            language === 'ar'
              ? 'عذراً، حدث خلل تقني. يرجى المحاولة مرة أخرى أو التواصل عبر info@wjtowell.com'
              : 'I apologize, a technical issue occurred. Please try again or contact info@wjtowell.com',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content:
          newLang === 'ar'
            ? 'تم التبديل إلى اللغة العربية. كيف يمكنني مساعدتك في معرفة تاريخ تاول؟'
            : "Switched to English. How can I help you learn about Towell's history?",
        timestamp: Date.now()
      }
    ]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1F4585] via-[#0A2342] to-[#1F4585] text-white shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Heritage Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EDAF4A]">
          <Sparkles size={12} className="animate-pulse text-white" />
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] max-h-[80vh] w-[95vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[420px]">
          <div className="flex items-center gap-3 border-b-4 border-[#EDAF4A] bg-gradient-to-r from-[#1F4585] via-[#0A2342] to-[#1F4585] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur">
              <img
                src="/towells-emblem-icon.png"
                alt="Towell Emblem"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                Heritage Guide
                <Clock size={14} className="text-[#EDAF4A]" />
              </h3>
              <p className="text-xs font-medium text-white/90">Trusted Since 1866</p>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
              aria-label="Toggle Language"
            >
              <Globe size={18} className="text-white" />
            </button>
          </div>

          {messages.filter((m) => m.role === 'user').length === 0 && (
            <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
              <p className="mb-2 text-xs font-medium text-slate-600">
                {language === 'ar' ? 'أسئلة مقترحة:' : 'Try asking:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS[language].slice(0, 2).map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="rounded-full border border-[#1F4585]/20 bg-white px-3 py-1.5 text-xs text-[#1F4585] transition-colors hover:bg-[#1F4585] hover:text-white"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-gradient-to-br from-[#1F4585] to-[#0A2342] text-white'
                      : 'rounded-bl-md border-2 border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                  >
                    {msg.content}
                  </p>

                  {msg.relatedEvents && msg.relatedEvents.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                      <p className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <Clock size={12} /> Related Timeline:
                      </p>
                      {msg.relatedEvents.map((event, eventIdx) => (
                        <div key={eventIdx} className="rounded bg-slate-50 p-2 text-xs text-slate-700">
                          <span className="font-bold text-[#1F4585]">{event.year}</span> - {event.title}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 border-t border-slate-200 pt-2">
                      <p className="text-xs text-slate-500">
                        <span className="font-medium">Sources:</span> {msg.sources.join(' - ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border-2 border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F4585]" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F4585]" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#1F4585]" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t-2 border-slate-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={language === 'ar' ? 'اسأل عن تاريخنا...' : 'Ask about our history...'}
                className="flex-1 rounded-full border-2 border-slate-300 px-4 py-3 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1F4585]"
                style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1F4585] to-[#0A2342] text-white shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">
              {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي - قد تحدث أخطاء' : 'AI-powered - May occasionally err'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
