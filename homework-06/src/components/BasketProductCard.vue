<template>
  <div class="container">
    <div class="image-container">
      <img :src="product.image" :alt="product.title" class="image" />
    </div>

    <div class="info">
      <h3 class="title" @click="navigateToDetails">{{ product.title }}</h3>
      <p class="price">${{ product.price.toFixed(2) }}</p>
    </div>

    <div class="controls">
      <div class="quantity-control">
        <button @click="$emit('decrement', product.id)" class="qty-btn">−</button>
        <span class="qty-value">{{ product.qty }}</span>
        <button @click="$emit('increment', product)" class="qty-btn">+</button>
      </div>
      <button @click="$emit('remove', product.id)" class="remove-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>

    <div class="subtotal">
      ${{ (product.price * product.qty).toFixed(2) }}
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const { product } = defineProps({
  product: {
    type: Object,
    required: true
  }
});

defineEmits(['increment', 'decrement', 'remove']);

function navigateToDetails() {
  router.push({
    path: `/product/${product.id}`
  });
}
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 120px 1fr auto auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
}

.image-container {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 0.5rem;
}

.image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title {
  font-size: 1.125rem;
  margin: 0;
  line-height: 1.4;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
}

.title:hover {
  color: #42b983;
}

.price {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  background-color: #fff;
  color: #2c3e50;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  background-color: #36a372;
  color: #fff;
  border-color: #36a372;
}

.qty-value {
  min-width: 32px;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.remove-btn {
  padding: 0.5rem;
  background-color: #fff;
  color: #aaaaaa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background-color: #e74c3c;
  color: #fff;
  border-color: #e74c3c;
}

.subtotal {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  min-width: 100px;
  text-align: right;
}
</style>
