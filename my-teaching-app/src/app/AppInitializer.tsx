"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // Corrected import for App Router

export default function AppInitializer() {
    const router = useRouter();
    const pathname = usePathname(); // Corrected hook for App Router

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (!sessionStorage.getItem("sessionId")) {
                sessionStorage.setItem("sessionId", Date.now().toString());

                const currentUser = localStorage.getItem("currentUser");
                // Ensure pathname is available and not null
                if (currentUser && pathname && pathname !== "/") {
                    router.push("/");
                }
            }
        }
    }, [router, pathname]); // Added pathname to dependency array

    useEffect(() => {
        if (
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return null; // This component does not render anything itself
}
