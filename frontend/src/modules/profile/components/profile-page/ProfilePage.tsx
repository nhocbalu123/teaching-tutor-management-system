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
      <div className={styles.profileContainer}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.errorWrapper}>
          <div className={styles.errorIcon}>❌</div>
          <h2 className={styles.errorTitle}>Error Loading Profile</h2>
          <p className={styles.errorMessage}>{error || "Profile information could not be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileGrid}>
        {/* Left Panel - User Information */}
        <div className={styles.userPanel}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <Image
                src={getAvatarPath(user)}
                alt={`${user.firstName} ${user.lastName} avatar`}
                width={120}
                height={120}
                className={styles.avatarImage}
              />
              <div className={styles.roleIndicator}>
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
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Member Since</span>
                <span className={styles.statValue}>{formatDate(user.createdAt)}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                {user.isBlocked ? "🔒" : "✅"}
              </div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Status</span>
                <span className={`${styles.statusBadge} ${user.isBlocked ? styles.blocked : styles.active}`}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Information Cards */}
        <div className={styles.infoPanel}>
          {/* Account Information */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🛠️</div>
              <h3 className={styles.cardTitle}>Account Information</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Account Type</span>
                  <span className={styles.infoValue}>{getUserTypeLabel(user.userType)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Username</span>
                  <span className={styles.infoValue}>{user.firstName} {user.lastName}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Join Date</span>
                  <span className={styles.infoValue}>{formatDate(user.createdAt)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role-Specific Information */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>{getUserTypeIcon(user.userType)}</div>
              <h3 className={styles.cardTitle}>Role Details</h3>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.roleDescription}>
                Explore and apply for tutor and lab assistant positions across various courses.
              </p>
              <div className={styles.actionButton}>
                <a href="/tutor" className={styles.primaryButton}>
                  View Opportunities
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
