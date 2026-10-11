import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

/* ─────────────────────────────────────────────────────────────
   PROVIDER REGISTRY
───────────────────────────────────────────────────────────── */

export const PROVIDERS = {
  groq: {
    id: 'groq',
    name: 'Groq Cloud',
    code: 'GRQ',
    tag: 'ULTRA LOW LATENCY',
    models: [
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant'
    ],
    defaultModel: 'openai/gpt-oss-20b',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://api.groq.com/openai/v1/chat/completions',
    keyPrefix: 'gsk_',
    keyHint: 'gsk_...'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    code: 'OAI',
    tag: 'FRONTIER FOUNDATION',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'o3-mini',
      'o1-mini'
    ],
    defaultModel: 'gpt-4o',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://api.openai.com/v1/chat/completions',
    keyPrefix: 'sk-',
    keyHint: 'sk-proj-... / sk-...'
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    code: 'ANT',
    tag: 'ADVANCED REASONING',
    models: [
      'claude-3-7-sonnet-latest',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-latest'
    ],
    defaultModel: 'claude-3-5-sonnet-20241022',
    type: 'anthropic',
    url: '/api/proxy',
    targetUrl: 'https://api.anthropic.com/v1/messages',
    keyPrefix: 'sk-ant-',
    keyHint: 'sk-ant-api03-...'
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    code: 'GEM',
    tag: 'DEEP MULTIMODAL',
    models: [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ],
    defaultModel: 'gemini-2.0-flash',
    type: 'gemini',
    url: '/api/proxy',
    targetUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    keyPrefix: 'AIza',
    keyHint: 'AIzaSy...'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    code: 'DSK',
    tag: 'OPEN WEIGHTS R1 & V3',
    models: [
      'deepseek-chat',
      'deepseek-reasoner'
    ],
    defaultModel: 'deepseek-chat',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://api.deepseek.com/chat/completions',
    keyPrefix: 'sk-',
    keyHint: 'sk-...'
  },
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras Wafer',
    code: 'CRB',
    tag: 'WAFER-SCALE ULTRA SPEED',
    models: [
      'llama-3.3-70b',
      'llama-3.1-8b'
    ],
    defaultModel: 'llama-3.3-70b',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://api.cerebras.ai/v1/chat/completions',
    keyPrefix: 'csk-',
    keyHint: 'csk-...'
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    code: 'ORT',
    tag: 'UNIVERSAL GATEWAY',
    models: [
      'openrouter/auto',
      'meta-llama/llama-3.3-70b-instruct',
      'anthropic/claude-3.5-sonnet',
      'deepseek/deepseek-r1'
    ],
    defaultModel: 'openrouter/auto',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://openrouter.ai/api/v1/chat/completions',
    keyPrefix: 'sk-or-v1-',
    keyHint: 'sk-or-v1-...'
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    code: 'MST',
    tag: 'EUROPEAN FRONTIER',
    models: [
      'mistral-large-latest',
      'mistral-small-latest',
      'codestral-latest'
    ],
    defaultModel: 'mistral-large-latest',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://api.mistral.ai/v1/chat/completions',
    keyHint: 'mistral API key'
  },
  xai: {
    id: 'xai',
    name: 'xAI (Grok)',
    code: 'XAI',
    tag: 'MAX COGNITION',
    models: [
      'grok-2-latest',
      'grok-beta'
    ],
    defaultModel: 'grok-2-latest',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://api.x.ai/v1/chat/completions',
    keyPrefix: 'xai-',
    keyHint: 'xai-...'
  },
  together: {
    id: 'together',
    name: 'Together AI',
    code: 'TGR',
    tag: 'DISTRIBUTED COMPUTE',
    models: [
      'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'deepseek-ai/DeepSeek-V3'
    ],
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://api.together.xyz/v1/chat/completions',
    keyHint: 'together API key'
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    code: 'PPX',
    tag: 'SEARCH AUGMENTED',
    models: [
      'sonar-pro',
      'sonar'
    ],
    defaultModel: 'sonar-pro',
    type: 'openai',
    url: '/api/proxy',
    targetUrl: 'https://api.perplexity.ai/chat/completions',
    keyPrefix: 'pplx-',
    keyHint: 'pplx-...'
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    code: 'CHR',
    tag: 'ENTERPRISE RAG',
    models: [
      'command-r-plus-08-2024',
      'command-r-08-2024'
    ],
    defaultModel: 'command-r-plus-08-2024',
    type: 'cohere',
    url: '/api/proxy',
    targetUrl: 'https://api.cohere.com/v1/chat',
    keyHint: 'cohere API key'
  }
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

function detectProvider(rawKey) {
  if (!rawKey) return null;
  const key = rawKey.trim();
  if (key.startsWith('gsk_')) return 'groq';
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('AIza') || key.startsWith('AQ.')) return 'gemini';
  if (key.startsWith('sk-or-v1-')) return 'openrouter';
  if (key.startsWith('csk-')) return 'cerebras';
  if (key.startsWith('xai-')) return 'xai';
  if (key.startsWith('pplx-')) return 'perplexity';
  if (key.startsWith('sk-')) return 'openai';
  return null;
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.max(1, Math.round(text.length / 3.8));
}

const PRESET_PROMPTS = [
  {
    label: '⚡ LRU Cache (TS)',
    prompt: 'Implement a high-performance LRU Cache in TypeScript with O(1) get and put operations, complete type safety, capacity bounds, and eviction tests.'
  },
  {
    label: '🧠 Logic Puzzle',
    prompt: 'A cylindrical glass is half full of water. Without any measuring instruments, how can you verify with mathematical certainty whether it is exactly half full, more than half full, or less than half full? Explain the geometric principle.'
  },
  {
    label: '🛡️ Redis Rate Limiter',
    prompt: 'Detail the failure modes, clock drift issues, and race conditions of a distributed token-bucket rate limiter built on Redis clusters, and how to mitigate them.'
  },
  {
    label: '🔩 Heavy Industry Manifest',
    prompt: 'Write a concise 3-paragraph industrial manifesto championing raw, unpolished, zero-fluff software tools that prioritize raw throughput over decorative aesthetics.'
  }
];

/* ─────────────────────────────────────────────────────────────
   UNIFIED EXECUTION ENGINE
───────────────────────────────────────────────────────────── */

async function queryModel({ providerId, apiKey, model, messages, temperature = 0.7 }) {
  const provider = PROVIDERS[providerId];
  if (!provider) throw new Error(`Provider "${providerId}" not found in registry.`);
  if (!apiKey || !apiKey.trim()) throw new Error(`Missing API Key for ${provider.name}.`);
  if (!model || !model.trim()) throw new Error(`Missing Model designation for ${provider.name}.`);

  const key = apiKey.trim();
  const selectedModel = model.trim();
  const t0 = performance.now();

  let resultText = '';

  if (provider.type === 'openai') {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'x-target-url': provider.targetUrl
    };
    if (provider.id === 'openrouter') {
      headers['HTTP-Referer'] = 'https://tungston.vercel.app';
      headers['X-Title'] = 'Tungston BYOK';
    }

    const res = await fetch(provider.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedMsg = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedMsg = jsonErr?.error?.message || jsonErr?.message || errText;
      } catch {
        /* use raw text */
      }
      throw new Error(`[${provider.code} ${res.status}] ${parsedMsg}`);
    }

    const data = await res.json();
    resultText = data?.choices?.[0]?.message?.content ?? '(No content returned)';

  } else if (provider.type === 'anthropic') {
    const sysMsg = messages.find((m) => m.role === 'system')?.content;
    const chatMsgs = messages.filter((m) => m.role !== 'system');

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'x-target-url': provider.targetUrl
    };

    const payload = {
      model: selectedModel,
      max_tokens: 4096,
      messages: chatMsgs
    };
    if (sysMsg) payload.system = sysMsg;

    const res = await fetch(provider.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedMsg = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedMsg = jsonErr?.error?.message || jsonErr?.message || errText;
      } catch {}
      throw new Error(`[ANT ${res.status}] ${parsedMsg}`);
    }

    const data = await res.json();
    resultText = data?.content?.[0]?.text ?? '(No text returned)';

  } else if (provider.type === 'gemini') {
    const targetUrl = `${provider.targetUrl}/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(key)}`;
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    const sysMsg = messages.find((m) => m.role === 'system')?.content;
    const bodyObj = { contents };
    if (sysMsg) {
      bodyObj.systemInstruction = { parts: [{ text: sysMsg }] };
    }

    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-target-url': targetUrl
      },
      body: JSON.stringify(bodyObj)
    });

    if (!res.ok) {
      const errText = await res.text();
      let parsedMsg = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedMsg = jsonErr?.error?.message || jsonErr?.message || errText;
      } catch {}
      throw new Error(`[GEM ${res.status}] ${parsedMsg}`);
    }

    const data = await res.json();
    resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '(No candidates returned)';

  } else if (provider.type === 'cohere') {
    const userPrompt = messages[messages.length - 1]?.content || '';
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'USER' : 'CHATBOT',
      message: m.content
    }));

    const res = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'x-target-url': provider.targetUrl
      },
      body: JSON.stringify({
        model: selectedModel,
        message: userPrompt,
        chat_history: history
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[CHR ${res.status}] ${errText}`);
    }

    const data = await res.json();
    resultText = data?.text ?? '(No text returned)';
  }

  const t1 = performance.now();
  const latencyMs = Math.round(t1 - t0);
  const tokenCount = estimateTokens(resultText);
  const tokensPerSec = latencyMs > 0 ? Math.round((tokenCount / latencyMs) * 1000) : 0;

  return {
    text: resultText,
    latencyMs,
    tokens: tokenCount,
    tokensPerSec
  };
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

export default function App() {
  /* ── Tab Mode: DEFAULT IS 'chat' (Single BYOK) ── */
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('tungston_mode') || 'chat');

  /* ── Chat Mode State ── */
  const [chatKey, setChatKey] = useState(() => localStorage.getItem('tungston_key') || '');
  const [chatProvider, setChatProvider] = useState(() => localStorage.getItem('tungston_provider') || 'groq');
  const [chatModel, setChatModel] = useState(() => localStorage.getItem('tungston_model') || 'openai/gpt-oss-20b');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChatProviders, setShowChatProviders] = useState(false);

  /* ── Arena Mode State ── */
  const [engineA, setEngineA] = useState(() => ({
    provider: localStorage.getItem('tungston_arena_pA') || 'groq',
    key: localStorage.getItem('tungston_arena_kA') || localStorage.getItem('tungston_key') || '',
    model: localStorage.getItem('tungston_arena_mA') || 'openai/gpt-oss-20b'
  }));

  const [engineB, setEngineB] = useState(() => ({
    provider: localStorage.getItem('tungston_arena_pB') || 'groq',
    key: localStorage.getItem('tungston_arena_kB') || localStorage.getItem('tungston_key') || '',
    model: localStorage.getItem('tungston_arena_mB') || 'qwen/qwen3.8-27b'
  }));

  const [linkKeys, setLinkKeys] = useState(() => localStorage.getItem('tungston_arena_linkKeys') !== 'false');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [arenaInput, setArenaInput] = useState('');
  const [arenaRunning, setArenaRunning] = useState(false);

  /* Mobile Arena View Switcher ('both' | 'A' | 'B') */
  const [mobileArenaView, setMobileArenaView] = useState('both');

  const [resA, setResA] = useState({ status: 'idle', text: '', latencyMs: 0, tokens: 0, tokensPerSec: 0, error: '' });
  const [resB, setResB] = useState({ status: 'idle', text: '', latencyMs: 0, tokens: 0, tokensPerSec: 0, error: '' });
  const [arenaVerdict, setArenaVerdict] = useState(null);
  const [arenaHistory, setArenaHistory] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);
  const [statusNotice, setStatusNotice] = useState('');

  const chatEndRef = useRef(null);

  /* ── Save to localStorage ── */
  useEffect(() => {
    localStorage.setItem('tungston_mode', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('tungston_key', chatKey.trim());
    localStorage.setItem('tungston_provider', chatProvider);
    localStorage.setItem('tungston_model', chatModel);
  }, [chatKey, chatProvider, chatModel]);

  useEffect(() => {
    localStorage.setItem('tungston_arena_pA', engineA.provider);
    localStorage.setItem('tungston_arena_kA', engineA.key.trim());
    localStorage.setItem('tungston_arena_mA', engineA.model);

    localStorage.setItem('tungston_arena_pB', engineB.provider);
    localStorage.setItem('tungston_arena_kB', engineB.key.trim());
    localStorage.setItem('tungston_arena_mB', engineB.model);
    localStorage.setItem('tungston_arena_linkKeys', String(linkKeys));
  }, [engineA, engineB, linkKeys]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  /* ── Copy helper ── */
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /* ── Clear All Keys & Storage ── */
  const handleClearAllStorage = () => {
    if (window.confirm('Wipe all stored API keys and comparison history from this browser?')) {
      localStorage.clear();
      setChatKey('');
      setEngineA({ provider: 'groq', key: '', model: 'openai/gpt-oss-20b' });
      setEngineB({ provider: 'groq', key: '', model: 'qwen/qwen3.8-27b' });
      setChatMessages([]);
      setArenaHistory([]);
      setResA({ status: 'idle', text: '', latencyMs: 0, tokens: 0, tokensPerSec: 0, error: '' });
      setResB({ status: 'idle', text: '', latencyMs: 0, tokens: 0, tokensPerSec: 0, error: '' });
      setStatusNotice('ALL KEYS WIPED FROM BROWSER');
      setTimeout(() => setStatusNotice(''), 3000);
    }
  };

  /* ── Swap Engine A & Engine B ── */
  const handleSwapEngines = () => {
    const tempA = { ...engineA };
    setEngineA({ ...engineB });
    setEngineB(tempA);
    const tempResA = { ...resA };
    setResA({ ...resB });
    setResB(tempResA);
  };

  /* ── Open Arena pre-seeded with current Chat config ── */
  const handleLaunchArenaFromChat = () => {
    if (chatKey.trim()) {
      setEngineA((prev) => ({
        ...prev,
        provider: chatProvider,
        key: chatKey.trim(),
        model: chatModel
      }));
    }
    setActiveTab('arena');
  };

  /* ── Send in Single Chat Mode ── */
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');

    const newMsgs = [...chatMessages, { role: 'user', content: userText }];
    setChatMessages(newMsgs);
    setChatLoading(true);

    try {
      const activeKey = chatKey.trim();
      const result = await queryModel({
        providerId: chatProvider,
        apiKey: activeKey,
        model: chatModel,
        messages: newMsgs
      });

      setChatMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: result.text,
          latencyMs: result.latencyMs,
          tokens: result.tokens,
          tokensPerSec: result.tokensPerSec
        }
      ]);
    } catch (err) {
      setChatMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: `**TRANSMISSION FAILED:** \`${err.message}\``,
          error: true
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ── Run Dual Arena Comparison ── */
  const handleRunArena = async () => {
    if (!arenaInput.trim() || arenaRunning) return;
    const promptText = arenaInput.trim();

    const effectiveKeyB = linkKeys ? engineA.key.trim() : engineB.key.trim();

    if (!engineA.key.trim()) {
      alert(`Please supply an API Key for Engine A (${PROVIDERS[engineA.provider]?.name}).`);
      return;
    }
    if (!effectiveKeyB) {
      alert(`Please supply an API Key for Engine B (${PROVIDERS[engineB.provider]?.name}).`);
      return;
    }

    setArenaRunning(true);
    setArenaVerdict(null);
    setResA({ status: 'running', text: '', latencyMs: 0, tokens: 0, tokensPerSec: 0, error: '' });
    setResB({ status: 'running', text: '', latencyMs: 0, tokens: 0, tokensPerSec: 0, error: '' });

    const messagesToSend = [];
    if (systemPrompt.trim()) {
      messagesToSend.push({ role: 'system', content: systemPrompt.trim() });
    }
    messagesToSend.push({ role: 'user', content: promptText });

    const taskA = queryModel({
      providerId: engineA.provider,
      apiKey: engineA.key.trim(),
      model: engineA.model,
      messages: messagesToSend
    })
      .then((data) => {
        setResA({ status: 'done', text: data.text, latencyMs: data.latencyMs, tokens: data.tokens, tokensPerSec: data.tokensPerSec, error: '' });
        return { success: true, data };
      })
      .catch((err) => {
        setResA({ status: 'error', text: '', latencyMs: 0, tokens: 0, tokensPerSec: 0, error: err.message });
        return { success: false, error: err.message };
      });

    const taskB = queryModel({
      providerId: engineB.provider,
      apiKey: effectiveKeyB,
      model: engineB.model,
      messages: messagesToSend
    })
      .then((data) => {
        setResB({ status: 'done', text: data.text, latencyMs: data.latencyMs, tokens: data.tokens, tokensPerSec: data.tokensPerSec, error: '' });
        return { success: true, data };
      })
      .catch((err) => {
        setResB({ status: 'error', text: '', latencyMs: 0, tokens: 0, tokensPerSec: 0, error: err.message });
        return { success: false, error: err.message };
      });

    const [outA, outB] = await Promise.all([taskA, taskB]);
    setArenaRunning(false);

    // Save round to session history
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      prompt: promptText,
      engineA: { ...engineA },
      engineB: { ...engineB, key: effectiveKeyB },
      outA,
      outB,
      vote: null
    };
    setArenaHistory((prev) => [historyItem, ...prev.slice(0, 9)]);
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: Topbar & Navigation
  ───────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--base)] text-[var(--concrete)] relative overflow-hidden font-mono">
      <div className="grain" />

      {/* ── TOPBAR (RESPONSIVE FOR ALL SCREEN SIZES) ── */}
      <header className="border-b-[3px] border-[var(--ink)] bg-[var(--surface)] px-3 py-2.5 md:px-6 md:py-3 flex items-center justify-between flex-wrap gap-2 shrink-0 z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href="https://tungston.vercel.app/"
            className="flex items-center gap-1 border-[2px] border-[var(--ink)] bg-[var(--surface2)] px-2 py-1 text-[11px] md:text-xs hover:border-[var(--filament)] hover:text-[var(--filament)] transition-colors"
            title="Return to Tungston Forge"
          >
            <span>← FORGE</span>
          </a>
          <div className="flex items-center gap-1 font-display text-base md:text-xl uppercase tracking-wider text-[var(--concrete)]">
            <span className="text-[var(--filament)]">W 74</span>
            <span className="hidden sm:inline">TUNGSTON</span>
            <span className="text-[10px] md:text-xs font-mono font-bold px-1.5 py-0.5 bg-[var(--filament)] text-[var(--ink)] ml-1">
              BYOK
            </span>
          </div>
        </div>

        {/* ── MODE SWITCHER TABS ── */}
        <div className="flex items-center border-[2px] md:border-[3px] border-[var(--ink)] bg-[var(--base)] shadow-[2px_2px_0_var(--ink)] md:shadow-[3px_3px_0_var(--ink)]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 py-1 md:px-3 md:py-1.5 text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'chat'
                ? 'bg-[var(--filament)] text-[var(--ink)]'
                : 'text-[var(--concrete)] hover:text-[var(--filament)]'
            }`}
          >
            💬 SINGLE BYOK
          </button>
          <div className="w-[2px] h-5 md:h-6 bg-[var(--ink)]" />
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-2.5 py-1 md:px-3 md:py-1.5 text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'arena'
                ? 'bg-[var(--filament)] text-[var(--ink)]'
                : 'text-[var(--concrete)] hover:text-[var(--filament)]'
            }`}
          >
            ⚔️ ARENA (TESTER)
          </button>
        </div>

        {/* ── TOPBAR RIGHT ACTIONS ── */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {statusNotice && (
            <span className="text-[9px] md:text-[10px] font-bold text-[var(--filament)] px-1.5 py-0.5 border border-[var(--filament)] bg-black animate-pulse">
              {statusNotice}
            </span>
          )}
          <button
            onClick={handleClearAllStorage}
            className="border-[2px] border-[var(--ink)] bg-[var(--surface2)] hover:border-red-500 hover:text-red-400 px-2 py-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-colors"
            title="Clear all stored keys and browser history"
          >
            WIPE KEYS
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         TAB 1: SINGLE ENGINE WORKBENCH (DEFAULT)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Key & Provider selector bar */}
          <div className="border-b-[3px] border-[var(--ink)] px-3 py-2.5 md:px-6 md:py-3 bg-[var(--surface)] flex items-center gap-2 md:gap-3 flex-wrap shrink-0">
            <span className="text-[10px] font-bold text-[var(--tungsten-gray)] tracking-[0.1em] uppercase shrink-0">
              API KEY
            </span>
            <input
              type="password"
              placeholder="Paste any supported API key..."
              value={chatKey}
              onChange={(e) => {
                const val = e.target.value;
                setChatKey(val);
                const detected = detectProvider(val);
                if (detected) {
                  setChatProvider(detected);
                  setChatModel(PROVIDERS[detected]?.defaultModel || chatModel);
                }
              }}
              className="flex-1 min-w-[140px] md:min-w-[200px] brut-input text-base md:text-xs py-1.5"
            />

            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <select
                value={chatProvider}
                onChange={(e) => {
                  const p = e.target.value;
                  setChatProvider(p);
                  setChatModel(PROVIDERS[p]?.defaultModel || '');
                }}
                className="brut-input text-xs py-1.5 max-w-[120px] md:max-w-none"
              >
                {Object.entries(PROVIDERS).map(([pid, p]) => (
                  <option key={pid} value={pid}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value)}
                className="brut-input text-xs py-1.5 max-w-[140px] md:max-w-none"
              >
                {PROVIDERS[chatProvider]?.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowChatProviders(!showChatProviders)}
                className="brut-btn text-[10px] md:text-[11px] py-1.5 px-2 md:px-3"
                title="View all 12 providers"
              >
                {showChatProviders ? '▲' : '▼ ALL'}
              </button>

              {/* DIRECT BUTTON TO OPEN THE ARENA / TESTER */}
              <button
                onClick={handleLaunchArenaFromChat}
                className="border-[2px] border-[var(--filament)] bg-[var(--surface2)] text-[var(--filament)] px-2 md:px-2.5 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-[var(--filament)] hover:text-[var(--ink)] transition-colors"
                title="Open Dual-Model Comparison Arena with current engine"
              >
                ⚔️ OPEN ARENA
              </button>
            </div>
          </div>

          {/* Provider drawer */}
          {showChatProviders && (
            <div className="border-b-[3px] border-[var(--ink)] bg-[var(--surface2)] px-3 py-3 md:px-6 md:py-4 shrink-0 max-h-[45vh] overflow-y-auto">
              <p className="text-[10px] font-bold text-[var(--tungsten-gray)] tracking-[0.1em] uppercase mb-2">
                SELECT ENGINE — {Object.keys(PROVIDERS).length} CONNECTORS AVAILABLE
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(PROVIDERS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setChatProvider(key);
                      setChatModel(p.defaultModel);
                      setShowChatProviders(false);
                    }}
                    className={`provider-card text-left p-2.5 md:p-3 ${chatProvider === key ? 'active' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold tracking-[0.08em] text-[var(--tungsten-gray)]">{p.code}</span>
                      {chatProvider === key && (
                        <span className="inline-block w-2 h-2 bg-[var(--filament)] border border-[var(--ink)]" />
                      )}
                    </div>
                    <span className="text-xs font-bold uppercase leading-tight block">{p.name}</span>
                    <span className="text-[9px] text-[var(--tungsten-gray)] block mt-1 truncate">{p.defaultModel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <main className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
            {chatMessages.length === 0 && (
              <div className="h-full flex items-center justify-center py-4 md:py-6">
                <div className="w-full max-w-2xl text-center px-2">
                  <h1
                    className="relative w-fit mx-auto"
                    style={{
                      fontFamily: 'Archivo Black, sans-serif',
                      fontSize: 'clamp(2.2rem, 8vw, 5.5rem)',
                      lineHeight: 0.9,
                      letterSpacing: '-0.02em',
                      margin: '0 auto 16px'
                    }}
                  >
                    BYOK
                    <span
                      className="absolute inset-0 text-transparent animate-flicker pointer-events-none"
                      style={{ WebkitTextStroke: '1px var(--filament)', transform: 'translate(4px, 4px)', zIndex: -1 }}
                      aria-hidden="true"
                    >
                      BYOK
                    </span>
                  </h1>

                  <p className="mx-auto text-xs md:text-base font-medium max-w-md mb-2">
                    Bring your own key. Run it straight through — no middleman, no markup.
                  </p>
                  <p className="mx-auto text-[11px] md:text-xs text-[var(--tungsten-gray)] uppercase tracking-wider mb-5">
                    {Object.keys(PROVIDERS).length} providers ready. Credentials stay in browser.
                  </p>

                  {/* PROMINENT OPTION TO OPEN TESTING FIELD / COMPARISON ARENA */}
                  <div className="border-[3px] border-[var(--filament)] bg-[var(--surface)] p-3 md:p-4 max-w-md mx-auto text-left shadow-[4px_4px_0_var(--ink)] mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--filament)]">
                        ⚔️ MODEL COMPARISON ARENA
                      </span>
                      <span className="text-[9px] bg-[var(--filament)] text-[var(--ink)] px-1.5 py-0.5 font-bold uppercase">
                        DUAL BENCHMARK
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-[var(--concrete)] mb-3 leading-relaxed">
                      Compare two different models or API keys side-by-side with latency, speed (tokens/sec), and throughput telemetry.
                    </p>
                    <button
                      onClick={handleLaunchArenaFromChat}
                      className="brut-btn w-full text-xs py-2 shadow-[2px_2px_0_var(--ink)]"
                    >
                      OPEN DUAL TESTING ARENA ⚔️
                    </button>
                  </div>

                  {/* SPECIFICATION CARD */}
                  <div className="border-[3px] border-[var(--ink)] max-w-sm mx-auto text-left bg-[var(--surface)]">
                    {[
                      ['EXECUTION', 'CLIENT-SIDE PROXY'],
                      ['CREDENTIALS', 'LOCALSTORAGE ONLY'],
                      ['ACTIVE PROVIDER', PROVIDERS[chatProvider]?.name || 'N/A'],
                      ['ACTIVE MODEL', chatModel || 'N/A']
                    ].map(([label, value], i, arr) => (
                      <div
                        key={label}
                        className={`flex justify-between px-3 md:px-4 py-2 text-xs tracking-[0.04em] ${
                          i < arr.length - 1 ? 'border-b border-[var(--tungsten-gray)]' : ''
                        }`}
                      >
                        <span className="text-[var(--tungsten-gray)] font-semibold">{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {chatMessages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 md:gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role !== 'user' && (
                  <div
                    className="shrink-0 mt-0.5 w-7 h-7 md:w-8 md:h-8 border-[2px] md:border-[3px] border-[var(--ink)] bg-[var(--surface2)] flex items-center justify-center text-[var(--filament)] font-bold text-xs shadow-[2px_2px_0_var(--ink)]"
                  >
                    {PROVIDERS[chatProvider]?.code?.charAt(0) || 'W'}
                  </div>
                )}
                <div
                  className={`max-w-[90%] md:max-w-[80%] border-[2px] md:border-[3px] border-[var(--ink)] px-3 py-2.5 md:px-4 md:py-3 shadow-[2px_2px_0_var(--ink)] md:shadow-[3px_3px_0_var(--ink)] ${
                    m.role === 'user'
                      ? 'bg-[var(--filament)] text-[var(--ink)] font-medium'
                      : 'bg-[var(--surface)] text-[var(--concrete)]'
                  }`}
                >
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap break-words text-xs md:text-sm">{m.content}</div>
                  ) : (
                    <div>
                      <div className="markdown text-xs md:text-sm leading-relaxed break-words">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                      {m.latencyMs && (
                        <div className="mt-2 pt-2 border-t border-[var(--ink)] flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] text-[var(--tungsten-gray)] flex-wrap">
                          <span>⏱ {m.latencyMs}ms</span>
                          <span>•</span>
                          <span>~{m.tokens} tokens</span>
                          <span>•</span>
                          <span className="text-[var(--filament)]">{m.tokensPerSec} t/s</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-2.5 md:gap-3">
                <div className="shrink-0 w-7 h-7 md:w-8 md:h-8 border-[2px] md:border-[3px] border-[var(--ink)] bg-[var(--surface2)] flex items-center justify-center text-[var(--filament)] font-bold text-xs animate-spin">
                  W
                </div>
                <div className="border-[2px] md:border-[3px] border-[var(--ink)] bg-[var(--surface)] px-3 py-2.5 flex items-center gap-1.5 shadow-[2px_2px_0_var(--ink)]">
                  <span className="w-2 h-2 bg-[var(--filament)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--filament)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--filament)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4 md:h-6" />
          </main>

          {/* Composer */}
          <footer className="border-t-[3px] border-[var(--ink)] bg-[var(--surface)] p-2.5 md:p-4 shrink-0 pb-[max(10px,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-2 md:gap-3">
              <div className="flex-1 border-[2px] md:border-[3px] border-[var(--ink)] bg-[var(--base)] p-2 shadow-[2px_2px_0_var(--ink)] md:shadow-[3px_3px_0_var(--ink)]">
                <textarea
                  rows={2}
                  placeholder={`Talk to ${PROVIDERS[chatProvider]?.name} (${chatModel})...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend();
                    }
                  }}
                  className="w-full bg-transparent text-base md:text-sm text-[var(--concrete)] placeholder:text-[var(--tungsten-gray)] resize-none focus:outline-none"
                />
              </div>
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim() || !chatKey.trim()}
                className="brut-btn text-xs py-3 px-3 md:px-4 shrink-0 min-h-[44px]"
              >
                SEND ↗
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-[9px] md:text-[10px] text-[var(--tungsten-gray)] flex-wrap gap-1">
              <span>{PROVIDERS[chatProvider]?.name} • {chatModel}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLaunchArenaFromChat}
                  className="text-[var(--filament)] hover:underline uppercase font-bold"
                >
                  ⚔️ COMPARE IN ARENA ↗
                </button>
                {chatMessages.length > 0 && (
                  <button
                    onClick={() => setChatMessages([])}
                    className="hover:text-red-400 uppercase font-bold"
                  >
                    CLEAR CHAT
                  </button>
                )}
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         TAB 2: MODEL ARENA / TESTER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'arena' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* ── ARENA DUAL CONFIG BAR ── */}
          <div className="border-b-[3px] border-[var(--ink)] bg-[var(--surface)] px-3 py-2.5 md:px-6 md:py-3 shrink-0 max-h-[38vh] md:max-h-none overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative">
              {/* ── ENGINE A CONFIG ── */}
              <div className="border-[2px] border-[var(--ink)] bg-[var(--base)] p-2.5 md:p-3 shadow-[2px_2px_0_var(--ink)] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[var(--filament)] border border-[var(--ink)] inline-block" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--filament)]">ENGINE A [PRIMARY]</span>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-[var(--tungsten-gray)]">{PROVIDERS[engineA.provider]?.tag}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-[var(--tungsten-gray)] block mb-1">PROVIDER</label>
                    <select
                      value={engineA.provider}
                      onChange={(e) => {
                        const newP = e.target.value;
                        setEngineA({
                          ...engineA,
                          provider: newP,
                          model: PROVIDERS[newP]?.defaultModel || ''
                        });
                      }}
                      className="w-full brut-input text-xs"
                    >
                      {Object.entries(PROVIDERS).map(([pid, p]) => (
                        <option key={pid} value={pid}>
                          {p.code} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-[var(--tungsten-gray)] block mb-1">MODEL</label>
                    <select
                      value={engineA.model}
                      onChange={(e) => setEngineA({ ...engineA, model: e.target.value })}
                      className="w-full brut-input text-xs"
                    >
                      {PROVIDERS[engineA.provider]?.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] uppercase font-bold text-[var(--tungsten-gray)]">
                      API KEY ({PROVIDERS[engineA.provider]?.name})
                    </label>
                    {engineA.key && (
                      <span className="text-[9px] text-[var(--filament)]">
                        KEY ARMED ({engineA.key.slice(0, 4)}...{engineA.key.slice(-4)})
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder={`Paste ${PROVIDERS[engineA.provider]?.keyHint || 'API Key'}...`}
                    value={engineA.key}
                    onChange={(e) => {
                      const val = e.target.value;
                      const detected = detectProvider(val);
                      if (detected && detected !== engineA.provider) {
                        setEngineA({
                          provider: detected,
                          key: val,
                          model: PROVIDERS[detected]?.defaultModel || engineA.model
                        });
                      } else {
                        setEngineA({ ...engineA, key: val });
                      }
                    }}
                    className="w-full brut-input text-base md:text-xs placeholder:text-[var(--tungsten-gray)]"
                  />
                </div>
              </div>

              {/* ── MOBILE SWAP BUTTON ── */}
              <div className="flex md:hidden justify-center my-0.5">
                <button
                  onClick={handleSwapEngines}
                  className="border-[2px] border-[var(--ink)] bg-[var(--filament)] text-[var(--ink)] px-3 py-1 font-bold text-[11px] shadow-[2px_2px_0_var(--ink)]"
                  title="Swap Engine A and Engine B"
                >
                  ⇄ SWAP ENGINES A &amp; B
                </button>
              </div>

              {/* ── DESKTOP SWAP BUTTON ── */}
              <button
                onClick={handleSwapEngines}
                className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 border-[2px] border-[var(--ink)] bg-[var(--filament)] text-[var(--ink)] w-8 h-8 items-center justify-center font-bold text-sm shadow-[2px_2px_0_var(--ink)] hover:scale-110 active:scale-95 transition-transform"
                title="Swap Engine A and Engine B"
              >
                ⇄
              </button>

              {/* ── ENGINE B CONFIG ── */}
              <div className="border-[2px] border-[var(--ink)] bg-[var(--base)] p-2.5 md:p-3 shadow-[2px_2px_0_var(--ink)] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-400 border border-[var(--ink)] inline-block" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">ENGINE B [CHALLENGER]</span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-[var(--filament)] font-bold">
                    <input
                      type="checkbox"
                      checked={linkKeys}
                      onChange={(e) => setLinkKeys(e.target.checked)}
                      className="accent-[var(--filament)]"
                    />
                    <span>LINK ENGINE A KEY</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-[var(--tungsten-gray)] block mb-1">PROVIDER</label>
                    <select
                      value={engineB.provider}
                      onChange={(e) => {
                        const newP = e.target.value;
                        setEngineB({
                          ...engineB,
                          provider: newP,
                          model: PROVIDERS[newP]?.defaultModel || ''
                        });
                      }}
                      className="w-full brut-input text-xs"
                    >
                      {Object.entries(PROVIDERS).map(([pid, p]) => (
                        <option key={pid} value={pid}>
                          {p.code} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-[var(--tungsten-gray)] block mb-1">MODEL</label>
                    <select
                      value={engineB.model}
                      onChange={(e) => setEngineB({ ...engineB, model: e.target.value })}
                      className="w-full brut-input text-xs"
                    >
                      {PROVIDERS[engineB.provider]?.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] uppercase font-bold text-[var(--tungsten-gray)]">
                      {linkKeys ? 'API KEY (INHERITED FROM A)' : `API KEY (${PROVIDERS[engineB.provider]?.name})`}
                    </label>
                    {!linkKeys && engineB.key && (
                      <span className="text-[9px] text-blue-400">
                        KEY ARMED ({engineB.key.slice(0, 4)}...{engineB.key.slice(-4)})
                      </span>
                    )}
                  </div>
                  {linkKeys ? (
                    <input
                      type="text"
                      disabled
                      value={engineA.key ? `Using Key from Engine A (${engineA.key.slice(0, 4)}••••)` : 'Waiting for Engine A Key...'}
                      className="w-full brut-input text-base md:text-xs bg-[var(--surface2)] text-[var(--tungsten-gray)] cursor-not-allowed opacity-80"
                    />
                  ) : (
                    <input
                      type="password"
                      placeholder={`Paste ${PROVIDERS[engineB.provider]?.keyHint || 'API Key'}...`}
                      value={engineB.key}
                      onChange={(e) => {
                        const val = e.target.value;
                        const detected = detectProvider(val);
                        if (detected && detected !== engineB.provider) {
                          setEngineB({
                            provider: detected,
                            key: val,
                            model: PROVIDERS[detected]?.defaultModel || engineB.model
                          });
                        } else {
                          setEngineB({ ...engineB, key: val });
                        }
                      }}
                      className="w-full brut-input text-base md:text-xs placeholder:text-[var(--tungsten-gray)]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── ARENA WORKSPACE (SPLIT 50/50 WITH MOBILE TABS) ── */}
          <div className="flex-1 overflow-y-auto p-2.5 md:p-5 flex flex-col gap-3 md:gap-4">
            {/* ── SHARED COMPOSER & PRESETS ── */}
            <div className="border-[2px] md:border-[3px] border-[var(--ink)] bg-[var(--surface)] p-2.5 md:p-4 shadow-[3px_3px_0_var(--ink)] md:shadow-[4px_4px_0_var(--ink)]">
              {/* Presets row */}
              <div className="flex items-center gap-1.5 md:gap-2 mb-2 flex-wrap">
                <span className="text-[9px] md:text-[10px] font-bold text-[var(--tungsten-gray)] uppercase tracking-wider">PRESET:</span>
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setArenaInput(p.prompt)}
                    className="text-[10px] md:text-[11px] font-bold border border-[var(--ink)] bg-[var(--base)] px-1.5 md:px-2 py-0.5 hover:border-[var(--filament)] hover:text-[var(--filament)] transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                  className="ml-auto text-[9px] md:text-[10px] font-bold text-[var(--tungsten-gray)] hover:text-[var(--concrete)] transition-colors uppercase"
                >
                  {showSystemPrompt ? '▲ HIDE SYSTEM PROMPT' : '▼ SYSTEM PROMPT'}
                </button>
              </div>

              {/* Optional System Prompt */}
              {showSystemPrompt && (
                <div className="mb-2.5">
                  <textarea
                    rows={2}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="System instruction sent equally to both engines (e.g. 'You are an adversarial security auditor...')."
                    className="w-full brut-input text-base md:text-xs resize-none placeholder:text-[var(--tungsten-gray)]"
                  />
                </div>
              )}

              {/* Arena prompt textarea */}
              <div className="flex flex-col md:flex-row gap-2">
                <textarea
                  rows={3}
                  value={arenaInput}
                  onChange={(e) => setArenaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleRunArena();
                    }
                  }}
                  placeholder="Enter benchmark prompt to execute against Engine A and Engine B simultaneously... (Ctrl+Enter to fire)"
                  className="flex-1 brut-input text-base md:text-sm resize-none placeholder:text-[var(--tungsten-gray)] leading-relaxed"
                />

                <div className="flex md:flex-col justify-between gap-2 shrink-0">
                  <button
                    onClick={handleRunArena}
                    disabled={arenaRunning || !arenaInput.trim()}
                    className="brut-btn flex-1 md:flex-none text-xs"
                    style={{ minHeight: '44px' }}
                  >
                    {arenaRunning ? (
                      <>
                        <span className="w-2.5 h-2.5 bg-[var(--ink)] animate-ping inline-block rounded-full" />
                        RUNNING...
                      </>
                    ) : (
                      <>⚔️ FIRE ARENA ↗</>
                    )}
                  </button>

                  {arenaInput && (
                    <button
                      onClick={() => setArenaInput('')}
                      disabled={arenaRunning}
                      className="border-[2px] border-[var(--ink)] bg-[var(--surface2)] px-2.5 py-1 text-[10px] font-bold uppercase hover:text-red-400"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 text-[9px] md:text-[10px] text-[var(--tungsten-gray)]">
                <span>EST. PROMPT TOKENS: ~{estimateTokens(arenaInput)}</span>
                <span className="hidden sm:inline">SHORTCUT: CTRL+ENTER</span>
              </div>
            </div>

            {/* ── MOBILE RESULTS VIEW SELECTOR (< 768px) ── */}
            <div className="flex md:hidden items-center justify-between border-[2px] border-[var(--ink)] bg-[var(--surface2)] p-1">
              <span className="text-[10px] font-bold text-[var(--tungsten-gray)] px-1">VIEW:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMobileArenaView('both')}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase border border-[var(--ink)] ${
                    mobileArenaView === 'both' ? 'bg-[var(--filament)] text-[var(--ink)]' : 'bg-[var(--base)] text-[var(--concrete)]'
                  }`}
                >
                  STACKED
                </button>
                <button
                  onClick={() => setMobileArenaView('A')}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase border border-[var(--ink)] ${
                    mobileArenaView === 'A' ? 'bg-[var(--filament)] text-[var(--ink)]' : 'bg-[var(--base)] text-[var(--concrete)]'
                  }`}
                >
                  ENGINE A
                </button>
                <button
                  onClick={() => setMobileArenaView('B')}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase border border-[var(--ink)] ${
                    mobileArenaView === 'B' ? 'bg-blue-400 text-[var(--ink)]' : 'bg-[var(--base)] text-[var(--concrete)]'
                  }`}
                >
                  ENGINE B
                </button>
              </div>
            </div>

            {/* ── SIDE-BY-SIDE ARENA DISPLAY ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1 min-h-[340px]">
              {/* ── ENGINE A RESULTS PANE ── */}
              <div
                className={`border-[2px] md:border-[3px] border-[var(--ink)] bg-[var(--surface)] flex-col shadow-[3px_3px_0_var(--ink)] md:shadow-[4px_4px_0_var(--ink)] min-h-[260px] ${
                  mobileArenaView === 'B' ? 'hidden md:flex' : 'flex'
                }`}
              >
                {/* Pane header */}
                <div className="border-b-[2px] border-[var(--ink)] bg-[var(--base)] px-2.5 py-1.5 md:px-3 md:py-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[var(--filament)]">ENGINE A</span>
                    <span className="text-[10px] md:text-[11px] text-[var(--concrete)] font-bold truncate max-w-[200px]">
                      {PROVIDERS[engineA.provider]?.name} / {engineA.model}
                    </span>
                  </div>
                  {resA.status === 'done' && (
                    <button
                      onClick={() => handleCopy(resA.text, 'resA')}
                      className="text-[9px] md:text-[10px] border border-[var(--ink)] bg-[var(--surface2)] px-2 py-0.5 hover:text-[var(--filament)] uppercase font-bold"
                    >
                      {copiedKey === 'resA' ? 'COPIED ✓' : 'COPY'}
                    </button>
                  )}
                </div>

                {/* Telemetry bar */}
                <div className="border-b-[2px] border-[var(--ink)] bg-[var(--surface2)] px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 md:gap-2 flex-wrap text-[9px] md:text-[10px]">
                  <span className={`metric-badge ${resA.status === 'done' ? 'highlight' : ''}`}>
                    {resA.status.toUpperCase()}
                  </span>
                  {resA.status === 'done' && (
                    <>
                      <span className="metric-badge">{resA.latencyMs}ms</span>
                      <span className="metric-badge">~{resA.tokens} TOK</span>
                      <span className="metric-badge highlight">{resA.tokensPerSec} T/S</span>
                    </>
                  )}
                  {resA.status === 'running' && (
                    <span className="text-[var(--filament)] font-bold animate-pulse">TRANSMITTING REQUEST...</span>
                  )}
                </div>

                {/* Response Body */}
                <div className="flex-1 p-3 md:p-4 overflow-y-auto">
                  {resA.status === 'idle' && (
                    <div className="h-full flex items-center justify-center text-[var(--tungsten-gray)] text-xs text-center p-4">
                      Awaiting dual execution run...
                    </div>
                  )}
                  {resA.status === 'running' && (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-xs text-[var(--tungsten-gray)] py-8">
                      <div className="w-7 h-7 border-[3px] border-[var(--filament)] border-t-transparent animate-spin" />
                      <span className="uppercase font-bold tracking-wider text-[var(--filament)]">AWAITING ENGINE A</span>
                    </div>
                  )}
                  {resA.status === 'error' && (
                    <div className="border-[2px] border-red-500 bg-red-950/20 text-red-400 p-2.5 text-xs leading-relaxed">
                      <p className="font-bold mb-1">ENGINE A ERROR:</p>
                      <code>{resA.error}</code>
                    </div>
                  )}
                  {resA.status === 'done' && (
                    <div className="markdown text-xs md:text-sm leading-relaxed">
                      <ReactMarkdown>{resA.text}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Verdict Button */}
                {resA.status === 'done' && (
                  <div className="border-t-[2px] border-[var(--ink)] bg-[var(--base)] p-1.5 md:p-2">
                    <button
                      onClick={() => setArenaVerdict('A')}
                      className={`w-full py-1.5 text-[11px] md:text-xs font-bold uppercase tracking-wider border-[2px] border-[var(--ink)] transition-colors ${
                        arenaVerdict === 'A'
                          ? 'bg-[var(--filament)] text-[var(--ink)]'
                          : 'bg-[var(--surface2)] text-[var(--concrete)] hover:border-[var(--filament)] hover:text-[var(--filament)]'
                      }`}
                    >
                      {arenaVerdict === 'A' ? '🏆 ENGINE A WINS' : 'VOTE ENGINE A WINS'}
                    </button>
                  </div>
                )}
              </div>

              {/* ── ENGINE B RESULTS PANE ── */}
              <div
                className={`border-[2px] md:border-[3px] border-[var(--ink)] bg-[var(--surface)] flex-col shadow-[3px_3px_0_var(--ink)] md:shadow-[4px_4px_0_var(--ink)] min-h-[260px] ${
                  mobileArenaView === 'A' ? 'hidden md:flex' : 'flex'
                }`}
              >
                {/* Pane header */}
                <div className="border-b-[2px] border-[var(--ink)] bg-[var(--base)] px-2.5 py-1.5 md:px-3 md:py-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-blue-400">ENGINE B</span>
                    <span className="text-[10px] md:text-[11px] text-[var(--concrete)] font-bold truncate max-w-[200px]">
                      {PROVIDERS[engineB.provider]?.name} / {engineB.model}
                    </span>
                  </div>
                  {resB.status === 'done' && (
                    <button
                      onClick={() => handleCopy(resB.text, 'resB')}
                      className="text-[9px] md:text-[10px] border border-[var(--ink)] bg-[var(--surface2)] px-2 py-0.5 hover:text-blue-400 uppercase font-bold"
                    >
                      {copiedKey === 'resB' ? 'COPIED ✓' : 'COPY'}
                    </button>
                  )}
                </div>

                {/* Telemetry bar */}
                <div className="border-b-[2px] border-[var(--ink)] bg-[var(--surface2)] px-2.5 py-1 md:px-3 md:py-1.5 flex items-center gap-1.5 md:gap-2 flex-wrap text-[9px] md:text-[10px]">
                  <span className={`metric-badge ${resB.status === 'done' ? 'highlight' : ''}`}>
                    {resB.status.toUpperCase()}
                  </span>
                  {resB.status === 'done' && (
                    <>
                      <span className="metric-badge">{resB.latencyMs}ms</span>
                      <span className="metric-badge">~{resB.tokens} TOK</span>
                      <span className="metric-badge highlight">{resB.tokensPerSec} T/S</span>
                    </>
                  )}
                  {resB.status === 'running' && (
                    <span className="text-blue-400 font-bold animate-pulse">TRANSMITTING REQUEST...</span>
                  )}
                </div>

                {/* Response Body */}
                <div className="flex-1 p-3 md:p-4 overflow-y-auto">
                  {resB.status === 'idle' && (
                    <div className="h-full flex items-center justify-center text-[var(--tungsten-gray)] text-xs text-center p-4">
                      Awaiting dual execution run...
                    </div>
                  )}
                  {resB.status === 'running' && (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-xs text-[var(--tungsten-gray)] py-8">
                      <div className="w-7 h-7 border-[3px] border-blue-400 border-t-transparent animate-spin" />
                      <span className="uppercase font-bold tracking-wider text-blue-400">AWAITING ENGINE B</span>
                    </div>
                  )}
                  {resB.status === 'error' && (
                    <div className="border-[2px] border-red-500 bg-red-950/20 text-red-400 p-2.5 text-xs leading-relaxed">
                      <p className="font-bold mb-1">ENGINE B ERROR:</p>
                      <code>{resB.error}</code>
                    </div>
                  )}
                  {resB.status === 'done' && (
                    <div className="markdown text-xs md:text-sm leading-relaxed">
                      <ReactMarkdown>{resB.text}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Verdict Button */}
                {resB.status === 'done' && (
                  <div className="border-t-[2px] border-[var(--ink)] bg-[var(--base)] p-1.5 md:p-2">
                    <button
                      onClick={() => setArenaVerdict('B')}
                      className={`w-full py-1.5 text-[11px] md:text-xs font-bold uppercase tracking-wider border-[2px] border-[var(--ink)] transition-colors ${
                        arenaVerdict === 'B'
                          ? 'bg-blue-400 text-[var(--ink)]'
                          : 'bg-[var(--surface2)] text-[var(--concrete)] hover:border-blue-400 hover:text-blue-400'
                      }`}
                    >
                      {arenaVerdict === 'B' ? '🏆 ENGINE B WINS' : 'VOTE ENGINE B WINS'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tie Button in Arena Mode */}
            {resA.status === 'done' && resB.status === 'done' && (
              <div className="flex justify-center pb-2">
                <button
                  onClick={() => setArenaVerdict('TIE')}
                  className={`px-3 py-1 md:px-4 md:py-1.5 text-xs font-bold uppercase tracking-wider border-[2px] border-[var(--ink)] ${
                    arenaVerdict === 'TIE'
                      ? 'bg-[var(--concrete)] text-[var(--ink)]'
                      : 'bg-[var(--surface)] text-[var(--tungsten-gray)] hover:text-[var(--concrete)]'
                  }`}
                >
                  {arenaVerdict === 'TIE' ? '🤝 MARKED AS DEAD HEAT TIE' : '🤝 IT\'S A DEAD HEAT TIE'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
