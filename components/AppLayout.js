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

    // Close sidebar on route change for mobile users
    useEffect(() => {
        if (window.innerWidth <= 1024) {
            setIsSidebarOpen(false);
        }
    }, [pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
        <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <Toast />
            
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(2px)',
                        zIndex: 900,
                        display: 'none' // Hidden by default, shown via CSS for mobile
                    }}
                    className="mobile-backdrop"
                />
            )}

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userRole={user?.role} />
            
            <main className="main-content" style={{ 
                flex: 1, 
                backgroundColor: '#F8FAFC', 
                height: '100vh', 
                overflowY: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                width: '100%' // Ensure full alignment
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
                <footer className="no-print" style={{ 
                    padding: '20px 24px', 
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.025em',
                    width: '100%'
                }}>
                    <div>© 2025 FrizzieSmartClub</div>
                    <div>Create with ❤️ ruyatsyah</div>
                </footer>
            </main>

            <style jsx global>{`
                @media (max-width: 1024px) {
                    .mobile-backdrop {
                        display: block !important;
                    }
                    .main-content {
                        width: 100vw !important;
                    }
                }
                @media (max-width: 640px) {
                    footer.no-print {
                        flex-direction: column;
                        gap: 8px;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}
