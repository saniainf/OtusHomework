export function toStarsHTML(num, total = 5) {
  return Array.from({ length: total }, (_, i) =>
    `<span class="star">${i < num ? '★' : '☆'}</span>`
  ).join('')
}

export async function loadProducts() {
  try {
    const response = await fetch('https://fakestoreapi.com/products');

    if (!response.ok) {
      throw new Error('Ошибка сети');
    }

    return await response.json();
  } catch (error) {
    console.error('Не удалось получить список товаров', error);
    return [];
  }
};

export async function loadProduct(id) {
  try {
    const response = await fetch(`https://fakestoreapi.com/products/${id}`);

    if (!response.ok) {
      throw new Error('Ошибка сети');
    }

    return await response.json();
  } catch (error) {
    console.error('Не удалось получить товар', error);
    return null;
  }
}

export async function login(username, password) {
  try {
    const credentials = { username: username, password: password };
    const response = await fetch('https://fakestoreapi.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

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
 * Отправка заказа на сервер
 * @param {Array} items - Массив товаров в корзине
 * @param {Object} data - Данные формы (имя, email, телефон, адрес)
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

    // Отправляем POST-запрос на эхосервер httpbin.org
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