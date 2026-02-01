import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { withFilter } from "graphql-subscriptions";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { store, pubsub, PRODUCT_ADDED, PRODUCT_UPDATED, CART_UPDATED } from "./state/store";
import { extractUserIdFromToken } from "./utils/auth";
import { loadProducts } from "./data/products";
import type { CartUpdatedPayload, GraphQLContext } from "./types";

const PORT = process.env.PORT ?? 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

async function startServer() {
  store.products = await loadProducts();
  store.categories = Array.from(new Set(store.products.map((p) => p.category).filter((c) => c)));

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
      const authHeader = typeof ctx.connectionParams?.Authorization === "string"
        ? ctx.connectionParams.Authorization
        : undefined;
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
        const authHeader = typeof req.headers.authorization === "string"
          ? req.headers.authorization
          : undefined;
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
