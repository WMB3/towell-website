import { memo, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import { generateGeminiContent } from '../utils/gemini';

const TowellAssistant = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Welcome to W.J. Towell and Co. I am the official AI assistant. Ask about our heritage, sectors, or Vision 2040 alignment.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isPending || isLoading) return;

    startTransition(() => {
      setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
      setInput('');
    });

    setIsLoading(true);
    try {
      const systemPrompt = `You are the official AI corporate assistant for W.J. Towell and Co.
Founded in 1866 in Oman by William Jack Towell.
Keep tone professional and concise.`;

      const aiText = await generateGeminiContent(systemPrompt, trimmed);
      startTransition(() => setMessages((prev) => [...prev, { role: 'ai', text: aiText }]));
    } catch {
      startTransition(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: 'I am unable to reach the knowledge service right now. Please try again later or contact info@wjtowell.com.'
          }
        ]);
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isPending, isLoading, startTransition]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-text">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--secondary)] bg-[var(--primary)] text-white shadow-xl transition hover:scale-105"
        aria-label="Toggle assistant"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-18 right-0 flex h-[500px] max-h-[75vh] w-[90vw] max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-3 border-b-4 border-[var(--secondary)] bg-[var(--primary)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-1.5">
              <img src="/towells-emblem-icon.png" alt="Towell" className="h-full w-full object-contain" />
            </div>
            <div>
              <h3 className="font-primary text-sm font-bold text-white">Ask Towell</h3>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--secondary)]">Corporate AI Assistant</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[var(--surface)] p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'rounded-tr-none bg-[var(--primary)] text-white'
                      : 'rounded-tl-none border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg rounded-tl-none border border-slate-200 bg-white p-3 text-sm text-slate-500">
                  <Bot size={14} className="animate-pulse" /> Generating response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about our history or sectors..."
                className="flex-1 rounded-lg border border-slate-300 bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--secondary)]"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || isPending || !input.trim()}
                className="rounded-lg bg-[var(--secondary)] p-2.5 text-[var(--primary)] transition disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TowellAssistant;
