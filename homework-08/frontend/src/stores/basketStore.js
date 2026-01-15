import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { addToCart, updateCartItem, loadCart } from '../utils/utils.js';

export const useBasketStore = defineStore('basket', () => {
  // Синхронизированные данные с бэком: массив товаров в корзине
  const items = ref([]);
  // Общая сумма корзины (вычисляется на бэке и возвращается)
  const total = ref(0);
  // Состояние загрузки данных
  const isLoading = ref(false);

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const itemsCount = computed(() => {
    return items.value.length;
  });

  const totalAmount = computed(() => {
    return Number(total.value).toFixed(2);
  });

  /**
   * Загружает корзину с бэка
   */
  async function fetchCart() {
    isLoading.value = true;
    try {
      const cart = await loadCart();
      items.value = cart.items;
      total.value = cart.total;
    } catch (error) {
      console.error('Ошибка при загрузке корзины:', error);
      items.value = [];
      total.value = 0;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Добавляет товар в корзину через GraphQL мутацию
   * Обновляет локальное состояние на основе ответа бэка
   * @param {Object} product - Объект товара
   */
  async function add(product) {
    try {
      const updatedCart = await addToCart(product.id, 1);
      items.value = updatedCart.items;
      total.value = updatedCart.total;
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      throw error;
    }
  }

  /**
   * Уменьшает количество товара на 1
   * Если количество станет 0, товар удаляется из корзины
   * @param {string|number} productId - ID товара
   */
  async function decrement(productId) {
    const existingItem = items.value.find(item => item.productId === String(productId));

    if (existingItem) {
      const newQuantity = existingItem.quantity - 1;
      try {
        const updatedCart = await updateCartItem(productId, newQuantity);
        items.value = updatedCart.items;
        total.value = updatedCart.total;
      } catch (error) {
        console.error('Ошибка при уменьшении количества товара:', error);
        throw error;
      }
    }
  }

  /**
   * Удаляет товар из корзины (передаем количество 0)
   * @param {string|number} productId - ID товара
   */
  async function remove(productId) {
    try {
      const updatedCart = await updateCartItem(productId, 0);
      items.value = updatedCart.items;
      total.value = updatedCart.total;
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      throw error;
    }
  }

  /**
   * Очищает корзину (удаляет все товары)
   * Для каждого товара отправляет запрос на удаление
   */
  async function clear() {
    try {
      // Удаляем все товары по одному
      const itemsToRemove = [...items.value];
      for (const item of itemsToRemove) {
        await updateCartItem(item.productId, 0);
      }
      items.value = [];
      total.value = 0;
    } catch (error) {
      console.error('Ошибка при очистке корзины:', error);
      throw error;
    }
  }

  return {
    items,
    total,
    isLoading,
    totalCount,
    itemsCount,
    totalAmount,
    fetchCart,
    add,
    decrement,
    remove,
    clear,
  };
});

