import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import type { Application as TutorApplication } from "@/shared/types/application";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export const useTutorAuth = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [existingApplications, setExistingApplications] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Checking user authentication...");
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("currentUser");
      console.log("Raw user data from localStorage:", userJson);

      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          console.log("Parsed user data:", user);
          setUserData({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          });

          // Get user's existing applications
          const applications = localStorage.getItem("applications");
          console.log("Raw applications from localStorage:", applications);

          if (applications) {
            const parsed = JSON.parse(applications);
            const userApplications = parsed
              .filter((app: TutorApplication) => app.userId === user.id)
              .map((app: TutorApplication) => app.courses)
              .flat();

            console.log("User applications:", userApplications);
            setExistingApplications(userApplications);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          redirect("/signin");
        }
      } else {
        console.log(
          "No user data found in localStorage, redirecting to signin"
        );
        redirect("/signin");
      }
      setIsLoading(false);
    }
  }, []);

  const updateExistingApplications = (newApplication: string) => {
    setExistingApplications((prev) => [...prev, newApplication]);
  };

  return {
    userData,
    existingApplications,
    isLoading,
    updateExistingApplications,
  };
};
