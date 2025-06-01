import React from "react";
import type { Application as TutorApplication } from "@/shared/types/application"; // Updated
import { motion } from "framer-motion";
import styles from "./ranked-candidates.module.css";

interface RankedCandidatesProps {
  rankedApplications: TutorApplication[];
  selectedCourse: string;
  onMoveUp: (app: TutorApplication) => void;
  onMoveDown: (app: TutorApplication) => void;
  onRemove: (id: string) => void;
  title?: string;
  showCourseFilter?: boolean;
  onCourseChange?: (course: string) => void;
  availableCourses?: { code: string; name: string }[];
}

const RankedCandidates: React.FC<RankedCandidatesProps> = ({
  rankedApplications,
  selectedCourse,
  onMoveUp,
  onMoveDown,
  onRemove,
  title = "Ranked Candidates",
  showCourseFilter = false,
  onCourseChange,
  availableCourses = [],
}) => {
  const filteredRankedApplications = rankedApplications.filter((app) =>
    app.selectedForCourses
      ? app.selectedForCourses.includes(selectedCourse)
      : app.courses.includes(selectedCourse)
  );

  if (filteredRankedApplications.length === 0) {
    return (
      <div className={styles.emptyRankings}>
        <div className={styles.emptyRankingsIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className={styles.emptyRankingsTitle}>No Ranked Candidates</h3>
        <p className={styles.emptyRankingsText}>
          No candidates have been ranked for <strong>{selectedCourse}</strong>{" "}
          yet.
        </p>
        <p className={styles.emptyRankingsHelp}>
          Select and add comments to applicants to start ranking.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.rankingsContainer}>
      <h2 className={styles.rankingsTitle}>{title}</h2>

      {showCourseFilter && (
        <div className={styles.courseFilter}>
          <label htmlFor="rankingCourseFilter">Filter by Course:</label>
          <select
            id="rankingCourseFilter"
            value={selectedCourse}
            onChange={(e) => onCourseChange?.(e.target.value)}
            className={styles.filterSelect}
          >
            {availableCourses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
          <p className={styles.filterNote}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.noteIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Rankings are course-specific to avoid confusion with candidates who
            may have the same rank for different courses.
          </p>
        </div>
      )}

      <div className={styles.rankingsList}>
        {filteredRankedApplications.map((application, index) => (
          <motion.div
            key={application.id}
            className={styles.rankedItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={styles.rankBadge}>{application.rank}</div>
            <div className={styles.rankedInfo}>
              <div className={styles.rankedName}>{application.fullName}</div>
              <div className={styles.rankedCourses}>
                {application.selectedForCourses
                  ? application.selectedForCourses.join(", ")
                  : application.courses.join(", ")}
              </div>
              <div className={styles.rankedSkills}>
                {application.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className={styles.rankedSkill}>
                    {skill}
                  </span>
                ))}
                {application.skills.length > 3 && (
                  <span className={styles.moreSkills}>
                    +{application.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.rankedActions}>
              <button
                onClick={() => onMoveUp(application)}
                className={`${styles.rankBtn} ${styles.moveUpBtn}`}
                disabled={application.rank === 1}
                title="Move up"
              >
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
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => onMoveDown(application)}
                className={`${styles.rankBtn} ${styles.moveDownBtn}`}
                disabled={
                  application.rank === filteredRankedApplications.length
                }
                title="Move down"
              >
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => onRemove(application.id)}
                className={`${styles.rankBtn} ${styles.removeBtn}`}
                title="Remove from ranking"
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
        <div className={styles.rankingsNote}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={styles.noteIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Rankings can be reordered by using the up/down arrows. Remove
          candidates from rankings if they are no longer suitable.
        </div>
      </div>
    </div>
  );
};

export default RankedCandidates;
