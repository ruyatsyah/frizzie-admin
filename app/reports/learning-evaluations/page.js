"use client";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import fetcher from "@/lib/fetcher";
import { showToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function ManageEvaluationsPage() {
    const [page, setPage] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEval, setSelectedEval] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // SWR for Evaluations
    const apiUrl = `/api/learning-evaluations?page=${page}&limit=10${filterMonth ? `&month=${filterMonth}` : ""}`;
    const { data: swrData, isLoading: loading } = useSWR(mounted ? apiUrl : null, fetcher);
    const evals = swrData?.data || [];
    const totalPages = swrData?.totalPages || 1;

    // For Printing
    const [printData, setPrintData] = useState({ studentName: "", startDate: "", endDate: "", cps: [], evaluation: null });

    useEffect(() => {
        setMounted(true);
    }, []);

    const refreshData = () => mutate(apiUrl);



    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/learning-evaluations/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Evaluasi berhasil dihapus");
                refreshData();
            }
        } catch (e) { 
            showToast("Gagal menghapus", "error"); 
        } finally {
            setDeleteId(null);
        }
    };

    const handleEdit = (ev) => {
        setSelectedEval({ ...ev });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`/api/learning-evaluations/${selectedEval._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedEval)
            });
            if (res.ok) {
                showToast("Evaluasi diperbarui!");
                setIsEditModalOpen(false);
                refreshData();
            }
        } catch (e) { showToast("Gagal memperbarui", "error"); }
        finally { setIsSaving(false); }
    };

    const handlePrint = async (ev) => {
        try {
            // Fetch Learning Outcomes for this period to populate the table
            const res = await fetch(`/api/learning-outcomes?studentId=${ev.student?._id}&startDate=${ev.startDate.split('T')[0]}&endDate=${ev.endDate.split('T')[0]}&limit=100`);
            const json = await res.json();
            const cps = json.data || (Array.isArray(json) ? json : []);
            
            setPrintData({
                studentName: ev.student?.name,
                startDate: new Date(ev.startDate).toLocaleDateString("id-ID"),
                endDate: new Date(ev.endDate).toLocaleDateString("id-ID"),
                cps: cps,
                evaluation: ev
            });

            // Wait for state to apply then print
            setTimeout(() => {
                window.print();
            }, 800);
        } catch (e) {
            showToast("Gagal memuat data cetak", "error");
        }
    };

    const filteredEvals = evals.filter(e => 
        e.student?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (!mounted) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #5A57DA', borderRadius: '50%' }}></div>
        </div>
    );

    const SkeletonRow = () => (
        <tr>
            <td><div className="skeleton" style={{ height: '20px', width: '150px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '180px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '150px' }}></div></td>
            <td style={{ textAlign: "center" }}><div className="skeleton" style={{ height: '32px', width: '100px', margin: '0 auto' }}></div></td>
        </tr>
    );

    return (
        <div className="ripple-effect">

            {/* Hidden Print Layout */}
            <div className="print-area" style={{ width: '100%', padding: '0 20px 60px 20px' }}>
                <div className="kop-surat">
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#78350f' }}>FrizzieSmartClub</h2>
                    <p>Kp. Bojong No.135 RT. 02/RW. 01 Sukamukti, Katapang</p>
                </div>
                
                <h3 style={{ textAlign: 'center', margin: '30px 0', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78350f' }}>LAPORAN CAPAIAN PEMBELAJARAN</h3>
                
                <div style={{ marginBottom: '15px', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>Siswa:</strong> {printData.studentName}</div>
                    <div><strong>Periode:</strong> {printData.startDate} - {printData.endDate}</div>
                </div>

                <h4 style={{ marginBottom: '10px', fontSize: '16px', pageBreakAfter: 'avoid' }}>1. Rekap Capaian Pembelajaran:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', border: '1px solid #333' }} border="1">
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '10px 8px', textAlign: 'center', width: '15%', fontSize: '13px', textTransform: 'uppercase' }}>Tanggal</th>
                            <th style={{ padding: '10px 8px', textAlign: 'center', width: '45%', fontSize: '13px', textTransform: 'uppercase' }}>Mata Pelajaran / Materi</th>
                            <th style={{ padding: '10px 8px', textAlign: 'center', width: '40%', fontSize: '13px', textTransform: 'uppercase' }}>Capaian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printData.cps.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>Tidak ada data capaian pembelajaran.</td></tr>
                        ) : printData.cps.map(cp => (
                            <tr key={cp._id} style={{ pageBreakInside: 'avoid' }}>
                                <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'middle', fontSize: '13px' }}>{cp.date ? new Date(cp.date).toLocaleDateString("id-ID") : "-"}</td>
                                <td style={{ padding: '10px 8px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px', color: '#78350f' }}>{cp.subject}</div>
                                    <div style={{ fontSize: '12px', color: '#444', lineHeight: '1.4' }}>{cp.material}</div>
                                </td>
                                <td style={{ padding: '10px 8px', verticalAlign: 'middle', fontSize: '13px', lineHeight: '1.4' }}>{cp.achievement}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h4 style={{ marginBottom: '10px', fontSize: '16px', pageBreakAfter: 'avoid', marginTop: '10px' }}>2. Hasil Evaluasi & Penilaian:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid #333' }} border="1">
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ padding: '10px 12px', width: '30%', textAlign: 'left', textTransform: 'uppercase' }}>Aspek Penilaian</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', textTransform: 'uppercase' }}>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ pageBreakInside: 'avoid' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, backgroundColor: '#fafafa' }}>Progres Belajar</td>
                            <td style={{ padding: '10px 12px', lineHeight: '1.5' }}>{printData.evaluation?.progresBelajar || "-"}</td>
                        </tr>
                        <tr style={{ pageBreakInside: 'avoid' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, backgroundColor: '#fafafa' }}>Kebutuhan ditingkatkan</td>
                            <td style={{ padding: '10px 12px', lineHeight: '1.5' }}>{printData.evaluation?.kebutuhanDitingkatkan || "-"}</td>
                        </tr>
                        <tr style={{ pageBreakInside: 'avoid' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600, backgroundColor: '#fafafa' }}>Saran Pengembangan</td>
                            <td style={{ padding: '10px 12px', lineHeight: '1.5' }}>{printData.evaluation?.saranPengembangan || "-"}</td>
                        </tr>
                    </tbody>
                </table>
                <div style={{ marginTop: '40px', textAlign: 'right', float: 'right' }}>
                    <p>Bandung, {new Date().toLocaleDateString("id-ID")}</p>
                    <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', margin: '5px 0' }}>
                        <img src="/signature-salma.png" alt="Tanda Tangan" style={{ height: '80px', mixBlendMode: 'multiply' }} />
                    </div>
                    <p><strong>( Salma Rahmani, S.T. )</strong></p>
                </div>
                <div style={{ clear: 'both' }}></div>
            </div>

            <div className="no-print" style={{ paddingBottom: '40px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'white' }}>
                    {/* Card Header: Title + Search */}
                    <div style={{ backgroundColor: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#2D3748', letterSpacing: '-0.01em' }}>
                            Manajemen Evaluasi Pembelajaran
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', flex: 1, justifyContent: 'flex-end', flexWrap: 'nowrap', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '150px', maxWidth: '320px' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari nama murid..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ paddingLeft: '38px', height: '38px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', fontSize: '13px', outline: 'none', backgroundColor: '#F9FAFB' }}
                                />
                            </div>
                            <input
                                type="month"
                                value={filterMonth}
                                onChange={(e) => { setFilterMonth(e.target.value); setPage(1); }}
                                style={{ width: '135px', height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none', backgroundColor: '#F9FAFB' }}
                                title="Filter berdasarkan bulan"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-wrapper" style={{ margin: 0, padding: '0 24px 12px 24px' }}>
                        <table className="data-table" style={{ border: 'none', borderCollapse: 'collapse', margin: 0, width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px' }}>Tanggal Input</th>
                                    <th style={{ padding: '12px 16px' }}>Nama Murid</th>
                                    <th style={{ padding: '12px 16px' }}>Periode Belajar</th>
                                    <th style={{ padding: '12px 24px 12px 16px', textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : filteredEvals.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '32px' }}>Tidak ada data evaluasi.</td></tr>
                                ) : filteredEvals.map((ev) => (
                                    <tr key={ev._id}>
                                        <td style={{ verticalAlign: 'middle', padding: '8px 16px' }}>{ev.createdAt ? new Date(ev.createdAt).toLocaleString("id-ID") : "-"}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--primary)', verticalAlign: 'middle', padding: '8px 16px' }}>{ev.student?.name || "Murid tidak ditemukan"}</td>
                                        <td style={{ fontSize: '13px', verticalAlign: 'middle', padding: '8px 16px' }}>
                                            {ev.startDate ? new Date(ev.startDate).toLocaleDateString("id-ID") : "-"} s/d {ev.endDate ? new Date(ev.endDate).toLocaleDateString("id-ID") : "-"}
                                        </td>
                                        <td style={{ verticalAlign: 'middle', padding: '8px 24px 8px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handlePrint(ev)} className="btn-action" style={{ color: '#5A57DA' }} title="Cetak PDF">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                                                </button>
                                                <button onClick={() => handleEdit(ev)} className="btn-action" style={{ color: '#F59E0B' }} title="Edit">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                                </button>
                                                <button onClick={() => handleDelete(ev._id)} className="btn-action" style={{ color: '#EF4444' }} title="Hapus">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'white', borderTop: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>
                            Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                disabled={page <= 1 || loading}
                                onClick={() => setPage(page - 1)}
                                className="btn-outline"
                                style={{ padding: '6px 12px', opacity: (page <= 1 || loading) ? 0.5 : 1, fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                            >
                                Prev
                            </button>
                            <button
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage(page + 1)}
                                className="btn-outline"
                                style={{ padding: '6px 12px', opacity: (page >= totalPages || loading) ? 0.5 : 1, fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <FormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Evaluasi Pembelajaran">
                {selectedEval && (
                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Nama Murid</label>
                            <input type="text" value={selectedEval.student?.name} disabled style={{ backgroundColor: '#F1F5F9', height: '42px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'not-allowed' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Rentang Mulai</label>
                                <input type="text" value={selectedEval.startDate ? new Date(selectedEval.startDate).toLocaleDateString("id-ID") : "-"} disabled style={{ backgroundColor: '#F1F5F9', height: '42px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'not-allowed' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Rentang Selesai</label>
                                <input type="text" value={selectedEval.endDate ? new Date(selectedEval.endDate).toLocaleDateString("id-ID") : "-"} disabled style={{ backgroundColor: '#F1F5F9', height: '42px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'not-allowed' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>1. Progres Belajar</label>
                            <textarea 
                                value={selectedEval.progresBelajar} 
                                onChange={(e) => setSelectedEval({...selectedEval, progresBelajar: e.target.value})}
                                style={{ height: '100px', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                                placeholder="Sebutkan kemajuan yang signifikan..."
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>2. Kebutuhan yang harus ditingkatkan</label>
                            <textarea 
                                value={selectedEval.kebutuhanDitingkatkan} 
                                onChange={(e) => setSelectedEval({...selectedEval, kebutuhanDitingkatkan: e.target.value})}
                                style={{ height: '100px', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                                placeholder="Area yang masih perlu bimbingan..."
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>3. Saran & Pengembangan Anak</label>
                            <textarea 
                                value={selectedEval.saranPengembangan} 
                                onChange={(e) => setSelectedEval({...selectedEval, saranPengembangan: e.target.value})}
                                style={{ height: '100px', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                                placeholder="Langkah selanjutnya..."
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button type="submit" className="btn-primary" disabled={isSaving} style={{ width: '100%', height: '48px', fontSize: '15px' }}>
                                {isSaving ? "Menyimpan..." : "💾 Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                )}
            </FormModal>

            {deleteId && (
                <ConfirmModal
                    title="Hapus Evaluasi Belajar"
                    message="Apakah Anda yakin ingin menghapus data evaluasi ini secara permanen?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}


            <style jsx>{`
                .row-hover:hover {
                    background-color: #F8FAFC !important;
                }
            `}</style>
        </div>
    );
}
