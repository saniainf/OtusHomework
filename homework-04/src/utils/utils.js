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

/**
 * Правильное склонение слова "товар"
 */
export function productWord(count) {
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