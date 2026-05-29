<script setup>
import { ref, computed } from "vue";

defineProps({
  tracks: {
    type: Array,
    default: () => []
  },
  text: {
    type: Object,
    default: () => ({})
  }
});

const selectedTrack = ref(null);
const dragY = ref(0);
const isDragging = ref(false);

const lyricsStyle = computed(() => ({
  transform: `translateY(${dragY.value}px)`,
  transition: isDragging.value ? "none" : "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
  opacity: 1 - Math.min(dragY.value / 600, 0.5)
}));

function openLyrics(track) {
  selectedTrack.value = track;
  dragY.value = 0;
  document.body.style.overflow = "hidden";
}

function closeLyrics() {
  selectedTrack.value = null;
  dragY.value = 0;
  document.body.style.overflow = "";
}

// Interactive Swipe Logic
let startY = 0;

function onTouchStart(e) {
  startY = e.touches[0].clientY;
  isDragging.value = true;
}

function onTouchMove(e) {
  const currentY = e.touches[0].clientY;
  const delta = currentY - startY;
  
  if (delta > 0) {
    dragY.value = delta;
  }
}

function onTouchEnd() {
  isDragging.value = false;
  if (dragY.value > 150) {
    closeLyrics();
  } else {
    dragY.value = 0;
  }
}
</script>

<template>
  <div class="lyrics-container">
    <div class="lyrics-grid">
      <div 
        v-for="track in tracks" 
        :key="track.id" 
        class="lyric-card"
        @click="openLyrics(track)"
      >
        <div class="card-content">
          <span class="track-title">{{ track.title }}</span>
          <span class="track-artist">{{ track.artist }}</span>
        </div>
        <i class="pi pi-chevron-right" />
      </div>
    </div>

    <Transition name="fade-slide">
      <div 
        v-if="selectedTrack" 
        class="lyrics-overlay"
        @click.self="closeLyrics"
      >
        <div 
          class="full-screen-lyrics"
          :style="lyricsStyle"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <header class="lyrics-header">
            <div class="drag-handle" @click="closeLyrics" />
            <button class="close-btn" @click="closeLyrics">
              <i class="pi pi-times" />
            </button>
          </header>

          <div class="lyrics-body">
            <h1 class="lyrics-title">{{ selectedTrack.title }}</h1>
            <p class="lyrics-artist">{{ selectedTrack.artist }}</p>
            
            <div class="lyrics-content">
              <pre>{{ selectedTrack.lyrics || `[Mock Lyrics for ${selectedTrack.title}]\n\nWalking down the neon street\nFading shadows at my feet\nEvery echo tells a story\nOf the heartbreak and the glory.\n\n(Chorus)\nOh, the rhythm of the night\nBurning like a silver light\nHold the moment, let it stay\nTill the music fades away...` }}</pre>
            </div>          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.lyrics-container {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.lyrics-grid {
  display: grid;
  gap: 0.75rem;
}

.lyric-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease;
  backdrop-filter: blur(10px);
}

.lyric-card:hover {
  transform: translateY(-2px);
  background: var(--panel-muted);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.track-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.track-artist {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.lyric-card i {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Full Screen View */
.lyrics-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.full-screen-lyrics {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
}

.lyrics-header {
  position: sticky;
  top: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg);
  z-index: 10;
}

.drag-handle {
  width: 40px;
  height: 5px;
  background: var(--panel-border);
  border-radius: 999px;
  margin-bottom: 1rem;
  cursor: pointer;
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1px solid var(--panel-border);
  background: var(--panel-muted);
  color: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 180ms ease;
}

.lyrics-body {
  padding: 2rem 1.5rem 8rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  text-align: center;
  flex: 1;
}

.lyrics-title {
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.lyrics-artist {
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: var(--text-muted);
  margin-bottom: 4rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.lyrics-content {
  font-size: clamp(1.1rem, 4vw, 1.75rem);
  line-height: 2;
  color: var(--text);
  font-weight: 500;
}

.lyrics-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.4s ease;
}

.fade-slide-enter-from .full-screen-lyrics,
.fade-slide-leave-to .full-screen-lyrics {
  transform: translateY(100%);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .lyrics-title {
    font-size: 2rem;
  }
  .lyrics-content {
    font-size: 1.1rem;
  }
}
</style>
