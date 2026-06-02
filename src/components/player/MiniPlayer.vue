<script setup>
import { ref } from "vue";

const touchStartX = ref(0);
const touchStartY = ref(0);

defineProps({
  track: { type: Object, default: null },
  isPlaying: { type: Boolean, default: false },
  currentTimeLabel: { type: String, default: "0:00" },
  durationLabel: { type: String, default: "0:00" },
  progress: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  labels: { type: Object, default: () => ({}) }
});

const emit = defineEmits(["toggle", "next", "previous", "expand", "show", "hide"]);

function onTouchStart(event) {
  touchStartX.value = event.touches?.[0]?.clientX ?? 0;
  touchStartY.value = event.touches?.[0]?.clientY ?? 0;
}

function onTouchEnd(event) {
  const endX = event.changedTouches?.[0]?.clientX ?? touchStartX.value;
  const endY = event.changedTouches?.[0]?.clientY ?? touchStartY.value;
  const dx = endX - touchStartX.value;
  const dy = endY - touchStartY.value;
  if (Math.abs(dy) > Math.abs(dx) && dy < -40) {
    emit("expand");
  } else if (dx > 40) {
    emit("show");
  } else if (dx < -40) {
    emit("hide");
  }
}
</script>

<template>
  <div class="mp-wrap" :class="{ 'mp-hidden': hidden }">

    <!-- Collapsed tab -->
    <button
        v-if="hidden"
        class="mp-tab"
        @click="$emit('show')"
        :aria-label="labels.showPlayer || 'Show player'"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Main pill -->
    <div class="mp-pill" :class="{ 'mp-pill-hidden': hidden }">
      <!-- Progress bar at very top -->
      <div class="mp-progress-bar">
        <div class="mp-progress-fill" :style="{ width: `${progress}%` }" />
      </div>

      <!-- Content row -->
      <div class="mp-inner">
        <!-- Collapse handle -->
        <button
            class="mp-collapse-btn"
            @click="$emit('hide')"
            :aria-label="labels.hidePlayer || 'Minimise'"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Art + info (tap to expand) -->
        <button
            class="mp-track-btn"
            @click="$emit('expand')"
            @touchstart.passive="onTouchStart"
            @touchend.passive="onTouchEnd"
            :aria-label="labels.openPlayer || 'Open player'"
        >
          <div class="mp-art-wrap">
            <img
                v-if="track?.artworkUrl"
                :src="track.artworkUrl"
                :alt="`${track?.title} cover`"
                class="mp-art"
            />
            <div
                v-else
                class="mp-art mp-art-fallback"
                :style="{
                backgroundImage: `linear-gradient(135deg, ${(track?.accent ?? ['var(--cover-start)','var(--cover-end)']).join(', ')})`
              }"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 10V4l6-1v6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="3.5" cy="10" r="1.5" stroke="currentColor" stroke-width="1.2"/>
                <circle cx="9.5" cy="9" r="1.5" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </div>
            <!-- Vinyl spin ring when playing -->
            <div v-if="isPlaying" class="mp-art-spin" />
          </div>

          <div class="mp-copy">
            <p class="mp-title">{{ track?.title ?? labels.noTrackSelected ?? 'Nothing playing' }}</p>
            <p class="mp-artist">{{ track?.artist ?? labels.selectTrack ?? '—' }}</p>
          </div>
        </button>

        <!-- Time -->
        <div class="mp-time">
          <span>{{ currentTimeLabel }}</span>
        </div>

        <!-- Controls -->
        <div class="mp-controls">
          <button
              class="mp-ctrl"
              @click="$emit('previous')"
              :aria-label="labels.previous || 'Previous'"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 3v10M12 3L6 8l6 5V3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <button
              class="mp-ctrl mp-ctrl-play"
              :disabled="disabled"
              @click="$emit('toggle')"
              :aria-label="isPlaying ? (labels.pause || 'Pause') : (labels.play || 'Play')"
          >
            <svg v-if="!isPlaying" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 2.5l8 5.5-8 5.5V2.5z" fill="currentColor"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="2" width="3" height="10" rx="0.5" fill="currentColor"/>
              <rect x="8" y="2" width="3" height="10" rx="0.5" fill="currentColor"/>
            </svg>
          </button>

          <button
              class="mp-ctrl"
              @click="$emit('next')"
              :aria-label="labels.next || 'Next'"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 3v10M4 3l6 5-6 5V3z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Outer wrap ──────────────────────────────────────── */
.mp-wrap {
  --mp-surface: color-mix(in srgb, var(--panel) 92%, var(--page-text) 4%);
  --mp-surface-strong: color-mix(in srgb, var(--panel) 84%, var(--page-text) 8%);
  --mp-hover: color-mix(in srgb, var(--accent-soft) 62%, var(--panel-muted));
  --mp-track: color-mix(in srgb, var(--line-soft) 68%, transparent);
  --mp-shadow: color-mix(in srgb, var(--accent-strong) 16%, rgba(0, 0, 0, 0.22));
  position: fixed;
  bottom: 24px;
  left: 16px;
  right: 16px;
  z-index: 900;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.mp-wrap.mp-hidden {
  justify-content: flex-start;
}

/* ── Collapsed tab ───────────────────────────────────── */
.mp-tab {
  pointer-events: all;
  width: 28px;
  height: 64px;
  background: var(--mp-surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--panel-border);
  border-radius: 0 12px 12px 0;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.mp-tab:hover {
  background: var(--mp-surface-strong);
  color: var(--page-text);
}

/* ── Main pill ───────────────────────────────────────── */
.mp-pill {
  pointer-events: all;
  width: 100%;
  max-width: 480px;
  background:
      linear-gradient(180deg, color-mix(in srgb, var(--panel) 86%, transparent), var(--panel-muted)),
      var(--mp-surface);
  backdrop-filter: blur(40px) saturate(160%);
  -webkit-backdrop-filter: blur(40px) saturate(160%);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
      0 24px 48px var(--mp-shadow),
      0 8px 16px color-mix(in srgb, var(--accent-strong) 10%, transparent),
      inset 0 1px 0 color-mix(in srgb, #fff 16%, transparent);
  transition:
      transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.4s ease;
  color: var(--page-text);
}

.mp-pill-hidden {
  transform: translateX(-110%);
  opacity: 0;
  pointer-events: none;
}

/* ── Progress bar (top edge) ─────────────────────────── */
.mp-progress-bar {
  height: 2px;
  background: var(--mp-track);
  position: relative;
}

.mp-progress-fill {
  position: absolute;
  left: 0; top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-strong));
  border-radius: 0;
  transition: width 0.1s linear;
}

/* ── Inner layout ────────────────────────────────────── */
.mp-inner {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px 10px 10px;
}

/* ── Collapse arrow ──────────────────────────────────── */
.mp-collapse-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}
.mp-collapse-btn:hover {
  color: var(--page-text);
  background: var(--mp-hover);
}

/* ── Track button ────────────────────────────────────── */
.mp-track-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
  padding: 0;
  border-radius: 10px;
  transition: opacity 0.15s;
}
.mp-track-btn:hover { opacity: 0.8; }
.mp-track-btn:active { opacity: 0.6; }

/* ── Artwork ─────────────────────────────────────────── */
.mp-art-wrap {
  position: relative;
  flex-shrink: 0;
}

.mp-art {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-strong) 18%, transparent);
}

.mp-art-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: color-mix(in srgb, var(--button-text-strong) 72%, transparent);
}

.mp-art-spin {
  position: absolute;
  inset: -3px;
  border-radius: 13px;
  border: 1.5px solid transparent;
  border-top-color: var(--accent);
  border-right-color: color-mix(in srgb, var(--accent) 28%, transparent);
  animation: mp-spin 2s linear infinite;
  pointer-events: none;
}

@keyframes mp-spin {
  to { transform: rotate(360deg); }
}

/* ── Copy ────────────────────────────────────────────── */
.mp-copy { min-width: 0; }

.mp-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--page-text);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.mp-artist {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Time ────────────────────────────────────────────── */
.mp-time {
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  padding: 0 4px;
}

/* ── Controls ────────────────────────────────────────── */
.mp-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.mp-ctrl {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: color 0.15s, background 0.15s, transform 0.1s;
}
.mp-ctrl:hover {
  color: var(--page-text);
  background: var(--mp-hover);
}
.mp-ctrl:active { transform: scale(0.88); }

.mp-ctrl-play {
  width: 40px;
  height: 40px;
  background: var(--accent);
  color: var(--button-text-strong);
  border-radius: 50%;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--accent) 24%, transparent);
}
.mp-ctrl-play:hover {
  background: var(--accent-strong);
  color: var(--button-text-strong);
}
.mp-ctrl-play:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
