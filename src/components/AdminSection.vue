<script setup>
import { ref } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";

defineProps({
  isAuthenticated: Boolean,
  isAdmin: Boolean,
  busy: Boolean,
  uploadBusy: Boolean,
  tracks: Array,
  releases: Array,
  mediaAssets: Array,
  statusMessage: String,
  loginError: String,
  loginForm: Object,
  trackForm: Object,
  releaseForm: Object,
  uploadCategory: String
});

const emit = defineEmits([
  "login",
  "logout",
  "upload",
  "submit-track",
  "submit-release",
  "edit-track",
  "edit-release",
  "remove-track",
  "remove-release",
  "update-category"
]);

const mediaFileRef = ref(null);

function openMediaPicker() {
  mediaFileRef.value?.click();
}

const categories = [
  { label: "Audio", value: "audio" },
  { label: "Artwork", value: "artwork" },
  { label: "Misc", value: "misc" }
];

const visibilityOptions = [
  { label: "Public", value: "public" },
  { label: "Private", value: "private" }
];

const formatOptions = [
  { label: "Single", value: "single" },
  { label: "EP", value: "ep" },
  { label: "Album", value: "album" }
];
</script>

<template>
  <div class="admin-container">
    <div v-if="!isAdmin" class="admin-card login-card">
      <h2>Admin Access</h2>
      <p v-if="loginError" class="error-text">{{ loginError }}</p>
      <form @submit.prevent="emit('login')" class="admin-form">
        <div class="form-field">
          <label>Access Code</label>
          <InputText v-model="loginForm.accessCode" type="password" placeholder="••••••" required />
        </div>
        <Button type="submit" label="Access Dashboard" :loading="busy" class="w-full" />
      </form>
    </div>

    <div v-else class="admin-dashboard">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <Button label="Logout" icon="pi pi-sign-out" severity="secondary" @click="emit('logout')" />
      </header>

      <div v-if="statusMessage" class="status-bar" :class="{ error: statusMessage.includes('failed') }">
        {{ statusMessage }}
      </div>

      <div class="admin-grid">
        <!-- Media Upload Section -->
        <section class="admin-card">
          <h3>Media Assets</h3>
          <div class="upload-controls">
             <div class="form-field">
                <label>Category</label>
                <Select
                  :modelValue="uploadCategory"
                  @update:modelValue="emit('update-category', $event)"
                  :options="categories"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Category"
                />
             </div>
             <input type="file" ref="mediaFileRef" class="hidden" @change="emit('upload', $event)" />
             <Button
               label="Upload File"
               icon="pi pi-upload"
               :loading="uploadBusy"
               @click="openMediaPicker"
               class="w-full"
             />
          </div>

          <div class="asset-list">
            <div v-for="asset in mediaAssets" :key="asset.id" class="asset-item">
              <span class="asset-name" :title="asset.filename">{{ asset.originalName }}</span>
              <span class="asset-cat">{{ asset.category }}</span>
              <Button icon="pi pi-copy" severity="secondary" text size="small" @click="window.navigator.clipboard.writeText(asset.url)" />
            </div>
          </div>
        </section>

        <!-- Track Management Section -->
        <section class="admin-card">
          <h3>{{ trackForm.id ? 'Edit' : 'Create' }} Track</h3>
          <form @submit.prevent="emit('submit-track')" class="admin-form">
            <div class="form-field">
              <label>Title</label>
              <InputText v-model="trackForm.title" required />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Artist</label>
                <InputText v-model="trackForm.artist" required />
              </div>
              <div class="form-field">
                <label>Mood</label>
                <InputText v-model="trackForm.mood" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Duration (sec)</label>
                <InputText v-model="trackForm.duration" type="number" required />
              </div>
              <div class="form-field">
                <label>Visibility</label>
                <Select v-model="trackForm.visibility" :options="visibilityOptions" optionLabel="label" optionValue="value" />
              </div>
            </div>
            <div class="form-field">
              <label>Storage Key / URL</label>
              <InputText v-model="trackForm.storageKey" required />
            </div>
            <div class="form-field">
              <label>Release Label</label>
              <InputText v-model="trackForm.releaseLabel" required />
            </div>
            <div class="form-field">
              <label>Lyrics</label>
              <Textarea v-model="trackForm.lyrics" rows="5" placeholder="Enter lyrics here..." />
            </div>
            <div class="form-actions">
               <Button type="submit" :label="trackForm.id ? 'Update' : 'Create'" :loading="busy" />
               <Button v-if="trackForm.id" type="button" label="Cancel" severity="secondary" @click="emit('edit-track', {})" />
            </div>
          </form>

          <div class="item-list mt-4">
            <div v-for="track in tracks" :key="track.id" class="list-item">
              <div>
                <strong>{{ track.title }}</strong>
                <p>{{ track.artist }} • {{ track.visibility }}</p>
              </div>
              <div class="item-actions">
                <Button icon="pi pi-pencil" text @click="emit('edit-track', track)" />
                <Button icon="pi pi-trash" text severity="danger" @click="emit('remove-track', track.id)" />
              </div>
            </div>
          </div>
        </section>

        <!-- Release Management Section -->
        <section class="admin-card">
          <h3>{{ releaseForm.id ? 'Edit' : 'Create' }} Release</h3>
          <form @submit.prevent="emit('submit-release')" class="admin-form">
            <div class="form-field">
              <label>Title</label>
              <InputText v-model="releaseForm.title" required />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Slug</label>
                <InputText v-model="releaseForm.slug" required />
              </div>
              <div class="form-field">
                <label>Format</label>
                <Select v-model="releaseForm.format" :options="formatOptions" optionLabel="label" optionValue="value" />
              </div>
            </div>
            <div class="form-field">
              <label>Artwork URL</label>
              <InputText v-model="releaseForm.artworkUrl" required />
            </div>
            <div class="form-field">
              <label>Notes</label>
              <Textarea v-model="releaseForm.notes" rows="3" />
            </div>
            <div class="form-field">
              <label>Track IDs (comma separated)</label>
              <InputText v-model="releaseForm.trackIds" placeholder="id1, id2, id3" />
            </div>
            <div class="form-field">
              <label>Published At</label>
              <InputText v-model="releaseForm.publishedAt" type="datetime-local" />
            </div>
             <div class="form-field">
                <label>Visibility</label>
                <Select v-model="releaseForm.visibility" :options="visibilityOptions" optionLabel="label" optionValue="value" />
              </div>
            <div class="form-actions">
               <Button type="submit" :label="releaseForm.id ? 'Update' : 'Create'" :loading="busy" />
               <Button v-if="releaseForm.id" type="button" label="Cancel" severity="secondary" @click="emit('edit-release', {})" />
            </div>
          </form>

          <div class="item-list mt-4">
            <div v-for="rel in releases" :key="rel.id" class="list-item">
              <div>
                <strong>{{ rel.title }}</strong>
                <p>{{ rel.format }} • {{ rel.visibility }}</p>
              </div>
              <div class="item-actions">
                <Button icon="pi pi-pencil" text @click="emit('edit-release', rel)" />
                <Button icon="pi pi-trash" text severity="danger" @click="emit('remove-release', rel.id)" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;
}

.admin-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.login-card {
  max-width: 400px;
  margin: 10vh auto;
  text-align: center;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
}

.form-field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.status-bar {
  padding: 1rem;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.status-bar.error {
  background: #fee2e2;
  color: #b91c1c;
}

.hidden {
  display: none;
}

.asset-list, .item-list {
  margin-top: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  border-top: 1px solid var(--panel-border);
  padding-top: 1rem;
}

.asset-item, .list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem;
  border-bottom: 1px solid var(--panel-border);
  font-size: 0.9rem;
}

.asset-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 1rem;
}

.asset-cat {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: var(--panel-muted);
  border-radius: 999px;
  margin-right: 0.5rem;
}

.list-item p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.mt-4 {
  margin-top: 1rem;
}

.w-full {
  width: 100%;
}

.hidden {
  display: none;
}
</style>
