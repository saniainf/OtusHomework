import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import Basket from '../Basket.vue';
import { useBasketStore } from '../../stores/basketStore.js';
import { createProductFixture } from '../../__tests__/fixtures/product.js';

// Заглушка для BasketProductCard
const BasketProductCardStub = {
  template: `
    <div class="basket-product-card-stub">
      <span class="product-title">{{ product.title }}</span>
      <span class="product-qty">{{ product.qty }}</span>
      <button class="increment-btn" @click="$emit('increment', product)">+</button>
      <button class="decrement-btn" @click="$emit('decrement', product.id)">-</button>
      <button class="remove-btn" @click="$emit('remove', product.id)">Удалить</button>
    </div>
  `,
  props: ['product'],
  emits: ['increment', 'decrement', 'remove'],
};

// Роутер
function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/basket', component: Basket },
      { path: '/checkout', component: { template: '<div />' } },
    ],
  });
}

// Создает wrapper для Basket.vue с stub компонентом используемым внутри
async function mountBasket() {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  router.push('/basket');
  await router.isReady();

  const wrapper = mount(Basket, {
    global: {
      plugins: [router, pinia],
      stubs: {
        BasketProductCard: BasketProductCardStub,
      },
    },
  });

  const basketStore = useBasketStore();

  return { wrapper, router, basketStore };
}

describe('Basket.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('отображает пустую корзину с нулевыми значениями', async () => {
    const { wrapper } = await mountBasket();

    // Товаров: 0
    expect(wrapper.find('.items-count-value').text()).toBe('0');
    // Количество: 0
    expect(wrapper.find('.total-count-value').text()).toBe('0');
    // Итого: 0
    expect(wrapper.find('.total-amount-value').text()).toBe('$0.00');
  });

  it('отображает товары из корзины', async () => {
    const { wrapper, basketStore } = await mountBasket();

    const product1 = createProductFixture({ id: 1, price: 10 });
    const product2 = createProductFixture({ id: 2, price: 20 });

    basketStore.add(product1);
    basketStore.add(product2);

    await nextTick();

    const items = wrapper.findAll('.basket-product-card-stub');
    expect(items).toHaveLength(2);
  });

  it('отображает корректные суммарные значения', async () => {
    const { wrapper, basketStore } = await mountBasket();

    const product1 = createProductFixture({ id: 1, price: 10 });
    const product2 = createProductFixture({ id: 2, price: 20 });

    basketStore.add(product1);
    basketStore.add(product1);
    basketStore.add(product2);

    await nextTick();

    // Товаров: 2
    expect(wrapper.find('.items-count-value').text()).toBe('2');
    // Количество: 3
    expect(wrapper.find('.total-count-value').text()).toBe('3');
    // Итого: 40 (10*2 + 20*1)
    expect(wrapper.find('.total-amount-value').text()).toBe('$40.00');
  });

  it('вызывает increment при клике на кнопку увеличения', async () => {
    const { wrapper, basketStore } = await mountBasket();

    const product = createProductFixture({ id: 1, price: 10 });
    basketStore.add(product);

    await nextTick();

    // проверяем начальное количество
    expect(basketStore.items[0].qty).toBe(1);

    await wrapper.find('.increment-btn').trigger('click');
    await nextTick();

    // проверяем что товар добавлен в корзину (qty увеличилось)
    const item = basketStore.items.find(i => i.id === 1);
    expect(item.qty).toBe(2);
  });

  it('вызывает decrement при клике на кнопку уменьшения', async () => {
    const { wrapper, basketStore } = await mountBasket();

    const product = createProductFixture({ id: 1, price: 10 });
    basketStore.add(product);
    basketStore.add(product);

    await nextTick();

    // проверяем начальное количество
    expect(basketStore.items[0].qty).toBe(2);

    await wrapper.find('.decrement-btn').trigger('click');
    await nextTick();

    // проверяем что количество уменьшилось с 2 до 1
    const item = basketStore.items.find(i => i.id === 1);
    expect(item.qty).toBe(1);
  });

  it('вызывает remove при клике на кнопку удаления', async () => {
    const { wrapper, basketStore } = await mountBasket();

    const product = createProductFixture({ id: 1, price: 10 });
    const product2 = createProductFixture({ id: 2, price: 10 });
    basketStore.add(product);
    basketStore.add(product2);

    await nextTick();

    // проверяем что товары есть в корзине
    expect(basketStore.items.length).toBe(2);

    await wrapper.find('.remove-btn').trigger('click');
    await nextTick();

    // проверяем что товар удалён из корзины
    expect(basketStore.items.length).toBe(1);
    expect(basketStore.items.find(i => i.id === 1)).toBeUndefined();
  });

  it('очищает корзину и возвращается назад по клику на "Очистить корзину"', async () => {
    const { wrapper, router, basketStore } = await mountBasket();

    const product = createProductFixture({ id: 1, price: 10 });
    basketStore.add(product);

    await nextTick();

    const backSpy = vi.spyOn(router, 'back');
    const clearSpy = vi.spyOn(basketStore, 'clear');

    await wrapper.find('.clear-btn').trigger('click');
    await nextTick();

    // проверяем что корзина очищена
    expect(clearSpy).toHaveBeenCalledTimes(1);
    // проверяем что произошёл возврат назад
    expect(backSpy).toHaveBeenCalledTimes(1);
  });

  it('переходит на страницу оформления заказа по клику на "Оформить заказ"', async () => {
    const { wrapper, router, basketStore } = await mountBasket();

    const product = createProductFixture({ id: 1, price: 10 });
    basketStore.add(product);

    await nextTick();

    const pushSpy = vi.spyOn(router, 'push');

    await wrapper.find('.checkout-btn').trigger('click');

    // проверяем что произошёл переход на страницу оформления
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith({ path: '/checkout' });
  });

  it('возвращается назад по клику на кнопку "Назад"', async () => {
    const { wrapper, router } = await mountBasket();

    const backSpy = vi.spyOn(router, 'back');

    await wrapper.find('.back-btn').trigger('click');

    // проверяем что произошёл возврат назад
    expect(backSpy).toHaveBeenCalledTimes(1);
  });
});
