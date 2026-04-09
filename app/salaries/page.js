"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function SalariesPage() {
    const [salaries, setSalaries] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({ teacher: "", amount: "", monthYear: "", sessions: 0, status: "Belum Dibayar" });
    const [editingId, setEditingId] = useState(null);
    const [printData, setPrintData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchSalaries();
        fetchTeachers();
    }, []);

    const fetchSalaries = async () => {
        const res = await fetch("/api/salaries");
        const data = await res.json();
        setSalaries(data);
    };

    const fetchTeachers = async () => {
        const res = await fetch("/api/teachers");
        const data = await res.json();
        setTeachers(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await fetch(`/api/salaries/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            showToast("Data berhasil disimpan di edit!");
            setEditingId(null);
        } else {
            await fetch("/api/salaries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            showToast("Success, gaji tersimpan!");
        }
        setFormData({ teacher: "", amount: "", monthYear: "", sessions: 0, status: "Belum Dibayar" });
        fetchSalaries();
    };

    const handleEdit = (salary) => {
        setEditingId(salary._id);
        setFormData({
            teacher: salary.teacher?._id || "",
            amount: salary.amount,
            sessions: salary.sessions || 0,
            monthYear: salary.monthYear,
            status: salary.status,
        });
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await fetch(`/api/salaries/${deleteId}`, { method: "DELETE" });
        showToast("Data berhasil dihapus!");
        setDeleteId(null);
        fetchSalaries();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ teacher: "", amount: "", monthYear: "", sessions: 0, status: "Belum Dibayar" });
    };

    const handlePrint = (salary) => {
        setPrintData(salary);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div>
            <h1 className="page-title">Manajemen Gaji Guru</h1>

            <div className="card no-print" style={{ marginBottom: "24px" }}>
                <h3>{editingId ? "Edit Gaji" : "Catat Gaji Baru"}</h3>
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    <select
                        value={formData.teacher}
                        onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                        required
                        style={{ flex: 1, minWidth: "200px" }}
                    >
                        <option value="">Pilih Guru</option>
                        {teachers.map((t) => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Jml Mengajar"
                        value={formData.sessions}
                        onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                        required
                        style={{ width: "130px" }}
                    />
                    <input
                        type="number"
                        placeholder="Nominal Gaji (Rp)"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        style={{ flex: 1, minWidth: "150px" }}
                    />
                    <input
                        type="text"
                        placeholder="Bulan & Tahun (Cth: Januari 2026)"
                        value={formData.monthYear}
                        onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                        required
                        style={{ flex: 1, minWidth: "180px" }}
                    />
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{ flex: 1, minWidth: "150px" }}
                    >
                        <option value="Belum Dibayar">Belum Dibayar</option>
                        <option value="Sudah Dibayar">Sudah Dibayar</option>
                    </select>
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

            <div className="card no-print">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nama Guru</th>
                                <th>Bulan/Tahun</th>
                                <th>Kehadiran</th>
                                <th>Nominal</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaries.map((salary) => (
                                <tr key={salary._id}>
                                    <td style={{ fontWeight: 500 }}>{salary.teacher?.name || "Guru Dihapus"}</td>
                                    <td>{salary.monthYear}</td>
                                    <td>{salary.sessions || 0} <span style={{ color: "var(--text-light)", fontSize: "11px" }}>Sesi</span></td>
                                    <td style={{ fontWeight: 600 }}>Rp {salary.amount.toLocaleString("id-ID")}</td>
                                    <td>
                                        <span className="status-tag" style={{
                                            backgroundColor: salary.status === 'Sudah Dibayar' ? 'var(--success)' : 'var(--danger)',
                                            color: 'white',
                                            padding: "4px 10px",
                                            borderRadius: "6px"
                                        }}>
                                            {salary.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                            <button onClick={() => handlePrint(salary)} className="btn-outline" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                🖨️ Cetak
                                            </button>
                                            <button onClick={() => handleEdit(salary)} className="btn-outline" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDelete(salary._id)} className="btn-danger" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {salaries.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", color: "var(--text-light)", padding: "32px" }}>Belum ada data gaji.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.05)" /* Subtle print bounding */
                }}>
                    <div style={{ textAlign: "center", borderBottom: "4px solid var(--success)", paddingBottom: "24px", marginBottom: "32px" }}>
                        <h1 style={{ fontSize: "32px", color: "var(--success)", marginBottom: "4px", fontWeight: 800, letterSpacing: "-0.05em" }}>FrizzieSmartClub</h1>
                        <p style={{ fontSize: "14px", color: "#6B7280", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Struk Pembayaran Gaji / Honor</p>
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
                                padding: "4px 12px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: printData.status === 'Sudah Dibayar' ? '#10B981' : '#EF4444',
                                color: 'white',
                                letterSpacing: "0.05em"
                            }}>
                                {printData.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
                        <thead>
                            <tr>
                                <th style={{ padding: "12px", textAlign: "left", color: "#6B7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #E5E7EB" }}>Deskripsi / Pengajar</th>
                                <th style={{ padding: "12px", textAlign: "right", color: "#6B7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #E5E7EB" }}>Nominal Pembayaran</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: "16px 12px", borderBottom: "1px solid #E5E7EB", color: "#111827", fontWeight: 500 }}>
                                    Honor Pengajar - <span style={{ fontWeight: 600 }}>{printData.teacher?.name}</span> <br />
                                    <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 400 }}>Periode: {printData.monthYear} | Total Mengajar: {printData.sessions} Sesi</span>
                                </td>
                                <td style={{ padding: "16px 12px", borderBottom: "1px solid #E5E7EB", textAlign: "right", color: "#111827", fontWeight: 600, fontSize: "16px" }}>
                                    Rp {printData.amount.toLocaleString("id-ID")}
                                </td>
                            </tr>
                            <tr style={{ backgroundColor: "#F9FAFB" }}>
                                <td style={{ padding: "16px 12px", textAlign: "right", color: "#6B7280", fontWeight: 600, fontSize: "13px" }}>TOTAL DIBAYARKAN:</td>
                                <td style={{ padding: "16px 12px", textAlign: "right", color: "var(--success)", fontWeight: 800, fontSize: "18px" }}>
                                    Rp {printData.amount.toLocaleString("id-ID")}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ textAlign: "center", marginTop: "48px", color: "#6B7280", fontSize: "13px", borderTop: "1px dashed #E5E7EB", paddingTop: "24px" }}>
                        <p style={{ fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Terima kasih atas dedikasi Anda di FrizzieSmartClub.</p>
                        <p style={{ fontSize: "12px" }}>Struk ini adalah bukti pencairan honor digital yang sah.</p>
                    </div>
                </div>
            )}
            {deleteId && (
                <ConfirmModal
                    title="Hapus Gaji"
                    message="Apakah Anda yakin ingin menghapus data gaji ini?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}
