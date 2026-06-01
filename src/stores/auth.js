import { computed, ref } from "vue";
import { defineStore } from "pinia";

const STORAGE_KEY = "portfolio_access_code";

function sanitizeStoredCode(value) {
  if (!value || value === "undefined" || value === "null") {
    return "";
  }

  return value.trim();
}

export const useAuthStore = defineStore("auth", () => {
  const accessCode = ref(sanitizeStoredCode(localStorage.getItem(STORAGE_KEY)));
  const user = ref(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value) || Boolean(accessCode.value));
  const isAdmin = computed(() => user.value?.role === "admin" || Boolean(accessCode.value));

  function hydrate() {
    const normalized = sanitizeStoredCode(localStorage.getItem(STORAGE_KEY));
    accessCode.value = normalized;
    if (!normalized) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, normalized);
    }
  }

  function login(credentials = {}) {
    const code = sanitizeStoredCode(credentials.accessCode ?? credentials.password ?? "");
    if (!code) {
      throw new Error("Access code is required");
    }

    accessCode.value = code;
    localStorage.setItem(STORAGE_KEY, code);
    return { success: true };
  }

  function setUser(nextUser) {
    user.value = nextUser ?? null;
  }

  function logout() {
    user.value = null;
    accessCode.value = "";
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    user,
    accessCode,
    loading,
    isAuthenticated,
    isAdmin,
    hydrate,
    login,
    setUser,
    logout
  };
});
