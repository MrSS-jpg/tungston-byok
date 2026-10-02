import React, { useState, useRef, useEffect } from 'react';
import { Key, Send, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function FilamentMark({ active = false, size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={active ? "animate-heat" : ""}
      style={{ filter: active ? "drop-shadow(var(--shadow-glow))" : "none" }}
    >
      <rect x="3" y="3" width="34" height="34" fill={active ? "var(--color-accent)" : "var(--color-surface2)"} stroke="var(--color-line)" strokeWidth="3" />
      <text x="6" y="12" fontSize="7" fontWeight="700" fill={active ? "var(--color-line)" : "var(--color-muted)"} fontFamily="var(--font-mono), monospace">
        74
      </text>
      <text x="20" y="31" textAnchor="middle" fontSize="20" fill={active ? "var(--color-line)" : "var(--color-ink)"} fontFamily="var(--font-display), sans-serif">
        W
      </text>
    </svg>
  );
}

const PROVIDERS = {
  nara: { name: 'Nara Router', model: 'agnes-2.5-flash', url: 'https://corsproxy.io/?https://router.bynara.id/v1/chat/completions', isOpenAI: true },
  anthropic: { name: 'Claude 3.5 Sonnet', model: 'claude-3-5-sonnet-20241022', url: 'https://corsproxy.io/?https://api.anthropic.com/v1/messages', isOpenAI: false },
  openai: { name: 'GPT-4o', model: 'gpt-4o', url: 'https://api.openai.com/v1/chat/completions', isOpenAI: true },
  gemini: { name: 'Gemini 3.7 Flash', model: 'gemini-3.7-flash', url: 'https://generativelanguage.googleapis.com/v1beta/models', isOpenAI: false },
  groq: { name: 'Groq', model: 'llama-3.3-70b-versatile', url: 'https://api.groq.com/openai/v1/chat/completions', isOpenAI: true },
  nvidia: { name: 'NVIDIA NIM', model: 'meta/llama-3.1-70b-instruct', url: 'https://corsproxy.io/?https://integrate.api.nvidia.com/v1/chat/completions', isOpenAI: true },
  bytez: { name: 'Bytez', model: 'microsoft/Phi-4-mini-reasoning', url: 'https://corsproxy.io/?https://api.bytez.com/models/v2/openai/v1/chat/completions', isOpenAI: true },
  openrouter: { name: 'OpenRouter', model: 'openrouter/free', url: 'https://openrouter.ai/api/v1/chat/completions', isOpenAI: true },
  cerebras: { name: 'Cerebras', model: 'llama-3.3-70b', url: 'https://api.cerebras.ai/v1/chat/completions', isOpenAI: true },
  mistral: { name: 'Mistral', model: 'mistral-large-latest', url: 'https://api.mistral.ai/v1/chat/completions', isOpenAI: true },
  deepseek: { name: 'DeepSeek', model: 'deepseek-chat', url: 'https://api.deepseek.com/chat/completions', isOpenAI: true },
  together: { name: 'Together AI', model: 'meta-llama/Llama-3-70b-chat-hf', url: 'https://api.together.xyz/v1/chat/completions', isOpenAI: true },
  cohere: { name: 'Cohere', model: 'command-r-plus', url: 'https://corsproxy.io/?https://api.cohere.com/v1/chat', isOpenAI: false },
  perplexity: { name: 'Perplexity', model: 'sonar-reasoning', url: 'https://api.perplexity.ai/chat/completions', isOpenAI: true }
};

function detectProvider(rawKey) {
  if (!rawKey) return null;
  const key = rawKey.trim();
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('AIza') || key.startsWith('AQ.')) return 'gemini';
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('nvapi-')) return 'nvidia';
  if (key.startsWith('bytez:')) return 'bytez';
  if (key.startsWith('sk-or-v1-')) return 'openrouter';
  return null;
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tungston_key') || '');
  const [selectedProvider, setSelectedProvider] = useState(() => localStorage.getItem('tungston_provider') || 'auto');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const detected = detectProvider(apiKey);
  const activeProviderKey = selectedProvider === 'auto' ? (detected || 'nara') : selectedProvider;
  const activeProvider = apiKey ? PROVIDERS[activeProviderKey] : null;

  useEffect(() => {
    localStorage.setItem('tungston_key', apiKey.trim());
    localStorage.setItem('tungston_provider', selectedProvider);
  }, [apiKey, selectedProvider]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || !activeProvider) return;
    const userText = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      let resultText = "";
      const key = apiKey.trim();

      if (activeProvider.isOpenAI) {
        const res = await fetch(activeProvider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: activeProvider.model,
            messages: newMessages
          })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        resultText = data.choices[0].message.content;
      } else if (activeProviderKey === 'gemini') {
        const res = await fetch(`${activeProvider.url}/${activeProvider.model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: newMessages.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            }))
          })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        resultText = data.candidates[0].content.parts[0].text;
      } else if (activeProviderKey === 'anthropic') {
        const res = await fetch(activeProvider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: activeProvider.model,
            max_tokens: 4096,
            messages: newMessages.filter(m => m.role !== 'system')
          })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        resultText = data.content[0].text;
      } else if (activeProviderKey === 'cohere') {
        const res = await fetch(activeProvider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: activeProvider.model,
            message: userText,
            chat_history: messages.map(m => ({ role: m.role === 'user' ? 'USER' : 'CHATBOT', message: m.content }))
          })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        resultText = data.text;
      }

      setMessages([...newMessages, { role: 'assistant', content: resultText }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Something went wrong: \`${err.message}\`` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base)] text-[var(--color-ink)]">
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b-2 border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <FilamentMark size={32} />
            <span className="font-[var(--font-display)] text-lg uppercase leading-none tracking-tight hidden sm:inline-block">Tungston BYOK</span>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end max-w-xl">
            <div className="relative flex-1 group focus-within:shadow-[var(--shadow-glow)] transition-shadow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="w-4 h-4 text-[var(--color-muted)]" />
              </div>
              <input
                type="password"
                placeholder="Paste API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 border-2 border-[var(--color-line)] bg-[var(--color-base)] text-[var(--color-ink)] font-mono text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-0 shadow-[var(--shadow-hard-sm)] transition-shadow"
              />
            </div>
            
            <div className="relative hover:shadow-[var(--shadow-glow)] focus-within:shadow-[var(--shadow-glow)] transition-shadow">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="appearance-none border-2 border-[var(--color-line)] bg-[var(--color-base)] text-[var(--color-ink)] px-4 py-1.5 pr-10 font-mono text-sm uppercase font-bold focus:outline-none focus:border-[var(--color-accent)] cursor-pointer shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-line)] hover:text-[var(--color-accent)] transition-colors"
              >
                <option value="auto">Auto-Detect</option>
                {Object.entries(PROVIDERS).map(([k, p]) => (
                  <option key={k} value={k}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-8">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="flex max-w-sm flex-col items-center gap-4 border-2 border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-hard)]">
                <FilamentMark size={56} />
                <p className="font-[var(--font-display)] text-3xl uppercase leading-none text-[var(--color-ink)]">BYOK</p>
                <p className="text-sm font-mono text-[var(--color-muted)]">Run entirely from your browser. Paste a key above, pick your provider, and start chatting.</p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role !== "user" && (
                <div className="mt-0.5 shrink-0">
                  <FilamentMark active={false} size={30} />
                </div>
              )}

              <div className={`max-w-[80%] border-2 border-[var(--color-line)] px-4 py-2.5 shadow-[var(--shadow-hard-sm)] ${m.role === "user" ? "bg-[var(--color-accent)] text-[var(--color-line)] font-medium" : "bg-[var(--color-surface)] text-[var(--color-ink)]"}`}>
                {m.role === "user" ? (
                  <div className="text-[15px] font-mono whitespace-pre-wrap">{m.content}</div>
                ) : (
                  <div className="markdown text-[15px] leading-relaxed">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0">
                <FilamentMark active={true} size={30} />
              </div>
              <div className="min-w-0 max-w-[80%] border-2 border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 shadow-[var(--shadow-hard-sm)]">
                <span className="inline-block h-3 w-3 animate-heat bg-[var(--color-accent)]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="border-t-2 border-[var(--color-line)] bg-[var(--color-base)] px-4 pb-5 pt-4 md:px-8">
          <div className="flex items-end gap-2 border-2 border-[var(--color-line)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-hard)] focus-within:shadow-[var(--shadow-glow)] focus-within:border-[var(--color-accent)] transition-all duration-300">
            <textarea
              rows={1}
              placeholder={activeProvider ? `Chat with ${activeProvider.name}...` : "Paste a key to unlock..."}
              disabled={!activeProvider}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] font-mono focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!activeProvider || !input.trim() || loading}
              aria-label="Send message"
              className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[var(--color-line)] bg-[var(--color-accent)] text-[var(--color-line)] hover:bg-[var(--color-line)] hover:text-[var(--color-accent)] transition-colors enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] disabled:opacity-30"
            >
              <Send size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
