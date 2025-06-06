import React from "react";
import { motion } from "framer-motion";
import type { CourseDetails } from "@/shared/types/courseTypes";
import CourseCard from "../course-card/course-card";
import styles from "./CourseGrid.module.css";

interface CourseGridProps {
  isLoading: boolean;
  filteredCourses: CourseDetails[];
  existingApplications: string[];
  searchQuery: string;
  activeFilter: "all" | "applied" | "available";
  onApplyToCourse: (course: CourseDetails) => void;
}

const CourseGrid: React.FC<CourseGridProps> = ({
  isLoading,
  filteredCourses,
  existingApplications,
  searchQuery,
  activeFilter,
  onApplyToCourse,
}) => {
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

  // Card count by row for animation
  const getRowStartDelay = (index: number) => {
    if (typeof window === "undefined") return 0;
    const itemsPerRow =
      window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    return Math.floor(index / itemsPerRow) * 0.1;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', color: 'var(--color-primary)' }}>
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="32"
              strokeDashoffset="32"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 12 12;360 12 12"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="strokeDasharray"
                dur="2s"
                values="0 32;16 16;0 32;0 32"
                repeatCount="indefinite"
              />
              <animate
                attributeName="strokeDashoffset"
                dur="2s"
                values="0;-16;-32;-32"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <div className={styles.noCourses}>
        <h3>No courses found</h3>
        <p>
          {searchQuery
            ? "Try adjusting your search or filters"
            : activeFilter === "applied"
              ? "You haven't applied to any courses yet"
              : "No available courses at the moment"}
        </p>
      </div>
    );
  }

  return (
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
            openApplyModal={onApplyToCourse}
            hasApplied={existingApplications.includes(course.code)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CourseGrid;
