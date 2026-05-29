<script setup>
import Button from "primevue/button";
import Slider from "primevue/slider";

defineProps({
  open: { type: Boolean, default: false },
  track: { type: Object, default: null },
  releaseTitle: { type: String, default: "" },
  isPlaying: { type: Boolean, default: false },
  canPlay: { type: Boolean, default: false },
  volume: { type: Number, default: 80 },
  progress: { type: Number, default: 0 },
  currentTimeLabel: { type: String, default: "0:00" },
  durationLabel: { type: String, default: "0:00" },
  queue: { type: Array, default: () => [] },
  activeTrackId: { type: String, default: "" },
  shuffleEnabled: { type: Boolean, default: false },
  repeatMode: { type: String, default: "off" },
  lyrics: { type: String, default: "" },
  labels: { type: Object, default: () => ({}) }
});

defineEmits([
  "close", "toggle", "next", "previous",
  "toggle-shuffle", "cycle-repeat",
  "volume-change", "seek", "select-track"
]);
</script>

<template>
  <transition name="player-sheet">
    <div v-if="open" class="ps-root">
      <button class="ps-backdrop" @click="$emit('close')" />

      <section class="ps-panel">

        <!-- Dynamic background blur from artwork -->
        <div
            class="ps-bg-art"
            :style="{
            backgroundImage: track?.artworkUrl
              ? `url(${track.artworkUrl})`
              : `linear-gradient(135deg, ${(track?.accent ?? ['#1a1a2e','#16213e','#0f3460']).join(', ')})`
          }"
        />
        <div class="ps-bg-overlay" />

        <!-- Header -->
        <div class="ps-header">
          <button class="ps-icon-btn" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 10h10M5 10l4-4M5 10l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="ps-header-label">{{ releaseTitle || labels.nowPlaying || 'Now Playing' }}</span>
          <button class="ps-icon-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="5" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>

        <!-- Artwork -->
        <div class="ps-artwork-wrap">
          <div
              class="ps-artwork"
              :class="{ playing: isPlaying }"
              :style="{
              backgroundImage: track?.artworkUrl
                ? `url(${track.artworkUrl})`
                : `linear-gradient(135deg, ${(track?.accent ?? ['#1a1a2e','#0f3460']).join(', ')})`
            }"
          >
            <div v-if="!track?.artworkUrl" class="ps-artwork-note">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M18 34V14l22-4v20" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="14" cy="34" r="4" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
                <circle cx="36" cy="30" r="4" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Track info -->
        <div class="ps-track-info">
          <h2 class="ps-track-title">{{ track?.title ?? labels.noTrackSelected ?? 'No track selected' }}</h2>
          <p class="ps-track-artist">{{ track?.artist ?? labels.artistName ?? '—' }}</p>
        </div>

        <!-- Seek bar -->
        <div class="ps-seek-wrap">
          <div class="ps-seek-track" @click="(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            $emit('seek', { target: { value: pct } });
          }">
            <div class="ps-seek-fill" :style="{ width: `${progress}%` }" />
            <div class="ps-seek-thumb" :style="{ left: `${progress}%` }" />
          </div>
          <div class="ps-time-row">
            <span>{{ currentTimeLabel }}</span>
            <span>{{ durationLabel }}</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="ps-controls">
          <button
              class="ps-ctrl-btn ps-ctrl-sm"
              :class="{ 'ps-ctrl-active': shuffleEnabled }"
              @click="$emit('toggle-shuffle')"
              :title="labels.shuffle || 'Shuffle'"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6h2a4 4 0 0 1 3.2 1.6L10 10m-1.8 2.4A4 4 0 0 0 11.4 14H14l1 1-1 1h-2.6a6 6 0 0 1-4.8-2.4L5 12H3m9-6h2l1 1-1 1h-2a4 4 0 0 0-3.2 1.6L7.4 12A6 6 0 0 1 2.6 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle v-if="shuffleEnabled" cx="17" cy="6" r="1.5" fill="currentColor"/>
            </svg>
          </button>

          <button class="ps-ctrl-btn ps-ctrl-md" @click="$emit('previous')" :title="labels.previous || 'Previous'">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M6 5v12M16 5L8 11l8 6V5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button
              class="ps-ctrl-btn ps-ctrl-play"
              :disabled="!canPlay"
              @click="$emit('toggle')"
              :title="isPlaying ? (labels.pause || 'Pause') : (labels.play || 'Play')"
          >
            <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5l12 7-12 7V5z" fill="currentColor"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
              <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
            </svg>
          </button>

          <button class="ps-ctrl-btn ps-ctrl-md" @click="$emit('next')" :title="labels.next || 'Next'">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M16 5v12M6 5l8 6-8 6V5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button
              class="ps-ctrl-btn ps-ctrl-sm"
              :class="{ 'ps-ctrl-active': repeatMode !== 'off' }"
              @click="$emit('cycle-repeat')"
              :title="labels.repeat || 'Repeat'"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 7h12M4 7l2-2M4 7l2 2m10 6H4m12 0-2 2m2-2-2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <text v-if="repeatMode === 'one'" x="10" y="12" text-anchor="middle" fill="currentColor" font-size="6" font-weight="bold">1</text>
            </svg>
          </button>
        </div>

        <!-- Volume -->
        <div class="ps-volume-row">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 5.5h2.5L8 2v12L4.5 10.5H2v-5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
          <div class="ps-volume-slider">
            <div class="ps-volume-fill" :style="{ width: `${volume}%` }" />
            <input
                type="range" min="0" max="100"
                :value="volume"
                @input="$emit('volume-change', +$event.target.value)"
                class="ps-range"
            />
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 5.5h2.5L8 2v12L4.5 10.5H2v-5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M10 4a4 4 0 0 1 0 8M11.5 5.8a2 2 0 0 1 0 4.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- Lyrics -->
        <template v-if="lyrics">
          <div class="ps-section-header">
            <span class="ps-eyebrow">{{ labels.lyrics || 'Lyrics' }}</span>
          </div>
          <div class="ps-lyrics">
            <p>{{ lyrics }}</p>
          </div>
        </template>

        <!-- Queue -->
        <div class="ps-section-header">
          <span class="ps-eyebrow">{{ labels.queue || 'Up Next' }}</span>
          <span class="ps-queue-count">{{ queue.length }} tracks</span>
        </div>

        <div class="ps-queue">
          <button
              v-for="item in queue"
              :key="item.id"
              class="ps-queue-item"
              :class="{ active: item.id === activeTrackId }"
              @click="$emit('select-track', item.id)"
          >
            <div
                class="ps-queue-art"
                :style="{
                backgroundImage: item.artworkUrl
                  ? `url(${item.artworkUrl})`
                  : `linear-gradient(135deg, ${item.accent?.join(', ') ?? '#333, #555'})`
              }"
            />
            <div class="ps-queue-meta">
              <p class="ps-queue-title">{{ item.title }}</p>
              <span class="ps-queue-artist">{{ item.artist }}</span>
            </div>
            <div v-if="item.id === activeTrackId" class="ps-queue-playing">
              <span /><span /><span />
            </div>
          </button>
        </div>

      </section>
    </div>
  </transition>
</template>

<style scoped>
/* ── Root & Backdrop ─────────────────────────────────── */
.ps-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.ps-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  cursor: pointer;
}

/* ── Panel ───────────────────────────────────────────── */
.ps-panel {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 28px 28px 0 0;
  background: rgba(12, 12, 16, 0.92);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-top: 0.5px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding-bottom: 40px;

  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

/* ── Dynamic blurred background art ─────────────────── */
.ps-bg-art {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(80px) saturate(200%);
  opacity: 0.25;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
}

.ps-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
      to bottom,
      rgba(12, 12, 16, 0.3) 0%,
      rgba(12, 12, 16, 0.85) 60%,
      rgba(12, 12, 16, 0.98) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.ps-panel > * { position: relative; z-index: 2; }

/* ── Header ──────────────────────────────────────────── */
.ps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 8px;
}

.ps-header-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.ps-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}
.ps-icon-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.ps-icon-btn:active { transform: scale(0.94); }

/* ── Artwork ─────────────────────────────────────────── */
.ps-artwork-wrap {
  padding: 20px 32px;
  display: flex;
  justify-content: center;
}

.ps-artwork {
  width: 100%;
  aspect-ratio: 1;
  max-width: 300px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
      0 32px 64px rgba(0, 0, 0, 0.5),
      0 8px 24px rgba(0, 0, 0, 0.3),
      inset 0 0 0 0.5px rgba(255, 255, 255, 0.1);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
}

.ps-artwork.playing {
  transform: scale(1.04);
  box-shadow:
      0 40px 80px rgba(0, 0, 0, 0.6),
      0 12px 32px rgba(0, 0, 0, 0.4),
      inset 0 0 0 0.5px rgba(255, 255, 255, 0.15);
}

/* ── Track Info ──────────────────────────────────────── */
.ps-track-info {
  text-align: center;
  padding: 0 24px 8px;
}

.ps-track-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ps-track-artist {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* ── Seek Bar ────────────────────────────────────────── */
.ps-seek-wrap {
  padding: 16px 28px 4px;
}

.ps-seek-track {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 8px;
}

.ps-seek-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #fff;
  border-radius: 2px;
  transition: width 0.1s linear;
  pointer-events: none;
}

.ps-seek-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  pointer-events: none;
  transition: transform 0.15s ease, left 0.1s linear;
}

.ps-seek-track:hover .ps-seek-thumb { transform: translate(-50%, -50%) scale(1); }

.ps-time-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

/* ── Controls ────────────────────────────────────────── */
.ps-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 8px;
  gap: 8px;
}

.ps-ctrl-btn {
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color 0.15s, background 0.15s, transform 0.1s;
  flex-shrink: 0;
}
.ps-ctrl-btn:hover { color: #fff; }
.ps-ctrl-btn:active { transform: scale(0.9); }

.ps-ctrl-sm {
  width: 40px; height: 40px;
}
.ps-ctrl-md {
  width: 48px; height: 48px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
}
.ps-ctrl-md:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }

.ps-ctrl-play {
  width: 68px;
  height: 68px;
  background: #fff;
  color: #0c0c10;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}
.ps-ctrl-play:hover {
  background: #f0f0f0;
  box-shadow: 0 12px 32px rgba(255, 255, 255, 0.25);
  transform: scale(1.04);
}
.ps-ctrl-play:active { transform: scale(0.95); }
.ps-ctrl-play:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
  box-shadow: none;
}

.ps-ctrl-active { color: #fff !important; }
.ps-ctrl-active svg { filter: drop-shadow(0 0 6px rgba(255,255,255,0.6)); }

/* ── Volume ──────────────────────────────────────────── */
.ps-volume-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 28px 24px;
  color: rgba(255, 255, 255, 0.3);
}

.ps-volume-slider {
  flex: 1;
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}

.ps-volume-fill {
  position: absolute;
  left: 0; top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  pointer-events: none;
  transition: width 0.05s;
}

.ps-range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

/* ── Section headers ─────────────────────────────────── */
.ps-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 12px;
}

.ps-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.ps-queue-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}

/* ── Lyrics ──────────────────────────────────────────── */
.ps-lyrics {
  margin: 0 20px 28px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 0.5px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
}
.ps-lyrics p {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.55);
  white-space: pre-wrap;
  margin: 0;
}

/* ── Queue ───────────────────────────────────────────── */
.ps-queue {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ps-queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  width: 100%;
}
.ps-queue-item:hover { background: rgba(255, 255, 255, 0.06); }
.ps-queue-item.active { background: rgba(255, 255, 255, 0.08); }

.ps-queue-art {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ps-queue-meta { flex: 1; min-width: 0; }
.ps-queue-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ps-queue-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.ps-queue-item.active .ps-queue-title { color: #fff; }

/* ── Animated playing bars ───────────────────────────── */
.ps-queue-playing {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  flex-shrink: 0;
}
.ps-queue-playing span {
  display: block;
  width: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1.5px;
  animation: ps-bar 0.8s ease-in-out infinite alternate;
}
.ps-queue-playing span:nth-child(1) { height: 8px; animation-delay: 0s; }
.ps-queue-playing span:nth-child(2) { height: 14px; animation-delay: 0.2s; }
.ps-queue-playing span:nth-child(3) { height: 10px; animation-delay: 0.4s; }

@keyframes ps-bar {
  from { transform: scaleY(0.4); }
  to { transform: scaleY(1); }
}

/* ── Transition ──────────────────────────────────────── */
.player-sheet-enter-active {
  transition: opacity 0.3s ease;
}
.player-sheet-enter-active .ps-panel {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.player-sheet-leave-active {
  transition: opacity 0.25s ease;
}
.player-sheet-leave-active .ps-panel {
  transition: transform 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.player-sheet-enter-from,
.player-sheet-leave-to {
  opacity: 0;
}
.player-sheet-enter-from .ps-panel,
.player-sheet-leave-to .ps-panel {
  transform: translateY(100%);
}
</style>