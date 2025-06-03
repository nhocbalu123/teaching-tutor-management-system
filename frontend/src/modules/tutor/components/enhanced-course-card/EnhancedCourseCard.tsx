import React from "react";
import { motion } from "framer-motion";
import { Course, Role, ApplicationResponse } from "@/shared/services/applicationService";
import SkillTag from "@/modules/tutor/components/skill-tag/skill-tag";
import styles from "./EnhancedCourseCard.module.css";

interface EnhancedCourseCardProps {
  course: Course;
  roles: Role[];
  myApplications: ApplicationResponse[];
  onApplyForRole: (course: Course, role: Role) => void;
}

const EnhancedCourseCard: React.FC<EnhancedCourseCardProps> = ({
  course,
  roles,
  myApplications,
  onApplyForRole,
}) => {
  // Check if user has applied for a specific role in this course
  const getApplicationStatus = (roleId: number) => {
    const application = myApplications.find(
      (app) => app.courseId === course.id && app.roleId === roleId
    );
    return application?.status || null;
  };

  // Get suggested skills for this course (you can customize this logic)
  const getSuggestedSkills = () => {
    // Basic skills based on course code
    const courseCode = course.courseCode.toLowerCase();
    if (courseCode.includes("cosc") || courseCode.includes("comp")) {
      return ["Programming", "Problem Solving", "Communication"];
    }
    return ["Teaching", "Communication", "Organization"];
  };

  return (
    <motion.div 
      className={styles.enhancedCourseCard}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <span className={styles.courseCode}>{course.courseCode}</span>
        <span className={styles.semester}>{course.semester}</span>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        <h3 className={styles.courseTitle}>{course.courseName}</h3>
        
        {course.description && (
          <p className={styles.courseDescription}>{course.description}</p>
        )}

        {/* Suggested Skills */}
        <div className={styles.skillsContainer}>
          <span className={styles.skillsLabel}>Relevant Skills:</span>
          <div className={styles.skillsWrapper}>
            {getSuggestedSkills().map((skill, index) => (
              <SkillTag key={index} skill={skill} />
            ))}
          </div>
        </div>
      </div>

      {/* Role Options */}
      <div className={styles.roleSection}>
        <h4 className={styles.roleSectionTitle}>Available Positions</h4>
        
        {roles.map((role) => {
          const applicationStatus = getApplicationStatus(role.id);
          const maxPositions = role.roleName === "tutor" ? course.maxTutors : course.maxLabAssistants;
          
          return (
            <div key={role.id} className={styles.roleOption}>
              <div className={styles.roleHeader}>
                <div className={styles.roleInfo}>
                  <div className={styles.roleIconWrapper}>
                    <div className={`${styles.roleIcon} ${
                      role.roleName === "tutor" ? styles.roleIconTutor : styles.roleIconAssistant
                    }`}>
                      {role.roleName === "tutor" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className={styles.roleDetails}>
                    <span className={styles.roleName}>
                      {role.roleName === "tutor" ? "Tutor" : "Lab Assistant"}
                    </span>
                    <span className={styles.rolePositions}>
                      {maxPositions} positions available
                    </span>
                  </div>
                </div>
                
                {/* Status or Apply Button */}
                <div className={styles.roleAction}>
                  {applicationStatus ? (
                    <div className={`${styles.statusBadge} ${styles[`status-${applicationStatus}`]}`}>
                      <div className={styles.statusIcon}>
                        {applicationStatus === "pending" && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                        {applicationStatus === "selected" && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {applicationStatus === "rejected" && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={styles.statusText}>
                        {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                      </span>
                    </div>
                  ) : (
                    <motion.button
                      className={styles.applyButton}
                      onClick={() => onApplyForRole(course, role)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply
                    </motion.button>
                  )}
                </div>
              </div>
              
              {role.description && (
                <p className={styles.roleDescription}>{role.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EnhancedCourseCard; 