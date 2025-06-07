import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string; // e.g., '500px', '800px', '90%'
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "500px",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    // Add gentle animation delay before closing
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscapeKey);
      setIsAnimating(true);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset"; // Ensure overflow is reset on unmount
    };
  }, [isOpen, handleClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === modalRef.current) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${isAnimating ? styles.modalOverlayActive : styles.modalOverlayClosing}`}
      onClick={handleOverlayClick}
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className={`${styles.modalContainer} ${isAnimating ? styles.modalContainerActive : styles.modalContainerClosing}`} 
        style={{ maxWidth }}
      >
        <button
          onClick={handleClose}
          className={styles.modalClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
