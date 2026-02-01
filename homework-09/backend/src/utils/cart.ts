import { store } from "../state/store";
import type { Cart, CartItem } from "../types";

// Утилиты для работы с корзиной и товарами.

/**
 * Проверяет наличие товара в каталоге.
 * @param productId Идентификатор товара
 * @throws Error если товар не найден
 */
export function ensureProductExists(productId: string | number): void {
  const exists = store.products.some((p) => String(p.id) === String(productId));
  if (!exists) {
    throw new Error("Товар не найден");
  }
}

/**
 * Собирает объект корзины из списка позиций и актуальных цен.
 * @param items Список позиций корзины
 * @returns Корзина с итоговой стоимостью
 */
export function buildCart(items: CartItem[]): Cart {
  return {
    items,
    total: items.reduce((acc, item) => {
      const product = store.products.find((p) => String(p.id) === String(item.productId));
      if (!product) {
        return acc;
      }
      return acc + Number(product.price) * item.quantity;
    }, 0),
  };
}
