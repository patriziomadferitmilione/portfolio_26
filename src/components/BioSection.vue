<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  text: {
    type: Object,
    default: () => ({})
  }
});

const expanded = ref(false);
const fullBioOpen = ref(false);

const bio = computed(() => props.text.bio ?? {});

function expandIntro() {
  expanded.value = true;
}

function toggleFullBio() {
  fullBioOpen.value = !fullBioOpen.value;
  expanded.value = true;
}
</script>

<template>
  <section class="bio-card" aria-labelledby="bio-title">

    <div class="bio-content">
      <p class="bio-eyebrow">{{ bio.eyebrow }}</p>
      <h2 id="bio-title">{{ bio.title }}</h2>
      <button
        class="bio-intro"
        type="button"
        :aria-expanded="expanded"
        aria-controls="bio-expanded"
        @click="expandIntro"
      >
        {{ bio.intro }}
      </button>

      <transition name="bio-reveal">
        <div v-if="expanded" id="bio-expanded" class="bio-expanded">
          <p v-for="paragraph in bio.expanded" :key="paragraph" v-html="paragraph" />

          <transition name="bio-reveal">
            <div v-if="fullBioOpen" class="bio-full">
              <p v-for="paragraph in bio.full" :key="paragraph" v-html="paragraph" />
            </div>
          </transition>

          <button class="bio-more" type="button" :aria-expanded="fullBioOpen" @click="toggleFullBio">
            {{ fullBioOpen ? bio.lessLabel : bio.moreLabel }}
          </button>
        </div>
      </transition>
    </div>
  </section>
</template>

<style scoped>
.bio-card {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  margin: 1rem 0 1.5rem;
  padding: 1rem;
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--panel) 92%, transparent), var(--panel-muted)),
    var(--panel);
  box-shadow: 0 1rem 2.5rem color-mix(in srgb, var(--accent-strong) 10%, transparent);
  overflow: hidden;
}

.bio-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 16%, transparent), transparent 36%),
    linear-gradient(180deg, transparent, color-mix(in srgb, var(--panel) 44%, transparent));
}

.bio-card > * {
  position: relative;
  z-index: 1;
}

.bio-content {
  min-width: 0;
}

.bio-eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0;
  text-transform: uppercase;
  color: var(--accent);
}

.bio-intro {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.bio-content h2 {
  margin: 0 0 0.42rem;
  font-size: clamp(1.45rem, 3vw, 2.25rem);
  line-height: 1.02;
  letter-spacing: 0;
  color: var(--page-text);
}

.bio-intro,
.bio-expanded p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.65;
}

.bio-intro {
  font-size: 1rem;
  max-width: 62rem;
}

.bio-expanded {
  display: grid;
  gap: 0.8rem;
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--line-soft);
}

.bio-expanded p {
  max-width: 66rem;
}

.bio-expanded :deep(a) {
  color: var(--accent);
  font-weight: 800;
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.18em;
}

.bio-full {
  display: grid;
  gap: 0.8rem;
}

.bio-more {
  justify-self: start;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--accent-strong);
  font-weight: 800;
  cursor: pointer;
}

.bio-more:hover {
  color: var(--accent);
}

.bio-reveal-enter-active,
.bio-reveal-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.bio-reveal-enter-from,
.bio-reveal-leave-to {
  opacity: 0;
  transform: translateY(-0.35rem);
}

@media (max-width: 620px) {
  .bio-card {
    grid-template-columns: 1fr;
    padding: 0.9rem;
  }
}
</style>
