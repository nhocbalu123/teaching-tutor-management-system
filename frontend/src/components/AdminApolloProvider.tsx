"use client";

import { ApolloProvider } from "@apollo/client";
import { adminClient } from "@/lib/apollo-client";

interface AdminApolloProviderProps {
  children: React.ReactNode;
}

export function AdminApolloProvider({ children }: AdminApolloProviderProps) {
  return <ApolloProvider client={adminClient}>{children}</ApolloProvider>;
}
