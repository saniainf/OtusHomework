import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  toStarsHTML,
  loadProducts,
  loadProduct,
  login,
  checkout,
  productWordComputing,
} from '../utils.js';

describe('функция toStarsHTML', () => {
  it('строит строку с нужным числом полных и пустых звёзд', () => {
    const html = toStarsHTML(3, 5);
    expect((html.match(/★/g) || []).length).toBe(3);
    expect((html.match(/☆/g) || []).length).toBe(2);
  });

  it('использует total по умолчанию', () => {
    const html = toStarsHTML(4);
    expect((html.match(/★/g) || []).length).toBe(4);
    expect((html.match(/☆/g) || []).length).toBe(1);
  });
});

describe('функция loadProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = undefined;
  });

  it('возвращает список товаров при успешном ответе', async () => {
    const payload = [{ id: 1, title: 'Товар' }];

    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => payload,
    }));

    const result = await loadProducts();

    expect(result).toEqual(payload);
  });

  it('возвращает пустой список при ошибке', async () => {
    global.fetch = vi.fn(async () => ({ ok: false }));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    const result = await loadProducts();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('функция loadProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = undefined;
  });

  it('возвращает товар по id при успехе', async () => {
    const product = { id: 7, title: 'Куртка' };
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => product,
    }));

    const result = await loadProduct(7);

    expect(result).toEqual(product);
  });

  it('возвращает null при ошибке', async () => {
    global.fetch = vi.fn(async () => ({ ok: false }));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    const result = await loadProduct(99);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('функция login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = undefined;
  });

  it('возвращает токен при корректных данных', async () => {
    const tokenPayload = { token: 'test-token-123' };
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => tokenPayload,
    }));

    const result = await login('testuser', 'testpass123');

    expect(result).toEqual(tokenPayload);
  });

  it('возвращает null при ошибке авторизации', async () => {
    global.fetch = vi.fn(async () => ({ ok: false }));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    const result = await login('empty', 'empty');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('функция checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = undefined;
  });

  it('отправляет заказ и возвращает ответ сервера', async () => {
    const responsePayload = { status: 'ok' };
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => responsePayload,
    }));

    const items = [{ id: 1, title: 'Куртка' }, { id: 2, title: 'Телефон' }];
    const customer = { name: 'UserName', email: 'user@mail.ru', phone: '123456789', address: 'UserCity' };

    const result = await checkout(items, customer);
    expect(result).toEqual(responsePayload);

    // проверяем что fetch вызван с правильными параметрами
    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(body.customer).toEqual(customer);
    expect(new Date(body.orderDate).toISOString()).toBe(body.orderDate);
  });

  it('бросает ошибку, если API вернул ошибку', async () => {
    global.fetch = vi.fn(async () => ({ ok: false }));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    const result = checkout([], {});
    await expect(result).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('функция productWordComputing', () => {
  it.each([
    [null, 'товаров'],
    [1, 'товар'],
    [2, 'товара'],
    [5, 'товаров'],
    [11, 'товаров'],
    [21, 'товар'],
    [22, 'товара']])
    ('корректно склоняет %s', (n, expected) => {
      expect(productWordComputing(n)).toBe(expected);
    });
});

