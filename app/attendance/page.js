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
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Filter based on role if teacher
    const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(selectedTeacher && { teacherId: selectedTeacher }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
    });
    const apiUrl = `/api/attendance?${queryParams.toString()}`;
    const { data: swrData, error: swrError, isLoading: swrLoading } = useSWR(mounted && user ? apiUrl : null, fetcher);
    
    // Derived state for easier mapping
    const attendanceList = swrData?.data || [];
    const totalPages = swrData?.totalPages || 1;
    const totalItems = swrData?.totalItems || 0;

    useEffect(() => {
        setMounted(true);
        const authData = localStorage.getItem("frizzie_auth");
        if (authData) {
            const parsedUser = JSON.parse(authData);
            setUser(parsedUser);
            if (parsedUser.role === 'teacher') {
                setFormData(prev => ({ ...prev, teacher: parsedUser.teacherId }));
                setSelectedTeacher(parsedUser.teacherId);
            }
        }
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [resT, resS] = await Promise.all([
                fetch("/api/teachers?limit=1000"),
                fetch("/api/students?limit=1000")
            ]);
            const dataT = await resT.json();
            const dataS = await resS.json();
            setTeachers(dataT.data || []);
            setStudents(dataS.data || []);
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
            teacher: user?.role === 'teacher' ? user.teacherId : "",
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
            {[...Array(7)].map((_, i) => (
                <td key={i} style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '20px', width: i === 3 ? '150px' : '80px' }}></div>
                </td>
            ))}
        </tr>
    );

    if (!mounted) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #5A57DA', borderRadius: '50%' }}></div>
        </div>
    );

    return (
        <div className="ripple-effect fade-in-up">
            <div className="no-print" style={{ paddingBottom: '40px' }}>
                
                {/* Main Integrated Card */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'white' }}>
                    
                    {/* Integrated Card Header with Title and Add Button */}
                    <div style={{ backgroundColor: 'white', padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#2D3748', letterSpacing: '-0.01em' }}>
                            Riwayat Sesi Terakhir
                        </h3>
                        <button 
                            onClick={() => { resetForm(); setIsModalOpen(true); }} 
                            className="btn-primary"
                            style={{ borderRadius: '8px', height: '34px', padding: '0 12px', gap: '6px', fontSize: '13px', fontWeight: 500, backgroundColor: '#4F46E5' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                            Tambah Sesi
                        </button>
                    </div>

                    {/* Integrated Table Area with Balanced Padding */}
                    <div className="table-wrapper no-mobile" style={{ margin: 0, padding: '24px 24px 12px 24px' }}>
                        <table className="data-table data-table-compact" style={{ fontSize: '13px', border: 'none', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: 'white', borderTop: '1px solid #E2E8F0', borderBottom: '2px solid #E2E8F0' }}>
                                <tr>
                                    <th style={{ width: '50px', textAlign: 'center', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>#</th>
                                    <th style={{ width: '150px', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Tanggal</th>
                                    <th style={{ verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Guru Pengajar</th>
                                    <th style={{ verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Detail Sesi</th>
                                    <th style={{ width: '80px', textAlign: 'center', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>CP</th>
                                    <th style={{ verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Lokasi/Catatan</th>
                                    <th style={{ textAlign: "right", width: '100px', verticalAlign: 'middle', borderBottom: '2px solid #E2E8F0', color: '#4A5568' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="zebra-rows">
                                {swrLoading ? (
                                    Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)
                                ) : attendanceList.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>Belum ada data absensi. Klik "+ Tambah Sesi" untuk memulai.</td></tr>
                                ) : attendanceList.map((item, index) => (
                                    <tr key={item._id} className="row-hover" style={{ backgroundColor: 'white' }}>
                                        <td style={{ textAlign: 'center', color: '#94A3B8', fontSize: '11px', verticalAlign: 'middle', padding: '12px 8px' }}>{(page - 1) * 10 + index + 1}</td>
                                        <td style={{ color: 'var(--text-dark)', fontWeight: 500, verticalAlign: 'middle', padding: '12px 8px' }}>{new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--primary)', verticalAlign: 'middle', padding: '12px 8px' }}>{item.teacher?.name}</td>
                                        <td style={{ verticalAlign: 'middle', padding: '12px 8px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{item.studentsTaught?.length || 0} Murid di Sesi Ini:</span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {item.studentsTaught?.map((s, idx) => (
                                                        <span key={idx} style={{ 
                                                            backgroundColor: '#F1F5F9', 
                                                            color: '#334155', 
                                                            fontSize: '10px', 
                                                            padding: '2px 8px', 
                                                            borderRadius: '6px',
                                                            whiteSpace: 'nowrap',
                                                            fontWeight: 600
                                                        }}>
                                                            {s.student?.name} <span style={{ opacity: 0.6 }}>•</span> {s.subject}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'middle', textAlign: 'center', padding: '12px 8px' }}>
                                            <span style={{ 
                                                padding: '2px 8px', 
                                                borderRadius: '6px', 
                                                fontSize: '11px', 
                                                fontWeight: 800,
                                                backgroundColor: item.cpCount >= item.studentCount ? '#DCFCE7' : (item.cpCount > 0 ? '#FEF9C3' : '#FEE2E2'),
                                                color: item.cpCount >= item.studentCount ? '#166534' : (item.cpCount > 0 ? '#854D0E' : '#991B1B'),
                                            }}>
                                                {item.cpCount}/{item.studentCount}
                                            </span>
                                        </td>

                                        <td style={{ color: '#64748B', fontSize: '12px', verticalAlign: 'middle', padding: '12px 8px' }}>
                                            <div style={{ fontStyle: item.notes ? 'normal' : 'italic', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notes || "Tidak ada catatan"}</div>
                                        </td>
                                        <td style={{ textAlign: "right", verticalAlign: 'middle', padding: '12px 8px' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleEdit(item)} className="btn-action" style={{ color: 'var(--primary)' }} title="Edit">
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

                    {/* Pagination Controls (INSIDE CARD - BALANCED STYLE) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 24px 24px', backgroundColor: 'white' }}>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                            Data: <strong>{(page-1)*10+1}–{Math.min(page*10, totalItems || 0)}</strong> dari <strong>{totalItems || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                                disabled={page <= 1 || swrLoading}
                                onClick={() => setPage(page - 1)}
                                className="btn-outline"
                                style={{ height: '32px', padding: '0 12px', borderRadius: '6px', fontSize: '12px', opacity: (page <= 1 || swrLoading) ? 0.4 : 1, backgroundColor: 'white' }}
                            >
                                Prev
                            </button>
                            <button 
                                disabled={page >= totalPages || swrLoading}
                                onClick={() => setPage(page + 1)}
                                className="btn-outline"
                                style={{ height: '32px', padding: '0 12px', borderRadius: '6px', fontSize: '12px', opacity: (page >= totalPages || swrLoading) ? 0.4 : 1, backgroundColor: 'white' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

            {/* Input/Edit Modal - Premium Redesign */}
            <FormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={editingId ? "Edit Sesi Mengajar" : "Input Sesi Mengajar Baru"}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '8px' }}>
                    
                    {/* Primary Info: Teacher & Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Pilih Guru</label>
                            {user?.role === 'teacher' ? (
                                <div style={{ 
                                    height: '42px', 
                                    backgroundColor: '#F8FAFC', 
                                    border: '1px solid #E2E8F0', 
                                    borderRadius: '10px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    padding: '0 12px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: '#1E293B'
                                }}>
                                    {user.name}
                                </div>
                            ) : (
                                <select 
                                    value={formData.teacher}
                                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                                    required
                                    style={{ height: '42px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 500, backgroundColor: '#F9FAFB' }}
                                >
                                    <option value="">-- Pilih Guru --</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Tanggal Sesi</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                style={{ height: '42px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 500, backgroundColor: '#F9FAFB' }}
                            />
                        </div>
                    </div>

                    {/* Students List Section */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Daftar Murid</h4>
                            <button 
                                type="button" 
                                onClick={addStudentRow} 
                                style={{ 
                                    fontSize: '11.5px', 
                                    fontWeight: 500, 
                                    color: '#4F46E5', 
                                    background: '#EEF2FF', 
                                    border: '1px dashed #C7D2FE', 
                                    padding: '6px 14px', 
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                                Tambah Murid
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {formData.studentsTaught.map((row, idx) => (
                                <div key={idx} style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1.5fr 1fr 100px 38px', 
                                    gap: '10px', 
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                }}>
                                    <select 
                                        value={row.student}
                                        onChange={(e) => updateStudentRow(idx, 'student', e.target.value)}
                                        required
                                        style={{ height: '36px', fontSize: '12.5px', border: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', borderRadius: '6px' }}
                                    >
                                        <option value="">Pilih Murid</option>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.grade})</option>)}
                                    </select>
                                    <select 
                                        value={row.subject}
                                        onChange={(e) => updateStudentRow(idx, 'subject', e.target.value)}
                                        style={{ height: '36px', fontSize: '12.5px', border: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', borderRadius: '6px' }}
                                    >
                                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select 
                                        value={row.status}
                                        onChange={(e) => updateStudentRow(idx, 'status', e.target.value)}
                                        style={{ 
                                            height: '36px',
                                            fontSize: '11px', 
                                            fontWeight: 800,
                                            color: row.status === 'Hadir' ? '#059669' : (row.status === 'Izin' || row.status === 'Sakit') ? '#D97706' : '#DC2626',
                                            backgroundColor: row.status === 'Hadir' ? '#ECFDF5' : (row.status === 'Izin' || row.status === 'Sakit') ? '#FFFBEB' : '#FEF2F2',
                                            border: 'none',
                                            borderRadius: '6px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button 
                                        type="button" 
                                        onClick={() => removeStudentRow(idx)}
                                        style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '8px', 
                                            border: 'none', 
                                            backgroundColor: '#FEE2E2', 
                                            color: '#1E293B', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            lineHeight: 1,
                                            opacity: formData.studentsTaught.length === 1 ? 0.3 : 1
                                        }}
                                        disabled={formData.studentsTaught.length === 1}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#64748B', textTransform: 'uppercase' }}>Catatan Sesi</label>
                        <textarea 
                            placeholder="Tuliskan perkembangan belajar atau catatan khusus untuk sesi ini..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            style={{ height: '80px', resize: 'none', padding: '12px', fontSize: '13px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB' }}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1.5, height: '48px', fontSize: '14px', fontWeight: 700, backgroundColor: '#4F46E5', borderRadius: '12px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>
                            {editingId ? "Simpan Perubahan Sesi" : "Selesaikan & Rekap Sesi"}
                        </button>
                        <button type="button" onClick={resetForm} className="btn-outline" style={{ flex: 1, height: '48px', padding: '0 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#64748B' }}>
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
        </div>
    );
}
