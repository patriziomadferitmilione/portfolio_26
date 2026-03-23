<script setup>
import { ref } from "vue";
import Button from "primevue/button";

const touchStartX = ref(0);

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
  },
  hidden: {
    type: Boolean,
    default: false
  },
  labels: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["toggle", "next", "previous", "expand", "show", "hide"]);

function onTouchStart(event) {
  touchStartX.value = event.touches?.[0]?.clientX ?? 0;
}

function onTouchEnd(event) {
  const endX = event.changedTouches?.[0]?.clientX ?? touchStartX.value;
  const delta = endX - touchStartX.value;
  if (delta > 40) {
    emit("show");
  } else if (delta < -40) {
    emit("hide");
  }
}
</script>

<template>
  <div class="mini-player" :class="{ hidden }">
    <button class="mini-player-handle" @click="hidden ? $emit('show') : $emit('hide')">
      <i :class="hidden ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" />
    </button>

    <button
      class="mini-player-main"
      @click="$emit('expand')"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="mini-player-copy">
        <p class="mini-player-title">{{ track?.title ?? labels.noTrackSelected }}</p>
        <p class="mini-player-meta">{{ track?.artist ?? labels.selectTrack }}</p>
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
