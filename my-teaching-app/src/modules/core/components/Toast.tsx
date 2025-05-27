// filepath: c:\s3978302\Full Stack Development\s3959931-s3978302-a2\my-teaching-app\src\modules\core\components\Toast.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  type = 'success',
  onClose,
}) => {
  // Automatically close the toast after 3 seconds
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const icons = {
    success: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    error: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    info: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`toast-notification toast-${type}`}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          style={{
            backgroundColor:
              type === 'success'
                ? '#ecfdf5'
                : type === 'error'
                  ? '#fef2f2'
                  : type === 'info'
                    ? '#eff6ff'
                    : '#ffffff',
            border: `1px solid ${
              type === 'success'
                ? '#10b981'
                : type === 'error'
                  ? '#ef4444'
                  : type === 'info'
                    ? '#3b82f6'
                    : '#e5e7eb'
            }`,
          }}
        >
          <div
            className="toast-icon"
            style={{
              backgroundColor:
                type === 'success'
                  ? '#d1fae5'
                  : type === 'error'
                    ? '#fee2e2'
                    : type === 'info'
                      ? '#dbeafe'
                      : '#f3f4f6',
              color:
                type === 'success'
                  ? '#10b981'
                  : type === 'error'
                    ? '#ef4444'
                    : type === 'info'
                      ? '#3b82f6'
                      : '#6b7280',
            }}
          >
            {icons[type]}
          </div>
          <div className="toast-content" style={{ color: '#111827' }}>
            {message}
          </div>
          <button
            className="toast-close"
            onClick={onClose}
            style={{ color: '#6b7280' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
