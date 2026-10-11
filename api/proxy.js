export const config = {
  runtime: 'edge'
};

const ALLOWED_HOSTS = new Set([
  'generativelanguage.googleapis.com',
  'router.bynara.id',
  'api.anthropic.com',
  'integrate.api.nvidia.com',
  'api.bytez.com',
  'api.cohere.com',
  'api.openai.com',
  'api.groq.com',
  'api.mistral.ai',
  'api.deepseek.com',
  'api.cerebras.ai',
  'api.together.xyz',
  'api.perplexity.ai',
  'openrouter.ai',
  'api.x.ai',
  'api.fireworks.ai',
  'api.novita.ai',
  'api.ai21.com',
  'api-inference.huggingface.co'
]);

export default async function handler(req) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version, x-target-url',
      },
    });
  }

  const targetUrl = req.headers.get('x-target-url');
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing x-target-url header.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid target URL.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Prevent SSRF: only allow verified LLM endpoints
  if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) {
    return new Response(JSON.stringify({ error: 'Target host is not permitted by proxy.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Forward request headers
  const forwardHeaders = new Headers();
  req.headers.forEach((val, key) => {
    const lower = key.toLowerCase();
    if (!['host', 'x-target-url', 'connection'].includes(lower)) {
      forwardHeaders.set(key, val);
    }
  });

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : null;

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    const responseHeaders = new Headers(upstreamRes.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy forwarding failed: ' + err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
