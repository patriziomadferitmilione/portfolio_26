<script setup>
defineProps({
  text: { type: Object, default: () => ({}) }
});
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
          <span>{{ item.title }}</span>
          <i class="pi pi-external-link" aria-hidden="true" />
        </a>
      </div>
    </article>

    <article class="external-card soundcloud-card">
      <header class="external-card-head">
        <div>
          <p class="external-eyebrow">SoundCloud</p>
          <h2>{{ text.externalEmbeds.soundcloudTitle }}</h2>
        </div>
        <i class="pi pi-cloud" aria-hidden="true" />
      </header>

      <iframe
        class="soundcloud-frame"
        title="Patrizio Milione on SoundCloud"
        scrolling="no"
        frameborder="no"
        allow="autoplay"
        :src="text.externalEmbeds.soundcloudEmbedUrl"
      />
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  min-height: 3.8rem;
  padding: 0.8rem 0.95rem;
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

.spotify-link i {
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
</style>
