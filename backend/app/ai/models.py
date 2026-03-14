import httpx
import time

_cache: dict[str, tuple[list[str], float]] = {}  # provider -> (models, fetched_at)
_CACHE_TTL = 3600  # 1 hour

# Fallback lists when provider API is unreachable or unsupported
DEFAULTS: dict[str, list[str]] = {
    'anthropic': [
        'claude-sonnet-4-6',
        'claude-opus-4-6',
        'claude-haiku-4-5-20251001',
    ],
    'openai': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    'gemini': [
        'gemini/gemini-2.0-flash',
        'gemini/gemini-2.0-flash-lite',
        'gemini/gemini-1.5-flash',
    ],
    'mistral': ['mistral/mistral-large-latest', 'mistral/mistral-small-latest'],
    'groq': ['groq/llama-3.3-70b-versatile', 'groq/llama-3.1-8b-instant'],
    'xai': ['xai/grok-2', 'xai/grok-2-mini'],
    'ollama': ['ollama/llama3.2', 'ollama/mistral', 'ollama/phi3'],
}

# Providers with OpenAI-compatible /v1/models endpoint
_OPENAI_COMPAT = {
    'openai': ('https://api.openai.com', None),
    'mistral': ('https://api.mistral.ai', 'mistral/'),
    'groq': ('https://api.groq.com/openai', 'groq/'),
    'xai': ('https://api.x.ai', 'xai/'),
}


async def _fetch_openai_compat(api_key: str, base_url: str, prefix: str | None) -> list[str]:
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(
            f'{base_url}/v1/models',
            headers={'Authorization': f'Bearer {api_key}'},
        )
        res.raise_for_status()
        models = [m['id'] for m in res.json().get('data', [])]
        if prefix:
            models = [f'{prefix}{m}' if not m.startswith(prefix) else m for m in models]
        return sorted(models)


async def _fetch_gemini(api_key: str) -> list[str]:
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(
            f'https://generativelanguage.googleapis.com/v1beta/models?key={api_key}',
        )
        res.raise_for_status()
        models = [
            f"gemini/{m['name'].split('/')[-1]}"
            for m in res.json().get('models', [])
            if 'generateContent' in m.get('supportedGenerationMethods', [])
        ]
        return sorted(models)


async def _fetch_ollama() -> list[str]:
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.get('http://localhost:11434/api/tags')
        res.raise_for_status()
        return [f"ollama/{m['name']}" for m in res.json().get('models', [])]


async def fetch_models(provider: str, api_key: str) -> list[str]:
    """Fetch available models from the provider API, with in-memory cache. Falls back to defaults."""
    cached, fetched_at = _cache.get(provider, (None, 0))
    if cached and (time.time() - fetched_at) < _CACHE_TTL:
        return cached

    try:
        if provider in _OPENAI_COMPAT:
            base_url, prefix = _OPENAI_COMPAT[provider]
            models = await _fetch_openai_compat(api_key, base_url, prefix)
        elif provider == 'gemini':
            models = await _fetch_gemini(api_key)
        elif provider == 'ollama':
            models = await _fetch_ollama()
        else:
            return DEFAULTS.get(provider, [])

        _cache[provider] = (models, time.time())
        return models
    except Exception:
        return DEFAULTS.get(provider, [])
