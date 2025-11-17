<script setup>
import { ref, computed } from 'vue';

const users = [
  { id: 1, name: 'Иван Иванов', age: 30 },
  { id: 2, name: 'Петр Петров', age: 25 },
  { id: 3, name: 'Сидор Сидоров', age: 40 }
];

const showAges = ref(false);
const buttonLabel = computed(() =>
  showAges.value
    ? 'Скрыть возраст'
    : 'Показать возраст'
);
const hoveredUserId = ref(null);
const color = ref('red');

function toggleAges() {
  if(showAges.value) {
    color.value = 'red';
  } else {
    color.value = 'green';
  }
  showAges.value = !showAges.value
}
</script>

<template>
  <h1>Список пользователей</h1>
  <div class="container">
    <table>
      <thead>
        <tr>
          <th>Имя</th>
          <th v-show="showAges">Возраст</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users" :key="user.id" 
          v-bind:class="{ 'hovered': hoveredUserId === user.id }" 
          v-on:mouseenter="hoveredUserId = user.id" 
          v-on:mouseleave="hoveredUserId = null"
        >
          <td>{{ user.name }}</td>
          <td v-show="showAges">{{ user.age }}</td>
        </tr>
      </tbody>
    </table>
    <button v-on:click="toggleAges">{{ buttonLabel }}</button>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

thead {
  background-color: #42b983;
  color: white;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background-color: #f5f5f5;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:nth-child(even) {
  background-color: #fafafa;
}

tbody tr:nth-child(even):hover {
  background-color: #f0f0f0;
}

.hovered td {
  color: v-bind(color);
}
</style>