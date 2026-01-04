import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../App.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } }
    ],
  });
}

async function mountApp() {
  const pinia = createPinia();
  setActivePinia(pinia);

  const router = createTestRouter();
  router.push('/');
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

  it('app exists', async () => {
    const { wrapper } = await mountApp();

    expect(wrapper.exists()).toBe(true)
  });
})
