import "reflect-metadata";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSchema } from "type-graphql";
import cors from "cors";
import session from "express-session";
import { config } from "dotenv";
import { initializeDatabase } from "./config/database";
import { AuthResolver } from "./resolvers/AuthResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { CourseResolver } from "./resolvers/CourseResolver";
import { ReportResolver } from "./resolvers/ReportResolver";
import "./types/session";

config();

async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();

        // Create Express app
        const app = express();

        // Session configuration
        app.use(
            session({
                secret: process.env.SESSION_SECRET || "admin-session-secret",
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
            ],
            validate: false,
        });

        // Create Apollo Server
        const server = new ApolloServer({
            schema,
            introspection: true,
            plugins: [],
        });

        await server.start();

        // Apply middleware
        app.use(
            "/graphql",
            cors<cors.CorsRequest>({
                origin: process.env.FRONTEND_URL || "http://localhost:3001",
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
        const PORT = process.env.PORT || 4001;
        app.listen(PORT, () => {
            console.log(
                `🚀 Admin GraphQL Server ready at http://localhost:${PORT}/graphql`
            );
            console.log(
                `📊 GraphQL Playground available at http://localhost:${PORT}/graphql`
            );
            console.log(
                `🏥 Health check available at http://localhost:${PORT}/health`
            );
        });
    } catch (error) {
        console.error("❌ Failed to start admin server:", error);
        process.exit(1);
    }
}

startServer();
