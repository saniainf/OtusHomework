import { withFilter } from "graphql-subscriptions";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { pubsub, PRODUCT_ADDED, PRODUCT_UPDATED, CART_UPDATED, store } from "../state/store";
import { buildCart, ensureProductExists } from "../utils/cart";
import type {
  Cart,
  CartItem,
  ProductsPage,
  Product,
  ProductInput,
  UpdateProductInput,
  GraphQLContext,
  CartUpdatedPayload,
} from "../types";

// Резолверы GraphQL: Query/Mutation/Subscription.
export const resolvers = {
  Query: {
    products: (
      _parent: unknown,
      { category, limit, offset = 0 }: { category?: string | null; limit?: number | null; offset?: number | null },
    ): ProductsPage => {
      let filtered = category ? store.products.filter((p) => p.category === category) : store.products;
      const total = filtered.length;
      const safeOffset = offset ?? 0;
      if (limit !== undefined && limit !== null) {
        filtered = filtered.slice(safeOffset, safeOffset + limit);
      }
      const hasMore = limit !== undefined && limit !== null ? safeOffset + limit < total : false;
      return { items: filtered, total, hasMore };
    },
    product: (_parent: unknown, { id }: { id: string | number }): Product | null =>
      store.products.find((p) => String(p.id) === String(id)) ?? null,
    categories: (): string[] => store.categories,
    cart: (_parent: unknown, _args: unknown, context: GraphQLContext): Cart => {
      if (!context.userId) {
        throw new Error("Не авторизован. Требуется передать Authorization header.");
      }
      if (!store.carts.has(context.userId)) {
        store.carts.set(context.userId, { items: [] });
      }
      const userCart = store.carts.get(context.userId)!;
      return buildCart(userCart.items);
    },
  },
  Mutation: {
    addProduct: (_parent: unknown, { input }: { input: ProductInput }): Product => {
      const nextId = store.products.length > 0 ? Math.max(...store.products.map((p) => Number(p.id))) + 1 : 1;
      const product: Product = {
        id: String(nextId),
        title: input.title,
        price: Number(input.price),
        description: input.description ?? "",
        category: input.category ?? "",
        image: input.image ?? "",
        rating: { rate: input.rate ?? null, count: input.count ?? null },
      };
      store.products.push(product);
      pubsub.publish(PRODUCT_ADDED, product);
      return product;
    },
    updateProduct: (_parent: unknown, { id, input }: { id: string | number; input: UpdateProductInput }): Product => {
      const idx = store.products.findIndex((p) => String(p.id) === String(id));
      if (idx === -1) {
        throw new Error("Товар не найден");
      }
      const current = store.products[idx];
      const updated: Product = {
        ...current,
        title: input.title !== undefined ? input.title : current.title,
        price: input.price !== undefined ? Number(input.price) : current.price,
        description: input.description !== undefined ? input.description ?? "" : current.description,
        category: input.category !== undefined ? input.category ?? "" : current.category,
        image: input.image !== undefined ? input.image ?? "" : current.image,
        rating: {
          rate: input.rate !== undefined ? input.rate : current.rating?.rate ?? null,
          count: input.count !== undefined ? input.count : current.rating?.count ?? null,
        },
      };
      store.products[idx] = updated;
      pubsub.publish(PRODUCT_UPDATED, updated);
      return updated;
    },
    addToCart: (
      _parent: unknown,
      { productId, quantity }: { productId: string | number; quantity: number },
      context: GraphQLContext,
    ): Cart => {
      if (!context.userId) {
        throw new Error("Не авторизован. Требуется передать Authorization header.");
      }
      ensureProductExists(productId);
      if (quantity <= 0) {
        throw new Error("Количество должно быть больше нуля");
      }
      if (!store.carts.has(context.userId)) {
        store.carts.set(context.userId, { items: [] });
      }
      const userCart = store.carts.get(context.userId)!;
      const existing = userCart.items.find((item) => String(item.productId) === String(productId));
      if (existing) {
        existing.quantity += quantity;
      } else {
        userCart.items.push({ productId: String(productId), quantity });
      }
      const cart = buildCart(userCart.items);
      pubsub.publish(CART_UPDATED, { cartUpdated: cart, userId: context.userId });
      return cart;
    },
    updateCartItem: (
      _parent: unknown,
      { productId, quantity }: { productId: string | number; quantity: number },
      context: GraphQLContext,
    ): Cart => {
      if (!context.userId) {
        throw new Error("Не авторизован. Требуется передать Authorization header.");
      }
      ensureProductExists(productId);
      if (!store.carts.has(context.userId)) {
        store.carts.set(context.userId, { items: [] });
      }
      const userCart = store.carts.get(context.userId)!;
      const existing = userCart.items.find((item) => String(item.productId) === String(productId));
      if (!existing && quantity <= 0) {
        return buildCart(userCart.items);
      }
      if (!existing) {
        userCart.items.push({ productId: String(productId), quantity });
      } else if (quantity <= 0) {
        userCart.items = userCart.items.filter((item) => String(item.productId) !== String(productId));
      } else {
        existing.quantity = quantity;
      }
      const cart = buildCart(userCart.items);
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
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([CART_UPDATED]),
        (payload: CartUpdatedPayload | undefined, _variables: unknown, context?: GraphQLContext) => {
          if (!payload) {
            return false;
          }
          if (!context?.userId) {
            return false;
          }
          return String(payload.userId) === String(context.userId);
        }
      ),
      resolve: (payload: CartUpdatedPayload) => payload.cartUpdated,
    },
  },
  Cart: {
    total: (cart: Cart) => cart.items.reduce((acc, item) => {
      const product = store.products.find((p) => String(p.id) === String(item.productId));
      if (!product) {
        return acc;
      }
      return acc + Number(product.price) * item.quantity;
    }, 0),
  },
  CartItem: {
    product: (item: CartItem) => store.products.find((p) => String(p.id) === String(item.productId)) ?? null,
  },
};

// Вспомогательная функция для сборки исполняемой схемы.
export function buildSchema() {
  return makeExecutableSchema({ typeDefs: undefined as any, resolvers });
}
