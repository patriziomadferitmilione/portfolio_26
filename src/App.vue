<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { api } from "./lib/api";
import ExpandedPlayer from "./components/player/ExpandedPlayer.vue";
import MiniPlayer from "./components/player/MiniPlayer.vue";
import AppHeader from "./components/AppHeader.vue";
import BioSection from "./components/BioSection.vue";
import ExternalEmbedsSection from "./components/ExternalEmbedsSection.vue";
import MusicSection from "./components/MusicSection.vue";
import EpkSections from "./components/EpkSections.vue";
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
  currentQueueIndex,
  isPlaying,
  currentTime,
  volume,
  shuffleEnabled,
  repeatMode,
  canPlayCurrent
} = storeToRefs(player);

const theme = ref(getInitialTheme());
const locale = ref(getInitialLocale());
const loginPanelOpen = ref(false);
const playerExpanded = ref(false);
const miniPlayerHidden = ref(false);
const releases = ref([]);
const mediaAssets = ref([]);
const audioRef = ref(null);
const trackMediaFileRef = ref(null);
const trackArtworkFileRef = ref(null);
const releaseMediaFileRef = ref(null);
const statusMessage = ref("");
const catalogLoading = ref(false);
const adminBusy = ref(false);
const trackUploadBusy = ref(false);
const releaseUploadBusy = ref(false);
const loginError = ref("");
const selectedReleaseTrackId = ref("");
const prefetchedStreamTrackId = ref("");
const adminCards = reactive({
  track: true,
  release: true,
  tracks: true,
  releases: true,
  media: true
});

const loginForm = reactive({ email: "", password: "" });
const trackForm = reactive(emptyTrack());
const releaseForm = reactive(emptyRelease());

const formattedDuration = computed(() => formatTime(currentTrack.value?.duration ?? 0));
const formattedTime = computed(() => formatTime(currentTime.value));
const text = computed(() => messages[locale.value]);
const displayTracks = computed(() => {
  if (!tracks.value.length) {
    return [];
  }

  return tracks.value.map((track) => {
    const release = releases.value.find((item) => item.tracks?.some((releaseTrack) => releaseTrack.id === track.id));

    return {
      ...track,
      releaseTitle: release?.title ?? track.releaseLabel,
      artworkUrl: resolveMediaUrl(track.artworkPath || release?.artworkUrl || ""),
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
const showMiniPlayer = computed(() => Boolean(currentTrack.value || queue.value.length));
const adminTrackOptions = computed(() => tracks.value.map((track) => ({
  id: track.id,
  label: `${track.title} · ${track.artist}`
})));
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
  updateMediaSessionPlaybackState();
});

watch(currentTrackId, () => {
  prefetchedStreamTrackId.value = "";
});

watch(displayCurrentTrack, updateMediaSessionMetadata);

watch([currentTime, () => currentTrack.value?.duration], updateMediaSessionPosition);

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
  try {
    await auth.hydrate();
    const session = await api.getCurrentUser();
    auth.setUser(session.user);
  } catch (error) {
    if (error?.status !== 401) {
      statusMessage.value = error.message;
    }
  }

  await refreshCatalog();
  if (isAdmin.value) {
    await refreshAdminData();
  }
  setupMediaSession();
  updateMediaSessionMetadata();
  updateMediaSessionPlaybackState();
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
  clearMediaSession();
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
  try {
    const [tracksResponse, releasesResponse, mediaResponse] = await Promise.all([
      api.getAdminTracks(),
      api.getAdminReleases(),
      api.getAdminMedia()
    ]);
    player.setTracks(tracksResponse.items);
    releases.value = releasesResponse.items;
    mediaAssets.value = mediaResponse.items;
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      auth.logout();
      loginPanelOpen.value = true;
      statusMessage.value = "Admin session expired or invalid. Please log in again.";
      return;
    }

    statusMessage.value = error.message;
  }
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

  if (!hasFreshStreamUrl(track)) {
    try {
      const response = await api.authorizePlayback(track.id);
      player.setTrackStream(track.id, response.streamUrl, response.expiresIn);
      await nextTick();
    } catch (error) {
      statusMessage.value = error.message;
      return null;
    }
  }

  return currentTrack.value;
}

function handleTimeUpdate() {
  if (!audioRef.value) {
    return;
  }

  player.setCurrentTime(audioRef.value.currentTime);
  prefetchUpcomingTrackStream();
}

function handleLoadedMetadata() {
  if (audioRef.value && currentTrack.value) {
    currentTrack.value.duration = Math.round(audioRef.value.duration || currentTrack.value.duration);
    updateMediaSessionPosition();
  }
}

function handleAudioPlay() {
  player.setPlaying(true);
}

function handleAudioPause() {
  player.setPlaying(false);
}

async function prefetchUpcomingTrackStream() {
  if (!audioRef.value || !isPlaying.value) {
    return;
  }

  const duration = currentTrack.value?.duration ?? audioRef.value.duration ?? 0;
  const remaining = duration - audioRef.value.currentTime;
  if (!Number.isFinite(remaining) || remaining > 20) {
    return;
  }

  const nextTrackId = getUpcomingTrackId();
  if (!nextTrackId || prefetchedStreamTrackId.value === nextTrackId) {
    return;
  }

  const nextTrack = tracks.value.find((track) => track.id === nextTrackId);
  if (!nextTrack || hasFreshStreamUrl(nextTrack)) {
    prefetchedStreamTrackId.value = nextTrackId;
    return;
  }

  prefetchedStreamTrackId.value = nextTrackId;
  try {
    const response = await api.authorizePlayback(nextTrackId);
    player.setTrackStream(nextTrackId, response.streamUrl, response.expiresIn);
  } catch {
    prefetchedStreamTrackId.value = "";
  }
}

function hasFreshStreamUrl(track) {
  if (!track?.streamUrl) {
    return false;
  }

  if (track.streamUrl.startsWith("blob:")) {
    return true;
  }

  return Number(track.streamExpiresAt ?? 0) > Date.now() + 30000;
}

function getUpcomingTrackId() {
  if (!queue.value.length || !currentTrackId.value) {
    return "";
  }

  if (repeatMode.value === "one") {
    return currentTrackId.value;
  }

  const nextIndex = currentQueueIndex.value + 1;
  if (nextIndex < queue.value.length) {
    return queue.value[nextIndex].id;
  }

  return repeatMode.value === "all" ? queue.value[0]?.id ?? "" : "";
}

function seekTrack(event) {
  if (!audioRef.value || !currentTrack.value?.duration) return;
  const ratio = Number(event.target.value) / 100;
  audioRef.value.currentTime = currentTrack.value.duration * ratio;
  player.setCurrentTime(audioRef.value.currentTime);
}

function openTrackMediaPicker() {
  trackMediaFileRef.value?.click();
}

function openReleaseMediaPicker() {
  releaseMediaFileRef.value?.click();
}

function openTrackArtworkPicker() {
  trackArtworkFileRef.value?.click();
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

function setupMediaSession() {
  if (!supportsMediaSession()) {
    return;
  }

  setMediaSessionAction("play", async () => {
    if (audioRef.value?.paused) {
      await togglePlayback();
    }
  });
  setMediaSessionAction("pause", () => {
    if (!audioRef.value?.paused) {
      audioRef.value.pause();
      player.setPlaying(false);
    }
  });
  setMediaSessionAction("nexttrack", handleNext);
  setMediaSessionAction("previoustrack", handlePrevious);
  setMediaSessionAction("seekbackward", ({ seekOffset = 10 } = {}) => {
    seekBySeconds(-seekOffset);
  });
  setMediaSessionAction("seekforward", ({ seekOffset = 10 } = {}) => {
    seekBySeconds(seekOffset);
  });
  setMediaSessionAction("seekto", ({ seekTime, fastSeek } = {}) => {
    if (!audioRef.value || !Number.isFinite(seekTime)) {
      return;
    }

    if (fastSeek && "fastSeek" in audioRef.value) {
      audioRef.value.fastSeek(seekTime);
    } else {
      audioRef.value.currentTime = seekTime;
    }
    player.setCurrentTime(audioRef.value.currentTime);
    updateMediaSessionPosition();
  });
}

function clearMediaSession() {
  if (!supportsMediaSession()) {
    return;
  }

  ["play", "pause", "nexttrack", "previoustrack", "seekbackward", "seekforward", "seekto"].forEach((action) => {
    setMediaSessionAction(action, null);
  });
}

function setMediaSessionAction(action, handler) {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {
    // Some browsers expose Media Session but only implement a subset of actions.
  }
}

function updateMediaSessionMetadata() {
  if (!supportsMediaSession() || typeof MediaMetadata === "undefined") {
    return;
  }

  const track = displayCurrentTrack.value;
  if (!track) {
    navigator.mediaSession.metadata = null;
    return;
  }

  const artworkUrl = resolveMediaUrl(track.artworkUrl || track.artworkPath || currentRelease.value?.artworkUrl || "");
  const artwork = artworkUrl
    ? [
        { src: artworkUrl, sizes: "96x96", type: "image/png" },
        { src: artworkUrl, sizes: "192x192", type: "image/png" },
        { src: artworkUrl, sizes: "512x512", type: "image/png" }
      ]
    : [
        { src: "/icon-192-dark.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512-dark.png", sizes: "512x512", type: "image/png" }
      ];

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.releaseTitle ?? track.releaseLabel ?? currentRelease.value?.title ?? "",
    artwork
  });
  updateMediaSessionPosition();
}

function updateMediaSessionPlaybackState() {
  if (!supportsMediaSession()) {
    return;
  }

  navigator.mediaSession.playbackState = isPlaying.value ? "playing" : "paused";
}

function updateMediaSessionPosition() {
  if (!supportsMediaSession() || typeof navigator.mediaSession.setPositionState !== "function") {
    return;
  }

  const duration = Number(currentTrack.value?.duration ?? audioRef.value?.duration ?? 0);
  const position = Number(currentTime.value ?? audioRef.value?.currentTime ?? 0);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(position)) {
    return;
  }

  try {
    navigator.mediaSession.setPositionState({
      duration,
      playbackRate: audioRef.value?.playbackRate ?? 1,
      position: Math.min(position, duration)
    });
  } catch {
    // Ignore invalid transient states while media metadata is loading.
  }
}

function seekBySeconds(offset) {
  if (!audioRef.value) {
    return;
  }

  const duration = currentTrack.value?.duration ?? audioRef.value.duration ?? 0;
  const target = Math.max(0, Math.min(duration || Number.MAX_SAFE_INTEGER, audioRef.value.currentTime + offset));
  audioRef.value.currentTime = target;
  player.setCurrentTime(target);
  updateMediaSessionPosition();
}

function supportsMediaSession() {
  return typeof navigator !== "undefined" && "mediaSession" in navigator;
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
    if (loginForm.email && loginForm.password) {
      const response = await api.login({
        email: loginForm.email,
        password: loginForm.password
      });
      auth.setUser(response.user);
    } else {
      await auth.login({ accessCode: loginForm.password });
    }
    await refreshAdminData();
    loginForm.email = "";
    loginForm.password = "";
    loginPanelOpen.value = false;
  } catch (error) {
    loginError.value = error.message;
  }
}

async function onTrackMediaSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  trackUploadBusy.value = true;
  statusMessage.value = "";

  try {
    const response = await api.uploadMedia({
      file,
      category: "audio"
    });
    mediaAssets.value = [response.item, ...mediaAssets.value];
    trackForm.audioPath = response.item.path ?? response.item.url;
    statusMessage.value = "Audio upload completed.";
  } catch (error) {
    statusMessage.value = error.message;
  } finally {
    trackUploadBusy.value = false;
    event.target.value = "";
  }
}

async function onReleaseMediaSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  releaseUploadBusy.value = true;
  statusMessage.value = "";

  try {
    const response = await api.uploadMedia({
      file,
      category: "artwork"
    });
    mediaAssets.value = [response.item, ...mediaAssets.value];
    releaseForm.artworkPath = response.item.path ?? response.item.url;
    statusMessage.value = "Artwork upload completed.";
  } catch (error) {
    statusMessage.value = error.message;
  } finally {
    releaseUploadBusy.value = false;
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
      visibility: trackForm.visibility,
      audioPath: trackForm.audioPath,
      artworkPath: trackForm.artworkPath,
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
      artworkPath: releaseForm.artworkPath,
      notes: releaseForm.notes,
      publishedAt: releaseForm.publishedAt ? new Date(releaseForm.publishedAt).toISOString() : null,
      trackIds: releaseForm.trackIds
    };
    const response = releaseForm.id ? await api.updateRelease(releaseForm.id, payload) : await api.createRelease(payload);
    upsertRelease(response.item);
    Object.assign(releaseForm, emptyRelease());
    selectedReleaseTrackId.value = "";
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
    visibility: track.visibility,
    audioPath: track.audioPath ?? track.storageKey ?? "",
    artworkPath: track.artworkPath ?? "",
    releaseLabel: track.releaseLabel,
    lyrics: track.lyrics ?? ""
  });
}

function editRelease(release) {
  Object.assign(releaseForm, { id: release.id, title: release.title, slug: release.slug, format: release.format, visibility: release.visibility, artworkPath: release.artworkPath ?? release.artworkUrl ?? "", notes: release.notes, publishedAt: release.publishedAt ? release.publishedAt.slice(0, 16) : "", trackIds: (release.tracks ?? []).map((track) => track.id) });
  selectedReleaseTrackId.value = "";
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
  try {
    await api.logout();
  } catch {}
  auth.logout();
  await refreshCatalog();
}

async function onTrackArtworkSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  trackUploadBusy.value = true;
  statusMessage.value = "";

  try {
    const response = await api.uploadMedia({
      file,
      category: "artwork"
    });
    mediaAssets.value = [response.item, ...mediaAssets.value];
    trackForm.artworkPath = response.item.path ?? response.item.url;
    statusMessage.value = "Track artwork upload completed.";
  } catch (error) {
    statusMessage.value = error.message;
  } finally {
    trackUploadBusy.value = false;
    event.target.value = "";
  }
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
    visibility: "public",
    audioPath: "",
    artworkPath: "",
    releaseLabel: "Single",
    lyrics: ""
  };
}

function emptyRelease() {
  return { id: "", title: "", slug: "", format: "single", visibility: "public", artworkPath: "/artwork/placeholder.jpg", notes: "", publishedAt: "", trackIds: [] };
}

function addTrackToRelease() {
  if (!selectedReleaseTrackId.value) {
    return;
  }

  if (!releaseForm.trackIds.includes(selectedReleaseTrackId.value)) {
    releaseForm.trackIds = [...releaseForm.trackIds, selectedReleaseTrackId.value];
  }

  selectedReleaseTrackId.value = "";
}

function removeTrackFromRelease(trackId) {
  releaseForm.trackIds = releaseForm.trackIds.filter((value) => value !== trackId);
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
  return "light";
}

function toggleLocale() {
  locale.value = locale.value === "en" ? "it" : "en";
}

function openLoginPanel() {
  loginPanelOpen.value = true;
}

function toggleAdminCard(key) {
  adminCards[key] = !adminCards[key];
}

function setAdminCards(value) {
  adminCards.track = value;
  adminCards.release = value;
  adminCards.tracks = value;
  adminCards.releases = value;
  adminCards.media = value;
}

</script>

<template>
  <div class="app-shell">
    <audio
      ref="audioRef"
      preload="auto"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @play="handleAudioPlay"
      @pause="handleAudioPause"
      @ended="handleTrackEnded"
    />

    <AppHeader
      :theme="theme"
      :locale="locale"
      :text="text"
      @toggle-theme="theme = theme === 'dark' ? 'light' : 'dark'"
      @toggle-locale="toggleLocale"
      @open-login="openLoginPanel"
    />

    <EpkSections @listen="document.getElementById('discography')?.scrollIntoView({ behavior: 'smooth' })" />

    <section v-if="loginPanelOpen" class="login-panel">
      <div class="login-panel-head">
        <p class="eyebrow">{{ isAuthenticated ? text.auth.adminSession : text.auth.adminLogin }}</p>
        <button class="panel-close" type="button" aria-label="Close login panel" @click="loginPanelOpen = false">
          <i class="pi pi-times" />
        </button>
      </div>

      <form v-if="!isAuthenticated" class="login-form" @submit.prevent="submitLogin">
        <label class="field">
          <span>Email</span>
          <input v-model="loginForm.email" type="email" autocomplete="username" />
        </label>
        <label class="field">
          <span>Password</span>
          <input v-model="loginForm.password" type="password" autocomplete="current-password" />
        </label>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
        <button class="login-action" type="submit" :disabled="authLoading">
          {{ authLoading ? text.auth.signingIn : text.auth.login }}
        </button>
      </form>

      <div v-else class="login-state">
        <p class="login-note">{{ text.auth.adminSession }}</p>
        <button class="login-action" type="button" @click="logout">
          {{ text.auth.logout }}
        </button>
      </div>
    </section>

    <section v-if="isAdmin" class="admin-dashboard">
      <div class="admin-dashboard-shell">
        <header class="admin-dashboard-head">
          <div>
            <p class="eyebrow">{{ text.admin.managedContent }}</p>
            <h2>{{ text.admin.mediaAssets }}</h2>
            <p class="admin-summary">{{ user?.displayName ?? user?.email }}</p>
          </div>

          <div class="admin-header-actions">
            <button class="admin-toolbar-action" type="button" @click="refreshAdminData">
              {{ text.auth.refreshAdminData }}
            </button>
            <button class="admin-toolbar-action" type="button" @click="logout">
              {{ text.auth.logout }}
            </button>
          </div>
        </header>

        <div class="admin-view-toggle-row" role="toolbar" aria-label="Admin card visibility">
          <button
            class="admin-view-toggle action"
            type="button"
            aria-label="Show all admin cards"
            data-tooltip="Show all"
            @click="setAdminCards(true)"
          >
            <i class="pi pi-folder-open" />
          </button>
          <button
            class="admin-view-toggle action"
            type="button"
            aria-label="Hide all admin cards"
            data-tooltip="Hide all"
            @click="setAdminCards(false)"
          >
            <i class="pi pi-folder" />
          </button>
          <button
            class="admin-view-toggle"
            :class="{ active: adminCards.track, inactive: !adminCards.track }"
            type="button"
            :aria-pressed="adminCards.track"
            :data-tooltip="adminCards.track ? 'Hide track form' : 'Show track form'"
            aria-label="Toggle track form"
            @click="toggleAdminCard('track')"
          >
            <i class="pi pi-file-plus" />
          </button>
          <button
            class="admin-view-toggle"
            :class="{ active: adminCards.release, inactive: !adminCards.release }"
            type="button"
            :aria-pressed="adminCards.release"
            :data-tooltip="adminCards.release ? 'Hide release form' : 'Show release form'"
            aria-label="Toggle release form"
            @click="toggleAdminCard('release')"
          >
            <i class="pi pi-box" />
          </button>
          <button
            class="admin-view-toggle"
            :class="{ active: adminCards.tracks, inactive: !adminCards.tracks }"
            type="button"
            :aria-pressed="adminCards.tracks"
            :data-tooltip="adminCards.tracks ? 'Hide tracks list' : 'Show tracks list'"
            aria-label="Toggle tracks list"
            @click="toggleAdminCard('tracks')"
          >
            <i class="pi pi-list" />
          </button>
          <button
            class="admin-view-toggle"
            :class="{ active: adminCards.releases, inactive: !adminCards.releases }"
            type="button"
            :aria-pressed="adminCards.releases"
            :data-tooltip="adminCards.releases ? 'Hide releases list' : 'Show releases list'"
            aria-label="Toggle releases list"
            @click="toggleAdminCard('releases')"
          >
            <i class="pi pi-book" />
          </button>
          <button
            class="admin-view-toggle"
            :class="{ active: adminCards.media, inactive: !adminCards.media }"
            type="button"
            :aria-pressed="adminCards.media"
            :data-tooltip="adminCards.media ? 'Hide media library' : 'Show media library'"
            aria-label="Toggle media library"
            @click="toggleAdminCard('media')"
          >
            <i class="pi pi-images" />
          </button>
        </div>

        <p v-if="statusMessage" class="status-message admin-status">{{ statusMessage }}</p>

        <div class="admin-grid">
          <section v-if="adminCards.track" class="admin-card">
            <div class="card-head">
              <div>
                <p class="eyebrow">{{ text.admin.trackForm }}</p>
                <h3>{{ trackForm.id ? trackForm.title : text.admin.saveTrack }}</h3>
              </div>
            </div>

            <div class="admin-inline-actions">
              <button class="admin-secondary-action" type="button" @click="Object.assign(trackForm, emptyTrack())">
                Reset
              </button>
            </div>

            <div class="admin-media-section">
              <div class="card-head">
                <div>
                  <p class="eyebrow">{{ text.admin.mediaUpload }}</p>
                  <h4>{{ text.admin.uploadAudio }}</h4>
                </div>
                <button class="admin-secondary-action" type="button" @click="openTrackMediaPicker">
                  {{ text.admin.uploadAudio }}
                </button>
              </div>
              <input ref="trackMediaFileRef" class="hidden-file-input" type="file" accept="audio/*" @change="onTrackMediaSelected" />
              <p class="admin-help">{{ text.admin.audioUploadHelp }}</p>
              <label class="field field-wide">
                <span>{{ text.admin.audioPath }}</span>
                <input v-model="trackForm.audioPath" type="text" />
              </label>
              <p class="admin-help">{{ text.admin.audioPathHelp }}</p>
              <p v-if="trackUploadBusy" class="admin-help">{{ text.admin.uploading }}</p>
            </div>

            <div class="admin-media-section">
              <div class="card-head">
                <div>
                  <p class="eyebrow">{{ text.admin.mediaUpload }}</p>
                  <h4>{{ text.admin.uploadArtwork }}</h4>
                </div>
                <button class="admin-secondary-action" type="button" @click="openTrackArtworkPicker">
                  {{ text.admin.uploadArtwork }}
                </button>
              </div>
              <input ref="trackArtworkFileRef" class="hidden-file-input" type="file" accept="image/*" @change="onTrackArtworkSelected" />
              <label class="field field-wide">
                <span>{{ text.admin.artworkPath }}</span>
                <input v-model="trackForm.artworkPath" type="text" />
              </label>
              <p class="admin-help">{{ text.admin.artworkPathHelp }}</p>
            </div>

            <div class="admin-form-grid">
              <label class="field">
                <span>{{ text.admin.title }}</span>
                <input v-model="trackForm.title" type="text" />
              </label>
              <label class="field">
                <span>{{ text.admin.artist }}</span>
                <input v-model="trackForm.artist" type="text" />
              </label>
              <label class="field">
                <span>{{ text.admin.mood }}</span>
                <input v-model="trackForm.mood" type="text" />
              </label>
              <label class="field">
                <span>{{ text.admin.visibility }}</span>
                <select v-model="trackForm.visibility">
                  <option :value="text.admin.public">{{ text.admin.public }}</option>
                  <option :value="text.admin.private">{{ text.admin.private }}</option>
                </select>
              </label>
              <label class="field">
                <span>{{ text.admin.releaseLabel }}</span>
                <input v-model="trackForm.releaseLabel" type="text" />
              </label>
            </div>

            <label class="field field-wide">
              <span>{{ text.player.lyrics }}</span>
              <textarea v-model="trackForm.lyrics" rows="4" />
            </label>

            <button class="login-action" type="button" :disabled="adminBusy" @click="submitTrack">
              {{ adminBusy ? text.admin.saving : text.admin.saveTrack }}
            </button>
          </section>

          <section v-if="adminCards.release" class="admin-card">
            <div class="card-head">
              <div>
                <p class="eyebrow">{{ text.admin.releaseForm }}</p>
                <h3>{{ releaseForm.id ? releaseForm.title : text.admin.saveRelease }}</h3>
              </div>
            </div>

            <div class="admin-inline-actions">
              <button class="admin-secondary-action" type="button" @click="Object.assign(releaseForm, emptyRelease())">
                Reset
              </button>
            </div>

            <div class="admin-media-section">
              <div class="card-head">
                <div>
                  <p class="eyebrow">{{ text.admin.mediaUpload }}</p>
                  <h4>{{ text.admin.uploadArtwork }}</h4>
                </div>
                <button class="admin-secondary-action" type="button" @click="openReleaseMediaPicker">
                  {{ text.admin.uploadArtwork }}
                </button>
              </div>
              <input ref="releaseMediaFileRef" class="hidden-file-input" type="file" accept="image/*" @change="onReleaseMediaSelected" />
              <p class="admin-help">{{ text.admin.artworkUploadHelp }}</p>
              <label class="field field-wide">
                <span>{{ text.admin.artworkPath }}</span>
                <input v-model="releaseForm.artworkPath" type="text" />
              </label>
              <p class="admin-help">{{ text.admin.artworkPathHelp }}</p>
              <p v-if="releaseUploadBusy" class="admin-help">{{ text.admin.uploading }}</p>
            </div>

            <div class="admin-form-grid">
              <label class="field">
                <span>{{ text.admin.title }}</span>
                <input v-model="releaseForm.title" type="text" />
              </label>
              <label class="field">
                <span>{{ text.admin.slug }}</span>
                <input v-model="releaseForm.slug" type="text" />
              </label>
              <label class="field">
                <span>{{ text.admin.format }}</span>
                <select v-model="releaseForm.format">
                  <option value="single">single</option>
                  <option value="ep">ep</option>
                  <option value="album">album</option>
                  <option value="demo">demo</option>
                </select>
              </label>
              <label class="field">
                <span>{{ text.admin.visibility }}</span>
                <select v-model="releaseForm.visibility">
                  <option :value="text.admin.public">{{ text.admin.public }}</option>
                  <option :value="text.admin.private">{{ text.admin.private }}</option>
                </select>
              </label>
              <label class="field field-wide">
                <span>{{ text.admin.publishedAt }}</span>
                <input v-model="releaseForm.publishedAt" type="datetime-local" />
              </label>
              <label class="field field-wide">
                <span>{{ text.admin.trackIds }}</span>
                <select v-model="selectedReleaseTrackId" :disabled="!adminTrackOptions.length">
                  <option value="" disabled>
                    {{ adminTrackOptions.length ? text.admin.trackPicker : text.admin.noTracksYet }}
                  </option>
                  <option v-for="track in adminTrackOptions" :key="track.id" :value="track.id">
                    {{ track.label }}
                  </option>
                </select>
              </label>
              <div class="admin-inline-actions">
                <button class="admin-secondary-action" type="button" :disabled="!selectedReleaseTrackId" @click="addTrackToRelease">
                  {{ text.admin.trackPicker }}
                </button>
              </div>
              <div class="selected-track-chips">
                <button
                  v-for="trackId in releaseForm.trackIds"
                  :key="trackId"
                  class="selected-track-chip"
                  type="button"
                  @click="removeTrackFromRelease(trackId)"
                >
                  <span>{{ adminTrackOptions.find((track) => track.id === trackId)?.label ?? trackId }}</span>
                  <i class="pi pi-times" />
                </button>
                <p v-if="!releaseForm.trackIds.length" class="admin-help">{{ text.admin.noTracksYet }}</p>
              </div>
            </div>

            <label class="field field-wide">
              <span>{{ text.admin.notes }}</span>
              <textarea v-model="releaseForm.notes" rows="4" />
            </label>

            <button class="login-action" type="button" :disabled="adminBusy" @click="submitRelease">
              {{ adminBusy ? text.admin.saving : text.admin.saveRelease }}
            </button>
          </section>
        </div>

        <div class="admin-grid admin-grid-lower">
          <section v-if="adminCards.tracks" class="admin-card">
            <div class="card-head">
              <div>
                <p class="eyebrow">{{ text.admin.tracks }}</p>
                <h3>{{ text.admin.managedContent }}</h3>
              </div>
            </div>

            <div class="admin-list">
              <article v-for="track in tracks" :key="track.id" class="admin-list-item">
                <div>
                  <strong>{{ track.title }}</strong>
                  <p>{{ track.artist }}</p>
                  <p class="admin-muted">{{ track.releaseLabel }} · {{ track.visibility }}</p>
                </div>
                <div class="admin-item-actions">
                  <button class="admin-secondary-action" type="button" @click="editTrack(track)">
                    Edit
                  </button>
                  <button class="admin-danger-action" type="button" @click="removeTrack(track.id)">
                    Delete
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section v-if="adminCards.releases" class="admin-card">
            <div class="card-head">
              <div>
                <p class="eyebrow">{{ text.admin.releases }}</p>
                <h3>{{ text.admin.managedContent }}</h3>
              </div>
            </div>

            <div class="admin-list">
              <article v-for="release in releases" :key="release.id" class="admin-list-item">
                <div>
                  <strong>{{ release.title }}</strong>
                  <p>{{ release.slug }} · {{ release.format }}</p>
                  <p class="admin-muted">{{ release.visibility }} · {{ (release.tracks ?? []).length }} tracks</p>
                </div>
                <div class="admin-item-actions">
                  <button class="admin-secondary-action" type="button" @click="editRelease(release)">
                    Edit
                  </button>
                  <button class="admin-danger-action" type="button" @click="removeRelease(release.id)">
                    Delete
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>

        <section v-if="adminCards.media" class="admin-card media-library">
          <div class="card-head">
            <div>
              <p class="eyebrow">{{ text.admin.mediaAssets }}</p>
              <h3>{{ mediaAssets.length }} assets</h3>
            </div>
          </div>

          <div class="admin-list">
            <article v-for="asset in mediaAssets" :key="asset.id" class="admin-list-item">
              <div>
                <strong>{{ asset.originalName }}</strong>
                <p>{{ asset.category }} · {{ asset.mimeType }}</p>
                <p class="admin-muted">{{ asset.url }}</p>
              </div>
            </article>
            <p v-if="!mediaAssets.length" class="admin-muted">No media uploaded yet.</p>
          </div>
        </section>
      </div>
    </section>

    <BioSection :text="text" />

    <div id="discography" class="epk-discography-anchor">
    <MusicSection
      :text="text"
      :catalog-loading="catalogLoading"
      :current-track-id="currentTrackId ?? ''"
      :is-playing="isPlaying"
      :shuffle-enabled="shuffleEnabled"
      :tracks="displayTracks"
      @select-track="selectPlaybackTrack"
      @toggle-track="toggleTrackFromList"
      @toggle-shuffle="player.toggleShuffle()"
    />
    </div>

    <ExternalEmbedsSection :text="text" />

    <MiniPlayer
      v-if="showMiniPlayer"
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
