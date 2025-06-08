"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { ADMIN_LOGIN } from "@/lib/graphql/queries";
import {
    LockClosedIcon,
    UserIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@heroicons/react/24/outline";
import DarkModeToggle from "@/shared/components/common/DarkModeToggle";
import styles from "./admin-signin.module.css";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const [adminLogin] = useMutation(ADMIN_LOGIN);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await adminLogin({
                variables: { email, password },
            });

            if (data.adminLogin.success) {
                // Store token in localStorage
                localStorage.setItem("admin-token", data.adminLogin.token);
                localStorage.setItem(
                    "admin-user",
                    JSON.stringify(data.adminLogin.user)
                );

                // Redirect to dashboard
                router.push("/dashboard");
            } else {
                setError(data.adminLogin.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred during login");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* Dark mode toggle in top right */}
            <div className={styles.darkModeToggle}>
                <DarkModeToggle />
            </div>

            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.header}>
                        <div className={styles.logoContainer}>
                            <LockClosedIcon className={styles.logoIcon} />
                        </div>
                        <h2 className={styles.title}>Admin Dashboard</h2>
                        <p className={styles.subtitle}>
                            Teaching Tutor Administration
                        </p>
                    </div>

                    {error && (
                        <div className={`${styles.alert} ${styles.alertError}`}>
                            {error}
                        </div>
                    )}

                    <div className={styles.inputContainer}>
                        <div className={styles.inputWrapper}>
                            <UserIcon className={styles.inputIcon} />
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                className={styles.inputField}
                                placeholder="Username (admin)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.passwordContainer}>
                        <div className={styles.inputWrapper}>
                            <LockClosedIcon className={styles.inputIcon} />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className={styles.inputField}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.passwordToggle}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeSlashIcon
                                        className={styles.toggleIcon}
                                    />
                                ) : (
                                    <EyeIcon className={styles.toggleIcon} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <div className={styles.credentialsHint}>
                        <p className={styles.hintText}>
                            Default credentials: <strong>admin</strong> /{" "}
                            <strong>admin</strong>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
