import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import { nextTick } from 'vue';
import App from '../App.vue';
import AppHeader from '../components/AppHeader.vue';

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div class="home-view">home</div>' } },
      { path: '/second', component: { template: '<div class="second-view">second</div>' } },
    ],
  });
}

async function mountApp(initialRoute = '/') {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  router.push(initialRoute);
  await router.isReady();

  const wrapper = mount(App, {
    global: {
      plugins: [pinia, router],
    },
  });

  return { wrapper, router };
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('рендерит приложение', async () => {
    const { wrapper } = await mountApp();

    expect(wrapper.exists()).toBe(true);
  });

  it('отображает AppHeader один раз', async () => {
    const { wrapper } = await mountApp();

    const headers = wrapper.findAllComponents(AppHeader);
    
    expect(headers).toHaveLength(1);
  });

  it('отображает home view', async () => {
    const { wrapper } = await mountApp();

    expect(wrapper.find('.home-view').exists()).toBe(true);
    expect(wrapper.find('.second-view').exists()).toBe(false);
  });

  it('обновляет route на second view', async () => {
    const { wrapper, router } = await mountApp();

    await router.push('/second');
    await nextTick();

    expect(wrapper.find('.home-view').exists()).toBe(false);
    expect(wrapper.find('.second-view').exists()).toBe(true);
  });
});
