import { useAuthStore } from '@/stores/auth'
import type { AiConfig, SaveAiConfigRequest } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders(): Record<string, string> {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.token ?? ''}`, 'Content-Type': 'application/json' }
}

export const aiConfigService = {
  async models(provider: string): Promise<string[]> {
    const res = await fetch(`${BASE_URL}/ai-config/models/${provider}`, { headers: authHeaders() })
    if (!res.ok) return []
    return res.json() as Promise<string[]>
  },

  async get(): Promise<AiConfig | null> {
    const res = await fetch(`${BASE_URL}/ai-config/`, { headers: authHeaders() })
    if (res.status === 404) return null
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to load AI config')
    return res.json() as Promise<AiConfig>
  },

  async save(config: SaveAiConfigRequest): Promise<AiConfig> {
    const res = await fetch(`${BASE_URL}/ai-config/`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(config),
    })
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to save AI config')
    return res.json() as Promise<AiConfig>
  },

  async setAnalysisEnabled(enabled: boolean): Promise<void> {
    const res = await fetch(`${BASE_URL}/ai-config/analysis-enabled`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ enabled }),
    })
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to update analysis setting')
  },
}
