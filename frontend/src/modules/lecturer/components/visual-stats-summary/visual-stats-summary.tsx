import React from "react";
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import { motion } from "framer-motion";
import styles from "./visual-stats-summary.module.css";

interface Course {
  courseCode: string;
  courseName: string;
  availableTutors?: number;
  availableLabAssistants?: number;
  maxTutors?: number;
  maxLabAssistants?: number;
}

interface VisualStatsSummaryProps {
  applications: TutorApplication[];
  courses?: Course[];
}

const VisualStatsSummary: React.FC<VisualStatsSummaryProps> = ({
  applications,
  courses = [],
}) => {
  const totalApplications = applications.length;
  const selectedApplications = applications.filter(
    (app) => app.selected
  ).length;
  const pendingApplications = totalApplications - selectedApplications;
  const selectionRate =
    totalApplications > 0
      ? Math.round((selectedApplications / totalApplications) * 100)
      : 0;

  // Calculate total available positions across all courses
  const totalAvailableTutorPositions = courses.reduce(
    (sum, course) => sum + (course.availableTutors ?? course.maxTutors ?? 0),
    0
  );
  const totalAvailableLabPositions = courses.reduce(
    (sum, course) =>
      sum + (course.availableLabAssistants ?? course.maxLabAssistants ?? 0),
    0
  );
  const totalMaxTutorPositions = courses.reduce(
    (sum, course) => sum + (course.maxTutors ?? 0),
    0
  );
  const totalMaxLabPositions = courses.reduce(
    (sum, course) => sum + (course.maxLabAssistants ?? 0),
    0
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={styles.summaryContainer}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className={styles.summaryCard}
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
      >
        <div className={`${styles.summaryIcon} ${styles.totalIcon}`}>
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div className={styles.summaryContent}>
          <span className={styles.summaryLabel}>Total Applications</span>
          <span className={styles.summaryValue}>{totalApplications}</span>
          <span className={styles.summaryDesc}>All submitted applications</span>
        </div>
      </motion.div>

      <motion.div
        className={styles.summaryCard}
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
      >
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressPercentage}>{selectionRate}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${selectionRate}%` }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.statCardsGrid} variants={itemVariants}>
        <motion.div className={styles.statCard} whileHover={{ scale: 1.02 }}>
          <div className={`${styles.summaryIcon} ${styles.selectedIcon}`}>
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
          <div className={styles.statDetails}>
            <div className={styles.statValue}>{selectedApplications}</div>
            <div className={styles.statLabel}>Selected</div>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ scale: 1.02 }}>
          <div className={`${styles.summaryIcon} ${styles.pendingIcon}`}>
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
          <div className={styles.statDetails}>
            <div className={styles.statValue}>{pendingApplications}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </motion.div>

        {courses.length > 0 && (
          <>
            <motion.div
              className={styles.statCard}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`${styles.summaryIcon} ${styles.positionIcon}`}>
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className={styles.statDetails}>
                <div className={styles.statValue}>
                  {totalAvailableTutorPositions}/{totalMaxTutorPositions}
                </div>
                <div className={styles.statLabel}>
                  Available Tutor Positions
                </div>
              </div>
            </motion.div>

            <motion.div
              className={styles.statCard}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`${styles.summaryIcon} ${styles.positionIcon}`}>
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
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div className={styles.statDetails}>
                <div className={styles.statValue}>
                  {totalAvailableLabPositions}/{totalMaxLabPositions}
                </div>
                <div className={styles.statLabel}>Available Lab Positions</div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VisualStatsSummary;
