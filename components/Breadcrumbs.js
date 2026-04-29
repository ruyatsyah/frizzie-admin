"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pathMap = {
    "/": "Dashboard",
    "/students": "Data Siswa",
    "/teachers": "Data Guru",
    "/learning-outcomes": "Capaian Belajar",
    "/attendance": "Absensi",
    "/attendance/rekap-guru": "Rekap Absen Guru",
    "/attendance/rekap-murid": "Rekap Absen Murid",
    "/reports/learning-evaluations": "Hasil Evaluasi Belajar",
    "/billings": "Tagihan Siswa",
    "/salaries": "Gaji Guru",
    "/expenses": "Pengeluaran",
    "/login": "Login"
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    
    // Split pathname into segments
    const segments = pathname.split('/').filter(Boolean);
    
    // Generate breadcrumbs
    const crumbs = [];
    
    // Always start with Admin (as seen in reference)
    crumbs.push({ name: "Admin", path: "/" });

    let currentPath = "";
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const name = pathMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        crumbs.push({ name, path: currentPath });
    });

    // If we are on root, just show Admin / Dashboard
    if (segments.length === 0) {
        crumbs.push({ name: "Dashboard", path: "/" });
    }

    return (
        <nav aria-label="Breadcrumb" style={{ marginBottom: '0', display: 'flex', alignItems: 'center' }}>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {crumbs.map((crumb, index) => (
                    <li key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {index > 0 && (
                            <span style={{ color: '#94A3B8', fontSize: '14px' }}>/</span>
                        )}
                        {index === crumbs.length - 1 ? (
                            <span style={{ color: '#1E293B', fontWeight: 600, fontSize: '13px' }}>
                                {crumb.name}
                            </span>
                        ) : (
                            <Link 
                                href={crumb.path}
                                style={{ 
                                    color: '#64748B', 
                                    textDecoration: 'none', 
                                    fontSize: '13px',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'var(--brand)'}
                                onMouseLeave={(e) => e.target.style.color = '#64748B'}
                            >
                                {crumb.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
