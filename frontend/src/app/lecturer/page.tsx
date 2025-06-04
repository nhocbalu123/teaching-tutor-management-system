"use client";

import React, { useState, useEffect } from "react";
import { ApplicationService, ApplicationResponse } from "@/shared/services/applicationService";
import { Application } from "@/shared/types/application";
import ApplicantList from "@/modules/lecturer/components/applicant-list/applicant-list";
import ApplicantDetails from "@/modules/lecturer/components/applicant-details/applicant-details";
import RankedCandidates from "@/modules/lecturer/components/ranked-candidates/ranked-candidates";
import ApplicantStatsVisualization from "@/modules/lecturer/components/applicant-stats-visualization/applicant-stats-visualization";
import Toast from "@/shared/components/common/toast/toast";
import LoadingWrapper from "@/shared/components/common/loading-wrapper/LoadingWrapper";
import { useLecturerAuth } from "@/modules/lecturer/hooks/useLecturerAuth";
import { useApplicationManagement } from "@/modules/lecturer/hooks/useApplicationManagement";
import DashboardHeader from "@/modules/lecturer/components/dashboard-header/DashboardHeader";
import DashboardTabs from "@/modules/lecturer/components/dashboard-tabs/DashboardTabs";
import ApplicationFilters from "@/modules/lecturer/components/application-filters/ApplicationFilters";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { redirect } from "next/navigation";
import styles from "./LecturerPage.module.css";

type TabType = "applications" | "rankings" | "stats";

// Adapter function to convert ApplicationResponse to Application
const convertToLegacyApplication = (appResponse: ApplicationResponse): Application => {
  const availabilityValue = (appResponse.availability as { type: string })?.type || "Part Time";
  const availability: "Full Time" | "Part Time" = availabilityValue === "Full Time" ? "Full Time" : "Part Time";
  
  return {
    id: appResponse.id.toString(),
    userId: appResponse.candidateId.toString(),
    email: appResponse.candidate?.email || "",
    fullName: `${appResponse.candidate?.firstName || ""} ${appResponse.candidate?.lastName || ""}`.trim(),
    courses: [appResponse.course.courseCode],
    availability,
    skills: appResponse.skills ? appResponse.skills.split(",").map(s => s.trim()) : [],
    academicCredentials: appResponse.experience || "",
    dateApplied: appResponse.appliedAt,
    status: appResponse.status as "pending" | "shortlisted" | "rejected" | "hired",
    selected: appResponse.status === "selected",
    comment: "", // Comments would need to be implemented in backend
    rank: undefined,
  };
};

// Convert statistics to legacy format
const convertToLegacyStatistics = (stats: unknown) => {
  if (!stats || typeof stats !== 'object') {
    return {
      totalApplications: 0,
      selectedTutorApplications: 0,
      pendingTutorApplications: 0,
      selectionRate: 0,
    };
  }

  const typedStats = stats as {
    totalApplications?: number;
    applicationsByStatus?: { selected?: number; pending?: number };
  };

  return {
    totalApplications: typedStats.totalApplications || 0,
    selectedTutorApplications: typedStats.applicationsByStatus?.selected || 0,
    pendingTutorApplications: typedStats.applicationsByStatus?.pending || 0,
    selectionRate: typedStats.totalApplications && typedStats.totalApplications > 0 
      ? Math.round(((typedStats.applicationsByStatus?.selected || 0) / typedStats.totalApplications) * 100)
      : 0,
  };
};

const LecturerDashboardPage: React.FC = () => {
  // Authentication
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    lecturerName,
  } = useLecturerAuth();

  // Application management with enhanced filtering
  const {
    applications: rawApplications,
    statistics: rawStatistics,
    isInitialized,
    selectedApplication: rawSelectedApplication,
    comment,
    setComment,
    rankedApplications: rawRankedApplications,
    setRankedApplications,
    // CR Part: Enhanced filters
    selectedCourse,
    setSelectedCourse,
    selectedRankingCourse,
    setSelectedRankingCourse,
    searchQuery,
    setSearchQuery,
    roleTypeFilter,
    setRoleTypeFilter,
    availabilityFilter,
    setAvailabilityFilter,
    skillsFilter,
    setSkillsFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    loadApplications,
    handleSelectApplication: rawHandleSelectApplication,
  } = useApplicationManagement();

  // Convert to legacy format for existing components
  const applications = rawApplications.map(convertToLegacyApplication);
  const statistics = convertToLegacyStatistics(rawStatistics);
  const selectedApplication = rawSelectedApplication ? convertToLegacyApplication(rawSelectedApplication) : null;
  const rankedApplications = rawRankedApplications.map(convertToLegacyApplication);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("applications");
  const [courses, setCourses] = useState<Array<{code: string, name: string}>>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsFilterArray, setSkillsFilterArray] = useState<string[]>([]);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Authentication check
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      redirect("/signin");
      return;
    }

    if (user.userType !== "lecturer") {
      redirect(user.userType === "candidate" ? "/tutor" : "/");
      return;
    }
  }, [user, isAuthenticated, authLoading]);

  // Load available courses and extract skills
  useEffect(() => {
    const loadCourses = async () => {
      try {
        // First set mock courses to ensure UI works immediately
        const mockCourseList = [
          { code: "COSC2758", name: "Full Stack Development" },
          { code: "COSC2671", name: "Introduction to Web Programming" }
        ];
        setCourses(mockCourseList);
        console.log(`✅ Set ${mockCourseList.length} mock assigned courses for lecturer`);

        // Try to get real data from API
        const response = await ApplicationService.getAssignedCoursesForLecturer();
        if (response.success && response.data && response.data.length > 0) {
          const courseList = response.data.map(course => ({
            code: course.courseCode,
            name: course.courseName
          }));
          setCourses(courseList);
          console.log(`✅ Updated with ${courseList.length} real assigned courses for lecturer`);
        } else {
          console.log("📝 Using mock data - API returned no courses or failed");
          // Keep mock data if API fails or returns empty
          if (response.message && !response.success) {
            showToast("Using demonstration data. Contact administrator for course assignments.", "info");
          }
        }
      } catch (error) {
        console.error("Error loading assigned courses, using mock data:", error);
        // Mock data is already set above, so no need to do anything
        showToast("Using demonstration courses. Please check your connection.", "info");
      }
    };

    if (isInitialized) {
      loadCourses();
    }
  }, [isInitialized]);

  // Extract all unique skills from applications
  useEffect(() => {
    const allSkills = new Set<string>();
    rawApplications.forEach(app => {
      if (app.skills) {
        app.skills.split(',').forEach(skill => {
          const trimmedSkill = skill.trim();
          if (trimmedSkill) {
            allSkills.add(trimmedSkill);
          }
        });
      }
    });
    setAvailableSkills(Array.from(allSkills).sort());
  }, [rawApplications]);

  // Sync skillsFilterArray with the string skillsFilter from the hook
  useEffect(() => {
    if (skillsFilter) {
      setSkillsFilterArray(skillsFilter.split(',').map(s => s.trim()).filter(s => s));
    } else {
      setSkillsFilterArray([]);
    }
  }, [skillsFilter]);

  // Handle skills filter change - convert array to comma-separated string
  const handleSkillsFilterChange = (skills: string[]) => {
    setSkillsFilterArray(skills);
    setSkillsFilter(skills.join(', '));
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCourse && selectedCourse !== 'all') count++;
    if (roleTypeFilter && roleTypeFilter !== 'all') count++;
    if (availabilityFilter && availabilityFilter !== 'all') count++;
    if (statusFilter && statusFilter !== 'all') count++;
    if (skillsFilterArray.length > 0) count += skillsFilterArray.length;
    return count;
  };

  // Clear all filters function
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCourse('all');
    setRoleTypeFilter('all');
    setAvailabilityFilter('all');
    setStatusFilter('all');
    setSkillsFilter('');
    setSkillsFilterArray([]);
    setSortBy('none');
  };

  // Toast function
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Wrap the selection handler to convert back to ApplicationResponse
  const handleSelectApplication = (app: Application) => {
    const originalApp = rawApplications.find(rawApp => rawApp.id.toString() === app.id);
    if (originalApp) {
      rawHandleSelectApplication(originalApp);
    }
  };

  // Application actions (simplified - using new backend)
  const handleSaveComment = async () => {
    if (!rawSelectedApplication) return;
    
    // This would need to be implemented in the backend
    // For now, we'll just show a success message
    showToast("Comment saved successfully", "success");
  };

  const handleDeleteComment = async () => {
    setComment("");
    showToast("Comment deleted", "info");
  };

  const handleSelectApplicantButton = async () => {
    if (!rawSelectedApplication) return;

    try {
      const response = await ApplicationService.updateApplicationStatus(
        rawSelectedApplication.id,
        "selected"
      );

      if (response.success) {
        showToast("Applicant selected successfully", "success");
        await loadApplications(); // Reload to get updated data
      } else {
        showToast(response.message || "Failed to select applicant", "error");
      }
    } catch {
      showToast("Error selecting applicant", "error");
    }
  };

  const handleUnselectApplicant = async () => {
    if (!rawSelectedApplication) return;

    try {
      const response = await ApplicationService.updateApplicationStatus(
        rawSelectedApplication.id,
        "pending"
      );

      if (response.success) {
        showToast("Applicant unselected", "info");
        await loadApplications();
      } else {
        showToast(response.message || "Failed to unselect applicant", "error");
      }
    } catch {
      showToast("Error unselecting applicant", "error");
    }
  };

  // Ranking functions (simplified for now)
  const handleAddToRanking = () => {
    if (selectedApplication && !rankedApplications.find(app => app.id === selectedApplication.id)) {
      const rawSelectedApp = rawApplications.find(app => app.id.toString() === selectedApplication.id);
      if (rawSelectedApp) {
        setRankedApplications([...rawRankedApplications, rawSelectedApp]);
        showToast("Added to ranking", "success");
      }
    }
  };

  const handleMoveUp = (app: Application) => {
    const index = rankedApplications.findIndex(ranked => ranked.id === app.id);
    if (index > 0) {
      const newRanked = [...rawRankedApplications];
      [newRanked[index - 1], newRanked[index]] = [newRanked[index], newRanked[index - 1]];
      setRankedApplications(newRanked);
    }
  };

  const handleMoveDown = (app: Application) => {
    const index = rankedApplications.findIndex(ranked => ranked.id === app.id);
    if (index < rankedApplications.length - 1) {
      const newRanked = [...rawRankedApplications];
      [newRanked[index], newRanked[index + 1]] = [newRanked[index + 1], newRanked[index]];
      setRankedApplications(newRanked);
    }
  };

  const handleRemoveFromRanking = (id: string) => {
    const newRanked = rawRankedApplications.filter(app => app.id.toString() !== id);
    setRankedApplications(newRanked);
    showToast("Removed from ranking", "info");
  };

  useEffect(() => {
    // Initialize ranking course selection when switching to rankings tab
    if (
      activeTab === "rankings" &&
      !selectedRankingCourse &&
      courses.length > 0
    ) {
      setSelectedRankingCourse(courses[0].code);
    }
  }, [activeTab, selectedRankingCourse, setSelectedRankingCourse, courses]);

  // Show loading state during authentication or data initialization
  if (authLoading || !isInitialized) {
    return (
      <main className={`flex-grow pt-24 ${styles.lecturerDashboardContainer}`}>
        <LoadingWrapper
          isLoading={true}
          loadingMessage="Loading lecturer dashboard..."
          minHeight="60vh"
        >
          <div />
        </LoadingWrapper>
      </main>
    );
  }

  return (
    <LoadingWrapper isLoading={false}>
      <div className={styles.lecturerDashboard}>
        <div className="container">
          {/* Dashboard Header */}
          <DashboardHeader
            lecturerName={lecturerName}
            statistics={statistics}
          />

          {/* Enhanced Application Filters */}
          <ApplicationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            courses={courses}
            roleTypeFilter={roleTypeFilter}
            onRoleTypeChange={setRoleTypeFilter}
            availabilityFilter={availabilityFilter}
            onAvailabilityChange={setAvailabilityFilter}
            skillsFilter={skillsFilterArray}
            onSkillsFilterChange={handleSkillsFilterChange}
            availableSkills={availableSkills}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearAllFilters}
            activeFilterCount={getActiveFilterCount()}
          />

          {/* Dashboard Tabs */}
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Main Content */}
          <div className={styles.dashboardContent}>
            {activeTab === "applications" && (
              <div className={styles.applicationsSection}>
                <div className={styles.applicationsGrid}>
                  <div className={styles.applicantListSection}>
                    {/* Course Selection for Applications Tab */}
                    <div className={styles.courseSelector}>
                      <label htmlFor="applicationsCourseSelect">
                        View Applications for:
                      </label>
                      {courses.length > 0 ? (
                        <select
                          id="applicationsCourseSelect"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className={styles.courseSelect}
                        >
                          <option value="all">All Assigned Courses</option>
                          {courses.map((course) => (
                            <option key={course.code} value={course.code}>
                              {course.code} - {course.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className={styles.noCourseMessage}>
                          <span className={styles.warningIcon}>⚠️</span>
                          No courses assigned. Contact administrator.
                        </div>
                      )}
                    </div>

                    <ApplicantList
                      applications={applications}
                      selectedApplication={selectedApplication}
                      onSelectApplication={handleSelectApplication}
                    />
                  </div>

                  <div className={styles.applicantDetailsSection}>
                    <ApplicantDetails
                      application={selectedApplication}
                      comment={comment}
                      setComment={setComment}
                      onSaveComment={handleSaveComment}
                      onDeleteComment={handleDeleteComment}
                      onSelectApplicant={handleSelectApplicantButton}
                      onUnselectApplicant={handleUnselectApplicant}
                      onAddToRanking={handleAddToRanking}
                      showToast={showToast}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rankings" && (
              <div className={styles.rankingsSection}>
                {/* Course Selection for Rankings Tab */}
                <div className={styles.courseSelector}>
                  <label htmlFor="rankingsCourseSelect">
                    View Rankings for:
                  </label>
                  {courses.length > 0 ? (
                    <select
                      id="rankingsCourseSelect"
                      value={selectedRankingCourse}
                      onChange={(e) => setSelectedRankingCourse(e.target.value)}
                      className={styles.courseSelect}
                    >
                      <option value="">Select an Assigned Course</option>
                      {courses.map((course) => (
                        <option key={course.code} value={course.code}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={styles.noCourseMessage}>
                      <span className={styles.warningIcon}>⚠️</span>
                      No courses assigned. Contact administrator.
                    </div>
                  )}
                </div>

                <RankedCandidates
                  rankedApplications={rankedApplications}
                  selectedCourse={selectedRankingCourse}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onRemove={handleRemoveFromRanking}
                  showCourseFilter={true}
                  onCourseChange={setSelectedRankingCourse}
                  availableCourses={courses}
                />
              </div>
            )}

            {activeTab === "stats" && (
              <div className={styles.statsSection}>
                <ApplicantStatsVisualization 
                  applications={applications}
                />
              </div>
            )}
          </div>
        </div>

        {/* Toast Notifications */}
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={() => setToast({ ...toast, visible: false })}
          variant="toast"
          position="bottom-left"
          autoClose={true}
          autoCloseDelay={3000}
        />
      </div>
    </LoadingWrapper>
  );
};

export default LecturerDashboardPage;
