<script setup>
defineProps({
  text: {
    type: Object,
    default: () => ({})
  }
});

const galleryImages = [
  "https://images.unsplash.com/photo-1514525253361-bee87184919a?w=800&h=600&fit=crop", // Concert
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop", // DJ/Studio
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop", // Mic
  "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&h=600&fit=crop"  // Piano
];
</script>

<template>
  <div class="bio-container">
    <div class="bio-hero">
      <div class="hero-visual">
        <div class="main-image">
          <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&h=1200&fit=crop" alt="Profile" />
          <div class="image-overlay"></div>
        </div>
      </div>
      
      <div class="hero-content">
        <header class="bio-header">
          <p class="eyebrow">Creative & Engineer</p>
          <h1 class="bio-name">Patrizio<br/>Milione</h1>
        </header>
        <p class="lead">
          Bridging the gap between binary logic and melodic emotion.
        </p>
      </div>
    </div>

    <div class="bio-grid">
      <div class="bio-narrative">
        <section class="bio-section">
          <h3>The Journey</h3>
          <p>
            My story isn't a straight line; it's a polyrhythm. Born with a fascination for how things work, 
            I spent my early years dismantling electronics and my teenage years dismantling song structures. 
            Today, that duality defines my professional life as both a Senior Software Engineer and a 
            dedicated songwriter and performer.
          </p>
          <p>
            In the tech world, I specialize in building resilient, scalable cloud architectures and 
            intuitive user interfaces. I believe that code is a form of poetry—it requires the same 
            precision, flow, and attention to detail as a well-crafted verse. When I'm not optimizing 
            database queries or refactoring frontend components, you'll find me at the piano, 
            translating human experiences into frequencies.
          </p>
        </section>

        <section class="bio-section">
          <h3>Musical Philosophy</h3>
          <p>
            Music, to me, is the ultimate form of data synchronization. It's about getting a room full 
            of strangers to pulse at the same tempo, even if just for three minutes. My compositions 
            often explore themes of urban isolation, digital connection, and the persistent human 
            element in a hyper-connected world.
          </p>
          <p>
            Whether I'm busking on a rainy Tuesday or performing in a packed venue, the goal 
            remains constant: authenticity. I strive to strip away the noise and find the core 
            emotional truth of a moment, then wrap it in a melody that sticks.
          </p>
        </section>
      </div>

      <aside class="bio-gallery">
        <div v-for="(img, i) in galleryImages" :key="i" class="gallery-item">
          <img :src="img" :alt="'Gallery ' + i" />
        </div>
      </aside>
    </div>

    <div class="bio-extra">
      <section class="extra-block">
        <h4>Tech Stack</h4>
        <ul>
          <li>Vue / React / Angular</li>
          <li>Node.js / Fastify / Go</li>
          <li>PostgreSQL / Redis</li>
          <li>AWS / Docker / K8s</li>
        </ul>
      </section>
      <section class="extra-block">
        <h4>Influences</h4>
        <ul>
          <li>Radiohead</li>
          <li>Bon Iver</li>
          <li>James Blake</li>
          <li>Dieter Rams</li>
        </ul>
      </section>
      <section class="extra-block">
        <h4>Currently</h4>
        <p>Working on a new EP titled "Silicon Heart" and exploring the potential of AI in creative workflows.</p>
      </section>
    </div>

    <div class="bio-footer-stats">
       <div class="stat">
         <span class="stat-value">5+</span>
         <span class="stat-label">Years Experience</span>
       </div>
       <div class="stat">
         <span class="stat-value">20+</span>
         <span class="stat-label">Original Songs</span>
       </div>
       <div class="stat">
         <span class="stat-value">12k+</span>
         <span class="stat-label">Lines of Code</span>
       </div>
       <div class="stat">
         <span class="stat-value">∞</span>
         <span class="stat-label">Creative Spark</span>
       </div>
    </div>
  </div>
</template>

<style scoped>
.bio-container {
  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Section */
.bio-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  margin-bottom: 8rem;
}

.hero-visual {
  position: relative;
}

.main-image {
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.15);
  aspect-ratio: 4/5;
  background: var(--panel-muted);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.2, 0, 0.2, 1);
}

.main-image:hover img {
  transform: scale(1.05);
}

.bio-header {
  margin-bottom: 2rem;
}

.eyebrow {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: var(--accent);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.bio-name {
  font-size: clamp(3.5rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 0.95;
  margin: 0;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.lead {
  font-size: 1.75rem;
  line-height: 1.4;
  color: var(--text);
  font-weight: 600;
  max-width: 500px;
}

/* Narrative Grid */
.bio-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 6rem;
  margin-bottom: 8rem;
}

.bio-narrative {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.bio-section h3 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--accent-strong);
}

.bio-section p {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  opacity: 1;
}

.bio-gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  height: fit-content;
}

.gallery-item {
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--panel-muted);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* Extra Info Blocks */
.bio-extra {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  padding: 4rem;
  background: var(--panel-bg);
  border-radius: 40px;
  border: 1px solid var(--panel-border);
  margin-bottom: 6rem;
}

.extra-block h4 {
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
  color: var(--accent);
}

.extra-block ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.extra-block li {
  font-size: 1.1rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Footer Stats */
.bio-footer-stats {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 4rem 0;
  border-top: 1px solid var(--panel-border);
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
  letter-spacing: 0.1em;
}

@media (max-width: 900px) {
  .bio-hero, .bio-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-visual {
    max-width: 500px;
    margin: 0 auto;
  }
  
  .bio-extra {
    padding: 2rem;
  }
  
  .bio-footer-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}
</style>
