"use client";

import React from "react";
import Toast from "./Toast";

interface GlobalToastProps {
    message: string;
    visible: boolean;
    type?: "success" | "error" | "info" | "warning";
    onClose: () => void;
    variant?: "toast" | "inline";
    position?: "bottom-left" | "top-right" | "top-center" | "bottom-center";
    autoClose?: boolean;
    autoCloseDelay?: number;
    showCloseButton?: boolean;
    className?: string;
    title?: string;
}

const GlobalToast: React.FC<GlobalToastProps> = (props) => {
    // For now, we'll default to false for darkMode since admin may not have theme context
    // You can add theme context later if needed
    return <Toast {...props} darkMode={false} />;
};

export default GlobalToast; 