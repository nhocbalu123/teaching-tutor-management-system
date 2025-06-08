import { PubSub } from "graphql-subscriptions";

// Create a singleton PubSub instance
export const pubsub = new PubSub();

// Subscription topics
export const SUBSCRIPTION_TOPICS = {
    CANDIDATE_BLOCKED: "CANDIDATE_BLOCKED",
    CANDIDATE_UNBLOCKED: "CANDIDATE_UNBLOCKED",
} as const;

// Custom async iterator implementation for newer graphql-subscriptions
export const createAsyncIterator = (
    topics: string | string[]
): AsyncIterableIterator<any> => {
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    const subscriptions = new Map();
    const pendingValues: any[] = [];
    const pendingResolvers: Array<(value: IteratorResult<any>) => void> = [];
    let isListening = true;

    // Subscribe to all topics
    topicsArray.forEach((topic) => {
        const subscriptionId = pubsub.subscribe(topic, (payload) => {
            if (isListening) {
                if (pendingResolvers.length > 0) {
                    const resolve = pendingResolvers.shift()!;
                    resolve({ done: false, value: payload });
                } else {
                    pendingValues.push(payload);
                }
            }
        });
        subscriptions.set(`sub_${topic}`, subscriptionId);
    });

    const iterator: AsyncIterableIterator<any> = {
        [Symbol.asyncIterator]() {
            return this;
        },

        async next(): Promise<IteratorResult<any>> {
            if (!isListening) {
                return { done: true, value: undefined };
            }

            if (pendingValues.length > 0) {
                const value = pendingValues.shift();
                return { done: false, value };
            }

            return new Promise((resolve) => {
                pendingResolvers.push(resolve);
            });
        },

        async return(): Promise<IteratorResult<any>> {
            isListening = false;
            // Unsubscribe from all topics
            topicsArray.forEach((topic) => {
                const subId = subscriptions.get(`sub_${topic}`);
                if (subId) {
                    pubsub.unsubscribe(subId);
                }
            });
            // Resolve any pending promises
            while (pendingResolvers.length > 0) {
                const resolve = pendingResolvers.shift()!;
                resolve({ done: true, value: undefined });
            }
            return { done: true, value: undefined };
        },

        async throw(error: any): Promise<IteratorResult<any>> {
            isListening = false;
            throw error;
        },
    };

    return iterator;
};
