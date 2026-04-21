<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { api } from "./lib/api";
import ExpandedPlayer from "./components/player/ExpandedPlayer.vue";
import MiniPlayer from "./components/player/MiniPlayer.vue";
import AppHeader from "./components/AppHeader.vue";
import SoftwareSection from "./components/SoftwareSection.vue";
import MusicSection from "./components/MusicSection.vue";
import LyricsSection from "./components/LyricsSection.vue";
import BioSection from "./components/BioSection.vue";
import AdminSection from "./components/AdminSection.vue";
import { getInitialLocale, messages } from "./lib/translations";
import { useAuthStore } from "./stores/auth";
import { usePlayerStore } from "./stores/player";

const auth = useAuthStore();
const player = usePlayerStore();
const { user, loading: authLoading, isAuthenticated, isAdmin } = storeToRefs(auth);
const {
  tracks,
  queue,
  currentTrack,
  currentTrackId,
  isPlaying,
  currentTime,
  volume,
  shuffleEnabled,
  repeatMode,
  canPlayCurrent
} = storeToRefs(player);

const activeMode = ref("listen");
const theme = ref(getInitialTheme());
const locale = ref(getInitialLocale());
const playerExpanded = ref(false);
const miniPlayerHidden = ref(false);
const releases = ref([]);
const mediaAssets = ref([]);
const audioRef = ref(null);
const fileInputRef = ref(null);
const mediaFileRef = ref(null);
const statusMessage = ref("");
const catalogLoading = ref(false);
const adminBusy = ref(false);
const uploadBusy = ref(false);
const loginError = ref("");
const uploadCategory = ref("audio");

const loginForm = reactive({ accessCode: "" });
const trackForm = reactive(emptyTrack());
const releaseForm = reactive(emptyRelease());

const musicDemoTracks = [
  createDemoTrack("vinegar", "Vinegar", "Patrizio Milione", "Vinegar", 170, ["#d9471e", "#401a14"]),
  createDemoTrack("soda-and-lime", "Soda & Lime", "Patrizio Milione feat. Ryota Saito", "Soda & Lime", 235, ["#ff8a3d", "#6e2416"]),
  createDemoTrack("but-then-comes-the-night", "But Then Comes the Night", "Patrizio Milione", "But Then Comes the Night", 180, ["#cb5a2b", "#23181f"])
];

const formattedDuration = computed(() => formatTime(currentTrack.value?.duration ?? 0));
const formattedTime = computed(() => formatTime(currentTime.value));
const text = computed(() => messages[locale.value]);
const displayTracks = computed(() => {
  if (!tracks.value.length) {
    return musicDemoTracks;
  }

  return tracks.value.map((track) => {
    const release = releases.value.find((item) => item.tracks?.some((releaseTrack) => releaseTrack.id === track.id));

    return {
      ...track,
      releaseTitle: release?.title ?? track.releaseLabel,
      artworkUrl: resolveMediaUrl(release?.artworkUrl ?? ""),
      durationLabel: formatTime(track.duration ?? 0),
      lyrics: track.lyrics || release?.notes || text.value.player.noLyrics
    };
  });
});
const displayQueue = computed(() => {
  if (!queue.value.length) {
    return displayTracks.value;
  }

  return queue.value.map((track) => {
    const displayTrack = displayTracks.value.find((item) => item.id === track.id);
    return displayTrack ?? {
      ...track,
      artworkUrl: "",
      durationLabel: formatTime(track.duration ?? 0),
      lyrics: track.lyrics || text.value.player.noLyrics
    };
  });
});
const progress = computed(() => {
  const duration = currentTrack.value?.duration ?? 0;
  return duration ? Math.min(100, Math.round((currentTime.value / duration) * 100)) : 0;
});
const currentRelease = computed(() => releases.value.find((release) => release.tracks?.some((track) => track.id === currentTrackId.value)) ?? releases.value[0] ?? null);
const currentLyrics = computed(() => currentTrack.value?.lyrics || currentRelease.value?.notes || text.value.player.noLyrics);
const displayCurrentTrack = computed(() => displayTracks.value.find((track) => track.id === currentTrackId.value) ?? null);
const playerLabels = computed(() => ({
  nowPlaying: text.value.player.nowPlaying,
  noTrackSelected: text.value.player.noTrackSelected,
  artistName: text.value.app.eyebrow,
  unreleased: text.value.player.unreleased ?? "Unreleased",
  releaseLoading: text.value.player.releaseLoading,
  lyrics: text.value.player.lyrics,
  queue: text.value.player.queue,
  selectTrack: text.value.music.listen
}));

watch(() => currentTrack.value?.streamUrl, (streamUrl) => {
  if (!audioRef.value) return;
  audioRef.value.pause();
  player.setPlaying(false);
  audioRef.value.src = streamUrl ?? "";
  audioRef.value.load();
});

watch(volume, (value) => {
  if (audioRef.value) audioRef.value.volume = value / 100;
}, { immediate: true });

watch(theme, (value) => {
  document.documentElement.dataset.theme = value;
  window.localStorage.setItem("portfolio-theme", value);
}, { immediate: true });

watch(locale, (value) => {
  window.localStorage.setItem("portfolio-locale", value);
}, { immediate: true });

watch(isPlaying, (value) => {
  if (value) {
    miniPlayerHidden.value = false;
  }
});

let scrollTimeout = null;

function handleMainScroll() {
  if (!isPlaying.value) return;
  miniPlayerHidden.value = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    scrollTimeout = null;
  }, 120);
}

onMounted(async () => {
  await auth.hydrate();
  await refreshCatalog();
  if (isAdmin.value) {
    await refreshAdminData();
  }
  window.addEventListener("scroll", handleMainScroll, { passive: true });
  window.addEventListener("wheel", handleMainScroll, { passive: true });
  window.addEventListener("touchmove", handleMainScroll, { passive: true });
  window.addEventListener("keydown", handleMainScroll);
});

onBeforeUnmount(() => {
  audioRef.value?.pause();
  window.removeEventListener("scroll", handleMainScroll);
  window.removeEventListener("wheel", handleMainScroll);
  window.removeEventListener("touchmove", handleMainScroll);
  window.removeEventListener("keydown", handleMainScroll);
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
});

async function refreshCatalog() {
  catalogLoading.value = true;
  try {
    const [tracksResponse, releasesResponse] = await Promise.all([api.getTracks(), api.getReleases()]);
    player.setTracks(tracksResponse.items);
    releases.value = releasesResponse.items;
  } catch (error) {
    statusMessage.value = error.message;
  } finally {
    catalogLoading.value = false;
  }
}

async function refreshAdminData() {
  if (!isAdmin.value) return;
  const [tracksResponse, releasesResponse, mediaResponse] = await Promise.all([
    api.getAdminTracks(),
    api.getAdminReleases(),
    api.getAdminMedia()
  ]);
  player.setTracks(tracksResponse.items);
  releases.value = releasesResponse.items;
  mediaAssets.value = mediaResponse.items;
}

async function togglePlayback() {
  const audio = audioRef.value;
  const track = currentTrack.value;
  if (!audio || !track) return;
  if (audio.paused) {
    const readyTrack = await ensureTrackIsPlayable(track.id);
    if (!readyTrack) return;

    try {
      await audio.play();
      player.setPlaying(true);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      statusMessage.value = error.message;
      player.setPlaying(false);
    }
    return;
  }
  audio.pause();
  player.setPlaying(false);
}

async function startPlaybackForTrack(trackId, { openExpanded = false, toggleCurrent = true } = {}) {
  if (!trackId || !audioRef.value) {
    return;
  }

  if (openExpanded) {
    playerExpanded.value = true;
  }

  const isCurrentTrack = trackId === currentTrackId.value;
  if (isCurrentTrack && toggleCurrent) {
    await togglePlayback();
    return;
  }

  const readyTrack = await ensureTrackIsPlayable(trackId);
  if (!readyTrack) {
    return;
  }

  try {
    await audioRef.value.play();
    player.setPlaying(true);
  } catch (error) {
    if (error?.name === "AbortError") {
      return;
    }
    statusMessage.value = error.message;
    player.setPlaying(false);
  }
}

async function ensureTrackIsPlayable(trackId) {
  if (!trackId) {
    return null;
  }

  if (currentTrackId.value !== trackId) {
    player.selectTrack(trackId);
    await nextTick();
  }

  const track = currentTrack.value;
  if (!track) {
    return null;
  }

  if (!track.streamUrl || !track.streamUrl.startsWith("blob:")) {
    try {
      const response = await api.authorizePlayback(track.id);
      player.setTrackStream(track.id, response.streamUrl);
      await nextTick();
    } catch (error) {
      statusMessage.value = error.message;
      return null;
    }
  }

  return currentTrack.value;
}

function handleTimeUpdate() {
  if (audioRef.value) player.setCurrentTime(audioRef.value.currentTime);
}

function handleLoadedMetadata() {
  if (audioRef.value && currentTrack.value) {
    currentTrack.value.duration = Math.round(audioRef.value.duration || currentTrack.value.duration);
  }
}

function seekTrack(event) {
  if (!audioRef.value || !currentTrack.value?.duration) return;
  const ratio = Number(event.target.value) / 100;
  audioRef.value.currentTime = currentTrack.value.duration * ratio;
  player.setCurrentTime(audioRef.value.currentTime);
}

function openFilePicker() {
  fileInputRef.value?.click();
}

function openPlayer() {
  playerExpanded.value = true;
}

function revealMiniPlayer() {
  miniPlayerHidden.value = false;
}

function hideMiniPlayer() {
  miniPlayerHidden.value = true;
}

function selectPlaybackTrack(id) {
  player.selectTrack(id);
}

async function toggleTrackFromList(id) {
  await startPlaybackForTrack(id, { openExpanded: true, toggleCurrent: true });
}

async function selectQueueTrack(id) {
  await startPlaybackForTrack(id, { openExpanded: false, toggleCurrent: false });
}

async function handleNext() {
  const action = player.playNext();
  if (!audioRef.value) {
    return;
  }

  if (action === "restart") {
    audioRef.value.currentTime = 0;
    player.setCurrentTime(0);
    await startPlaybackForTrack(currentTrackId.value, { toggleCurrent: false });
    return;
  }

  if (action === "next") {
    await startPlaybackForTrack(currentTrackId.value, { toggleCurrent: false });
    return;
  }

  if (action === "stop") {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
    player.setPlaying(false);
    player.setCurrentTime(0);
  }
}

async function handlePrevious() {
  const action = player.playPrevious({
    currentTime: audioRef.value?.currentTime ?? currentTime.value,
    restartThreshold: 3
  });

  if (!audioRef.value) {
    return;
  }

  if (action === "restart") {
    audioRef.value.currentTime = 0;
    player.setCurrentTime(0);
    if (isPlaying.value) {
      try {
        await audioRef.value.play();
        player.setPlaying(true);
      } catch (error) {
        if (error?.name !== "AbortError") {
          statusMessage.value = error.message;
          player.setPlaying(false);
        }
      }
    }
    return;
  }

  if (action === "previous") {
    await startPlaybackForTrack(currentTrackId.value, { toggleCurrent: false });
  }
}

async function handleTrackEnded() {
  const action = player.handleTrackEnded();
  if (!audioRef.value) {
    return;
  }

  if (action === "restart") {
    audioRef.value.currentTime = 0;
    player.setCurrentTime(0);
    await startPlaybackForTrack(currentTrackId.value, { toggleCurrent: false });
    return;
  }

  if (action === "next") {
    await startPlaybackForTrack(currentTrackId.value, { toggleCurrent: false });
    return;
  }

  if (action === "stop") {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
    player.setPlaying(false);
    player.setCurrentTime(0);
  }
}

function onFilesSelected(event) {
  const files = event.target.files;
  if (!files?.length) return;
  player.importLocalFiles(files);
  event.target.value = "";
}

async function submitLogin() {
  loginError.value = "";
  try {
    await auth.login(loginForm);
    await refreshAdminData();
    loginForm.accessCode = "";
  } catch (error) {
    loginError.value = error.message;
  }
}

function openMediaPicker() {
  mediaFileRef.value?.click();
}

async function onMediaSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  uploadBusy.value = true;
  statusMessage.value = "";

  try {
    const response = await api.uploadMedia({
      file,
      category: uploadCategory.value
    });
    mediaAssets.value = [response.item, ...mediaAssets.value];

    if (uploadCategory.value === "audio") {
      trackForm.storageKey = response.item.url;
    }

    if (uploadCategory.value === "artwork") {
      releaseForm.artworkUrl = response.item.url;
    }

    statusMessage.value = "Upload completed.";
  } catch (error) {
    statusMessage.value = error.message;
  } finally {
    uploadBusy.value = false;
    event.target.value = "";
  }
}

async function submitTrack() {
  adminBusy.value = true;
  try {
    const payload = {
      title: trackForm.title,
      artist: trackForm.artist,
      mood: trackForm.mood,
      duration: Number(trackForm.duration),
      visibility: trackForm.visibility,
      storageKey: trackForm.storageKey,
      releaseLabel: trackForm.releaseLabel,
      lyrics: trackForm.lyrics
    };
    const response = trackForm.id ? await api.updateTrack(trackForm.id, payload) : await api.createTrack(payload);
    player.upsertTrack(response.item);
    Object.assign(trackForm, emptyTrack());
    await refreshAdminData();
  } catch (error) {
    statusMessage.value = error.message;
  } finally {
    adminBusy.value = false;
  }
}

async function submitRelease() {
  adminBusy.value = true;
  try {
    const payload = {
      title: releaseForm.title,
      slug: releaseForm.slug,
      format: releaseForm.format,
      visibility: releaseForm.visibility,
      artworkUrl: releaseForm.artworkUrl,
      notes: releaseForm.notes,
      publishedAt: releaseForm.publishedAt ? new Date(releaseForm.publishedAt).toISOString() : null,
      trackIds: releaseForm.trackIds.split(",").map((value) => value.trim()).filter(Boolean)
    };
    const response = releaseForm.id ? await api.updateRelease(releaseForm.id, payload) : await api.createRelease(payload);
    upsertRelease(response.item);
    Object.assign(releaseForm, emptyRelease());
    await refreshAdminData();
  } catch (error) {
    statusMessage.value = error.message;
  } finally {
    adminBusy.value = false;
  }
}

function editTrack(track) {
  Object.assign(trackForm, {
    id: track.id,
    title: track.title,
    artist: track.artist,
    mood: track.mood,
    duration: String(track.duration),
    visibility: track.visibility,
    storageKey: track.storageKey ?? "",
    releaseLabel: track.releaseLabel,
    lyrics: track.lyrics ?? ""
  });
}

function editRelease(release) {
  Object.assign(releaseForm, { id: release.id, title: release.title, slug: release.slug, format: release.format, visibility: release.visibility, artworkUrl: release.artworkUrl, notes: release.notes, publishedAt: release.publishedAt ? release.publishedAt.slice(0, 16) : "", trackIds: (release.tracks ?? []).map((track) => track.id).join(", ") });
}

async function removeTrack(trackId) {
  await api.deleteTrack(trackId);
  player.removeTrack(trackId);
  await refreshAdminData();
}

async function removeRelease(releaseId) {
  await api.deleteRelease(releaseId);
  releases.value = releases.value.filter((release) => release.id !== releaseId);
  await refreshAdminData();
}

async function logout() {
  await auth.logout();
  await refreshCatalog();
}

function upsertRelease(release) {
  const index = releases.value.findIndex((item) => item.id === release.id);
  if (index === -1) releases.value = [release, ...releases.value];
  else {
    releases.value[index] = release;
    releases.value = [...releases.value];
  }
}

function emptyTrack() {
  return {
    id: "",
    title: "",
    artist: "Patrizio Milione",
    mood: "Pop",
    duration: "180",
    visibility: "public",
    storageKey: "",
    releaseLabel: "Single",
    lyrics: ""
  };
}

function emptyRelease() {
  return { id: "", title: "", slug: "", format: "single", visibility: "public", artworkUrl: "/artwork/placeholder.jpg", notes: "", publishedAt: "", trackIds: "" };
}

function createDemoTrack(id, title, artist, releaseTitle, duration, colors) {
  return {
    id,
    title,
    artist,
    releaseTitle,
    duration,
    durationLabel: formatTime(duration),
    accent: colors,
    artworkUrl: "",
    lyrics: createDemoLyrics(title)
  };
}

function createDemoLyrics(title) {
  return [
    `${title} in the rearview, flicker in the glass`,
    "Late train breathing through the avenue",
    "Streetlight halo on a navy coat",
    "Hold the note until the skyline moves",
    "Every small delay becomes a rhythm",
    "Every quiet room keeps the echo warm"
  ].join("\n");
}

function resolveMediaUrl(value) {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4200/api";
  const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, "");
  return `${backendOrigin}${value.startsWith("/") ? value : `/${value}`}`;
}

function formatTime(value) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getInitialTheme() {
  const storedTheme = typeof window !== "undefined" ? window.localStorage.getItem("portfolio-theme") : null;
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function toggleLocale() {
  locale.value = locale.value === "en" ? "it" : "en";
}

</script>

<template>
  <div class="app-shell" :data-mode="activeMode">
    <audio ref="audioRef" preload="metadata" @timeupdate="handleTimeUpdate" @loadedmetadata="handleLoadedMetadata" @ended="handleTrackEnded" />

    <AppHeader
      :active-mode="activeMode"
      :theme="theme"
      :text="text"
      :is-authenticated="isAuthenticated"
      :is-admin="isAdmin"
      @update:mode="activeMode = $event"
      @toggle-theme="theme = theme === 'dark' ? 'light' : 'dark'"
      @toggle-locale="toggleLocale"
    />

    <!--
    <section v-if="activeMode === 'software'" class="mode-page">
      <SoftwareSection :text="text" />
    </section>
    -->

    <AdminSection
      v-if="activeMode === 'admin'"
      :is-authenticated="isAuthenticated"
      :is-admin="isAdmin"
      :busy="adminBusy"
      :upload-busy="uploadBusy"
      :tracks="tracks"
      :releases="releases"
      :media-assets="mediaAssets"
      :status-message="statusMessage"
      :login-error="loginError"
      :login-form="loginForm"
      :track-form="trackForm"
      :release-form="releaseForm"
      :upload-category="uploadCategory"
      @login="submitLogin"
      @logout="logout"
      @upload="onMediaSelected"
      @submit-track="submitTrack"
      @submit-release="submitRelease"
      @edit-track="editTrack"
      @edit-release="editRelease"
      @remove-track="removeTrack"
      @remove-release="removeRelease"
      @update-category="uploadCategory = $event"
    />

    <LyricsSection
      v-else-if="activeMode === 'lyrics'"
      :tracks="displayTracks"
      :text="text"
    />

    <section v-else-if="activeMode === 'bio'" class="mode-page">
       <div class="placeholder-section">
         <h2>{{ text.mode.bio }}</h2>
         <p>Biography coming soon...</p>
       </div>
    </section>

    <section v-else-if="activeMode === 'network'" class="mode-page">
       <div class="placeholder-section">
         <h2>{{ text.mode.network }}</h2>
         <p>Partners and collaborators coming soon...</p>
       </div>
    </section>

    <section v-else-if="activeMode === 'busking'" class="mode-page">
       <div class="placeholder-section">
         <h2>{{ text.mode.busking }}</h2>
         <p>Busking schedule and locations coming soon...</p>
       </div>
    </section>

    <MusicSection
      v-else-if="activeMode === 'listen'"
      :text="text"
      :catalog-loading="catalogLoading"
      :current-track-id="currentTrackId ?? ''"
      :is-playing="isPlaying"
      :tracks="displayTracks"
      @select-track="selectPlaybackTrack"
      @toggle-track="toggleTrackFromList"
    />

    <MiniPlayer
      v-if="activeMode === 'listen' && currentTrack"
      :track="displayCurrentTrack ?? currentTrack"
      :is-playing="isPlaying"
      :current-time-label="formattedTime"
      :duration-label="formattedDuration"
      :progress="progress"
      :disabled="!canPlayCurrent"
      :labels="{ noTrackSelected: text.player.noTrackSelected, selectTrack: text.music.listen }"
      :hidden="miniPlayerHidden"
      @toggle="togglePlayback"
      @next="handleNext"
      @previous="handlePrevious"
      @expand="playerExpanded = true"
      @show="revealMiniPlayer"
      @hide="hideMiniPlayer"
    />

    <ExpandedPlayer
      :open="playerExpanded"
      :track="displayCurrentTrack ?? currentTrack"
      :release-title="currentRelease?.title ?? ''"
      :lyrics="currentLyrics"
      :is-playing="isPlaying"
      :can-play="canPlayCurrent"
      :volume="volume"
      :progress="progress"
      :current-time-label="formattedTime"
      :duration-label="formattedDuration"
      :queue="displayQueue"
      :active-track-id="currentTrackId ?? ''"
      :shuffle-enabled="shuffleEnabled"
      :repeat-mode="repeatMode"
      :labels="playerLabels"
      @close="playerExpanded = false"
      @toggle="togglePlayback"
      @next="handleNext"
      @previous="handlePrevious"
      @toggle-shuffle="player.toggleShuffle()"
      @cycle-repeat="player.cycleRepeatMode()"
      @volume-change="player.setVolume($event)"
      @seek="seekTrack"
      @select-track="selectQueueTrack"
    />
  </div>
</template>
