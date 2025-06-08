import { useCallback, useEffect, useState, useRef } from "react";
import { CandidateBlockedEvent } from "@/lib/graphql-subscriptions";

interface UseCandidateBlockingSubscriptionOptions {
  onCandidateBlocked?: (event: CandidateBlockedEvent) => void;
  showToast?: (message: string, type: "success" | "error" | "info") => void;
}

// Direct WebSocket implementation using GraphQL-WS protocol
export function useCandidateBlockingSubscription({
  onCandidateBlocked,
  showToast,
}: UseCandidateBlockingSubscriptionOptions = {}) {
  // Use refs to stabilize callbacks and prevent re-initializations
  const onCandidateBlockedRef = useRef(onCandidateBlocked);
  const showToastRef = useRef(showToast);
  const wsRef = useRef<WebSocket | null>(null);
  const isCleanedUpRef = useRef(false); // Track if effect was cleaned up
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when callbacks change
  useEffect(() => {
    onCandidateBlockedRef.current = onCandidateBlocked;
  }, [onCandidateBlocked]);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const [subscriptionState, setSubscriptionState] = useState({
    loading: true,
    error: undefined as Error | undefined,
    isConnected: false,
    dataReceived: false,
  });

  // Process subscription data - stable callback
  const processSubscriptionData = useCallback(
    (event: CandidateBlockedEvent) => {
      // Update state to show data received
      setSubscriptionState((prev) => ({
        ...prev,
        dataReceived: true,
      }));

      // Call the callback if provided
      const currentOnCandidateBlocked = onCandidateBlockedRef.current;
      if (currentOnCandidateBlocked) {
        currentOnCandidateBlocked(event);
      }

      // Show toast notification
      const currentShowToast = showToastRef.current;
      if (currentShowToast) {
        const action = event.isBlocked ? "blocked" : "unblocked";
        const message = `${event.candidateName} has been ${action}`;

        try {
          currentShowToast(message, event.isBlocked ? "error" : "success");
        } catch {
          // Silently handle toast errors
        }
      }
    },
    []
  );

  // Create WebSocket connection
  const createConnection = useCallback(() => {
    if (isCleanedUpRef.current) {
      return;
    }

    const wsUrl =
      process.env.NEXT_PUBLIC_ADMIN_WS_ENDPOINT ||
      "ws://localhost:4002/graphql";

    const ws = new WebSocket(wsUrl, "graphql-transport-ws");
    wsRef.current = ws;

    ws.onopen = () => {
      // Skip if effect was cleaned up
      if (isCleanedUpRef.current) {
        ws.close();
        return;
      }

      // Send connection init message
      const initMessage = {
        type: "connection_init",
        payload: {},
      };
      try {
        ws.send(JSON.stringify(initMessage));
      } catch {
        // Silently handle connection init errors
      }
    };

    ws.onmessage = (event) => {
      // Skip if effect was cleaned up
      if (isCleanedUpRef.current) {
        return;
      }

      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "connection_ack":
            // Send subscription message using graphql-transport-ws protocol
            const subscriptionMessage = {
              id: "candidate-blocking-subscription",
              type: "subscribe",
              payload: {
                query: `
                  subscription CandidateBlockingUpdates {
                    candidateBlockingUpdates {
                      candidateId
                      candidateName
                      candidateEmail
                      isBlocked
                      timestamp
                      candidate {
                        id
                        fullName
                        email
                        userType
                        isBlocked
                        createdAt
                      }
                    }
                  }
                `,
              },
            };
            try {
              ws.send(JSON.stringify(subscriptionMessage));
              // Clear any previous errors and mark as connected
              setSubscriptionState((prev) => ({
                ...prev,
                loading: false,
                error: undefined, // Clear any previous errors
                isConnected: true,
              }));
            } catch {
              // Silently handle subscription send errors
            }
            break;

          case "next":
            if (message.payload?.data?.candidateBlockingUpdates) {
              processSubscriptionData(
                message.payload.data.candidateBlockingUpdates
              );
            }
            break;

          case "error":
            if (!isCleanedUpRef.current) {
              setSubscriptionState((prev) => ({
                ...prev,
                error: new Error(JSON.stringify(message.payload)),
                loading: false,
                isConnected: false,
              }));
            }
            break;

          case "complete":
            if (!isCleanedUpRef.current) {
              setSubscriptionState((prev) => ({
                ...prev,
                loading: false,
                isConnected: false,
              }));
            }
            break;

          default:
            // Unknown message type
            break;
        }
      } catch {
        // Silently handle message parsing errors
      }
    };

    ws.onerror = () => {
      // Skip if effect was cleaned up (common in React Strict Mode)
      if (isCleanedUpRef.current) {
        return;
      }

      // Only log WebSocket errors if the connection has been open for a reasonable time
      // This prevents React Strict Mode cleanup errors from being logged
      setTimeout(() => {
        if (!isCleanedUpRef.current && ws.readyState === WebSocket.CLOSED) {
          setSubscriptionState((prev) => ({
            ...prev,
            error: new Error("WebSocket connection error"),
            loading: false,
            isConnected: false,
          }));
        }
      }, 100);
    };

    ws.onclose = () => {
      // Skip if effect was cleaned up
      if (isCleanedUpRef.current) {
        return;
      }

      setSubscriptionState((prev) => ({
        ...prev,
        loading: false,
        isConnected: false,
      }));
    };
  }, [processSubscriptionData]);

  // Initialize direct WebSocket connection with delay to prevent React Strict Mode issues
  useEffect(() => {
    // Reset cleanup flag
    isCleanedUpRef.current = false;

    // Reset error state at start of connection attempt
    setSubscriptionState((prev) => ({
      ...prev,
      loading: true,
      error: undefined,
      isConnected: false,
    }));

    // Create connection immediately (no delay needed with Strict Mode disabled)
    createConnection();

    // Cleanup function
    return () => {
      // Mark as cleaned up to prevent handlers from running
      isCleanedUpRef.current = true;

      // Clear connection timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Send stop message using graphql-transport-ws protocol
        const stopMessage = {
          id: "candidate-blocking-subscription",
          type: "complete",
        };
        try {
          ws.send(JSON.stringify(stopMessage));
        } catch {
          // Silently handle cleanup errors
        }
      }

      if (ws) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [createConnection]); // Only depend on createConnection

  return {
    loading: subscriptionState.loading,
    error: subscriptionState.error,
    isConnected: subscriptionState.isConnected,
    dataReceived: subscriptionState.dataReceived,
    subscriptionData: undefined, // Not needed for direct WebSocket implementation
  };
}
