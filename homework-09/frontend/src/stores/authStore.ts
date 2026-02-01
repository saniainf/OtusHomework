import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

const LOCAL_KEY = 'homework-09.auth';

export const useAuthStore = defineStore('auth', () => {
  const authData = useLocalStorage(LOCAL_KEY, {
    name: '',
    token: '',
  });

  const userName = computed<string>(() => authData.value.name);
  const isLoggedIn = computed<boolean>(() => !!authData.value.token);

  function login(name: string, token: string): void {
    authData.value = { name, token };
  }

  function logout(): void {
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

