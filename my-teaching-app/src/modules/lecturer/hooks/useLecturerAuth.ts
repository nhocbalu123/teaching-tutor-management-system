import { useState, useEffect } from "react";
import { redirect } from "next/navigation";

export const useLecturerAuth = () => {
  const [lecturerName, setLecturerName] = useState<string>("");
  const [currentLecturerId, setCurrentLecturerId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser");
      if (!user) {
        redirect("/signin");
        return;
      }
      const userData = JSON.parse(user);
      if (userData.role !== "lecturer") {
        redirect("/signin");
        return;
      }
      setLecturerName(userData.fullName || "Lecturer");
      setCurrentLecturerId(userData.id);
    }
  }, []);

  return {
    lecturerName,
    currentLecturerId,
  };
};
