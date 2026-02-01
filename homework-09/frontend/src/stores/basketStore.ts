import { computed, ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import { addToCart, updateCartItem, loadCart, subscribeToCartUpdates, recreateWsClient, closeWsConnection } from '../utils/utils.js';
import type { Cart, Product, CartItem } from '../types';

export const useBasketStore = defineStore('basket', () => {
  const items = shallowRef<CartItem[]>([]);
  // Общая сумма корзины (вычисляется на бэке и возвращается)
  const total = ref<number>(0);
  // Состояние загрузки данных
  const isLoading = ref<boolean>(false);
  // Функция отписки от WebSocket событий
  let unsubscribeFromCart: (() => void) | null = null;

  const totalCount = computed<number>(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const itemsCount = computed<number>(() => {
    return items.value.length;
  });

  const totalAmount = computed<string>(() => {
    return Number(total.value).toFixed(2);
  });

  /**
   * Инициализирует WebSocket соединение с токеном авторизации.
   * Должна вызываться после успешного логина.
   * @param token JWT токен пользователя
   */
  async function initWebSocket(token: string): Promise<void> {
    // Пересоздаём WebSocket клиент с новым токеном и ждём соединения
    await recreateWsClient(token);
    // После установки соединения подписываемся на обновления корзины
    startCartSubscription();
  }

  /**
   * Подписывается на обновления корзины через WebSocket.
   * При получении события обновляет локальное состояние.
   */
  function startCartSubscription(): void {
    // Сначала отписываемся от предыдущей подписки (если есть)
    stopCartSubscription();

    // Подписываемся на обновления корзины
    unsubscribeFromCart = subscribeToCartUpdates((updatedCart: Cart) => {
      // Обновляем локальное состояние из WebSocket события
      items.value = updatedCart.items;
      total.value = updatedCart.total;
    });
  }

  /**
   * Отписывается от WebSocket событий корзины.
   */
  function stopCartSubscription(): void {
    if (unsubscribeFromCart) {
      unsubscribeFromCart();
      unsubscribeFromCart = null;
    }
  }

  /**
   * Закрывает WebSocket соединение и отписывается от событий.
   * Вызывается при логауте.
   */
  function cleanupWebSocket(): void {
    stopCartSubscription();
    closeWsConnection();
  }

  /**
   * Загружает корзину с бэка
   */
  async function fetchCart(): Promise<void> {
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
   * @param product Объект товара
   */
  async function add(product: Product): Promise<void> {
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
   * @param productId ID товара
   */
  async function decrement(productId: string | number): Promise<void> {
    const existingItem = items.value.find(item => item.productId === String(productId));

    if (existingItem) {
      const newQuantity = existingItem.quantity - 1;
      try {
        const updatedCart = await updateCartItem(String(productId), newQuantity);
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
   * @param productId ID товара
   */
  async function remove(productId: string | number): Promise<void> {
    try {
      const updatedCart = await updateCartItem(String(productId), 0);
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
  async function clear(): Promise<void> {
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
    // WebSocket функции
    initWebSocket,
    startCartSubscription,
    stopCartSubscription,
    cleanupWebSocket,
  };
});

