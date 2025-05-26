import type { Metadata } from "next";
import "../modules/core/styles/index.css";
// Module styles imports
import "../modules/home/styles/index.css";
import "../modules/auth/styles/index.css";
import "../modules/tutor/styles/index.css";
import "../modules/lecturer/styles/index.css";

// Client-side effects component
import AppInitializer from "./AppInitializer";

export const metadata: Metadata = {
    title: "duTeach - Find Expert Tutors",
    description:
        "Connect with top-rated tutors for courses at the School of Computer Science",
    icons: [{ rel: "icon", url: "/letter-e.png" }],
    themeColor: "#f97316",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AppInitializer />
                {children}
            </body>
        </html>
    );
}
