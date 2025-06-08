import { useState, useCallback } from "react";

interface ToastState {
    visible: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
    title?: string;
}

interface ToastOptions {
    type?: "success" | "error" | "info" | "warning";
    title?: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export const useToast = () => {
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        message: "",
        type: "success",
    });

    const showToast = useCallback((message: string, options?: ToastOptions) => {
        setToast({
            visible: true,
            message,
            type: options?.type || "success",
            title: options?.title,
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, visible: false }));
    }, []);

    const showError = useCallback(
        (message: string, title?: string) => {
            showToast(message, { type: "error", title });
        },
        [showToast]
    );

    const showSuccess = useCallback(
        (message: string, title?: string) => {
            showToast(message, { type: "success", title });
        },
        [showToast]
    );

    const showWarning = useCallback(
        (message: string, title?: string) => {
            showToast(message, { type: "warning", title });
        },
        [showToast]
    );

    const showInfo = useCallback(
        (message: string, title?: string) => {
            showToast(message, { type: "info", title });
        },
        [showToast]
    );

    return {
        toast,
        showToast,
        hideToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
    };
};
