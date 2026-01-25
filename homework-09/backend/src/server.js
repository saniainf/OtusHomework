import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { PubSub, withFilter } from "graphql-subscriptions";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../data.json");
const PORT = process.env.PORT ?? 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const pubsub = new PubSub();

const PRODUCT_ADDED = "PRODUCT_ADDED";
const PRODUCT_UPDATED = "PRODUCT_UPDATED";
const CART_UPDATED = "CART_UPDATED";

let products = [];
// Хранилище корзин для каждого пользователя: Map<userId, { items: [...] }>
const carts = new Map();
let categories = [];

/**
 * Извлекает userId из Authorization header.
 * Декодирует JWT токен и возвращает значение поля "sub" (subject) из payload.
 * @param {string} authHeader - Значение Authorization header
 * @returns {string|null} userId или null если токена нет или формат неверный
 */
function extractUserIdFromToken(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.warn('Неверный формат Authorization header:', authHeader);
    return null;
  }

  const token = parts[1];
  if (!token) {
    return null;
  }

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Неверный формат JWT токена');
      return null;
    }

    const payload = tokenParts[1];
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    const payloadObj = JSON.parse(decoded);

    // Возвращаем поле "sub" из payload как userId
    // в fakestoreapi это поле содержит id пользователя
    if (payloadObj.sub) {
      return String(payloadObj.sub);
    }

    console.warn('В JWT токене не найдено поле "sub"');
    return null;
  } catch (error) {
    console.warn('Ошибка при декодировании JWT токена:', error.message);
    return null;
  }
}

const typeDefs = `#graphql
  type Rating {
    rate: Float
    count: Int
  }

  type Product {
    id: ID!
    title: String!
    price: Float!
    description: String
    category: String
    image: String
    rating: Rating
  }

  type CartItem {
    productId: ID!
    quantity: Int!
    product: Product
  }

  type Cart {
    items: [CartItem!]!
    total: Float!
  }

  type ProductsPage {
    items: [Product!]!
    total: Int!
    hasMore: Boolean!
  }

  input ProductInput {
    title: String!
    price: Float!
    description: String
    category: String
    image: String
    rate: Float
    count: Int
  }

  input UpdateProductInput {
    title: String
    price: Float
    description: String
    category: String
    image: String
    rate: Float
    count: Int
  }

  type Query {
    products(category: String, limit: Int, offset: Int): ProductsPage!
    product(id: ID!): Product
    categories: [String!]!
    cart: Cart!
  }

  type Mutation {
    addProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    addToCart(productId: ID!, quantity: Int = 1): Cart!
    updateCartItem(productId: ID!, quantity: Int!): Cart!
  }

  type Subscription {
    productAdded: Product!
    productUpdated: Product!
    cartUpdated: Cart!
  }
`;

const resolvers = {
  Query: {
    // Возвращает товары с пагинацией и опциональной фильтрацией по категории
    products: (_, { category, limit, offset = 0 }) => {
      // Фильтруем по категории, если параметр передан
      let filtered = category
        ? products.filter((p) => p.category === category)
        : products;

      const total = filtered.length;

      // Применяем пагинацию, если указан limit
      if (limit !== undefined && limit !== null) {
        filtered = filtered.slice(offset, offset + limit);
      }

      // Проверяем, есть ли еще товары после текущей порции
      const hasMore = limit !== undefined && limit !== null
        ? offset + limit < total
        : false;

      return {
        items: filtered,
        total,
        hasMore,
      };
    },
    product: (_, { id }) => products.find((p) => String(p.id) === String(id)) ?? null,
    // Возвращает список всех уникальных категорий товаров
    categories: () => categories,
    // Возвращает корзину текущего пользователя (проверяет userId из context)
    cart: (_, {}, context) => {
      if (!context.userId) {
        throw new Error("Не авторизован. Требуется передать Authorization header.");
      }
      // Если корзины еще нет, создаем пустую
      if (!carts.has(context.userId)) {
        carts.set(context.userId, { items: [] });
      }
      const userCart = carts.get(context.userId);
      return buildCart(userCart.items);
    },
  },
  Mutation: {
    addProduct: (_, { input }) => {
      const nextId = products.length > 0 ? Math.max(...products.map((p) => Number(p.id))) + 1 : 1;
      const product = buildProduct(nextId, input);
      products.push(product);
      pubsub.publish(PRODUCT_ADDED, { productAdded: product });
      return product;
    },
    updateProduct: (_, { id, input }) => {
      const idx = products.findIndex((p) => String(p.id) === String(id));
      if (idx === -1) {
        throw new Error("Товар не найден");
      }
      const updated = mergeProduct(products[idx], input);
      products[idx] = updated;
      pubsub.publish(PRODUCT_UPDATED, { productUpdated: updated });
      return updated;
    },
    addToCart: (_, { productId, quantity }, context) => {
      // Добавляет товар в корзину конкретного пользователя
      if (!context.userId) {
        throw new Error("Не авторизован. Требуется передать Authorization header.");
      }
      ensureProductExists(productId);
      if (quantity <= 0) {
        throw new Error("Количество должно быть больше нуля");
      }
      // Если корзины еще нет, создаем пустую
      if (!carts.has(context.userId)) {
        carts.set(context.userId, { items: [] });
      }
      const userCart = carts.get(context.userId);
      const existing = userCart.items.find((item) => String(item.productId) === String(productId));
      if (existing) {
        existing.quantity += quantity;
      } else {
        userCart.items.push({ productId: String(productId), quantity });
      }
      const cart = buildCart(userCart.items);
      // Передаём userId вместе с событием для фильтрации на стороне подписки
      pubsub.publish(CART_UPDATED, { cartUpdated: cart, userId: context.userId });
      return cart;
    },
    updateCartItem: (_, { productId, quantity }, context) => {
      // Обновляет количество товара или удаляет его из корзины пользователя
      if (!context.userId) {
        throw new Error("Не авторизован. Требуется передать Authorization header.");
      }
      ensureProductExists(productId);
      // Если корзины еще нет, создаем пустую
      if (!carts.has(context.userId)) {
        carts.set(context.userId, { items: [] });
      }
      const userCart = carts.get(context.userId);
      const existing = userCart.items.find((item) => String(item.productId) === String(productId));
      if (!existing && quantity <= 0) {
        return buildCart(userCart.items);
      }
      if (!existing) {
        userCart.items.push({ productId: String(productId), quantity });
      } else if (quantity <= 0) {
        // Удаляем товар из корзины если количество <= 0
        userCart.items = userCart.items.filter((item) => String(item.productId) !== String(productId));
      } else {
        existing.quantity = quantity;
      }
      const cart = buildCart(userCart.items);
      // Передаём userId вместе с событием для фильтрации на стороне подписки
      pubsub.publish(CART_UPDATED, { cartUpdated: cart, userId: context.userId });
      return cart;
    },
  },
  Subscription: {
    productAdded: {
      subscribe: () => pubsub.asyncIterableIterator([PRODUCT_ADDED]),
    },
    productUpdated: {
      subscribe: () => pubsub.asyncIterableIterator([PRODUCT_UPDATED]),
    },
    cartUpdated: {
      // Подписка на обновления корзины с фильтрацией по userId
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([CART_UPDATED]),
        (payload, _variables, context) => {
          // Отправляем событие только владельцу корзины
          if (!context.userId) {
            return false;
          }
          return String(payload.userId) === String(context.userId);
        }
      ),
      // Резолвер для преобразования payload в ответ
      resolve: (payload) => payload.cartUpdated,
    },
  },
  Cart: {
    total: (cart) => cart.items.reduce((acc, item) => {
      const product = products.find((p) => String(p.id) === String(item.productId));
      if (!product) {
        return acc;
      }
      return acc + Number(product.price) * item.quantity;
    }, 0),
  },
  CartItem: {
    product: (item) => products.find((p) => String(p.id) === String(item.productId)) ?? null,
  },
};

/**
 * Загружает список товаров из файла.
 * @returns {Promise<Array>} Массив товаров.
 */
async function loadProducts() {
  const raw = await readFile(dataPath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Собирает объект товара из входных данных и идентификатора.
 * @param {number|string} id Идентификатор товара.
 * @param {object} input Данные товара.
 * @returns {object} Новый товар.
 */
function buildProduct(id, input) {
  const { title, price, description, category, image, rate, count } = input;
  return {
    id: String(id),
    title,
    price: Number(price),
    description: description ?? "",
    category: category ?? "",
    image: image ?? "",
    rating: {
      rate: rate ?? null,
      count: count ?? null,
    },
  };
}

/**
 * Обновляет товар частичными данными.
 * @param {object} product Текущий товар.
 * @param {object} input Частичные данные для обновления.
 * @returns {object} Обновленный товар.
 */
function mergeProduct(product, input) {
  const next = { ...product };
  if (input.title !== undefined) next.title = input.title;
  if (input.price !== undefined) next.price = Number(input.price);
  if (input.description !== undefined) next.description = input.description ?? "";
  if (input.category !== undefined) next.category = input.category ?? "";
  if (input.image !== undefined) next.image = input.image ?? "";
  if (input.rate !== undefined || input.count !== undefined) {
    next.rating = {
      rate: input.rate !== undefined ? input.rate : next.rating?.rate ?? null,
      count: input.count !== undefined ? input.count : next.rating?.count ?? null,
    };
  }
  return next;
}

/**
 * Проверяет, что товар существует в каталоге.
 * @param {string|number} productId Идентификатор товара.
 */
function ensureProductExists(productId) {
  const exists = products.some((p) => String(p.id) === String(productId));
  if (!exists) {
    throw new Error("Товар не найден");
  }
}

/**
 * Вычисляет сумму товаров в корзине по переданному массиву items.
 * Принимает массив items как параметр для работы с корзинами разных пользователей.
 * @param {Array} items - Массив товаров в корзине
 * @returns {{ items: Array<{productId: string, quantity: number}>, total: number }} Корзина с суммой.
 */
function buildCart(items) {
  return {
    items: items, total: items.reduce((acc, item) => {
      const product = products.find((p) => String(p.id) === String(item.productId));
      if (!product) {
        return acc;
      }
      return acc + Number(product.price) * item.quantity;
    }, 0)
  };
}

async function startServer() {
  products = await loadProducts();
  categories = Array.from(new Set(products.map((p) => p.category).filter((c) => c)));

  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  // Настраиваем WebSocket сервер с поддержкой аутентификации
  const serverCleanup = useServer({
    schema,
    // Извлекаем userId из параметров подключения для использования в подписках
    context: async (ctx) => {
      // connectionParams передаются клиентом при установке WS соединения
      const authHeader = ctx.connectionParams?.Authorization;
      const userId = extractUserIdFromToken(authHeader);
      return { userId };
    },
  }, wsServer);

  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    cors({ origin: FRONTEND_ORIGIN, credentials: true }),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        // Извлекаем userId из Authorization header
        const authHeader = req.headers.authorization;
        const userId = extractUserIdFromToken(authHeader);

        return {
          userId, // Будет доступен как context.userId в resolvers
        };
      },
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  httpServer.listen(PORT, () => {
    // Сервис доступен по HTTP и WS для Apollo Sandbox и фронтенда
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`Subscriptions endpoint: ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error("Ошибка запуска сервера", error);
  process.exit(1);
});
