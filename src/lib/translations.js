export const messages = {
  en: {
    languageName: "EN",
    mode: {
      software: "Software",
      music: "Music"
    },
    theme: {
      dark: "Dark",
      light: "Light",
      mode: "mode"
    },
    app: {
      eyebrow: "Patrizio Milione"
    },
    software: {
      eyebrow: "Software engineer",
      heading: "Frontend and backend now move together.",
      summary:
        "The music platform has real auth, catalog, releases, and admin endpoints. This frontend is now being shaped around that working backend instead of mock data only."
    },
    music: {
      eyebrow: "Music platform",
      heading: "Public listening and private creator controls.",
      summary:
        "Tracks and releases now come from the backend. Playback requests a signed URL. Admin login unlocks content management on the same page.",
      listen: "Listen",
      releases: "Releases",
      admin: "Admin",
      importTracks: "Import local tracks",
      loadingTracks: "Loading tracks...",
      catalog: "Catalog",
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
    softwareCards: {
      frontendSummary: "Public site and admin surface.",
      backendSummary: "Auth, tracks, releases, and playback authorization."
    },
    platformLinks: {
      soundcloud: "Current uploads and drafts",
      appleMusic: "Published releases",
      localApi: "Backend health and data endpoints"
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
      trackIds: "Track IDs",
      notes: "Notes",
      saveRelease: "Save release",
      useForTrack: "Use for track",
      useForRelease: "Use for release",
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
    mode: {
      software: "Software",
      music: "Musica"
    },
    theme: {
      dark: "Scuro",
      light: "Chiaro",
      mode: "tema"
    },
    app: {
      eyebrow: "Patrizio Milione"
    },
    software: {
      eyebrow: "Ingegnere software",
      heading: "Frontend e backend ora lavorano insieme.",
      summary:
        "La piattaforma musicale ha auth reale, catalogo, release ed endpoint admin. Questo frontend viene ora modellato su quel backend funzionante, non solo su dati finti."
    },
    music: {
      eyebrow: "Piattaforma musicale",
      heading: "Ascolto pubblico e controlli privati per il creator.",
      summary:
        "Tracce e release arrivano dal backend. La riproduzione richiede un URL firmato. Il login admin sblocca la gestione contenuti nella stessa pagina.",
      listen: "Ascolto",
      releases: "Release",
      admin: "Admin",
      importTracks: "Importa tracce locali",
      loadingTracks: "Caricamento tracce...",
      catalog: "Catalogo",
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
    softwareCards: {
      frontendSummary: "Sito pubblico e area admin.",
      backendSummary: "Auth, tracce, release e autorizzazione alla riproduzione."
    },
    platformLinks: {
      soundcloud: "Upload e bozze correnti",
      appleMusic: "Release pubblicate",
      localApi: "Salute backend ed endpoint dati"
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
      trackIds: "ID tracce",
      notes: "Note",
      saveRelease: "Salva release",
      useForTrack: "Usa per traccia",
      useForRelease: "Usa per release",
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
