import React, { useState, useRef, useEffect } from 'react';
import { Key, Send, Bot, User, Zap, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  return null; // Return null so user can select
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
      setMessages([...newMessages, { role: 'assistant', content: `**ERROR:** \`${err.message}\`` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--color-base)] text-[var(--color-ink)]">
      {/* Header */}
      <header className="flex items-center justify-between border-b-2 border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 md:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <Zap className="text-[var(--color-accent)]" size={24} />
          <h1 className="font-[var(--font-display)] text-xl uppercase tracking-wider hidden sm:block">Tungston BYOK</h1>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end max-w-xl">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="w-4 h-4 text-[var(--color-muted)]" />
            </div>
            <input
              type="password"
              placeholder="Paste any API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-[var(--color-line)] bg-[var(--color-surface2)] text-[var(--color-ink)] font-mono text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-0 shadow-[var(--shadow-hard-sm)] transition-shadow"
            />
          </div>
          
          <div className="relative">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="appearance-none border-2 border-[var(--color-line)] bg-[var(--color-surface2)] text-[var(--color-ink)] px-4 py-2 pr-10 font-mono text-sm uppercase font-bold focus:outline-none cursor-pointer shadow-[var(--shadow-hard-sm)]"
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

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
            <div className="bg-[var(--color-surface)] border-2 border-[var(--color-line)] p-8 shadow-[var(--shadow-hard)]">
              <Zap className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-4" />
              <h2 className="font-[var(--font-display)] text-2xl uppercase mb-2">Secure Local Execution</h2>
              <p className="font-mono text-sm text-[var(--color-muted)]">
                All requests happen directly from your browser. Bring your own key from 14+ supported providers.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 border-[var(--color-line)] ${m.role === 'user' ? 'bg-[var(--color-accent)] text-[var(--color-base)] shadow-[var(--shadow-hard-sm)]' : 'bg-[var(--color-surface2)] shadow-[var(--shadow-hard-sm)]'}`}>
              {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[85%] sm:max-w-[75%] border-2 border-[var(--color-line)] p-4 shadow-[var(--shadow-hard)] ${m.role === 'user' ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-base)]'}`}>
              {m.role === 'user' ? (
                <div className="font-mono whitespace-pre-wrap">{m.content}</div>
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
            <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-[var(--color-line)] bg-[var(--color-surface2)] shadow-[var(--shadow-hard-sm)]">
              <Bot size={20} className="animate-pulse" />
            </div>
            <div className="border-2 border-[var(--color-line)] bg-[var(--color-base)] p-4 shadow-[var(--shadow-hard)] flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[var(--color-accent)] animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-24" />
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-8 bg-[var(--color-surface)] border-t-2 border-[var(--color-line)] shrink-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            rows="1"
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
            className="flex-1 bg-[var(--color-base)] border-2 border-[var(--color-line)] px-4 py-3 font-mono text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] shadow-[var(--shadow-hard-sm)] disabled:opacity-50 resize-none min-h-[52px]"
          />
          <button
            onClick={handleSend}
            disabled={!activeProvider || !input.trim() || loading}
            className="bg-[var(--color-accent)] text-[var(--color-line)] border-2 border-[var(--color-line)] disabled:opacity-50 disabled:cursor-not-allowed px-4 transition-transform active:translate-x-[3px] active:translate-y-[3px] shadow-[var(--shadow-hard-sm)] active:shadow-none flex items-center justify-center min-h-[52px]"
          >
            <Send size={20} className="font-bold" />
          </button>
        </div>
      </footer>
    </div>
  );
}
