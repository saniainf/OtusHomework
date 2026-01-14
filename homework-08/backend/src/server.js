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
import { PubSub } from "graphql-subscriptions";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../data.json");
const PORT = process.env.PORT ?? 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const pubsub = new PubSub();

const PRODUCT_ADDED = "PRODUCT_ADDED";
const PRODUCT_UPDATED = "PRODUCT_UPDATED";
const CART_UPDATED = "CART_UPDATED";

let products = [];
let cartItems = [];

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
    cart: () => ({ items: cartItems }),
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
    addToCart: (_, { productId, quantity }) => {
      ensureProductExists(productId);
      if (quantity <= 0) {
        throw new Error("Количество должно быть больше нуля");
      }
      const existing = cartItems.find((item) => String(item.productId) === String(productId));
      if (existing) {
        existing.quantity += quantity;
      } else {
        cartItems.push({ productId: String(productId), quantity });
      }
      const cart = buildCart();
      pubsub.publish(CART_UPDATED, { cartUpdated: cart });
      return cart;
    },
    updateCartItem: (_, { productId, quantity }) => {
      ensureProductExists(productId);
      const existing = cartItems.find((item) => String(item.productId) === String(productId));
      if (!existing && quantity <= 0) {
        return buildCart();
      }
      if (!existing) {
        cartItems.push({ productId: String(productId), quantity });
      } else if (quantity <= 0) {
        cartItems = cartItems.filter((item) => String(item.productId) !== String(productId));
      } else {
        existing.quantity = quantity;
      }
      const cart = buildCart();
      pubsub.publish(CART_UPDATED, { cartUpdated: cart });
      return cart;
    },
  },
  Subscription: {
    productAdded: {
      subscribe: () => pubsub.asyncIterator([PRODUCT_ADDED]),
    },
    productUpdated: {
      subscribe: () => pubsub.asyncIterator([PRODUCT_UPDATED]),
    },
    cartUpdated: {
      subscribe: () => pubsub.asyncIterator([CART_UPDATED]),
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
 * Формирует объект корзины с текущими позициями и суммой.
 * @returns {{ items: Array<{productId: string, quantity: number}>, total: number }} Корзина.
 */
function buildCart() {
  return { items: cartItems, total: cartItems.reduce((acc, item) => {
    const product = products.find((p) => String(p.id) === String(item.productId));
    if (!product) {
      return acc;
    }
    return acc + Number(product.price) * item.quantity;
  }, 0) };
}

async function startServer() {
  products = await loadProducts();

  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer({ schema }, wsServer);

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
    expressMiddleware(apolloServer),
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
