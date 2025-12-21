import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

const LOCAL_KEY = 'homework-07.auth';

export const useAuthStore = defineStore('auth', () => {
  const authData = useLocalStorage(LOCAL_KEY, {
    name: '',
    token: '',
  });

  const userName = computed(() => authData.value.name);
  const isLoggedIn = computed(() => authData.value.token);

  function login(name, token) {
    authData.value = { name, token };
  }

  function logout() {
    authData.value = {
      name: '',
      token: '',
    };
  }

  return {
    authData,
    userName,
    isLoggedIn,
    login,
    logout,
  };
});

