"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({ name: "", contact: "", email: "", password: "" });
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await fetch("/api/teachers");
            const data = await res.json();
            if (Array.isArray(data)) {
                setTeachers(data);
            } else {
                console.error("Data is not an array:", data);
                setTeachers([]);
            }
        } catch (e) {
            console.error(e);
            setTeachers([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(editingId ? `/api/teachers/${editingId}` : "/api/teachers", {
                method: editingId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            
            if (res.ok) {
                showToast(editingId ? "Data berhasil diupdate!" : "Data berhasil disimpan!");
                setEditingId(null);
                setFormData({ name: "", contact: "", email: "", password: "" });
                fetchTeachers();
            } else {
                const errData = await res.json();
                showToast(errData.error || "Gagal menyimpan data", "error");
            }
        } catch (err) {
            showToast("Terjadi kesalahan jaringan", "error");
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
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await fetch(`/api/teachers/${deleteId}`, { method: "DELETE" });
        showToast("Data berhasil dihapus!");
        setDeleteId(null);
        fetchTeachers();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", contact: "", email: "", password: "" });
    };

    return (
        <div>
            <h1 className="page-title">Manajemen Data Guru</h1>

            <div className="card" style={{ marginBottom: "24px" }}>
                <h3>{editingId ? "Edit Data Guru" : "Tambah Guru Baru"}</h3>
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "16px", width: "100%", flexWrap: "wrap" }}>
                        <input
                            type="text"
                            placeholder="Nama Lengkap Guru"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{ flex: 1, minWidth: "200px" }}
                        />
                        <input
                            type="text"
                            placeholder="No. WhatsApp / Kontak"
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            required
                            style={{ flex: 1, minWidth: "200px" }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "16px", width: "100%", flexWrap: "wrap" }}>
                        <input
                            type="email"
                            placeholder="Email Login (Optional)"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ flex: 1, minWidth: "200px" }}
                        />
                        <input
                            type="text"
                            placeholder="Password Login"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ flex: 1, minWidth: "200px" }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end" }}>
                        <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap" }}>
                            {editingId ? "Update Data" : "Simpan Data"}
                        </button>
                        {editingId && (
                            <button type="button" className="btn-outline" onClick={cancelEdit}>
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nama Guru</th>
                                <th>Kontak</th>
                                <th>Email Login</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(teachers) && teachers.map((teacher) => (
                                <tr key={teacher._id}>
                                    <td style={{ fontWeight: 500 }}>{teacher.name}</td>
                                    <td>{teacher.contact}</td>
                                    <td style={{ color: "var(--primary)", fontSize: "13px" }}>{teacher.email || "-"}</td>
                                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                            <button onClick={() => handleEdit(teacher)} className="btn-action" style={{ color: '#F59E0B' }} title="Edit">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                            </button>
                                            <button onClick={() => handleDelete(teacher._id)} className="btn-action" style={{ color: '#EF4444' }} title="Hapus">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!Array.isArray(teachers) || teachers.length === 0) && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center", color: "var(--text-light)", padding: "32px" }}>Belum ada data guru.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
