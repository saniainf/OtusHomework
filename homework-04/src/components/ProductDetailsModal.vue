<template>
  <div v-if="isOpen && product" class="backdrop" role="presentation" @click="close">
    <div class="container" @click.stop>
      <header class="header">
        <h2 class="title">
          {{ product.title }}
        </h2>
        <button type="button" class="close-btn" @click="close">
          ×
        </button>
      </header>

      <div class="body">
        <div class="content">
          <img :src="product.image" :alt="product.title" class="product-image" />
          <p class="product-description">{{ product.description }}</p>
          <div class="product-info">
            <span class="product-category">{{ product.category }}</span>
            <span class="product-price">${{ product.price.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const {isOpen, product} = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close']);

function close() {
  emit('close');
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.container {
  background-color: #fff;
  border-radius: 12px;
  width: 700px;
  max-height: 90vh;
  box-shadow: 0 0 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #2c3e50;
}

.body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  color: #333;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-image {
  max-height: 300px;
  margin: 0 auto;
  background-color: #f8f8f8;
  padding: 1rem;
  border-radius: 8px;
}

.product-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.product-category {
  font-size: 1rem;
  text-transform: uppercase;
  color: #42b983;
  background-color: #e8f5ef;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-weight: 600;
}

.product-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
}
</style>
