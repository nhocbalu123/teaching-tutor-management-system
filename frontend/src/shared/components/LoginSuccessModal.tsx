"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User } from "../types/user";
import Fireworks from "./fireworks/Fireworks";
import styles from "./LoginSuccessModal.module.css";

interface LoginSuccessModalProps {
  user: User;
  isVisible: boolean;
  onHide: () => void;
  duration?: number; // Duration to show the modal in milliseconds
}

export const LoginSuccessModal: React.FC<LoginSuccessModalProps> = ({
  user,
  isVisible,
  onHide,
  duration = 3000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const handleHide = useCallback(() => {
    setIsAnimating(false);
    setShowFireworks(false);
    
    // Wait for exit animation before calling onHide
    setTimeout(() => {
      onHide();
    }, 300);
  }, [onHide]);

  // Start animation when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setShowFireworks(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, handleHide]);

  const handleFireworksComplete = useCallback(() => {
    setShowFireworks(false);
  }, []);

  const getWelcomeMessage = () => {
    const firstName = user.firstName || "User";
    return `Welcome back, ${firstName}!`;
  };

  const getUserTypeLabel = () => {
    switch (user.userType) {
      case "candidate":
        return "Candidate";
      case "lecturer":
        return "Lecturer"; 
      case "admin":
        return "Administrator";
      default:
        return "User";
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className={`${styles.modalOverlay} ${isAnimating ? styles.visible : styles.hidden}`}
        onClick={handleHide}
      >
        {/* Modal Content */}
        <div 
          className={`${styles.modalContent} ${isAnimating ? styles.animated : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Icon */}
          <div className={styles.successIcon}>
            <div className={styles.checkmark}>
              <svg viewBox="0 0 52 52" className={styles.checkmarkSvg}>
                <circle 
                  className={styles.checkmarkCircle} 
                  cx="26" 
                  cy="26" 
                  r="25" 
                  fill="none"
                />
                <path 
                  className={styles.checkmarkCheck} 
                  fill="none" 
                  d="m14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
          </div>

          {/* Welcome Message */}
          <div className={styles.messageSection}>
            <h2 className={styles.welcomeTitle}>Login Successful!</h2>
            <h3 className={styles.welcomeMessage}>{getWelcomeMessage()}</h3>
            <p className={styles.welcomeSubtitle}>
              You are logged in as a {getUserTypeLabel()}
            </p>
          </div>

          {/* Close Button */}
          <button
            className={styles.closeButton}
            onClick={handleHide}
            aria-label="Close celebration modal"
          >
            Continue
          </button>
        </div>
      </div>
      
      {/* Fireworks Animation */}
      <Fireworks 
        isVisible={showFireworks} 
        onComplete={handleFireworksComplete}
        duration={2500}
      />
    </>
  );
}; 