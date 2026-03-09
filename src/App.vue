<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Card from "primevue/card";
import Tag from "primevue/tag";
import { api } from "./lib/api";
import ExpandedPlayer from "./components/player/ExpandedPlayer.vue";
import MiniPlayer from "./components/player/MiniPlayer.vue";
import { useAuthStore } from "./stores/auth";
import { usePlayerStore } from "./stores/player";

const auth = useAuthStore();
const player = usePlayerStore();
const { user, loading: authLoading, isAuthenticated, isAdmin } = storeToRefs(auth);
const { tracks, currentTrack, currentTrackId, isPlaying, currentTime, volume, canPlayCurrent } = storeToRefs(player);

const activeMode = ref("music");
const musicTab = ref("listen");
const theme = ref(getInitialTheme());
const playerExpanded = ref(false);
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
const progress = computed(() => {
  const duration = currentTrack.value?.duration ?? 0;
  return duration ? Math.min(100, Math.round((currentTime.value / duration) * 100)) : 0;
});
const currentRelease = computed(() => releases.value.find((release) => release.tracks?.some((track) => track.id === currentTrackId.value)) ?? releases.value[0] ?? null);
const currentLyrics = computed(() => currentTrack.value?.lyrics || currentRelease.value?.notes || "No lyrics available yet.");

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

onMounted(async () => {
  await auth.hydrate();
  await refreshCatalog();
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

onBeforeUnmount(() => audioRef.value?.pause());
</script>

<template>
  <div class="app-shell" :data-mode="activeMode">
    <audio ref="audioRef" preload="metadata" @timeupdate="handleTimeUpdate" @loadedmetadata="handleLoadedMetadata" @ended="player.playNext()" />

    <header class="mode-header">
      <p class="eyebrow centered">Patrizio Milione</p>
      <div class="header-controls">
        <div class="mode-toggle">
          <button class="mode-option" :class="{ active: activeMode === 'software' }" @click="activeMode = 'software'">Software</button>
          <button class="mode-option" :class="{ active: activeMode === 'music' }" @click="activeMode = 'music'">Music</button>
        </div>
        <button class="theme-toggle" @click="theme = theme === 'dark' ? 'light' : 'dark'">
          <i :class="theme === 'dark' ? 'pi pi-moon' : 'pi pi-sun'" /> {{ theme === 'dark' ? 'Dark' : 'Light' }} mode
        </button>
      </div>
    </header>

    <section v-if="activeMode === 'software'" class="mode-page">
      <section class="hero solo-hero">
        <div class="hero-copy wide-copy">
          <p class="eyebrow">Software engineer</p>
          <h1>Frontend and backend now move together.</h1>
          <p class="hero-text">The music platform has real auth, catalog, releases, and admin endpoints. This frontend is now being shaped around that working backend instead of mock data only.</p>
        </div>
      </section>
      <section class="software-grid">
        <a v-for="project in softwareProjects" :key="project.title" class="project-card" :href="project.href" target="_blank" rel="noreferrer">
          <div class="card-icon-wrap"><i :class="project.icon" class="card-icon" /></div>
          <p class="project-type">{{ project.type }}</p>
          <h3>{{ project.title }}</h3>
          <p>{{ project.summary }}</p>
          <div class="stack-list"><span v-for="item in project.stack" :key="item">{{ item }}</span></div>
        </a>
      </section>
    </section>

    <section v-else class="mode-page music-page">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Music platform</p>
          <h1>Public listening and private creator controls.</h1>
          <p class="hero-text">Tracks and releases now come from the backend. Playback requests a signed URL. Admin login unlocks content management on the same page.</p>
          <div class="hero-actions">
            <button class="action-link action-link-primary" @click="musicTab = 'listen'">Listen</button>
            <button class="action-link action-link-contrast" @click="musicTab = 'releases'">Releases</button>
            <button class="action-link action-link-contrast" @click="musicTab = 'admin'">Admin</button>
            <Button label="Import local tracks" icon="pi pi-upload" text @click="openFilePicker" />
          </div>
          <input ref="fileInputRef" class="hidden-input" type="file" accept="audio/*" multiple @change="onFilesSelected" />
          <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>
        </div>

        <Card class="hero-player hero-player-summary">
          <template #content>
            <button class="hero-player-launch" @click="openPlayer">
              <div class="cover-art" :style="{ background: `linear-gradient(135deg, ${currentTrack?.accent?.[0] ?? 'var(--cover-start)'}, ${currentTrack?.accent?.[1] ?? 'var(--cover-mid)'}, ${currentTrack?.accent?.[2] ?? 'var(--cover-end)'})` }">
                <div class="cover-overlay">
                  <Tag :value="currentTrack?.mood ?? 'No track'" severity="contrast" />
                  <div>
                    <p class="cover-label">Persistent Player</p>
                    <h2>{{ currentTrack?.title ?? "No track selected" }}</h2>
                    <p>{{ currentTrack?.artist ?? "Patrizio Milione" }}</p>
                    <p class="cover-note">{{ currentRelease?.title ?? "Waiting for releases..." }}</p>
                  </div>
                </div>
              </div>
            </button>
          </template>
        </Card>
      </section>

      <nav class="subnav">
        <button class="subnav-item" :class="{ active: musicTab === 'listen' }" @click="musicTab = 'listen'"><i class="pi pi-headphones" /><span>Listen</span></button>
        <button class="subnav-item" :class="{ active: musicTab === 'releases' }" @click="musicTab = 'releases'"><i class="pi pi-disc" /><span>Releases</span></button>
        <button class="subnav-item" :class="{ active: musicTab === 'admin' }" @click="musicTab = 'admin'"><i class="pi pi-lock" /><span>Admin</span></button>
      </nav>

      <section v-if="musicTab === 'listen'" class="minimal-music-grid">
        <Card class="panel listening-panel">
          <template #title>Catalog</template>
          <template #content>
            <div v-if="catalogLoading" class="empty-state">Loading tracks...</div>
            <div v-else class="track-grid">
              <button v-for="track in tracks" :key="track.id" class="track-card" :class="{ active: track.id === currentTrackId }" @click="player.selectTrack(track.id)">
                <div class="track-art" :style="{ backgroundImage: `linear-gradient(135deg, ${track.accent.join(', ')})` }" />
                <div class="track-copy">
                  <p class="track-title">{{ track.title }}</p>
                  <p class="track-meta">{{ track.artist }}</p>
                </div>
                <Tag :value="track.visibility" :severity="track.visibility === 'public' ? 'success' : 'warn'" />
              </button>
            </div>
          </template>
        </Card>
        <Card class="panel quiet-panel">
          <template #title>Links</template>
          <template #content>
            <div class="platform-list minimal-platform-list">
              <a v-for="item in platformLinks" :key="item.label" class="platform-card minimal-platform-card" :href="item.href" target="_blank" rel="noreferrer">
                <strong class="platform-label"><i :class="item.icon" class="section-icon" /><span>{{ item.label }}</span></strong>
                <span>{{ item.note }}</span>
              </a>
            </div>
          </template>
        </Card>
      </section>

      <section v-else-if="musicTab === 'releases'" class="release-grid">
        <Card v-for="release in releases" :key="release.id" class="panel release-card">
          <template #title><div class="panel-title"><i class="pi pi-disc section-icon" /><span>{{ release.title }}</span></div></template>
          <template #content>
            <p class="release-meta">{{ release.format }} · {{ release.visibility }}</p>
            <p>{{ release.notes }}</p>
            <div class="release-track-list">
              <div v-for="track in release.tracks" :key="track.id" class="release-track-row">
                <span>{{ track.title }}</span>
                <button class="text-action" @click="player.selectTrack(track.id)">Cue</button>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <section v-else class="admin-grid">
        <Card class="panel">
          <template #title><div class="panel-title"><i class="pi pi-user section-icon" /><span>{{ isAuthenticated ? "Admin session" : "Admin login" }}</span></div></template>
          <template #content>
            <div v-if="isAuthenticated" class="session-box">
              <p class="session-name">{{ user?.displayName }}</p>
              <p class="session-role">{{ user?.email }} · {{ user?.role }}</p>
              <div class="form-actions">
                <Button label="Refresh admin data" icon="pi pi-refresh" text @click="refreshAdminData" />
                <Button label="Logout" icon="pi pi-sign-out" severity="contrast" @click="logout" />
              </div>
            </div>
            <form v-else class="form-grid" @submit.prevent="submitLogin">
              <label class="form-field"><span>Email</span><input v-model="loginForm.email" type="email" /></label>
              <label class="form-field"><span>Password</span><input v-model="loginForm.password" type="password" /></label>
              <p v-if="loginError" class="form-error">{{ loginError }}</p>
              <Button :label="authLoading ? 'Signing in...' : 'Login'" icon="pi pi-lock-open" :disabled="authLoading" type="submit" />
            </form>
          </template>
        </Card>

        <template v-if="isAdmin">
          <Card class="panel">
            <template #title>Media upload</template>
            <template #content>
              <div class="form-grid">
                <label class="form-field">
                  <span>Category</span>
                  <select v-model="uploadCategory">
                    <option value="audio">audio</option>
                    <option value="artwork">artwork</option>
                    <option value="misc">misc</option>
                  </select>
                </label>
                <div class="form-actions">
                  <Button :label="uploadBusy ? 'Uploading...' : 'Upload file'" icon="pi pi-upload" :disabled="uploadBusy" @click="openMediaPicker" />
                </div>
                <input ref="mediaFileRef" class="hidden-input" type="file" @change="onMediaSelected" />
              </div>
            </template>
          </Card>

          <Card class="panel">
            <template #title>Track form</template>
            <template #content>
              <form class="form-grid" @submit.prevent="submitTrack">
                <label class="form-field"><span>Title</span><input v-model="trackForm.title" type="text" /></label>
                <label class="form-field"><span>Artist</span><input v-model="trackForm.artist" type="text" /></label>
                <label class="form-field"><span>Mood</span><input v-model="trackForm.mood" type="text" /></label>
                <label class="form-field"><span>Duration</span><input v-model="trackForm.duration" type="number" min="0" /></label>
                <label class="form-field"><span>Visibility</span><select v-model="trackForm.visibility"><option value="public">public</option><option value="private">private</option></select></label>
                <label class="form-field span-full"><span>Storage key</span><input v-model="trackForm.storageKey" type="text" /></label>
                <label class="form-field span-full"><span>Release label</span><input v-model="trackForm.releaseLabel" type="text" /></label>
                <div class="form-actions span-full"><Button :label="adminBusy ? 'Saving...' : 'Save track'" icon="pi pi-save" :disabled="adminBusy" type="submit" /></div>
              </form>
            </template>
          </Card>

          <Card class="panel">
            <template #title>Release form</template>
            <template #content>
              <form class="form-grid" @submit.prevent="submitRelease">
                <label class="form-field"><span>Title</span><input v-model="releaseForm.title" type="text" /></label>
                <label class="form-field"><span>Slug</span><input v-model="releaseForm.slug" type="text" /></label>
                <label class="form-field"><span>Format</span><select v-model="releaseForm.format"><option value="single">single</option><option value="ep">ep</option><option value="album">album</option><option value="demo">demo</option></select></label>
                <label class="form-field"><span>Visibility</span><select v-model="releaseForm.visibility"><option value="public">public</option><option value="private">private</option></select></label>
                <label class="form-field span-full"><span>Artwork URL</span><input v-model="releaseForm.artworkUrl" type="text" /></label>
                <label class="form-field span-full"><span>Published at</span><input v-model="releaseForm.publishedAt" type="datetime-local" /></label>
                <label class="form-field span-full"><span>Track IDs</span><input v-model="releaseForm.trackIds" type="text" /></label>
                <label class="form-field span-full"><span>Notes</span><textarea v-model="releaseForm.notes" rows="4" /></label>
                <div class="form-actions span-full"><Button :label="adminBusy ? 'Saving...' : 'Save release'" icon="pi pi-save" :disabled="adminBusy" type="submit" /></div>
              </form>
            </template>
          </Card>

          <Card class="panel span-2">
            <template #title>Managed content</template>
            <template #content>
              <div class="admin-lists">
                <div>
                  <p class="admin-list-title">Tracks</p>
                  <div v-for="track in tracks" :key="track.id" class="admin-item">
                    <div><strong>{{ track.title }}</strong><p>{{ track.id }} · {{ track.visibility }}</p></div>
                    <div class="inline-actions"><button class="text-action" @click="editTrack(track)">Edit</button><button class="text-action danger" @click="removeTrack(track.id)">Delete</button></div>
                  </div>
                </div>
                <div>
                  <p class="admin-list-title">Releases</p>
                  <div v-for="release in releases" :key="release.id" class="admin-item">
                    <div><strong>{{ release.title }}</strong><p>{{ release.slug }} · {{ release.format }}</p></div>
                    <div class="inline-actions"><button class="text-action" @click="editRelease(release)">Edit</button><button class="text-action danger" @click="removeRelease(release.id)">Delete</button></div>
                  </div>
                </div>
                <div>
                  <p class="admin-list-title">Media assets</p>
                  <div v-for="asset in mediaAssets" :key="asset.id" class="admin-item">
                    <div><strong>{{ asset.originalName }}</strong><p>{{ asset.category }} · {{ asset.url }}</p></div>
                    <div class="inline-actions">
                      <button class="text-action" @click="trackForm.storageKey = asset.url">Use for track</button>
                      <button class="text-action" @click="releaseForm.artworkUrl = asset.url">Use for release</button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </template>
      </section>
    </section>

    <MiniPlayer
      v-if="activeMode === 'music'"
      :track="currentTrack"
      :is-playing="isPlaying"
      :current-time-label="formattedTime"
      :duration-label="formattedDuration"
      :progress="progress"
      :disabled="!canPlayCurrent"
      @toggle="togglePlayback"
      @next="player.playNext()"
      @previous="player.playPrevious()"
      @expand="openPlayer"
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
