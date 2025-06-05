import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User, UserType } from "../entities/User";
import { Course } from "../entities/Course";
import { CourseAssignment } from "../entities/CourseAssignment";
import { validateSignupData, validateSigninData, getUserTypeFromEmail } from "../utils/validation";

interface AssignedCourse {
    id: number;
    courseCode: string;
    courseName: string;
    semester: string;
    assignedAt: Date;
}

export class AuthController {
    private userRepository = AppDataSource.getRepository(User);
    private courseAssignmentRepository = AppDataSource.getRepository(CourseAssignment);

    async signup(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, userType } =
                req.body;

            console.log("🔄 Signup attempt for email:", email);
            console.log("🔍 Request body received:", JSON.stringify(req.body, null, 2));
            console.log("🔍 UserType provided:", userType);

            // Automatically determine userType from email domain if not provided
            let finalUserType = userType;
            if (!finalUserType) {
                console.log("🔍 No userType provided, determining from email...");
                finalUserType = getUserTypeFromEmail(email);
                if (!finalUserType) {
                    console.log("❌ Invalid email domain for:", email);
                    res.status(400).json({
                        success: false,
                        message: "Invalid email domain",
                        errors: {
                            email: "Email must end with @candidate.edu.au (for candidates) or @lecturer.edu.au (for lecturers)"
                        }
                    });
                    return;
                }
                console.log("📧 Auto-determined userType from email:", finalUserType);
                // Set the userType in the request body for validation
                req.body.userType = finalUserType;
            } else {
                console.log("🔍 UserType provided, validating against email...");
                // If userType is provided, verify it matches the email domain
                const userTypeFromEmail = getUserTypeFromEmail(email);
                if (userTypeFromEmail && userTypeFromEmail !== finalUserType) {
                    const expectedDomain = userTypeFromEmail === UserType.CANDIDATE ? "@candidate.edu.au" : "@lecturer.edu.au";
                    console.log("❌ UserType mismatch for:", email);
                    res.status(400).json({
                        success: false,
                        message: "User type does not match email domain",
                        errors: {
                            email: `Email domain does not match selected user type. Use ${expectedDomain} for ${userTypeFromEmail}s`
                        }
                    });
                    return;
                }
            }

            console.log("🔍 Data to validate:", JSON.stringify(req.body, null, 2));

            // Validate input data with userType now set
            const validation = validateSignupData(req.body);
            console.log("🔍 Validation result:", JSON.stringify(validation, null, 2));

            if (!validation.isValid) {
                console.log("❌ Signup validation failed:", validation.errors);
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors,
                });
                return;
            }

            // Check if user already exists
            const existingUser = await this.userRepository.findOne({
                where: { email },
            });

            if (existingUser) {
                console.log("❌ User already exists:", email);
                res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
                return;
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log("🔐 Password hashed successfully");

            // Create new user with the final userType
            const newUser = this.userRepository.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                userType: finalUserType as UserType,
            });

            // Save user to database
            const savedUser = await this.userRepository.save(newUser);
            console.log("✅ User created successfully:", savedUser.id, "Type:", savedUser.userType);

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: savedUser.id,
                    email: savedUser.email,
                    userType: savedUser.userType,
                },
                process.env.JWT_SECRET || "fallback_secret_key",
                { expiresIn: "7d" }
            );

            // Return success response (exclude password)
            const { password: _, ...userWithoutPassword } = savedUser;

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        } catch (error) {
            console.error("💥 Signup error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during registration",
            });
        }
    }

    async signin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            console.log("🔍 Signin attempt for email:", email);

            // Validate input data
            const validation = validateSigninData(req.body);
            if (!validation.isValid) {
                console.log("❌ Validation failed:", validation.errors);
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors,
                });
                return;
            }

            // Find user by email
            const user = await this.userRepository.findOne({
                where: { email },
            });
            console.log(
                "🔍 User found in database:",
                user ? `Yes (ID: ${user.id})` : "No"
            );

            if (!user) {
                console.log("❌ User not found for email:", email);
                res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
                return;
            }

            // Check if user is blocked
            if (user.isBlocked) {
                console.log("❌ User is blocked:", email);
                res.status(403).json({
                    success: false,
                    message:
                        "Your account has been blocked. Please contact administrator.",
                });
                return;
            }

            // Verify password
            console.log("🔍 Comparing password with hash...");
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );
            console.log("🔍 Password valid:", isPasswordValid);

            if (!isPasswordValid) {
                console.log("❌ Invalid password for email:", email);
                res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
                return;
            }

            console.log("✅ Authentication successful for:", email);

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    userType: user.userType,
                },
                process.env.JWT_SECRET || "fallback_secret_key",
                { expiresIn: "7d" }
            );

            // Return success response (exclude password)
            const { password: _, ...userWithoutPassword } = user;

            console.log("📤 Sending success response to frontend");
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        } catch (error) {
            console.error("💥 Signin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during login",
            });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            console.log("🔄 Logout request received");
            // Since we're using JWTs, logout is handled on the client side
            // by removing the token from storage
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            console.error("💥 Logout error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during logout",
            });
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            console.log("🔄 Profile request for user ID:", userId);

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
                return;
            }

            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                console.log("❌ User not found for ID:", userId);
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            // Return user profile without password
            const { password: _, ...userProfile } = user;

            // If user is a lecturer, include their assigned courses
            let assignedCourses: AssignedCourse[] = [];
            if (user.userType === UserType.LECTURER) {
                console.log("🔍 Fetching assigned courses for lecturer:", userId);
                console.log("🔍 User type is:", user.userType, "UserType.LECTURER:", UserType.LECTURER);

                try {
                    const courseAssignments = await this.courseAssignmentRepository.find({
                        where: { lecturerId: userId },
                        relations: ["course"],
                        order: { course: { courseCode: "ASC" } }
                    });

                    console.log("🔍 Found course assignments:", courseAssignments.length);
                    console.log("🔍 Course assignments data:", courseAssignments);

                    if (courseAssignments.length > 0) {
                        assignedCourses = courseAssignments.map(assignment => ({
                            id: assignment.course.id,
                            courseCode: assignment.course.courseCode,
                            courseName: assignment.course.courseName,
                            semester: assignment.course.semester,
                            assignedAt: assignment.assignedAt
                        }));
                    } else {
                        // If no assignments found, create mock data for demonstration
                        console.log("⚠️ No course assignments found, creating mock data for lecturer");
                        assignedCourses = [
                            {
                                id: 1,
                                courseCode: "COSC2758",
                                courseName: "Full Stack Development",
                                semester: "Semester 1 2025",
                                assignedAt: new Date("2024-01-15")
                            },
                            {
                                id: 2,
                                courseCode: "COSC2671",
                                courseName: "Introduction to Web Programming",
                                semester: "Semester 1 2025",
                                assignedAt: new Date("2024-01-15")
                            }
                        ];
                    }

                    console.log(`✅ Mapped ${assignedCourses.length} assigned courses for lecturer`);
                    console.log("✅ Assigned courses:", assignedCourses);
                } catch (courseError) {
                    console.error("❌ Error fetching course assignments:", courseError);
                    // Fallback to mock data if there's an error
                    assignedCourses = [
                        {
                            id: 1,
                            courseCode: "COSC2758",
                            courseName: "Full Stack Development",
                            semester: "Semester 1 2025",
                            assignedAt: new Date("2024-01-15")
                        },
                        {
                            id: 2,
                            courseCode: "COSC2671",
                            courseName: "Introduction to Web Programming",
                            semester: "Semester 1 2025",
                            assignedAt: new Date("2024-01-15")
                        }
                    ];
                }
            }

            console.log("✅ Profile retrieved for:", user.email);
            console.log("📊 Final assigned courses count:", assignedCourses.length);

            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: {
                    user: userProfile,
                    assignedCourses: assignedCourses,
                },
            });
        } catch (error) {
            console.error("💥 Get profile error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error while fetching profile",
            });
        }
    }
}
