<template>
  <article class="product-card">
    <div class="product-image-container">
      <img :src="product.image" :alt="product.title" class="product-image" />
    </div>
    <div class="product-info">
      <span class="product-category">{{ product.category }}</span>
      <h2 class="product-title">{{ product.title }}</h2>
      <!-- <p class="product-description">{{ product.description }}</p> -->
      <div class="product-rating">
        <span class="rating-stars" v-html="stars"></span>
        <span class="rating-info">
          {{ ratingText }}
        </span>
      </div>
      <div class="product-footer">
        <span class="product-price">${{ product.price.toFixed(2) }}</span>
        <button class="add-to-cart-btn">Добавить в корзину</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { toStarsHTML } from '../utils/utils.js';

const props = defineProps({
  product: {
    type: Object,
    required: true,
    validator(value) {
      return value && typeof value === 'object' && value.id != null;
    }
  }
});

const product = computed(() => props.product);

const ratingText = computed(() => {
  return `${product.value.rating.rate} (${product.value.rating.count} отзывов)`;
});

const stars = computed(() => toStarsHTML(Math.round(product.value.rating.rate), 5));
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: row;
  width: 900px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.3);
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
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.product-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0.75rem 0;
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

.rating-stars::v-deep .star {
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

.add-to-cart-btn {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.add-to-cart-btn:hover {
  background-color: #36a372;
}
</style>