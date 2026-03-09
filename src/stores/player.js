import { computed, ref } from "vue";
import { defineStore } from "pinia";

const featuredTracks = [
  {
    id: "midnight-drive",
    title: "Midnight Drive",
    artist: "Patrizio Milione",
    mood: "Synthwave",
    duration: 231,
    accent: ["#ff6b6b", "#ff9f43", "#feca57"],
    streamUrl: ""
  },
  {
    id: "rome-after-rain",
    title: "Rome After Rain",
    artist: "Patrizio Milione",
    mood: "Ambient",
    duration: 274,
    accent: ["#54a0ff", "#5f27cd", "#341f97"],
    streamUrl: ""
  },
  {
    id: "glass-hearts",
    title: "Glass Hearts",
    artist: "Patrizio Milione",
    mood: "Alt Pop",
    duration: 208,
    accent: ["#1dd1a1", "#10ac84", "#222f3e"],
    streamUrl: ""
  }
];

function normalizeTrack(track, index = 0) {
  return {
    id: track.id ?? `track-${Date.now()}-${index}`,
    title: track.title ?? "Untitled Track",
    artist: track.artist ?? "Patrizio Milione",
    mood: track.mood ?? "Unreleased",
    duration: track.duration ?? 0,
    accent: track.accent ?? ["#c8d6e5", "#8395a7", "#222f3e"],
    streamUrl: track.streamUrl ?? "",
    artworkUrl: track.artworkUrl ?? ""
  };
}

export const usePlayerStore = defineStore("player", () => {
  const tracks = ref(featuredTracks.map(normalizeTrack));
  const currentTrackId = ref(tracks.value[0]?.id ?? null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const volume = ref(80);

  const currentTrack = computed(
    () => tracks.value.find((track) => track.id === currentTrackId.value) ?? null
  );

  const canPlayCurrent = computed(
    () => Boolean(currentTrack.value?.streamUrl)
  );

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

    const currentIndex = tracks.value.findIndex(
      (track) => track.id === currentTrackId.value
    );
    const nextIndex = currentIndex >= 0
      ? (currentIndex + 1) % tracks.value.length
      : 0;

    currentTrackId.value = tracks.value[nextIndex].id;
    currentTime.value = 0;
  }

  function playPrevious() {
    if (!tracks.value.length) {
      return;
    }

    const currentIndex = tracks.value.findIndex(
      (track) => track.id === currentTrackId.value
    );
    const previousIndex = currentIndex > 0
      ? currentIndex - 1
      : tracks.value.length - 1;

    currentTrackId.value = tracks.value[previousIndex].id;
    currentTime.value = 0;
  }

  function importLocalFiles(files) {
    const imported = Array.from(files).map((file, index) =>
      normalizeTrack({
        id: `local-${file.name}-${file.lastModified}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Local Upload",
        mood: "Draft",
        duration: 0,
        accent: featuredTracks[index % featuredTracks.length].accent,
        streamUrl: URL.createObjectURL(file)
      }, index)
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
    selectTrack,
    setPlaying,
    setCurrentTime,
    setVolume,
    playNext,
    playPrevious,
    importLocalFiles
  };
});
