// Описывает типы данных домена и вспомогательные структуры.

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
  /** Информация о товаре (может быть null если товар был удален из каталога) */
  product: Product | null;
}

/**
 * Корзина пользователя.
 */
export interface Cart {
  /** Список позиций в корзине с информацией о товаре */
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
 * Ответ от сервера авторизации.
 */
export interface LoginResponse {
  /** JWT токен */
  token: string;
}

/**
 * Данные покупателя для оформления заказа.
 */
export interface CheckoutData {
  /** Имя покупателя */
  name: string;
  /** Email покупателя */
  email: string;
  /** Адрес доставки */
  address: string;
}

/**
 * Данные заказа для отправки на сервер.
 */
export interface OrderData {
  /** Товары в заказе */
  items: Array<{ id: string }>;
  /** Данные покупателя */
  customer: CheckoutData;
  /** Дата создания заказа */
  orderDate: string;
}
