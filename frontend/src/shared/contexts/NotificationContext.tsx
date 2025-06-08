"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export interface Notification {
  id: string;
  type: "candidate_blocked" | "candidate_unblocked";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  candidateId?: number;
  candidateName?: string;
  unselectedCount?: number;
  unrankedCount?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Load notifications from localStorage on mount (lecturer-specific)
  useEffect(() => {
    if (user?.userType === "lecturer" && user?.id) {
      const storageKey = `lecturer_notifications_${user.id}`;
      const savedNotifications = localStorage.getItem(storageKey);
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          const notificationsWithDates = parsed.map((n: Notification) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));
          setNotifications(notificationsWithDates);
        } catch (error) {
          console.error("Failed to parse saved notifications:", error);
        }
      }
    }
  }, [user?.userType, user?.id]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user?.userType === "lecturer" && user?.id) {
      const storageKey = `lecturer_notifications_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [notifications, user?.userType, user?.id]);

  const addNotification = useCallback(
    (notificationData: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notificationData,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
