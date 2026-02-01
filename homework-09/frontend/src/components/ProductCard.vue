<template>
  <article class="product-card">
    <div class="product-image-container">
      <img :src="product.image" :alt="product.title" class="product-image" />
    </div>
    <div class="product-info">
      <span class="product-category">{{ product.category }}</span>
      <h2 class="product-title" @click="navigateToDetails">{{ product.title }}</h2>
      <div class="product-rating">
        <span class="rating-stars" v-html="stars"></span>
        <span class="rating-info">
          {{ ratingText }}
        </span>
      </div>
      <div class="product-footer">
        <span class="product-price">${{ product.price.toFixed(2) }}</span>
        <button v-if="isLoggedIn" @click="addToBasket" class="add-to-basket-btn">Добавить в корзину</button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import { useRouter } from 'vue-router';
import type { Router } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBasketStore } from '../stores/basketStore.js';
import { toStarsHTML } from '../utils/utils.js';
import { useAuthStore } from '../stores/authStore.js';
import type { Product } from '../types/index.js';

const router: Router = useRouter();
const basket = useBasketStore();
const auth = useAuthStore();
const { isLoggedIn } = storeToRefs(auth);

// Определяем props с явной типизацией Product
const { product } = defineProps<{
  /** Данные товара для отображения в карточке */
  product: Product;
}>();

/**
 * Навигирует на страницу детального просмотра товара
 */
function navigateToDetails(): void {
  router.push({
    path: `/product/${product.id}`
  });
}

/**
 * Добавляет товар в корзину пользователя
 */
function addToBasket(): void {
  basket.add(product);
}

/**
 * Вычисляемое свойство для отображения рейтинга товара
 * Возвращает строку вида "4.5 (120 отзывов)"
 */
const ratingText: ComputedRef<string> = computed((): string => {
  return `${product.rating.rate} (${product.rating.count} отзывов)`;
});

/**
 * Вычисляемое свойство для отображения звёзд рейтинга
 * Возвращает HTML строку со звёздами на основе рейтинга товара
 */
const stars: ComputedRef<string> = computed((): string => {
  return toStarsHTML(Math.round(product.rating.rate || 0), 5);
});
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: row;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.product-image-container {
  flex-shrink: 0;
  width: 100px;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-info {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.product-category {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #42b983;
  background-color: #e8f5ef;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-weight: 600;
  margin-bottom: 0.7rem;
}

.product-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0.75rem 0;
  cursor: pointer;
}

.product-title:hover {
  color: #42b983;
}

.product-title:focus {
  outline: 2px solid #42b983;
  outline-offset: 2px;
  border-radius: 4px;
}

.product-description {
  flex: 1;
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  margin: 0.75rem 0;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

:deep(.rating-stars) .star {
  color: #ffc107;
  font-size: 1.1rem;
}

.rating-info {
  font-size: 0.85rem;
  color: #666;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.product-price {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.add-to-basket-btn {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.add-to-basket-btn:hover {
  background-color: #36a372;
}
</style>
