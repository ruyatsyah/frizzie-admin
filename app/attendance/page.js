"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useSWR, { mutate } from "swr";
import fetcher from "@/lib/fetcher";
import { showToast } from "@/components/Toast";

// Lazy load heavy components
const FormModal = dynamic(() => import("@/components/FormModal"), { ssr: false });
const ConfirmModal = dynamic(() => import("@/components/ConfirmModal"), { ssr: false });

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
    
    const [user, setUser] = useState(null);
    const [page, setPage] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Filter based on role if teacher
    const apiUrl = `/api/attendance?page=${page}&limit=10`;
    const { data: swrData, error: swrError, isLoading: swrLoading } = useSWR(mounted && user ? apiUrl : null, fetcher);
    
    // Derived state for easier mapping
    const attendanceList = swrData?.data || [];
    const totalPages = swrData?.totalPages || 1;

    useEffect(() => {
        setMounted(true);
        const authData = localStorage.getItem("frizzie_auth");
        if (authData) {
            const parsedUser = JSON.parse(authData);
            setUser(parsedUser);
            if (parsedUser.role === 'teacher') {
                setFormData(prev => ({ ...prev, teacher: parsedUser.teacherId }));
            }
        }
        fetchInitialData();
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

    // fetchAttendance is now handled by SWR auto-revalidation and manually via mutate()
    const refreshData = () => {
        mutate(apiUrl);
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
                refreshData();
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
                refreshData();
            } else {
                showToast(result.error || "Gagal menghapus", "error");
            }
        } catch (e) {
            showToast("Gagal menghapus data", "error");
        } finally {
            setDeleteId(null);
        }
    };

    const SkeletonRow = () => (
        <tr>
            <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '120px' }}></div></td>
            <td><div className="skeleton" style={{ height: '32px', width: '100%' }}></div></td>
            <td><div className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '20px' }}></div></td>
            <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>
            <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ height: '32px', width: '60px', marginLeft: 'auto' }}></div></td>
        </tr>
    );

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
                                <th>Status Laporan (CP)</th>
                                <th>Lokasi/Catatan</th>
                                <th style={{ textAlign: "right" }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {swrLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : attendanceList.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-light)' }}>Belum ada data absensi. Klik "+ Tambah Sesi" untuk memulai.</td></tr>
                            ) : attendanceList.map((item) => (
                                <tr key={item._id}>
                                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td style={{ fontWeight: 600, color: '#5A57DA' }}>{item.teacher?.name}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{item.studentsTaught?.length || 0} Murid di Sesi Ini:</span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {item.studentsTaught?.map((s, idx) => (
                                                    <span key={idx} style={{ 
                                                        backgroundColor: '#f1f5f9', 
                                                        color: '#475569', 
                                                        fontSize: '10px', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '99px',
                                                        border: '1px solid #e2e8f0',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {s.student?.name} • {s.subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', 
                                                borderRadius: '20px', 
                                                fontSize: '11px', 
                                                fontWeight: 700,
                                                backgroundColor: item.cpCount >= item.studentCount ? '#dcfce7' : (item.cpCount > 0 ? '#fef9c3' : '#fee2e2'),
                                                color: item.cpCount >= item.studentCount ? '#166534' : (item.cpCount > 0 ? '#854d0e' : '#991b1b'),
                                                border: '1px solid currentColor',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {item.cpCount >= item.studentCount ? '✅ Lengkap' : (item.cpCount > 0 ? '⏳ Sebagian' : '❌ Belum')}
                                                <span style={{ opacity: 0.7 }}>({item.cpCount}/{item.studentCount})</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                                        <div style={{ fontStyle: item.notes ? 'normal' : 'italic' }}>{item.notes || "Tidak ada catatan"}</div>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button onClick={() => handleEdit(item)} className="btn-action" style={{ color: '#F59E0B' }} title="Edit">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="btn-action" style={{ color: '#EF4444' }} title="Hapus">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                        Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            disabled={page <= 1 || swrLoading}
                            onClick={() => setPage(page - 1)}
                            className="btn-outline"
                            style={{ padding: '6px 16px', opacity: (page <= 1 || swrLoading) ? 0.5 : 1 }}
                        >
                            Sebelumnya
                        </button>
                        <button 
                            disabled={page >= totalPages || swrLoading}
                            onClick={() => setPage(page + 1)}
                            className="btn-outline"
                            style={{ padding: '6px 16px', opacity: (page >= totalPages || swrLoading) ? 0.5 : 1 }}
                        >
                            Selanjutnya
                        </button>
                    </div>
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
                            {user?.role === 'teacher' ? (
                                <input 
                                    type="text" 
                                    value={user.name} 
                                    readOnly 
                                    style={{ height: '42px', backgroundColor: '#F1F5F9', cursor: 'not-allowed' }} 
                                />
                            ) : (
                                <select 
                                    value={formData.teacher}
                                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                                    required
                                    style={{ height: '42px' }}
                                >
                                    <option value="">-- Pilih Guru --</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            )}
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
