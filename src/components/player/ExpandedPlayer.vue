<script setup>
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";
import Slider from "primevue/slider";
import Tag from "primevue/tag";

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  track: {
    type: Object,
    default: null
  },
  releaseTitle: {
    type: String,
    default: ""
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  canPlay: {
    type: Boolean,
    default: false
  },
  volume: {
    type: Number,
    default: 80
  },
  progress: {
    type: Number,
    default: 0
  },
  currentTimeLabel: {
    type: String,
    default: "0:00"
  },
  durationLabel: {
    type: String,
    default: "0:00"
  },
  queue: {
    type: Array,
    default: () => []
  },
  activeTrackId: {
    type: String,
    default: ""
  },
  lyrics: {
    type: String,
    default: ""
  }
});

defineEmits([
  "close",
  "toggle",
  "next",
  "previous",
  "volume-change",
  "seek",
  "select-track"
]);
</script>

<template>
  <transition name="player-sheet">
    <div v-if="open" class="player-sheet">
      <button class="player-sheet-backdrop" @click="$emit('close')" />

      <section class="player-sheet-panel">
        <div class="player-sheet-header">
          <div>
            <p class="eyebrow">Now Playing</p>
            <h2>{{ track?.title ?? "No track selected" }}</h2>
            <p class="player-sheet-subtitle">{{ track?.artist ?? "Patrizio Milione" }}</p>
          </div>
          <Button icon="pi pi-times" text rounded @click="$emit('close')" />
        </div>

        <div class="player-sheet-grid">
          <div class="player-sheet-stage">
            <div
              class="player-sheet-art"
              :style="{ backgroundImage: `linear-gradient(135deg, ${(track?.accent ?? ['var(--cover-start)', 'var(--cover-mid)', 'var(--cover-end)']).join(', ')})` }"
            >
              <div class="player-sheet-overlay">
                <Tag :value="track?.mood ?? 'Unreleased'" severity="contrast" />
                <p>{{ releaseTitle || "Release loading..." }}</p>
              </div>
            </div>

            <div class="player-sheet-body">
              <div class="time-row">
                <span>{{ currentTimeLabel }}</span>
                <span>{{ durationLabel }}</span>
              </div>
              <input
                class="timeline"
                type="range"
                min="0"
                max="100"
                :value="progress"
                @input="$emit('seek', $event)"
              />
              <ProgressBar :value="progress" :showValue="false" class="progress" />

              <div class="control-row">
                <Button icon="pi pi-step-backward" text rounded @click="$emit('previous')" />
                <Button
                  :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
                  rounded
                  size="large"
                  :disabled="!canPlay"
                  @click="$emit('toggle')"
                />
                <Button icon="pi pi-step-forward" text rounded @click="$emit('next')" />
              </div>

              <div class="volume-row">
                <i class="pi pi-volume-up" />
                <Slider :model-value="volume" @update:model-value="$emit('volume-change', $event)" />
              </div>
              <div class="lyrics-panel" v-if="lyrics">
                <p class="eyebrow">Lyrics</p>
                <div class="lyrics-body">{{ lyrics }}</div>
              </div>
            </div>
          </div>

          <aside class="player-sheet-queue">
            <div class="player-sheet-queue-header">
              <p class="eyebrow">Queue</p>
              <span>{{ queue.length }} tracks</span>
            </div>

            <div class="player-sheet-queue-list">
              <button
                v-for="item in queue"
                :key="item.id"
                class="player-sheet-queue-item"
                :class="{ active: item.id === activeTrackId }"
                @click="$emit('select-track', item.id)"
              >
                <div
                  class="player-sheet-queue-art"
                  :style="{ backgroundImage: `linear-gradient(135deg, ${item.accent.join(', ')})` }"
                />
                <div>
                  <p>{{ item.title }}</p>
                  <span>{{ item.artist }}</span>
                </div>
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  </transition>
</template>
