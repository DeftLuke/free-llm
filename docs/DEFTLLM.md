# Free LLM — Setup & API Guide

**Free LLM** is a self-hosted OpenAI-compatible LLM router. It stacks free tiers from many providers behind one endpoint (`/v1/chat/completions`) and automatically fails over when a provider hits rate limits.

Fork of [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi). See [SECURITY.md](../SECURITY.md) before publishing or sharing this repo.

---

## Quick start

### 1. Run the server

```bash
git clone https://github.com/YOUR_USER/free-llm.git
cd free-llm
npm install
cp .env.example .env
# Set ENCRYPTION_KEY in .env (required)
npm run build
node server/dist/index.js
```

Open **http://localhost:3001** and create your admin account on first visit.

### 2. Get your unified API key

1. Log in to the dashboard
2. Go to **Keys**
3. Copy the **Unified API key** at the top (starts with `deftllm-` or `freellmapi-` on older installs)
4. Base URL: `http://localhost:3001/v1`

### 3. Add provider keys

On the **Keys** page, pick a provider and paste your API key. Use the links below to sign up and create keys.

### 4. Use `model: "auto"` in your apps

The router picks the best available model under current rate limits and switches providers automatically.

See `examples/python/chat_auto.py` or run:

```bash
pip install -r examples/python/requirements.txt
set DEFTLLM_API_KEY=your-unified-key-here
python examples/python/chat_auto.py
```

---

## Python example (`model: "auto"`)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.getenv("DEFTLLM_BASE_URL", "http://localhost:3001/v1"),
    api_key=os.getenv("DEFTLLM_API_KEY"),  # unified key from dashboard
)

resp = client.chat.completions.create(
    model="auto",
    messages=[{"role": "user", "content": "Hello"}],
)

print(resp.choices[0].message.content)
print("Routed via:", resp.model)
```

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DEFTLLM_BASE_URL` | `http://localhost:3001/v1` | OpenAI-compatible base URL |
| `DEFTLLM_API_KEY` | *(required)* | Unified key from **Keys** page |

---

## curl example

```bash
curl http://localhost:3001/v1/chat/completions \
  -H "Authorization: Bearer YOUR_UNIFIED_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## Provider API keys — where to sign up

Add each key on the dashboard **Keys** page. Tier **A** gives the best balance; add **B** and **C** to increase monthly token capacity.

### Tier A — start here (recommended)

| Provider | Dashboard label | Sign up / API key URL | Est. monthly tokens | Notes |
|----------|-------------------|------------------------|---------------------|-------|
| Google | Google AI Studio | https://aistudio.google.com/apikey | ~30M+ (Flash-Lite ~120M) | Gemini models, vision |
| Groq | Groq | https://console.groq.com/keys | ~15–30M | Very fast |
| OpenRouter | OpenRouter | https://openrouter.ai/keys | ~6M per free model × many | One key, 20+ free models |

### Tier B — more monthly tokens

| Provider | Dashboard label | Sign up / API key URL | Est. monthly tokens | Notes |
|----------|-------------------|------------------------|---------------------|-------|
| Mistral | Mistral | https://console.mistral.ai/api-keys/ | ~50–100M | Low RPM (2/min) |
| Cloudflare | Cloudflare Workers AI | https://dash.cloudflare.com | ~18–45M | Workers AI token |
| Cerebras | Cerebras | https://cloud.cerebras.ai | ~30M | Fast, ~1M tokens/day pool |
| GitHub | GitHub Models | https://github.com/settings/tokens | ~18M | Fine-grained PAT + Models access |
| Zhipu | Zhipu AI (Z.ai) | https://z.ai/manage-apikey/apikey-list | ~30M | GLM models |
| Ollama | Ollama Cloud | https://ollama.com/settings/keys | ~25M | Cloud models |
| HuggingFace | HuggingFace Router | https://huggingface.co/settings/tokens | ~1–3M | Inference router |
| OpenCode Zen | OpenCode Zen | https://opencode.ai/auth | Promo free models | No card |
| NVIDIA | NVIDIA NIM | https://build.nvidia.com/settings/api-keys | Eval tier | 40 RPM, eval-only ToS |
| Agnes AI | Agnes AI | https://platform.agnes-ai.com | Free promo tier | Watch for paid reversion |
| Reka | Reka | https://platform.reka.ai | Free tier | Check current limits |

### Tier C — no API key required (keyless)

Click **Add Key** on the Keys page; leave the key field empty where allowed.

| Provider | Dashboard label | Info URL | Limits |
|----------|-----------------|----------|--------|
| Kilo Gateway | Kilo Gateway (no key needed) | https://app.kilo.ai | ~200 req/hr per IP |
| Pollinations | Pollinations (no key needed) | https://pollinations.ai | 1 concurrent req/IP |
| OVH AI Endpoints | OVH AI Endpoints (no key needed) | https://endpoints.ai.cloud.ovh.net | ~2 req/min per model |
| LLM7 | LLM7 (anon ok) | https://llm7.io | ~100 req/hr anonymous |

### Custom endpoint

| Provider | Dashboard label | Notes |
|----------|-----------------|-------|
| Custom | Custom (OpenAI-compatible) | LM Studio, Ollama local, llama.cpp, vLLM — set base URL + model |

---

## Maximize monthly token usage

1. **Add many provider keys** — each provider is a separate free-tier bucket.
2. **Use `model: "auto"`** — router rotates when limits are hit.
3. **Order the Fallback Chain** (dashboard → **Models**):
   - Top: smartest models (Gemini Pro, OpenRouter frontier)
   - Middle: high-volume models (Flash-Lite, Groq, Mistral)
   - Bottom: keyless fallbacks (Kilo, Pollinations, OVH)
4. **Use smaller models** for simple tasks to preserve Pro quotas.
5. **Check Analytics** to see which providers you exhaust first.

Rough stacked capacity when fully configured: **~300M–1.7B tokens/month** depending on how many keys you add.

---

## Dashboard access

| Item | Value |
|------|-------|
| URL | http://localhost:3001 |
| Dev UI (hot reload) | http://localhost:5173 (`npm run dev`) |
| API base | http://localhost:3001/v1 |
| Admin auth | Email + password (set on first run) |
| App API auth | Unified `deftllm-…` key (Bearer or `x-api-key`) |

---

## Development commands

```bash
npm run dev          # API :3001 + UI :5173 with hot reload
npm run build        # Production build
npm test             # Run test suite
node server/dist/index.js   # Production server
```

---

## Production deployment

Use Docker Compose behind a reverse proxy or Cloudflare tunnel. Bind to `127.0.0.1` only and expose via HTTPS.

```bash
ENCRYPTION_KEY="$(openssl rand -hex 32)"
printf "ENCRYPTION_KEY=%s\nPORT=3001\nHOST_BIND=127.0.0.1\n" "$ENCRYPTION_KEY" > .env
docker compose up -d --build
```

Back up `.env` and the Docker volume — `ENCRYPTION_KEY` decrypts stored provider keys.

To copy a local setup (keys + fallback chain) to production, use the same `ENCRYPTION_KEY` on both machines and copy `server/data/freeapi.db`. See `scripts/migrate-production.example.sh` for a template (do not commit real keys or DB dumps).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `All models exhausted` | Add provider keys on **Keys** page or wait for rate limits to reset |
| `Authentication required` on `/api/*` | Log in to dashboard or pass dashboard session token |
| `401` on `/v1/*` | Use unified API key as `Authorization: Bearer …` |
| Only 4 models available | Most models need provider API keys — see tables above |
| Can't reach from another PC | Use `npm run dev:lan` or `HOST_BIND=0.0.0.0` with Docker |

---

## License

MIT (upstream FreeLLMAPI). Free LLM is a branded fork for personal use.
