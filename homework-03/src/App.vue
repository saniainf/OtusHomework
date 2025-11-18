<template>
  <h1>Homework-03</h1>
  <section class="products-wrapper">
    <div v-for="product in products" :key="product.id" class="products-item">
      <ProductCard :product="product" />
    </div>
  </section>
</template>

<script setup>
import { loadProducts } from './utils/utils.js';
import { onMounted, reactive } from 'vue';
import ProductCard from './components/ProductCard.vue';

const products = reactive([]);

onMounted(async () => {
  const loadedProducts = await loadProducts();
  products.splice(0, products.length, ...loadedProducts);
});
</script>

<style scoped>
h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.products-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.products-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.products-item {
  display: flex;
  justify-content: center;
}

.status-text {
  text-align: center;
  color: #2c3e50;
  font-size: 1rem;
}

.status-text_error {
  color: #d63031;
}
</style>
