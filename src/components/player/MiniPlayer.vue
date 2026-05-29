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
                backgroundImage: `linear-gradient(135deg, ${(track?.accent ?? ['#1a1a2e','#0f3460']).join(', ')})`
              }"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 10V4l6-1v6" stroke="rgba(255,255,255,0.5)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="3.5" cy="10" r="1.5" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>
                <circle cx="9.5" cy="9" r="1.5" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>
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
  background: rgba(20, 20, 26, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 0 12px 12px 0;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.mp-tab:hover {
  background: rgba(30, 30, 38, 0.95);
  color: #fff;
}

/* ── Main pill ───────────────────────────────────────── */
.mp-pill {
  pointer-events: all;
  width: 100%;
  max-width: 480px;
  background: rgba(16, 16, 22, 0.92);
  backdrop-filter: blur(40px) saturate(160%);
  -webkit-backdrop-filter: blur(40px) saturate(160%);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
      0 24px 48px rgba(0, 0, 0, 0.4),
      0 8px 16px rgba(0, 0, 0, 0.3),
      inset 0 0.5px 0 rgba(255, 255, 255, 0.1);
  transition:
      transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.4s ease;
  color: #fff;
}

.mp-pill-hidden {
  transform: translateX(-110%);
  opacity: 0;
  pointer-events: none;
}

/* ── Progress bar (top edge) ─────────────────────────── */
.mp-progress-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  position: relative;
}

.mp-progress-fill {
  position: absolute;
  left: 0; top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
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
  color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}
.mp-collapse-btn:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.06);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.mp-art-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mp-art-spin {
  position: absolute;
  inset: -3px;
  border-radius: 13px;
  border: 1.5px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.4);
  border-right-color: rgba(255, 255, 255, 0.15);
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
  color: #fff;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.mp-artist {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Time ────────────────────────────────────────────── */
.mp-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
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
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: color 0.15s, background 0.15s, transform 0.1s;
}
.mp-ctrl:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}
.mp-ctrl:active { transform: scale(0.88); }

.mp-ctrl-play {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-radius: 50%;
}
.mp-ctrl-play:hover {
  background: rgba(255, 255, 255, 0.2);
}
.mp-ctrl-play:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>