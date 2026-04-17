"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export default function TeacherRecapPage() {
    const [page, setPage] = useState(1);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Fetch Teachers for filter
    const { data: teachers = [] } = useSWR(mounted ? "/api/teachers" : null, fetcher);

    // Fetch Recap Data with SWR
    const apiUrl = `/api/attendance/rekap-guru?page=${page}&limit=10${selectedTeacher ? `&teacherId=${selectedTeacher}` : ""}`;
    const { data: swrData, isLoading: loading } = useSWR(mounted ? apiUrl : null, fetcher);
    
    const recapData = swrData?.data || [];
    const totalPages = swrData?.totalPages || 1;

    const exportToCSV = async () => {
        try {
            const url = `/api/attendance/rekap-guru?limit=all${selectedTeacher ? `&teacherId=${selectedTeacher}` : ""}`;
            const res = await fetch(url);
            const allData = await res.json();
            
            if (!Array.isArray(allData) || allData.length === 0) return;
            
            const headers = ["Tanggal", "Nama Guru", "Total Murid", "Murid Hadir", "Estimasi Honor", "Mata Pelajaran"];
            const rows = allData.map(item => [
                new Date(item.date).toLocaleDateString("id-ID"),
                item.teacher?.name || "N/A",
                item.studentsTaught?.length || 0,
                item.studentsTaught?.filter(s => s.status === 'Hadir').length || 0,
                item.studentsTaught?.filter(s => s.status === 'Hadir').length * 10000,
                [...new Set(item.studentsTaught?.map(s => s.student?.subject || s.subject))].join("; ")
            ]);

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const urlBlob = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", urlBlob);
            link.setAttribute("download", `rekap_absen_guru_${new Date().toISOString().split('T')[0]}.csv`);
            link.click();
        } catch (e) {
            console.error(e);
        }
    };

    if (!mounted) return null;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Rekap Absen Guru</h1>
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
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Filter Berdasarkan Guru</label>
                        <select 
                            value={selectedTeacher}
                            onChange={(e) => {
                                setSelectedTeacher(e.target.value);
                                setPage(1);
                            }}
                            className="form-select"
                        >
                            <option value="">Semua Guru</option>
                            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
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
                                <th>Nama Guru</th>
                                <th>Kehadiran Murid</th>
                                <th>Estimasi Honor</th>
                                <th>Mata Pelajaran</th>
                                <th style={{ textAlign: 'center' }}>Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : recapData.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>Belum ada data rekap absensi untuk kriteria ini.</td></tr>
                            ) : recapData.map((session) => (
                                <tr key={session._id}>
                                    <td>{new Date(session.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{session.teacher?.name}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 700, backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{session.studentsTaught?.length || 0}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
                                                ({session.studentsTaught?.filter(s => s.status === 'Hadir').length} Hadir)
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>
                                        Rp {(session.studentsTaught?.filter(s => s.status === 'Hadir').length * 10000 || 0).toLocaleString("id-ID")}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {[...new Set(session.studentsTaught?.map(s => s.subject))].map(sub => (
                                                <span key={sub} style={{ fontSize: '10px', background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e0e7ff' }}>
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>Tersimpan</span>
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
            {Array(6).fill(0).map((_, i) => (
                <td key={i} style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '20px', width: i === 1 ? '150px' : '100px' }}></div>
                </td>
            ))}
        </tr>
    );
}
