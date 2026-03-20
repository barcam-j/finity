<template>
  <div class="landing">
    <header class="header">
      <span class="logo">finity</span>
      <nav class="header-nav">
        <LangSwitcher />
        <RouterLink :to="{ name: 'Login' }" class="btn-ghost">{{ t('auth.loginBtn') }}</RouterLink>
        <RouterLink :to="{ name: 'Register' }" class="btn-primary">{{ t('landing.getStarted') }}</RouterLink>
      </nav>
    </header>

    <!-- Hero: full-height split layout -->
    <section class="hero">
      <div class="hero-text">
        <span class="hero-label">{{ t('landing.heroBadge') }}</span>
        <h1 class="hero-title">{{ t('landing.heroTitle') }}</h1>
        <p class="hero-subtitle">{{ t('landing.heroSubtitle') }}</p>
        <div class="hero-ctas">
          <RouterLink :to="{ name: 'Register' }" class="btn-primary btn-lg">{{ t('landing.getStartedFree') }}</RouterLink>
          <RouterLink :to="{ name: 'Login' }" class="btn-outline btn-lg">{{ t('landing.signIn') }}</RouterLink>
        </div>
        <p class="hero-hint">{{ t('landing.heroHint') }}</p>
      </div>

      <!-- Generated SVG illustration: abstract financial dashboard -->
      <div class="hero-visual" aria-hidden="true">
        <svg viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg" class="dashboard-svg">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="oklch(0.70 0.19 42)" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="oklch(0.70 0.19 42)" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="area2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="oklch(0.60 0.14 42)" stop-opacity="0.12"/>
              <stop offset="100%" stop-color="oklch(0.60 0.14 42)" stop-opacity="0"/>
            </linearGradient>
            <clipPath id="chartClip">
              <rect x="0" y="0" width="600" height="480" rx="16"/>
            </clipPath>
          </defs>

          <!-- Background panel -->
          <rect x="0" y="0" width="600" height="480" rx="16" class="svg-panel"/>

          <!-- Subtle grid lines -->
          <g class="svg-grid" stroke-width="1">
            <line x1="40" y1="100" x2="560" y2="100"/>
            <line x1="40" y1="160" x2="560" y2="160"/>
            <line x1="40" y1="220" x2="560" y2="220"/>
            <line x1="40" y1="280" x2="560" y2="280"/>
            <line x1="40" y1="340" x2="560" y2="340"/>
          </g>

          <!-- Area chart background fill -->
          <path
            d="M40,300 C100,270 140,200 200,180 C260,160 300,230 360,200 C420,170 460,130 520,110 L520,370 L40,370 Z"
            fill="url(#area2Grad)"
          />
          <path
            d="M40,320 C80,295 130,240 200,220 C270,200 310,260 380,235 C440,215 490,170 560,150 L560,370 L40,370 Z"
            fill="url(#areaGrad)"
          />

          <!-- Main chart line -->
          <path
            d="M40,320 C80,295 130,240 200,220 C270,200 310,260 380,235 C440,215 490,170 560,150"
            fill="none"
            class="svg-line-main"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Secondary line -->
          <path
            d="M40,300 C100,270 140,200 200,180 C260,160 300,230 360,200 C420,170 460,130 520,110"
            fill="none"
            class="svg-line-secondary"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="6 4"
          />

          <!-- Data points on main line -->
          <circle cx="200" cy="220" r="4" class="svg-dot"/>
          <circle cx="380" cy="235" r="4" class="svg-dot"/>
          <circle cx="560" cy="150" r="4" class="svg-dot"/>
          <!-- Highlighted point with ring -->
          <circle cx="380" cy="235" r="8" class="svg-dot-ring" fill="none" stroke-width="1.5"/>

          <!-- KPI cards row at top -->
          <g>
            <!-- Card 1 -->
            <rect x="40" y="20" width="150" height="60" rx="8" class="svg-card"/>
            <rect x="56" y="34" width="50" height="6" rx="3" class="svg-text-muted"/>
            <rect x="56" y="48" width="90" height="10" rx="3" class="svg-text-value"/>

            <!-- Card 2 -->
            <rect x="210" y="20" width="150" height="60" rx="8" class="svg-card"/>
            <rect x="226" y="34" width="40" height="6" rx="3" class="svg-text-muted"/>
            <rect x="226" y="48" width="75" height="10" rx="3" class="svg-text-value"/>

            <!-- Card 3 -->
            <rect x="380" y="20" width="180" height="60" rx="8" class="svg-card"/>
            <rect x="396" y="34" width="55" height="6" rx="3" class="svg-text-muted"/>
            <rect x="396" y="48" width="110" height="10" rx="3" class="svg-text-value"/>
          </g>

          <!-- Tooltip at highlighted point -->
          <g>
            <rect x="298" y="196" width="110" height="46" rx="6" class="svg-tooltip"/>
            <rect x="312" y="208" width="36" height="5" rx="2" class="svg-text-muted"/>
            <rect x="312" y="220" width="68" height="9" rx="2" class="svg-text-value"/>
          </g>
          <line x1="380" y1="235" x2="380" y2="242" class="svg-tooltip-stem" stroke-width="1"/>

          <!-- Category bars at the bottom -->
          <g>
            <rect x="40" y="385" width="480" height="5" rx="2" class="svg-bar-bg"/>
            <rect x="40" y="385" width="290" height="5" rx="2" class="svg-bar-fill"/>

            <rect x="40" y="400" width="480" height="5" rx="2" class="svg-bar-bg"/>
            <rect x="40" y="400" width="180" height="5" rx="2" class="svg-bar-fill-2"/>

            <rect x="40" y="415" width="480" height="5" rx="2" class="svg-bar-bg"/>
            <rect x="40" y="415" width="340" height="5" rx="2" class="svg-bar-fill-3"/>

            <!-- Labels left -->
            <rect x="40" y="388" width="0" height="0"/>
            <rect x="540" y="383" width="40" height="7" rx="2" class="svg-text-muted"/>
            <rect x="540" y="398" width="35" height="7" rx="2" class="svg-text-muted"/>
            <rect x="540" y="413" width="38" height="7" rx="2" class="svg-text-muted"/>
          </g>
        </svg>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="section-inner">
        <h2 class="section-title">{{ t('landing.featuresTitle') }}</h2>
        <div class="feature-grid">
          <div v-for="(f, i) in features" :key="i" class="feature-card">
            <span class="feature-index">0{{ i + 1 }}</span>
            <h3>{{ t(f.titleKey) }}</h3>
            <p>{{ t(f.descKey) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-it-works">
      <div class="section-inner">
        <h2 class="section-title">{{ t('landing.howTitle') }}</h2>
        <div class="steps">
          <div v-for="(step, i) in steps" :key="i" class="step">
            <span class="step-number">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3>{{ t(step.titleKey) }}</h3>
            <p>{{ t(step.descKey) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- AI providers -->
    <section class="providers">
      <div class="section-inner">
        <p class="providers-label">{{ t('landing.providersLabel') }}</p>
        <div class="providers-list">
          <span v-for="p in providerNames" :key="p" class="provider-chip">{{ p }}</span>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-banner">
      <div class="section-inner cta-inner">
        <h2>{{ t('landing.ctaTitle') }}</h2>
        <p>{{ t('landing.ctaSubtitle') }}</p>
        <RouterLink :to="{ name: 'Register' }" class="btn-primary btn-lg">{{ t('landing.getStartedFree') }}</RouterLink>
      </div>
    </section>

    <footer class="footer">
      <span class="logo">finity</span>
      <p class="footer-copy">{{ t('landing.footerCopy') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LangSwitcher from '@/components/LangSwitcher.vue'

const { t } = useI18n()

const features = [
  { titleKey: 'landing.feat1Title', descKey: 'landing.feat1Desc' },
  { titleKey: 'landing.feat2Title', descKey: 'landing.feat2Desc' },
  { titleKey: 'landing.feat3Title', descKey: 'landing.feat3Desc' },
  { titleKey: 'landing.feat4Title', descKey: 'landing.feat4Desc' },
]

const steps = [
  { titleKey: 'landing.step1Title', descKey: 'landing.step1Desc' },
  { titleKey: 'landing.step2Title', descKey: 'landing.step2Desc' },
  { titleKey: 'landing.step3Title', descKey: 'landing.step3Desc' },
]

const providerNames = ['Google Gemini', 'Anthropic Claude', 'OpenAI', 'xAI Grok']
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}

/* ── Header ── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 3rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
  backdrop-filter: blur(8px);
}

.logo {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -0.03em;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* ── Buttons ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 1.25rem;
  background: var(--btn-bg);
  color: var(--btn-text);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
  border: none;
  cursor: pointer;
  letter-spacing: 0.01em;
}

.btn-primary:hover { background: var(--btn-hover); }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 1rem;
  color: var(--text-muted);
  border-radius: 6px;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.btn-ghost:hover {
  color: var(--text);
  background: var(--bg-hover);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 1.25rem;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}

.btn-outline:hover {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.btn-lg {
  padding: 0.85rem 2rem;
  font-size: 1rem;
}

/* ── Hero ── */
.hero {
  min-height: calc(100vh - 65px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;
  padding: 5rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hero-label {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: clamp(2.5rem, 4.5vw, 3.75rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
  color: var(--text);
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--text-muted);
  line-height: 1.65;
  margin-bottom: 2.5rem;
  max-width: 42ch;
}

.hero-ctas {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.hero-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
  letter-spacing: 0.01em;
}

/* ── SVG illustration ── */
.hero-visual {
  width: 100%;
  max-width: 560px;
  margin-left: auto;
}

.dashboard-svg {
  width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 24px 80px oklch(0 0 0 / 0.12);
}

/* SVG theme-aware classes */
.svg-panel { fill: var(--card-bg); stroke: var(--border); stroke-width: 1; }
.svg-grid  { stroke: var(--border); opacity: 0.6; }
.svg-card  { fill: var(--bg-secondary); stroke: var(--border); stroke-width: 1; }
.svg-text-muted  { fill: var(--border); }
.svg-text-value  { fill: var(--text-muted); opacity: 0.5; }
.svg-line-main      { stroke: oklch(0.70 0.19 42); }
.svg-line-secondary { stroke: oklch(0.70 0.19 42); opacity: 0.35; }
.svg-dot      { fill: oklch(0.70 0.19 42); }
.svg-dot-ring { stroke: oklch(0.70 0.19 42); opacity: 0.4; }
.svg-tooltip  { fill: var(--card-bg); stroke: var(--border); stroke-width: 1; }
.svg-tooltip-stem { stroke: var(--border); }
.svg-bar-bg     { fill: var(--border); opacity: 0.5; }
.svg-bar-fill   { fill: oklch(0.70 0.19 42); }
.svg-bar-fill-2 { fill: oklch(0.70 0.19 42); opacity: 0.6; }
.svg-bar-fill-3 { fill: oklch(0.70 0.19 42); opacity: 0.4; }

/* ── Sections ── */
.section-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 3rem;
}

.section-title {
  font-size: clamp(1.75rem, 2.5vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 3rem;
  text-align: center;
}

/* ── Features ── */
.features {
  padding: 6rem 0;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.feature-card {
  background: var(--card-bg);
  padding: 2.5rem 2rem;
  transition: background 0.15s;
}

.feature-card:hover {
  background: var(--bg-secondary);
}

.feature-index {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--accent);
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.6;
}

/* ── How it works ── */
.how-it-works {
  padding: 6rem 0;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem;
}

.step-number {
  display: block;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--accent);
  opacity: 0.25;
  line-height: 1;
  margin-bottom: 1.25rem;
}

.step h3 {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.step p {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.65;
}

/* ── Providers ── */
.providers {
  padding: 4rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  text-align: center;
}

.providers-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.providers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.provider-chip {
  padding: 0.4rem 1rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.01em;
}

/* ── CTA ── */
.cta-banner {
  padding: 8rem 0;
}

.cta-inner {
  text-align: center;
}

.cta-inner h2 {
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 1rem;
  color: var(--text);
}

.cta-inner p {
  font-size: 1.05rem;
  color: var(--text-muted);
  margin-bottom: 2.5rem;
}

/* ── Footer ── */
.footer {
  border-top: 1px solid var(--border);
  padding: 2rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-copy {
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 4rem 2rem;
    gap: 3rem;
  }

  .hero-visual { max-width: 100%; }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .steps {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .section-inner { padding: 0 2rem; }
  .header { padding: 1.25rem 2rem; }
  .footer { padding: 2rem; }
}

@media (max-width: 560px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
