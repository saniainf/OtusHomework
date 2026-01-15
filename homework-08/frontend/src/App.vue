<script setup>
import { onMounted, watch } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';
import AppHeader from './components/AppHeader.vue';
import { useBasketStore } from './stores/basketStore.js';
import { useAuthStore } from './stores/authStore.js';

const basket = useBasketStore();
const auth = useAuthStore();
const { isLoggedIn } = storeToRefs(auth);

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
