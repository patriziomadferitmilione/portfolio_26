const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4200/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.error ?? "Request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const api = {
  getHealth() {
    return request("/health", { method: "GET" });
  },
  getTracks() {
    return request("/tracks", { method: "GET" });
  },
  getReleases() {
    return request("/releases", { method: "GET" });
  },
  authorizePlayback(trackId) {
    return request("/playback/authorize", {
      method: "POST",
      body: JSON.stringify({ trackId })
    });
  },
  getCurrentUser() {
    return request("/auth/me", { method: "GET" });
  },
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },
  logout() {
    return request("/auth/logout", { method: "POST" });
  },
  getAdminTracks() {
    return request("/admin/tracks", { method: "GET" });
  },
  createTrack(payload) {
    return request("/admin/tracks", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateTrack(trackId, payload) {
    return request(`/admin/tracks/${trackId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  deleteTrack(trackId) {
    return request(`/admin/tracks/${trackId}`, { method: "DELETE" });
  },
  getAdminReleases() {
    return request("/admin/releases", { method: "GET" });
  },
  createRelease(payload) {
    return request("/admin/releases", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateRelease(releaseId, payload) {
    return request(`/admin/releases/${releaseId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  deleteRelease(releaseId) {
    return request(`/admin/releases/${releaseId}`, { method: "DELETE" });
  }
};
