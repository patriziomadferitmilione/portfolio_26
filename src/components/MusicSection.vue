<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Tag from "primevue/tag";

defineProps({
  text: { type: Object, default: () => ({}) },
  musicTab: { type: String, default: "listen" },
  statusMessage: { type: String, default: "" },
  catalogLoading: { type: Boolean, default: false },
  currentTrack: { type: Object, default: null },
  currentRelease: { type: Object, default: null },
  currentTrackId: { type: String, default: "" },
  tracks: { type: Array, default: () => [] },
  releases: { type: Array, default: () => [] },
  platformLinks: { type: Array, default: () => [] },
  isAuthenticated: { type: Boolean, default: false },
  user: { type: Object, default: null },
  loginError: { type: String, default: "" },
  loginForm: { type: Object, default: () => ({}) },
  authLoading: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  uploadBusy: { type: Boolean, default: false },
  uploadCategory: { type: String, default: "audio" },
  trackForm: { type: Object, default: () => ({}) },
  releaseForm: { type: Object, default: () => ({}) },
  mediaAssets: { type: Array, default: () => [] },
  adminBusy: { type: Boolean, default: false },
  currentLyrics: { type: String, default: "" }
});

defineEmits([
  "set-tab",
  "open-file-picker",
  "files-selected",
  "toggle-playback",
  "previous",
  "next",
  "seek",
  "select-track",
  "submit-login",
  "logout",
  "refresh-admin",
  "open-media-picker",
  "media-selected",
  "submit-track",
  "submit-release",
  "edit-track",
  "edit-release",
  "remove-track",
  "remove-release"
]);
</script>

<template>
  <section class="mode-page music-page">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">{{ text.music.eyebrow }}</p>
        <h1>{{ text.music.heading }}</h1>
        <p class="hero-text">{{ text.music.summary }}</p>
        <div class="hero-actions">
          <button class="action-link action-link-primary" @click="$emit('set-tab', 'listen')">{{ text.music.listen }}</button>
          <button class="action-link action-link-contrast" @click="$emit('set-tab', 'releases')">{{ text.music.releases }}</button>
          <button class="action-link action-link-contrast" @click="$emit('set-tab', 'admin')">{{ text.music.admin }}</button>
          <Button :label="text.music.importTracks" icon="pi pi-upload" text @click="$emit('open-file-picker')" />
        </div>
        <input class="hidden-input" type="file" accept="audio/*" multiple @change="$emit('files-selected', $event)" />
        <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>
      </div>

    </section>

    <nav class="subnav">
      <button class="subnav-item" :class="{ active: musicTab === 'listen' }" @click="$emit('set-tab', 'listen')"><i class="pi pi-headphones" /><span>{{ text.music.listen }}</span></button>
      <button class="subnav-item" :class="{ active: musicTab === 'releases' }" @click="$emit('set-tab', 'releases')"><i class="pi pi-disc" /><span>{{ text.music.releases }}</span></button>
      <button class="subnav-item" :class="{ active: musicTab === 'admin' }" @click="$emit('set-tab', 'admin')"><i class="pi pi-lock" /><span>{{ text.music.admin }}</span></button>
    </nav>

    <section v-if="musicTab === 'listen'" class="minimal-music-grid">
      <Card class="panel listening-panel">
        <template #title>{{ text.music.catalog }}</template>
        <template #content>
          <div v-if="catalogLoading" class="empty-state">{{ text.music.loadingTracks }}</div>
          <div v-else class="track-grid">
            <button v-for="track in tracks" :key="track.id" class="track-card" :class="{ active: track.id === currentTrackId }" @click="$emit('select-track', track.id)">
              <div class="track-art" :style="{ backgroundImage: `linear-gradient(135deg, ${track.accent.join(', ')})` }" />
              <div class="track-copy">
                <p class="track-title">{{ track.title }}</p>
                <p class="track-meta">{{ track.artist }}</p>
              </div>
              <Tag :value="track.visibility" :severity="track.visibility === 'public' ? 'success' : 'warn'" />
            </button>
          </div>
        </template>
      </Card>
      <Card class="panel quiet-panel">
        <template #title>{{ text.music.links }}</template>
        <template #content>
          <div class="platform-list minimal-platform-list">
            <a v-for="item in platformLinks" :key="item.label" class="platform-card minimal-platform-card" :href="item.href" target="_blank" rel="noreferrer">
              <strong class="platform-label"><i :class="item.icon" class="section-icon" /><span>{{ item.label }}</span></strong>
              <span>{{ item.note }}</span>
            </a>
          </div>
        </template>
      </Card>
    </section>

    <section v-else-if="musicTab === 'releases'" class="release-grid">
      <Card v-for="release in releases" :key="release.id" class="panel release-card">
        <template #title><div class="panel-title"><i class="pi pi-disc section-icon" /><span>{{ release.title }}</span></div></template>
        <template #content>
          <p class="release-meta">{{ release.format }} · {{ release.visibility }}</p>
          <p>{{ release.notes }}</p>
          <div class="release-track-list">
            <div v-for="track in release.tracks" :key="track.id" class="release-track-row">
              <span>{{ track.title }}</span>
              <button class="text-action" @click="$emit('select-track', track.id)">{{ text.music.cue }}</button>
            </div>
          </div>
        </template>
      </Card>
    </section>

    <section v-else class="admin-grid">
      <Card class="panel">
        <template #title><div class="panel-title"><i class="pi pi-user section-icon" /><span>{{ isAuthenticated ? text.auth.adminSession : text.auth.adminLogin }}</span></div></template>
        <template #content>
          <div v-if="isAuthenticated" class="session-box">
            <p class="session-name">{{ user?.displayName }}</p>
            <p class="session-role">{{ user?.email }} · {{ user?.role }}</p>
            <div class="form-actions">
              <Button :label="text.auth.refreshAdminData" icon="pi pi-refresh" text @click="$emit('refresh-admin')" />
              <Button :label="text.auth.logout" icon="pi pi-sign-out" severity="contrast" @click="$emit('logout')" />
            </div>
          </div>
          <form v-else class="form-grid" @submit.prevent="$emit('submit-login')">
            <label class="form-field"><span>Email</span><input v-model="loginForm.email" type="email" /></label>
            <label class="form-field"><span>Password</span><input v-model="loginForm.password" type="password" /></label>
            <p v-if="loginError" class="form-error">{{ loginError }}</p>
            <Button :label="authLoading ? text.auth.signingIn : text.auth.login" icon="pi pi-lock-open" :disabled="authLoading" type="submit" />
          </form>
        </template>
      </Card>
    </section>
  </section>
</template>

<style scoped>
.mode-page {
  display: grid;
  gap: 2rem;
}

.subnav,
.release-grid,
.admin-grid {
  display: grid;
}

.hero,
.minimal-music-grid,
.platform-list,
.release-track-list,
.form-grid,
.admin-lists,
.release-track-row,
.admin-item,
.form-actions,
.inline-actions {
  display: grid;
}

.hero {
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: stretch;
}

.hero-copy,
.panel,
.hero-player,
.release-card {
  border-radius: 28px;
}

.hero-copy,
.hero-player,
.panel {
  backdrop-filter: blur(18px);
  background: var(--panel);
  border: 1px solid var(--panel-border);
  box-shadow: 0 24px 80px rgba(0, 48, 73, 0.12);
}

.music-page .hero-copy,
.music-page .hero-player,
.music-page .panel {
  box-shadow: none;
}

.hero-copy {
  padding: 1.1rem;
}

.hero h1 {
  margin: 0;
  line-height: 0.95;
  font-size: clamp(2.3rem, 10vw, 4.25rem);
  max-width: 11ch;
}

.hero-text,
.platform-card span,
.release-meta,
.session-role,
.status-message,
.form-error,
.admin-item p,
.track-meta {
  color: var(--text-muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
  flex-direction: column;
}

.action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0.75rem 1.1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 600;
  width: 100%;
}

.action-link-primary {
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  color: var(--button-text-strong);
}

.action-link-contrast {
  border-color: var(--panel-border);
  background: var(--panel-muted);
}

.hero-player {
  overflow: hidden;
  min-height: 100%;
}

.hero-player-launch {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.cover-art {
  min-height: 240px;
  padding: 1rem;
}

.cover-overlay {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 208px;
  border-radius: 22px;
  padding: 1rem;
  background: linear-gradient(180deg, rgba(0, 48, 73, 0.05), rgba(0, 48, 73, 0.4));
}

.cover-overlay h2,
.cover-overlay p {
  margin: 0;
}

.cover-note,
.release-meta,
.session-role,
.status-message,
.form-error,
.admin-item p {
  color: var(--text-muted);
}

.subnav {
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.subnav-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3rem;
  border-radius: 999px;
  border: 1px solid var(--panel-border);
  background: var(--panel-muted);
  color: inherit;
}

.subnav-item.active {
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  color: var(--button-text-strong);
}

.minimal-music-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

.track-grid {
  display: grid;
  gap: 0.9rem;
}

.track-card {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 0.85rem;
  align-items: center;
  width: 100%;
  padding: 0.8rem;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: var(--panel-muted);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.track-card:hover,
.track-card.active {
  transform: translateY(-2px);
  border-color: var(--accent);
  background: var(--accent-soft);
}

.music-page .track-card {
  background: transparent;
  border-radius: 14px;
}

.music-page .track-card:hover,
.music-page .track-card.active {
  transform: none;
  background: var(--accent-soft);
  border-color: var(--panel-border);
}

.track-art {
  width: 56px;
  height: 56px;
  border-radius: 16px;
}

.track-copy {
  min-width: 0;
}

.track-title {
  margin: 0 0 0.35rem;
}

.platform-list {
  gap: 0.9rem;
  flex-direction: column;
}

.minimal-platform-list {
  gap: 0;
}

.platform-card,
.music-section-card {
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  border-radius: 18px;
  background: var(--panel-muted);
  border: 1px solid var(--panel-border);
  transition: border-color 180ms ease, transform 180ms ease;
}

.minimal-platform-card {
  padding: 0.9rem 0;
  border-radius: 0;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line-soft);
}

.minimal-platform-card:last-child {
  border-bottom: 0;
}

.platform-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.release-grid,
.admin-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

.release-track-list {
  gap: 0.75rem;
}

.release-track-row,
.admin-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--line-soft);
}

.release-track-row:last-child,
.admin-item:last-child {
  border-bottom: 0;
}

.form-grid {
  gap: 0.75rem;
}

.form-field {
  display: grid;
  gap: 0.4rem;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border-radius: 14px;
  border: 1px solid var(--panel-border);
  background: var(--panel-muted);
  color: inherit;
}

.span-full {
  grid-column: 1 / -1;
}

.form-actions,
.inline-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.session-box {
  display: grid;
  gap: 0.75rem;
}

.session-name,
.admin-list-title {
  margin: 0;
  font-weight: 700;
}

.text-action {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--accent-strong);
  cursor: pointer;
}

.text-action.danger {
  color: var(--red-800);
}

.admin-lists {
  gap: 1.25rem;
}

.music-notes {
  display: grid;
  gap: 1rem;
}

.artist-note {
  margin: 0;
  max-width: 44ch;
  line-height: 1.7;
}

.minimal-sections-list {
  display: grid;
  gap: 1rem;
}

.minimal-section-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line-soft);
}

.minimal-section-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.minimal-section-item h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
}

@media (min-width: 700px) {
  .hero-actions {
    flex-direction: row;
  }

  .action-link {
    width: auto;
  }

  .track-grid,
  .release-grid,
  .admin-grid {
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

  .cover-art {
    min-height: 320px;
    padding: 1.25rem;
  }

  .cover-overlay {
    min-height: 292px;
    padding: 1.25rem;
  }

  .music-page .cover-art {
    min-height: 280px;
  }

  .music-page .cover-overlay {
    min-height: 252px;
  }

  .track-card {
    grid-template-columns: 72px 1fr auto;
    gap: 1rem;
  }

  .track-art {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }
}
</style>

