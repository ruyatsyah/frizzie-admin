"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import FormModal from "@/components/FormModal";

export default function TeachersPage() {
    const [mounted, setMounted] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({ name: "", contact: "", email: "", password: "" });
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // useSWR for fetching teachers with pagination and search
    const { data: swrData, error, mutate, isLoading } = useSWR(
        mounted ? `/api/teachers?page=${page}&limit=10&search=${search}` : null,
        fetcher,
        { keepPreviousData: true }
    );

    const teachers = swrData?.data || [];
    const totalPages = swrData?.totalPages || 1;

    useEffect(() => {
        setMounted(true);
    }, []);

    const resetForm = () => {
        setFormData({ name: "", contact: "", email: "", password: "" });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = editingId ? `/api/teachers/${editingId}` : "/api/teachers";
            const method = editingId ? "PUT" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToast(editingId ? "Data guru berhasil diperbarui!" : "Guru baru berhasil ditambahkan!");
                resetForm();
                mutate(); // Refresh SWR data
            } else {
                const errData = await res.json();
                showToast(errData.error || "Gagal menyimpan data", "error");
            }
        } catch (err) {
            showToast("Terjadi kesalahan sistem", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (teacher) => {
        setEditingId(teacher._id);
        setFormData({
            name: teacher.name,
            contact: teacher.contact,
            email: teacher.email || "",
            password: teacher.password || ""
        });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/teachers/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Data guru berhasil dihapus");
                setDeleteId(null);
                mutate();
            } else {
                showToast("Gagal menghapus data", "error");
            }
        } catch (err) {
            showToast("Kesalahan sistem saat menghapus", "error");
        }
    };

    const SkeletonRow = () => (
        <tr>
            <td><div className="skeleton" style={{ height: '20px', width: '30px', margin: '0 auto' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '150px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '120px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '120px' }}></div></td>
            <td style={{ textAlign: "right" }}><div className="skeleton" style={{ height: '30px', width: '80px', marginLeft: 'auto' }}></div></td>
        </tr>
    );

    if (!mounted) return null;

    return (
        <div className="ripple-effect">
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'white', marginBottom: '24px' }}>
                {/* Card Title */}
                <div style={{ backgroundColor: 'white', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#2D3748', letterSpacing: '-0.01em' }}>
                        Manajemen Data Guru
                    </h3>
                </div>

                {/* Management Bar (Inside Card) */}
                <div style={{ padding: '16px 24px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Cari nama guru..." 
                            value={search} 
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            style={{ paddingLeft: '38px', height: '38px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', fontSize: '13px', outline: 'none', transition: 'all 0.2s', backgroundColor: '#F9FAFB' }}
                            className="search-input-focus"
                        />
                    </div>
                    <button 
                        onClick={() => { resetForm(); setIsModalOpen(true); }} 
                        className="btn-primary" 
                        style={{ height: '38px', padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 500 }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                        Tambah Guru
                    </button>
                </div>

                <div className="table-wrapper" style={{ margin: 0, padding: '0 24px 12px 24px' }}>
                    <table className="data-table" style={{ border: 'none', borderCollapse: 'collapse', margin: 0, width: '100%' }}>
                        <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ width: '50px', textAlign: 'center', verticalAlign: 'middle', borderBottom: 'none', padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                                <th style={{ verticalAlign: 'middle', borderBottom: 'none', padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NAMA GURU</th>
                                <th style={{ verticalAlign: 'middle', borderBottom: 'none', padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KONTAK</th>
                                <th style={{ verticalAlign: 'middle', borderBottom: 'none', padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EMAIL LOGIN</th>
                                <th style={{ textAlign: "right", verticalAlign: 'middle', borderBottom: 'none', padding: '12px 24px 12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="zebra-rows">
                            {isLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : teachers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", color: "var(--text-light)", padding: "32px 24px" }}>
                                        {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada data guru."}
                                    </td>
                                </tr>
                            ) : teachers.map((teacher, index) => (
                                <tr key={teacher._id}>
                                    <td style={{ textAlign: 'center', color: '#94A3B8', fontSize: '12px', verticalAlign: 'middle', padding: '8px 16px' }}>
                                        {index + 1 + (page - 1) * 10}
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)', verticalAlign: 'middle', padding: '8px 16px' }}>{teacher.name}</td>
                                    <td style={{ verticalAlign: 'middle', padding: '8px 16px' }}>{teacher.contact}</td>
                                    <td style={{ color: "var(--primary)", fontSize: "12px", verticalAlign: 'middle', padding: '8px 16px' }}>{teacher.email || "-"}</td>
                                    <td style={{ textAlign: "right", whiteSpace: "nowrap", verticalAlign: 'middle', padding: '8px 24px 8px 16px' }}>
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                            <button onClick={() => handleEdit(teacher)} className="btn-action" style={{ color: '#F59E0B' }} title="Edit">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                            </button>
                                            <button onClick={() => setDeleteId(teacher._id)} className="btn-action" style={{ color: '#EF4444' }} title="Hapus">
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
                        Data: <strong>{(page - 1) * 10 + 1}-{Math.min(page * 10, totalPages * 10)}</strong> dari <strong>{totalPages * 10}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            disabled={page <= 1 || isLoading}
                            onClick={() => setPage(page - 1)}
                            className="btn-outline"
                            style={{ padding: '6px 12px', opacity: (page <= 1 || isLoading) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                        >
                            
                            Prev
                        </button>
                        <button 
                            disabled={page >= totalPages || isLoading}
                            onClick={() => setPage(page + 1)}
                            className="btn-outline"
                            style={{ padding: '6px 12px', opacity: (page >= totalPages || isLoading) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
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
                title={editingId ? "Edit Data Guru" : "Tambah Guru Baru"}
            >
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Nama Lengkap Guru</label>
                            <input
                                type="text"
                                placeholder="Nama Lengkap"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>No. WhatsApp / Kontak</label>
                            <input
                                type="text"
                                placeholder="Contoh: 62812..."
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Email Login (Opsional)</label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Password Login</label>
                            <input
                                type="text"
                                placeholder="Masukkan Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px", marginTop: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-outline" onClick={() => resetForm()} style={{ flex: 1 }}>
                            Batal
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                            {isSubmitting ? "Memproses..." : (editingId ? "Update Data" : "Simpan Data")}
                        </button>
                    </div>
                </form>
            </FormModal>

            {deleteId && (
                <ConfirmModal
                    title="Hapus Data Guru"
                    message="Apakah Anda yakin ingin menghapus data guru ini?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}
