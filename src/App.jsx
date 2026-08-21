import React, { useState, useRef, useEffect } from 'react';
import { Key, Send, Bot, User, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// 1. The Bulletproof Provider Matrix
const PROVIDERS = {
  anthropic: {
    name: 'Claude 3.5 Sonnet',
    model: 'claude-3-5-sonnet-20241022',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    url: 'https://api.anthropic.com/v1/messages'
  },
  openai: {
    name: 'GPT-4o',
    model: 'gpt-4o',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    url: 'https://api.openai.com/v1/chat/completions'
  },
  gemini: {
    name: 'Gemini 3.7 Flash',
    model: 'gemini-3.7-flash', 
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    url: 'https://generativelanguage.googleapis.com/v1beta/models' 
  },
  groq: {
    name: 'GPT-OSS 120B (Groq)', 
    model: 'openai/gpt-oss-120b', 
    color: 'from-red-400 to-rose-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    url: 'https://api.groq.com/openai/v1/chat/completions'
  },
  nvidia: {
    name: 'NVIDIA NIM (Llama 3.1)',
    model: 'meta/llama-3.1-70b-instruct',
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    url: 'https://corsproxy.io/?https://integrate.api.nvidia.com/v1/chat/completions'
  },
  bytez: {
    name: 'Bytez (Phi-4 Mini)',
    // FIXED: Phi-4-mini is 4B params, which safely bypasses the Bytez 7B free-tier limit!
    model: 'microsoft/Phi-4-mini-reasoning', 
    color: 'from-fuchsia-400 to-pink-500',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    url: 'https://corsproxy.io/?https://api.bytez.com/models/v2/openai/v1/chat/completions' 
  },
  openrouter: {
    name: 'OpenRouter Free',
    model: 'openrouter/free',
    color: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    url: 'https://openrouter.ai/api/v1/chat/completions'
  }
};

// 2. Intelligent Auto-Detection Engine
function detectProvider(rawKey) {
  if (!rawKey) return null;
  const key = rawKey.trim();
  
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('AIza') || key.startsWith('AQ.')) return 'gemini';
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('nvapi-')) return 'nvidia';
  if (key.startsWith('bytez:')) return 'bytez';
  if (key.startsWith('sk-or-v1-')) return 'openrouter';
  if (key.startsWith('sk-proj-') || key.startsWith('sk-')) return 'openai';
  
  return null;
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tungston_key') || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const providerKey = detectProvider(apiKey);
  const activeProvider = providerKey ? PROVIDERS[providerKey] : null;

  useEffect(() => {
    localStorage.setItem('tungston_key', apiKey.trim());
  }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || !activeProvider || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      let assistantReply = '';
      
      let finalKey = apiKey.trim();
      if (finalKey.startsWith('bytez:')) {
        finalKey = finalKey.replace('bytez:', '');
      }

      if (['openai', 'groq', 'nvidia', 'bytez', 'openrouter'].includes(providerKey)) {
        const res = await fetch(activeProvider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${finalKey}`
          },
          body: JSON.stringify({
            model: activeProvider.model,
            messages: newMessages.map(m => ({ role: m.role, content: m.content }))
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || data.error || 'Unknown API Error');
        assistantReply = data.choices[0].message.content;
      } 
      else if (providerKey === 'anthropic') {
        const res = await fetch(activeProvider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': finalKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: activeProvider.model,
            max_tokens: 4096,
            messages: newMessages.map(m => ({ role: m.role, content: m.content }))
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || data.error || 'Unknown API Error');
        assistantReply = data.content[0].text;
      } 
      else if (providerKey === 'gemini') {
        const formattedHistory = newMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        const res = await fetch(`${activeProvider.url}/${activeProvider.model}:generateContent?key=${finalKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: formattedHistory })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || data.error || 'Unknown API Error');
        assistantReply = data.candidates[0].content.parts[0].text;
      }

      setMessages([...newMessages, { role: 'assistant', content: assistantReply }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
      
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center space-x-2 group cursor-pointer">
          <div className="bg-indigo-500/20 p-2 rounded-xl group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-indigo-400"/>
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white">
            tungston<span className="text-indigo-400">BYOK</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto relative group">
          <div className="relative flex-1 sm:w-80 transition-all">
            <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/>
            <input
              type="password"
              placeholder="Paste API key (For Bytez use 'bytez:KEY')"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-500 shadow-inner text-white"
            />
          </div>
          
          {activeProvider ? (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${activeProvider.border} ${activeProvider.bg} animate-in fade-in zoom-in duration-300`}>
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeProvider.color} animate-pulse`} />
              <span className="text-xs font-semibold tracking-wide whitespace-nowrap text-slate-200">
                {activeProvider.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hidden sm:flex">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500"/>
              <span className="text-xs font-medium whitespace-nowrap text-slate-500">Secure Local</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-between relative">
        <div className="space-y-6 pb-28 flex-1 overflow-y-auto scrollbar-hide">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-2xl mb-6">
                  <Zap className="w-8 h-8 text-indigo-400"/>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Ready for inputs.</h2>
              <p className="text-sm text-slate-500 text-center max-w-sm">Powered entirely by your own API tokens.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
                {m.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
              </div>
              <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-xl overflow-x-auto ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm text-[15px]' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'}`}>
                {m.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                ) : (
                  <ReactMarkdown
                    components={{
                      code(props) {
                        const {children, className, node, ...rest} = props;
                        const match = /language-(\w+)/.exec(className || '');
                        
                        return match ? (
                          <div className="bg-slate-950 rounded-lg overflow-hidden my-4 border border-slate-800 shadow-inner">
                            <div className="bg-slate-900/50 px-4 py-2 text-xs text-slate-400 border-b border-slate-800 flex items-center justify-between">
                              <span className="uppercase tracking-wider font-semibold">{match[1]}</span>
                            </div>
                            <pre className="p-4 overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed">
                              <code className={className} {...rest}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <code className="bg-slate-800 px-1.5 py-0.5 rounded-md text-indigo-300 text-sm font-mono" {...rest}>
                            {children}
                          </code>
                        );
                      },
                      p: ({children}) => <p className="mb-4 last:mb-0 leading-relaxed text-[15px]">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1.5 text-[15px]">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-[15px]">{children}</ol>,
                      h1: ({children}) => <h1 className="text-2xl font-bold mb-4 mt-6 text-white">{children}</h1>,
                      h2: ({children}) => <h2 className="text-xl font-bold mb-3 mt-5 text-white">{children}</h2>,
                      h3: ({children}) => <h3 className="text-lg font-bold mb-2 mt-4 text-white">{children}</h3>,
                      strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-4 animate-in fade-in">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg">
                <Bot className="w-4 h-4 text-indigo-400 animate-pulse"/>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-sm flex items-center space-x-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-10 pb-4 px-4 pointer-events-none z-10">
          <div className="max-w-4xl mx-auto flex items-end space-x-2 pointer-events-auto bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <textarea
              rows="1"
              placeholder={activeProvider ? `Chat with ${activeProvider.name}...` : "Key required to unlock chat..."}
              disabled={!activeProvider}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent px-3 py-3 text-sm sm:text-base focus:outline-none disabled:opacity-40 resize-none max-h-32 text-slate-100 placeholder:text-slate-500"
              style={{ minHeight: '48px' }}
            />
            <button
              onClick={handleSend}
              disabled={!activeProvider || !input.trim() || loading}
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed p-3 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg h-[48px] w-[48px] shrink-0"
            >
              <Send className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}