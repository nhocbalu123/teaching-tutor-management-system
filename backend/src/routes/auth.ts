import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const authController = new AuthController();

// Enhanced validation middleware
const validateRequestBody = (requiredFields: string[]) => {
    return (req: any, res: any, next: any) => {
        const errors: Record<string, string> = {};

        for (const field of requiredFields) {
            if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
                errors[field] = `${field} is required`;
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }

        next();
    };
};

// Enhanced signup validation
const validateSignupFields = (req: any, res: any, next: any) => {
    const { email, password, confirmPassword, firstName, lastName } = req.body;
    const errors: Record<string, string> = {};

    // Email validation
    if (!email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address";
    } else {
        const emailLower = email.toLowerCase();
        const isValidDomain = emailLower.endsWith("@candidate.edu.au") ||
            emailLower.endsWith("@lecturer.edu.au") ||
            emailLower === "admin@admin.com";
        if (!isValidDomain) {
            errors.email = "Email must end with @candidate.edu.au (for candidates) or @lecturer.edu.au (for lecturers)";
        }
    }

    // Password validation
    if (!password) {
        errors.password = "Password is required";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    // Name validation
    if (!firstName) {
        errors.firstName = "First name is required";
    } else if (firstName.length < 2) {
        errors.firstName = "First name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(firstName)) {
        errors.firstName = "First name can only contain letters and spaces";
    }

    if (!lastName) {
        errors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
        errors.lastName = "Last name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(lastName)) {
        errors.lastName = "Last name can only contain letters and spaces";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }

    next();
};

// Public routes with enhanced validation
router.post("/signup", validateSignupFields, async (req, res) => {
    await authController.signup(req, res);
});

router.post("/signin", validateRequestBody(["email", "password"]), async (req, res) => {
    await authController.signin(req, res);
});

router.post("/logout", async (req, res) => {
    await authController.logout(req, res);
});

// Protected routes
router.get("/profile", authenticateToken, async (req, res) => {
    await authController.getProfile(req, res);
});

export default router;
