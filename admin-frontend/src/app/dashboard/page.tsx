"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { GET_USER_STATS, GET_ALL_COURSES } from "@/lib/graphql/queries";
import {
    UsersIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import styles from "./admin-dashboard.module.css";
import { useToast } from "@/shared/hooks/useToast";
import Toast from "@/shared/components/common/Toast/Toast";

export default function Dashboard() {
    const { data: userStats, loading: userStatsLoading } =
        useQuery(GET_USER_STATS);
    const { data: coursesData, loading: coursesLoading } =
        useQuery(GET_ALL_COURSES);
    
    // Toast functionality
    const { toast, showSuccess, showError, showInfo, showWarning, hideToast } = useToast();

    const stats = [
        {
            name: "Total Applications",
            value: userStats?.getUserStats?.totalUsers || 0,
            icon: UsersIcon,
            color: "total",
            trend: "+12%",
        },
        {
            name: "Selected",
            value: userStats?.getUserStats?.totalCandidates || 0,
            icon: UserGroupIcon,
            color: "selected",
            trend: "+8%",
        },
        {
            name: "Pending",
            value: userStats?.getUserStats?.totalLecturers || 0,
            icon: AcademicCapIcon,
            color: "pending",
            trend: "+5%",
        },
        {
            name: "Selection Rate",
            value: userStats?.getUserStats?.blockedUsers ? 
                `${Math.round((userStats.getUserStats.totalCandidates / userStats.getUserStats.totalUsers * 100) || 0)}%` :
                "0%",
            icon: ExclamationTriangleIcon,
            color: "rate",
            trend: "-2%",
        },
    ];

    const courses = coursesData?.getAllCourses || [];



    return (
        <div className={styles.adminDashboard}>
            <div className={styles.dashboardContainer}>
                {/* Header Section */}
                <div className={styles.headerSection}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Admin Dashboard</h1>
                        <p className={styles.subtitle}>
                            Welcome to the Teaching Tutor administration panel
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    {stats.map((stat) => (
                        <div
                            key={stat.name}
                            className={`${styles.statCard} ${
                                styles[stat.color]
                            }`}
                        >
                            <div className={styles.statContent}>
                                <div className={styles.statIconWrapper}>
                                    <stat.icon className={styles.statIcon} />
                                </div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statHeader}>
                                        <h3 className={styles.statValue}>
                                            {userStatsLoading ? (
                                                <div
                                                    className={
                                                        styles.loadingSkeleton
                                                    }
                                                ></div>
                                            ) : (
                                                stat.value
                                            )}
                                        </h3>
                                    </div>
                                    <p className={styles.statLabel}>
                                        {stat.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className={styles.contentGrid}>
                    {/* Courses Overview */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>
                                Courses Overview
                            </h3>
                            <div className={styles.cardBadge}>
                                {courses.length} Total
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            {coursesLoading ? (
                                <div className={styles.loadingContainer}>
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={styles.loadingItem}
                                        >
                                            <div
                                                className={
                                                    styles.loadingSkeleton
                                                }
                                            ></div>
                                            <div
                                                className={
                                                    styles.loadingSkeletonSmall
                                                }
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.coursesList}>
                                    {courses.slice(0, 5).map((course: any) => (
                                        <div
                                            key={course.id}
                                            className={styles.courseItem}
                                        >
                                            <div className={styles.courseInfo}>
                                                <h4
                                                    className={
                                                        styles.courseTitle
                                                    }
                                                >
                                                    {course.courseCode} -{" "}
                                                    {course.courseName}
                                                </h4>
                                                <p
                                                    className={
                                                        styles.courseSemester
                                                    }
                                                >
                                                    {course.semester}
                                                </p>
                                            </div>
                                            <div className={styles.courseStats}>
                                                <div
                                                    className={
                                                        styles.courseStat
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.courseStatValue
                                                        }
                                                    >
                                                        {course
                                                            .courseAssignments
                                                            ?.length || 0}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.courseStatLabel
                                                        }
                                                    >
                                                        lecturers
                                                    </span>
                                                </div>
                                                <div
                                                    className={
                                                        styles.courseStat
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.courseStatValue
                                                        }
                                                    >
                                                        {course.applications
                                                            ?.length || 0}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.courseStatLabel
                                                        }
                                                    >
                                                        applications
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {courses.length === 0 && (
                                        <div className={styles.emptyState}>
                                            <AcademicCapIcon
                                                className={styles.emptyIcon}
                                            />
                                            <p className={styles.emptyText}>
                                                No courses available
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Quick Actions</h3>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.actionsList}>
                                <Link
                                    href="/dashboard/users"
                                    className={styles.actionItem}
                                >
                                    <div className={styles.actionIcon}>
                                        <UsersIcon
                                            className={styles.actionIconSvg}
                                        />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <h4 className={styles.actionTitle}>
                                            Manage Users
                                        </h4>
                                        <p className={styles.actionDescription}>
                                            Block/unblock and delete users
                                        </p>
                                    </div>
                                    <div className={styles.actionArrow}>→</div>
                                </Link>
                                <Link
                                    href="/dashboard/courses"
                                    className={styles.actionItem}
                                >
                                    <div className={styles.actionIcon}>
                                        <AcademicCapIcon
                                            className={styles.actionIconSvg}
                                        />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <h4 className={styles.actionTitle}>
                                            Manage Courses
                                        </h4>
                                        <p className={styles.actionDescription}>
                                            CRUD courses and assign lecturers
                                        </p>
                                    </div>
                                    <div className={styles.actionArrow}>→</div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Toast Demo */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Toast Notifications Demo</h3>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.actionsList}>
                                <button
                                    onClick={() => showSuccess("Operation completed successfully!")}
                                    className={`${styles.actionItem} ${styles.actionButton}`}
                                    style={{background: 'rgb(240, 253, 244)', border: '1px solid rgb(34, 197, 94)'}}
                                >
                                    <div className={styles.actionContent}>
                                        <h4 className={styles.actionTitle} style={{color: 'rgb(34, 197, 94)'}}>
                                            Success Toast
                                        </h4>
                                        <p className={styles.actionDescription}>
                                            Show a success notification
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => showError("Something went wrong!")}
                                    className={`${styles.actionItem} ${styles.actionButton}`}
                                    style={{background: 'rgb(254, 242, 242)', border: '1px solid rgb(239, 68, 68)'}}
                                >
                                    <div className={styles.actionContent}>
                                        <h4 className={styles.actionTitle} style={{color: 'rgb(239, 68, 68)'}}>
                                            Error Toast
                                        </h4>
                                        <p className={styles.actionDescription}>
                                            Show an error notification
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => showInfo("Here's some useful information!")}
                                    className={`${styles.actionItem} ${styles.actionButton}`}
                                    style={{background: 'rgb(239, 246, 255)', border: '1px solid rgb(59, 130, 246)'}}
                                >
                                    <div className={styles.actionContent}>
                                        <h4 className={styles.actionTitle} style={{color: 'rgb(59, 130, 246)'}}>
                                            Info Toast
                                        </h4>
                                        <p className={styles.actionDescription}>
                                            Show an info notification
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => showWarning("Please check your input!")}
                                    className={`${styles.actionItem} ${styles.actionButton}`}
                                    style={{background: 'rgb(255, 251, 235)', border: '1px solid rgb(245, 158, 11)'}}
                                >
                                    <div className={styles.actionContent}>
                                        <h4 className={styles.actionTitle} style={{color: 'rgb(245, 158, 11)'}}>
                                            Warning Toast
                                        </h4>
                                        <p className={styles.actionDescription}>
                                            Show a warning notification
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toast Notification */}
                <Toast
                    message={toast.message}
                    visible={toast.visible}
                    type={toast.type}
                    onClose={hideToast}
                    position="top-right"
                    variant="toast"
                />
            </div>
        </div>
    );
}
