<script setup>
import {computed, ref} from 'vue';

const props = defineProps({locale: {type: String, default: 'en'}, theme: {type: String, default: 'light'}, text: {type: Object, default: () => ({})}, menuOpen: {type: Boolean, default: false}});
const emit = defineEmits(['listen', 'close-menu', 'toggle-theme', 'toggle-locale', 'open-login']);
const activeFormation = ref(null);
const lightbox = ref(null);

const galleryImages = [
  {src: '/images/casting/portrait-07.jpg', label: 'Casting / 07', alt: 'Casting portrait of Patrizio Milione, image 7'},
  {src: '/images/casting/portrait-02.jpg', label: 'Casting / 02', alt: 'Casting portrait of Patrizio Milione, image 2'},
  {src: '/images/casting/portrait-03.jpg', label: 'Casting / 03', alt: 'Casting portrait of Patrizio Milione, image 3'},
  {src: '/images/casting/portrait-04.jpg', label: 'Casting / 04', alt: 'Casting portrait of Patrizio Milione, image 4'},
  {src: '/images/casting/portrait-05.jpg', label: 'Casting / 05', alt: 'Casting portrait of Patrizio Milione, image 5'},
  {src: '/images/casting/portrait-06.jpg', label: 'Casting / 06', alt: 'Casting portrait of Patrizio Milione, image 6'},
  {src: '/images/casting/portrait-01.jpeg', label: 'Casting / 01', alt: 'Casting portrait of Patrizio Milione, image 1'},
  {src: '/images/casting/portrait-08.jpg', label: 'Casting / 08', alt: 'Casting portrait of Patrizio Milione, image 8'}
];

const copy = {
  en: {
    nav: ['Artist', 'Journey', 'Live', 'Neon Strays', 'Music', 'Booking'],
    eyebrow: 'Artist / songwriter / performer',
    role: 'Singer-Songwriter · Pianist · Performer',
    listen: 'Listen now',
    scroll: 'Scroll to explore',
    portrait: 'Portrait\nplaceholder',
    imagePlaceholder: 'image placeholder',
    artist: 'The artist',
    title: 'An international\nmusical journey.',
    bio: ['Patrizio Milione is a singer-songwriter, multi-instrumentalist and international performer with more than fifteen years of experience across Italy, the United Kingdom and Australia.', 'Originally trained as a classical pianist, he later developed as a singer, guitarist, songwriter and live performer through hundreds of concerts, open mic nights, jam sessions and acoustic busking performances.', 'Today he develops his solo career alongside Neon Strays: an independent rock project where he is founder, songwriter, composer and creator of its music distribution ecosystem.'],
    stats: ['Years experience', 'Italy · UK · Australia', 'Original songs', 'Live formats'], countriesLabel: 'Countries',
    journey: 'From piano keys to stages',
    journeyTitle: 'A life in\nmovement.',
    live: 'On stage',
    liveTitle: 'Live formations.',
    liveLead: 'Flexible performances designed for rooms of every scale.',
    details: 'View details ↗',
    solo: 'Solo project',
    soloTitle: 'Songs with\nroom to breathe.',
    soloText: 'Original singer-songwriter material. Patrizio is currently producing his first solo album, drawing from more than 40 original demos and compositions.',
    productions: 'Productions ↘',
    independent: 'Independent by design',
    neonText: 'Independent rock project founded in 2025. Patrizio is its lead singer, songwriter, composer and creative director.',
    neonNote: 'Built on a direct relationship with listeners, independent distribution and creative freedom.',
    visit: 'Visit Neon Strays',
    watch: 'Watch video',
    media: 'Media & videos',
    mediaTitle: 'Sound in\nmotion.',
    featured: 'Featured performance',
    videos: 'Music videos',
    press: 'Interviews & press',
    soon: 'Coming soon',
    archive: 'Archive',
    galleryTitle: 'In frames.',
    booking: 'Bookings & collaborations',
    bookingTitle: 'Let’s make\nit live.',
    bookingItems: ['Festivals & concerts', 'Acoustic performances', 'Private events & collaborations', 'Teaching'],
    modal: ['Live formation', 'Typical duration', 'Ideal venues', 'Technical requirements', 'Available on request'],
    galleryPlaceholder: 'Gallery image placeholder',
    formations: [['Solo Acoustic', 'Voice + Acoustic Guitar', 'An intimate, songwriter-led set built around original material and carefully chosen covers.', '45–120 minutes', 'Listening rooms, bars, private events'], ['Piano & Voice', 'Voice + Piano', 'A dynamic piano-led performance for elegant rooms and focused audiences.', '45–90 minutes', 'Theatres, ceremonies, cultural events'], ['Acoustic Duo', 'Two Guitars + Two Voices', 'Harmonies, rhythm and a warm live atmosphere with an expanded acoustic sound.', '60–120 minutes', 'Festivals, venues, receptions'], ['Neon Strays', 'Full Rock Band', 'A direct, high-energy original rock show from the independent project founded by Patrizio.', '45–90 minutes', 'Clubs, festivals, headline shows'], ['Neon Strays Semi Acoustic', 'Voice · Piano · Bass · Drums', 'A stripped-back band arrangement with texture, dynamics and close connection.', '45–75 minutes', 'Showcases, galleries, intimate venues']],
    timeline: [['Age 6', 'Started piano studies.'], ['Age 13', 'First band as keyboard player.'], ['Age 17–18', 'Guitar, songwriting and first band as lead singer.'], ['London', 'Performed in tens of iconic venues like Water Rats, Half Moon, Barfly, Blues Kitchen, Spice of Life and Dublin Castle.'], ['Age 23', 'Returned to Turin, released first original recordings and started busking.'], ['Age 25', 'Moved to Sydney. Performed at Hard Rock Café Sydney and built a heavy busking practice.'], ['2024–26', 'Returned to music, founded Neon Strays, released an EP, won an emerging artist competition and began work on upcoming albums.']],
    gallery: ['Live / 01', 'Studio / 02', 'Busking / 03', 'Band / 04', 'Travel / 05', 'Live / 06']
  },
  it: {
    nav: ['Artista', 'Percorso', 'Live', 'Neon Strays', 'Musica', 'Booking'],
    eyebrow: 'Artista / autore / performer',
    role: 'Cantautore · Pianista · Performer',
    listen: 'Ascolta ora',
    scroll: 'Scopri il percorso',
    portrait: 'Ritratto\nsegnaposto',
    imagePlaceholder: 'immagine segnaposto',
    artist: "L’artista",
    title: 'Un percorso\nmusicale internazionale.',
    bio: ['Patrizio Milione è un cantautore, polistrumentista e performer internazionale con oltre quindici anni di esperienza tra Italia, Regno Unito e Australia.', 'Dopo una formazione classica al pianoforte, si è sviluppato come cantante, chitarrista, autore e performer attraverso centinaia di concerti, open mic, jam session ed esibizioni di busking acustico.', 'Oggi porta avanti il suo progetto solista insieme ai Neon Strays: progetto rock indipendente di cui è fondatore, autore, compositore e creatore dell’ecosistema di distribuzione musicale.'],
    stats: ['Anni di esperienza', 'Italia · Regno Unito · Australia', 'Brani originali', 'Formazioni live'], countriesLabel: 'Paesi',
    journey: 'Dal pianoforte al palco',
    journeyTitle: 'Una vita\nin movimento.',
    live: 'Sul palco',
    liveTitle: 'Formazioni live.',
    liveLead: 'Performance flessibili, pensate per spazi di ogni dimensione.',
    details: 'Scopri di più ↗',
    solo: 'Progetto solista',
    soloTitle: 'Canzoni con\nspazio per respirare.',
    soloText: 'Materiale originale da cantautore. Patrizio sta producendo il suo primo album solista, partendo da oltre 40 demo e composizioni originali.',
    productions: 'Produzioni ↘',
    independent: 'Indipendenti per scelta',
    neonText: 'Progetto rock indipendente fondato nel 2025. Patrizio ne è cantante, autore, compositore e direttore creativo.',
    neonNote: 'Un rapporto diretto con gli ascoltatori, distribuzione indipendente e libertà creativa.',
    visit: 'Visita Neon Strays',
    watch: 'Guarda il video',
    media: 'Media e video',
    mediaTitle: 'Suono in\nmovimento.',
    featured: 'Performance in evidenza',
    videos: 'Videoclip',
    press: 'Interviste e stampa',
    soon: 'In arrivo',
    archive: 'Archivio',
    galleryTitle: 'In immagini.',
    booking: 'Booking e collaborazioni',
    bookingTitle: 'Facciamolo\ndal vivo.',
    bookingItems: ['Festival e concerti', 'Performance acustiche', 'Eventi privati e collaborazioni', 'Insegnamento'],
    modal: ['Formazione live', 'Durata tipica', 'Location ideali', 'Esigenze tecniche', 'Disponibili su richiesta'],
    galleryPlaceholder: 'Immagine galleria segnaposto',
    formations: [['Solo Acoustic', 'Voce + Chitarra acustica', 'Un set intimo da cantautore, costruito su materiale originale e cover selezionate.', '45–120 minuti', 'Listening room, locali, eventi privati'], ['Piano & Voice', 'Voce + Pianoforte', 'Una performance dinamica guidata dal pianoforte, per spazi eleganti e pubblico attento.', '45–90 minuti', 'Teatri, cerimonie, eventi culturali'], ['Acoustic Duo', 'Due chitarre + due voci', 'Armonie, ritmo e un’atmosfera calda con un suono acustico più ricco.', '60–120 minuti', 'Festival, locali, ricevimenti'], ['Neon Strays', 'Rock band completa', 'Uno show rock originale, diretto ed energico del progetto indipendente fondato da Patrizio.', '45–90 minuti', 'Club, festival, headline show'], ['Neon Strays Semi Acoustic', 'Voce · Pianoforte · Basso · Batteria', 'Un arrangiamento di band essenziale, fatto di texture, dinamica e connessione.', '45–75 minuti', 'Showcase, gallerie, locali intimi']],
    timeline: [['6 anni', 'Inizio degli studi di pianoforte.'], ['13 anni', 'Prima band come tastierista.'], ['17–18 anni', 'Chitarra, scrittura e prima band come cantante.'], ['Londra', 'Esibizioni in decine di locali iconici come Water Rats, Half Moon, Barfly, Blues Kitchen, Spice of Life e Dublin Castle.'], ['23 anni', 'Rientro a Torino, prime registrazioni originali e inizio del busking.'], ['25 anni', 'Trasferimento a Sydney, esibizione all’Hard Rock Café e intensa attività di busking.'], ['2024–26', 'Ritorno alla musica, fondazione dei Neon Strays, uscita di un EP, vittoria di un concorso per emergenti e lavoro sui prossimi album.']],
    gallery: ['Live / 01', 'Studio / 02', 'Busking / 03', 'Band / 04', 'Viaggi / 05', 'Live / 06']
  }
};

const t = computed(() => copy[props.locale] ?? copy.en);
const formations = computed(() => t.value.formations.map(([name, format, detail, duration, venues]) => ({
  name,
  format,
  detail,
  duration,
  venues
})));

</script>

<template>
  <nav class="epk-nav" aria-label="Portfolio navigation">
    <div class="epk-nav-links"><a href="#artist">{{ t.nav[0] }}</a><a href="#journey">{{ t.nav[1] }}</a><a href="#live">{{
        t.nav[2]
      }}</a><a href="#neon">{{ t.nav[3] }}</a><a href="#discography">{{ t.nav[4] }}</a><a href="#booking">{{
        t.nav[5]
      }}</a></div>
  </nav>
  <transition name="epk-menu">
    <div v-if="menuOpen" id="epk-mobile-menu" class="epk-mobile-menu" role="dialog" aria-modal="true"
         aria-label="Portfolio navigation">
      <div class="epk-mobile-menu-head"><span>Patrizio Milione</span>
        <button type="button" aria-label="Close menu" @click="emit('close-menu')"><i class="pi pi-times"
                                                                                     aria-hidden="true"></i></button>
      </div>
      <div class="epk-mobile-menu-links"><a href="#artist" @click="emit('close-menu')">{{ t.nav[0] }}</a><a
          href="#journey" @click="emit('close-menu')">{{ t.nav[1] }}</a><a href="#live" @click="emit('close-menu')">{{
          t.nav[2]
        }}</a><a href="#neon" @click="emit('close-menu')">{{ t.nav[3] }}</a><a href="#discography"
                                                                               @click="emit('close-menu')">{{
          t.nav[4]
        }}</a><a href="#booking" @click="emit('close-menu')">{{ t.nav[5] }}</a></div>
      <div class="epk-mobile-menu-controls" aria-label="Site controls">
        <button type="button" @click="emit('toggle-locale')"><i class="pi pi-language" aria-hidden="true"></i><span>{{ locale === 'en' ? 'Italiano' : 'English' }}</span></button>
      </div>
    </div>
  </transition>
  <main class="epk">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-image" role="img" :aria-label="galleryImages[0].alt"/>
      <div class="hero-shade"/>
      <div class="hero-content"><p class="kicker light">{{ t.eyebrow }}</p>
        <h1 id="hero-title">Patrizio<br><em>Milione</em></h1>
        <p class="hero-role">{{ t.role }}</p>
        <p class="hero-location">Italy · United Kingdom · Australia</p>
        <div class="hero-actions">
          <button class="button button-light" @click="emit('listen')">{{ t.listen }}</button>
          <a class="button button-ghost" href="#booking">{{ t.nav[5] }}</a></div>
      </div>
      <a class="scroll-cue" href="#artist">{{ t.scroll }} <span>↓</span></a></section>
    <section id="artist" class="profile section-wrap">
      <div class="portrait-placeholder"><img :src="galleryImages[1].src" :alt="galleryImages[1].alt"></div>
      <div class="profile-copy"><p class="kicker">{{ t.artist }}</p>
        <h2>{{ t.title.split('\n')[0] }}<br><em>{{ t.title.split('\n')[1] }}</em></h2>
        <p class="lede">{{ t.bio[0] }}</p>
        <p>{{ t.bio[1] }}</p>
        <p>{{ t.bio[2] }}</p></div>
      <dl class="stats">
        <div>
          <dt>15+</dt>
          <dd>{{ t.stats[0] }}</dd>
        </div>
        <div class="country-stat">
          <dt>3 <span>{{ t.countriesLabel }}</span></dt>
          <dd>{{ t.stats[1] }}</dd>
        </div>
        <div>
          <dt>40+</dt>
          <dd>{{ t.stats[2] }}</dd>
        </div>
        <div>
          <dt>5</dt>
          <dd>{{ t.stats[3] }}</dd>
        </div>
      </dl>
    </section>
    <section id="journey" class="journey section-wrap"><p class="kicker">{{ t.journey }}</p>
      <h2>{{ t.journeyTitle.split('\n')[0] }}<br><em>{{ t.journeyTitle.split('\n')[1] }}</em></h2>
      <div class="timeline">
        <article v-for="([year, item]) in t.timeline" :key="year"><p>{{ year }}</p>
          <div><i></i><span>{{ item }}</span></div>
        </article>
      </div>
    </section>
    <section id="live" class="live section-wrap">
      <div class="section-heading"><p class="kicker">{{ t.live }}</p>
        <h2>{{ t.liveTitle.split(' ')[0] }} <em>{{ t.liveTitle.substring(t.liveTitle.indexOf(' ') + 1) }}</em></h2>
        <p>{{ t.liveLead }}</p></div>
      <div class="formation-grid">
        <button v-for="(formation, index) in formations" :key="formation.name" class="formation"
                @click="activeFormation = formation"><span>0{{ index + 1 }}</span>
          <h3>{{ formation.name }}</h3>
          <p>{{ formation.format }}</p><b>{{ t.details }}</b></button>
      </div>
    </section>
    <section class="solo split-feature">
      <div class="feature-art solo-art"><img :src="galleryImages[2].src" :alt="galleryImages[2].alt"></div>
      <div class="feature-copy"><p class="kicker">{{ t.solo }}</p>
        <h2>{{ t.soloTitle.split('\n')[0] }}<br><em>{{ t.soloTitle.split('\n')[1] }}</em></h2>
        <p>{{ t.soloText }}</p>
        <div class="text-links"><a href="https://soundcloud.com/patrizio-milione/sets/not-enough" target="_blank"
                                   rel="noopener">SoundCloud ↗</a><a
            href="https://open.spotify.com/artist/1swg1KeJpLrz6YIWjoBW7q" target="_blank" rel="noopener">Spotify ↗</a><a
            href="#discography">{{ t.productions }}</a></div>
      </div>
    </section>
    <section id="neon" class="neon section-wrap">
      <div><p class="kicker light">{{ t.independent }}</p>
        <h2>Neon<br><em>Strays.</em></h2>
        <p>{{ t.neonText }}</p>
        <p class="neon-note">{{ t.neonNote }}</p><a class="button button-light" href="https://neonstrays.com"
                                                    target="_blank" rel="noopener">{{ t.visit }}</a></div>
      <a class="video-card" href="https://www.youtube.com/watch?v=wyhorwkJpAM" target="_blank"
         rel="noopener"><span>{{ t.watch }}</span><strong>Let It Be Me</strong><i>▶</i></a></section>
    <section class="media section-wrap"><p class="kicker">{{ t.media }}</p>
      <h2>{{ t.mediaTitle.split('\n')[0] }}<br><em>{{ t.mediaTitle.split('\n')[1] }}</em></h2>
      <div class="media-grid"><a href="https://www.youtube.com/@PatrizioMilione" target="_blank" rel="noopener"
                                 class="media-tile"><span>{{ t.featured }}</span><b>Personal YouTube ↗</b></a><a
          href="https://www.youtube.com/@NeonStrays" target="_blank" rel="noopener"
          class="media-tile dark"><span>{{ t.videos }}</span><b>Neon Strays ↗</b></a>
        <div class="media-tile line"><span>{{ t.press }}</span><b>{{ t.soon }}</b></div>
      </div>
    </section>
    <section class="gallery section-wrap">
      <div class="section-heading"><p class="kicker">{{ t.archive }}</p>
        <h2>{{ t.galleryTitle.split(' ')[0] }} <em>{{ t.galleryTitle.substring(t.galleryTitle.indexOf(' ') + 1) }}</em>
        </h2></div>
      <div class="gallery-grid">
        <button v-for="image in galleryImages" :key="image.src" class="gallery-tile" :aria-label="`Open ${image.alt}`"
                @click="lightbox = image"><img :src="image.src" :alt="image.alt"><span>{{ image.label }}</span><i>+</i></button>
      </div>
    </section>
    <section id="booking" class="booking">
      <div class="booking-art" role="img" :aria-label="galleryImages[4].alt"></div>
      <div class="booking-copy"><p class="kicker light">{{ t.booking }}</p>
        <h2>{{ t.bookingTitle.split('\n')[0] }}<br><em>{{ t.bookingTitle.split('\n')[1] }}</em></h2>
        <p>Patrizio Milione<br>Singer-Songwriter · Pianist · Performer</p>
        <ul>
          <li v-for="item in t.bookingItems" :key="item">{{ item }}</li>
        </ul>
        <div class="booking-links"><a href="https://www.instagram.com/patriziomilione/" target="_blank" rel="noopener">Instagram</a><a
            href="https://www.youtube.com/@PatrizioMilione" target="_blank" rel="noopener">YouTube</a><a
            href="https://neonstrays.com" target="_blank" rel="noopener">Neon Strays</a></div>
      </div>
    </section>
  </main>
  <div v-if="activeFormation" class="modal-backdrop" @click.self="activeFormation = null">
    <article class="formation-modal">
      <button aria-label="Close details" @click="activeFormation = null">×</button>
      <p class="kicker">{{ t.modal[0] }}</p>
      <h2>{{ activeFormation.name }}</h2>
      <p class="modal-format">{{ activeFormation.format }}</p>
      <p>{{ activeFormation.detail }}</p>
      <dl>
        <div>
          <dt>{{ t.modal[1] }}</dt>
          <dd>{{ activeFormation.duration }}</dd>
        </div>
        <div>
          <dt>{{ t.modal[2] }}</dt>
          <dd>{{ activeFormation.venues }}</dd>
        </div>
        <div>
          <dt>{{ t.modal[3] }}</dt>
          <dd>{{ t.modal[4] }}</dd>
        </div>
      </dl>
    </article>
  </div>
  <div v-if="lightbox" class="modal-backdrop" @click="lightbox = null">
    <div class="lightbox" @click.stop>
      <button aria-label="Close gallery image" @click="lightbox = null">×</button>
      <img :src="lightbox.src" :alt="lightbox.alt"></div>
  </div>
</template>
