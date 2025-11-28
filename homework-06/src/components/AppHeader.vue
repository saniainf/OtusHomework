<template>
  <header class="app-header">
    <div class="app-title">
      <h1 @click="navigateToHome">Homework-06</h1>
    </div>

    <div class="header-actions">
      <button v-if="!isLoggedIn && !isLoggedInPage" class="login-btn" @click="navigateToLogin">Войти</button>
      <div v-else>
        <span class="login-label">{{ userName }}</span>
        <button class="login-btn" @click="auth.logout()">Выйти</button>
      </div>
      <div class="basket-icon" @click="navigateToBasket">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="basket-count">{{ totalCount }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBasketStore } from '../stores/basketStore.js';
import { useAuthStore } from '../stores/authStore.js';

const router = useRouter();
const basket = useBasketStore();
const auth = useAuthStore();
const { totalCount } = storeToRefs(basket);
const { isLoggedIn, userName } = storeToRefs(auth);

const isLoggedInPage = computed(() => router.currentRoute.value.path === '/login');

function navigateToBasket() {
  if (basket.totalCount === 0) {
    return;
  }

  router.push('/basket');
}

function navigateToHome() {
  router.push('/');
}

function navigateToLogin() {
  router.push('/login');
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  margin-bottom: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-title h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
}

.app-title h1:hover {
  color: #42b983;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.login-label {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.login-btn {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.login-btn:hover {
  background-color: #36a372;
}

.basket-icon {
  position: relative;
  cursor: pointer;
  color: #2c3e50;
  transition: color 0.2s ease;
}

.basket-icon:hover {
  color: #42b983;
}

.basket-icon svg {
  display: block;
}

.basket-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #42b983;
  color: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
