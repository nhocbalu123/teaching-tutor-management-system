import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Int,
    ObjectType,
    Field,
} from "type-graphql";
import { User, UserType } from "../types/User";
import { AppDataSource } from "../config/database";

@ObjectType()
class UserStats {
    @Field(() => Int)
    totalUsers: number;

    @Field(() => Int)
    totalCandidates: number;

    @Field(() => Int)
    totalLecturers: number;

    @Field(() => Int)
    totalAdmins: number;

    @Field(() => Int)
    blockedUsers: number;
}

@ObjectType()
class UserResponse {
    @Field()
    success: boolean;

    @Field({ nullable: true })
    message?: string;

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => [User])
    async getAllUsers(): Promise<User[]> {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
            order: { createdAt: "DESC" },
        });
    }

    @Query(() => [User])
    async getUsersByType(@Arg("userType") userType: UserType): Promise<User[]> {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.find({
            where: { userType },
            order: { createdAt: "DESC" },
        });
    }

    @Query(() => UserStats)
    async getUserStats(): Promise<UserStats> {
        const userRepository = AppDataSource.getRepository(User);

        const [
            totalUsers,
            totalCandidates,
            totalLecturers,
            totalAdmins,
            blockedUsers,
        ] = await Promise.all([
            userRepository.count(),
            userRepository.count({ where: { userType: UserType.CANDIDATE } }),
            userRepository.count({ where: { userType: UserType.LECTURER } }),
            userRepository.count({ where: { userType: UserType.ADMIN } }),
            userRepository.count({ where: { isBlocked: true } }),
        ]);

        return {
            totalUsers,
            totalCandidates,
            totalLecturers,
            totalAdmins,
            blockedUsers,
        };
    }

    @Query(() => User, { nullable: true })
    async getUserById(@Arg("id", () => Int) id: number): Promise<User | null> {
        const userRepository = AppDataSource.getRepository(User);
        return await userRepository.findOne({
            where: { id },
            relations: [
                "courseAssignments",
                "applications",
                "candidateSelections",
            ],
        });
    }

    @Mutation(() => UserResponse)
    async blockUser(@Arg("id", () => Int) id: number): Promise<UserResponse> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            if (user.userType === UserType.ADMIN) {
                return {
                    success: false,
                    message: "Cannot block admin users",
                };
            }

            user.isBlocked = true;
            await userRepository.save(user);

            return {
                success: true,
                message: "User blocked successfully",
                user,
            };
        } catch (error) {
            console.error("Block user error:", error);
            return {
                success: false,
                message: "Failed to block user",
            };
        }
    }

    @Mutation(() => UserResponse)
    async unblockUser(@Arg("id", () => Int) id: number): Promise<UserResponse> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            user.isBlocked = false;
            await userRepository.save(user);

            return {
                success: true,
                message: "User unblocked successfully",
                user,
            };
        } catch (error) {
            console.error("Unblock user error:", error);
            return {
                success: false,
                message: "Failed to unblock user",
            };
        }
    }

    @Mutation(() => UserResponse)
    async deleteUser(@Arg("id", () => Int) id: number): Promise<UserResponse> {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id } });

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            if (user.userType === UserType.ADMIN) {
                return {
                    success: false,
                    message: "Cannot delete admin users",
                };
            }

            await userRepository.remove(user);

            return {
                success: true,
                message: "User deleted successfully",
            };
        } catch (error) {
            console.error("Delete user error:", error);
            return {
                success: false,
                message: "Failed to delete user",
            };
        }
    }
}
