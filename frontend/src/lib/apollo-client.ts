import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP link to admin backend
const httpUrl =
  process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT ||
  "http://localhost:4002/graphql";
const wsUrl =
  process.env.NEXT_PUBLIC_ADMIN_WS_ENDPOINT || "ws://localhost:4002/graphql";

const httpLink = createHttpLink({
  uri: httpUrl,
  credentials: "include",
});

// Create WebSocket client with minimal logging
const wsClient = createClient({
  url: wsUrl,
  lazy: false, // Connect immediately to avoid loading state issues
  keepAlive: 30000,
  retryAttempts: Infinity,
  retryWait: async (attempt) => {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  },
  shouldRetry: () => {
    return true;
  },
  connectionParams: () => {
    return {
      // Add any authentication params here if needed
    };
  },
  on: {
    error: (error: unknown) => {
      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Apollo WebSocket error:", error);
      }
    },
  },
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(wsClient);

// Split link - use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    const isSubscription =
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription";
    return isSubscription;
  },
  wsLink,
  httpLink
);

export const adminClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      // Ensure subscription updates don't cache unnecessarily
      CandidateBlockedEvent: {
        keyFields: false, // Don't cache individual events
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
  // Add connection to devtools for debugging
  connectToDevTools: process.env.NODE_ENV === "development",
});

export default adminClient;
