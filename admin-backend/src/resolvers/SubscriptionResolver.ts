import {
    Resolver,
    Subscription,
    Root,
    ObjectType,
    Field,
    ID,
    Int,
    Mutation,
    Arg,
} from "type-graphql";
import {
    pubsub,
    SUBSCRIPTION_TOPICS,
    createAsyncIterator,
} from "../config/pubsub";
import { User, UserType } from "../types/User";
import { Course } from "../types/Course";

@ObjectType()
export class CandidateBlockedEvent {
    @Field(() => ID)
    candidateId: number;

    @Field()
    candidateName: string;

    @Field()
    candidateEmail: string;

    @Field()
    isBlocked: boolean;

    @Field()
    timestamp: string;

    @Field(() => User)
    candidate: User;

    @Field(() => Int, { nullable: true })
    unselectedApplicationsCount?: number;

    @Field(() => Int, { nullable: true })
    unrankedApplicationsCount?: number;

    @Field(() => [Int], { nullable: true })
    affectedLecturerIds?: number[];
}

@ObjectType()
export class UserAccountEvent {
    @Field(() => ID)
    userId: number;

    @Field()
    userEmail: string;

    @Field()
    userName: string;

    @Field()
    userType: string;

    @Field()
    action: string; // "blocked" or "deleted"

    @Field()
    timestamp: string;

    @Field(() => User, { nullable: true })
    user?: User;
}

@ObjectType()
export class CourseEvent {
    @Field(() => ID)
    courseId: number;

    @Field()
    action: string; // "created", "updated", or "deleted"

    @Field()
    timestamp: string;

    @Field(() => Course, { nullable: true })
    course?: Course;

    @Field({ nullable: true })
    message?: string;
}

@Resolver()
export class SubscriptionResolver {
    @Subscription(() => CandidateBlockedEvent, {
        description: "Subscribe to candidate blocking/unblocking events",
        subscribe: () =>
            createAsyncIterator([
                SUBSCRIPTION_TOPICS.CANDIDATE_BLOCKED,
                SUBSCRIPTION_TOPICS.CANDIDATE_UNBLOCKED,
            ]),
    })
    candidateBlockingUpdates(@Root() payload: any): CandidateBlockedEvent {
        console.log("📡 Subscription resolver received event:", {
            rawPayload: payload,
            candidateBlockingUpdates: payload?.candidateBlockingUpdates,
        });
        console.log(
            "🔔 SUBSCRIPTION RESOLVER CALLED - this means a client is subscribed!"
        );

        const eventData = payload?.candidateBlockingUpdates || payload;

        console.log("📡 Processing event data:", {
            eventData,
            candidateId: eventData?.candidateId,
            candidateName: eventData?.candidateName,
            isBlocked: eventData?.isBlocked,
            timestamp: eventData?.timestamp,
            affectedLecturerIds: eventData?.affectedLecturerIds,
        });

        if (!eventData) {
            console.error(
                "❌ Subscription resolver received undefined event data"
            );
            throw new Error("No subscription data available");
        }

        return eventData;
    }

    @Subscription(() => UserAccountEvent, {
        description:
            "Subscribe to user account status changes (blocking/deletion)",
        subscribe: () =>
            createAsyncIterator([
                SUBSCRIPTION_TOPICS.USER_ACCOUNT_BLOCKED,
                SUBSCRIPTION_TOPICS.USER_ACCOUNT_DELETED,
            ]),
    })
    userAccountUpdates(
        @Root() payload: any,
        @Arg("userId", () => Int) userId: number
    ): UserAccountEvent {
        console.log("📡 User account subscription resolver received event:", {
            rawPayload: payload,
            requestedUserId: userId,
        });

        const eventData = payload?.userAccountUpdates || payload;

        // Only return events for the specific user who subscribed
        if (eventData && eventData.userId === userId) {
            console.log(
                `✅ Returning account event for user ${userId}:`,
                eventData
            );
            return eventData;
        } else {
            console.log(`🚫 Event not for user ${userId}, skipping`);
            // Return a dummy event that won't match - GraphQL subscriptions filter these out
            throw new Error("Event not for this user");
        }
    }

    @Subscription(() => CourseEvent, {
        description: "Subscribe to course changes (create/update/delete)",
        subscribe: () =>
            createAsyncIterator([
                SUBSCRIPTION_TOPICS.COURSE_CREATED,
                SUBSCRIPTION_TOPICS.COURSE_UPDATED,
                SUBSCRIPTION_TOPICS.COURSE_DELETED,
            ]),
    })
    courseUpdates(@Root() payload: any): CourseEvent {
        console.log("📡 Course subscription resolver received event:", {
            rawPayload: payload,
            courseUpdates: payload?.courseUpdates,
        });

        const eventData = payload?.courseUpdates || payload;

        console.log("📡 Processing course event data:", {
            eventData,
            courseId: eventData?.courseId,
            action: eventData?.action,
            timestamp: eventData?.timestamp,
        });

        if (!eventData) {
            console.error(
                "❌ Course subscription resolver received undefined event data"
            );
            throw new Error("No course subscription data available");
        }

        return eventData;
    }

    @Mutation(() => String)
    async testSubscription(): Promise<string> {
        console.log("🧪 Test subscription mutation triggered");

        // Create a fake event for testing
        const testEvent: CandidateBlockedEvent = {
            candidateId: 999,
            candidateName: "Test Candidate",
            candidateEmail: "test@example.com",
            isBlocked: true,
            timestamp: new Date().toISOString(),
            candidate: {
                id: 999,
                email: "test@example.com",
                firstName: "Test",
                lastName: "Candidate",
                userType: UserType.CANDIDATE,
                isBlocked: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                password: "",
            } as User,
            affectedLecturerIds: [1, 2, 3], // Test with some lecturer IDs
        };

        console.log("📡 Publishing test CANDIDATE_BLOCKED event:", testEvent);

        // Try different payload formats to see what works
        console.log("🧪 Testing direct payload...");
        await pubsub.publish(SUBSCRIPTION_TOPICS.CANDIDATE_BLOCKED, testEvent);

        console.log("🧪 Testing wrapped payload...");
        await pubsub.publish(SUBSCRIPTION_TOPICS.CANDIDATE_BLOCKED, {
            candidateBlockingUpdates: testEvent,
        });

        console.log("✅ Test CANDIDATE_BLOCKED events published successfully");

        return "Test subscription event triggered successfully";
    }
}
