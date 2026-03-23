<script setup>
defineProps({
  activeMode: {
    type: String,
    default: "music"
  },
  theme: {
    type: String,
    default: "light"
  },
  text: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(["update:mode", "toggle-theme", "toggle-locale"]);
</script>

<template>
  <header class="mode-header">
    <p class="eyebrow centered">{{ text.app.eyebrow }}</p>
    <div class="header-controls">
      <div class="mode-toggle">
        <button class="mode-option" :class="{ active: activeMode === 'software' }" @click="$emit('update:mode', 'software')">{{ text.mode.software }}</button>
        <button class="mode-option" :class="{ active: activeMode === 'music' }" @click="$emit('update:mode', 'music')">{{ text.mode.music }}</button>
      </div>
      <div class="toggles">
        <button class="theme-toggle" @click="$emit('toggle-theme')">
          <i :class="theme === 'dark' ? 'pi pi-moon' : 'pi pi-sun'" /> {{ theme === 'dark' ? text.theme.dark : text.theme.light }} {{ text.theme.mode }}
        </button>
        <button class="theme-toggle language-toggle" @click="$emit('toggle-locale')">
          <i class="pi pi-language" /> {{ text.languageName }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.mode-header {
  display: grid;
  gap: 0.9rem;
  justify-items: center;
  margin-bottom: 1.5rem;
}

.header-controls {
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 32rem;
  justify-content: center;
}

.centered {
  text-align: center;
}

.mode-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0.4rem;
  border-radius: 999px;
  background: var(--panel-muted);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(18px);
}

.mode-option {
  min-height: 3.4rem;
  padding: 0.8rem 1.4rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, transform 180ms ease;
}

.mode-option.active {
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  color: var(--button-text-strong);
}

.toggles {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}

.theme-toggle {
  min-height: 3.4rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  background: var(--panel-muted);
  color: inherit;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
}

@media (min-width: 700px) {
  .header-controls {
    flex-direction: row;
    align-items: center;
    max-width: none;
  }
}
</style>
