"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import FormModal from "@/components/FormModal";

const SUBJECTS = ["Matematika", "IPA", "IPS", "Bhs. Inggris", "Bhs. Indonesia", "Mengaji", "Calistung"];
const STATUSES = ["Hadir", "Izin", "Sakit", "Alpa"];

export default function AttendancePage() {
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Main Form State
    const [formData, setFormData] = useState({
        teacher: "",
        date: new Date().toISOString().split('T')[0],
        studentsTaught: [
            { student: "", subject: "Matematika", status: "Hadir" }
        ],
        notes: ""
    });
    
    const [attendanceList, setAttendanceList] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchInitialData();
        fetchAttendance();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [resT, resS] = await Promise.all([
                fetch("/api/teachers"),
                fetch("/api/students")
            ]);
            setTeachers(await resT.json());
            setStudents(await resS.json());
        } catch (e) {
            console.error("Failed to fetch teachers/students", e);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/attendance");
            const data = await res.json();
            setAttendanceList(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch attendance", e);
        } finally {
            setLoading(false);
        }
    };

    const addStudentRow = () => {
        setFormData({
            ...formData,
            studentsTaught: [...formData.studentsTaught, { student: "", subject: "Matematika", status: "Hadir" }]
        });
    };

    const removeStudentRow = (index) => {
        const newList = [...formData.studentsTaught];
        newList.splice(index, 1);
        setFormData({ ...formData, studentsTaught: newList });
    };

    const updateStudentRow = (index, field, value) => {
        const newList = [...formData.studentsTaught];
        newList[index][field] = value;
        setFormData({ ...formData, studentsTaught: newList });
    };

    const resetForm = () => {
        setFormData({
            teacher: "",
            date: new Date().toISOString().split('T')[0],
            studentsTaught: [{ student: "", subject: "Matematika", status: "Hadir" }],
            notes: ""
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.studentsTaught.some(s => !s.student)) {
            showToast("Harap pilih murid di setiap baris", "error");
            return;
        }

        try {
            const url = editingId ? `/api/attendance/${editingId}` : "/api/attendance";
            const method = editingId ? "PUT" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            
            const result = await res.json();
            
            if (res.ok) {
                showToast(editingId ? "Absensi berhasil diperbarui!" : "Absensi berhasil dicatat!");
                resetForm();
                fetchAttendance();
            } else {
                showToast(result.error || "Gagal menyimpan data", "error");
            }
        } catch (e) {
            showToast("Terjadi kesalahan", "error");
        }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            teacher: item.teacher?._id || "",
            date: item.date.split('T')[0],
            studentsTaught: item.studentsTaught.map(s => ({
                student: s.student?._id || "",
                subject: s.subject,
                status: s.status
            })),
            notes: item.notes || ""
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/attendance/${deleteId}`, { method: "DELETE" });
            const result = await res.json();
            if (res.ok) {
                showToast("Data absensi dihapus!");
                fetchAttendance();
            } else {
                showToast(result.error || "Gagal menghapus", "error");
            }
        } catch (e) {
            showToast("Gagal menghapus data", "error");
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="attendance-container ripple-effect">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Absensi Kehadiran</h1>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }} 
                    className="btn-primary"
                    style={{ backgroundColor: '#5A57DA', borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}
                >
                    + Tambah Sesi Mengajar
                </button>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>History Terakhir</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Menampilkan 20 sesi terakhir</span>
                </div>
                
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Guru Pengajar</th>
                                <th>Detail Sesi</th>
                                <th>Lokasi/Catatan</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px' }}>
                                    <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '10px' }}>⏳</div>
                                    <div>Memuat data...</div>
                                </td></tr>
                            ) : attendanceList.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-light)' }}>Belum ada data absensi. Klik "+ Tambah Sesi" untuk memulai.</td></tr>
                            ) : attendanceList.slice(0, 20).map((item) => (
                                <tr key={item._id}>
                                    <td style={{ fontWeight: 600 }}>{new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td style={{ fontWeight: 600, color: '#5A57DA' }}>{item.teacher?.name}</td>
                                    <td>
                                        <div style={{ fontSize: '13px' }}>
                                            <strong>{item.studentsTaught?.length || 0} Murid</strong>
                                            <div style={{ color: 'var(--text-light)', marginTop: '2px', fontSize: '11px' }}>
                                                {item.studentsTaught?.slice(0, 3).map(s => s.subject).join(", ")}
                                                {(item.studentsTaught?.length || 0) > 3 && " ..."}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                                        {item.notes || "-"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEdit(item)} className="btn-outline" style={{ fontSize: "11px", padding: "6px 10px", borderColor: '#5A57DA', color: '#5A57DA' }}>
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="btn-danger" style={{ fontSize: "11px", padding: "6px 10px" }}>
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Input/Edit Modal */}
            <FormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Sesi Mengajar" : "Input Sesi Mengajar Baru"}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Pilih Guru</label>
                            <select 
                                value={formData.teacher}
                                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                                required
                                style={{ height: '42px' }}
                            >
                                <option value="">-- Pilih Guru --</option>
                                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Tanggal Sesi</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                style={{ height: '42px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 700 }}>Daftar Murid</label>
                            <button type="button" onClick={addStudentRow} className="btn-outline" style={{ fontSize: '12px', padding: '6px 14px', color: '#5A57DA', borderColor: '#5A57DA' }}>
                                + Tambah Murid
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {formData.studentsTaught.map((row, idx) => (
                                <div key={idx} style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '2fr 1.5fr 1fr 40px', 
                                    gap: '12px', 
                                    alignItems: 'center',
                                    padding: '16px',
                                    background: '#F8FAFC',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0'
                                }}>
                                    <select 
                                        value={row.student}
                                        onChange={(e) => updateStudentRow(idx, 'student', e.target.value)}
                                        required
                                        style={{ height: '38px', fontSize: '12px' }}
                                    >
                                        <option value="">Pilih Murid</option>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.grade})</option>)}
                                    </select>
                                    <select 
                                        value={row.subject}
                                        onChange={(e) => updateStudentRow(idx, 'subject', e.target.value)}
                                        style={{ height: '38px', fontSize: '12px' }}
                                    >
                                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select 
                                        value={row.status}
                                        onChange={(e) => updateStudentRow(idx, 'status', e.target.value)}
                                        style={{ 
                                            height: '38px',
                                            fontSize: '11px', 
                                            fontWeight: 700,
                                            color: row.status === 'Hadir' ? 'var(--success)' : (row.status === 'Izin' || row.status === 'Sakit') ? 'var(--warning)' : 'var(--danger)',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button 
                                        type="button" 
                                        onClick={() => removeStudentRow(idx)}
                                        className="btn-danger"
                                        style={{ padding: '8px', minWidth: '34px', borderRadius: '8px' }}
                                        disabled={formData.studentsTaught.length === 1}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Catatan Sesi</label>
                        <textarea 
                            placeholder="Contoh: Belajar Bab Aljabar, Murid sangat aktif..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            style={{ height: '100px', resize: 'none', padding: '12px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1, height: '48px', fontSize: '15px', backgroundColor: '#5A57DA', borderRadius: '12px' }}>
                            {editingId ? "Simpan Perubahan Sesi" : "Simpan Sesi & Kalkulasi Gaji"}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-outline" style={{ height: '48px', padding: '0 24px', borderRadius: '12px' }}>
                            Batal
                        </button>
                    </div>
                </form>
            </FormModal>

            {deleteId && (
                <ConfirmModal
                    title="Hapus Absensi"
                    message="Menghapus sesi ini juga akan mengurangi saldo gaji guru. Jika gaji sudah dibayar, penghapusan akan ditolak otomatis."
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}
