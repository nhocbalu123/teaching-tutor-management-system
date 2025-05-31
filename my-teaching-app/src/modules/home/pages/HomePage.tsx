"use client";
// filepath: c:\s3978302\Full Stack Development\s3959931-s3978302-a2\my-teaching-app\src\modules\home\pages\HomePage.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { lecturers } from "@/modules/lecturer/utils/lecturerDisplay.utils";
import styles from "./HomePage.module.css";
import TimelineSection from "../components/timeline-section/TimelineSection";
import LecturerShowcase from "../components/lecturer-showcase/LecturerShowcase";
import Modal from "@/shared/components/common/modal/Modal";
import type { Lecturer } from "@/shared/types/lecturer";
import HeroSection from "../components/hero-section/HeroSection";

export default function HomePage() {
  const [activeLecturer, setActiveLecturer] = useState<Lecturer | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("currentUser");
        if (user) {
          const userData = JSON.parse(user);
          setIsLoggedIn(true);
          setUserRole(userData.role);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      }
    };
    checkLoginStatus();
  }, []);

  const handleOpenLecturerModal = (lecturerId: string): void => {
    const lecturer = lecturers.find((l) => l.id === lecturerId);
    if (lecturer) setActiveLecturer(lecturer);
  };

  const handleCloseModal = (): void => {
    setActiveLecturer(null);
  };

  const currentLecturerDetails = activeLecturer
    ? lecturers.find((l) => l.id === activeLecturer.id)
    : null;
  const activeLecturerImageIndex = activeLecturer
    ? lecturers.findIndex((l) => l.id === activeLecturer.id)
    : -1;

  return (
    <>
      <main className="flex-grow pt-24">
        <HeroSection />

        <TimelineSection isLoggedIn={isLoggedIn} userRole={userRole} />

        <LecturerShowcase
          lecturers={lecturers}
          onOpenLecturerModal={handleOpenLecturerModal}
        />

        {/* Lecturer Section */}
        <section
          className={`${styles.section} py-16`}
          style={{ backgroundColor: "var(--color-bg-primary)" }}
        >
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              {/* Section title with decorative bar */}
              <div className={styles.sectionTitleContainer}>
                <div className={styles.sectionTitleBar}></div>
                <div className={styles.sectionTitleContent}>
                  <h2>Meet Our Lecturers</h2>
                  <p>
                    Meet our exceptional team of computer science lecturers who
                    bring real-world experience and academic excellence to our
                    programs.
                  </p>
                </div>
              </div>

              {/* Lecturer Grid */}
              <div className={styles.lecturerGrid}>
                {lecturers.map((lecturer, index) => (
                  <div
                    key={lecturer.id}
                    className={`${styles.lecturerCard} lecturer${index + 1}`}
                    onClick={() => handleOpenLecturerModal(lecturer.id)}
                  >
                    <div>
                      <div className={styles.lecturerImageContainer}>
                        <Image
                          src={`/lecturers/lecturer-${index + 1}.jpg`}
                          alt={lecturer.name}
                          width={200}
                          height={200}
                          className={styles.lecturerImage}
                        />
                        <div className={styles.lecturerDecoration}></div>
                      </div>
                      <h3 className={styles.lecturerName}>{lecturer.name}</h3>
                      <p className={styles.lecturerTitle}>{lecturer.title}</p>
                      <p className={styles.lecturerSpecialization}>
                        {lecturer.specialization}
                      </p>
                    </div>
                    <button className={styles.moreInfoBtn}>
                      More Information
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {currentLecturerDetails && (
          <Modal
            isOpen={!!activeLecturer}
            onClose={handleCloseModal}
            maxWidth="800px"
          >
            <div className="flex flex-col md:flex-row">
              <div className={styles.modalImageSection}>
                <div className={styles.modalImageContainer}>
                  <Image
                    src={
                      currentLecturerDetails.avatarPath ||
                      `/lecturers/lecturer-${activeLecturerImageIndex + 1}.jpg`
                    }
                    alt={currentLecturerDetails.name}
                    width={300}
                    height={300}
                    className={styles.modalImage}
                  />
                  <div className={styles.modalDecoration}></div>
                </div>
              </div>
              <div className={styles.modalContentSpecific}>
                <h3 className={styles.modalTitle}>
                  {currentLecturerDetails.name}
                </h3>
                <p className={styles.modalSubtitle}>
                  {currentLecturerDetails.title}
                </p>
                <p className={styles.modalText}>{currentLecturerDetails.bio}</p>
                <ul className={styles.modalInfoList}>
                  <li className={styles.modalInfoItem}>
                    <span className={styles.modalInfoIcon}>🎯</span>
                    <span>
                      <strong>Specialization:</strong>{" "}
                      {currentLecturerDetails.specialization}
                    </span>
                  </li>
                  <li className={styles.modalInfoItem}>
                    <span className={styles.modalInfoIcon}>📚</span>
                    <span>
                      <strong>Experience:</strong>{" "}
                      {currentLecturerDetails.experience}
                    </span>
                  </li>
                  <li className={styles.modalInfoItem}>
                    <span className={styles.modalInfoIcon}>🏆</span>
                    <span>
                      <strong>Awards:</strong>{" "}
                      {currentLecturerDetails.awards || "N/A"}
                    </span>
                  </li>
                  <li className={styles.modalInfoItem}>
                    <span className={styles.modalInfoIcon}>📧</span>
                    <span>
                      <strong>Contact:</strong> {currentLecturerDetails.contact}
                    </span>
                  </li>
                </ul>
                <button className={styles.modalContactBtn}>
                  Contact Lecturer
                </button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </>
  );
}
