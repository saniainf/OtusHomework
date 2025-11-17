<script setup>
import { ref, computed } from 'vue'
import UserList from './components/UserList.vue'

const showUserList = ref(false);
const buttonLabel = computed(() =>
  showUserList.value
    ? 'Скрыть список'
    : 'Показать список'
);

function toggleList() {
  showUserList.value = !showUserList.value
}
</script>

<template>
  <h1>Homework-02</h1>
  <div class="container">
    <button v-on:click="toggleList">{{ buttonLabel }}</button>
  </div>
  <UserList v-if="showUserList" />
</template>

<style>
h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background-color: #36a372;
}

button:active {
  box-shadow: 0 2px 4px rgba(66, 185, 131, 0.3);
}
</style>
