<script setup>
defineProps({
  text: { type: Object, default: () => ({}) },
  catalogLoading: { type: Boolean, default: false },
  currentTrackId: { type: String, default: "" },
  isPlaying: { type: Boolean, default: false },
  tracks: { type: Array, default: () => [] }
});

defineEmits(["select-track", "toggle-track"]);
</script>

<template>
  <section class="music-list-page">
    <div class="music-list-shell">
      <header class="music-list-header">
        <div>
          <p class="music-list-eyebrow">{{ text.music.listen }}</p>
          <h1 class="music-list-title">{{ text.music.catalog }}</h1>
        </div>
        <div class="music-list-count">
          <strong>{{ tracks.length }}</strong>
          <span>{{ text.music.songs }}</span>
        </div>
      </header>

      <div v-if="catalogLoading" class="empty-state">{{ text.music.loadingTracks }}</div>
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
              <i :class="track.id === currentTrackId && isPlaying ? 'pi pi-pause' : 'pi pi-play'" />
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

.music-list-count {
  display: grid;
  justify-items: end;
  color: var(--text-muted);
}

.music-list-count strong {
  font-size: 1.5rem;
  color: var(--page-text);
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
  object-fit: cover;
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
  gap: 1rem;
  flex-shrink: 0;
}

.song-release,
.song-duration {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.song-action {
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-soft);
  color: var(--accent);
  cursor: pointer;
  transition: transform 180ms ease, background-color 180ms ease;
}

.song-action:hover {
  transform: scale(1.04);
  background: var(--panel-muted);
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
    align-items: flex-start;
  }

  .song-row-side {
    gap: 0;
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
