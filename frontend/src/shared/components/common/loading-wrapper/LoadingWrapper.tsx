import React from "react";
import styles from "./LoadingWrapper.module.css";

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingMessage?: string;
  minHeight?: string;
  position?: "center" | "top" | "flex-start" | "top-center";
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  loadingMessage = "Loading...",
  minHeight = "200px",
  position = "center",
}) => {
  if (isLoading) {
    let justifyContent = position;
    let paddingTop = undefined;
    
    // Special handling for top-center position
    if (position === "top-center") {
      justifyContent = "flex-start";
      paddingTop = "8rem"; // Add top padding to push content down
    }

    const containerStyle = {
      minHeight,
      justifyContent,
      paddingTop,
    };

    return (
      <div className={styles.loadingContainer} style={containerStyle}>
        <div className={styles.spinner}>
          <svg className={styles.spinnerCircle} viewBox="0 0 24 24">
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
        <p className={styles.loadingMessage}>{loadingMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
