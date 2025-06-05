import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User, UserType } from "../entities/User";
import { Course } from "../entities/Course";
import { Role } from "../entities/Role";
import { CourseAssignment } from "../entities/CourseAssignment";
import { Application, ApplicationStatus } from "../entities/Application";
import { SelectedCandidate } from "../entities/SelectedCandidate";
import bcrypt from "bcryptjs";

config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "209.38.26.237",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "S3959931",
    password: process.env.DB_PASSWORD || "Eel404101@@",
    database: process.env.DB_NAME || "S3959931",
    synchronize: true, // Auto-create tables in development
    logging: process.env.NODE_ENV === "development",
    entities: [
        User,
        Course,
        Role,
        CourseAssignment,
        Application,
        SelectedCandidate,
    ],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
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
        console.log("✅ Database connection initialized successfully");
        console.log("📊 All tables ready for TT application");

        // Seed default data
        await seedDefaultRoles();
        await seedDefaultCourses();
        await seedMockLecturers();
        await seedCourseAssignments();
        await seedMockCandidatesAndApplications();
    } catch (error) {
        console.error("❌ Error during database initialization:", error);
        throw error;
    }
};

export const initializeDatabaseConnection = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("✅ Database connection initialized successfully");
            console.log("📊 All tables ready for TT application");
        }
    } catch (error) {
        console.error("❌ Error during database connection initialization:", error);
        throw error;
    }
};

const seedDefaultRoles = async () => {
    try {
        const roleRepository = AppDataSource.getRepository(Role);

        const tutorRole = await roleRepository.findOne({
            where: { roleName: "tutor" },
        });
        if (!tutorRole) {
            const tutor = roleRepository.create({
                roleName: "tutor",
                description: "Tutor role for conducting tutorial sessions",
            });
            await roleRepository.save(tutor);
            console.log("✅ Tutor role created");
        }

        const labAssistantRole = await roleRepository.findOne({
            where: { roleName: "lab_assistant" },
        });
        if (!labAssistantRole) {
            const labAssistant = roleRepository.create({
                roleName: "lab_assistant",
                description: "Lab Assistant role for assisting in laboratory sessions",
            });
            await roleRepository.save(labAssistant);
            console.log("✅ Lab Assistant role created");
        }
    } catch (error) {
        console.error("❌ Error seeding default roles:", error);
    }
};

const seedDefaultCourses = async () => {
    try {
        const courseRepository = AppDataSource.getRepository(Course);

        const defaultCourses = [
            {
                courseCode: "COSC2758",
                courseName: "Full Stack Development",
                semester: "Semester 1 2025",
                description: "Learn to build modern web applications with React, Node.js, and databases",
                maxTutors: 5,
                maxLabAssistants: 3,
            },
            {
                courseCode: "COSC2938",
                courseName: "Further Web Programming",
                semester: "Semester 1 2025",
                description: "Advanced web development concepts and frameworks",
                maxTutors: 4,
                maxLabAssistants: 2,
            },
            {
                courseCode: "COSC1295",
                courseName: "Advanced Programming",
                semester: "Semester 1 2025",
                description: "Object-oriented programming with Java",
                maxTutors: 6,
                maxLabAssistants: 4,
            },
            {
                courseCode: "COSC2123",
                courseName: "Algorithms and Analysis",
                semester: "Semester 1 2025",
                description: "Study of algorithms, data structures, and computational complexity",
                maxTutors: 4,
                maxLabAssistants: 3,
            },
            {
                courseCode: "COSC2767",
                courseName: "Systems Deployment and Operations",
                semester: "Semester 1 2025",
                description: "Cloud deployment, DevOps practices, and system operations",
                maxTutors: 3,
                maxLabAssistants: 2,
            },
            {
                courseCode: "COSC2671",
                courseName: "Introduction to Web Programming",
                semester: "Semester 1 2025",
                description: "Fundamentals of web development with HTML, CSS, and JavaScript",
                maxTutors: 5,
                maxLabAssistants: 4,
            },
        ];

        for (const courseData of defaultCourses) {
            const existingCourse = await courseRepository.findOne({
                where: { courseCode: courseData.courseCode },
            });

            if (!existingCourse) {
                const course = courseRepository.create(courseData);
                await courseRepository.save(course);
                console.log(`✅ Course ${courseData.courseCode} created`);
            }
        }
    } catch (error) {
        console.error("❌ Error seeding default courses:", error);
    }
};

const seedMockLecturers = async () => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const saltRounds = 10;

        const mockLecturers = [
            {
                email: "john.smith@lecturer.edu.au",
                password: "lecturer123",
                firstName: "John",
                lastName: "Smith",
            },
            {
                email: "sarah.johnson@lecturer.edu.au",
                password: "lecturer123",
                firstName: "Sarah",
                lastName: "Johnson",
            },
            {
                email: "michael.williams@lecturer.edu.au",
                password: "lecturer123",
                firstName: "Michael",
                lastName: "Williams",
            },
            {
                email: "emily.brown@lecturer.edu.au",
                password: "lecturer123",
                firstName: "Emily",
                lastName: "Brown",
            },
            {
                email: "david.davis@lecturer.edu.au",
                password: "lecturer123",
                firstName: "David",
                lastName: "Davis",
            },
            {
                email: "lisa.wilson@lecturer.edu.au",
                password: "lecturer123",
                firstName: "Lisa",
                lastName: "Wilson",
            },
        ];

        for (const lecturerData of mockLecturers) {
            const existingLecturer = await userRepository.findOne({
                where: { email: lecturerData.email },
            });

            if (!existingLecturer) {
                const hashedPassword = await bcrypt.hash(lecturerData.password, saltRounds);

                const lecturer = userRepository.create({
                    email: lecturerData.email,
                    password: hashedPassword,
                    firstName: lecturerData.firstName,
                    lastName: lecturerData.lastName,
                    userType: UserType.LECTURER,
                    isBlocked: false,
                });

                await userRepository.save(lecturer);
                console.log(`✅ Lecturer ${lecturerData.firstName} ${lecturerData.lastName} created`);
            }
        }
    } catch (error) {
        console.error("❌ Error seeding mock lecturers:", error);
    }
};

const seedCourseAssignments = async () => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const courseRepository = AppDataSource.getRepository(Course);
        const assignmentRepository = AppDataSource.getRepository(CourseAssignment);

        // Get all lecturers and courses
        const lecturers = await userRepository.find({
            where: { userType: UserType.LECTURER },
        });
        const courses = await courseRepository.find();

        if (lecturers.length === 0 || courses.length === 0) {
            console.log("⚠️ No lecturers or courses found for assignment seeding");
            return;
        }

        // Define course assignments (lecturer email -> course codes)
        const assignments = {
            "john.smith@lecturer.edu.au": ["COSC2758", "COSC2671"],
            "sarah.johnson@lecturer.edu.au": ["COSC2938", "COSC2123"],
            "michael.williams@lecturer.edu.au": ["COSC1295", "COSC2767"],
            "emily.brown@lecturer.edu.au": ["COSC2758", "COSC2938"],
            "david.davis@lecturer.edu.au": ["COSC2123", "COSC2671"],
            "lisa.wilson@lecturer.edu.au": ["COSC2767", "COSC1295"],
        };

        for (const [lecturerEmail, courseCodes] of Object.entries(assignments)) {
            const lecturer = lecturers.find(l => l.email === lecturerEmail);
            if (!lecturer) continue;

            for (const courseCode of courseCodes) {
                const course = courses.find(c => c.courseCode === courseCode);
                if (!course) continue;

                // Check if assignment already exists
                const existingAssignment = await assignmentRepository.findOne({
                    where: {
                        lecturerId: lecturer.id,
                        courseId: course.id,
                    },
                });

                if (!existingAssignment) {
                    const assignment = assignmentRepository.create({
                        lecturerId: lecturer.id,
                        courseId: course.id,
                    });

                    await assignmentRepository.save(assignment);
                    console.log(`✅ Assigned ${lecturer.firstName} ${lecturer.lastName} to ${course.courseCode}`);
                }
            }
        }
    } catch (error) {
        console.error("❌ Error seeding course assignments:", error);
    }
};

const seedMockCandidatesAndApplications = async () => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const courseRepository = AppDataSource.getRepository(Course);
        const roleRepository = AppDataSource.getRepository(Role);
        const applicationRepository = AppDataSource.getRepository(Application);
        const saltRounds = 10;

        // Create exactly 2 mock candidates as required
        const mockCandidates = [
            {
                email: "john.doe@candidate.edu.au",
                password: "candidate123",
                firstName: "John",
                lastName: "Doe",
            },
            {
                email: "jane.smith@candidate.edu.au",
                password: "candidate123",
                firstName: "Jane",
                lastName: "Smith",
            },
        ];

        // Seed candidates
        for (const candidateData of mockCandidates) {
            const existingCandidate = await userRepository.findOne({
                where: { email: candidateData.email },
            });

            if (!existingCandidate) {
                const hashedPassword = await bcrypt.hash(candidateData.password, saltRounds);

                const candidate = userRepository.create({
                    email: candidateData.email,
                    password: hashedPassword,
                    firstName: candidateData.firstName,
                    lastName: candidateData.lastName,
                    userType: UserType.CANDIDATE,
                    isBlocked: false,
                });

                await userRepository.save(candidate);
                console.log(`✅ Candidate ${candidateData.firstName} ${candidateData.lastName} created`);
            }
        }

        // Get all necessary data for applications
        const candidates = await userRepository.find({
            where: { userType: UserType.CANDIDATE },
        });
        const courses = await courseRepository.find();
        const roles = await roleRepository.find();

        if (candidates.length === 0 || courses.length === 0 || roles.length === 0) {
            console.log("⚠️ Missing data for application seeding");
            return;
        }

        // Create sample applications for different courses with updated email addresses
        const sampleApplications = [
            // Applications for COSC2758 (Full Stack Development)
            {
                candidateEmail: "john.doe@candidate.edu.au",
                courseCode: "COSC2758",
                roleName: "tutor",
                availability: { type: "Full Time" },
                skills: "JavaScript, React, Node.js, MongoDB, TypeScript",
                experience: "2 years of web development experience with React and Node.js. Built 3 full-stack applications during internship.",
                motivation: "I am passionate about web development and want to help other students learn modern frameworks and best practices.",
            },
            {
                candidateEmail: "jane.smith@candidate.edu.au",
                courseCode: "COSC2758",
                roleName: "lab_assistant",
                availability: { type: "Part Time" },
                skills: "React, HTML, CSS, Git, Agile methodologies",
                experience: "Completed advanced web development courses and contributed to open-source projects.",
                motivation: "I enjoy problem-solving and helping peers understand complex programming concepts.",
            },
            // Applications for COSC2671 (Introduction to Web Programming)
            {
                candidateEmail: "john.doe@candidate.edu.au",
                courseCode: "COSC2671",
                roleName: "tutor",
                availability: { type: "Part Time" },
                skills: "HTML, CSS, JavaScript, Bootstrap, jQuery",
                experience: "Strong foundation in web technologies. Tutored high school students in programming.",
                motivation: "I want to help beginning students build confidence in their programming abilities.",
            },
            {
                candidateEmail: "jane.smith@candidate.edu.au",
                courseCode: "COSC2671",
                roleName: "lab_assistant",
                availability: { type: "Part Time" },
                skills: "HTML, CSS, JavaScript, Responsive Design, Accessibility",
                experience: "Completed web development bootcamp and built several portfolio projects.",
                motivation: "I understand the challenges beginners face and want to provide supportive guidance.",
            },
        ];

        // Create applications
        for (const appData of sampleApplications) {
            const candidate = candidates.find(c => c.email === appData.candidateEmail);
            const course = courses.find(c => c.courseCode === appData.courseCode);
            const role = roles.find(r => r.roleName === appData.roleName);

            if (!candidate || !course || !role) {
                console.log(`⚠️ Skipping application - missing data for ${appData.candidateEmail} -> ${appData.courseCode}`);
                continue;
            }

            // Check if application already exists
            const existingApplication = await applicationRepository.findOne({
                where: {
                    candidateId: candidate.id,
                    courseId: course.id,
                    roleId: role.id,
                },
            });

            if (!existingApplication) {
                const application = applicationRepository.create({
                    candidateId: candidate.id,
                    courseId: course.id,
                    roleId: role.id,
                    availability: appData.availability,
                    skills: appData.skills,
                    experience: appData.experience,
                    motivation: appData.motivation,
                    status: ApplicationStatus.PENDING,
                });

                await applicationRepository.save(application);
                console.log(`✅ Application created: ${candidate.firstName} ${candidate.lastName} -> ${course.courseCode} (${role.roleName})`);
            }
        }

        console.log("✅ Mock candidates and applications seeded successfully");
    } catch (error) {
        console.error("❌ Error seeding mock candidates and applications:", error);
    }
};
