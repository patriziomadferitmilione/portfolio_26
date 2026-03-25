import { computed, ref } from "vue";
import { defineStore } from "pinia";

const palette = [
  ["#003049", "#124662", "#96c0b7"],
  ["#8c1c13", "#fcbf49", "#96c0b7"],
  ["#124662", "#848586", "#fcbf49"],
  ["#96c0b7", "#003049", "#8c1c13"]
];

function normalizeTrack(track, index = 0) {
  return {
    id: track.id ?? `track-${Date.now()}-${index}`,
    title: track.title ?? "Untitled Track",
    artist: track.artist ?? "Patrizio Milione",
    mood: track.mood ?? "Unreleased",
    duration: track.duration ?? 0,
    releaseLabel: track.releaseLabel ?? "Draft",
    accent: track.accent ?? palette[index % palette.length],
    streamUrl: track.streamUrl ?? "",
    visibility: track.visibility ?? "public"
    ,lyrics: track.lyrics ?? track.notes ?? ""
  };
}

export const usePlayerStore = defineStore("player", () => {
  const tracks = ref([]);
  const queueOrder = ref([]);
  const history = ref([]);
  const currentTrackId = ref(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const volume = ref(80);
  const shuffleEnabled = ref(false);
  const repeatMode = ref("off");

  const currentTrack = computed(
    () => tracks.value.find((track) => track.id === currentTrackId.value) ?? null
  );
  const queue = computed(() => {
    const trackMap = new Map(tracks.value.map((track) => [track.id, track]));
    const ordered = queueOrder.value.map((id) => trackMap.get(id)).filter(Boolean);
    const missing = tracks.value.filter((track) => !queueOrder.value.includes(track.id));
    return [...ordered, ...missing];
  });
  const currentQueueIndex = computed(
    () => queue.value.findIndex((track) => track.id === currentTrackId.value)
  );

  const canPlayCurrent = computed(() => Boolean(currentTrack.value));

  function setTracks(items) {
    tracks.value = items.map(normalizeTrack);
    syncQueueOrder();
    if (!tracks.value.find((track) => track.id === currentTrackId.value)) {
      currentTrackId.value = tracks.value[0]?.id ?? null;
    }
  }

  function upsertTrack(track) {
    const normalized = normalizeTrack(track, tracks.value.length);
    const index = tracks.value.findIndex((item) => item.id === normalized.id);
    if (index === -1) {
      tracks.value = [normalized, ...tracks.value];
    } else {
      tracks.value[index] = {
        ...tracks.value[index],
        ...normalized
      };
      tracks.value = [...tracks.value];
    }

    if (!currentTrackId.value) {
      currentTrackId.value = normalized.id;
    }

    syncQueueOrder();
  }

  function removeTrack(trackId) {
    tracks.value = tracks.value.filter((track) => track.id !== trackId);
    queueOrder.value = queueOrder.value.filter((id) => id !== trackId);
    history.value = history.value.filter((id) => id !== trackId);
    if (currentTrackId.value === trackId) {
      currentTrackId.value = tracks.value[0]?.id ?? null;
      currentTime.value = 0;
      isPlaying.value = false;
    }
  }

  function setTrackStream(trackId, streamUrl) {
    const track = tracks.value.find((item) => item.id === trackId);
    if (!track) {
      return;
    }

    track.streamUrl = streamUrl;
    tracks.value = [...tracks.value];
  }

  function selectTrack(id, { pushHistory = true } = {}) {
    if (pushHistory && currentTrackId.value && currentTrackId.value !== id) {
      history.value = [...history.value, currentTrackId.value];
    }
    currentTrackId.value = id;
    currentTime.value = 0;
  }

  function setPlaying(value) {
    isPlaying.value = value;
  }

  function setCurrentTime(value) {
    currentTime.value = value;
  }

  function setVolume(value) {
    volume.value = value;
  }

  function playNext() {
    if (!queue.value.length) {
      return "none";
    }

    if (repeatMode.value === "one" && currentTrackId.value) {
      currentTime.value = 0;
      return "restart";
    }

    const currentIndex = currentQueueIndex.value;
    if (currentIndex === -1) {
      currentTrackId.value = queue.value[0]?.id ?? null;
      currentTime.value = 0;
      return currentTrackId.value ? "next" : "none";
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.value.length) {
      if (repeatMode.value === "all") {
        selectTrack(queue.value[0].id);
        return "next";
      }

      isPlaying.value = false;
      currentTime.value = 0;
      return "stop";
    }

    selectTrack(queue.value[nextIndex].id);
    return "next";
  }

  function playPrevious({ currentTime: elapsed = 0, restartThreshold = 3 } = {}) {
    if (!queue.value.length || !currentTrackId.value) {
      return "none";
    }

    if (elapsed > restartThreshold) {
      currentTime.value = 0;
      return "restart";
    }

    const previousTrackId = history.value.at(-1);
    if (previousTrackId && queue.value.some((track) => track.id === previousTrackId)) {
      history.value = history.value.slice(0, -1);
      currentTrackId.value = previousTrackId;
      currentTime.value = 0;
      return "previous";
    }

    const currentIndex = currentQueueIndex.value;
    if (currentIndex > 0) {
      currentTrackId.value = queue.value[currentIndex - 1].id;
      currentTime.value = 0;
      return "previous";
    }

    currentTime.value = 0;
    return "restart";
  }

  function toggleShuffle() {
    shuffleEnabled.value = !shuffleEnabled.value;
    syncQueueOrder();
  }

  function cycleRepeatMode() {
    repeatMode.value = repeatMode.value === "off"
      ? "all"
      : repeatMode.value === "all"
        ? "one"
        : "off";
  }

  function syncQueueOrder() {
    const ids = tracks.value.map((track) => track.id);

    if (!ids.length) {
      queueOrder.value = [];
      return;
    }

    if (!shuffleEnabled.value) {
      queueOrder.value = ids;
      return;
    }

    const currentId = currentTrackId.value && ids.includes(currentTrackId.value)
      ? currentTrackId.value
      : ids[0];
    const rest = ids.filter((id) => id !== currentId);
    shuffleArray(rest);
    queueOrder.value = [currentId, ...rest];
  }

  function shuffleArray(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }
  }

  function handleTrackEnded() {
    return playNext();
  }

  function importLocalFiles(files) {
    const imported = Array.from(files).map((file, index) =>
      normalizeTrack(
        {
          id: `local-${file.name}-${file.lastModified}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Local Upload",
          mood: "Draft",
          duration: 0,
          releaseLabel: "Local preview",
          accent: palette[index % palette.length],
          streamUrl: URL.createObjectURL(file)
        },
        index
      )
    );

    tracks.value = [...imported, ...tracks.value];
    syncQueueOrder();

    if (imported[0]) {
      currentTrackId.value = imported[0].id;
      currentTime.value = 0;
      isPlaying.value = false;
      history.value = [];
    }
  }

  return {
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
    canPlayCurrent,
    setTracks,
    upsertTrack,
    removeTrack,
    setTrackStream,
    selectTrack,
    setPlaying,
    setCurrentTime,
    setVolume,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeatMode,
    handleTrackEnded,
    importLocalFiles
  };
});
