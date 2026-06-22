<script setup>
import { ref } from 'vue';

const emit = defineEmits(['listen']);
const activeFormation = ref(null);
const lightbox = ref(null);

const formations = [
  { name: 'Solo Acoustic', format: 'Voice + Acoustic Guitar', detail: 'An intimate, songwriter-led set built around original material and carefully chosen covers.', duration: '45–120 minutes', venues: 'Listening rooms, bars, private events' },
  { name: 'Piano & Voice', format: 'Voice + Piano', detail: 'A dynamic piano-led performance for elegant rooms and focused audiences.', duration: '45–90 minutes', venues: 'Theatres, ceremonies, cultural events' },
  { name: 'Acoustic Duo', format: 'Two Guitars + Two Voices', detail: 'Harmonies, rhythm and a warm live atmosphere with an expanded acoustic sound.', duration: '60–120 minutes', venues: 'Festivals, venues, receptions' },
  { name: 'Neon Strays', format: 'Full Rock Band', detail: 'A direct, high-energy original rock show from the independent project founded by Patrizio.', duration: '45–90 minutes', venues: 'Clubs, festivals, headline shows' },
  { name: 'Neon Strays Semi Acoustic', format: 'Voice · Piano · Bass · Drums', detail: 'A stripped-back band arrangement with texture, dynamics and close connection.', duration: '45–75 minutes', venues: 'Showcases, galleries, intimate venues' }
];

const timeline = [
  ['Age 6', 'Started piano studies.'], ['Age 13', 'First band as keyboard player.'], ['Age 17–18', 'Guitar, songwriting and first band as lead singer.'], ['London', 'Performed at Water Rats, Half Moon, Barfly, Blues Kitchen, Spice of Life and Dublin Castle. Recorded an EP in Newcastle and performed in France for around 600 people.'], ['Age 23', 'Returned to Turin, released first original recordings and started busking.'], ['Age 25', 'Moved to Sydney. Performed at Hard Rock Café Sydney and built a heavy busking practice.'], ['2024–26', 'Returned to music, founded Neon Strays, released an EP, won an emerging artist competition and began work on upcoming albums.']
];

const gallery = ['Live / 01', 'Studio / 02', 'Busking / 03', 'Band / 04', 'Travel / 05', 'Live / 06'];
</script>

<template>
  <nav class="epk-nav" aria-label="Portfolio navigation">
    <a href="#artist">Artist</a><a href="#journey">Journey</a><a href="#live">Live</a><a href="#neon">Neon Strays</a><a href="#discography">Music</a><a href="#booking">Booking</a>
  </nav>

  <main class="epk">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-image" role="img" aria-label="Patrizio Milione portrait placeholder" />
      <div class="hero-shade" />
      <div class="hero-content">
        <p class="kicker light">Artist / songwriter / performer</p>
        <h1 id="hero-title">Patrizio<br><em>Milione</em></h1>
        <p class="hero-role">Singer-Songwriter · Pianist · Performer</p>
        <p class="hero-location">Italy · United Kingdom · Australia</p>
        <div class="hero-actions"><button class="button button-light" @click="emit('listen')">Listen now</button><a class="button button-ghost" href="#booking">Booking</a></div>
      </div>
      <a class="scroll-cue" href="#artist">Scroll to explore <span>↓</span></a>
    </section>

    <section id="artist" class="profile section-wrap">
      <div class="portrait-placeholder"><span>Portrait<br>placeholder</span></div>
      <div class="profile-copy"><p class="kicker">The artist</p><h2>An international<br><em>musical journey.</em></h2><p class="lede">Patrizio Milione is a singer-songwriter, multi-instrumentalist and international performer with more than fifteen years of experience across Italy, the United Kingdom and Australia.</p><p>Originally trained as a classical pianist, he later developed as a singer, guitarist, songwriter and live performer through hundreds of concerts, open mic nights, jam sessions and acoustic busking performances.</p><p>Today he develops his solo career alongside Neon Strays: an independent rock project where he is founder, songwriter, composer and creator of its music distribution ecosystem.</p></div>
      <dl class="stats"><div><dt>15+</dt><dd>Years experience</dd></div><div><dt>3</dt><dd>Italy · UK · Australia</dd></div><div><dt>40+</dt><dd>Original songs</dd></div><div><dt>5</dt><dd>Live formats</dd></div></dl>
    </section>

    <section id="journey" class="journey section-wrap"><p class="kicker">From piano keys to stages</p><h2>A life in<br><em>movement.</em></h2><div class="timeline"><article v-for="([year, copy]) in timeline" :key="year"><p>{{ year }}</p><div><i></i><span>{{ copy }}</span></div></article></div></section>

    <section id="live" class="live section-wrap"><div class="section-heading"><p class="kicker">On stage</p><h2>Live <em>formations.</em></h2><p>Flexible performances designed for rooms of every scale.</p></div><div class="formation-grid"><button v-for="formation in formations" :key="formation.name" class="formation" @click="activeFormation = formation"><span>0{{ formations.indexOf(formation) + 1 }}</span><h3>{{ formation.name }}</h3><p>{{ formation.format }}</p><b>View details ↗</b></button></div></section>

    <section class="solo split-feature"><div class="feature-art solo-art"><span>Solo project<br>image placeholder</span></div><div class="feature-copy"><p class="kicker">Solo project</p><h2>Songs with<br><em>room to breathe.</em></h2><p>Original singer-songwriter material. Patrizio is currently producing his first solo album, drawing from more than 40 original demos and compositions.</p><div class="text-links"><a href="https://soundcloud.com/patrizio-milione/sets/not-enough" target="_blank" rel="noopener">SoundCloud ↗</a><a href="https://open.spotify.com/artist/1swg1KeJpLrz6YIWjoBW7q" target="_blank" rel="noopener">Spotify ↗</a><a href="#discography">Productions ↘</a></div></div></section>

    <section id="neon" class="neon section-wrap"><div><p class="kicker light">Independent by design</p><h2>Neon<br><em>Strays.</em></h2><p>Independent rock project founded in 2025. Patrizio is its lead singer, songwriter, composer and creative director.</p><p class="neon-note">Built on a direct relationship with listeners, independent distribution and creative freedom.</p><a class="button button-light" href="https://neonstrays.com" target="_blank" rel="noopener">Visit Neon Strays</a></div><a class="video-card" href="https://www.youtube.com/watch?v=wyhorwkJpAM" target="_blank" rel="noopener"><span>Watch video</span><strong>Let It Be Me</strong><i>▶</i></a></section>

    <section class="media section-wrap"><p class="kicker">Media & videos</p><h2>Sound in<br><em>motion.</em></h2><div class="media-grid"><a href="https://www.youtube.com/@PatrizioMilione" target="_blank" rel="noopener" class="media-tile"><span>Featured performance</span><b>Personal YouTube ↗</b></a><a href="https://www.youtube.com/@NeonStrays" target="_blank" rel="noopener" class="media-tile dark"><span>Music videos</span><b>Neon Strays ↗</b></a><div class="media-tile line"><span>Interviews & press</span><b>Coming soon</b></div></div></section>

    <section class="gallery section-wrap"><div class="section-heading"><p class="kicker">Archive</p><h2>In <em>frames.</em></h2></div><div class="gallery-grid"><button v-for="(image, index) in gallery" :key="image" class="gallery-tile" :class="`tile-${index}`" @click="lightbox = image"><span>{{ image }}</span><i>+</i></button></div></section>

    <section id="booking" class="booking"><div class="booking-art"></div><div class="booking-copy"><p class="kicker light">Bookings & collaborations</p><h2>Let’s make<br><em>it live.</em></h2><p>Patrizio Milione<br>Singer-Songwriter · Pianist · Performer</p><ul><li>Festivals & concerts</li><li>Acoustic performances</li><li>Private events & collaborations</li><li>Teaching</li></ul><div class="booking-links"><a href="https://www.instagram.com/patriziomilione/" target="_blank" rel="noopener">Instagram</a><a href="https://www.youtube.com/@PatrizioMilione" target="_blank" rel="noopener">YouTube</a><a href="https://neonstrays.com" target="_blank" rel="noopener">Neon Strays</a></div></div></section>
  </main>

  <div v-if="activeFormation" class="modal-backdrop" @click.self="activeFormation = null"><article class="formation-modal"><button aria-label="Close details" @click="activeFormation = null">×</button><p class="kicker">Live formation</p><h2>{{ activeFormation.name }}</h2><p class="modal-format">{{ activeFormation.format }}</p><p>{{ activeFormation.detail }}</p><dl><div><dt>Typical duration</dt><dd>{{ activeFormation.duration }}</dd></div><div><dt>Ideal venues</dt><dd>{{ activeFormation.venues }}</dd></div><div><dt>Technical requirements</dt><dd>Available on request</dd></div></dl></article></div>
  <div v-if="lightbox" class="modal-backdrop" @click="lightbox = null"><div class="lightbox" @click.stop><button aria-label="Close gallery image" @click="lightbox = null">×</button><span>{{ lightbox }}<br><small>Gallery image placeholder</small></span></div></div>
</template>
