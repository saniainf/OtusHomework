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
            <!-- Поле ввода имени с валидацией -->
            <div class="form-field">
              <label for="checkout-name" class="form-label">Имя</label>
              <input 
                id="checkout-name" 
                v-model="formData.name" 
                @blur="validator.name.$touch()"
                type="text" 
                class="form-input" 
                :class="{ 'form-input-error': validator.name.$error }"
                placeholder="Введите ваше имя" 
              />
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
              <input 
                id="checkout-email" 
                v-model="formData.email" 
                @blur="validator.email.$touch()"
                type="email" 
                class="form-input" 
                :class="{ 'form-input-error': validator.email.$error }"
                placeholder="example@mail.com" 
              />
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
              <textarea 
                id="checkout-address" 
                v-model="formData.address" 
                @blur="validator.address.$touch()"
                class="form-textarea" 
                :class="{ 'form-input-error': validator.address.$error }"
                rows="3" 
                placeholder="Введите адрес доставки"
              ></textarea>
              <!-- Отображение ошибок валидации для поля адреса -->
              <div v-if="validator.address.$error" class="form-error">
                <span v-for="error of validator.address.$errors" :key="error.$uid">
                  {{ error.$message }}
                </span>
              </div>
            </div>
          </form>

          <div class="checkout-total">
            Итого: {{ items.length }} {{ products }} на сумму {{items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}} $
          </div>

          <div class="checkout-actions">
            <button type="button" class="checkout-btn checkout-btn-cancel" @click="close">Отменить</button>
            <button type="button" class="checkout-btn checkout-btn-confirm" @click="handleSubmit">Подтвердить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, helpers } from '@vuelidate/validators';
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

const emit = defineEmits(['close', 'confirm']);

const products = computed(() => productWord(items.length));

const formData = reactive({
  name: '',
  email: '',
  address: ''
});

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

async function handleSubmit() {
  const isValid = await validator.value.$validate();
  
  if (!isValid) {
    validator.value.$touch();
    return;
  }
  
  emit('confirm', { ...formData });

  close();
}

function close() {
  formData.name = '';
  formData.email = '';
  formData.address = '';
  validator.value.$reset();
  
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

/* Стиль для поля с ошибкой валидации */
.form-input-error {
  border-color: #e74c3c; /* Красная рамка для невалидного поля */
}

/* Блок с сообщением об ошибке валидации */
.form-error {
  font-size: 0.85rem; /* Уменьшенный размер текста ошибки */
  color: #e74c3c; /* Красный цвет текста ошибки */
  margin-top: 0.25rem; /* Небольшой отступ сверху от поля */
}
</style>
