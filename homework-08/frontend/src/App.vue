<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import { useBasketStore } from './stores/basketStore.js';
import { useAuthStore } from './stores/authStore.js';

const basket = useBasketStore();
const auth = useAuthStore();

// Загружаем корзину с бэка при старте приложения если пользователь авторизован
onMounted(() => {
  if (auth.isLoggedIn) {
    basket.fetchCart();
  }
});

</script>

<template>
  <AppHeader />
  <RouterView />
</template>

<style scoped></style>
