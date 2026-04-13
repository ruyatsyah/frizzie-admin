"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function ManageEvaluationsPage() {
    const [evals, setEvals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEval, setSelectedEval] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // For Printing
    const [printData, setPrintData] = useState({ studentName: "", startDate: "", endDate: "", cps: [], evaluation: null });

    useEffect(() => {
        fetchEvals();
    }, []);

    const fetchEvals = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/learning-evaluations");
            const data = await res.json();
            setEvals(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/learning-evaluations/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Evaluasi berhasil dihapus");
                setDeleteId(null);
                fetchEvals();
            }
        } catch (e) { 
            showToast("Gagal menghapus", "error"); 
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
                fetchEvals();
            }
        } catch (e) { showToast("Gagal memperbarui", "error"); }
        finally { setIsSaving(false); }
    };

    const handlePrint = async (ev) => {
        try {
            // Fetch Learning Outcomes for this period to populate the table
            const res = await fetch(`/api/learning-outcomes?studentId=${ev.student?._id}&startDate=${ev.startDate.split('T')[0]}&endDate=${ev.endDate.split('T')[0]}`);
            const cps = await res.json();
            
            setPrintData({
                studentName: ev.student?.name,
                startDate: new Date(ev.startDate).toLocaleDateString("id-ID"),
                endDate: new Date(ev.endDate).toLocaleDateString("id-ID"),
                cps: Array.isArray(cps) ? cps : [],
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

    return (
        <div className="container ripple-effect">
            <style jsx global>{`
                .print-area { display: none; }
                .kop-surat { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
                .kop-surat h2 { margin: 0; color: #5A57DA; }
                
                /* Component specific print overrides */
                @media print {
                    .print-area { display: block !important; }
                }
            `}</style>

            {/* Hidden Print Layout */}
            <div className="print-area" style={{ width: '100%', padding: '0 20px' }}>
                <div className="kop-surat">
                    <h2 style={{ fontSize: '28px', fontWeight: 800 }}>FrizzieSmartClub</h2>
                    <p>Kp. Bojong No.135 RT. 02/RW. 01 Sukamukti, Katapang</p>
                </div>
                
                <h3 style={{ textAlign: 'center', margin: '30px 0', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LAPORAN CAPAIAN PEMBELAJARAN</h3>
                
                <div style={{ marginBottom: '15px', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>Siswa:</strong> {printData.studentName}</div>
                    <div><strong>Periode:</strong> {printData.startDate} - {printData.endDate}</div>
                </div>

                <h4 style={{ marginBottom: '8px', fontSize: '16px' }}>1. Rekap Capaian Pembelajaran:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', border: '1px solid #333' }} border="1">
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '12px', textAlign: 'center', width: '20%' }}>Tanggal</th>
                            <th style={{ padding: '12px', textAlign: 'center', width: '50%' }}>Mata Pelajaran / Materi</th>
                            <th style={{ padding: '12px', textAlign: 'center', width: '30%' }}>Capaian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {printData.cps.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center' }}>Tidak ada data capaian pembelajaran.</td></tr>
                        ) : printData.cps.map(cp => (
                            <tr key={cp._id}>
                                <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>{new Date(cp.date).toLocaleDateString("id-ID")}</td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>{cp.subject}</div>
                                    <div style={{ fontSize: '12px', color: '#444' }}>{cp.material}</div>
                                </td>
                                <td style={{ padding: '12px', verticalAlign: 'middle' }}>{cp.achievement}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h4 style={{ marginBottom: '8px' }}>2. Hasil Evaluasi & Penilaian:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }} border="1">
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ padding: '8px', width: '30%', textAlign: 'left' }}>Aspek Penilaian</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '8px', fontWeight: 600 }}>Progres Belajar</td>
                            <td style={{ padding: '8px' }}>{printData.evaluation?.progresBelajar || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', fontWeight: 600 }}>Kebutuhan ditingkatkan</td>
                            <td style={{ padding: '8px' }}>{printData.evaluation?.kebutuhanDitingkatkan || "-"}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', fontWeight: 600 }}>Saran Pengembangan</td>
                            <td style={{ padding: '8px' }}>{printData.evaluation?.saranPengembangan || "-"}</td>
                        </tr>
                    </tbody>
                </table>
                <div style={{ marginTop: '40px', textAlign: 'right' }}>
                    <p>Bandung, {new Date().toLocaleDateString("id-ID")}</p>
                    <br /><br /><br />
                    <p><strong>( Admin FrizzieSmartClub )</strong></p>
                </div>
            </div>

            <div className="no-print">
                <h1 className="page-title">Manajemen Evaluasi Pembelajaran</h1>
                
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input 
                            type="text" 
                            placeholder="Cari Nama Murid..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tanggal Input</th>
                                    <th>Nama Murid</th>
                                    <th>Periode Belajar</th>
                                    <th style={{ textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" align="center">Memuat...</td></tr>
                                ) : filteredEvals.length === 0 ? (
                                    <tr><td colSpan="4" align="center">Tidak ada data evaluasi.</td></tr>
                                ) : filteredEvals.map((ev) => (
                                    <tr key={ev._id}>
                                        <td>{new Date(ev.createdAt).toLocaleString("id-ID")}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{ev.student?.name}</td>
                                        <td style={{ fontSize: '13px' }}>
                                            {new Date(ev.startDate).toLocaleDateString("id-ID")} - {new Date(ev.endDate).toLocaleDateString("id-ID")}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
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
                                <input type="text" value={new Date(selectedEval.startDate).toLocaleDateString("id-ID")} disabled style={{ backgroundColor: '#F1F5F9', height: '42px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'not-allowed' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Rentang Selesai</label>
                                <input type="text" value={new Date(selectedEval.endDate).toLocaleDateString("id-ID")} disabled style={{ backgroundColor: '#F1F5F9', height: '42px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'not-allowed' }} />
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


        </div>
    );
}
