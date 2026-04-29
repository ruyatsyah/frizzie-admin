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
export default function Sidebar({ isOpen, setIsOpen, userRole }) {
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
                userRole === "admin" && { name: "Data Siswa", path: "/students", icon: <IconStudents /> },
                userRole === "admin" && { name: "Data Guru", path: "/teachers", icon: <IconTeachers /> },
                { name: "Capaian Belajar", path: "/learning-outcomes", icon: <IconCP /> }
            ].filter(Boolean)
        },
        userRole === "admin" && {
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
                },
                { name: "Hasil Evaluasi Belajar", path: "/reports/learning-evaluations", icon: <IconEvaluasi /> }
            ]
        },
        ...(userRole === "admin" ? [
            {
                title: "KEUANGAN",
                items: [
                    { name: "Tagihan Siswa", path: "/billings", icon: <IconBilling /> },
                    { name: "Gaji Guru", path: "/salaries", icon: <IconSalary /> },
                    { name: "Pengeluaran", path: "/expenses", icon: <IconExpense /> }
                ]
            }
        ] : [])
    ];

    const isActive = (path) => pathname === path;
    const isParentActive = (path) => pathname.startsWith(path);

    // Auto-close dropdown when sidebar collapses to maintain neatness
    useEffect(() => {
        if (!isOpen) setAttendanceOpen(false);
    }, [isOpen]);

    return (
        <aside 
            className={`sidebar-transition ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
            style={{ 
                backgroundColor: '#ffffff', 
                borderRight: '1px solid #E2E8F0',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                overflow: 'visible', // Changed to visible to show the toggle arrow
                flexShrink: 0,
                boxShadow: '4px 0 10px rgba(0,0,0,0.02)',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >


            {/* Toggle Button - Ultra Minimalist Arrow (Match Reference Precisely) */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute',
                    right: '-14px',
                    top: '32px',
                    transform: `translateY(-50%) ${isOpen ? 'rotate(0deg)' : 'rotate(180deg)'}`,
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#ffffff',
                    color: '#94A3B8',
                    border: '1px solid #E2E8F0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 2000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    padding: 0
                }}
                className="sidebar-arrow-toggle"
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.color = '#64748B';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#94A3B8';
                }}
            >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            {/* Header - Logo and Brand Name */}
            <div style={{ 
                height: '64px', 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid var(--border)', // Consistent with Topbar
                paddingLeft: '22px',
                paddingRight: '20px',
                overflow: 'hidden',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff'
            }}>
                <div style={{ flexShrink: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                        src="/assets/logo-frizzie.png" 
                        alt="Logo" 
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                    />
                </div>
                <span style={{ 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    color: '#78350f', 
                    whiteSpace: 'nowrap',
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    letterSpacing: '-0.02em'
                }}>
                    FrizzieSmartClub
                </span>
            </div>

            {/* Navigation Body Wrapper to keep items clipped during transition */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <nav className="sidebar-nav" style={{ padding: '24px 0', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    {menuGroups.filter(Boolean).map((group) => (
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
                                                                    ...(isActive(child.path) ? { color: '#78350f', fontWeight: 600 } : {})
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
            </div>
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
    backgroundColor: '#FFFBEB',
    color: '#78350f',
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
const IconCP = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);
const IconBilling = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
);
const IconSalary = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="m9 13 3 3 3-3"/></svg>
);
const IconEvaluasi = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
);
const IconExpense = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16" style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }}/></svg>
);
const IconWeb = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
