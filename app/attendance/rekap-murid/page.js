"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { showToast } from "@/components/Toast";

export default function StudentRecapPage() {
    const [mounted, setMounted] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => { setMounted(true); }, []);

    // Fetch Students for dropdown
    const { data: swrStudents } = useSWR(mounted ? "/api/students?limit=1000" : null, fetcher);
    const students = swrStudents?.data || [];

    // Fetch Recap Data with new filters
    const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(selectedStudent && { studentId: selectedStudent }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
    });

    const { data: swrData, isLoading: loading } = useSWR(
        mounted ? `/api/attendance/rekap-murid?${queryParams.toString()}` : null,
        fetcher,
        { keepPreviousData: true }
    );
    
    const recapData = swrData?.data || [];
    const totalItems = swrData?.totalItems || 0;
    const totalPages = swrData?.totalPages || 1;

    const exportToCSV = async () => {
        try {
            const exportParams = new URLSearchParams({
                limit: 'all',
                ...(selectedStudent && { studentId: selectedStudent }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            });
            const res = await fetch(`/api/attendance/rekap-murid?${exportParams.toString()}`);
            const allData = await res.json();
            
            if (!Array.isArray(allData) || allData.length === 0) {
                showToast("Tidak ada data untuk di-export", "warning");
                return;
            }
            
            const headers = ["Tanggal", "Nama Murid", "Mata Pelajaran", "Guru Pengajar", "Status"];
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
            showToast("Export CSV berhasil!");
        } catch (e) {
            console.error(e);
            showToast("Gagal melakukan export", "error");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Hadir": return { bg: "#DCFCE7", color: "#166534" };
            case "Izin": return { bg: "#FEF9C3", color: "#854D0E" };
            case "Sakit": return { bg: "#DBEAFE", color: "#1E40AF" };
            case "Alpa": return { bg: "#FEE2E2", color: "#991B1B" };
            default: return { bg: "#F1F5F9", color: "#475569" };
        }
    };

    if (!mounted) return null;

    return (
        <div className="fade-in-up">
            {/* Main Integrated Card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'white' }}>
                
                {/* Card Header (Data Title) */}
                <div style={{ backgroundColor: 'white', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#2D3748', letterSpacing: '-0.01em' }}>
                        Data Rekap Absensi Murid
                    </h3>
                </div>

                {/* Integrated Filter Bar - Minimalist Style */}
                <div style={{ padding: '16px 24px', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        
                        {/* Student Selection */}
                        <div style={{ flex: '1.5', minWidth: '200px' }}>
                            <select 
                                value={selectedStudent}
                                onChange={(e) => { setSelectedStudent(e.target.value); setPage(1); }}
                                style={{ height: '38px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', width: '100%', backgroundColor: '#F9FAFB', fontWeight: 500 }}
                            >
                                <option value="">Semua Murid</option>
                                {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.grade})</option>)}
                            </select>
                        </div>

                        {/* Date Range Selection (Minimalist) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                style={{ height: '38px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', backgroundColor: '#F9FAFB', fontWeight: 500 }}
                                title="Dari Tanggal"
                            />
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>s/d</span>
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                style={{ height: '38px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', backgroundColor: '#F9FAFB', fontWeight: 500 }}
                                title="Sampai Tanggal"
                            />
                        </div>

                        {/* Spacer */}
                        <div style={{ flex: 1 }}></div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                onClick={() => { setSelectedStudent(""); setStartDate(""); setEndDate(""); setPage(1); }}
                                className="btn-danger-outline"
                                style={{ height: '38px', borderRadius: '8px', fontSize: '12px', padding: '0 16px', fontWeight: 600, border: '1px solid #FEE2E2', color: '#EF4444', backgroundColor: '#FEF2F2' }}
                            >
                                Reset
                            </button>
                            <button 
                                onClick={exportToCSV} 
                                className="btn-primary" 
                                style={{ borderRadius: '8px', height: '38px', padding: '0 16px', gap: '8px', fontSize: '12px', fontWeight: 700, backgroundColor: '#4F46E5' }}
                                disabled={recapData.length === 0}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Integrated Table Area with Balanced Padding */}
                <div className="table-wrapper no-mobile" style={{ margin: 0, padding: '0 24px 12px 24px' }}>
                    <table className="data-table data-table-compact" style={{ fontSize: '13px', border: 'none', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'white', borderTop: '1px solid #E2E8F0', borderBottom: '2px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ width: '50px', textAlign: 'center', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>#</th>
                                <th style={{ width: '130px', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Tanggal</th>
                                <th style={{ verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Nama Murid</th>
                                <th style={{ verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Mata Pelajaran</th>
                                <th style={{ verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Guru Pengajar</th>
                                <th style={{ textAlign: 'center', width: '120px', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody className="zebra-rows">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : recapData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '64px', color: '#94A3B8' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                            Data tidak ditemukan.
                                        </div>
                                    </td>
                                </tr>
                            ) : recapData.map((session, index) => {
                                const style = getStatusStyle(session.status);
                                return (
                                    <tr key={session._id} className="row-hover">
                                        <td style={{ textAlign: 'center', color: '#94A3B8', fontSize: '11px', verticalAlign: 'middle' }}>{(page - 1) * 10 + index + 1}</td>
                                        <td style={{ color: '#475569', fontWeight: 500, verticalAlign: 'middle' }}>
                                            {new Date(session.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--primary)', verticalAlign: 'middle' }}>{session.studentName}</td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                                {session.subject}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748B', fontWeight: 500, verticalAlign: 'middle' }}>{session.teacherName}</td>
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                            <span style={{ 
                                                padding: '2px 10px', 
                                                borderRadius: '99px', 
                                                backgroundColor: style.bg, 
                                                color: style.color, 
                                                fontSize: '11px', 
                                                fontWeight: 700 
                                            }}>
                                                {session.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List View (Integrated style) */}
                <div className="mobile-only" style={{ display: 'none', padding: '16px' }}>
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="card" style={{ marginBottom: '12px' }}>
                                <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '12px' }}></div>
                                <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '24px' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div className="skeleton" style={{ height: '32px', width: '80px' }}></div>
                                    <div className="skeleton" style={{ height: '32px', width: '120px' }}></div>
                                </div>
                            </div>
                        ))
                    ) : recapData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>Pencarian tidak ditemukan.</div>
                    ) : (
                        recapData.map((session) => {
                            const style = getStatusStyle(session.status);
                            return (
                                <div key={session._id} className="card" style={{ marginBottom: '12px', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                                            {new Date(session.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: style.color, background: style.bg, padding: '2px 8px', borderRadius: '6px' }}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>{session.studentName}</h3>
                                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                                        {session.subject} • {session.teacherName}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls (BALANCED STYLE) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 24px 24px', backgroundColor: 'white' }}>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                        Data: <strong>{(page-1)*10+1}–{Math.min(page*10, totalItems)}</strong> dari <strong>{totalItems}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                            disabled={page <= 1 || loading}
                            onClick={() => setPage(page - 1)}
                            className="btn-outline"
                            style={{ height: '32px', padding: '0 12px', borderRadius: '6px', fontSize: '12px', opacity: (page <= 1 || loading) ? 0.4 : 1, backgroundColor: 'white' }}
                        >
                            Prev
                        </button>
                        <button 
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage(page + 1)}
                            className="btn-outline"
                            style={{ height: '32px', padding: '0 12px', borderRadius: '6px', fontSize: '12px', opacity: (page >= totalPages || loading) ? 0.4 : 1, backgroundColor: 'white' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .no-mobile { display: none; }
                    .mobile-only { display: block !important; }
                }
            `}</style>
        </div>
    );
}

function SkeletonRow() {
    return (
        <tr>
            {Array(6).fill(0).map((_, i) => (
                <td key={i} style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '20px', width: i === 2 ? '150px' : '80px' }}></div>
                </td>
            ))}
        </tr>
    );
}
