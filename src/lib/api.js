const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4200/api";

async function request(path, options = {}) {
  const hasCustomContentType = options.headers?.["Content-Type"] || options.headers?.["content-type"];
  const defaultHeaders = hasCustomContentType || options.body instanceof FormData
    ? {}
    : { "Content-Type": "application/json" };

  // Get access code from localStorage for frontend-only auth
  const accessCode = localStorage.getItem("portfolio_access_code");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...(options.headers ?? {}),
      ...(accessCode ? { "X-Access-Code": accessCode } : {})
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
  getAdminMedia() {
    return request("/admin/media", { method: "GET" });
  },
  uploadMedia({ file, category }) {
    const body = new FormData();
    body.set("file", file);
    body.set("category", category);

    return request("/admin/media/upload", {
      method: "POST",
      body
    });
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
