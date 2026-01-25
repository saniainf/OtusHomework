<template>
  <div class="basket-page">
    <div class="basket-header">
      <button @click="navigateToBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Назад
      </button>
      <h1 class="basket-title">Корзина</h1>
    </div>

    <div class="basket-content">
      <div class="basket-items">
        <BasketProductCard
          v-for="item in items"
          :key="item.productId"
          :product="item"
          @increment="basket.add"
          @decrement="basket.decrement"
          @remove="basket.remove"
        />
      </div>

      <div class="basket-summary">
        <div class="summary-row">
          <span class="summary-label">Товаров:</span>
          <span class="summary-value items-count-value">{{ itemsCount }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Количество:</span>
          <span class="summary-value total-count-value">{{ totalCount }}</span>
        </div>
        <div class="summary-row total-row">
          <span class="summary-label">Итого:</span>
          <span class="summary-value total-amount-value">${{ totalAmount }}</span>
        </div>

        <div class="basket-actions">
          <button @click="clearBasket" class="clear-btn">Очистить корзину</button>
          <button @click="navigateToCheckout" class="checkout-btn">Оформить заказ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBasketStore } from '../stores/basketStore.js';
import BasketProductCard from '../components/BasketProductCard.vue';

const router = useRouter();
const basket = useBasketStore();
const { items, totalCount, itemsCount, totalAmount } = storeToRefs(basket);

// Загружаем корзину с бэка при открытии страницы
onMounted(() => {
  basket.fetchCart();
});

function clearBasket() {
  basket.clear();
  navigateToBack();
}

function navigateToBack() {
  router.back();
}

function navigateToCheckout() {
  router.push({ path: '/checkout' });
}
</script>

<style scoped>
.basket-page {
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.basket-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 900px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: #f5f5f5;
  color: #2c3e50;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

.back-btn svg {
  display: block;
}

.basket-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.basket-content {
  display: grid;
  grid-template-columns: 300px 900px 300px;
  grid-template-areas:
    ". items summary";
  gap: 1.5rem;
  align-items: start;
  justify-content: center;
}

.basket-items {
  grid-area: items;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.basket-summary {
  grid-area: summary;
  position: sticky;
  top: 120px;
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #666;
}

.summary-label {
  font-weight: 500;
}

.summary-value {
  font-weight: 600;
  color: #2c3e50;
}

.total-row {
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 2px solid #e0e0e0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.total-row .summary-value {
  font-size: 1.5rem;
  color: #42b983;
}

.basket-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.clear-btn,
.checkout-btn {
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn {
  background-color: #f5f5f5;
  color: #666;
}

.clear-btn:hover {
  background-color: #e0e0e0;
  color: #2c3e50;
}

.checkout-btn {
  background-color: #42b983;
  color: #fff;
}

.checkout-btn:hover {
  background-color: #36a372;
}

@media (max-width: 1024px) {
  .basket-content {
    grid-template-columns: 1fr;
  }

  .basket-summary {
    position: static;
  }
}
</style>
