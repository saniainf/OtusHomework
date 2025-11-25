<script setup>
import { useCounterStore } from './stores/counter';

const counter = useCounterStore();
</script>

<template>
  <h1>Homework-01</h1>
  <div class="counter-badge">
    {{ counter.count }}
  </div>
  <nav class="main-nav" aria-label="Главная навигация">
    <RouterLink to="/">Главная</RouterLink>
    <RouterLink to="/about">О проекте</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>
.main-nav {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  position: relative;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color .15s ease, color .15s ease;
}

.main-nav a:hover,
.main-nav a:focus {
  background-color: #f2f2f2;
  outline: none;
}

.main-nav a:focus-visible {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

.main-nav a.router-link-active {
  color: #0d6efd;
}

.main-nav a.router-link-active::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 0;
  height: 2px;
  background: #0d6efd;
  border-radius: 2px;
}

.counter-badge {
  position: fixed;
  top: 12px;
  right: 12px;
  background: #0d6efd;
  color: #fff;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-size: 14px;
  line-height: 1;
  user-select: none;
}
</style>
