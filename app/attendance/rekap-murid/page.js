"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export default function StudentRecapPage() {
    const [page, setPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Fetch Students for filter
    const { data: students = [] } = useSWR(mounted ? "/api/students" : null, fetcher);

    // Fetch Recap Data with SWR
    const apiUrl = `/api/attendance/rekap-murid?page=${page}&limit=10${selectedStudent ? `&studentId=${selectedStudent}` : ""}`;
    const { data: swrData, isLoading: loading } = useSWR(mounted ? apiUrl : null, fetcher);
    
    const recapData = swrData?.data || [];
    const totalPages = swrData?.totalPages || 1;

    const exportToCSV = async () => {
        try {
            const url = `/api/attendance/rekap-murid?limit=all${selectedStudent ? `&studentId=${selectedStudent}` : ""}`;
            const res = await fetch(url);
            const allData = await res.json();
            
            if (!Array.isArray(allData) || allData.length === 0) return;
            
            const headers = ["Tanggal", "Nama Murid", "Mata Pelajaran", "Guru Pengajar", "Status Kehadiran"];
            const rows = allData.map(item => [
                new Date(item.date).toLocaleDateString("id-ID"),
                item.studentName || "N/A",
                item.subject || "N/A",
                item.teacherName || "N/A",
                item.status || "N/A"
            ]);

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const urlBlob = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", urlBlob);
            link.setAttribute("download", `rekap_absen_murid_${new Date().toISOString().split('T')[0]}.csv`);
            link.click();
        } catch (e) {
            console.error(e);
        }
    };

    if (!mounted) return null;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Rekap Absen Murid</h1>
                <button 
                    onClick={exportToCSV} 
                    className="btn-outline" 
                    style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#5A57DA', color: '#5A57DA' }}
                    disabled={recapData.length === 0}
                >
                    📥 Export All to CSV
                </button>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '240px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Filter Per Murid</label>
                        <select 
                            value={selectedStudent}
                            onChange={(e) => {
                                setSelectedStudent(e.target.value);
                                setPage(1);
                            }}
                            className="form-select"
                        >
                            <option value="">Semua Murid</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.grade})</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Nama Murid</th>
                                <th>Mata Pelajaran</th>
                                <th>Guru Pengajar</th>
                                <th>Status Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : recapData.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>Tidak ada riwayat kehadiran ditemukan.</td></tr>
                            ) : recapData.map((row) => (
                                <tr key={row._id}>
                                    <td>{new Date(row.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{row.studentName}</td>
                                    <td>{row.subject}</td>
                                    <td>{row.teacherName}</td>
                                    <td>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '6px', 
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            background: row.status === 'Hadir' ? '#ecfdf5' : row.status === 'Izin' ? '#fff7ed' : '#fef2f2',
                                            color: row.status === 'Hadir' ? 'var(--success)' : row.status === 'Izin' ? 'var(--warning)' : 'var(--danger)'
                                        }}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '16px 0', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                        Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            disabled={page <= 1 || loading}
                            onClick={() => setPage(page - 1)}
                            className="btn-outline"
                            style={{ padding: '6px 16px', opacity: (page <= 1 || loading) ? 0.5 : 1 }}
                        >
                            Sebelumnya
                        </button>
                        <button 
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage(page + 1)}
                            className="btn-outline"
                            style={{ padding: '6px 16px', opacity: (page >= totalPages || loading) ? 0.5 : 1 }}
                        >
                            Berikutnya
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SkeletonRow() {
    return (
        <tr>
            {Array(5).fill(0).map((_, i) => (
                <td key={i} style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '20px', width: i === 1 ? '150px' : '100px' }}></div>
                </td>
            ))}
        </tr>
    );
}
