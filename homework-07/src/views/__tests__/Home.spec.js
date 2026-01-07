import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import Home from '../Home.vue';
import { createProductFixture } from '../../__tests__/fixtures/product.js';

vi.mock('../../utils/utils.js', () => ({
  loadProducts: vi.fn(),
  productWordComputing: vi.fn(() => 'товаров'),
}));

const { loadProducts } = await import('../../utils/utils.js');

const productsMock = [
  createProductFixture({ id: 1, title: 'Куртка', category: 'Одежда', price: 10, image: 'image1.png', rating: { rate: 4, count: 10 } }),
  createProductFixture({ id: 2, title: 'Брюки', category: 'Одежда', price: 20, image: 'image2.png', rating: { rate: 5, count: 8 } }),
  createProductFixture({ id: 3, title: 'Ноутбук', category: 'Техника', price: 30, image: 'image3.png', rating: { rate: 4, count: 15 } }),
  createProductFixture({ id: 4, title: 'Смартфон', category: 'Техника', price: 40, image: 'image4.png', rating: { rate: 3, count: 5 } }),
];

// Заглушки для дочерних компонентов
const SearchPanelStub = {
  template: `
    <div class="search-panel-stub">
      <input
        class="search-input"
        :value="searchValue"
        @input="$emit('update:searchValue', $event.target.value)"
      />
    </div>
  `,
  props: ['searchValue'],
  emits: ['update:searchValue'],
};

const FilterPanelStub = {
  template: `
    <div class="filter-panel-stub">
      <select
        class="category-select"
        :value="selectedCategory"
        @change="$emit('update:selectedCategory', $event.target.value)"
      >
        <option value="">Все категории</option>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
    </div>
  `,
  props: ['categories', 'selectedCategory'],
  emits: ['update:selectedCategory'],
};

const ProductCardStub = {
  template: '<div class="product-card-stub">{{ product.title }}</div>',
  props: ['product'],
};

// роутер
function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Home },
    ],
  });
}

// создает wrapper для Home.vue с тремя stub компонентами исользуемыми внутри
async function mountHome(routeInit = { path: '/', query: {} }) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  router.push({ path: routeInit.path ?? '/', query: routeInit.query ?? {} });
  await router.isReady();

  const wrapper = mount(Home, {
    global: {
      plugins: [router, pinia],
      stubs: {
        SearchPanel: SearchPanelStub,
        FilterPanel: FilterPanelStub,
        ProductCard: ProductCardStub,
      },
    },
  });

  return { wrapper, router };
}

describe('Home.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    loadProducts.mockResolvedValue(productsMock);
  });

  it('показывает первые товары и кнопку догрузки', async () => {
    const { wrapper } = await mountHome();
    await flushPromises();

    const items = wrapper.findAll('.product-card-stub');

    expect(items).toHaveLength(3);
    expect(wrapper.find('.show-more-btn').exists()).toBe(true);
  });

  it('добавляет товары при клике "Показать ещё" и скрывает кнопку, когда всё отображено', async () => {
    const { wrapper } = await mountHome();
    await flushPromises();

    await wrapper.find('.show-more-btn').trigger('click');
    await nextTick();

    const items = wrapper.findAll('.product-card-stub');
    expect(items).toHaveLength(4);
    expect(wrapper.find('.show-more-btn').exists()).toBe(false);
  });

  it('фильтрует по поиску и показывает заглушку об отсутствии результатов', async () => {
    const { wrapper } = await mountHome();
    await flushPromises();

    await wrapper.find('.search-panel-stub .search-input').setValue('empty');
    await nextTick();

    expect(wrapper.find('.product-card-stub').exists()).toBe(false);
    expect(wrapper.find('.no-results').exists()).toBe(true);
  });

  it('сбрасывает видимую страницу при смене категории', async () => {
    const { wrapper } = await mountHome();
    await flushPromises();

    // показываем все товары и проверяем что они есть
    await wrapper.find('.show-more-btn').trigger('click');
    await nextTick();
    expect(wrapper.findAll('.product-card-stub')).toHaveLength(4);

    // выбираем категорию и проверяем что видимые товары отфильтровались
    const categorySelect = wrapper.find('.filter-panel-stub .category-select');
    await categorySelect.setValue('Техника');
    await nextTick();

    const items = wrapper.findAll('.product-card-stub');
    expect(items).toHaveLength(2);
    // техники две, кнопки нет
    expect(wrapper.find('.show-more-btn').exists()).toBe(false);
  });

  it('восстанавливает фильтры и количество из query-параметров', async () => {
    const { wrapper } = await mountHome({
      path: '/',
      query: {
        search: 'Смартфон',
        category: 'Техника',
        visible: '2',
      },
    });
    await flushPromises();

    const searchInput = wrapper.find('.search-panel-stub .search-input');
    const categorySelect = wrapper.find('.filter-panel-stub .category-select');

    // проверяем фильтры
    expect(searchInput.element.value).toBe('Смартфон');
    expect(categorySelect.element.value).toBe('Техника');
    // смартфон один
    expect(wrapper.findAll('.product-card-stub')).toHaveLength(1);
    // кнопки нет
    expect(wrapper.find('.show-more-btn').exists()).toBe(false);
  });
});