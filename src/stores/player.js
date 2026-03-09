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
  const currentTrackId = ref(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const volume = ref(80);

  const currentTrack = computed(
    () => tracks.value.find((track) => track.id === currentTrackId.value) ?? null
  );

  const canPlayCurrent = computed(() => Boolean(currentTrack.value));

  function setTracks(items) {
    tracks.value = items.map(normalizeTrack);
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
  }

  function removeTrack(trackId) {
    tracks.value = tracks.value.filter((track) => track.id !== trackId);
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

  function selectTrack(id) {
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
    if (!tracks.value.length) {
      return;
    }

    const currentIndex = tracks.value.findIndex((track) => track.id === currentTrackId.value);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % tracks.value.length : 0;
    currentTrackId.value = tracks.value[nextIndex].id;
    currentTime.value = 0;
  }

  function playPrevious() {
    if (!tracks.value.length) {
      return;
    }

    const currentIndex = tracks.value.findIndex((track) => track.id === currentTrackId.value);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : tracks.value.length - 1;
    currentTrackId.value = tracks.value[previousIndex].id;
    currentTime.value = 0;
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

    if (imported[0]) {
      currentTrackId.value = imported[0].id;
      currentTime.value = 0;
      isPlaying.value = false;
    }
  }

  return {
    tracks,
    currentTrack,
    currentTrackId,
    isPlaying,
    currentTime,
    volume,
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
    importLocalFiles
  };
});
