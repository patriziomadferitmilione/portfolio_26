<script setup>
import Button from "primevue/button";
import Slider from "primevue/slider";

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
  shuffleEnabled: {
    type: Boolean,
    default: false
  },
  repeatMode: {
    type: String,
    default: "off"
  },
  lyrics: {
    type: String,
    default: ""
  },
  labels: {
    type: Object,
    default: () => ({})
  }
});

defineEmits([
  "close",
  "toggle",
  "next",
  "previous",
  "toggle-shuffle",
  "cycle-repeat",
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
          <Button icon="pi pi-angle-left" text rounded @click="$emit('close')" />
          <Button icon="pi pi-ellipsis-h" text rounded />
        </div>

        <div class="player-sheet-stage">
          <div
            class="player-sheet-art"
            :style="{
              backgroundImage: track?.artworkUrl
                ? `url(${track.artworkUrl})`
                : `linear-gradient(135deg, ${(track?.accent ?? ['var(--cover-start)', 'var(--cover-mid)', 'var(--cover-end)']).join(', ')})`
            }"
          />

          <div class="player-sheet-copy">
            <h2>{{ track?.title ?? labels.noTrackSelected }}</h2>
            <p class="player-sheet-subtitle">{{ track?.artist ?? labels.artistName }}</p>
          </div>

          <div class="player-sheet-body">
            <input
              class="timeline"
              type="range"
              min="0"
              max="100"
              :value="progress"
              @input="$emit('seek', $event)"
            />
            <div class="time-row">
              <span>{{ currentTimeLabel }}</span>
              <span>{{ durationLabel }}</span>
            </div>

            <div class="control-row expanded">
              <Button
                icon="pi pi-shuffle"
                text
                rounded
                :class="{ active: shuffleEnabled }"
                @click="$emit('toggle-shuffle')"
              />
              <Button icon="pi pi-step-backward" text rounded @click="$emit('previous')" />
              <Button
                :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
                rounded
                size="large"
                :disabled="!canPlay"
                @click="$emit('toggle')"
              />
              <Button icon="pi pi-step-forward" text rounded @click="$emit('next')" />
              <Button
                :icon="repeatMode === 'one' ? 'pi pi-replay' : 'pi pi-refresh'"
                text
                rounded
                :class="{ active: repeatMode !== 'off' }"
                @click="$emit('cycle-repeat')"
              />
            </div>

            <div class="volume-row">
              <i class="pi pi-volume-up" />
              <Slider :model-value="volume" @update:model-value="$emit('volume-change', $event)" />
            </div>
          </div>
        </div>

        <div class="player-sheet-lyrics-header">
          <p class="eyebrow">{{ labels.lyrics }}</p>
          <Button icon="pi pi-times" text rounded @click="$emit('close')" />
        </div>

        <div class="lyrics-panel" v-if="lyrics">
          <div class="lyrics-body">{{ lyrics }}</div>
        </div>

        <div class="player-sheet-queue-header">
          <p class="eyebrow">{{ labels.queue }}</p>
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
              :style="{
                backgroundImage: item.artworkUrl
                  ? `url(${item.artworkUrl})`
                  : `linear-gradient(135deg, ${item.accent.join(', ')})`
              }"
            />
            <div>
              <p>{{ item.title }}</p>
              <span>{{ item.artist }}</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  </transition>
</template>
