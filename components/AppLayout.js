"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Toast from "./Toast";

export default function AppLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const auth = localStorage.getItem("frizzie_auth");
        if (auth === "authenticated") {
            setIsAuthenticated(true);
        } else if (pathname !== "/login") {
            router.replace("/login");
        }
        setIsChecking(false);
    }, [pathname, router]);

    useEffect(() => {
        if (window.innerWidth <= 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    // Show blank page while checking auth to avoid flash
    if (isChecking) {
        return null;
    }

    // On the login page, only render children (no sidebar/topbar)
    if (pathname === "/login") {
        return (
            <>
                <Toast />
                {children}
            </>
        );
    }

    // Not authenticated and not on login page - redirect handled above
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="app-layout">
            <Toast />
            {isSidebarOpen && (
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            )}
            <main className="main-content">
                <Topbar
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    onLogout={() => {
                        localStorage.removeItem("frizzie_auth");
                        router.push("/login");
                    }}
                />
                <div className="page-content">{children}</div>
            </main>
        </div>
    );
}
