<template>
  <div class="provider-guide">
    <!-- Gemini -->
    <template v-if="provider === 'gemini'">
      <p class="guide-title">How to get your Gemini API key</p>
      <ol class="guide-steps">
        <li>
          Go to
          <a href="https://aistudio.google.com" target="_blank" rel="noopener">aistudio.google.com</a>
          and sign in with your Google account
        </li>
        <li>Click <strong>Get API key</strong> in the left sidebar</li>
        <li>Click <strong>Create API key</strong> and select or create a project</li>
        <li>Copy the generated key and paste it below</li>
      </ol>
      <p class="guide-note">Free tier available — no credit card required.</p>
    </template>

    <!-- Anthropic -->
    <template v-if="provider === 'anthropic'">
      <p class="guide-title">How to get your Anthropic API key</p>
      <ol class="guide-steps">
        <li>
          Go to
          <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a>
          and create an account or sign in
        </li>
        <li>Go to <strong>Settings → API Keys</strong></li>
        <li>Click <strong>Create Key</strong>, give it a name and copy it</li>
        <li>Add at least <strong>$5 of credits</strong> under <strong>Settings → Billing</strong> to activate API access</li>
        <li>Paste the key below</li>
      </ol>
      <p class="guide-note">Recommended model: <code>claude-3-5-haiku-20241022</code> — fast and very cheap (~$0.001 per import).</p>
    </template>

    <!-- OpenAI -->
    <template v-if="provider === 'openai'">
      <p class="guide-title">How to get your OpenAI API key</p>
      <ol class="guide-steps">
        <li>
          Go to
          <a href="https://platform.openai.com" target="_blank" rel="noopener">platform.openai.com</a>
          and create an account or sign in
        </li>
        <li>Click your profile icon (top right) → <strong>API keys</strong></li>
        <li>Click <strong>Create new secret key</strong>, give it a name and copy it</li>
        <li>Add credits under <strong>Settings → Billing</strong> to activate API access</li>
        <li>Paste the key below</li>
      </ol>
      <p class="guide-note">Recommended model: <code>gpt-4o-mini</code> — best balance of speed and cost.</p>
    </template>

    <!-- xAI -->
    <template v-if="provider === 'xai'">
      <p class="guide-title">How to get your xAI (Grok) API key</p>
      <ol class="guide-steps">
        <li>
          Go to
          <a href="https://console.x.ai" target="_blank" rel="noopener">console.x.ai</a>
          and sign in with your X (Twitter) account
        </li>
        <li>Go to <strong>API Keys</strong> in the left sidebar</li>
        <li>Click <strong>Create API Key</strong>, give it a name and copy it</li>
        <li>Add credits under <strong>Billing</strong> to activate API access</li>
        <li>Paste the key below</li>
      </ol>
      <p class="guide-note">Recommended model: <code>xai/grok-2-mini</code> — faster and cheaper than Grok-2.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  provider: string
}>()
</script>

<style scoped>
.provider-guide {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem 1.1rem;
  font-size: 0.875rem;
}

.guide-title {
  margin: 0 0 0.75rem;
  font-weight: 600;
  color: var(--text);
}

.guide-steps {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
  color: var(--text);
  line-height: 1.8;
}

.guide-steps a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.guide-note {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.guide-note code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.1rem 0.35rem;
  font-size: 0.8rem;
  font-family: monospace;
}
</style>
