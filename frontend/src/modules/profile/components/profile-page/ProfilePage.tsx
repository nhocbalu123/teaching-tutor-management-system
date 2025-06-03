"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AuthService } from "../../../../shared/services/authService";
import { User, UserType } from "../../../../shared/types/user";
import { useAuth } from "../../../auth/hooks/useAuth";
import styles from "./ProfilePage.module.css";

export const ProfilePage: React.FC = () => {
  const { user: contextUser, updateUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      // First, try to get user from context or local storage
      const savedUser = contextUser || AuthService.getUser();

      if (savedUser) {
        setUser(savedUser);
        setIsLoading(false);

        // Optionally try to fetch fresh data in the background
        try {
          const response = await AuthService.getProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
            updateUser(response.data.user);
          }
          // If API call fails, we still have the cached user data, so don't show error
        } catch (apiError) {
          console.warn(
            "Failed to fetch fresh profile data, using cached data:",
            apiError
          );
          // Don't set error state, just use cached data
        }
      } else {
        setError("Please log in to view your profile.");
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [authLoading, contextUser, updateUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getUserTypeLabel = (userType: UserType) => {
    switch (userType) {
      case UserType.CANDIDATE:
        return "Candidate";
      case UserType.LECTURER:
        return "Lecturer";
      case UserType.ADMIN:
        return "Admin";
      default:
        return "User";
    }
  };

  const getUserTypeIcon = (userType: UserType) => {
    switch (userType) {
      case UserType.CANDIDATE:
        return "🎓";
      case UserType.LECTURER:
        return "👨‍🏫";
      case UserType.ADMIN:
        return "⚙️";
      default:
        return "👤";
    }
  };

  // Function to get avatar path - same logic as user dropdown
  const getAvatarPath = (userData: User) => {
    // Generate a consistent avatar number based on email
    const emailHash = userData.email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Use lecturer images if user is a lecturer
    if (userData.userType === UserType.LECTURER) {
      return `/lecturers/lecturer-${(emailHash % 4) + 1}.jpg`;
    }

    return `/avatars/avatar-${(emailHash % 12) + 1}.jpg`;
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.loadingWrapper}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.errorWrapper}>
            <div className={styles.errorIcon}>❌</div>
            <h2 className={styles.errorTitle}>Error Loading Profile</h2>
            <p className={styles.errorMessage}>{error || "Profile information could not be loaded."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.headerContent}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                <Image
                  src={getAvatarPath(user)}
                  alt={`${user.firstName} ${user.lastName} avatar`}
                  width={120}
                  height={120}
                  className={styles.avatarImage}
                />
                <div className={styles.avatarOverlay}>
                  <span className={styles.roleIcon}>{getUserTypeIcon(user.userType)}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>
                {user.firstName} {user.lastName}
              </h1>
              <div className={styles.userRole}>
                <span className={`${styles.roleBadge} ${styles[user.userType]}`}>
                  {getUserTypeIcon(user.userType)} {getUserTypeLabel(user.userType)}
                </span>
              </div>
              <p className={styles.userEmail}>{user.email}</p>
            </div>

            <div className={styles.quickStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Member Since</span>
                <span className={styles.statValue}>{formatDate(user.createdAt)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Account Status</span>
                <span className={`${styles.statusBadge} ${user.isBlocked ? styles.blocked : styles.active}`}>
                  {user.isBlocked ? "🔒 Blocked" : "✅ Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className={styles.profileContent}>
          <div className={styles.contentGrid}>
            {/* Contact Information Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>📧</span>
                  Contact Information
                </h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email Address</span>
                  <span className={styles.infoValue}>{user.email}</span>
                </div>
                {user.phone && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Phone Number</span>
                    <span className={styles.infoValue}>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>🛠️</span>
                  Account Details
                </h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Account Type</span>
                  <span className={`${styles.roleBadge} ${styles[user.userType]} ${styles.small}`}>
                    {getUserTypeIcon(user.userType)} {getUserTypeLabel(user.userType)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Join Date</span>
                  <span className={styles.infoValue}>{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Role-Specific Information Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>{getUserTypeIcon(user.userType)}</span>
                  {getUserTypeLabel(user.userType)} Information
                </h3>
              </div>
              <div className={styles.cardContent}>
                {user.userType === UserType.CANDIDATE && (
                  <div className={styles.roleDescription}>
                    <p>As a candidate, you can apply for tutor and lab assistant positions for various courses. Browse available opportunities and submit your applications to get started.</p>
                    <div className={styles.featureList}>
                      <span className={styles.feature}>📚 Apply for teaching roles</span>
                      <span className={styles.feature}>⭐ Track application status</span>
                      <span className={styles.feature}>📊 View course opportunities</span>
                    </div>
                  </div>
                )}

                {user.userType === UserType.LECTURER && (
                  <div className={styles.roleDescription}>
                    <p>As a lecturer, you can view and manage applications for your assigned courses. Review candidate profiles and make hiring decisions.</p>
                    <div className={styles.featureList}>
                      <span className={styles.feature}>👥 Manage applications</span>
                      <span className={styles.feature}>📈 View analytics</span>
                      <span className={styles.feature}>🎯 Select candidates</span>
                    </div>
                  </div>
                )}

                {user.userType === UserType.ADMIN && (
                  <div className={styles.roleDescription}>
                    <p>As an administrator, you have full access to manage the system, courses, and users. Oversee the entire teaching application process.</p>
                    <div className={styles.featureList}>
                      <span className={styles.feature}>⚙️ System management</span>
                      <span className={styles.feature}>📋 Course administration</span>
                      <span className={styles.feature}>👥 User management</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
