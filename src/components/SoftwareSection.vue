<script setup>
defineProps({
  text: {
    type: Object,
    default: () => ({})
  }
});

const links = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/patrizio-milione-a7a416110/",
    icon: "pi pi-link"
  },
  {
    label: "GitHub",
    href: "https://github.com/patriziomadferitmilione",
    icon: "pi pi-github"
  }
];
</script>

<template>
  <section class="software-wip">
    <div class="software-wip-card">
      <p class="software-eyebrow">{{ text.software.eyebrow }}</p>
      <h1>{{ text.software.heading }}</h1>
      <p class="software-summary">{{ text.software.summary }}</p>

      <div class="software-badge">
        <span class="software-dot" />
        <span>{{ text.software.status }}</span>
      </div>

      <div class="software-links">
        <a
          v-for="item in links"
          :key="item.label"
          class="software-link"
          :href="item.href"
          target="_blank"
          rel="noreferrer"
        >
          <span class="software-link-label">
            <i :class="item.icon" />
            <span>{{ item.label }}</span>
          </span>
          <i class="pi pi-arrow-up-right" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.software-wip {
  display: grid;
}

.software-wip-card {
  display: grid;
  gap: 1.25rem;
  padding: 1.2rem;
  border-radius: 32px;
  background:
    radial-gradient(circle at top left, var(--accent-soft), transparent 26%),
    linear-gradient(180deg, var(--panel) 0%, var(--panel-muted) 100%);
  border: 1px solid var(--panel-border);
  box-shadow: 0 24px 80px rgba(0, 48, 73, 0.12);
}

.software-eyebrow,
.software-summary {
  margin: 0;
}

.software-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  color: var(--accent);
}

.software-wip-card h1 {
  margin: 0;
  line-height: 0.95;
  font-size: clamp(2.3rem, 10vw, 4.25rem);
  max-width: 10ch;
  color: var(--page-text);
}

.software-summary {
  max-width: 44ch;
  line-height: 1.7;
  color: var(--text-muted);
}

.software-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  width: fit-content;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--page-text);
}

.software-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--accent);
}

.software-links {
  display: grid;
  gap: 0.85rem;
}

.software-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.05rem;
  border-radius: 20px;
  border: 1px solid var(--panel-border);
  background: var(--panel);
  color: var(--page-text);
  transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease;
}

.software-link:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.software-link-label {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
}

@media (min-width: 980px) {
  .software-wip-card {
    padding: 2rem;
  }
}
</style>
