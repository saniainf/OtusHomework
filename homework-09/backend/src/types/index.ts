// Описывает типы данных домена и вспомогательные структуры.
// В этом модуле находятся интерфейсы для товаров, корзины, контекста GraphQL
// и типы событий PubSub.

/**
 * Рейтинг товара.
 */
export interface Rating {
  /** Средняя оценка товара */
  rate: number | null;
  /** Количество оценок товара */
  count: number | null;
}

/**
 * Товар каталога.
 */
export interface Product {
  /** Идентификатор товара */
  id: string;
  /** Название товара */
  title: string;
  /** Цена товара */
  price: number;
  /** Описание товара */
  description: string;
  /** Категория товара */
  category: string;
  /** Ссылка на изображение товара */
  image: string;
  /** Рейтинг товара */
  rating: Rating;
}

/**
 * Позиция в корзине.
 */
export interface CartItem {
  /** Идентификатор товара */
  productId: string;
  /** Количество единиц товара */
  quantity: number;
}

/**
 * Корзина пользователя.
 */
export interface Cart {
  /** Список позиций в корзине */
  items: CartItem[];
  /** Итоговая сумма корзины */
  total: number;
}

/**
 * Страница товаров для пагинации.
 */
export interface ProductsPage {
  /** Товары текущей страницы */
  items: Product[];
  /** Общее количество подходящих товаров */
  total: number;
  /** Признак наличия следующих страниц */
  hasMore: boolean;
}

/**
 * Входные данные для создания товара.
 */
export interface ProductInput {
  title: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
  rate?: number;
  count?: number;
}

/**
 * Входные данные для обновления товара.
 */
export interface UpdateProductInput {
  title?: string;
  price?: number;
  description?: string;
  category?: string;
  image?: string;
  rate?: number;
  count?: number;
}

/**
 * Контекст резолверов GraphQL.
 */
export interface GraphQLContext {
  /** Идентификатор пользователя, полученный из JWT */
  userId: string | null;
}

/**
 * Payload для события обновления корзины.
 */
export interface CartUpdatedPayload {
  cartUpdated: Cart;
  userId: string;
}

/**
 * Словарь событий PubSub и их payload.
 */
export type PubSubEvents = {
  PRODUCT_ADDED: Product;
  PRODUCT_UPDATED: Product;
  CART_UPDATED: CartUpdatedPayload;
};
