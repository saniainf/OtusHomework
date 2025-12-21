import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';

const LOCAL_KEY = 'homework-07.basket';

export const useBasketStore = defineStore('basket', () => {
  const items = useLocalStorage(LOCAL_KEY, []);

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.qty, 0);
  });

  const itemsCount = computed(() => {
    return items.value.length;
  });

  const totalAmount = computed(() => {
    const sum = items.value.reduce((total, item) => total + item.price * item.qty, 0);
    return sum.toFixed(2);
  });

  function add(product) {
    const existingItem = items.value.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      items.value.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }
  }

  function decrement(productId) {
    const existingItem = items.value.find(item => item.id === productId);

    if (existingItem) {
      existingItem.qty -= 1;

      if (existingItem.qty <= 0) {
        items.value = items.value.filter(item => item.id !== productId);
      }
    }
  }

  function remove(productId) {
    items.value = items.value.filter(item => item.id !== productId);
  }

  function clear() {
    items.value = [];
  }

  return {
    items,
    totalCount,
    itemsCount,
    totalAmount,
    add,
    decrement,
    remove,
    clear,
  };
});

