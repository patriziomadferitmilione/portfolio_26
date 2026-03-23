<script setup>
defineProps({
  text: {
    type: Object,
    default: () => ({})
  },
  projects: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <section class="mode-page">
    <section class="hero solo-hero">
      <div class="hero-copy wide-copy">
        <p class="eyebrow">{{ text.software.eyebrow }}</p>
        <h1>{{ text.software.heading }}</h1>
        <p class="hero-text">{{ text.software.summary }}</p>
      </div>
    </section>
    <section class="software-grid">
      <a v-for="project in projects" :key="project.title" class="project-card" :href="project.href" target="_blank" rel="noreferrer">
        <div class="card-icon-wrap"><i :class="project.icon" class="card-icon" /></div>
        <p class="project-type">{{ project.type }}</p>
        <h3>{{ project.title }}</h3>
        <p>{{ project.summary }}</p>
        <div class="stack-list"><span v-for="item in project.stack" :key="item">{{ item }}</span></div>
      </a>
    </section>
  </section>
</template>

<style scoped>
.mode-page {
  display: grid;
  gap: 2rem;
}

.hero,
.software-grid {
  display: grid;
}

.hero {
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

.hero-copy,
.project-card,
.wide-copy {
  border-radius: 28px;
}

.hero-copy,
.project-card {
  backdrop-filter: blur(18px);
  background: var(--panel);
  border: 1px solid var(--panel-border);
  box-shadow: 0 24px 80px rgba(0, 48, 73, 0.12);
}

.solo-hero {
  grid-template-columns: 1fr;
}

.wide-copy {
  max-width: 100%;
}

.hero-copy {
  padding: 1.1rem;
}

.eyebrow,
.project-type {
  margin: 0 0 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  color: var(--accent);
}

.hero h1 {
  margin: 0;
  line-height: 0.95;
  font-size: clamp(2.3rem, 10vw, 4.25rem);
  max-width: 11ch;
}

.hero-text,
.project-card p {
  color: var(--text-muted);
}

.software-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

.project-card {
  display: block;
  padding: 1.1rem;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.card-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.9rem;
  border-radius: 999px;
  background: var(--accent-soft);
}

.card-icon {
  font-size: 1rem;
  color: var(--accent-strong);
}

.project-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.project-card h3 {
  margin: 0;
}

.stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1rem;
}

.stack-list span {
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--page-text);
  font-size: 0.85rem;
}

@media (min-width: 700px) {
  .software-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 980px) {
  .hero {
    grid-template-columns: 1.08fr 0.92fr;
  }

  .hero-copy {
    padding: 2rem;
  }

  .software-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .project-card {
    padding: 1.4rem;
  }
}
</style>
