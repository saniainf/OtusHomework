// Адреса GraphQL сервера
const GRAPHQL_HTTP_URL = import.meta.env.VITE_GRAPHQL_HTTP_URL || 'http://localhost:4000/graphql';
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql';

/**
 * Отправляет GraphQL запрос через HTTP POST.
 * Используется для queries и mutations, не требует переподключения для каждого запроса.
 * @param {string} query - GraphQL запрос или мутация
 * @param {Object} variables - Переменные для запроса (по умолчанию пусто)
 * @returns {Promise<Object>} Ответ от сервера с данными
 * @throws {Error} Если возникла ошибка при выполнении запроса или GraphQL вернул ошибку
 */
async function graphqlRequest(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_HTTP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
 * @param {number} limit - Количество товаров на странице
 * @param {number} offset - Смещение от начала
 * @param {string|null} category - Фильтр по категории (опционально)
 * @returns {Promise<Object>} Объект с товарами, всего товаров и флаг hasMore
 */
export async function loadProducts(limit = 3, offset = 0, category = null) {
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
    const data = await graphqlRequest(query, variables);
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
 * @param {string} id - ID товара
 * @returns {Promise<Object|null>} Объект товара или null если ошибка
 */
export async function loadProduct(id) {
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
    const data = await graphqlRequest(query, variables);
    return data.product;
  } catch (error) {
    console.error('Не удалось получить товар', error);
    return null;
  }
}

/**
 * Загружает список всех категорий товаров
 * @returns {Promise<Array<string>>} Массив категорий
 */
export async function loadCategories() {
  const query = `
    query GetCategories {
      categories
    }
  `;

  try {
    const data = await graphqlRequest(query);
    return data.categories;
  } catch (error) {
    console.error('Не удалось получить список категорий', error);
    return [];
  }
}

/**
 * Загружает корзину
 * @returns {Promise<Object>} Объект с товарами, всего и итоговой суммой
 */
export async function loadCart() {
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
    const data = await graphqlRequest(query);
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
 * @param {string} productId - ID товара
 * @param {number} quantity - Количество товара (по умолчанию 1)
 * @returns {Promise<Object>} Обновленная корзина
 */
export async function addToCart(productId, quantity = 1) {
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
    const data = await graphqlRequest(query, variables);
    return data.addToCart;
  } catch (error) {
    console.error('Не удалось добавить товар в корзину', error);
    throw error;
  }
}

/**
 * Обновляет количество товара в корзине
 * @param {string} productId - ID товара
 * @param {number} quantity - Новое количество (если 0 или меньше - товар удаляется)
 * @returns {Promise<Object>} Обновленная корзина
 */
export async function updateCartItem(productId, quantity) {
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
    const data = await graphqlRequest(query, variables);
    return data.updateCartItem;
  } catch (error) {
    console.error('Не удалось обновить товар в корзине', error);
    throw error;
  }
}

/**
 * Пока вход оставляем с fakestore (можно позже добавить в GraphQL)
 */
export async function login(username, password) {
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
 * @param {Array} items - Массив товаров в корзине
 * @param {Object} data - Данные формы (имя, email, адрес)
 * @returns {Promise<Object>} Ответ от сервера
 */
export async function checkout(items, data) {
  try {
    const orderData = {
      items: items.map(item => ({
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

export function toStarsHTML(num, total = 5) {
  return Array.from({ length: total }, (_, i) =>
    `<span class="star">${i < num ? '★' : '☆'}</span>`
  ).join('')
}

/**
 * Правильное склонение слова "товар"
 */
export function productWordComputing(count) {
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