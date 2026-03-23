<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { api } from "./lib/api";
import ExpandedPlayer from "./components/player/ExpandedPlayer.vue";
import MiniPlayer from "./components/player/MiniPlayer.vue";
import AppHeader from "./components/AppHeader.vue";
import SoftwareSection from "./components/SoftwareSection.vue";
import MusicSection from "./components/MusicSection.vue";
import { getInitialLocale, messages } from "./lib/translations";
import { useAuthStore } from "./stores/auth";
import { usePlayerStore } from "./stores/player";

const auth = useAuthStore();
const player = usePlayerStore();
const { user, loading: authLoading, isAuthenticated, isAdmin } = storeToRefs(auth);
const { tracks, currentTrack, currentTrackId, isPlaying, currentTime, volume, canPlayCurrent } = storeToRefs(player);

const activeMode = ref("music");
const musicTab = ref("listen");
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

const loginForm = reactive({ email: "", password: "" });
const trackForm = reactive(emptyTrack());
const releaseForm = reactive(emptyRelease());

const softwareProjects = [
  { title: "portfolio_26", type: "Frontend", icon: "pi pi-desktop", summary: "Public site and admin surface.", stack: ["Vue", "Pinia", "PrimeVue"], href: "https://github.com/patriziomadferitmilione/portfolio_26" },
  { title: "portolio_26_be", type: "Backend", icon: "pi pi-server", summary: "Auth, tracks, releases, and playback authorization.", stack: ["Fastify", "Drizzle", "SQLite/Postgres"], href: "https://github.com/patriziomadferitmilione/portolio_26_be" }
];

const platformLinks = [
  { label: "SoundCloud", icon: "pi pi-volume-up", href: "https://soundcloud.com/patrizio-milione", note: "Current uploads and drafts" },
  { label: "Apple Music", icon: "pi pi-headphones", href: "https://music.apple.com/us/artist/patrizio-milione/1535385820", note: "Published releases" },
  { label: "Local API", icon: "pi pi-link", href: "http://localhost:4200/api/health", note: "Backend health and data endpoints" }
];

const formattedDuration = computed(() => formatTime(currentTrack.value?.duration ?? 0));
const formattedTime = computed(() => formatTime(currentTime.value));
const text = computed(() => messages[locale.value]);
const progress = computed(() => {
  const duration = currentTrack.value?.duration ?? 0;
  return duration ? Math.min(100, Math.round((currentTime.value / duration) * 100)) : 0;
});
const currentRelease = computed(() => releases.value.find((release) => release.tracks?.some((track) => track.id === currentTrackId.value)) ?? releases.value[0] ?? null);
const currentLyrics = computed(() => currentTrack.value?.lyrics || currentRelease.value?.notes || text.value.player.noLyrics);
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
    if (!track.streamUrl || !track.streamUrl.startsWith("blob:")) {
      try {
        const response = await api.authorizePlayback(track.id);
        player.setTrackStream(track.id, response.streamUrl);
      } catch (error) {
        statusMessage.value = error.message;
        return;
      }
    }
    await audio.play();
    player.setPlaying(true);
    return;
  }
  audio.pause();
  player.setPlaying(false);
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
    musicTab.value = "admin";
    loginForm.email = "";
    loginForm.password = "";
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
    const payload = { title: trackForm.title, artist: trackForm.artist, mood: trackForm.mood, duration: Number(trackForm.duration), visibility: trackForm.visibility, storageKey: trackForm.storageKey, releaseLabel: trackForm.releaseLabel };
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
  Object.assign(trackForm, { id: track.id, title: track.title, artist: track.artist, mood: track.mood, duration: String(track.duration), visibility: track.visibility, storageKey: track.storageKey ?? "", releaseLabel: track.releaseLabel });
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
  return { id: "", title: "", artist: "Patrizio Milione", mood: "Pop", duration: "180", visibility: "public", storageKey: "", releaseLabel: "Single" };
}

function emptyRelease() {
  return { id: "", title: "", slug: "", format: "single", visibility: "public", artworkUrl: "/artwork/placeholder.jpg", notes: "", publishedAt: "", trackIds: "" };
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
    <audio ref="audioRef" preload="metadata" @timeupdate="handleTimeUpdate" @loadedmetadata="handleLoadedMetadata" @ended="player.playNext()" />

    <AppHeader
      :active-mode="activeMode"
      :theme="theme"
      :text="text"
      @update:mode="activeMode = $event"
      @toggle-theme="theme = theme === 'dark' ? 'light' : 'dark'"
      @toggle-locale="toggleLocale"
    />

    <section v-if="activeMode === 'software'" class="mode-page">
      <SoftwareSection :text="text" :projects="softwareProjects" />
    </section>

    <MusicSection
      v-else
      :text="text"
      :music-tab="musicTab"
      :status-message="statusMessage"
      :catalog-loading="catalogLoading"
      :current-track="currentTrack"
      :current-release="currentRelease"
      :current-track-id="currentTrackId ?? ''"
      :tracks="tracks"
      :releases="releases"
      :platform-links="platformLinks"
      :is-authenticated="isAuthenticated"
      :user="user"
      :login-error="loginError"
      :login-form="loginForm"
      :auth-loading="authLoading"
      :is-admin="isAdmin"
      :upload-busy="uploadBusy"
      :upload-category="uploadCategory"
      :track-form="trackForm"
      :release-form="releaseForm"
      :media-assets="mediaAssets"
      :admin-busy="adminBusy"
      :current-lyrics="currentLyrics"
      @set-tab="musicTab = $event"
      @open-player="openPlayer"
      @open-file-picker="openFilePicker"
      @files-selected="onFilesSelected"
      @select-track="player.selectTrack($event)"
      @submit-login="submitLogin"
      @logout="logout"
      @refresh-admin="refreshAdminData"
      @open-media-picker="openMediaPicker"
      @media-selected="onMediaSelected"
      @submit-track="submitTrack"
      @submit-release="submitRelease"
      @edit-track="editTrack"
      @edit-release="editRelease"
      @remove-track="removeTrack"
      @remove-release="removeRelease"
    />

    <MiniPlayer
      v-if="activeMode === 'music' && isPlaying && currentTrack"
      :track="currentTrack"
      :is-playing="isPlaying"
      :current-time-label="formattedTime"
      :duration-label="formattedDuration"
      :progress="progress"
      :disabled="!canPlayCurrent"
      :labels="{ noTrackSelected: text.player.noTrackSelected, selectTrack: text.music.listen }"
      :hidden="miniPlayerHidden"
      @toggle="togglePlayback"
      @next="player.playNext()"
      @previous="player.playPrevious()"
      @expand="openPlayer"
      @show="revealMiniPlayer"
      @hide="hideMiniPlayer"
    />

    <ExpandedPlayer
      :open="playerExpanded"
      :track="currentTrack"
      :release-title="currentRelease?.title ?? ''"
      :lyrics="currentLyrics"
      :is-playing="isPlaying"
      :can-play="canPlayCurrent"
      :volume="volume"
      :progress="progress"
      :current-time-label="formattedTime"
      :duration-label="formattedDuration"
      :queue="tracks"
      :active-track-id="currentTrackId ?? ''"
      :labels="playerLabels"
      @close="playerExpanded = false"
      @toggle="togglePlayback"
      @next="player.playNext()"
      @previous="player.playPrevious()"
      @volume-change="player.setVolume($event)"
      @seek="seekTrack"
      @select-track="player.selectTrack($event)"
    />
  </div>
</template>
