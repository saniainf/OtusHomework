<template>
  <div class="basket-container">
    <h2 class="basket-title">Корзина</h2>
    <div v-if="items.length === 0" class="basket-empty">Корзина пуста</div>

    <ul v-else class="basket-list">
      <li v-for="item in items" :key="item.id" class="basket-item">
        <div class="basket-item-container">
          <span class="basket-item-title">{{ item.title }}</span>
        </div>
        <div class="basket-item-price">{{ (item.price).toFixed(2) }} $</div>
      </li>
    </ul>

    <div v-if="items.length" class="basket-total">Итого: {{ total }} $</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const { items } = defineProps({
  items: {
    type: Array,
    default: () => []
  }
});

const total = computed(() => {
  return items.reduce((sum, item) => sum + item.price, 0).toFixed(2);
});
</script>

<style scoped>
.basket-container {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.basket-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

.basket-empty {
  font-size: 0.95rem;
  color: #666;
}

.basket-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
}

.basket-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #ececec;
}

.basket-item-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 70%;
}

.basket-item-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
}

.basket-item-qty {
  font-size: 0.85rem;
  color: #555;
}

.basket-item-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.basket-total {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.5rem;
  color: #2c3e50;
  border-top: 1px solid #e2e2e2;
  padding-top: 0.75rem;
}
</style>
