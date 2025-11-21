<template>
  <h1>Homework-03</h1>
  <section class="products-wrapper">
    <div v-for="product in visibleProducts" :key="product.id">
      <ProductCard :product="product" @open-modal="openModal" />
    </div>
    <button v-if="canShowMore" type="button" class="show-more-btn" @click="showMore">Показать ещё</button>
  </section>

  <Modal :is-modal-open="isModalOpen" :product="selectedProduct" @close="closeModal" />
</template>

<script setup>
import { loadProducts, loadProduct } from './utils/utils.js';
import { onMounted, ref, computed } from 'vue';
import ProductCard from './components/ProductCard.vue';
import Modal from './components/Modal.vue';

const STEP = 3;

let products = [];
const visibleCount = ref(0);
const visibleProducts = computed(() => products.slice(0, visibleCount.value));
const canShowMore = computed(() => visibleCount.value < products.length);

const isModalOpen = ref(false);
const selectedProduct = ref(null);

function showMore() {
  visibleCount.value = Math.min(visibleCount.value + STEP, products.length);
}

async function openModal(productId) {
  selectedProduct.value = await loadProduct(productId);
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedProduct.value = null;
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
  font-size: 1rem;
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
