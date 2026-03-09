<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { storeToRefs } from "pinia";

import Button from "primevue/button";
import Card from "primevue/card";
import ProgressBar from "primevue/progressbar";
import Slider from "primevue/slider";
import Tag from "primevue/tag";

import { usePlayerStore } from "./stores/player";

const player = usePlayerStore();
const {
  tracks,
  currentTrack,
  currentTrackId,
  isPlaying,
  currentTime,
  volume,
  canPlayCurrent
} = storeToRefs(player);

const audioRef = ref(null);
const fileInputRef = ref(null);

const formattedDuration = computed(() => formatTime(currentTrack.value?.duration ?? 0));
const formattedTime = computed(() => formatTime(currentTime.value));
const progress = computed(() => {
  const duration = currentTrack.value?.duration ?? 0;
  if (!duration) {
    return 0;
  }

  return Math.min(100, Math.round((currentTime.value / duration) * 100));
});

watch(
  () => currentTrack.value?.streamUrl,
  (streamUrl) => {
    const audio = audioRef.value;
    if (!audio) {
      return;
    }

    audio.pause();
    player.setPlaying(false);
    audio.src = streamUrl ?? "";
    audio.load();
  }
);

watch(volume, (value) => {
  if (audioRef.value) {
    audioRef.value.volume = value / 100;
  }
}, { immediate: true });

async function togglePlayback() {
  const audio = audioRef.value;
  if (!audio || !currentTrack.value?.streamUrl) {
    return;
  }

  if (audio.paused) {
    await audio.play();
    player.setPlaying(true);
    return;
  }

  audio.pause();
  player.setPlaying(false);
}

function handleTimeUpdate() {
  if (!audioRef.value) {
    return;
  }

  player.setCurrentTime(audioRef.value.currentTime);
}

function handleLoadedMetadata() {
  if (!audioRef.value || !currentTrack.value) {
    return;
  }

  currentTrack.value.duration = Math.round(audioRef.value.duration || currentTrack.value.duration);
}

function handleEnded() {
  player.playNext();
}

function openFilePicker() {
  fileInputRef.value?.click();
}

function onFilesSelected(event) {
  const files = event.target.files;
  if (!files?.length) {
    return;
  }

  player.importLocalFiles(files);
  event.target.value = "";
}

function seekTrack(event) {
  const audio = audioRef.value;
  const duration = currentTrack.value?.duration ?? 0;
  if (!audio || !duration) {
    return;
  }

  const ratio = Number(event.target.value) / 100;
  audio.currentTime = duration * ratio;
  player.setCurrentTime(audio.currentTime);
}

function formatTime(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

onBeforeUnmount(() => {
  const audio = audioRef.value;
  if (audio) {
    audio.pause();
  }
});
</script>

<template>
  <div class="app-shell">
    <audio
      ref="audioRef"
      preload="metadata"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @ended="handleEnded"
    />

    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Portfolio 2026</p>
        <h1>Music-first website with a streaming core.</h1>
        <p class="hero-text">
          This first pass focuses on your listening experience: featured releases,
          queue management, local demo uploads, and a player surface ready to be
          wired to signed streaming URLs later.
        </p>
        <div class="hero-actions">
          <Button label="Import local tracks" icon="pi pi-upload" @click="openFilePicker" />
          <Button
            label="Play current"
            icon="pi pi-play"
            severity="contrast"
            variant="outlined"
            :disabled="!canPlayCurrent"
            @click="togglePlayback"
          />
        </div>
        <input
          ref="fileInputRef"
          class="hidden-input"
          type="file"
          accept="audio/*"
          multiple
          @change="onFilesSelected"
        />
      </div>

      <Card class="hero-player">
        <template #content>
          <div
            class="cover-art"
            :style="{
              background: `linear-gradient(135deg, ${currentTrack?.accent?.[0] ?? 'var(--cover-start)'}, ${currentTrack?.accent?.[1] ?? 'var(--cover-mid)'}, ${currentTrack?.accent?.[2] ?? 'var(--cover-end)'})`
            }"
          >
            <div class="cover-overlay">
              <Tag :value="currentTrack?.mood ?? 'Unreleased'" severity="contrast" />
              <div>
                <p class="cover-label">Now cueing</p>
                <h2>{{ currentTrack?.title ?? "No track selected" }}</h2>
                <p>{{ currentTrack?.artist ?? "Patrizio Milione" }}</p>
              </div>
            </div>
          </div>

          <div class="player-body">
            <div class="time-row">
              <span>{{ formattedTime }}</span>
              <span>{{ formattedDuration }}</span>
            </div>
            <input
              class="timeline"
              type="range"
              min="0"
              max="100"
              :value="progress"
              @input="seekTrack"
            />
            <ProgressBar :value="progress" :showValue="false" class="progress" />

            <div class="control-row">
              <Button icon="pi pi-step-backward" text rounded @click="player.playPrevious()" />
              <Button
                :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
                rounded
                size="large"
                :disabled="!canPlayCurrent"
                @click="togglePlayback"
              />
              <Button icon="pi pi-step-forward" text rounded @click="player.playNext()" />
            </div>

            <div class="volume-row">
              <i class="pi pi-volume-up" />
              <Slider
                :model-value="volume"
                @update:model-value="player.setVolume($event)"
              />
            </div>

            <p v-if="!canPlayCurrent" class="player-note">
              Import local audio files to test playback before the backend streaming service is ready.
            </p>
          </div>
        </template>
      </Card>
    </section>

    <section class="content-grid">
      <Card class="panel">
        <template #title>Featured releases</template>
        <template #content>
          <div class="track-grid">
            <button
              v-for="track in tracks"
              :key="track.id"
              class="track-card"
              :class="{ active: track.id === currentTrackId }"
              @click="player.selectTrack(track.id)"
            >
              <div
                class="track-art"
                :style="{ backgroundImage: `linear-gradient(135deg, ${track.accent.join(', ')})` }"
              />
              <div class="track-copy">
                <p class="track-title">{{ track.title }}</p>
                <p class="track-meta">{{ track.artist }}</p>
              </div>
              <Tag :value="track.streamUrl ? 'Ready' : 'Upload source'" :severity="track.streamUrl ? 'success' : 'warn'" />
            </button>
          </div>
        </template>
      </Card>

      <Card class="panel">
        <template #title>Streaming roadmap</template>
        <template #content>
          <div class="roadmap">
            <div>
              <p class="roadmap-step">Phase 1</p>
              <h3>Frontend player + upload flow</h3>
              <p>Current repo: UI, queue, and local playback for rapid iteration.</p>
            </div>
            <div>
              <p class="roadmap-step">Phase 2</p>
              <h3>Protected media delivery</h3>
              <p>Backend issues signed playback URLs to object storage through a CDN.</p>
            </div>
            <div>
              <p class="roadmap-step">Phase 3</p>
              <h3>Creator dashboard</h3>
              <p>Release management, analytics, private tracks, playlists, and subscriber access.</p>
            </div>
          </div>
        </template>
      </Card>
    </section>
  </div>
</template>
