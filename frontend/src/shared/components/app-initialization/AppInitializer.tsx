"use client";

import { useEffect } from "react";
import StorageManager from "@/shared/utils/storageManager";
import { AuthService } from "@/shared/services/authService";

export default function AppInitializer() {
  useEffect(() => {
    // Run initialization on app load
    const initializeApp = async () => {
      try {
        // Check storage health
        StorageManager.checkStorageHealth();

        // Sync authentication with database if user is logged in
        const isAuthenticated = AuthService.isAuthenticated();
        if (isAuthenticated) {
          const syncResult = await AuthService.syncWithDatabase();
          if (!syncResult) {
            console.warn(
              "⚠️ Database sync failed - user may need to login again"
            );
          }
        }
      } catch (error) {
        console.error("❌ App initialization error:", error);
      }
    };

    // Run initialization with a small delay to ensure DOM is ready
    const timer = setTimeout(initializeApp, 100);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}
