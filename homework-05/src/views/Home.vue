<template>
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
          <ProductCard :product="product" />
        </div>
        <button v-if="canShowMore" type="button" class="show-more-btn" @click="showMore">Показать ещё</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, shallowRef, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loadProducts } from '../utils/utils.js';
import ProductCard from '../components/ProductCard.vue';
import SearchPanel from '../components/SearchPanel.vue';
import FilterPanel from '../components/FilterPanel.vue';

const router = useRouter();
const route = useRoute();

const STEP = 3;

const products = shallowRef([]);
const categories = shallowRef([]);

const visibleCount = ref(STEP);
const searchValue = ref('');
const selectedCategory = ref('');

// флаг для отслеживания восстановления состояния из URL
const isRestoring = ref(true);

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

const visibleProducts = computed(() =>
  filteredProducts.value.slice(0, visibleCount.value)
);

const canShowMore = computed(() =>
  visibleCount.value < filteredProducts.value.length
);

function showMore() {
  visibleCount.value = Math.min(visibleCount.value + STEP, filteredProducts.value.length);
}

function updateQueryParams() {
  const query = {};

  if (searchValue.value) {
    query.search = searchValue.value;
  }
  if (selectedCategory.value) {
    query.category = selectedCategory.value;
  }
  if (visibleCount.value !== STEP) {
    query.visible = visibleCount.value;
  }

  router.replace({ query });
}

watch([searchValue, selectedCategory, visibleCount], (newValues, oldValues) => {
  if (isRestoring.value) return;

  const filtersChanged = newValues[0] !== oldValues[0] || newValues[1] !== oldValues[1];
  if (filtersChanged) {
    visibleCount.value = Math.min(STEP, filteredProducts.value.length);
  }

  updateQueryParams();
});

onMounted(async () => {
  products.value = await loadProducts();
  categories.value = [...new Set(products.value.map(product => product.category))];

  if (route.query.search) {
    searchValue.value = route.query.search;
  }
  if (route.query.category) {
    selectedCategory.value = route.query.category;
  }
  if (route.query.visible) {
    const parsed = Number.parseInt(route.query.visible, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      visibleCount.value = parsed;
    }
  }

  // ожидание следующего тика
  await nextTick();
  isRestoring.value = false;
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
