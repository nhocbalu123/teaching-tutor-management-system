import { UserType } from "../entities/User";

interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export const validateSignupData = (data: any): ValidationResult => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!data.email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!data.password) {
        errors.password = "Password is required";
    } else if (data.password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        errors.password =
            "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!data.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    // First name validation
    if (!data.firstName) {
        errors.firstName = "First name is required";
    } else if (data.firstName.length < 2) {
        errors.firstName = "First name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(data.firstName)) {
        errors.firstName = "First name can only contain letters and spaces";
    }

    // Last name validation
    if (!data.lastName) {
        errors.lastName = "Last name is required";
    } else if (data.lastName.length < 2) {
        errors.lastName = "Last name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(data.lastName)) {
        errors.lastName = "Last name can only contain letters and spaces";
    }

    // User type validation
    if (!data.userType) {
        errors.userType = "User type is required";
    } else if (!Object.values(UserType).includes(data.userType)) {
        errors.userType = "Invalid user type";
    }

    // Phone validation (optional)
    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
        errors.phone = "Please enter a valid phone number";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

export const validateSigninData = (data: any): ValidationResult => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!data.email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!data.password) {
        errors.password = "Password is required";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

export const validateApplicationData = (data: any): ValidationResult => {
    const errors: Record<string, string> = {};

    // Course ID validation
    if (!data.courseId) {
        errors.courseId = "Course is required";
    } else if (!Number.isInteger(data.courseId) || data.courseId <= 0) {
        errors.courseId = "Invalid course selection";
    }

    // Role ID validation
    if (!data.roleId) {
        errors.roleId = "Role is required";
    } else if (!Number.isInteger(data.roleId) || data.roleId <= 0) {
        errors.roleId = "Invalid role selection";
    }

    // Availability validation
    if (!data.availability) {
        errors.availability = "Availability is required";
    } else if (!["Part Time", "Full Time"].includes(data.availability)) {
        errors.availability = "Invalid availability type";
    }

    // Skills validation
    if (!data.skills) {
        errors.skills = "Skills are required";
    } else if (data.skills.length < 10) {
        errors.skills = "Skills description must be at least 10 characters long";
    } else if (data.skills.length > 1000) {
        errors.skills = "Skills description must be less than 1000 characters";
    }

    // Experience validation (optional)
    if (data.experience && data.experience.length > 2000) {
        errors.experience = "Experience description must be less than 2000 characters";
    }

    // Motivation validation
    if (!data.motivation) {
        errors.motivation = "Motivation is required";
    } else if (data.motivation.length < 20) {
        errors.motivation = "Motivation must be at least 20 characters long";
    } else if (data.motivation.length > 1000) {
        errors.motivation = "Motivation must be less than 1000 characters";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
