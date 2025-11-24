<template>
  <h1>Homework-03</h1>
  <div class="page-grid">
    <!-- Ячейка поиска -->
    <div class="search-panel-wrapper">
      <SearchPanel v-model:searchValue="searchValue" :resultsCount="filteredProducts.length" />
    </div>
    <!-- Ячейка фильтрации -->
    <div class="filter-panel-wrapper">
      <FilterPanel v-model:selectedCategory="selectedCategory" :categories="categories" />
    </div>
    <!-- Ячейка контента с товарами -->
    <div class="products-wrapper">
      <div v-if="filteredProducts.length === 0" class="no-results">
        <p>Товары не найдены</p>
        <p>Попробуйте изменить поисковый запрос</p>
      </div>
      <template v-else>
        <div v-for="product in visibleProducts" :key="product.id">
          <ProductCard :product="product" @showDetails="openProductDetailsModal" @addToBasket="addToBasket" />
        </div>
        <button v-if="canShowMore" type="button" class="show-more-btn" @click="showMore">Показать ещё</button>
      </template>
    </div>
    <!-- Ячейка корзины -->
    <div class="basket-panel-wrapper">
      <BasketPanel :items="basketItems" @clear="basketItems = []" @checkout="openCheckoutModal" />
    </div>
  </div>
  <ProductDetailsModal :isOpen="isProductDetailsModalOpen" :product="selectedProduct" @close="closeProductDetailsModal" />
  <CheckoutModal :isOpen="isCheckoutModalOpen" :items="basketItems" @close="closeCheckoutModal" />
</template>

<script setup>
import { loadProducts, loadProduct } from './utils/utils.js';
import { onMounted, ref, computed, watch, shallowRef, watchEffect, reactive } from 'vue';
import ProductCard from './components/ProductCard.vue';
import ProductDetailsModal from './components/ProductDetailsModal.vue';
import SearchPanel from './components/SearchPanel.vue';
import FilterPanel from './components/FilterPanel.vue';
import BasketPanel from './components/BasketPanel.vue';
import CheckoutModal from './components/CheckoutModal.vue';

const STEP = 3;

const products = shallowRef([]);
const categories = shallowRef([]);
const basketItems = ref([]);

const visibleCount = ref(0);
const searchValue = ref('');
const selectedCategory = ref('');

const isProductDetailsModalOpen = ref(false);
const selectedProduct = ref(null);
const isCheckoutModalOpen = ref(false);

const visibleProducts = computed(() =>
  filteredProducts.value.slice(0, visibleCount.value)
);

const filteredProducts = computed(() => {
  if (!searchValue.value.trim() && !selectedCategory.value) {
    return products.value;
  }

  const searchLower = searchValue.value.toLowerCase();

  return products.value.filter(product =>
    product.title.toLowerCase().includes(searchLower) &&
    (selectedCategory.value ? product.category === selectedCategory.value : true)
  );
});

watchEffect(() => {
  visibleCount.value = Math.min(STEP, filteredProducts.value.length);
});

const canShowMore = computed(() =>
  visibleCount.value < filteredProducts.value.length
);

function showMore() {
  visibleCount.value = Math.min(visibleCount.value + STEP, filteredProducts.value.length);
}

async function openProductDetailsModal(productId) {
  selectedProduct.value = await loadProduct(productId);
  isProductDetailsModalOpen.value = true;
}

async function openCheckoutModal() {
  isCheckoutModalOpen.value = true;
}

async function addToBasket(productId) {
  const product = await loadProduct(productId);
  if (product) {
    basketItems.value.push(product);
  }
}

function closeProductDetailsModal() {
  isProductDetailsModalOpen.value = false;
  selectedProduct.value = null;
}

function closeCheckoutModal() {
  isCheckoutModalOpen.value = false;
}

onMounted(async () => {
  products.value = await loadProducts();
  categories.value = [...new Set(products.value.map(product => product.category))];
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

.page-grid {
  display: grid;
  grid-template-columns: 300px 900px 300px;
  grid-template-areas:
    ". search ."
    "filter products basket";
  gap: 1.5rem;
  align-items: start;
  justify-content: center;
}

.search-panel-wrapper {
  grid-area: search;
  width: 100%;
}

.filter-panel-wrapper {
  grid-area: filter;
  width: 100%;
}

.basket-panel-wrapper {
  grid-area: basket;
  width: 100%;
}

.products-wrapper {
  grid-area: products;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.no-results {
  text-align: center;
  font-size: 1rem;
  color: gray
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
