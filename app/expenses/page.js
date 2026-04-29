"use client";
import { useState, useEffect } from "react";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import FormModal from "@/components/FormModal";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        category: "Operasional",
        description: ""
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await fetch("/api/expenses");
            const data = await res.json();
            setExpenses(data);
            setLoading(false);
        } catch (error) {
            showToast("Gagal mengambil data pengeluaran", "error");
        }
    };

    const resetForm = () => {
        setEditingExpense(null);
        setFormData({
            title: "",
            amount: "",
            date: new Date().toISOString().split('T')[0],
            category: "Operasional",
            description: ""
        });
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const method = editingExpense ? "PUT" : "POST";
        const url = editingExpense ? `/api/expenses/${editingExpense._id}` : "/api/expenses";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToast(editingExpense ? "Pengeluaran diperbarui" : "Pengeluaran ditambahkan", "success");
                resetForm();
                fetchExpenses();
            }
        } catch (error) {
            showToast("Gagal menyimpan data", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/expenses/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Pengeluaran dihapus", "success");
                setDeleteId(null);
                fetchExpenses();
            }
        } catch (error) {
            showToast("Gagal menghapus data", "error");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="fade-in">
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'white', marginBottom: '24px' }}>
                {/* Card Title */}
                <div style={{ backgroundColor: 'white', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#2D3748', letterSpacing: '-0.01em' }}>
                        Manajemen Pengeluaran Operasional
                    </h3>
                </div>

                {/* Management Bar */}
                <div style={{ padding: '16px 24px', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button 
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="btn-primary"
                        style={{ height: '38px', padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 500 }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                        Tambah Pengeluaran
                    </button>
                </div>

                <div className="table-wrapper" style={{ margin: 0, padding: '0 24px 12px 24px' }}>
                    <table className="data-table" style={{ border: 'none', borderCollapse: 'collapse', margin: 0, width: '100%' }}>
                        <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ width: '50px', textAlign: 'center', padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TANGGAL</th>
                                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KETERANGAN</th>
                                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KATEGORI</th>
                                <th style={{ padding: '12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JUMLAH</th>
                                <th style={{ textAlign: "right", padding: '12px 24px 12px 16px', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="zebra-rows">
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Memuat data...</td></tr>
                            ) : expenses.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Belum ada data pengeluaran.</td></tr>
                            ) : (
                                expenses.map((expense, index) => (
                                    <tr key={expense._id}>
                                        <td style={{ textAlign: 'center', color: '#94A3B8', fontSize: '12px', padding: '12px 16px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px 16px' }}>{new Date(expense.date).toLocaleDateString('id-ID')}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{expense.title}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{expense.description}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', 
                                                borderRadius: '20px', 
                                                fontSize: '11px', 
                                                fontWeight: 600,
                                                backgroundColor: '#F1F5F9',
                                                color: '#475569'
                                            }}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#e11d48', padding: '12px 16px' }}>
                                            {formatCurrency(expense.amount)}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '12px 24px 12px 16px' }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button 
                                                    onClick={() => {
                                                        setEditingExpense(expense);
                                                        setFormData({
                                                            title: expense.title,
                                                            amount: expense.amount,
                                                            date: new Date(expense.date).toISOString().split('T')[0],
                                                            category: expense.category,
                                                            description: expense.description || ""
                                                        });
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="btn-action" 
                                                    style={{ color: '#F59E0B' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteId(expense._id)}
                                                    className="btn-action" 
                                                    style={{ color: '#EF4444' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            <FormModal 
                isOpen={isModalOpen} 
                onClose={() => resetForm()} 
                title={editingExpense ? "Edit Pengeluaran" : "Tambah Pengeluaran Baru"}
            >
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Keterangan / Judul</label>
                        <input 
                            type="text" 
                            placeholder="Contoh: Pembelian Alat Tulis"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required 
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Jumlah (IDR)</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Tanggal</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required 
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Kategori</label>
                        <select 
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'white' }}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Operasional">Operasional</option>
                            <option value="Sarana Prasarana">Sarana Prasarana</option>
                            <option value="Kegiatan Siswa">Kegiatan Siswa</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#475569' }}>Deskripsi Tambahan</label>
                        <textarea 
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                        ></textarea>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-outline" onClick={() => resetForm()} style={{ flex: 1 }}>
                            Batal
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                            {isSubmitting ? "Memproses..." : (editingExpense ? "Update Data" : "Simpan Data")}
                        </button>
                    </div>
                </form>
            </FormModal>

            {deleteId && (
                <ConfirmModal
                    title="Hapus Pengeluaran"
                    message="Apakah Anda yakin ingin menghapus catatan pengeluaran ini?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}

