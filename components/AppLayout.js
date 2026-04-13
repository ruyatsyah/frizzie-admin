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
    const [user, setUser] = useState(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const authData = localStorage.getItem("frizzie_auth");
        if (authData) {
            try {
                const parsedUser = JSON.parse(authData);
                setUser(parsedUser);
            } catch (e) {
                if (pathname !== "/login") router.replace("/login");
            }
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
    if (!user && pathname !== "/login") {
        return null;
    }

    return (
        <div className="app-layout">
            <Toast />
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userRole={user?.role} />
            <main className="main-content" style={{ 
                flex: 1, 
                backgroundColor: '#F8FAFC', 
                height: '100vh', 
                overflowY: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Topbar
                    user={user}
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    onLogout={() => {
                        localStorage.removeItem("frizzie_auth");
                        router.push("/login");
                    }}
                />
                
                <div style={{ 
                    maxWidth: '1600px', 
                    margin: '0 auto', 
                    padding: '32px 24px', 
                    width: '100%',
                    flex: 1 // Content takes available space
                }}>
                    {children}
                </div>

                {/* Perfectly Balanced Footer */}
                <footer style={{ 
                    padding: '32px 24px 24px', 
                    borderTop: '1px solid #e2e8f0',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.025em',
                    width: '100%'
                }}>
                    © 2025 FrizzieSmartClub. Create with ❤️ ruyatsyah
                </footer>
            </main>
        </div>
    );
}
