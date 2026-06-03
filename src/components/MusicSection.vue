<script setup>
defineProps({
  text: { type: Object, default: () => ({}) },
  catalogLoading: { type: Boolean, default: false },
  currentTrackId: { type: String, default: "" },
  isPlaying: { type: Boolean, default: false },
  shuffleEnabled: { type: Boolean, default: false },
  tracks: { type: Array, default: () => [] }
});

defineEmits(["select-track", "toggle-track", "toggle-shuffle"]);
</script>

<template>
  <section class="music-list-page">
    <div class="music-list-shell">
      <header class="music-list-header">
        <div>
          <h1 class="music-list-title">{{ text.music.music }}</h1>
        </div>
        <button
          class="shuffle-toggle"
          type="button"
          :class="{ active: shuffleEnabled }"
          :aria-label="shuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'"
          :title="shuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'"
          @click="$emit('toggle-shuffle')"
        >
          <svg class="shuffle-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 7h2.8c2.4 0 3.5 1.1 5.2 5s2.8 5 5.2 5H21" />
            <path d="M18 14l3 3-3 3" />
            <path d="M3 17h2.8c1.4 0 2.4-.4 3.2-1.4" />
            <path d="M14 8.4c.7-.9 1.7-1.4 3.2-1.4H21" />
            <path d="M18 4l3 3-3 3" />
          </svg>
        </button>
      </header>

      <div v-if="catalogLoading" class="empty-state">{{ text.music.loadingTracks }}</div>
      <div v-else-if="!tracks.length" class="empty-state">{{ text.admin.noTracksYet }}</div>
      <div v-else class="songs">
        <button
          v-for="track in tracks"
          :key="track.id"
          class="song-row"
          :class="{ active: track.id === currentTrackId }"
          @click="$emit('select-track', track.id)"
        >
          <div class="song-row-main">
            <div class="song-cover">
              <img v-if="track.artworkUrl" :src="track.artworkUrl" :alt="`${track.title} cover`" class="song-cover-image" />
              <div v-else class="song-cover-fallback" :style="{ backgroundImage: `linear-gradient(135deg, ${track.accent.join(', ')})` }" />
            </div>

            <div class="song-copy">
              <p class="song-title">{{ track.title }}</p>
              <p class="song-meta">{{ track.artist }}</p>
            </div>
          </div>

          <div class="song-row-side">
            <p class="song-release">{{ track.releaseTitle }}</p>
            <p class="song-duration">{{ track.durationLabel }}</p>
            <button
              class="song-action"
              :aria-label="track.id === currentTrackId && isPlaying ? 'Pause track' : 'Play track'"
              @click.stop="$emit('toggle-track', track.id)"
            >
              <span
                class="song-action-icon"
                :class="track.id === currentTrackId && isPlaying ? 'pause' : 'play'"
                aria-hidden="true"
              />
            </button>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.music-list-page {
  display: grid;
}

.music-list-shell {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 32px;
  background:
    radial-gradient(circle at top left, var(--accent-soft), transparent 24%),
    linear-gradient(180deg, var(--panel) 0%, var(--panel-muted) 100%);
  border: 1px solid var(--panel-border);
  box-shadow: 0 24px 80px rgba(0, 48, 73, 0.12);
}

.music-list-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line-soft);
}

.music-list-eyebrow,
.music-list-title,
.music-list-count,
.song-title,
.song-meta,
.song-release,
.song-duration {
  margin: 0;
}

.music-list-eyebrow {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.music-list-title {
  margin-top: 0.35rem;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  line-height: 0.96;
  color: var(--page-text);
}

.shuffle-toggle {
  width: 3.25rem;
  height: 3.25rem;
  flex: 0 0 auto;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  background: var(--panel-muted);
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease, color 180ms ease;
}

.shuffle-toggle.active {
  color: var(--page-text);
  background: var(--accent-soft);
  border-color: color-mix(in srgb, var(--accent) 40%, var(--panel-border));
}

.shuffle-toggle:hover {
  transform: translateY(-1px);
}

.shuffle-icon {
  width: 1.35rem;
  height: 1.35rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.songs {
  display: grid;
}

.song-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.9rem 0;
  border: 0;
  border-bottom: 1px solid var(--line-soft);
  background: transparent;
  color: var(--page-text);
  text-align: left;
  cursor: pointer;
  transition: transform 180ms ease, background-color 180ms ease;
}

.song-row:last-child {
  border-bottom: 0;
}

.song-row:hover {
  transform: translateX(4px);
}

.song-row.active {
  background: linear-gradient(90deg, var(--accent-soft), transparent 65%);
}

.song-row-main {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  gap: 0.9rem;
  min-width: 0;
}

.song-cover {
  width: 64px;
  height: 64px;
}

.song-cover-image,
.song-cover-fallback {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 18px;
}

.song-cover-image {
  object-fit: contain;
  background: var(--panel-muted);
}

.song-cover-fallback {
  box-shadow: inset 0 0 0 1px var(--panel-border);
}

.song-copy {
  min-width: 0;
}

.song-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--page-text);
}

.song-meta {
  margin-top: 0.2rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-row-side {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
}

.song-release,
.song-duration {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.song-action {
  width: 2.65rem;
  height: 2.65rem;
  border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--panel) 62%, transparent), transparent),
    var(--accent-soft);
  color: var(--accent);
  cursor: pointer;
  line-height: 1;
  box-shadow: 0 10px 24px color-mix(in srgb, var(--accent) 16%, transparent);
  transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.song-action:hover {
  transform: scale(1.04);
  background: var(--panel-muted);
  border-color: color-mix(in srgb, var(--accent) 42%, var(--panel-border));
  box-shadow: 0 14px 30px color-mix(in srgb, var(--accent) 20%, transparent);
}

.song-action-icon {
  position: relative;
  display: block;
  width: 1rem;
  height: 1rem;
}

.song-action-icon.play {
  width: 0;
  height: 0;
  margin-left: 0.16rem;
  border-top: 0.42rem solid transparent;
  border-bottom: 0.42rem solid transparent;
  border-left: 0.68rem solid currentColor;
}

.song-action-icon.pause::before,
.song-action-icon.pause::after {
  content: "";
  position: absolute;
  top: 0.12rem;
  width: 0.28rem;
  height: 0.76rem;
  border-radius: 999px;
  background: currentColor;
}

.song-action-icon.pause::before {
  left: 0.24rem;
}

.song-action-icon.pause::after {
  right: 0.24rem;
}

@media (max-width: 699px) {
  .music-list-shell {
    padding: 0.9rem;
    border-radius: 26px;
  }

  .music-list-header {
    align-items: center;
  }

  .song-row {
    align-items: center;
  }

  .song-row-side {
    gap: 0;
    align-self: center;
  }

  .song-release,
  .song-duration {
    display: none;
  }
}

@media (min-width: 980px) {
  .music-list-shell {
    padding: 1.4rem;
  }

  .song-row {
    padding: 1rem 0;
  }

  .song-row-main {
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 1rem;
  }

  .song-cover {
    width: 72px;
    height: 72px;
  }
}
</style>
