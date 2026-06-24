<script setup>
import { computed } from "vue";

const props = defineProps({
  theme: {
    type: String,
    default: "light"
  },
  locale: {
    type: String,
    default: "en"
  },
  text: {
    type: Object,
    default: () => ({})
  },
  epkMenuOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["toggle-theme", "toggle-locale", "open-login", "toggle-epk-menu"]);

const nameParts = computed(() => {
  const [firstName = "", ...rest] = String(props.text.app?.eyebrow ?? "").split(" ");
  return {
    firstName,
    lastName: rest.join(" ")
  };
});

const flagSrc = computed(() => {
  const svg = props.locale === "en"
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" stroke-width="4"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="10"/><path d="M30 0v40M0 20h60" stroke="#C8102E" stroke-width="6"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><rect width="60" height="40" fill="#fff"/><rect width="20" height="40" fill="#00935B"/><rect x="40" width="20" height="40" fill="#D81E05"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
});

</script>

<template>
  <header class="mode-header">
    <button
      class="menu-trigger"
      type="button"
      :class="{ open: epkMenuOpen }"
      :aria-label="epkMenuOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="epkMenuOpen"
      @click="emit('toggle-epk-menu')"
    >
      <i class="pi pi-bars" />
    </button>

    <div class="site-title" :aria-label="text.app.eyebrow">
      <div class="site-title-copy">
        <p class="site-title-name">
          <strong>{{ nameParts.firstName }}</strong>
          <span>{{ nameParts.lastName }}</span>
        </p>
        <p class="site-title-subtitle">{{ text.music.eyebrow }}</p>
      </div>
    </div>

    <div class="desktop-controls" aria-label="Site controls">
      <button type="button" :aria-label="theme === 'dark' ? text.theme.light : text.theme.dark" :title="theme === 'dark' ? text.theme.light : text.theme.dark" @click="emit('toggle-theme')">
        <i :class="theme === 'dark' ? 'pi pi-moon' : 'pi pi-sun'" />
      </button>
      <button type="button" :aria-label="text.languageName" :title="text.languageName" @click="emit('toggle-locale')">
        <img class="flag-icon" :src="flagSrc" alt="" aria-hidden="true" />
      </button>
      <button type="button" :aria-label="text.auth.login" :title="text.auth.login" @click="emit('open-login')">
        <i class="pi pi-user" />
      </button>
    </div>

  </header>
</template>

<style scoped>
.mode-header {
  position: relative;
  display: grid;
  gap: 0.9rem;
  justify-items: center;
  margin-bottom: 2.5rem;
  padding-top: 0.5rem;
}

.site-title.hidden {
  opacity: 0;
  visibility: hidden;
}

.site-title {
  display: inline-flex;
  align-items: center;
  gap: 1.15rem;
  min-height: 7rem;
  max-width: calc(100% - 4.8rem);
  color: var(--page-text);
  transition: opacity 180ms ease, visibility 180ms ease, transform 180ms ease;
}

.site-title-icons {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.58rem;
  color: var(--accent);
}

.site-title-icons i:first-child {
  font-size: 2rem;
  color: var(--accent-strong);
}

.site-title-icons i:last-child {
  font-size: 2.65rem;
}

.site-title-copy {
  display: grid;
  gap: 0.12rem;
  text-align: left;
}

.site-title-name,
.site-title-subtitle {
  margin: 0;
}

.site-title-name {
  display: flex;
  align-items: baseline;
  gap: 0.68rem;
  font-size: clamp(3.2rem, 8vw, 6.2rem);
  line-height: 1;
  letter-spacing: 0;
}

.site-title-name span {
  font-weight: 500;
  color: var(--text-muted);
}

.site-title-name strong {
  font-weight: 850;
  color: var(--page-text);
}

.site-title-subtitle {
  font-size: clamp(0.82rem, 1.35vw, 1.08rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--accent-strong) 82%, var(--text-muted));
}

@media (max-width: 430px) {
  .mode-header {
    justify-items: start;
    margin-bottom: 1.6rem;
    padding-right: 4.25rem;
  }

  .site-title {
    max-width: 100%;
    min-height: 4.4rem;
    gap: 0.62rem;
  }

  .site-title-icons {
    gap: 0.24rem;
  }

  .site-title-icons i:first-child {
    font-size: 1.15rem;
  }

  .site-title-icons i:last-child {
    font-size: 1.45rem;
  }

  .site-title-name {
    flex-wrap: wrap;
    column-gap: 0.34rem;
    row-gap: 0.08rem;
    font-size: clamp(1.95rem, 10vw, 2.7rem);
  }

  .site-title-subtitle {
    font-size: 0.76rem;
  }
}

@media (min-width: 431px) and (max-width: 759px) {
  .mode-header {
    justify-items: start;
    margin-bottom: 0;
    padding: 0.55rem 4.75rem 0.55rem 1rem;
    min-height: 52px;
  }

  .site-title {
    min-height: 2.4rem;
    max-width: 100%;
  }

  .site-title-name {
    font-size: 1.7rem;
  }

  .site-title-subtitle {
    display: none;
  }
}

.menu-trigger {
  position: absolute;
  top: 0;
  right: 0;
  width: 3.4rem;
  height: 3.4rem;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  background: var(--panel-muted);
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
}

.menu-trigger.open {
  transform: rotate(90deg) scale(1.04);
}

.menu-panel {
  position: absolute;
  top: 0.25rem;
  right: 4rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.menu-item {
  width: 3.4rem;
  height: 3.4rem;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  background: var(--panel-muted);
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
}

.flag-icon {
  width: 1.7rem;
  height: 1.7rem;
  display: block;
  object-fit: cover;
  border-radius: 50%;
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateX(0.4rem) scale(0.92);
}

/* EPK app-bar treatment */
.mode-header {
  margin-bottom: 0;
  padding: 1.25rem 5rem;
  border-bottom: 1px solid var(--line-soft);
  background: var(--ivory);
}

.site-title {
  min-height: 0;
  max-width: 100%;
  color: var(--ink);
}

.site-title-copy {
  text-align: center;
}

.site-title-name {
  font-family: Oswald, Impact, sans-serif;
  font-size: clamp(2.3rem, 5vw, 4.8rem);
  font-weight: 600;
  line-height: 0.88;
  letter-spacing: -0.025em;
  text-transform: uppercase;
}

.site-title-name strong,
.site-title-name span {
  font-weight: 600;
  color: var(--ink);
}

.site-title-subtitle {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: var(--burgundy);
}

.desktop-controls {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.desktop-controls button {
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--line-soft);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.desktop-controls button:hover {
  border-color: var(--burgundy);
  color: var(--burgundy);
}

@media (min-width: 760px) {
  .menu-trigger {
    display: none;
  }
}

@media (max-width: 759px) {
  .mode-header {
    justify-items: start;
    min-height: 52px;
    padding: 0.55rem 4.75rem 0.55rem 1rem;
  }

  .site-title {
    min-height: 2.4rem;
  }

  .site-title-name {
    font-size: 1.7rem;
  }

  .site-title-subtitle,
  .desktop-controls {
    display: none;
  }

  .menu-trigger {
    top: 0.55rem;
    right: 1rem;
    width: 2.4rem;
    height: 2.4rem;
  }
}
</style>
