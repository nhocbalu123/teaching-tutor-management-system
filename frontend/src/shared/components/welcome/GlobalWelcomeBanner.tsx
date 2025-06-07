"use client";

import React from "react";

// Disabled persistent welcome banner component
// Based on requirements: "Change login success behavior to show only a simple modal notification"
// and "Remove any persistent banners after login"
const GlobalWelcomeBannerInternal: React.FC = () => {
  // Return null to disable the persistent welcome banner
  // Login success is now handled only by the LoginSuccessModal in the signin form
  return null;
};

export default GlobalWelcomeBannerInternal;
