<script setup>
defineProps({
  text: { type: Object, default: () => ({}) }
});

function soundcloudAlbumEmbed(url) {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23fcbf49&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`;
}
</script>

<template>
  <section class="external-listening" aria-label="External listening">
    <article class="external-card spotify-card">
      <header class="external-card-head">
        <div>
          <p class="external-eyebrow">Spotify</p>
          <h2>{{ text.externalEmbeds.spotifyTitle }}</h2>
        </div>
        <i class="pi pi-spotify" aria-hidden="true" />
      </header>

      <div class="spotify-link-grid">
        <a
          v-for="item in text.externalEmbeds.spotifyItems"
          :key="item.title"
          class="spotify-link"
          :href="item.url"
          target="_blank"
          rel="noreferrer"
        >
          <img :src="item.artworkUrl" :alt="`${item.title} artwork`" class="spotify-artwork" loading="lazy" />
          <span class="spotify-link-copy">
            <span>{{ item.title }}</span>
            <small>{{ item.note }}</small>
          </span>
          <i class="pi pi-external-link spotify-link-icon" aria-hidden="true" />
        </a>
        <a class="spotify-link" :href="text.externalEmbeds.bandUrl" target="_blank" rel="noopener noreferrer">
          <span class="band-artwork" aria-hidden="true"><i class="pi pi-spotify" /></span>
          <span class="spotify-link-copy">
            <span>{{ text.externalEmbeds.bandTitle }}</span>
            <small>{{ text.externalEmbeds.bandNote }}</small>
          </span>
          <i class="pi pi-external-link spotify-link-icon" aria-hidden="true" />
        </a>
      </div>
    </article>

    <article class="external-card soundcloud-card">
      <header class="external-card-head">
        <div>
          <p class="external-eyebrow">SoundCloud</p>
          <h2>{{ text.externalEmbeds.selfProductionTitle }}</h2>
        </div>
        <i class="pi pi-cloud" aria-hidden="true" />
      </header>

      <div class="soundcloud-albums">
        <section v-for="album in text.externalEmbeds.soundcloudAlbums" :key="album.url" class="soundcloud-release">
          <h3>{{ album.title }}</h3>
          <iframe
            class="soundcloud-frame"
            :title="`${album.title} — Patrizio Milione on SoundCloud`"
            loading="lazy"
            allow="autoplay"
            :src="soundcloudAlbumEmbed(album.url)"
          />
          <a :href="album.url" target="_blank" rel="noopener noreferrer">{{ text.externalEmbeds.listenOnSoundcloud }} ↗</a>
        </section>
      </div>

      <section class="soundcloud-release soundcloud-demos">
        <h3>{{ text.externalEmbeds.soundcloudTitle }}</h3>
        <iframe
        class="soundcloud-frame"
        title="Patrizio Milione on SoundCloud"
        scrolling="no"
        frameborder="no"
        allow="autoplay"
        loading="lazy"
        :src="text.externalEmbeds.soundcloudEmbedUrl"
      />
        <a href="https://soundcloud.com/patrizio-milione" target="_blank" rel="noopener noreferrer">{{ text.externalEmbeds.listenOnSoundcloud }} ↗</a>
      </section>
    </article>
  </section>
</template>

<style scoped>
.external-listening {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.external-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 28px;
  border: 1px solid var(--panel-border);
  background:
    radial-gradient(circle at top right, var(--accent-soft), transparent 28%),
    linear-gradient(180deg, var(--panel) 0%, var(--panel-muted) 100%);
  box-shadow: 0 20px 60px rgba(0, 48, 73, 0.1);
}

.external-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.external-card-head h2,
.external-eyebrow {
  margin: 0;
}

.external-card-head h2 {
  margin-top: 0.2rem;
  font-size: clamp(1.4rem, 3vw, 2.1rem);
  line-height: 1;
  color: var(--page-text);
}

.external-card-head > i {
  font-size: 1.7rem;
  color: var(--accent);
}

.external-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.spotify-link-grid {
  display: grid;
  gap: 0.65rem;
}

.spotify-link {
  display: grid;
  grid-template-columns: 4.3rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.8rem;
  min-height: 5.1rem;
  padding: 0.55rem 0.8rem 0.55rem 0.55rem;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: color-mix(in srgb, var(--panel-muted) 82%, transparent);
  color: var(--page-text);
  font-weight: 800;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.spotify-link:hover {
  transform: translateX(4px);
  border-color: color-mix(in srgb, var(--accent) 42%, var(--panel-border));
  background: var(--accent-soft);
}

.spotify-artwork {
  display: block;
  width: 4.3rem;
  height: 4.3rem;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 12px 28px color-mix(in srgb, var(--accent-strong) 16%, transparent);
}

.spotify-link-copy {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
}

.spotify-link-copy span,
.spotify-link-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spotify-link-copy small {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
}

.spotify-link-icon {
  flex-shrink: 0;
  color: var(--accent);
}

.soundcloud-frame {
  display: block;
  width: 100%;
  min-height: 380px;
  border: 0;
  border-radius: 18px;
  overflow: hidden;
  background: var(--panel-muted);
}

@media (min-width: 900px) {
  .external-listening {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: start;
  }
}

/* EPK editorial treatment */
.external-listening {
  width: min(100% - 2.25rem, 1240px);
  margin: 0 auto;
  padding: clamp(4.25rem, 8vw, 7rem) 0;
  gap: 1px;
  background: var(--line-soft);
}

.external-card {
  gap: 1.5rem;
  padding: clamp(1.4rem, 3vw, 2.25rem);
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.spotify-card {
  background: var(--ink);
  color: var(--ivory);
}

.soundcloud-card {
  background: #ded2c0;
}

.external-card-head {
  align-items: flex-end;
  padding-bottom: 1.15rem;
  border-bottom: 1px solid currentColor;
}

.external-card-head h2 {
  margin: 0.3rem 0 0;
  font-family: Oswald, Impact, sans-serif;
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 600;
  line-height: 0.9;
  letter-spacing: -0.025em;
  text-transform: uppercase;
}

.spotify-card .external-card-head h2,
.spotify-card .external-card-head > i {
  color: var(--ivory);
}

.soundcloud-card .external-card-head h2 {
  color: var(--ink);
}

.external-eyebrow {
  color: var(--burgundy);
}

.external-card-head > i {
  font-size: 1.45rem;
  color: var(--burgundy);
}

.spotify-link-grid {
  gap: 0;
}

.spotify-link {
  grid-template-columns: 3.8rem minmax(0, 1fr) auto;
  gap: 0.8rem;
  min-height: 4.8rem;
  padding: 0.55rem 0;
  border: 0;
  border-bottom: 1px solid rgba(245, 241, 232, 0.25);
  border-radius: 0;
  background: transparent;
  color: var(--ivory);
}

.spotify-link:last-child {
  border-bottom: 0;
}

.spotify-link:hover {
  transform: none;
  border-color: var(--gold);
  background: transparent;
}

.spotify-artwork {
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 0;
  box-shadow: none;
}

.spotify-link-copy {
  gap: 0.25rem;
}

.spotify-link-copy small {
  color: rgba(245, 241, 232, 0.65);
}

.spotify-link-icon {
  color: var(--gold);
}

.soundcloud-frame {
  min-height: 380px;
  border-radius: 0;
  background: var(--ivory);
}
.external-listening {
  grid-template-columns: minmax(0, 1fr);
}

.external-card,
.soundcloud-release {
  min-width: 0;
}

.band-artwork {
  display: grid;
  place-items: center;
  width: 3.8rem;
  height: 3.8rem;
  background: var(--gold);
  color: var(--ink);
  font-size: 1.8rem;
}

.soundcloud-albums {
  display: grid;
  gap: 2rem;
}

.soundcloud-release {
  display: grid;
  gap: 1rem;
}

.soundcloud-release h3 {
  margin: 0;
  color: var(--ink);
  font-family: Oswald, Impact, sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.soundcloud-release a {
  color: var(--burgundy);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.soundcloud-demos {
  padding-top: 1.5rem;
  border-top: 1px solid var(--ink);
}

@media (min-width: 900px) {
  .soundcloud-albums {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
