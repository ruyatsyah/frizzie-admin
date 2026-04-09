"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", path: "/" },
        { name: "Data Siswa", path: "/students" },
        { name: "Data Guru", path: "/teachers" },
        { name: "Tagihan Siswa", path: "/billings" },
        { name: "Gaji Guru", path: "/salaries" },
    ];

    return (
        <aside className={`sidebar ${isOpen ? "open" : "closed"}`} style={{ 
            backgroundColor: 'var(--surface)', 
            borderRight: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div className="sidebar-header" style={{ 
                height: '64px', 
                borderBottom: '1px solid var(--border)',
                color: 'var(--primary)',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '-0.02em'
            }}>
                FrizzieSmart
            </div>
            <nav className="sidebar-nav" style={{ padding: '24px 16px' }}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`nav-item ${pathname === item.path ? "active" : ""}`}
                        style={{
                            marginBottom: '4px',
                            transition: 'all 0.2s ease',
                            borderRadius: '10px'
                        }}
                        onClick={() => {
                            if (window.innerWidth <= 1024) {
                                setIsOpen(false);
                            }
                        }}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
