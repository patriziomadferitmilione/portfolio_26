<script setup>
import { computed, ref } from "vue";

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
  }
});

const emit = defineEmits(["toggle-theme", "toggle-locale", "open-login"]);

const menuOpen = ref(false);

const flagSrc = computed(() => {
  const svg = props.locale === "en"
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" stroke-width="4"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="10"/><path d="M30 0v40M0 20h60" stroke="#C8102E" stroke-width="6"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><rect width="60" height="40" fill="#fff"/><rect width="20" height="40" fill="#00935B"/><rect x="40" width="20" height="40" fill="#D81E05"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
});

function closeMenu() {
  menuOpen.value = false;
}

function handleThemeToggle() {
  emit("toggle-theme");
  closeMenu();
}

function handleLocaleToggle() {
  emit("toggle-locale");
  closeMenu();
}

function handleLoginOpen() {
  emit("open-login");
  closeMenu();
}
</script>

<template>
  <header class="mode-header">
    <button
      class="menu-trigger"
      :class="{ open: menuOpen }"
      type="button"
      :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="menuOpen"
      @click="menuOpen = !menuOpen"
    >
      <i class="pi pi-bars" />
    </button>

    <p class="eyebrow centered site-title" :class="{ hidden: menuOpen }">{{ text.app.eyebrow }}</p>

    <transition name="menu-pop">
      <div v-if="menuOpen" class="menu-panel">
        <button
          class="menu-item"
          type="button"
          :aria-label="theme === 'dark' ? text.theme.light : text.theme.dark"
          :title="theme === 'dark' ? text.theme.light : text.theme.dark"
          @click="handleThemeToggle"
        >
          <i :class="theme === 'dark' ? 'pi pi-moon' : 'pi pi-sun'" />
        </button>

        <button
          class="menu-item"
          type="button"
          :aria-label="text.languageName"
          :title="text.languageName"
          @click="handleLocaleToggle"
        >
          <img class="flag-icon" :src="flagSrc" alt="" aria-hidden="true" />
        </button>

        <button
          class="menu-item"
          type="button"
          :aria-label="text.auth.login"
          :title="text.auth.login"
          @click="handleLoginOpen"
        >
          <i class="pi pi-user" />
        </button>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.mode-header {
  position: relative;
  display: grid;
  gap: 0.9rem;
  justify-items: center;
  margin-bottom: 1.5rem;
  padding-top: 0.25rem;
}

.centered {
  text-align: center;
}

.site-title.hidden {
  opacity: 0;
  visibility: hidden;
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
</style>
