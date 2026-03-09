import { computed, ref } from "vue";
import { defineStore } from "pinia";

import { api } from "../lib/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value));
  const isAdmin = computed(() => user.value?.role === "admin");

  async function hydrate() {
    loading.value = true;
    try {
      const response = await api.getCurrentUser();
      user.value = response.user;
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function login(credentials) {
    loading.value = true;
    try {
      const response = await api.login(credentials);
      user.value = response.user;
      return response.user;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    loading.value = true;
    try {
      await api.logout();
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    hydrate,
    login,
    logout
  };
});
