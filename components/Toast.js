"use client";
import { useEffect, useState } from "react";

export default function Toast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleShowToast = (e) => {
            const id = Date.now();
            setToasts((prev) => [...prev, { id, ...e.detail }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 3000);
        };
        window.addEventListener("show-toast", handleShowToast);
        return () => window.removeEventListener("show-toast", handleShowToast);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((t) => (
                <div key={t.id} className="toast">
                    {t.type === "success" ? "✅" : "⚠️"} {t.message}
                </div>
            ))}
        </div>
    );
}

export const showToast = (message, type = "success") => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("show-toast", { detail: { message, type } }));
    }
};
