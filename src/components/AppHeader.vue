<script setup>
defineProps({
  activeMode: {
    type: String,
    default: "listen"
  },
  theme: {
    type: String,
    default: "light"
  },
  text: {
    type: Object,
    default: () => ({})
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

defineEmits(["update:mode", "toggle-theme", "toggle-locale"]);
</script>

<template>
  <header class="mode-header">
    <p class="eyebrow centered">{{ text.app.eyebrow }}</p>
    <div class="header-controls">
      <div class="mode-scroll-container">
        <div class="mode-toggle">
          <button class="mode-option" :class="{ active: activeMode === 'listen' }" @click="$emit('update:mode', 'listen')">{{ text.mode.listen }}</button>
          <button class="mode-option" :class="{ active: activeMode === 'lyrics' }" @click="$emit('update:mode', 'lyrics')">{{ text.mode.lyrics }}</button>
          <button class="mode-option" :class="{ active: activeMode === 'bio' }" @click="$emit('update:mode', 'bio')">{{ text.mode.bio }}</button>
          <button class="mode-option" :class="{ active: activeMode === 'network' }" @click="$emit('update:mode', 'network')">{{ text.mode.network }}</button>
          <button class="mode-option" :class="{ active: activeMode === 'busking' }" @click="$emit('update:mode', 'busking')">{{ text.mode.busking }}</button>
        </div>
      </div>
      <div class="toggles">
        <button class="theme-toggle" @click="$emit('toggle-theme')">
          <i :class="theme === 'dark' ? 'pi pi-moon' : 'pi pi-sun'" /> {{ theme === 'dark' ? text.theme.dark : text.theme.light }}
        </button>
        <button class="theme-toggle language-toggle" @click="$emit('toggle-locale')">
          <i class="pi pi-language" /> {{ text.languageName }}
        </button>
        <button 
          class="theme-toggle admin-trigger" 
          :class="{ active: activeMode === 'admin' }"
          @click="$emit('update:mode', 'admin')"
          :title="isAdmin ? 'Admin Dashboard' : 'Admin Login'"
        >
          <i class="pi pi-shield" />
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
  width: 95vw;
  max-width: 32rem;
  justify-content: center;
  margin: 0 auto;
}

.centered {
  text-align: center;
}

.mode-scroll-container {
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  padding: 2px;
  flex: 1;
}

.mode-scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.mode-toggle {
  display: flex;
  padding: 0.4rem;
  border-radius: 999px;
  background: var(--panel-muted);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(18px);
  width: max-content;
  min-width: 100%;
}

.mode-option {
  flex: 0 0 100px; /* Fixed size for tabs */
  min-height: 3.4rem;
  padding: 0.8rem 1rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 180ms ease;
  white-space: nowrap;
  text-align: center;
}

.mode-option.active {
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  color: var(--button-text-strong);
}

.toggles {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.theme-toggle {
  min-height: 3.4rem;
  padding: 0.8rem 1.2rem;
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
  transition: all 180ms ease;
  white-space: nowrap;
}

.admin-trigger.active {
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  color: var(--button-text-strong);
  border-color: transparent;
  box-shadow: 0 4px 15px var(--accent-soft);
}

.theme-toggle:hover {
  transform: translateY(-1px);
  border-color: var(--accent);
}

@media (min-width: 700px) {
  .header-controls {
    flex-direction: row;
    align-items: center;
    max-width: none;
  }
}
</style>
