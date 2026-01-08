import { test, expect } from '@playwright/test';
import { createProductFixture } from '../src/__tests__/fixtures/product.js';

// See here how to get started:
// https://playwright.dev/docs/intro
test.describe('VueApp e2e Tests', () => {
  test('visits the app root url', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('Homework-07');
  });
});

test.describe('Home page e2e Tests', () => {
  const productsMock = [
    createProductFixture({ id: 1, title: 'Куртка', category: 'Одежда', price: 10, image: 'image1.png', rating: { rate: 4, count: 10 } }),
    createProductFixture({ id: 2, title: 'Брюки', category: 'Одежда', price: 20, image: 'image2.png', rating: { rate: 5, count: 8 } }),
    createProductFixture({ id: 3, title: 'Ноутбук', category: 'Техника', price: 30, image: 'image3.png', rating: { rate: 4, count: 15 } }),
    createProductFixture({ id: 4, title: 'Смартфон', category: 'Техника', price: 40, image: 'image4.png', rating: { rate: 3, count: 5 } }),
  ];

  test.beforeEach(async ({ page }) => {
    await page.route('*/**/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsMock),
      });
    });
  });

  test('переход на страницу Login', async ({ page }) => {
    await page.goto('/');

    await page.locator('.login-btn').click();

    await expect(page).toHaveURL('/login');
  });

  test('отображает список товаров на главной странице', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.product-card');
    expect(await page.locator('.product-card').count()).toBeGreaterThan(0);
  });

  test('поиск товаров работает корректно', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.product-card');
    await page.locator('.search-input').fill('Куртка');

    expect(await page.locator('.product-card').count()).toBeGreaterThan(0);
  });

  test('кнопка "Показать ещё" загружает дополнительные товары', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.product-card');
    const initialCount = await page.locator('.product-card').count();

    await page.locator('.show-more-btn').click();
    await page.waitForTimeout(1000); 

    const newCount = await page.locator('.product-card').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('отображает сообщение когда товары не найдены', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.product-card');
    await page.locator('.search-input').fill('empty');

    await expect(page.locator('.no-results')).toContainText('Товары не найдены');
  });
});

test.describe('Login page e2e Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'test-token-123' }),
      });
    });
  });


  test('отображает форму логина', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h2')).toHaveText('Вход');
  });

  test('пользователь может войти в систему', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Введите логин').fill('testuser');
    await page.getByPlaceholder('Введите пароль').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('.login-label')).toContainText('testuser');
  });
});

