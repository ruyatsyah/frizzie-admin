"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

/**
 * Sidebar Component inspired by Gemini UI.
 * - Hamburger inside the header (Left Aligned @ 22px).
 * - Collapsed: 72px width, icons only (Left Aligned @ 22px).
 * - Expanded: 260px width, icons + labels.
 * - Logic: Expansion ONLY on Hamburger or Absensi click.
 */
export default function Sidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();
    const router = useRouter();
    const [attendanceOpen, setAttendanceOpen] = useState(pathname.startsWith("/attendance"));

    const menuGroups = [
        {
            title: "UTAMA",
            items: [
                { name: "Dashboard", path: "/", icon: <IconHome /> }
            ]
        },
        {
            title: "MANAJEMEN",
            items: [
                { name: "Data Siswa", path: "/students", icon: <IconStudents /> },
                { name: "Data Guru", path: "/teachers", icon: <IconTeachers /> }
            ]
        },
        {
            title: "LAPORAN",
            items: [
                {
                    name: "Absensi",
                    path: "/attendance",
                    icon: <IconAttendance />,
                    isDropdown: true,
                    children: [
                        { name: "Absensi Kehadiran", path: "/attendance" },
                        { name: "Rekap Absen Guru", path: "/attendance/rekap-guru" },
                        { name: "Rekap Absen Murid", path: "/attendance/rekap-murid" },
                    ]
                }
            ]
        },
        {
            title: "KEUANGAN",
            items: [
                { name: "Tagihan Siswa", path: "/billings", icon: <IconBilling /> },
                { name: "Gaji Guru", path: "/salaries", icon: <IconSalary /> }
            ]
        }
    ];

    const isActive = (path) => pathname === path;
    const isParentActive = (path) => pathname.startsWith(path);

    // Auto-close dropdown when sidebar collapses to maintain neatness
    useEffect(() => {
        if (!isOpen) setAttendanceOpen(false);
    }, [isOpen]);

    return (
        <aside 
            className="sidebar-transition" 
            style={{ 
                backgroundColor: '#ffffff', 
                borderRight: '1px solid #E2E8F0',
                width: isOpen ? '260px' : '72px',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '4px 0 10px rgba(0,0,0,0.02)',
                position: 'relative'
            }}
        >
            <style jsx global>{`
                .sidebar-nav {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .sidebar-nav::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Header - Hamburger Left Aligned @ 22px */}
            <div style={{ 
                height: '72px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderBottom: '1px solid #F1F5F9',
                paddingLeft: '22px' // User request: exactly 22px left
            }}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748B',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        width: '32px', // Compact
                        height: '32px'
                    }}
                    className="btn-sidebar-toggle"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Navigation Body */}
            <nav className="sidebar-nav" style={{ padding: '24px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                {menuGroups.map((group) => (
                    <div key={group.title} style={{ marginBottom: '24px' }}>
                        <div style={{ 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            color: '#94A3B8', 
                            letterSpacing: '0.15em',
                            paddingLeft: '22px', // Align with hamburger
                            marginBottom: '10px',
                            opacity: isOpen ? 1 : 0,
                            height: isOpen ? 'auto' : '0',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease'
                        }}>
                            {group.title}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {group.items.map((item) => (
                                <div key={item.name} style={{ padding: '0 8px' }}>
                                    {item.isDropdown ? (
                                        <>
                                            <div
                                                onClick={() => {
                                                    if (!isOpen) {
                                                        setIsOpen(true);
                                                        setAttendanceOpen(true);
                                                    } else {
                                                        setAttendanceOpen(!attendanceOpen);
                                                    }
                                                }}
                                                style={{
                                                    ...navItemStyle,
                                                    ...(isParentActive(item.path) ? activeItemStyle : {}),
                                                    paddingLeft: '14px', // 8px wrapper + 14px = 22px
                                                    justifyContent: isOpen ? 'space-between' : 'flex-start',
                                                    cursor: 'pointer'
                                                }}
                                                title={!isOpen ? item.name : ''}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                                        {item.icon}
                                                    </div>
                                                    <span style={{ 
                                                        opacity: isOpen ? 1 : 0, 
                                                        width: isOpen ? 'auto' : '0',
                                                        overflow: 'hidden',
                                                        transition: 'opacity 0.2s ease, width 0.3s ease',
                                                        whiteSpace: 'nowrap',
                                                        fontWeight: isParentActive(item.path) ? 600 : 500
                                                    }}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                {isOpen && (
                                                    <svg 
                                                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                                        style={{ transform: attendanceOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginRight: '10px' }}
                                                    >
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                )}
                                            </div>
                                            {isOpen && attendanceOpen && (
                                                <div className="fade-in-up" style={{ paddingLeft: '40px', marginTop: '4px', borderLeft: '1.5px solid #F1F5F9', marginLeft: '26px' }}>
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.path}
                                                            href={child.path}
                                                            style={{
                                                                ...subItemStyle,
                                                                ...(isActive(child.path) ? { color: '#5A57DA', fontWeight: 600 } : {})
                                                            }}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href={item.path}
                                            style={{
                                                ...navItemStyle,
                                                ...(isActive(item.path) ? activeItemStyle : {}),
                                                paddingLeft: '14px', // 8px wrapper + 14px = 22px
                                                justifyContent: 'flex-start'
                                            }}
                                            title={!isOpen ? item.name : ''}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                                    {item.icon}
                                                </div>
                                                <span style={{ 
                                                    opacity: isOpen ? 1 : 0, 
                                                    width: isOpen ? 'auto' : '0',
                                                    overflow: 'hidden',
                                                    transition: 'opacity 0.2s ease, width 0.3s ease',
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: isActive(item.path) ? 600 : 500 
                                                }}>
                                                    {item.name}
                                                </span>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}

// Internal Styles
const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '10px',
    height: '44px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#64748B',
    textDecoration: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
};

const activeItemStyle = {
    backgroundColor: '#F0F0FF',
    color: '#5A57DA',
};

const subItemStyle = {
    display: 'block',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#64748B',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
};

// Icons (consistent 20x20)
const IconHome = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const IconStudents = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);
const IconTeachers = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconAttendance = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z"/></svg>
);
const IconBilling = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
);
const IconSalary = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="m9 13 3 3 3-3"/></svg>
);
