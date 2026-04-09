"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function BillingsPage() {
    const [billings, setBillings] = useState([]);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({ student: "", amount: "", monthYear: "", sessions: 0, status: "Belum Lunas" });
    const [editingId, setEditingId] = useState(null);
    const [printData, setPrintData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchBillings();
        fetchStudents();
    }, []);

    const fetchBillings = async () => {
        try {
            const res = await fetch("/api/billings");
            const data = await res.json();
            if (Array.isArray(data)) {
                setBillings(data);
            } else {
                console.error("Data is not an array:", data);
                setBillings([]);
            }
        } catch (e) {
            console.error(e);
            setBillings([]);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/students");
            const data = await res.json();
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                console.error("Data is not an array:", data);
                setStudents([]);
            }
        } catch (e) {
            console.error(e);
            setStudents([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await fetch(`/api/billings/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            showToast("Data berhasil disimpan di edit!");
            setEditingId(null);
        } else {
            await fetch("/api/billings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            showToast("Success, tagihan tersimpan!");
        }
        setFormData({ student: "", amount: "", monthYear: "", sessions: 0, status: "Belum Lunas" });
        fetchBillings();
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
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await fetch(`/api/billings/${deleteId}`, { method: "DELETE" });
        showToast("Data berhasil dihapus!");
        setDeleteId(null);
        fetchBillings();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ student: "", amount: "", monthYear: "", sessions: 0, status: "Belum Lunas" });
    };

    const handlePrint = (billing) => {
        setPrintData(billing);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div>
            <h1 className="page-title">Manajemen Tagihan Siswa</h1>

            <div className="card no-print" style={{ marginBottom: "24px" }}>
                <h3>{editingId ? "Edit Tagihan" : "Buat Tagihan Baru"}</h3>
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    <select
                        value={formData.student}
                        onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                        required
                        style={{ flex: 1, minWidth: "200px" }}
                    >
                        <option value="">Pilih Siswa</option>
                        {Array.isArray(students) && students.map((s) => (
                            <option key={s._id} value={s._id}>{s.name} - {s.grade}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Jml Pertemuan"
                        value={formData.sessions}
                        onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                        required
                        style={{ width: "130px" }}
                    />
                    <input
                        type="number"
                        placeholder="Jumlah Tagihan (Rp)"
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
                        <option value="Belum Lunas">Belum Lunas</option>
                        <option value="Lunas">Lunas</option>
                    </select>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button type="submit" className="btn-primary" style={{ whiteSpace: "nowrap" }}>
                            {editingId ? "Update Tagihan" : "Simpan Tagihan"}
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
                                <th>Nama Siswa</th>
                                <th>Bulan/Tahun</th>
                                <th>Pertemuan</th>
                                <th>Nominal</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(billings) && billings.map((billing) => (
                                <tr key={billing._id}>
                                    <td style={{ fontWeight: 500 }}>{billing.student?.name || "Siswa Dihapus"}</td>
                                    <td>{billing.monthYear}</td>
                                    <td>{billing.sessions || 0} <span style={{ color: "var(--text-light)", fontSize: "11px" }}>Kali</span></td>
                                    <td style={{ fontWeight: 600 }}>Rp {billing.amount.toLocaleString("id-ID")}</td>
                                    <td>
                                        <span className="status-tag" style={{
                                            backgroundColor: billing.status === 'Lunas' ? 'var(--success)' : 'var(--danger)',
                                            color: 'white',
                                            padding: "4px 10px",
                                            borderRadius: "6px"
                                        }}>
                                            {billing.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                            <button onClick={() => handlePrint(billing)} className="btn-outline" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                🖨️ Cetak
                                            </button>
                                            <button onClick={() => handleEdit(billing)} className="btn-outline" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDelete(billing._id)} className="btn-danger" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!Array.isArray(billings) || billings.length === 0) && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", color: "var(--text-light)", padding: "32px" }}>Belum ada data tagihan.</td>
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
                                padding: "4px 12px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: printData.status === 'Lunas' ? '#10B981' : '#EF4444',
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
