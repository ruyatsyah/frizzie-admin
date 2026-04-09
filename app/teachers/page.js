"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({ name: "", contact: "" });
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
        if (editingId) {
            await fetch(`/api/teachers/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            showToast("Data berhasil disimpan di edit!");
            setEditingId(null);
        } else {
            await fetch("/api/teachers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            showToast("Success, data tersimpan!");
        }
        setFormData({ name: "", contact: "" });
        fetchTeachers();
    };

    const handleEdit = (teacher) => {
        setEditingId(teacher._id);
        setFormData({
            name: teacher.name,
            contact: teacher.contact,
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
        setFormData({ name: "", contact: "" });
    };

    return (
        <div>
            <h1 className="page-title">Manajemen Data Guru</h1>

            <div className="card" style={{ marginBottom: "24px" }}>
                <h3>{editingId ? "Edit Data Guru" : "Tambah Guru Baru"}</h3>
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
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
                    <div style={{ display: "flex", gap: "8px" }}>
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
                                <th>Tanggal Bergabung</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(teachers) && teachers.map((teacher) => (
                                <tr key={teacher._id}>
                                    <td style={{ fontWeight: 500 }}>{teacher.name}</td>
                                    <td>{teacher.contact}</td>
                                    <td style={{ color: "var(--text-light)" }}>{new Date(teacher.createdAt).toLocaleDateString("id-ID")}</td>
                                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                            <button onClick={() => handleEdit(teacher)} className="btn-outline" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDelete(teacher._id)} className="btn-danger" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                🗑️ Hapus
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
