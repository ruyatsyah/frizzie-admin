"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ name: "", contact: "", grade: "" });
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/students");
            const data = await res.json();
            setStudents(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            // UPDATE
            await fetch(`/api/students/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            showToast("Data berhasil disimpan di edit!");
            setEditingId(null);
        } else {
            // CREATE
            await fetch("/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            showToast("Success, data tersimpan!");
        }
        setFormData({ name: "", contact: "", grade: "" });
        fetchStudents();
    };

    const handleEdit = (student) => {
        setEditingId(student._id);
        setFormData({
            name: student.name,
            contact: student.contact,
            grade: student.grade,
        });
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await fetch(`/api/students/${deleteId}`, { method: "DELETE" });
        showToast("Data berhasil dihapus!");
        setDeleteId(null);
        fetchStudents();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", contact: "", grade: "" });
    };

    return (
        <div>
            <h1 className="page-title">Manajemen Data Siswa</h1>

            <div className="card" style={{ marginBottom: "24px" }}>
                <h3>{editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}</h3>
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Nama Lengkap Siswa"
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
                        style={{ flex: 1, minWidth: "150px" }}
                    />
                    <input
                        type="text"
                        placeholder="Kelas (Contoh: 3 SD)"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        required
                        style={{ flex: 1, minWidth: "120px" }}
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
                                <th>Nama Siswa</th>
                                <th>Kontak</th>
                                <th>Kelas</th>
                                <th>Tanggal Daftar</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id}>
                                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                                    <td>{student.contact}</td>
                                    <td>{student.grade}</td>
                                    <td style={{ color: "var(--text-light)" }}>{new Date(student.createdAt).toLocaleDateString("id-ID")}</td>
                                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                            <button onClick={() => handleEdit(student)} className="btn-outline" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDelete(student._id)} className="btn-danger" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", color: "var(--text-light)", padding: "32px" }}>Belum ada data siswa.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {deleteId && (
                <ConfirmModal
                    title="Hapus Data Siswa"
                    message="Apakah Anda yakin ingin menghapus data siswa ini?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}
