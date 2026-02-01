<template>
  <div class="container" @click.stop>
    <header class="header">
      <button @click="navigateToBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Назад
      </button>
      <h1 class="title"> Оформление заказа </h1>
    </header>

    <div class="content">
      <form class="checkout-form">
        <!-- Поле ввода имени с валидацией -->
        <div class="form-field">
          <label for="checkout-name" class="form-label">Имя</label>
          <input id="checkout-name" v-model="formData.name" @blur="validator.name.$touch()" type="text" class="form-input" :class="{ 'form-input-error': validator.name.$error }" placeholder="Введите ваше имя" />
          <!-- Отображение ошибок валидации для поля имени -->
          <div v-if="validator.name.$error" class="form-error">
            <span v-for="error of validator.name.$errors" :key="error.$uid">
              {{ error.$message }}
            </span>
          </div>
        </div>

        <!-- Поле ввода почты с валидацией -->
        <div class="form-field">
          <label for="checkout-email" class="form-label">Почта</label>
          <input id="checkout-email" v-model="formData.email" @blur="validator.email.$touch()" type="email" class="form-input" :class="{ 'form-input-error': validator.email.$error }" placeholder="example@mail.com" />
          <!-- Отображение ошибок валидации для поля почты -->
          <div v-if="validator.email.$error" class="form-error">
            <span v-for="error of validator.email.$errors" :key="error.$uid">
              {{ error.$message }}
            </span>
          </div>
        </div>

        <!-- Поле ввода адреса с валидацией -->
        <div class="form-field">
          <label for="checkout-address" class="form-label">Адрес</label>
          <textarea id="checkout-address" v-model="formData.address" @blur="validator.address.$touch()" class="form-textarea" :class="{ 'form-input-error': validator.address.$error }" rows="3" placeholder="Введите адрес доставки"></textarea>
          <!-- Отображение ошибок валидации для поля адреса -->
          <div v-if="validator.address.$error" class="form-error">
            <span v-for="error of validator.address.$errors" :key="error.$uid">
              {{ error.$message }}
            </span>
          </div>
        </div>
      </form>

      <div class="checkout-total">
        Итого: {{ totalCount }} {{ productWord }} на сумму {{ totalAmount }} $
      </div>

      <div class="checkout-actions">
        <button type="button" class="checkout-btn checkout-btn-cancel" @click="navigateToBack">Отменить</button>
        <button type="button" class="checkout-btn checkout-btn-confirm" @click="handleSubmit">Подтвердить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted } from 'vue';
import { useRouter, type Router } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, helpers } from '@vuelidate/validators';
import { useBasketStore } from '../stores/basketStore.js';
import { productWordComputing } from '../utils/utils.js';
import type { CheckoutData } from '../types';

const router: Router = useRouter();
const basket = useBasketStore();
const { items, totalCount, totalAmount } = storeToRefs(basket);

// Загружаем корзину с бэка при открытии страницы
onMounted(() => {
  basket.fetchCart();
});

const productWord = computed<string>(() => productWordComputing(items.value.length));

const formData = reactive<CheckoutData>({
  name: '',
  email: '',
  address: ''
});

function clearForm(): void {
  formData.name = '';
  formData.email = '';
  formData.address = '';
  validator.value.$reset();
}

function navigateToBack(): void {
  clearForm();
  router.back();
}

const rules = {
  name: {
    required: helpers.withMessage('Имя обязательно', required),
    minLength: helpers.withMessage('Минимум 2 символа', minLength(2))
  },
  email: {
    required: helpers.withMessage('Почта обязательна', required),
    email: helpers.withMessage('Введите корректный email', email)
  },
  address: {
    required: helpers.withMessage('Адрес обязателен', required),
    minLength: helpers.withMessage('Минимум 10 символов', minLength(10))
  }
};

const validator = useVuelidate(rules, formData);

async function handleSubmit(): Promise<void> {
  const isValid = await validator.value.$validate();

  if (!isValid) {
    validator.value.$touch();
    return;
  }

  alert(`Спасибо за заказ, ${formData.name}!\nМы свяжемся с вами по почте: ${formData.email}\nДоставка будет по адресу: ${formData.address}\n\nВсего на сумму: ${totalAmount.value} $`);

  clearForm();
  basket.clear();
  router.push({ path: '/' });
}
</script>

<style scoped>
.container {
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: #f5f5f5;
  color: #2c3e50;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

.back-btn svg {
  display: block;
}

.body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  color: #333;
}

.content {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1.5rem;
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

/* Стиль для поля с ошибкой валидации */
.form-input-error {
  border-color: #e74c3c;
  /* Красная рамка для невалидного поля */
}

/* Блок с сообщением об ошибке валидации */
.form-error {
  font-size: 0.85rem;
  /* Уменьшенный размер текста ошибки */
  color: #e74c3c;
  /* Красный цвет текста ошибки */
  margin-top: 0.25rem;
  /* Небольшой отступ сверху от поля */
}
</style>
