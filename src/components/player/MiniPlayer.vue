<script setup>
import Button from "primevue/button";

defineProps({
  track: {
    type: Object,
    default: null
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  currentTimeLabel: {
    type: String,
    default: "0:00"
  },
  durationLabel: {
    type: String,
    default: "0:00"
  },
  progress: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(["toggle", "next", "previous", "expand"]);
</script>

<template>
  <div class="mini-player">
    <button class="mini-player-main" @click="$emit('expand')">
      <div class="mini-player-copy">
        <p class="mini-player-title">{{ track?.title ?? "No track selected" }}</p>
        <p class="mini-player-meta">{{ track?.artist ?? "Select a track" }}</p>
      </div>
      <div class="mini-player-spacer" />
      <div class="mini-player-time">
        <span>{{ currentTimeLabel }}</span>
        <span>{{ durationLabel }}</span>
      </div>
    </button>

    <div class="mini-player-controls">
      <Button icon="pi pi-step-backward" text rounded @click="$emit('previous')" />
      <Button
        :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
        rounded
        :disabled="disabled"
        @click="$emit('toggle')"
      />
      <Button icon="pi pi-step-forward" text rounded @click="$emit('next')" />
    </div>

    <div class="mini-player-progress">
      <span :style="{ width: `${progress}%` }" />
    </div>
  </div>
</template>
