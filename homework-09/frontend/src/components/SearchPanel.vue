<template>
  <div class="search-container">
    <label for="search-input" class="search-label">Поиск товаров</label>
    <div class="search-input-wrapper">
      <input id="search-input" v-model="searchLocalValue" type="text" class="search-input" placeholder="Введите название товара..." />
      <button v-if="searchLocalValue" @click="clear" type="button" class="clear-btn" title="Очистить">
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComputedRef } from 'vue';

const { searchValue } = defineProps<{
  /** Текущее значение поиска */
  searchValue: string;
}>();

const emit = defineEmits<{
  /** Событие обновления значения поиска */
  'update:searchValue': [value: string];
}>();

const searchLocalValue: ComputedRef<string> = computed({
  get: (): string => searchValue,
  set: (val: string): void => {
    // Используем сохранённую emit функцию для излучения события обновления
    emit('update:searchValue', val);
  }
});

function clear(): void {
  // Используем сохранённую emit функцию для излучения события с пустым значением
  emit('update:searchValue', '');
}

</script>

<style scoped>
.search-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
}

.search-input:focus {
  border-color: #42b983;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  border-radius: 4px;
}

.clear-btn:hover {
  background-color: #f5f5f5;
  color: #2c3e50;
}

</style>
