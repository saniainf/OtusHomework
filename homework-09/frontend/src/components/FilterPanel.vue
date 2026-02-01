<template>
  <div class="filter-container">
    <div class="filter-input-wrapper">
      <label for="category-filter-input" class="filter-label">Категория товаров</label>
      <select v-model="localSelectedCategory" name="category-filter-input" id="category-filter-input" class="filter-input">
        <option value="">Все категории</option>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComputedRef } from 'vue';

const { categories, selectedCategory } = defineProps<{
  /** Список доступных категорий для фильтрации */
  categories: string[];
  /** Текущая выбранная категория */
  selectedCategory: string;
}>();

const emit = defineEmits<{
  'update:selectedCategory': [value: string];
}>();


const localSelectedCategory: ComputedRef<string> = computed({
  get: (): string => selectedCategory,
  set: (val: string): void => {
    emit('update:selectedCategory', val);
  }
});
</script>

<style scoped>
.filter-container {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.filter-input-wrapper {
  display: flex;
  flex-direction: column;
}

.filter-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
}

.filter-input:focus {
  border-color: #42b983;
}
</style>
