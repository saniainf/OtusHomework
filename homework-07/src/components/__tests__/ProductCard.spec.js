import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import ProductCard from '../ProductCard.vue';
import { useBasketStore } from '../../stores/basketStore.js';
import { toStarsHTML } from '../../utils/utils.js';
import { createProductFixture } from '../../__tests__/fixtures/product.js';

const baseProduct = createProductFixture({ id: 33 });

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/product/:id', component: { template: '<div />' } },
    ],
  });
}

async function mountProductCard(product = createProductFixture({ id: 33 })) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  router.push('/');
  await router.isReady();

  const wrapper = mount(ProductCard, {
    props: {
      product,
    },
    global: {
      plugins: [pinia, router],
    },
  });

  const basketStore = useBasketStore();

  return { wrapper, router, basketStore };
}

describe('Компонент ProductCard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('отображает все основные данные товара', async () => {
    const { wrapper } = await mountProductCard();

    expect(wrapper.find('.product-category').text()).toBe(baseProduct.category);
    expect(wrapper.find('.product-title').text()).toBe(baseProduct.title);
    expect(wrapper.find('.product-price').text()).toBe(`$${baseProduct.price.toFixed(2)}`);
    expect(wrapper.find('.rating-info').text()).toBe(`${baseProduct.rating.rate} (${baseProduct.rating.count} отзывов)`);
    expect(wrapper.find('.rating-stars').html()).toContain(toStarsHTML(Math.round(baseProduct.rating.rate), 5));
  });

  it('добавляет товар в корзину по клику на кнопку', async () => {
    const { wrapper, basketStore } = await mountProductCard();
    const addSpy = vi.spyOn(basketStore, 'add');

    await wrapper.find('.add-to-basket-btn').trigger('click');

    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(addSpy).toHaveBeenCalledWith(baseProduct);
  });

  it('переходит на страницу деталей по клику на заголовок', async () => {
    const { wrapper, router } = await mountProductCard();
    const pushSpy = vi.spyOn(router, 'push');

    await wrapper.find('.product-title').trigger('click');

    expect(pushSpy).toHaveBeenCalledWith({ path: `/product/${baseProduct.id}` });
  });
});
