import { computed, ref } from "vue";
import { defineStore } from "pinia";

const STORAGE_KEY = "portfolio_access_code";

export const useAuthStore = defineStore("auth", () => {
  const accessCode = ref(localStorage.getItem(STORAGE_KEY) || "");
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(accessCode.value));
  const isAdmin = computed(() => Boolean(accessCode.value)); // Any code unlocks for now, backend will verify actual value

  function hydrate() {
    // No-op for this mode, but kept for compatibility
  }

  function login({ accessCode: code }) {
    accessCode.value = code;
    localStorage.setItem(STORAGE_KEY, code);
    return { success: true };
  }

  function logout() {
    accessCode.value = "";
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    accessCode,
    loading,
    isAuthenticated,
    isAdmin,
    hydrate,
    login,
    logout
  };
});
