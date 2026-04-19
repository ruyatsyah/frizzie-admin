"use client";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import fetcher from "@/lib/fetcher";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import FormModal from "@/components/FormModal";

export default function BillingsPage() {
    const [page, setPage] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({ student: "", amount: "", monthYear: "", sessions: 0, status: "Belum Lunas" });
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // SWR for Billings
    const apiUrl = `/api/billings?page=${page}&limit=10`;
    const { data: swrData, isLoading: billingsLoading } = useSWR(mounted ? apiUrl : null, fetcher);
    const billings = swrData?.data || [];
    const totalPages = swrData?.totalPages || 1;

    // SWR for Students (Dropdown, get a lot to avoid missing)
    const { data: swrStudents } = useSWR(mounted ? "/api/students?limit=1000" : null, fetcher);
    const students = swrStudents?.data || [];

    useEffect(() => {
        setMounted(true);
    }, []);

    const refreshData = () => mutate(apiUrl);



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `/api/billings/${editingId}` : "/api/billings";
            
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToast(editingId ? "Data berhasil diperbarui!" : "Tagihan berhasil disimpan!");
                resetForm();
                refreshData();
            } else {
                showToast("Gagal menyimpan data", "error");
            }
        } catch (e) {
            showToast("Terjadi kesalahan sistem", "error");
        }
    };

    const resetForm = () => {
        setFormData({ student: "", amount: "", monthYear: "", sessions: 0, status: "Belum Lunas" });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (billing) => {
        setEditingId(billing._id);
        setFormData({
            student: billing.student?._id || "",
            amount: billing.amount,
            monthYear: billing.monthYear,
            sessions: billing.sessions || 0,
            status: billing.status,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        const res = await fetch(`/api/billings/${deleteId}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Data berhasil dihapus!");
            refreshData();
        } else {
            showToast("Gagal menghapus data", "error");
        }
        setDeleteId(null);
    };

    const handlePrint = (billing) => {
        setPrintData(billing);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (!mounted) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #5A57DA', borderRadius: '50%' }}></div>
        </div>
    );

    const SkeletonRow = () => (
        <tr>
            <td><div className="skeleton" style={{ height: '20px', width: '150px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '80px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '120px' }}></div></td>
            <td><div className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '6px' }}></div></td>
            <td style={{ textAlign: "right" }}><div className="skeleton" style={{ height: '32px', width: '100px', marginLeft: 'auto' }}></div></td>
        </tr>
    );

    return (
        <div>
            {/* Table Card */}
            <div className="card no-print" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'white' }}>
                {/* Card Title + Action Button */}
                <div style={{ backgroundColor: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#2D3748', letterSpacing: '-0.01em' }}>
                        Manajemen Tagihan Siswa
                    </h3>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="btn-primary"
                        style={{ height: '38px', padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 500 }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                        Tambah Tagihan
                    </button>
                </div>

                <div className="table-wrapper" style={{ margin: 0, padding: '0 24px 12px 24px' }}>
                    <table className="data-table" style={{ border: 'none', borderCollapse: 'collapse', margin: 0, width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px 16px' }}>Nama Siswa</th>
                                <th style={{ padding: '12px 16px' }}>Bulan/Tahun</th>
                                <th style={{ padding: '12px 16px' }}>Pertemuan</th>
                                <th style={{ padding: '12px 16px' }}>Nominal</th>
                                <th style={{ padding: '12px 16px' }}>Status</th>
                                <th style={{ padding: '12px 24px 12px 16px', textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billingsLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : billings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '32px' }}>Belum ada data tagihan.</td>
                                </tr>
                            ) : billings.map((billing) => (
                                <tr key={billing._id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)', verticalAlign: 'middle', padding: '8px 16px' }}>{billing.student?.name || 'Siswa Dihapus'}</td>
                                    <td style={{ verticalAlign: 'middle', padding: '8px 16px' }}>{billing.monthYear}</td>
                                    <td style={{ verticalAlign: 'middle', padding: '8px 16px' }}>{billing.sessions || 0} <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>Kali</span></td>
                                    <td style={{ fontWeight: 600, verticalAlign: 'middle', padding: '8px 16px' }}>Rp {billing.amount.toLocaleString('id-ID')}</td>
                                    <td style={{ verticalAlign: 'middle', padding: '8px 16px' }}>
                                        <span className="status-tag" style={{
                                            backgroundColor: billing.status === 'Lunas' ? '#dcfce7' : '#fee2e2',
                                            color: billing.status === 'Lunas' ? '#166534' : '#991b1b',
                                            fontSize: '11px'
                                        }}>
                                            {billing.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '8px 24px 8px 16px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handlePrint(billing)} className="btn-action" style={{ color: '#5A57DA' }} title="Cetak Kwitansi">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                                            </button>
                                            <button onClick={() => handleEdit(billing)} className="btn-action" style={{ color: '#F59E0B' }} title="Edit">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                            </button>
                                            <button onClick={() => handleDelete(billing._id)} className="btn-action" style={{ color: '#EF4444' }} title="Hapus">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'white', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                        Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            disabled={page <= 1 || billingsLoading}
                            onClick={() => setPage(page - 1)}
                            className="btn-outline"
                            style={{ padding: '6px 12px', opacity: (page <= 1 || billingsLoading) ? 0.5 : 1, fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                        >
                            Prev
                        </button>
                        <button
                            disabled={page >= totalPages || billingsLoading}
                            onClick={() => setPage(page + 1)}
                            className="btn-outline"
                            style={{ padding: '6px 12px', opacity: (page >= totalPages || billingsLoading) ? 0.5 : 1, fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            <FormModal
                isOpen={isModalOpen}
                onClose={() => resetForm()}
                title={editingId ? 'Edit Tagihan' : 'Tambah Tagihan Baru'}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Siswa</label>
                            <select
                                value={formData.student}
                                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                required
                                style={{ width: '100%' }}
                            >
                                <option value="">Pilih Siswa</option>
                                {Array.isArray(students) && students.map((s) => (
                                    <option key={s._id} value={s._id}>{s.name} - {s.grade}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Bulan & Tahun</label>
                            <input
                                type="text"
                                placeholder="Contoh: Januari 2026"
                                value={formData.monthYear}
                                onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Jumlah Tagihan (Rp)</label>
                            <input
                                type="number"
                                placeholder="Contoh: 300000"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Jumlah Pertemuan</label>
                            <input
                                type="number"
                                placeholder="Contoh: 8"
                                value={formData.sessions}
                                onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Status Pembayaran</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            <option value="Belum Lunas">Belum Lunas</option>
                            <option value="Lunas">Lunas</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-outline" onClick={() => resetForm()} style={{ flex: 1 }}>
                            Batal
                        </button>
                        <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                            {editingId ? 'Update Tagihan' : 'Simpan Tagihan'}
                        </button>
                    </div>
                </form>
            </FormModal>

            {/* Print View */}
            {printData && (
                <div className="print-area" style={{
                    padding: "40px",
                    maxWidth: "640px",
                    margin: "0 auto",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    color: "#333",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.05)"
                }}>
                    <div style={{ textAlign: "center", borderBottom: "4px solid var(--primary)", paddingBottom: "24px", marginBottom: "32px" }}>
                        <h1 style={{ fontSize: "32px", color: "var(--primary)", marginBottom: "4px", fontWeight: 800, letterSpacing: "-0.05em" }}>FrizzieSmartClub</h1>
                        <p style={{ fontSize: "14px", color: "#6B7280", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Struk Tagihan Resmi</p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", padding: "20px", backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                        <div>
                            <p style={{ fontSize: "11px", color: "#6B7280", marginBottom: "6px", letterSpacing: "0.05em", fontWeight: 600 }}>DITERBITKAN OLEH</p>
                            <p style={{ fontWeight: 700, color: "#111827", fontSize: "15px" }}>Admin Ruyatsyah</p>
                            <p style={{ fontSize: "13px", color: "#4B5563" }}>KP. Bojong RT.02/RW01</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "11px", color: "#6B7280", marginBottom: "6px", letterSpacing: "0.05em", fontWeight: 600 }}>TANGGAL CETAK / STATUS</p>
                            <p style={{ fontWeight: 600, color: "#111827", marginBottom: "6px", fontSize: "14px" }}>{new Date().toLocaleDateString("id-ID")}</p>
                            <span style={{
                                display: "inline-block",
                                padding: "6px 16px",
                                borderRadius: "6px",
                                fontSize: "14px",
                                fontWeight: 800,
                                backgroundColor: printData.status === 'Lunas' ? '#ECFDF5' : '#FEF2F2',
                                border: `2px solid ${printData.status === 'Lunas' ? '#10B981' : '#EF4444'}`,
                                color: printData.status === 'Lunas' ? '#10B981' : '#EF4444',
                                letterSpacing: "0.05em",
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact'
                            }}>
                                {printData.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
                        <thead>
                            <tr>
                                <th style={{ padding: "12px", textAlign: "left", color: "#6B7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #E5E7EB" }}>Deskripsi / Siswa</th>
                                <th style={{ padding: "12px", textAlign: "right", color: "#6B7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #E5E7EB" }}>Jumlah Tagihan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: "16px 12px", borderBottom: "1px solid #E5E7EB", color: "#111827", fontWeight: 500 }}>
                                    Biaya Les - <span style={{ fontWeight: 600 }}>{printData.student?.name}</span> <br />
                                    <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 400 }}>Pembiayaan Bulan: {printData.monthYear} | {printData.sessions} Kali Pertemuan</span>
                                </td>
                                <td style={{ padding: "16px 12px", borderBottom: "1px solid #E5E7EB", textAlign: "right", color: "#111827", fontWeight: 600, fontSize: "16px" }}>
                                    Rp {printData.amount.toLocaleString("id-ID")}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: "#F9FAFB" }}>
                                <td style={{ padding: "16px 12px", textAlign: "right", color: "#6B7280", fontWeight: 600, fontSize: "13px" }}>TOTAL DIBAYAR:</td>
                                <td style={{ padding: "16px 12px", textAlign: "right", color: "var(--primary)", fontWeight: 800, fontSize: "18px" }}>
                                    Rp {printData.amount.toLocaleString("id-ID")}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ textAlign: "center", marginTop: "48px", color: "#6B7280", fontSize: "13px", borderTop: "1px dashed #E5E7EB", paddingTop: "24px" }}>
                        <p style={{ fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Terima kasih telah mempercayakan pendidikan di FrizzieSmartClub.</p>
                        <p style={{ fontSize: "12px" }}>Struk ini adalah bukti tagihan digital yang sah tanpa tanda tangan.</p>
                    </div>
                </div>
            )}
            {deleteId && (
                <ConfirmModal
                    title="Hapus Tagihan"
                    message="Apakah Anda yakin ingin menghapus data tagihan ini?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}
