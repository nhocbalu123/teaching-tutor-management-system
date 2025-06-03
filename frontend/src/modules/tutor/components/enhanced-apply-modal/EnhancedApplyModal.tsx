import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Course, Role, ApplicationData } from "@/shared/services/applicationService";
import SkillTag from "@/modules/tutor/components/skill-tag/skill-tag";
import styles from "./EnhancedApplyModal.module.css";

interface EnhancedApplyModalProps {
  isOpen: boolean;
  course: Course | null;
  role: Role | null;
  onClose: () => void;
  onSubmit: (applicationData: ApplicationData) => void;
  isSubmitting?: boolean;
}

const EnhancedApplyModal: React.FC<EnhancedApplyModalProps> = ({
  isOpen,
  course,
  role,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  // Form state
  const [availability, setAvailability] = useState<"Part Time" | "Full Time">("Part Time");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [selectedSkillTags, setSelectedSkillTags] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{
    skills?: string;
    motivation?: string;
    experience?: string;
  }>({});

  // Popular skills based on role
  const getPopularSkills = (roleName?: string) => {
    if (roleName === "tutor") {
      return ["Teaching", "Communication", "Subject Knowledge", "Patience", "Problem Solving"];
    } else if (roleName === "lab_assistant") {
      return ["Technical Support", "Laboratory Skills", "Equipment Handling", "Student Assistance", "Safety Protocols"];
    }
    return ["Teaching", "Communication", "Organization", "Technical Skills", "Leadership"];
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAvailability("Part Time");
      setSkills("");
      setExperience("");
      setMotivation("");
      setSelectedSkillTags([]);
      setCustomSkillInput("");
      setErrors({});
    }
  }, [isOpen]);

  const handleAddSkillTag = (skill: string) => {
    if (skill.trim() && !selectedSkillTags.includes(skill.trim()) && selectedSkillTags.length < 5) {
      setSelectedSkillTags([...selectedSkillTags, skill.trim()]);
      setCustomSkillInput("");
      // Update the skills text area
      const updatedSkills = [...selectedSkillTags, skill.trim()].join(", ");
      setSkills(updatedSkills);
    }
  };

  const handleRemoveSkillTag = (skillToRemove: string) => {
    const updatedTags = selectedSkillTags.filter(skill => skill !== skillToRemove);
    setSelectedSkillTags(updatedTags);
    setSkills(updatedTags.join(", "));
  };

  const handleSkillsTextChange = (value: string) => {
    setSkills(value);
    // Parse skills from text and update tags
    const skillArray = value.split(",").map(s => s.trim()).filter(s => s.length > 0);
    setSelectedSkillTags(skillArray.slice(0, 5)); // Limit to 5 skills
  };

  const validateForm = (): boolean => {
    const newErrors: {
      skills?: string;
      motivation?: string;
      experience?: string;
    } = {};

    // Skills validation
    if (!skills.trim()) {
      newErrors.skills = "Skills are required";
    } else if (skills.trim().length < 10) {
      newErrors.skills = "Skills description must be at least 10 characters";
    }

    // Motivation validation
    if (!motivation.trim()) {
      newErrors.motivation = "Motivation is required";
    } else if (motivation.trim().length < 20) {
      newErrors.motivation = "Motivation must be at least 20 characters";
    }

    // Experience validation (optional but if provided, minimum length)
    if (experience && experience.trim().length > 0 && experience.trim().length < 10) {
      newErrors.experience = "Experience description must be at least 10 characters if provided";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!course || !role) return;

    if (!validateForm()) return;

    const applicationData: ApplicationData = {
      courseId: course.id,
      roleId: role.id,
      availability,
      skills: skills.trim(),
      experience: experience.trim() || undefined,
      motivation: motivation.trim(),
    };

    onSubmit(applicationData);
  };

  if (!isOpen || !course || !role) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>Apply for Position</h2>
              <button 
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                disabled={isSubmitting}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Course and Role Info */}
            <div className={styles.infoSection}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Course</label>
                  <div className={styles.infoValue}>
                    <span className={styles.courseCode}>{course.courseCode}</span>
                    <span className={styles.courseName}>{course.courseName}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Role</label>
                  <div className={styles.infoValue}>
                    <div className={styles.roleDisplay}>
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
                      <span className={styles.roleName}>
                        {role.roleName === "tutor" ? "Tutor" : "Lab Assistant"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Selection */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Availability *</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="availability"
                    value="Part Time"
                    checked={availability === "Part Time"}
                    onChange={(e) => setAvailability(e.target.value as "Part Time" | "Full Time")}
                    disabled={isSubmitting}
                  />
                  <span className={styles.radioText}>Part Time</span>
                  <span className={styles.radioDescription}>Up to 20 hours per week</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="availability"
                    value="Full Time"
                    checked={availability === "Full Time"}
                    onChange={(e) => setAvailability(e.target.value as "Part Time" | "Full Time")}
                    disabled={isSubmitting}
                  />
                  <span className={styles.radioText}>Full Time</span>
                  <span className={styles.radioDescription}>More than 20 hours per week</span>
                </label>
              </div>
            </div>

            {/* Skills */}
            <div className={styles.fieldGroup}>
              <label htmlFor="skills" className={styles.label}>
                Skills * <span className={styles.hint}>(minimum 10 characters)</span>
              </label>
              
              {/* Skill Tags */}
              {selectedSkillTags.length > 0 && (
                <div className={styles.skillTags}>
                  {selectedSkillTags.map((skill, index) => (
                    <SkillTag
                      key={index}
                      skill={skill}
                      onRemove={handleRemoveSkillTag}
                    />
                  ))}
                </div>
              )}

              {/* Popular Skills */}
              <div className={styles.popularSkills}>
                <span className={styles.popularSkillsLabel}>Quick add:</span>
                <div className={styles.popularSkillButtons}>
                  {getPopularSkills(role?.roleName).map((skill, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`${styles.skillButton} ${
                        selectedSkillTags.includes(skill) ? styles.skillButtonSelected : ""
                      }`}
                      onClick={() => handleAddSkillTag(skill)}
                      disabled={selectedSkillTags.includes(skill) || selectedSkillTags.length >= 5 || isSubmitting}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className={styles.customSkillInput}>
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkillTag(customSkillInput);
                    }
                  }}
                  placeholder="Add custom skill (press Enter)"
                  className={styles.skillInput}
                  disabled={selectedSkillTags.length >= 5 || isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => handleAddSkillTag(customSkillInput)}
                  className={styles.addSkillButton}
                  disabled={!customSkillInput.trim() || selectedSkillTags.length >= 5 || isSubmitting}
                >
                  Add
                </button>
              </div>

              {/* Skills Textarea */}
              <textarea
                id="skills"
                value={skills}
                onChange={(e) => handleSkillsTextChange(e.target.value)}
                placeholder="Describe your relevant skills and expertise..."
                className={`${styles.textarea} ${errors.skills ? styles.textareaError : ""}`}
                rows={3}
                disabled={isSubmitting}
                required
              />
              {errors.skills && (
                <span className={styles.errorText}>{errors.skills}</span>
              )}
            </div>

            {/* Experience */}
            <div className={styles.fieldGroup}>
              <label htmlFor="experience" className={styles.label}>
                Previous Experience <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Describe any relevant teaching, tutoring, or related experience..."
                className={`${styles.textarea} ${errors.experience ? styles.textareaError : ""}`}
                rows={3}
                disabled={isSubmitting}
              />
              {errors.experience && (
                <span className={styles.errorText}>{errors.experience}</span>
              )}
            </div>

            {/* Motivation */}
            <div className={styles.fieldGroup}>
              <label htmlFor="motivation" className={styles.label}>
                Why do you want this role? * <span className={styles.hint}>(minimum 20 characters)</span>
              </label>
              <textarea
                id="motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Explain your motivation for applying to this role and what you hope to contribute..."
                className={`${styles.textarea} ${errors.motivation ? styles.textareaError : ""}`}
                rows={4}
                disabled={isSubmitting}
                required
              />
              {errors.motivation && (
                <span className={styles.errorText}>{errors.motivation}</span>
              )}
            </div>

            {/* Form Actions */}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className={styles.spinner} viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="32"
                        strokeDashoffset="32"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          values="0 12 12;360 12 12"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedApplyModal; 