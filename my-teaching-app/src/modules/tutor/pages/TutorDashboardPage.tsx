"use client";
import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import type { CourseDetails } from "@/shared/types/course";
import { getCoursesWithDetails } from "@/modules/course/utils/courseDisplay.utils";
import type { Application as TutorApplication } from "@/shared/types/application";
import { saveApplicationToStorage } from "@/modules/tutor/utils/applicationDisplay.utils";
import CourseCard from "@/modules/course/components/course-card/course-card";
import ApplyModal from "@/modules/tutor/components/apply-modal/apply-modal";
import SearchInput from "@/shared/components/common/search-input/SearchInput";
import Toast from "@/shared/components/common/toast/toast";
import { useToast } from "@/shared/hooks/useNotification";
import { motion } from "framer-motion";
import styles from "@/modules/tutor/styles/tutor-dashboard-layout.module.css";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

const TutorDashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(
    null
  );
  const {
    toast: successToast,
    showSuccess,
    hideToast: hideSuccess,
  } = useToast();

  const { toast: errorToast, showError, hideToast: hideError } = useToast();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [existingApplications, setExistingApplications] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "applied" | "available"
  >("all");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Get current user from localStorage
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

  // Initialize courses
  useEffect(() => {
    const fetchedCourses = getCoursesWithDetails();
    setCourses(fetchedCourses);
  }, []);

  // Filter courses
  const filteredCourses = React.useMemo(() => {
    return courses.filter((course) => {
      // Apply search filter
      const matchesSearch =
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.availability.toLowerCase().includes(searchQuery.toLowerCase());

      // Apply application status filter
      const isApplied = existingApplications.includes(course.code);
      let matchesApplicationFilter = true;

      if (activeFilter === "applied") {
        matchesApplicationFilter = isApplied;
      } else if (activeFilter === "available") {
        matchesApplicationFilter = !isApplied;
      }

      return matchesSearch && matchesApplicationFilter;
    });
  }, [courses, searchQuery, activeFilter, existingApplications]);

  const openApplyModal = (course: CourseDetails) => {
    console.log("Apply button clicked for course:", course.code);
    console.log("User data:", userData);
    console.log("Existing applications:", existingApplications);

    // Check if user is logged in
    if (!userData) {
      console.log("Error: User not logged in");
      showError("You must be logged in to apply for courses.");
      return;
    }

    // Check if user has already applied for this course
    if (existingApplications.includes(course.code)) {
      console.log("Error: Already applied to this course");
      showError(`You have already applied for ${course.code}.`);
      return;
    }

    console.log("Opening modal for course:", course.code);
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeApplyModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleSubmitApplication = (applicationData: TutorApplication) => {
    if (!userData) {
      showError("You must be logged in to apply for courses.");
      return;
    }

    // Add user information
    applicationData.email = userData.email;
    applicationData.fullName = userData.fullName;

    // Save application
    try {
      saveApplicationToStorage(applicationData);

      // Update existing applications list
      setExistingApplications([
        ...existingApplications,
        applicationData.courses[0],
      ]);

      // Show success message
      setIsModalOpen(false);
      showSuccess("Your application has been submitted successfully!");

      // Clear the success message after 5 seconds
      setTimeout(() => {
        hideSuccess();
      }, 5000);
    } catch (error) {
      showError("Failed to submit your application. Please try again.");
      console.error(error);
    }
  };

  // Card count by row for animation
  const getRowStartDelay = (index: number) => {
    if (typeof window === "undefined") return 0;
    const itemsPerRow =
      window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    return Math.floor(index / itemsPerRow) * 0.1;
  };

  return (
    <>
      {/* Hero Section - Full Width */}
      <motion.div
        className={styles.tutorHeroSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.tutorHeroContent}>
          <motion.h1
            className={styles.tutorHeroTitle}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Find Your Perfect{" "}
            <span className={styles.heroHighlight}>Teaching</span> Opportunity
          </motion.h1>
          <motion.p
            className={styles.tutorHeroSubtitle}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Browse available courses and apply for tutor or lab-assistant
            positions with the School of Computer Science
          </motion.p>

          {/* Stats */}
          <motion.div
            className={styles.tutorStats}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <div className={styles.statItem}>
              <div className={styles.statValue}>{courses.length}</div>
              <div className={styles.statLabel}>Available Courses</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {existingApplications.length}
              </div>
              <div className={styles.statLabel}>Your Applications</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {courses.length - existingApplications.length}
              </div>
              <div className={styles.statLabel}>Opportunities</div>
            </div>
          </motion.div>
        </div>

        <div className={styles.heroDecoration}>
          <div className={`${styles.circleDecoration} ${styles.circle1}`}></div>
          <div className={`${styles.circleDecoration} ${styles.circle2}`}></div>
          <div className={`${styles.circleDecoration} ${styles.circle3}`}></div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className={`flex-grow pt-0 ${styles.tutorContainer}`}>
        {/* Success/Error Messages */}
        <Toast
          message={successToast.message}
          type={successToast.type}
          visible={successToast.visible}
          onClose={hideSuccess}
          variant="inline"
          autoClose={true}
          autoCloseDelay={5000}
        />

        <Toast
          message={errorToast.message}
          type={errorToast.type}
          visible={errorToast.visible}
          onClose={hideError}
          variant="inline"
          autoClose={false}
        />

        {/* Search and Filters */}
        <motion.div
          className={styles.searchFiltersContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Search Bar */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search courses, skills, or roles..."
            showLabel={false}
            variant="rounded"
          />

          {/* Filter Pills */}
          <div className={styles.filterPills}>
            <button
              className={`${styles.filterPill} ${
                activeFilter === "all" ? styles.filterPillActive : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All Courses
            </button>
            <button
              className={`${styles.filterPill} ${
                activeFilter === "available" ? styles.filterPillActive : ""
              }`}
              onClick={() => setActiveFilter("available")}
            >
              Available
            </button>
            <button
              className={`${styles.filterPill} ${
                activeFilter === "applied" ? styles.filterPillActive : ""
              }`}
              onClick={() => setActiveFilter("applied")}
            >
              Applied
            </button>
          </div>
        </motion.div>

        {/* Course Cards */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading courses...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <motion.div
            className={styles.coursesGrid}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.code}
                className={styles.courseCardWrapper}
                variants={itemVariants}
                transition={{ delay: getRowStartDelay(index) }}
              >
                <CourseCard
                  course={course}
                  openApplyModal={openApplyModal}
                  hasApplied={existingApplications.includes(course.code)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className={styles.noCourses}>
            <Image
              src="/empty-box.svg"
              alt="No courses found"
              width={150}
              height={150}
            />
            <h3>No courses found</h3>
            <p>
              {searchQuery
                ? "Try adjusting your search or filters"
                : activeFilter === "applied"
                  ? "You haven't applied to any courses yet"
                  : "No available courses at the moment"}
            </p>
          </div>
        )}
      </main>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isModalOpen}
        course={selectedCourse}
        onClose={closeApplyModal}
        onSubmit={handleSubmitApplication}
        currentUserId={userData?.id || ""}
      />
    </>
  );
};

export default TutorDashboardPage;
