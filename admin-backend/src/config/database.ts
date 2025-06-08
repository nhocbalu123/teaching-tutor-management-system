import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User, UserType } from "../types/User";
import { Course } from "../types/Course";
import { Role } from "../types/Role";
import { CourseAssignment } from "../types/CourseAssignment";
import { Application } from "../types/Application";
import { SelectedCandidate } from "../types/SelectedCandidate";
import bcrypt from "bcryptjs";
import path from "path";

// Load environment variables from root .env file
config({ path: path.resolve(__dirname, "../../../.env") });

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    synchronize: false, // Don't auto-create tables in admin backend
    logging: process.env.NODE_ENV === "development",
    entities: [
        User,
        Course,
        Role,
        CourseAssignment,
        Application,
        SelectedCandidate,
    ],
    // Connection options for Cloud MySQL
    extra: {
        charset: "utf8mb4_unicode_ci",
    },
    connectTimeout: 60000,
    acquireTimeout: 60000,
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("✅ Admin Database connection initialized successfully");

        // Seed admin user
        await seedAdminUser();
    } catch (error) {
        console.error("❌ Error during admin database initialization:", error);
        throw error;
    }
};

const seedAdminUser = async () => {
    try {
        const userRepository = AppDataSource.getRepository(User);

        // Check if admin user already exists
        const existingAdmin = await userRepository.findOne({
            where: { email: "admin" },
        });

        if (!existingAdmin) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash("admin", saltRounds);

            const adminUser = userRepository.create({
                email: "admin",
                password: hashedPassword,
                firstName: "System",
                lastName: "Administrator",
                userType: UserType.ADMIN,
                isBlocked: false,
            });

            await userRepository.save(adminUser);
            console.log("✅ Admin user created with credentials: admin/admin");
        } else {
            console.log("✅ Admin user already exists");
        }
    } catch (error) {
        console.error("❌ Error seeding admin user:", error);
    }
};
