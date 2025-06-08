import "reflect-metadata";
import express from "express";
import { createServer } from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { buildSchema } from "type-graphql";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import cors from "cors";
import session from "express-session";
import { config } from "dotenv";
import { initializeDatabase } from "./config/database";
import { AuthResolver } from "./resolvers/AuthResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { CourseResolver } from "./resolvers/CourseResolver";
import { ReportResolver } from "./resolvers/ReportResolver";
import { SubscriptionResolver } from "./resolvers/SubscriptionResolver";
import "./types/session";
import path from "path";

// Load environment variables from root .env file
config({ path: path.resolve(__dirname, "../../.env") });

async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();

        // Create Express app
        const app = express();

        // Session configuration
        app.use(
            session({
                secret:
                    process.env.ADMIN_SESSION_SECRET ||
                    process.env.SESSION_SECRET ||
                    "admin-session-secret",
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                },
            })
        );

        // Build GraphQL schema
        const schema = await buildSchema({
            resolvers: [
                AuthResolver,
                UserResolver,
                CourseResolver,
                ReportResolver,
                SubscriptionResolver,
            ],
            validate: false,
            pubSub: require("./config/pubsub").pubsub,
        });

        // Create HTTP server
        const httpServer = createServer(app);

        // Create WebSocket server
        const wsServer = new WebSocketServer({
            server: httpServer,
            path: "/graphql",
        });

        // Add WebSocket connection debugging
        wsServer.on("connection", (ws, req) => {
            console.log("🔗 New WebSocket connection established");
            console.log("📍 Connection from:", req.socket.remoteAddress);
            console.log("🛣️ Request URL:", req.url);

            ws.on("close", (code, reason) => {
                console.log(
                    "🔒 WebSocket connection closed:",
                    code,
                    reason.toString()
                );
            });

            ws.on("error", (error) => {
                console.error("❌ WebSocket error:", error);
            });
        });

        // Save the returned server's info so we can shutdown this server later
        const serverCleanup = useServer(
            {
                schema,
                onConnect: (ctx) => {
                    console.log("🔌 GraphQL WS client connecting...");
                    console.log(
                        "📦 Connection context keys:",
                        Object.keys(ctx)
                    );
                    return true;
                },
                onDisconnect: (ctx, code, reason) => {
                    console.log(
                        "🔌 GraphQL WS client disconnected:",
                        code,
                        reason
                    );
                },
                onSubscribe: (ctx, id, payload) => {
                    console.log("📡 New subscription ID:", id);
                    console.log("📡 Subscription query:", payload.query);
                },
            },
            wsServer
        );

        // Create Apollo Server
        const server = new ApolloServer({
            schema,
            introspection: true,
            plugins: [
                // Proper shutdown for the HTTP server.
                ApolloServerPluginDrainHttpServer({ httpServer }),
                // Proper shutdown for the WebSocket server.
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

        await server.start();

        // Apply middleware
        app.use(
            "/graphql",
            cors<cors.CorsRequest>({
                origin: [
                    process.env.ADMIN_FRONTEND_URL ||
                        process.env.FRONTEND_URL ||
                        "http://localhost:3001",
                    process.env.FRONTEND_URL || "http://localhost:3000",
                    "http://localhost:3000", // Default Next.js port
                    "http://localhost:3001", // Alternative port
                    "http://localhost:3002", // Another alternative
                ],
                credentials: true,
            }),
            express.json(),
            expressMiddleware(server, {
                context: async ({ req, res }) => ({
                    req,
                    res,
                    user: req.session?.userId
                        ? { id: req.session.userId }
                        : null,
                }),
            })
        );

        // Health check endpoint
        app.get("/health", (req, res) => {
            res.json({
                status: "OK",
                service: "Admin GraphQL Backend",
                timestamp: new Date().toISOString(),
            });
        });

        // Start server
        const PORT = process.env.ADMIN_BACKEND_PORT || process.env.PORT || 4002;
        httpServer.listen(PORT, () => {
            console.log(
                `🚀 Admin GraphQL Server ready at http://localhost:${PORT}/graphql`
            );
            console.log(
                `📊 GraphQL Playground available at http://localhost:${PORT}/graphql`
            );
            console.log(
                `🏥 Health check available at http://localhost:${PORT}/health`
            );
            console.log(
                `🔗 WebSocket subscriptions ready at ws://localhost:${PORT}/graphql`
            );

            // Add debugging for subscription system
            console.log(
                "📡 Subscription system initialized and ready for connections"
            );
        });
    } catch (error) {
        console.error("❌ Failed to start admin server:", error);
        process.exit(1);
    }
}

startServer();
