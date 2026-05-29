export const messages = {
  en: {
    languageName: "EN",
    theme: {
      dark: "Dark",
      light: "Light",
      mode: "mode"
    },
    app: {
      eyebrow: "Patrizio Milione"
    },
    music: {
      eyebrow: "Music platform",
      heading: "Public listening and private creator controls.",
      summary:
        "Tracks and releases now come from the backend. Playback requests a signed URL. Admin login unlocks content management on the same page.",
      releases: "Releases",
      admin: "Admin",
      importTracks: "Import local tracks",
      loadingTracks: "Loading tracks...",
      music: "Music",
      songs: "songs",
      ascending: "Ascending",
      selected: "Selected",
      links: "Links",
      cue: "Cue"
    },
    player: {
      persistent: "Persistent Player",
      noTrackSelected: "No track selected",
      unreleased: "Unreleased",
      waitingReleases: "Waiting for releases...",
      noLyrics: "No lyrics available yet.",
      nowPlaying: "Now Playing",
      releaseLoading: "Release loading...",
      lyrics: "Lyrics",
      queue: "Queue"
    },
    auth: {
      adminSession: "Admin session",
      adminLogin: "Admin login",
      refreshAdminData: "Refresh admin data",
      logout: "Logout",
      signingIn: "Signing in...",
      login: "Login"
    },
    admin: {
      mediaUpload: "Media upload",
      category: "Category",
      uploadFile: "Upload file",
      uploading: "Uploading...",
      trackForm: "Track form",
      releaseForm: "Release form",
      managedContent: "Managed content",
      tracks: "Tracks",
      releases: "Releases",
      mediaAssets: "Media assets",
      title: "Title",
      artist: "Artist",
      mood: "Mood",
      duration: "Duration",
      visibility: "Visibility",
      storageKey: "Storage key",
      releaseLabel: "Release label",
      saveTrack: "Save track",
      slug: "Slug",
      format: "Format",
      artworkUrl: "Artwork URL",
      publishedAt: "Published at",
      trackIds: "Tracks in release",
      notes: "Notes",
      saveRelease: "Save release",
      useForTrack: "Use for track",
      useForRelease: "Use for release",
      audioUploadHelp: "Audio upload fills track storage key automatically.",
      artworkUploadHelp: "Artwork upload fills release artwork URL automatically.",
      storageKeyHelp: "Use uploaded audio URL or a hosted file path. This points to track audio.",
      trackPicker: "Add track",
      selectedTracks: "Selected tracks",
      noTracksYet: "No tracks available yet.",
      audio: "audio",
      artwork: "artwork",
      misc: "misc",
      public: "public",
      private: "private",
      saving: "Saving..."
    }
  },
  it: {
    languageName: "IT",
    theme: {
      dark: "Scuro",
      light: "Chiaro",
      mode: "tema"
    },
    app: {
      eyebrow: "Patrizio Milione"
    },
    music: {
      eyebrow: "Piattaforma musicale",
      heading: "Ascolto pubblico e controlli privati per il creator.",
      summary:
        "Tracce e release arrivano dal backend. La riproduzione richiede un URL firmato. Il login admin sblocca la gestione contenuti nella stessa pagina.",
      releases: "Release",
      admin: "Admin",
      importTracks: "Importa tracce locali",
      loadingTracks: "Caricamento tracce...",
      music: "Musica",
      songs: "brani",
      ascending: "Crescente",
      selected: "Selezionato",
      links: "Link",
      cue: "Avvia"
    },
    player: {
      persistent: "Player persistente",
      noTrackSelected: "Nessuna traccia selezionata",
      unreleased: "Non pubblicato",
      waitingReleases: "In attesa delle release...",
      noLyrics: "Nessun testo disponibile.",
      nowPlaying: "In riproduzione",
      releaseLoading: "Caricamento release...",
      lyrics: "Testo",
      queue: "Coda"
    },
    auth: {
      adminSession: "Sessione admin",
      adminLogin: "Login admin",
      refreshAdminData: "Aggiorna dati admin",
      logout: "Esci",
      signingIn: "Accesso in corso...",
      login: "Accedi"
    },
    admin: {
      mediaUpload: "Caricamento media",
      category: "Categoria",
      uploadFile: "Carica file",
      uploading: "Caricamento...",
      trackForm: "Modulo traccia",
      releaseForm: "Modulo release",
      managedContent: "Contenuti gestiti",
      tracks: "Tracce",
      releases: "Release",
      mediaAssets: "Asset media",
      title: "Titolo",
      artist: "Artista",
      mood: "Mood",
      duration: "Durata",
      visibility: "Visibilità",
      storageKey: "Chiave storage",
      releaseLabel: "Etichetta release",
      saveTrack: "Salva traccia",
      slug: "Slug",
      format: "Formato",
      artworkUrl: "URL artwork",
      publishedAt: "Pubblicato il",
      trackIds: "Tracce nella release",
      notes: "Note",
      saveRelease: "Salva release",
      useForTrack: "Usa per traccia",
      useForRelease: "Usa per release",
      audioUploadHelp: "Il caricamento audio compila automaticamente lo storage key della traccia.",
      artworkUploadHelp: "Il caricamento artwork compila automaticamente l'URL artwork della release.",
      storageKeyHelp: "Usa l'URL audio caricato o un percorso file ospitato. Qui punta all'audio della traccia.",
      trackPicker: "Aggiungi traccia",
      selectedTracks: "Tracce selezionate",
      noTracksYet: "Nessuna traccia disponibile.",
      audio: "audio",
      artwork: "artwork",
      misc: "misc",
      public: "pubblico",
      private: "privato",
      saving: "Salvataggio..."
    }
  }
};

export function getInitialLocale() {
  const storedLocale = typeof window !== "undefined" ? window.localStorage.getItem("portfolio-locale") : null;
  if (storedLocale === "en" || storedLocale === "it") return storedLocale;
  const browserLanguage = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
  return browserLanguage.startsWith("it") ? "it" : "en";
}
