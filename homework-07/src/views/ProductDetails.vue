<template>
  <div class="backdrop" role="presentation">
    <div class="container">
      <header class="header">
        <h2 class="title">
          {{ product.title }}
        </h2>
      </header>

      <div class="body">
        <div class="content">
          <img :src="product.image" :alt="product.title" class="product-image" />
          <p class="product-description">{{ product.description }}</p>
          <div class="product-info">
            <span class="product-category">{{ product.category }}</span>
            <span class="product-price">${{ product.price?.toFixed(2) }}</span>
          </div>
        </div>

        <div class="product-footer">
          <button @click="navigateToBack" class="footer-btn back-btn">Назад</button>
          <button @click="addToBasket" class="footer-btn add-to-basket-btn">Добавить в корзину</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, shallowRef } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBasketStore } from '../stores/basketStore.js';
import { loadProduct } from '../utils/utils.js';

const router = useRouter();
const route = useRoute();
const basket = useBasketStore();
const productId = route.params.id;

const product = shallowRef({});

onMounted(async () => {
  product.value = await loadProduct(productId);
});

function addToBasket() {
  basket.add(product.value);
}

function navigateToBack() {
  router.back();
}

</script>

<style scoped>
.backdrop {
  inset: 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  background-color: #fff;
  border-radius: 12px;
  width: 900px;
  max-height: 90vh;
  box-shadow: 0 0 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  color: #333;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-image {
  max-height: 300px;
  margin: 0 auto;
  background-color: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
}

.product-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.product-category {
  font-size: 1rem;
  text-transform: uppercase;
  color: #42b983;
  background-color: #e8f5ef;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-weight: 600;
}

.product-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
}

.product-footer {
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
  display: flex;
  gap: 1rem;
}

.footer-btn {
  flex: 1;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.back-btn {
  background-color: #f5f5f5;
  color: #2c3e50;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

.add-to-basket-btn {
  background-color: #42b983;
  color: #fff;
}

.add-to-basket-btn:hover {
  background-color: #36a372;
}
</style>
