"use client";
// import { useRouter } from "next/router"; // To be refactored
import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation"; // Import redirect
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import {
  getApplicationsFromStorage as getApplications,
  saveApplicationToStorage as saveApplication,
  initializeDetailedApplicationsInStorage, // Updated import
} from "@/modules/tutor/utils/applicationDisplay.utils"; // Updated
import {
  availableCourses,
  // getCoursesWithDetails, // Removed as unused
} from "@/modules/course/utils/courseDisplay.utils"; // Updated & added
// import Head from "next/head"; // Head component is handled by App Router layout
import ApplicantList from "../components/applicant-list/applicant-list";
import ApplicantDetails from "../components/applicant-details/applicant-details";
import RankedCandidates from "../components/ranked-candidates/ranked-candidates";
import ApplicantStatsVisualization from "../components/applicant-stats-visualization/applicant-stats-visualization";
import Toast from "../../../shared/components/common/toast/toast";
import SearchInput from "@/shared/components/common/search-input/SearchInput";
import { motion } from "framer-motion";
import styles from "./lecturer-dashboard-page.module.css";

// TODO: Refactor localStorage logic to use services/API calls
// TODO: Refactor navigation (router.push) to use Next.js 13+ App Router navigation (e.g. redirect, Link, or navigation hooks)
// TODO: Further break down this page into smaller components if needed
// TODO: Update styles to use lecturer-dashboard-layout.module.css

export default function LecturerDashboardPage() {
  // const router = useRouter(); // To be refactored
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedApplication, setSelectedApplication] =
    useState<TutorApplication | null>(null);
  const [comment, setComment] = useState<string>("");
  const [rankedApplications, setRankedApplications] = useState<
    TutorApplication[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("none");
  const [activeTab, setActiveTab] = useState<
    "applications" | "rankings" | "stats"
  >("applications");
  const [lecturerName, setLecturerName] = useState<string>("");
  const [currentLecturerId, setCurrentLecturerId] = useState<string>("");

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

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
      initializeDetailedApplicationsInStorage(); // Use new function
      loadApplications();
      setCurrentLecturerId(userData.id);
    }
  }, []);

  useEffect(() => {
    loadApplications();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "applications") {
        loadApplications();
      }
    };
    const handleApplicationUpdate = () => {
      loadApplications();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("applicationUpdated", handleApplicationUpdate);
    const intervalId = setInterval(loadApplications, 5000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("applicationUpdated", handleApplicationUpdate);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (
      activeTab === "rankings" &&
      !selectedCourse &&
      availableCourses.length > 0
    ) {
      setSelectedCourse(availableCourses[0].code);
    }
  }, [activeTab, selectedCourse]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const loadApplications = () => {
    const appData = getApplications();
    setApplications(appData);
    const ranked = appData.filter((app) => app.rank !== undefined);
    setRankedApplications(
      ranked.sort((a, b) => (a.rank || 999) - (b.rank || 999))
    );
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedCourse && !app.courses.includes(selectedCourse)) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const courseMatches = app.courses.some((course) => {
        const courseInfo = availableCourses.find(
          (c: { code: string; name: string }) => c.code === course
        );
        return (
          courseInfo &&
          (courseInfo.code.toLowerCase().includes(query) ||
            courseInfo.name.toLowerCase().includes(query))
        );
      });
      return (
        app.fullName.toLowerCase().includes(query) ||
        courseMatches ||
        app.availability.toLowerCase().includes(query) ||
        app.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === "none") return 0;
    if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
    if (sortBy === "availability")
      return a.availability.localeCompare(b.availability);
    if (sortBy === "date") {
      return (
        new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
      );
    }
    return 0;
  });

  const handleSelectApplication = (application: TutorApplication) => {
    setSelectedApplication(application);
    setComment(application.comment || "");
  };

  const handleSaveComment = () => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        comment: comment,
      };
      saveApplication(updatedApplication);
      loadApplications(); // Refresh applications list after saving
      setSelectedApplication(updatedApplication);
      showToast("Comment saved!", "success");
    }
  };

  const handleDeleteComment = () => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        comment: "",
      };
      saveApplication(updatedApplication);
      loadApplications(); // Refresh applications list after deleting
      setSelectedApplication(updatedApplication);
      setComment("");
      showToast("Comment deleted!", "success");
    }
  };

  const handleSelectApplicantButton = (selectedCourses: string[]) => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        selected: true,
        selectedBy: currentLecturerId,
        selectedDate: new Date().toISOString().split("T")[0],
        selectedForCourses: selectedCourses,
      };
      saveApplication(updatedApplication);
      loadApplications();
      setSelectedApplication(updatedApplication);
      showToast("Applicant selected successfully!", "success");
    }
  };

  const handleUnselectApplicant = () => {
    if (selectedApplication) {
      const updatedApplication = {
        ...selectedApplication,
        selected: false,
        selectedBy: undefined,
        selectedDate: undefined,
        selectedForCourses: undefined,
        rank: undefined,
      };
      saveApplication(updatedApplication);
      loadApplications();
      setSelectedApplication(updatedApplication);
      showToast("Applicant unselected successfully!", "success");
    }
  };

  const handleAddToRanking = () => {
    if (selectedApplication) {
      const rankedAppsForCourse = rankedApplications.filter((app) => {
        const courses =
          selectedApplication.selectedForCourses || selectedApplication.courses;
        return courses.some(
          (course) =>
            app.selectedForCourses?.includes(course) ||
            app.courses.includes(course)
        );
      });
      const newRank = rankedAppsForCourse.length + 1;
      const updatedApplication = {
        ...selectedApplication,
        rank: newRank,
      };
      saveApplication(updatedApplication);
      loadApplications();
      setSelectedApplication(updatedApplication);
      showToast("Applicant added to ranking!", "success");
    }
  };

  const handleMoveUp = (application: TutorApplication) => {
    if (application.rank && application.rank > 1) {
      const appsToSwap = applications.filter(
        (app) => app.rank === application.rank! - 1
      );
      if (appsToSwap.length > 0) {
        const appToMoveDown = appsToSwap[0];
        const updatedMovingUp = { ...application, rank: application.rank - 1 };
        const updatedMovingDown = {
          ...appToMoveDown,
          rank: appToMoveDown.rank! + 1,
        };
        saveApplication(updatedMovingUp);
        saveApplication(updatedMovingDown);
        loadApplications();
        showToast("Ranking updated!", "success");
      }
    }
  };

  const handleMoveDown = (application: TutorApplication) => {
    const maxRank = Math.max(...rankedApplications.map((app) => app.rank || 0));
    if (application.rank && application.rank < maxRank) {
      const appsToSwap = applications.filter(
        (app) => app.rank === application.rank! + 1
      );
      if (appsToSwap.length > 0) {
        const appToMoveUp = appsToSwap[0];
        const updatedMovingDown = {
          ...application,
          rank: application.rank + 1,
        };
        const updatedMovingUp = { ...appToMoveUp, rank: appToMoveUp.rank! - 1 };
        saveApplication(updatedMovingDown);
        saveApplication(updatedMovingUp);
        loadApplications();
        showToast("Ranking updated!", "success");
      }
    }
  };

  const handleRemoveFromRanking = (applicationId: string) => {
    const application = applications.find((app) => app.id === applicationId);
    if (application && application.rank) {
      const currentRank = application.rank;
      const updatedApplication = { ...application, rank: undefined };
      saveApplication(updatedApplication);
      const appsToUpdate = applications
        .filter((app) => app.rank && app.rank > currentRank)
        .map((app) => ({ ...app, rank: app.rank! - 1 }));
      appsToUpdate.forEach((app) => saveApplication(app));
      loadApplications();
      showToast("Applicant removed from ranking!", "success");
    }
  };

  const totalApplications = applications.length;
  const selectedTutorApplications = applications.filter(
    (app) => app.selected
  ).length;
  const pendingTutorApplications = applications.filter(
    (app) => !app.selected
  ).length;
  const selectionRate =
    totalApplications > 0
      ? Math.round((selectedTutorApplications / totalApplications) * 100)
      : 0;

  return (
    <>
      {/* <Head> // Removed Head
        <title>TeachTeam - Lecturer Portal</title>
      </Head> */}
      <main className={`flex-grow pt-24 ${styles.lecturerDashboardContainer}`}>
        {/* Existing JSX structure, class names will be updated with CSS modules later */}
        <div>
          {" "}
          {/* Removed lecturer-dashboard, container handles padding */}
          <motion.div
            className={styles.dashboardHeader}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.headerContent}>
              {" "}
              <h1 className={styles.dashboardTitle}>Lecturer Dashboard</h1>{" "}
              <p className={styles.dashboardSubtitle}>
                Welcome back, {lecturerName}
              </p>{" "}
            </div>
            <div className={styles.quickStats}>
              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.totalIcon}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Total Applications</span>
                  <span className={styles.statValue}>{totalApplications}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.selectedIcon}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Selected</span>
                  <span className={styles.statValue}>
                    {selectedTutorApplications}
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.pendingIcon}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Pending</span>
                  <span className={styles.statValue}>
                    {pendingTutorApplications}
                  </span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles.rateIcon}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Selection Rate</span>
                  <span
                    className={styles.statValue}
                  >{`${selectionRate}%`}</span>
                </div>
              </div>
            </div>
          </motion.div>
          <div className={styles.dashboardTabs}>
            {" "}
            <button
              className={`${styles.tabButton} ${activeTab === "applications" ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.tabIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Applications
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "rankings" ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab("rankings")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.tabIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Rankings
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "stats" ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.tabIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Analytics
            </button>
          </div>
          <div className={styles.dashboardContent}>
            {" "}
            {activeTab === "applications" && (
              <motion.div
                className={styles.applicationsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.filterTools}>
                  {" "}
                  <div className={styles.filterGroup}>
                    {" "}
                    <SearchInput
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search by name, course, availability, or skills..."
                      label="Search"
                      showLabel={true}
                      variant="default"
                    />
                  </div>
                  <div className={styles.filterSelects}>
                    {" "}
                    <div className={styles.filterGroup}>
                      {" "}
                      <label htmlFor="courseFilter">Course:</label>
                      <select
                        id="courseFilter"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="">All Courses</option>
                        {availableCourses.map(
                          (course: { code: string; name: string }) => (
                            <option key={course.code} value={course.code}>
                              {course.code} - {course.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className={styles.filterGroup}>
                      {" "}
                      <label htmlFor="sortBy">Sort by:</label>
                      <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="none">Default</option>
                        <option value="name">Name</option>
                        <option value="availability">Availability</option>
                        <option value="date">Date Applied</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className={styles.applicationPanels}>
                  <ApplicantList
                    applications={sortedApplications}
                    selectedApplication={selectedApplication}
                    onSelectApplication={handleSelectApplication}
                  />
                  <ApplicantDetails
                    application={selectedApplication}
                    comment={comment}
                    setComment={setComment}
                    onSelectApplicant={handleSelectApplicantButton}
                    onSaveComment={handleSaveComment}
                    onDeleteComment={handleDeleteComment}
                    onUnselectApplicant={handleUnselectApplicant}
                    onAddToRanking={handleAddToRanking}
                    showToast={showToast}
                  />
                </div>
              </motion.div>
            )}
            {activeTab === "rankings" && (
              <motion.div
                className={styles.rankingsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <RankedCandidates
                  rankedApplications={rankedApplications}
                  selectedCourse={selectedCourse}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onRemove={handleRemoveFromRanking}
                  showCourseFilter={true}
                  onCourseChange={setSelectedCourse}
                  availableCourses={availableCourses}
                />
              </motion.div>
            )}
            {activeTab === "stats" && (
              <motion.div
                className={styles.analyticsTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ApplicantStatsVisualization applications={applications} />
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}
