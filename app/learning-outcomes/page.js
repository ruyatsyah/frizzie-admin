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

export default function LearningOutcomesPage() {
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
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

    // SWR Data Fetching
    const tId = user?.teacherId || (user?.role === 'teacher' ? user?.id : null);
    const swrKey = user?.role === 'teacher' && tId 
        ? `/api/learning-outcomes?teacherId=${tId}&page=${page}&limit=10`
        : `/api/learning-outcomes?studentId=${adminFilters.studentId}&startDate=${adminFilters.startDate}&endDate=${adminFilters.endDate}&page=${page}&limit=10`;

    const { data: swrData, error: swrError, isLoading: swrLoading } = useSWR(mounted && user ? swrKey : null, fetcher);
    const list = swrData?.data || [];
    const totalPages = swrData?.totalPages || 1;

    const refreshData = () => mutate(swrKey);

    useEffect(() => {
        setMounted(true);
        const authData = localStorage.getItem("frizzie_auth");
        if (authData) {
            const parsedUser = JSON.parse(authData);
            setUser(parsedUser);
            fetchStudents();
        }
    }, []);

    // Re-fetch when admin filters change
    useEffect(() => {
        if (user?.role === 'admin') {
            setPage(1); // Reset to page 1 on filter change
            if (adminFilters.studentId && adminFilters.startDate && adminFilters.endDate) {
                fetchEvaluation();
            }
        }
    }, [adminFilters]);

    useEffect(() => {
        if (list.length > 0 && !swrLoading && students.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const sId = params.get("sessionId");
            const stId = params.get("studentId");
            
            if (sId && stId) {
                const studentMatch = list.find(item => {
                    const itemSessionId = (item.sessionId?._id || item.sessionId)?.toString();
                    const itemStudentId = (item.student?._id || item.student)?.toString();
                    
                    return itemSessionId === sId && itemStudentId === stId;
                });

                if (studentMatch) {
                    handleEdit(studentMatch);
                    // Clear params
                    window.history.replaceState({}, '', window.location.pathname);
                } else {
                    console.log("Deep link match failed:", { sId, stId, listCount: list.length });
                }
            }
        }
    }, [list, swrLoading, students]);

    // fetchData is now handled by useSWR

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
                body: JSON.stringify({ 
                    ...formData, 
                    teacher: user.teacherId || user.id,
                    sessionId: formData.sessionId 
                })
            });

            if (res.ok) {
                showToast(editingId ? "Capaian Berhasil Diperbarui!" : "Capaian Berhasil Disimpan!");
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ ...formData, material: "", achievement: "" });
                refreshData();
            }
        } catch (e) { showToast("Gagal menyimpan", "error"); }
    };

    const handleEdit = (item) => {
        setEditingId(item.isCompleted ? item._id : null);
        setFormData({
            student: item.student?._id || "",
            subject: item.subject,
            material: item.material || "",
            achievement: item.achievement || "",
            date: new Date(item.date).toISOString().split('T')[0],
            sessionId: item.sessionId
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
                refreshData();
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

    const SkeletonRow = () => (
        <tr>
            <td><div className="skeleton" style={{ height: '18px', width: '80px' }}></div></td>
            {user?.role === 'admin' && <td><div className="skeleton" style={{ height: '18px', width: '100px' }}></div></td>}
            <td><div className="skeleton" style={{ height: '18px', width: '120px' }}></div></td>
            <td>
                <div className="skeleton" style={{ height: '18px', width: '100px', marginBottom: '4px' }}></div>
                <div className="skeleton" style={{ height: '14px', width: '150px' }}></div>
            </td>
            <td><div className="skeleton" style={{ height: '18px', width: '200px' }}></div></td>
            {user?.role === 'teacher' && <td><div className="skeleton" style={{ height: '24px', width: '60px', borderRadius: '6px' }}></div></td>}
            <td style={{ textAlign: 'right' }}><div className="skeleton" style={{ height: '32px', width: '80px', marginLeft: 'auto' }}></div></td>
        </tr>
    );

    return (
        <div className="container ripple-effect">
            <style jsx global>{`
                .print-area { display: none; }
                .kop-surat { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
                .kop-surat h2 { margin: 0; color: #5A57DA; }
                .kop-surat p { margin: 2px 0; font-size: 12px; }

                @media print {
                    body { background: white !important; margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    .print-area { 
                        display: block !important; 
                        width: 100% !important;
                    }
                    .sidebar, .topbar, .footer { display: none !important; }
                    main { margin: 0 !important; padding: 0 !important; }
                }
            `}</style>

            {/* Print Layout */}
            <div className="print-area" style={{ fontFamily: '"Inter", sans-serif', color: '#1a1a1a', lineHeight: 1.5 }}>
                <div style={{ textAlign: 'center', borderBottom: '4px double #111', paddingBottom: '16px', marginBottom: '32px' }}>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#5A57DA' }}>FrizzieSmartClub</h1>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666', fontWeight: 500 }}>BIMBINGAN BELAJAR TERBAIK & TERPERCAYA</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Kp. Bojong No.135 RT. 02/RW. 01 Sukamukti, Katapang, Bandung</p>
                </div>
                
                <h3 style={{ textAlign: 'center', margin: '0 0 30px', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>LAPORAN CAPAIAN PEMBELAJARAN</h3>
                
                <div style={{ marginBottom: '20px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                    <div><span style={{ color: '#666' }}>Siswa:</span> <strong style={{ fontSize: '16px' }}>{getSelectedStudentName()}</strong></div>
                    <div><span style={{ color: '#666' }}>Periode:</span> <strong>{adminFilters.startDate} - {adminFilters.endDate}</strong></div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }} border="1">
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '12px', textAlign: 'center', width: '20%', fontSize: '12px' }}>TANGGAL</th>
                            <th style={{ padding: '12px', textAlign: 'left', width: '50%', fontSize: '12px' }}>MATA PELAJARAN / MATERI</th>
                            <th style={{ padding: '12px', textAlign: 'left', width: '30%', fontSize: '12px' }}>CAPAIAN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr><td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Tidak ada data capaian dalam periode ini.</td></tr>
                        ) : list.map(item => (
                            <tr key={item._id}>
                                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{new Date(item.date).toLocaleDateString("id-ID")}</td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.subject}</div>
                                    <div style={{ fontSize: '12px', color: '#555' }}>{item.material}</div>
                                </td>
                                <td style={{ padding: '12px', fontSize: '13px' }}>{item.achievement}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ pageBreakInside: 'avoid' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '15px', color: '#5A57DA' }}>HASIL EVALUASI & PENILAIAN:</h4>
                     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }} border="1">
                        <tbody>
                            <tr>
                                <td style={{ padding: '12px', fontWeight: 700, width: '30%', backgroundColor: '#f8fafc' }}>Progres Belajar</td>
                                <td style={{ padding: '12px', whiteSpace: 'pre-wrap' }}>{evaluationData.progresBelajar || "-"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '12px', fontWeight: 700, backgroundColor: '#f8fafc' }}>Kebutuhan Ditingkatkan</td>
                                <td style={{ padding: '12px', whiteSpace: 'pre-wrap' }}>{evaluationData.kebutuhanDitingkatkan || "-"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '12px', fontWeight: 700, backgroundColor: '#f8fafc' }}>Saran & Pengembangan</td>
                                <td style={{ padding: '12px', whiteSpace: 'pre-wrap' }}>{evaluationData.saranPengembangan || "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', pageBreakInside: 'avoid' }}>
                    <div style={{ textAlign: 'center', width: '200px' }}>
                        <p style={{ fontSize: '13px', margin: '0 0 8px' }}>Bandung, {new Date().toLocaleDateString("id-ID")}</p>
                        <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/signature-salma.png" alt="Signature" style={{ height: '70px', mixBlendMode: 'multiply' }} />
                        </div>
                        <p style={{ fontSize: '14px', margin: '8px 0 0' }}><strong>( Salma Rahmani, S.T. )</strong></p>
                    </div>
                </div>
            </div>

            <div className="no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 className="page-title">Rekap Capaian Pembelajaran</h1>
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

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    {user?.role === 'admin' && <th>Guru</th>}
                                    <th>Murid</th>
                                    <th>Mata Pelajaran / Materi</th>
                                    <th>Capaian</th>
                                    {user?.role === 'teacher' && <th>Status</th>}
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
                                ) : list.length === 0 ? (
                                    <tr><td colSpan="7" align="center">Belum ada rekap capaian.</td></tr>
                                ) : list.map((item) => (
                                    <tr key={item._id || `${item.sessionId}-${item.student._id}`}>
                                        <td>{new Date(item.date).toLocaleDateString("id-ID")}</td>
                                        {user?.role === 'admin' && <td style={{ fontWeight: 600 }}>{item.teacher?.name}</td>}
                                        <td style={{ fontWeight: 600, color: '#5A57DA' }}>{item.student?.name}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{item.subject}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{item.material || "Belum diisi"}</div>
                                        </td>
                                        <td style={{ fontSize: '12px', fontStyle: 'italic', maxWidth: '300px' }}>
                                            {item.achievement ? `"${item.achievement}"` : "-"}
                                        </td>
                                        {user?.role === 'teacher' && (
                                            <td>
                                                <span style={{ 
                                                    padding: '4px 8px', 
                                                    borderRadius: '6px', 
                                                    fontSize: '11px', 
                                                    fontWeight: 700,
                                                    backgroundColor: item.isCompleted ? '#dcfce7' : '#fee2e2',
                                                    color: item.isCompleted ? '#166534' : '#991b1b'
                                                }}>
                                                    {item.isCompleted ? "SUDAH" : "BELUM"}
                                                </span>
                                            </td>
                                        )}
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => handleEdit(item)} 
                                                    className="btn-action" 
                                                    style={{ color: item.isCompleted ? '#F59E0B' : '#5A57DA' }} 
                                                    title={item.isCompleted ? "Edit" : "Isi Capaian"}
                                                >
                                                    {item.isCompleted ? (
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                                                    ) : (
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    )}
                                                </button>
                                                {user?.role === 'admin' && (
                                                    <button onClick={() => handleDelete(item._id)} className="btn-action" style={{ color: '#EF4444' }} title="Hapus">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                    </button>
                                                )}
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

            <FormModal isOpen={isModalOpen} onClose={closeFormModal} title={editingId ? "Edit Capaian Belajar Murid" : "Input Capaian Belajar Murid"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Pilih Murid</label>
                        <select 
                            required 
                            disabled={!!formData.sessionId}
                            value={formData.student} 
                            onChange={(e) => setFormData({...formData, student: e.target.value})}
                            style={{ backgroundColor: formData.sessionId ? '#f8fafc' : 'white' }}
                        >
                            <option value="">-- Pilih Murid --</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Mata Pelajaran</label>
                            <select 
                                disabled={!!formData.sessionId}
                                value={formData.subject} 
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                style={{ backgroundColor: formData.sessionId ? '#f8fafc' : 'white' }}
                            >
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Tanggal</label>
                            <input 
                                type="date" 
                                disabled={!!formData.sessionId}
                                value={formData.date} 
                                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                required 
                                style={{ backgroundColor: formData.sessionId ? '#f8fafc' : 'white' }}
                            />
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
