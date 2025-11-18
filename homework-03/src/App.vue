<template>
  <h1>Homework-03</h1>
  <section class="products-wrapper">
    <div v-for="product in visibleProducts" :key="product.id">
      <ProductCard :product="product" />
    </div>
    <button v-if="canShowMore" type="button" class="show-more-btn" @click="showMore">Показать ещё</button>
  </section>
</template>

<script setup>
import { loadProducts } from './utils/utils.js';
import { onMounted, ref, computed, shallowReactive } from 'vue';
import ProductCard from './components/ProductCard.vue';

const STEP = 5;

let products = [];
const visibleCount = ref(0);
const visibleProducts = computed(() => products.slice(0, visibleCount.value));
const canShowMore = computed(() => visibleCount.value < products.length);

function showMore() {
  visibleCount.value = Math.min(visibleCount.value + STEP, products.length);
}

onMounted(async () => {
  products = await loadProducts();
  visibleCount.value = STEP;
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

.show-more-btn {
  padding: 1rem;
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.show-more-btn:hover {
  background-color: #36a372;
}
</style>
