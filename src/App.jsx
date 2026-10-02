import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

/* ───────────────────── Provider registry ───────────────────── */

const PROVIDERS = {
  nara:       { name: 'Nara Router',  code: 'NRA',  model: 'agnes-2.5-flash',               url: 'https://corsproxy.io/?https://router.bynara.id/v1/chat/completions', type: 'openai' },
  openai:     { name: 'GPT-4o',       code: 'OAI',  model: 'gpt-4o',                         url: 'https://api.openai.com/v1/chat/completions',                         type: 'openai' },
  anthropic:  { name: 'Claude',       code: 'ANT',  model: 'claude-3-5-sonnet-20241022',     url: 'https://corsproxy.io/?https://api.anthropic.com/v1/messages',        type: 'anthropic' },
  gemini:     { name: 'Gemini',       code: 'GEM',  model: 'gemini-3.7-flash',               url: 'https://generativelanguage.googleapis.com/v1beta/models',            type: 'gemini' },
  groq:       { name: 'Groq',         code: 'GRQ',  model: 'llama-3.3-70b-versatile',        url: 'https://api.groq.com/openai/v1/chat/completions',                    type: 'openai' },
  mistral:    { name: 'Mistral',      code: 'MST',  model: 'mistral-large-latest',           url: 'https://api.mistral.ai/v1/chat/completions',                         type: 'openai' },
  deepseek:   { name: 'DeepSeek',     code: 'DSK',  model: 'deepseek-chat',                  url: 'https://api.deepseek.com/chat/completions',                          type: 'openai' },
  cerebras:   { name: 'Cerebras',     code: 'CRB',  model: 'llama-3.3-70b',                  url: 'https://api.cerebras.ai/v1/chat/completions',                        type: 'openai' },
  together:   { name: 'Together AI',  code: 'TGR',  model: 'meta-llama/Llama-3-70b-chat-hf', url: 'https://api.together.xyz/v1/chat/completions',                       type: 'openai' },
  perplexity: { name: 'Perplexity',   code: 'PPX',  model: 'sonar-reasoning',                url: 'https://api.perplexity.ai/chat/completions',                         type: 'openai' },
  openrouter: { name: 'OpenRouter',   code: 'ORT',  model: 'openrouter/free',                url: 'https://openrouter.ai/api/v1/chat/completions',                      type: 'openai' },
  nvidia:     { name: 'NVIDIA NIM',   code: 'NVD',  model: 'meta/llama-3.1-70b-instruct',    url: 'https://corsproxy.io/?https://integrate.api.nvidia.com/v1/chat/completions', type: 'openai' },
  bytez:      { name: 'Bytez',        code: 'BTZ',  model: 'microsoft/Phi-4-mini-reasoning',  url: 'https://corsproxy.io/?https://api.bytez.com/models/v2/openai/v1/chat/completions', type: 'openai' },
  cohere:     { name: 'Cohere',       code: 'CHR',  model: 'command-r-plus',                 url: 'https://corsproxy.io/?https://api.cohere.com/v1/chat',               type: 'cohere' },
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

/* ───────────────────── Element Tag (W 74) ───────────────────── */

function ElemTag() {
  return (
    <div className="inline-flex items-baseline gap-2 border-[3px] border-[var(--ink)] bg-[var(--surface)] px-3 py-1.5 font-bold">
      <span className="text-xl font-bold text-[var(--concrete)]">W</span>
      <span className="text-[10px] text-[var(--tungsten-gray)]">74</span>
      <span className="text-[11px] tracking-[0.12em] text-[var(--concrete)]">BYOK</span>
    </div>
  );
}

/* ───────────────────── Pulsing Status Dot ───────────────────── */

function StatusDot({ label }) {
  return (
    <div className="flex items-center gap-2 text-xs tracking-wide">
      <span className="inline-block w-2.5 h-2.5 bg-[var(--filament)] border-2 border-[var(--ink)] rounded-full animate-pulse-dot" style={{ boxShadow: '0 0 8px var(--filament)' }} />
      <span className="font-semibold uppercase">{label}</span>
    </div>
  );
}

/* ───────────────────── Main App ───────────────────── */

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tungston_key') || '');
  const [selectedProvider, setSelectedProvider] = useState(() => localStorage.getItem('tungston_provider') || '');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const detected = detectProvider(apiKey);
  const activeKey = (selectedProvider && selectedProvider !== 'auto') ? selectedProvider : (detected || 'nara');
  const activeProvider = apiKey.trim() && activeKey ? PROVIDERS[activeKey] : null;

  useEffect(() => {
    localStorage.setItem('tungston_key', apiKey.trim());
    if (selectedProvider && selectedProvider !== 'auto') {
      localStorage.setItem('tungston_provider', selectedProvider);
    }
  }, [apiKey, selectedProvider]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ── API call logic ── */
  const handleSend = async () => {
    if (!input.trim() || !activeProvider) return;
    const userText = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      let resultText = '';
      const key = apiKey.trim();

      if (activeProvider.type === 'openai') {
        const res = await fetch(activeProvider.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({ model: activeProvider.model, messages: newMessages }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        resultText = data.choices[0].message.content;

      } else if (activeProvider.type === 'gemini') {
        const res = await fetch(`${activeProvider.url}/${activeProvider.model}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: newMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })) }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        resultText = data.candidates[0].content.parts[0].text;

      } else if (activeProvider.type === 'anthropic') {
        const res = await fetch(activeProvider.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: activeProvider.model, max_tokens: 4096, messages: newMessages.filter(m => m.role !== 'system') }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        resultText = data.content[0].text;

      } else if (activeProvider.type === 'cohere') {
        const res = await fetch(activeProvider.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({ model: activeProvider.model, message: userText, chat_history: messages.map(m => ({ role: m.role === 'user' ? 'USER' : 'CHATBOT', message: m.content })) }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        resultText = data.text;
      }

      setMessages([...newMessages, { role: 'assistant', content: resultText }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `**ERROR:** \`${err.message}\`` }]);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────── Render ───────────────────── */
  return (
    <div className="flex flex-col h-screen bg-[var(--base)] text-[var(--concrete)] relative">
      <div className="grain" />

      {/* ── Topbar ── */}
      <header className="flex items-center justify-between px-4 py-4 md:px-6 border-b-[3px] border-[var(--ink)] shrink-0 flex-wrap gap-3">
        <ElemTag />
        <div className="flex items-center gap-4">
          {activeProvider && <StatusDot label={`${activeProvider.name} connected`} />}
          {!activeProvider && apiKey.trim() && <span className="text-xs text-[var(--tungsten-gray)] uppercase tracking-wide">Select a provider ↓</span>}
        </div>
      </header>

      {/* ── Key Input Bar ── */}
      <div className="border-b-[3px] border-[var(--ink)] px-4 py-3 md:px-6 bg-[var(--surface)] flex items-center gap-3 flex-wrap shrink-0">
        <span className="text-[10px] font-bold text-[var(--tungsten-gray)] tracking-[0.1em] uppercase shrink-0">API KEY</span>
        <input
          type="password"
          placeholder="Paste any API key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1 min-w-[200px] bg-[var(--base)] border-[3px] border-[var(--ink)] px-4 py-2 font-mono text-sm text-[var(--concrete)] placeholder:text-[var(--tungsten-gray)] focus:border-[var(--filament)] focus:shadow-[var(--shadow-glow)] transition-all"
        />
        <button
          onClick={() => setShowProviders(!showProviders)}
          className="border-[3px] border-[var(--ink)] bg-[var(--filament)] text-[var(--ink)] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider hover:shadow-[var(--shadow-glow)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
          style={{ boxShadow: '3px 3px 0 var(--ink)' }}
        >
          {showProviders ? '▲ HIDE' : '▼ PROVIDERS'}
        </button>
      </div>

      {/* ── Provider Selector Grid ── */}
      {showProviders && (
        <div className="border-b-[3px] border-[var(--ink)] bg-[var(--surface2)] px-4 py-4 md:px-6 shrink-0">
          <p className="text-[10px] font-bold text-[var(--tungsten-gray)] tracking-[0.1em] uppercase mb-3">SELECT PROVIDER — {Object.keys(PROVIDERS).length} AVAILABLE</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-0">
            {Object.entries(PROVIDERS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => { setSelectedProvider(key); setShowProviders(false); inputRef.current?.focus(); }}
                className={`provider-card text-left ${activeKey === key ? 'active' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold tracking-[0.08em] text-[var(--tungsten-gray)]">{p.code}</span>
                  {activeKey === key && <span className="inline-block w-2 h-2 bg-[var(--filament)] border border-[var(--ink)]" style={{ boxShadow: '0 0 6px var(--filament)' }} />}
                </div>
                <span className="text-xs font-bold uppercase leading-tight block">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Chat Area ── */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-2xl text-center">
              <h1
                className="relative w-fit mx-auto"
                style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 'clamp(3rem, 12vw, 8.5rem)', lineHeight: 0.9, letterSpacing: '-0.02em', margin: '0 auto 20px' }}
              >
                BYOK
                <span
                  className="absolute inset-0 text-transparent animate-flicker pointer-events-none"
                  style={{ WebkitTextStroke: '1px var(--filament)', transform: 'translate(6px, 6px)', zIndex: -1 }}
                  aria-hidden="true"
                >BYOK</span>
              </h1>

              <p className="mx-auto" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 'clamp(0.95rem,2vw,1.15rem)', fontWeight: 500, maxWidth: '42ch', margin: '0 auto 6px' }}>
                bring your own key. run it straight through — no middleman, no markup.
              </p>
              <p className="mx-auto" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: 'var(--tungsten-gray)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 auto 32px' }}>
                {Object.keys(PROVIDERS).length} providers. zero data stored. 100% your browser.
              </p>

              <div className="border-[3px] border-[var(--ink)] max-w-sm mx-auto text-left bg-[var(--surface)]">
                {[
                  ['MATERIAL', 'RAW API ACCESS'],
                  ['PROVIDERS', `${Object.keys(PROVIDERS).length} SUPPORTED`],
                  ['EXECUTION', 'CLIENT-SIDE ONLY'],
                  ['DATA STORED', 'NOTHING — ZERO'],
                ].map(([label, value], i, arr) => (
                  <div key={label} className={`flex justify-between px-5 py-3 text-xs tracking-[0.04em] font-mono ${i < arr.length - 1 ? 'border-b border-[var(--tungsten-gray)]' : ''}`}>
                    <span className="text-[var(--tungsten-gray)] font-semibold">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role !== 'user' && (
              <div className="shrink-0 mt-0.5 w-9 h-9 border-[3px] border-[var(--ink)] bg-[var(--surface2)] flex items-center justify-center text-[var(--filament)] font-bold text-xs" style={{ boxShadow: '3px 3px 0 var(--ink)' }}>
                {activeProvider?.code?.charAt(0) || 'W'}
              </div>
            )}
            <div className={`max-w-[80%] border-[3px] border-[var(--ink)] px-4 py-3 ${m.role === 'user'
              ? 'bg-[var(--filament)] text-[var(--ink)]'
              : 'bg-[var(--surface)]'
            }`} style={{ boxShadow: '4px 4px 0 var(--ink)' }}>
              {m.role === 'user' ? (
                <div className="font-mono text-sm font-medium whitespace-pre-wrap">{m.content}</div>
              ) : (
                <div className="markdown font-mono text-sm leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4">
            <div className="shrink-0 w-9 h-9 border-[3px] border-[var(--ink)] bg-[var(--surface2)] flex items-center justify-center animate-heat" style={{ boxShadow: '0 0 12px var(--filament)' }}>
              <span className="text-[var(--filament)] font-bold text-xs">{activeProvider?.code?.charAt(0) || 'W'}</span>
            </div>
            <div className="border-[3px] border-[var(--ink)] bg-[var(--surface)] px-4 py-3 flex items-center gap-2" style={{ boxShadow: '4px 4px 0 var(--ink)' }}>
              <span className="w-2 h-2 bg-[var(--filament)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[var(--filament)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[var(--filament)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-20" />
      </main>

      {/* ── Composer ── */}
      <footer className="border-t-[3px] border-[var(--ink)] bg-[var(--surface)] px-4 pb-0 pt-3 md:px-6 shrink-0">
        <div className="flex items-end gap-3 pb-3">
          <div className="flex-1 border-[3px] border-[var(--ink)] bg-[var(--base)] p-2 focus-within:border-[var(--filament)] focus-within:shadow-[var(--shadow-glow)] transition-all" style={{ boxShadow: '4px 4px 0 var(--ink)' }}>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={activeProvider ? `Talk to ${activeProvider.name}...` : 'Paste a key and pick a provider first...'}
              disabled={!activeProvider}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              className="w-full bg-transparent font-mono text-sm text-[var(--concrete)] placeholder:text-[var(--tungsten-gray)] focus:outline-none resize-none min-h-[2.5rem] max-h-40 disabled:opacity-40"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!activeProvider || !input.trim() || loading}
            className="border-[3px] border-[var(--ink)] bg-[var(--filament)] text-[var(--ink)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[var(--shadow-glow)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
            style={{ boxShadow: '3px 3px 0 var(--ink)' }}
          >
            SEND ↗
          </button>
        </div>
        <div className="flex justify-between items-center py-2.5 border-t border-[var(--tungsten-gray)] text-[0.75rem] text-[var(--tungsten-gray)]">
          <span>TUNGSTON BYOK — built raw, shipped straight.</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
