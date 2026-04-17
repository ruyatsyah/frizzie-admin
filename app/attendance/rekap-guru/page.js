"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { showToast } from "@/components/Toast";

export default function TeacherRecapPage() {
    const [mounted, setMounted] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => { setMounted(true); }, []);

    // Fetch Teachers for dropdown
    const { data: swrTeachers } = useSWR(mounted ? "/api/teachers?limit=1000" : null, fetcher);
    const teachers = swrTeachers?.data || [];

    // Fetch Recap Data with new filters
    const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(selectedTeacher && { teacherId: selectedTeacher }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
    });

    const { data: swrData, isLoading: loading, mutate } = useSWR(
        mounted ? `/api/attendance/rekap-guru?${queryParams.toString()}` : null,
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
                ...(selectedTeacher && { teacherId: selectedTeacher }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            });
            const res = await fetch(`/api/attendance/rekap-guru?${exportParams.toString()}`);
            const allData = await res.json();
            
            if (!Array.isArray(allData) || allData.length === 0) {
                showToast("Tidak ada data untuk di-export", "warning");
                return;
            }
            
            const headers = ["Tanggal", "Nama Guru", "Siswa Hadir", "Estimasi Honor", "Mata Pelajaran"];
            const rows = allData.map(item => {
                const presentCount = item.studentsTaught?.filter(s => s.status === 'Hadir').length || 0;
                const subjects = [...new Set(item.studentsTaught?.map(s => s.subject))].join("; ");
                return [
                    new Date(item.date).toLocaleDateString("id-ID"),
                    item.teacher?.name || "N/A",
                    presentCount,
                    presentCount * 10000,
                    subjects
                ];
            });

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const urlBlob = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", urlBlob);
            link.setAttribute("download", `rekap_absen_guru_${new Date().toISOString().split('T')[0]}.csv`);
            link.click();
            showToast("Export CSV berhasil!");
        } catch (e) {
            console.error(e);
            showToast("Gagal melakukan export", "error");
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
                        Data Rekap Absensi Guru
                    </h3>
                </div>

                {/* Integrated Filter Bar - Minimalist Style */}
                <div style={{ padding: '16px 24px', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        
                        {/* Guru Selection */}
                        <div style={{ flex: '1.5', minWidth: '200px' }}>
                            <select 
                                value={selectedTeacher}
                                onChange={(e) => { setSelectedTeacher(e.target.value); setPage(1); }}
                                style={{ height: '38px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', width: '100%', backgroundColor: '#F9FAFB', fontWeight: 500 }}
                            >
                                <option value="">Semua Guru</option>
                                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>

                        {/* Date Range Selection (Minimalist - Labels hidden) */}
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

                        {/* Spacer to push action buttons to the right */}
                        <div style={{ flex: 1 }}></div>

                        {/* Action Buttons (Right Aligned) */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                onClick={() => { setSelectedTeacher(""); setStartDate(""); setEndDate(""); setPage(1); }}
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
                                <th style={{ verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Nama Guru</th>
                                <th style={{ width: '130px', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Kehadiran</th>
                                <th style={{ textAlign: 'right', width: '160px', verticalAlign: 'middle', whiteSpace: 'nowrap', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Estimasi Honor</th>
                                <th style={{ textAlign: 'right', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Mata Pelajaran</th>
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
                                const presentCount = session.studentsTaught?.filter(s => s.status === 'Hadir').length || 0;
                                return (
                                    <tr key={session._id} className="row-hover">
                                        <td style={{ textAlign: 'center', color: '#94A3B8', fontSize: '11px', verticalAlign: 'middle' }}>{(page - 1) * 10 + index + 1}</td>
                                        <td style={{ color: '#475569', fontWeight: 500, verticalAlign: 'middle' }}>
                                            {new Date(session.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{session.teacher?.name}</div>
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ 
                                                    padding: '2px 8px', 
                                                    borderRadius: '99px', 
                                                    backgroundColor: '#DCFCE7', 
                                                    color: '#166534', 
                                                    fontSize: '10px', 
                                                    fontWeight: 700 
                                                }}>
                                                    {presentCount} Hadir
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#64748B' }}>/ {session.studentsTaught?.length}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#0F172A', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                            Rp {(presentCount * 10000).toLocaleString("id-ID")}
                                        </td>
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                                                {[...new Set(session.studentsTaught?.map(s => s.subject))].map(sub => (
                                                    <span key={sub} style={{ fontSize: '10px', background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                                        {sub}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View remains standard cards but integrated into the same card visually */}
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
                            const presentCount = session.studentsTaught?.filter(s => s.status === 'Hadir').length || 0;
                            return (
                                <div key={session._id} className="card" style={{ marginBottom: '12px', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                                            {new Date(session.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>
                                            {presentCount} Hadir
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '4px' }}>{session.teacher?.name}</h3>
                                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                                        {[...new Set(session.studentsTaught?.map(s => s.subject))].join(", ")}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                                        <div style={{ fontSize: '11px', color: '#64748B' }}>Estimasi Honor:</div>
                                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)' }}>
                                            Rp {(presentCount * 10000).toLocaleString("id-ID")}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls (INSIDE CARD - BALANCED STYLE) */}
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
                .zebra-rows tr:nth-child(even) {
                    background-color: white;
                }
                .row-hover:hover {
                    background-color: #F8FAFC !important;
                }
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
