<template>
  <div class="page-grid">
    <div class="filter-panel-wrapper">
      <SearchPanel v-model:searchValue="searchValue" />
      <FilterPanel v-model:selectedCategory="selectedCategory" :categories="categories" />
      <div class="filter-count">
        Показано: {{ filteredProducts.length }} из {{ totalProducts }} {{ productWord }}
      </div>
    </div>
    <div class="products-wrapper">
      <div v-if="error" class="error-message">
        <p>⚠️ {{ error }}</p>
      </div>
      <div v-else-if="filteredProducts.length === 0 && !isLoading" class="no-results">
        <p>Товары не найдены</p>
        <p>Попробуйте изменить поисковый запрос или категорию</p>
      </div>
      <template v-else>
        <div v-for="product in filteredProducts" :key="product.id">
          <ProductCard :product="product" />
        </div>
        <div v-if="isLoading" class="loading">
          Загрузка товаров...
        </div>
        <button
          v-else-if="hasMore"
          type="button"
          class="show-more-btn"
          @click="loadMoreProducts"
          :disabled="isLoading"
        >
          Показать ещё
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, shallowRef, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loadCategories, loadProducts, productWordComputing } from '../utils/utils.js';
import ProductCard from '../components/ProductCard.vue';
import SearchPanel from '../components/SearchPanel.vue';
import FilterPanel from '../components/FilterPanel.vue';

const router = useRouter();
const route = useRoute();

const LIMIT = 3; // Количество товаров за раз

// Состояние загруженных товаров
const allProducts = shallowRef([]); // Все загруженные товары
const isLoading = ref(false);
const error = ref(null);
const categories = shallowRef([]);

// Состояние пагинации
const currentOffset = ref(0);
const totalProducts = ref(0);
const hasMore = ref(false);

// Фильтры
const searchValue = ref('');
const selectedCategory = ref('');

// Флаг для восстановления состояния из URL
const isRestoring = ref(true);

/**
 * Загружает товары с сервера с пагинацией и фильтрацией
 */
async function loadMoreProducts() {
  if (isLoading.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    const data = await loadProducts(
      LIMIT,
      currentOffset.value,
      selectedCategory.value || null
    );

    if (data.items.length > 0) {
      allProducts.value.push(...data.items);
    }

    totalProducts.value = data.total;
    hasMore.value = data.hasMore;
    currentOffset.value += LIMIT;
  } catch (err) {
    console.error('Ошибка при загрузке товаров:', err);
    error.value = 'Не удалось загрузить товары';
  } finally {
    isLoading.value = false;
  }
}

/**
 * Загружает первую порцию товаров при изменении фильтров
 */
async function resetAndLoadProducts() {
  allProducts.value = [];
  currentOffset.value = 0;
  hasMore.value = false;
  await loadMoreProducts();
}

/**
 * Товары после фильтрации по поиску
 */
const filteredProducts = computed(() => {
  if (!searchValue.value.trim()) {
    return allProducts.value;
  }

  const searchLower = searchValue.value.toLowerCase();
  return allProducts.value.filter(product =>
    product.title.toLowerCase().includes(searchLower)
  );
});

/**
 * Склонение слова "товар"
 */
const productWord = computed(() => productWordComputing(filteredProducts.value.length));

/**
 * Обновление параметров URL
 */
function updateQueryParams() {
  const query = {};

  if (searchValue.value) {
    query.search = searchValue.value;
  }
  if (selectedCategory.value) {
    query.category = selectedCategory.value;
  }

  router.replace({ query });
}

/**
 * Слежение за изменением фильтров
 */
watch([searchValue, selectedCategory], (newValues, oldValues) => {
  // Пропускаем если восстанавливаем состояние из URL
  if (isRestoring.value) return;

  // Если изменилась категория - перезагружаем с первой порции
  if (newValues[1] !== oldValues[1]) {
    resetAndLoadProducts();
  }

  updateQueryParams();
});

/**
 * При монтировании компонента
 */
onMounted(async () => {
  // Восстанавливаем фильтры из URL
  if (route.query.search) {
    searchValue.value = route.query.search;
  }
  if (route.query.category) {
    selectedCategory.value = route.query.category;
  }

  // Загружаем первую порцию товаров и категории
  await loadMoreProducts();
  categories.value = await loadCategories();

  // Даём Vue время на обновление и затем отключаем режим восстановления
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
    "filter products .";
  gap: 1.5rem;
  align-items: start;
  justify-content: center;
}

.filter-panel-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.error-message {
  background-color: #fee;
  border: 1px solid #f99;
  border-radius: 6px;
  padding: 1rem;
  color: #c33;
  text-align: center;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  color: #666;
  padding: 1rem;
  font-style: italic;
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

.show-more-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.filter-count {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  color: #666;
  text-align: right;
}
</style>
