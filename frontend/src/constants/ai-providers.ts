export interface AiProvider {
  value: string
  label: string
}

export const AI_PROVIDERS: AiProvider[] = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI (GPT)' },
  { value: 'gemini', label: 'Google (Gemini)' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'groq', label: 'Groq' },
  { value: 'xai', label: 'xAI (Grok)' },
  { value: 'ollama', label: 'Ollama (local)' },
]

export const PROVIDERS_WITH_GUIDE = ['gemini', 'anthropic', 'openai', 'xai']
