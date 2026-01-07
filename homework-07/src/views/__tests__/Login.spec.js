import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import Login from '../Login.vue';
import { useAuthStore } from '../../stores/authStore.js';

// Мокаем функцию login из utils
vi.mock('../../utils/utils.js', () => ({
  login: vi.fn(),
}));

const { login } = await import('../../utils/utils.js');

// роутер
function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/login', component: Login },
    ],
  });
}

// Создаем wrapper для Login.vue
async function mountLogin() {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  router.push('/login');
  await router.isReady();

  const wrapper = mount(Login, {
    global: {
      plugins: [router, pinia],
    },
  });

  const authStore = useAuthStore();

  return { wrapper, router, authStore };
}

describe('Login.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    login.mockResolvedValue({ token: 'test-token-123' });
  });

  it('отображает форму входа с полями логина и пароля', async () => {
    const { wrapper } = await mountLogin();

    // проверяем что заголовок отображается
    expect(wrapper.find('.login-title').text()).toBe('Вход');

    // проверяем что поля ввода существуют
    expect(wrapper.find('#username').exists()).toBe(true);
    expect(wrapper.find('#password').exists()).toBe(true);

    // проверяем что кнопка входа существует
    expect(wrapper.find('.login-btn').exists()).toBe(true);
    expect(wrapper.find('.login-btn').text()).toBe('Войти');
  });

  it('привязывает введённые значения к v-model', async () => {
    const { wrapper } = await mountLogin();

    const usernameInput = wrapper.find('#username');
    const passwordInput = wrapper.find('#password');

    // вводим значения в поля
    await usernameInput.setValue('testuser');
    await passwordInput.setValue('testpass123');

    // проверяем что значения установлены
    expect(usernameInput.element.value).toBe('testuser');
    expect(passwordInput.element.value).toBe('testpass123');
  });

  it('вызывает handleLogin при отправке формы', async () => {
    const { wrapper } = await mountLogin();

    // заполняем форму
    await wrapper.find('#username').setValue('testuser');
    await wrapper.find('#password').setValue('testpass123');

    // отправляем форму
    await wrapper.find('.login-form').trigger('submit.prevent');
    await nextTick();

    // проверяем что функция login была вызвана с правильными параметрами
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith('testuser', 'testpass123');
  });

  it('сохраняет данные в authStore и переходит на главную при успешном входе', async () => {
    const { wrapper, router, authStore } = await mountLogin();

    const pushSpy = vi.spyOn(router, 'push');

    // заполняем форму
    await wrapper.find('#username').setValue('testuser');
    await wrapper.find('#password').setValue('testpass123');

    // отправляем форму
    await wrapper.find('.login-form').trigger('submit.prevent');

    // ждём выполнения Promise
    await new Promise(resolve => setTimeout(resolve, 0));
    await nextTick();

    // проверяем что данные сохранены в store
    expect(authStore.userName).toBe('testuser');
    expect(authStore.isLoggedIn).toBe('test-token-123');

    // проверяем что произошёл переход на главную страницу
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith({ path: '/' });
  });

  it('показывает alert при ошибке входа', async () => {
    const { wrapper } = await mountLogin();

    // мокаем alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

    // настраиваем мок для неудачного входа
    login.mockRejectedValue(new Error('Invalid credentials'));

    // заполняем форму
    await wrapper.find('#username').setValue('empty');
    await wrapper.find('#password').setValue('empty');

    // отправляем форму
    await wrapper.find('.login-form').trigger('submit.prevent');

    // ждём выполнения Promise
    await new Promise(resolve => setTimeout(resolve, 0));
    await nextTick();

    // проверяем что alert был вызван с сообщением об ошибке
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith('Ошибка при входе. Пожалуйста, проверьте ваши данные и попробуйте снова.');

    // восстанавливаем alert
    alertSpy.mockRestore();
  });

  it('не переходит на главную при ошибке входа', async () => {
    const { wrapper, router } = await mountLogin();

    // мокаем alert чтобы не показывать его в тестах
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

    // настраиваем мок для неудачного входа
    login.mockRejectedValue(new Error('Invalid credentials'));

    const pushSpy = vi.spyOn(router, 'push');

    // заполняем форму
    await wrapper.find('#username').setValue('empty');
    await wrapper.find('#password').setValue('empty');

    // отправляем форму
    await wrapper.find('.login-form').trigger('submit.prevent');

    // ждём выполнения Promise
    await new Promise(resolve => setTimeout(resolve, 0));
    await nextTick();

    // проверяем что переход не произошёл
    expect(pushSpy).not.toHaveBeenCalled();

    // восстанавливаем alert
    alertSpy.mockRestore();
  });

  it('поля имеют атрибут required', async () => {
    const { wrapper } = await mountLogin();

    const usernameInput = wrapper.find('#username');
    const passwordInput = wrapper.find('#password');

    // проверяем что поля обязательны для заполнения
    expect(usernameInput.attributes('required')).toBeDefined();
    expect(passwordInput.attributes('required')).toBeDefined();
  });
});
