import { PubSub } from "graphql-subscriptions";
import type { CartItem, Product, PubSubEvents } from "../types";

// Центральное хранилище состояния бэкенда.
// Данные и коллекции собраны в одном объекте для удобного доступа.
export const store = {
  /** Товары каталога */
  products: [] as Product[],
  /** Карты корзин пользователей: ключ — userId */
  carts: new Map<string, { items: CartItem[] }>(),
  /** Список категорий товаров */
  categories: [] as string[],
};

// Типизированный PubSub для событий GraphQL.
export const pubsub = new PubSub<PubSubEvents>();

// Имена событий для подписок.
export const PRODUCT_ADDED = "PRODUCT_ADDED" as const;
export const PRODUCT_UPDATED = "PRODUCT_UPDATED" as const;
export const CART_UPDATED = "CART_UPDATED" as const;
