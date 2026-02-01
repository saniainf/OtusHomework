<template>
  <div class="login-page">
    <div class="login-container">
      <h2 class="login-title">Вход</h2>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username" class="form-label">Логин</label>
          <input id="username" v-model="username" type="text" class="form-input" placeholder="Введите логин" required />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Пароль</label>
          <input id="password" v-model="password" type="password" class="form-input" placeholder="Введите пароль" required />
        </div>

        <button type="submit" class="login-btn">Войти</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Router } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import { useBasketStore } from '../stores/basketStore.js';
import { login } from '../utils/utils.js';
import type { LoginResponse } from '../types/index.js';

const router: Router = useRouter();
const authStore = useAuthStore();
const basket = useBasketStore();

// Поля формы входа
const username: Ref<string> = ref<string>('');
const password: Ref<string> = ref<string>('');

/**
 * Обрабатывает отправку формы входа.
 * Отправляет учётные данные на сервер, сохраняет токен в auth store,
 * инициализирует WebSocket соединение и загружает корзину пользователя.
 */
function handleLogin(): void {
  console.log('Логин:', username.value);
  console.log('Пароль:', password.value);

  login(username.value, password.value)
    .then((response: LoginResponse | null): void => {
      if (response) {
        // Сохраняем логин и токен в auth store
        authStore.login(username.value, response.token);
        // Инициализируем WebSocket с новым токеном для получения обновлений корзины
        basket.initWebSocket(response.token);
        // После успешного логина загружаем корзину пользователя с бэка
        basket.fetchCart();
        // Перенаправляем на главную страницу
        router.push({ path: '/' });
      }
    })
    .catch((error: unknown): void => {
      console.error('Ошибка при входе:', error);
      alert('Ошибка при входе. Пожалуйста, проверьте ваши данные и попробуйте снова.');
    });
}

/**
 * При загрузке компонента выводим тестовые данные для входа
 */
onMounted((): void => {
  console.log('Логин:', 'johnd');
  console.log('Пароль:', 'm38rmF$');
});
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.login-container {
  width: 400px;
  background-color: #fff;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.login-title {
  margin: 0 0 2rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #2c3e50;
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
}

.form-input::placeholder {
  color: #999;
}

.login-btn {
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.login-btn:hover {
  background-color: #36a372;
}
</style>
