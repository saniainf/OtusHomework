<script setup>
import { useCounterStore } from "../stores/counter";

const counter = useCounterStore();
</script>

<template>
  <div class="counter-panel">
    <p>Счётчик: {{ counter.count }}</p>
    <p>Удвоенный: {{ counter.doubleCount }}</p>

    <div class="buttons">
      <button @click="counter.increment">+1</button>
      <button @click="counter.decrement">-1</button>
    </div>
  </div>
</template>

<style scoped>
p {
  margin: 4px 0;
}

.counter-panel {
  margin-top: 10px;
  padding: 8px;
  border: 2px solid #ccc;
  border-radius: 6px;
  max-width: 240px;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

button {
  cursor: pointer;
  padding: 4px 10px;
  border: 1px solid #888;
  background: #f5f5f5;
  border-radius: 4px;
  transition: background .15s;
}

button:hover {
  background: #e8e8e8;
}
</style>