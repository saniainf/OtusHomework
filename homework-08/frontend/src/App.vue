<script setup>
import { onMounted, watch, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import AppHeader from './components/AppHeader.vue';
import { useBasketStore } from './stores/basketStore.js';
import { useAuthStore } from './stores/authStore.js';

const basket = useBasketStore();
const auth = useAuthStore();
const { isLoggedIn } = storeToRefs(auth);

// При монтировании проверяем авторизацию и инициализируем WebSocket
onMounted(() => {
  if (auth.isLoggedIn) {
    // Инициализируем WebSocket с токеном и загружаем корзину
    basket.initWebSocket(auth.authData.token);
    basket.fetchCart();
  }
});

// Следим за изменением статуса авторизации
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    // Пользователь залогинился — инициализируем WebSocket и загружаем корзину
    basket.initWebSocket(auth.authData.token);
    basket.fetchCart();
  } else {
    // Пользователь вышел — очищаем WebSocket и корзину
    basket.cleanupWebSocket();
  }
});

// При уничтожении приложения закрываем WebSocket
onUnmounted(() => {
  basket.cleanupWebSocket();
});
</script>

<template>
  <AppHeader />
  <RouterView />
</template>

<style scoped></style>
