<template>
  <div v-if="isOpen && items.length" class="backdrop" role="presentation" @click="close">
    <div class="container" @click.stop>
      <header class="header">
        <h2 class="title">
          Оформление заказа
        </h2>
        <button type="button" class="close-btn" @click="close">
          ×
        </button>
      </header>

      <div class="body">
        <div class="content">
          <form class="checkout-form">
            <div class="form-field">
              <label for="checkout-name" class="form-label">Имя</label>
              <input id="checkout-name" type="text" class="form-input" placeholder="Введите ваше имя" />
            </div>
            <div class="form-field">
              <label for="checkout-email" class="form-label">Почта</label>
              <input id="checkout-email" type="email" class="form-input" placeholder="example@mail.com" />
            </div>
            <div class="form-field">
              <label for="checkout-address" class="form-label">Адрес</label>
              <textarea id="checkout-address" class="form-textarea" rows="3" placeholder="Введите адрес доставки"></textarea>
            </div>
          </form>

          <div class="checkout-total">
            Итого: {{ items.length }} {{ products }} на сумму {{items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}} $
          </div>

          <div class="checkout-actions">
            <button type="button" class="checkout-btn checkout-btn-cancel" @click="close">Отменить</button>
            <button type="button" class="checkout-btn checkout-btn-confirm">Подтвердить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { productWord } from '../utils/utils.js';

const { isOpen, items } = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

const products = computed(() => productWord(items.length));

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

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #42b983;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.checkout-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
}

.checkout-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.checkout-btn {
  flex: 1;
  padding: 0.9rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.checkout-btn-cancel {
  background-color: #fff;
  color: #666;
  border: 2px solid #ddd;
}

.checkout-btn-cancel:hover {
  background-color: #f5f5f5;
}

.checkout-btn-confirm {
  background-color: #42b983;
  color: #fff;
}

.checkout-btn-confirm:hover {
  background-color: #36a372;
}
</style>
