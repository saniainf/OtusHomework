import { createClient, type Client } from 'graphql-ws';
import type { ProductsPage, Product, Cart, LoginResponse, CheckoutData, OrderData } from '../types';

// Адреса GraphQL сервера
const GRAPHQL_HTTP_URL = import.meta.env.VITE_GRAPHQL_HTTP_URL || 'http://localhost:4000/graphql';
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql';

// Переменная для хранения WebSocket клиента
let wsClient: Client | null = null;
// Сохраняем токен для переиспользования при переподключениях
let savedToken: string | null = null;
// Promise для ожидания готовности соединения
let connectionReadyPromise: Promise<void> | null = null;
let connectionReadyResolve: (() => void) | null = null;

/**
 * Создаёт или возвращает существующий WebSocket клиент для GraphQL подписок.
 * @param token JWT токен для авторизации
 * @returns WebSocket клиент graphql-ws
 */
export function getWsClient(token: string | null = null): Client {
  if (token) {
    savedToken = token;
  }

  if (wsClient) {
    return wsClient;
  }

  // Создаём Promise для ожидания готовности соединения
  connectionReadyPromise = new Promise((resolve) => {
    connectionReadyResolve = resolve;
  });

  wsClient = createClient({
    url: GRAPHQL_WS_URL,
    connectionParams: () => {
      if (savedToken) {
        return { Authorization: `Bearer ${savedToken}` };
      }
      return {};
    },
    retryAttempts: Infinity,
    retryWait: async (retries) => {
      await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 30000)));
    },
    lazy: false,
    keepAlive: 10000,
    on: {
      connected: () => {
        // Разрешаем Promise когда соединение готово
        if (connectionReadyResolve) {
          connectionReadyResolve();
          connectionReadyResolve = null;
        }
      },
      error: (error) => {
        console.error('WebSocket ошибка:', error);
      },
    },
  });

  return wsClient;
}

/**
 * Ожидает готовности WebSocket соединения.
 */
export async function waitForConnection(): Promise<void> {
  if (connectionReadyPromise) {
    await connectionReadyPromise;
  }
}

/**
 * Пересоздаёт WebSocket клиент с новым токеном.
 * @param token Новый JWT токен
 * @returns WebSocket клиент после готовности соединения
 */
export async function recreateWsClient(token: string | null = null): Promise<Client> {
  savedToken = token;

  if (wsClient) {
    wsClient.dispose();
    wsClient = null;
  }

  const client = getWsClient(token);
  // Ждём пока соединение установится
  await waitForConnection();
  return client;
}

/**
 * Закрывает WebSocket соединение.
 */
export function closeWsConnection(): void {
  savedToken = null;
  connectionReadyPromise = null;
  connectionReadyResolve = null;
  if (wsClient) {
    wsClient.dispose();
    wsClient = null;
  }
}

/**
 * Подписывается на обновления корзины через WebSocket.
 * @param onCartUpdate Колбэк при обновлении корзины
 * @returns Функция для отписки
 */
export function subscribeToCartUpdates(onCartUpdate: (cart: Cart) => void): (() => void) {
  const query = `
    subscription OnCartUpdated {
      cartUpdated {
        items {
          productId
          quantity
          product {
            id
            title
            price
            image
            category
          }
        }
        total
      }
    }
  `;

  const client = getWsClient();
  if (!client) {
    console.error('WebSocket клиент не создан');
    return () => {};
  }

  // Возвращаем функцию отписки от client.subscribe
  return client.subscribe(
    { query },
    {
      next: (result: unknown) => {
        const typedResult = result as { data?: { cartUpdated?: Cart } };
        if (typedResult.data?.cartUpdated) {
          onCartUpdate(typedResult.data.cartUpdated);
        }
      },
      error: (error) => {
        console.error('WebSocket подписка ошибка:', error);
      },
      complete: () => {
        // Подписка завершена сервером
      },
    }
  );
}

/**
 * Отправляет GraphQL запрос через HTTP POST с авторизацией.
 * Используется для queries и mutations. Автоматически добавляет Authorization header если пользователь авторизован.
 * @param query GraphQL запрос или мутация
 * @param variables Переменные для запроса (по умолчанию пусто)
 * @returns Ответ от сервера с данными
 * @throws Если возникла ошибка при выполнении запроса или GraphQL вернул ошибку
 */
async function graphqlRequest(query: string, variables: Record<string, unknown> = {}): Promise<unknown> {
  try {
    // Динамически получаем токен (импортируем здесь чтобы избежать циклических зависимостей)
    const { useAuthStore } = await import('../stores/authStore.js');
    const authStore = useAuthStore();

    // Формируем headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Если пользователь авторизован - добавляем токен
    if (authStore.authData.token) {
      headers['Authorization'] = `Bearer ${authStore.authData.token}`;
    }

    const response = await fetch(GRAPHQL_HTTP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ошибка! Статус: ${response.status}`);
    }

    const result = await response.json();

    // Проверяем на ошибки GraphQL
    if (result.errors) {
      console.error('GraphQL ошибка:', result.errors);
      throw new Error(result.errors[0]?.message || 'Неизвестная ошибка GraphQL');
    }

    return result.data;
  } catch (error) {
    console.error('Ошибка при запросе к GraphQL:', error);
    throw error;
  }
}

/**
 * Загружает товары с пагинацией и опциональной фильтрацией по категории
 * @param limit Количество товаров на странице
 * @param offset Смещение от начала
 * @param category Фильтр по категории (опционально)
 * @returns Объект с товарами, всего товаров и флаг hasMore
 */
export async function loadProducts(limit: number = 3, offset: number = 0, category: string | null = null): Promise<ProductsPage> {
  const query = `
    query GetProducts($limit: Int, $offset: Int, $category: String) {
      products(limit: $limit, offset: $offset, category: $category) {
        items {
          id
          title
          price
          description
          category
          image
          rating {
            rate
            count
          }
        }
        total
        hasMore
      }
    }
  `;

  const variables = {
    limit,
    offset,
    category: category || null,
  };

  try {
    const data = await graphqlRequest(query, variables) as { products: ProductsPage };
    return data.products;
  } catch (error) {
    console.error('Не удалось получить список товаров', error);
    return {
      items: [],
      total: 0,
      hasMore: false,
    };
  }
}

/**
 * Загружает один товар по ID
 * @param id ID товара
 * @returns Объект товара или null если ошибка
 */
export async function loadProduct(id: string): Promise<Product | null> {
  const query = `
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        title
        price
        description
        category
        image
        rating {
          rate
          count
        }
      }
    }
  `;

  const variables = { id };

  try {
    const data = await graphqlRequest(query, variables) as { product: Product | null };
    return data.product;
  } catch (error) {
    console.error('Не удалось получить товар', error);
    return null;
  }
}

/**
 * Загружает список всех категорий товаров
 * @returns Массив категорий
 */
export async function loadCategories(): Promise<string[]> {
  const query = `
    query GetCategories {
      categories
    }
  `;

  try {
    const data = await graphqlRequest(query) as { categories: string[] };
    return data.categories;
  } catch (error) {
    console.error('Не удалось получить список категорий', error);
    return [];
  }
}

/**
 * Загружает корзину
 * @returns Объект с товарами и итоговой суммой
 */
export async function loadCart(): Promise<Cart> {
  const query = `
    query GetCart {
      cart {
        items {
          productId
          quantity
          product {
            id
            title
            price
            image
            category
          }
        }
        total
      }
    }
  `;

  try {
    const data = await graphqlRequest(query) as { cart: Cart };
    return data.cart;
  } catch (error) {
    console.error('Не удалось получить корзину', error);
    return {
      items: [],
      total: 0,
    };
  }
}

/**
 * Добавляет товар в корзину
 * @param productId ID товара
 * @param quantity Количество товара (по умолчанию 1)
 * @returns Обновленная корзина
 */
export async function addToCart(productId: string, quantity: number = 1): Promise<Cart> {
  const query = `
    mutation AddToCart($productId: ID!, $quantity: Int) {
      addToCart(productId: $productId, quantity: $quantity) {
        items {
          productId
          quantity
          product {
            id
            title
            price
            image
          }
        }
        total
      }
    }
  `;

  const variables = {
    productId,
    quantity,
  };

  try {
    const data = await graphqlRequest(query, variables) as { addToCart: Cart };
    return data.addToCart;
  } catch (error) {
    console.error('Не удалось добавить товар в корзину', error);
    throw error;
  }
}

/**
 * Обновляет количество товара в корзине
 * @param productId ID товара
 * @param quantity Новое количество (если 0 или меньше - товар удаляется)
 * @returns Обновленная корзина
 */
export async function updateCartItem(productId: string, quantity: number): Promise<Cart> {
  const query = `
    mutation UpdateCartItem($productId: ID!, $quantity: Int!) {
      updateCartItem(productId: $productId, quantity: $quantity) {
        items {
          productId
          quantity
          product {
            id
            title
            price
            image
          }
        }
        total
      }
    }
  `;

  const variables = {
    productId,
    quantity,
  };

  try {
    const data = await graphqlRequest(query, variables) as { updateCartItem: Cart };
    return data.updateCartItem;
  } catch (error) {
    console.error('Не удалось обновить товар в корзине', error);
    throw error;
  }
}

/**
 * Пока вход оставляем с fakestore (можно позже добавить в GraphQL)
 * @param username Имя пользователя
 * @param password Пароль
 * @returns Токен или null при ошибке
 */
export async function login(username: string, password: string): Promise<LoginResponse | null> {
  try {
    const credentials = { username: username, password: password };
    const response = await fetch('https://fakestoreapi.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Ошибка сети');
    }

    return await response.json();
  } catch (error) {
    console.error('Не удалось выполнить вход', error);
    return null;
  }
}

/**
 * Пока отправка заказа остается на httpbin (можно позже добавить в GraphQL)
 * @param items Массив товаров в корзине
 * @param data Данные формы (имя, email, адрес)
 * @returns Ответ от сервера
 */
export async function checkout(items: Product[], data: CheckoutData): Promise<unknown> {
  try {
    const orderData: OrderData = {
      items: items.map((item: Product) => ({
        id: item.id,
      })),
      customer: data,
      orderDate: new Date().toISOString(),
    };

    const response = await fetch('https://httpbin.org/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Ошибка при оформлении заказа');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Не удалось оформить заказ', error);
    throw error;
  }
}

/**
 * Преобразует число в HTML с звёздами рейтинга.
 * @param num Количество заполненных звёзд
 * @param total Общее количество звёзд
 * @returns HTML строка со звёздами
 */
export function toStarsHTML(num: number, total: number = 5): string {
  return Array.from({ length: total }, (_, i) =>
    `<span class="star">${i < num ? '★' : '☆'}</span>`
  ).join('')
}

/**
 * Правильное склонение слова "товар"
 * @param count Количество товаров
 * @returns Правильно склоненное слово
 */
export function productWordComputing(count: number | null): string {
  if (count === null) return 'товаров';

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'товаров';
  }

  if (lastDigit === 1) {
    return 'товар';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'товара';
  }

  return 'товаров';
};
