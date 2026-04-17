"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import ConfirmModal from "@/components/ConfirmModal";

const SUBJECTS = ["Matematika", "IPA", "IPS", "Bhs. Inggris", "Bhs. Indonesia", "Mengaji", "Calistung"];

export default function LearningOutcomesPage() {
    const [user, setUser] = useState(null);
    const [list, setList] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    
    // Admin Filters & Evaluation
    const [adminFilters, setAdminFilters] = useState({
        studentId: "",
        startDate: "",
        endDate: ""
    });
    const [evaluationData, setEvaluationData] = useState({
        progresBelajar: "",
        kebutuhanDitingkatkan: "",
        saranPengembangan: ""
    });
    const [isSavingEval, setIsSavingEval] = useState(false);

    const [formData, setFormData] = useState({
        student: "",
        subject: "Matematika",
        material: "",
        achievement: "",
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const authData = localStorage.getItem("frizzie_auth");
        if (authData) {
            const parsedUser = JSON.parse(authData);
            setUser(parsedUser);
            fetchData(parsedUser, adminFilters);
            fetchStudents();
        }
    }, []);

    // Re-fetch when admin filters change
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchData(user, adminFilters);
            if (adminFilters.studentId && adminFilters.startDate && adminFilters.endDate) {
                fetchEvaluation();
            }
        }
    }, [adminFilters]);

    const fetchData = async (currUser, filters = {}) => {
        setLoading(true);
        try {
            let url = currUser.role === 'teacher' 
                ? `/api/learning-outcomes?teacherId=${currUser.teacherId}`
                : `/api/learning-outcomes?studentId=${filters.studentId}&startDate=${filters.startDate}&endDate=${filters.endDate}`;
            
            const res = await fetch(url);
            const data = await res.json();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvaluation = async () => {
        try {
            const res = await fetch(`/api/learning-evaluations?studentId=${adminFilters.studentId}&startDate=${adminFilters.startDate}&endDate=${adminFilters.endDate}`);
            const data = await res.json();
            setEvaluationData({
                progresBelajar: data.progresBelajar || "",
                kebutuhanDitingkatkan: data.kebutuhanDitingkatkan || "",
                saranPengembangan: data.saranPengembangan || ""
            });
        } catch (e) { console.error(e); }
    };

    const handleSaveEvaluation = async () => {
        if (!adminFilters.studentId || !adminFilters.startDate || !adminFilters.endDate) {
            showToast("Pilih murid dan rentang tanggal terlebih dahulu", "error");
            return;
        }
        setIsSavingEval(true);
        try {
            const res = await fetch("/api/learning-evaluations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...adminFilters,
                    ...evaluationData,
                    adminName: user.name
                })
            });
            if (res.ok) {
                showToast("Evaluasi berhasil disimpan!");
            }
        } catch (e) {
            showToast("Gagal menyimpan evaluasi", "error");
        } finally {
            setIsSavingEval(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/students");
            setStudents(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `/api/learning-outcomes/${editingId}` : "/api/learning-outcomes";
            
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, teacher: user.teacherId || user._id })
            });

            if (res.ok) {
                showToast(editingId ? "Capaian Berhasil Diperbarui!" : "Capaian Berhasil Disimpan!");
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ ...formData, material: "", achievement: "" });
                fetchData(user, adminFilters);
            }
        } catch (e) { showToast("Gagal menyimpan", "error"); }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({
            student: item.student?._id || "",
            subject: item.subject,
            material: item.material,
            achievement: item.achievement,
            date: new Date(item.date).toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/learning-outcomes/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Data capaian berhasil dihapus");
                setDeleteId(null);
                fetchData(user, adminFilters);
            }
        } catch (e) { 
            showToast("Gagal menghapus", "error"); 
            setDeleteId(null);
        }
    };

    const closeFormModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ ...formData, material: "", achievement: "" });
    };

    const handlePrint = () => {
        if (!adminFilters.studentId || !adminFilters.startDate || !adminFilters.endDate) {
            showToast("Harap pilih murid dan rentang tanggal untuk mencetak laporan.", "warning");
            return;
        }
        // Give time for layout to settle
        showToast("Menyiapkan dokumen...");
        setTimeout(() => {
            window.print();
        }, 800);
    };

    const getSelectedStudentName = () => {
        const s = students.find(x => x._id === adminFilters.studentId);
        return s ? s.name : "...";
    };

    return (
        <div className="container ripple-effect">
            <style jsx global>{`
                .print-area { display: none; }
                .kop-surat { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
                .kop-surat h2 { margin: 0; color: #5A57DA; }
                .kop-surat p { margin: 2px 0; font-size: 12px; }

                @media print {
                    .print-area { display: block !important; }
                }
            `}</style>

            {/* Print Layout */}
            <div className="print-area" style={{ width: '100%', padding: '0 20px' }}>
                <div className="kop-surat">
                    <h2 style={{ fontSize: '28px', fontWeight: 800 }}>FrizzieSmartClub</h2>
                    <p>Kp. Bojong No.135 RT. 02/RW. 01 Sukamukti, Katapang</p>
                </div>
                
                <h3 style={{ textAlign: 'center', margin: '30px 0', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LAPORAN CAPAIAN PEMBELAJARAN</h3>
                
                <div style={{ marginBottom: '15px', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>Siswa:</strong> {getSelectedStudentName()}</div>
                    <div><strong>Periode:</strong> {adminFilters.startDate} - {adminFilters.endDate}</div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', border: '1px solid #333' }} border="1">
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '12px', textAlign: 'center', width: '20%' }}>Tanggal</th>
                            <th style={{ padding: '12px', textAlign: 'center', width: '50%' }}>Mata Pelajaran / Materi</th>
                            <th style={{ padding: '12px', textAlign: 'center', width: '30%' }}>Capaian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center' }}>Tidak ada data capaian pembelajaran.</td></tr>
                        ) : list.map(item => (
                            <tr key={item._id}>
                                <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'middle' }}>{new Date(item.date).toLocaleDateString("id-ID")}</td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>{item.subject}</div>
                                    <div style={{ fontSize: '12px', color: '#444' }}>{item.material}</div>
                                </td>
                                <td style={{ padding: '12px', verticalAlign: 'middle' }}>{item.achievement}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: '30px', borderTop: '1px solid #000', paddingTop: '10px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Hasil Evaluasi Belajar:</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ padding: '10px', width: '30%', textAlign: 'left' }}>Aspek Penilaian</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '10px', fontWeight: 600 }}>Progres Belajar</td>
                                <td style={{ padding: '10px', whiteSpace: 'pre-wrap' }}>{evaluationData.progresBelajar || "-"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '10px', fontWeight: 600 }}>Kebutuhan yang harus ditingkatkan</td>
                                <td style={{ padding: '10px', whiteSpace: 'pre-wrap' }}>{evaluationData.kebutuhanDitingkatkan || "-"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '10px', fontWeight: 600 }}>Saran dan Pengembangan Anak</td>
                                <td style={{ padding: '10px', whiteSpace: 'pre-wrap' }}>{evaluationData.saranPengembangan || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p>Bandung, {new Date().toLocaleDateString("id-ID")}</p>
                        <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '5px 0' }}>
                            <img src="/signature-salma.png" alt="Signature" style={{ height: '70px', mixBlendMode: 'multiply' }} />
                        </div>
                        <p><strong>( Salma Rahmani, S.T. )</strong></p>
                    </div>
                </div>
            </div>

            <div className="no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 className="page-title">Rekap Capaian Pembelajaran</h1>
                    {user?.role === 'teacher' && (
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ backgroundColor: '#5A57DA', borderRadius: '12px' }}>
                            + Input Capaian Baru
                        </button>
                    )}
                </div>

                {user?.role === 'admin' && (
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3>Filter & Evaluasi Belajar (Admin)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Filter Murid</label>
                                <select value={adminFilters.studentId} onChange={(e) => setAdminFilters({ ...adminFilters, studentId: e.target.value })}>
                                    <option value="">Semua Murid</option>
                                    {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Mulai Tanggal</label>
                                <input type="date" value={adminFilters.startDate} onChange={(e) => setAdminFilters({ ...adminFilters, startDate: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Sampai Tanggal</label>
                                <input type="date" value={adminFilters.endDate} onChange={(e) => setAdminFilters({ ...adminFilters, endDate: e.target.value })} />
                            </div>
                        </div>

                        {adminFilters.studentId && adminFilters.startDate && adminFilters.endDate && (
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ border: '1px solid var(--primary)', borderRadius: '12px', padding: '20px', backgroundColor: '#fdfdff' }}>
                                    <h4 style={{ fontSize: '15px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '16px', color: 'var(--primary)' }}>Langkah 1: Isi Evaluasi Belajar Siswa</h4>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>1. Progres Belajar</label>
                                            <textarea 
                                                style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                                                placeholder="Sebutkan kemajuan yang signifikan..."
                                                value={evaluationData.progresBelajar}
                                                onChange={(e) => setEvaluationData({ ...evaluationData, progresBelajar: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>2. Kebutuhan yang harus ditingkatkan</label>
                                            <textarea 
                                                style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                                                placeholder="Area yang masih perlu bimbingan..."
                                                value={evaluationData.kebutuhanDitingkatkan}
                                                onChange={(e) => setEvaluationData({ ...evaluationData, kebutuhanDitingkatkan: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>3. Saran dan Pengembangan Anak</label>
                                            <textarea 
                                                style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                                                placeholder="Langkah selanjutnya untuk orang tua/guru..."
                                                value={evaluationData.saranPengembangan}
                                                onChange={(e) => setEvaluationData({ ...evaluationData, saranPengembangan: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                        <button 
                                            onClick={handleSaveEvaluation} 
                                            className="btn-primary" 
                                            disabled={isSavingEval}
                                            style={{ backgroundColor: '#10b981' }}
                                        >
                                            {isSavingEval ? "Menyimpan Pak..." : "💾 Simpan Evaluasi"}
                                        </button>
                                        <button onClick={handlePrint} className="btn-primary" style={{ backgroundColor: '#5A57DA' }}>
                                            🖨️ Cetak Laporan (PDF)
                                        </button>
                                    </div>
                                </div>

                                {/* Live Preview Section */}
                                <div style={{ border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '24px', backgroundColor: 'white' }}>
                                    <h4 style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>--- Pratinjau Laporan ---</h4>
                                    
                                    <div className="report-preview" style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                                        <div className="kop-surat">
                                            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>FrizzieSmartClub</h2>
                                            <p style={{ fontSize: '12px' }}>Kp. Bojong No.135 RT. 02/RW. 01 Sukamukti, Katapang</p>
                                        </div>
                                        <h3 style={{ textAlign: 'center', margin: '20px 0', fontSize: '18px' }}>LAPORAN CAPAIAN PEMBELAJARAN</h3>
                                        
                                        <div style={{ marginBottom: '20px', fontSize: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                            <div><strong>Siswa:</strong> {getSelectedStudentName()}</div>
                                            <div style={{ textAlign: 'right' }}><strong>Periode:</strong> {adminFilters.startDate} - {adminFilters.endDate}</div>
                                        </div>

                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }} border="1">
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                                    <th style={{ padding: '8px' }}>Tanggal</th>
                                                    <th style={{ padding: '8px' }}>Mata Pelajaran / Materi</th>
                                                    <th style={{ padding: '8px' }}>Capaian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {list.length === 0 ? (
                                                    <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Tidak ada data CP dalam rentang waktu ini.</td></tr>
                                                ) : list.map(item => (
                                                    <tr key={item._id}>
                                                        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{new Date(item.date).toLocaleDateString("id-ID")}</td>
                                                        <td style={{ padding: '8px' }}>
                                                            <div style={{ fontWeight: 700 }}>{item.subject}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.material}</div>
                                                        </td>
                                                        <td style={{ padding: '8px' }}>{item.achievement}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <h4 style={{ marginBottom: '10px', fontSize: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Evaluasi & Penilaian:</h4>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }} border="1">
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                                    <th style={{ padding: '8px', width: '35%', textAlign: 'left' }}>Aspek Penilaian</th>
                                                    <th style={{ padding: '8px', textAlign: 'left' }}>Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>Progres Belajar</td>
                                                    <td style={{ padding: '8px' }}>{evaluationData.progresBelajar || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>Kebutuhan yang harus ditingkatkan</td>
                                                    <td style={{ padding: '8px' }}>{evaluationData.kebutuhanDitingkatkan || "-"}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>Saran dan Pengembangan Anak</td>
                                                    <td style={{ padding: '8px' }}>{evaluationData.saranPengembangan || "-"}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '13px' }}>Bandung, {new Date().toLocaleDateString("id-ID")}</p>
                                                <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img src="/signature-salma.png" alt="Signature" style={{ height: '60px', mixBlendMode: 'multiply' }} />
                                                </div>
                                                <p style={{ fontSize: '13px' }}><strong>( Salma Rahmani, S.T. )</strong></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    {user?.role === 'admin' && <th>Guru</th>}
                                    <th>Murid</th>
                                    <th>Mata Pelajaran / Materi</th>
                                    <th>Capaian</th>
                                    <th style={{ textAlign: "right" }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" align="center">Memuat...</td></tr>
                                ) : list.length === 0 ? (
                                    <tr><td colSpan="6" align="center">Belum ada rekap capaian.</td></tr>
                                ) : list.map((item) => (
                                    <tr key={item._id}>
                                        <td>{new Date(item.date).toLocaleDateString("id-ID")}</td>
                                        {user?.role === 'admin' && <td style={{ fontWeight: 600 }}>{item.teacher?.name}</td>}
                                        <td style={{ fontWeight: 600, color: '#5A57DA' }}>{item.student?.name}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{item.subject}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{item.material}</div>
                                        </td>
                                        <td style={{ fontSize: '12px', fontStyle: 'italic', maxWidth: '300px' }}>
                                            "{item.achievement}"
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
                </div>
            </div>

            <FormModal isOpen={isModalOpen} onClose={closeFormModal} title={editingId ? "Edit Capaian Belajar Murid" : "Input Capaian Belajar Murid"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Pilih Murid</label>
                        <select required value={formData.student} onChange={(e) => setFormData({...formData, student: e.target.value})}>
                            <option value="">-- Pilih Murid --</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Mata Pelajaran</label>
                            <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Tanggal</label>
                            <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Materi Pembelajaran</label>
                        <input type="text" placeholder="Contoh: Penjumlahan Pecahan, Alphabet, dll" value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Hasil Capaian / Catatan</label>
                        <textarea placeholder="Contoh: Murid sudah lancar membaca, tapi perlu latihan menulis angka 7." value={formData.achievement} onChange={(e) => setFormData({...formData, achievement: e.target.value})} required style={{ height: '80px' }} />
                    </div>
                    <button type="submit" className="btn-primary" style={{ backgroundColor: '#5A57DA', height: '44px', marginTop: '10px' }}>
                        {editingId ? "Perbarui Capaian" : "Simpan Capaian"}
                    </button>
                    {editingId && (
                        <button type="button" onClick={closeFormModal} className="btn-outline" style={{ height: '44px' }}>
                            Batal
                        </button>
                    )}
                </form>
            </FormModal>

            {deleteId && (
                <ConfirmModal
                    title="Hapus Capaian Belajar"
                    message="Apakah Anda yakin ingin menghapus catatan capaian ini secara permanen?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    );
}
