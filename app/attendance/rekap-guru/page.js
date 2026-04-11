"use client";
import { useEffect, useState } from "react";

export default function TeacherRecapPage() {
    const [recapData, setRecapData] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTeachers();
        fetchRecap();
    }, [selectedTeacher]);

    const fetchTeachers = async () => {
        try {
            const res = await fetch("/api/teachers");
            setTeachers(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchRecap = async () => {
        setLoading(true);
        try {
            const url = selectedTeacher ? `/api/attendance/rekap-guru?teacherId=${selectedTeacher}` : "/api/attendance/rekap-guru";
            const res = await fetch(url);
            const data = await res.json();
            setRecapData(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (recapData.length === 0) return;
        
        const headers = ["Tanggal", "Nama Guru", "Total Murid", "Murid Hadir", "Estimasi Honor", "Mata Pelajaran"];
        const rows = recapData.map(item => [
            new Date(item.date).toLocaleDateString("id-ID"),
            item.teacher?.name || "N/A",
            item.studentsTaught?.length || 0,
            item.studentsTaught?.filter(s => s.status === 'Hadir').length || 0,
            item.studentsTaught?.filter(s => s.status === 'Hadir').length * 10000,
            [...new Set(item.studentsTaught?.map(s => s.subject))].join("; ")
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `rekap_absen_guru_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Rekap Absen Guru</h1>
                <button 
                    onClick={exportToCSV} 
                    className="btn-outline" 
                    style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#5A57DA', color: '#5A57DA' }}
                    disabled={recapData.length === 0}
                >
                    📥 Export to Excel
                </button>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Filter Per Guru</label>
                        <select 
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                            <option value="">Semua Guru</option>
                            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                            Menampilkan riwayat mengajar dan jumlah murid yang hadir untuk setiap sesi.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Nama Guru</th>
                                <th>Jumlah Murid</th>
                                <th>Estimasi Honor</th>
                                <th>Mata Pelajaran</th>
                                <th>Status Sesi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Memuat data...</td></tr>
                            ) : recapData.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-light)' }}>Tidak ada data rekap.</td></tr>
                            ) : recapData.map((session) => (
                                <tr key={session._id}>
                                    <td>{new Date(session.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td style={{ fontWeight: 600 }}>{session.teacher?.name}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 700 }}>{session.studentsTaught?.length || 0}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                                                ({session.studentsTaught?.filter(s => s.status === 'Hadir').length} Hadir)
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                        Rp {(session.studentsTaught?.filter(s => s.status === 'Hadir').length * 10000 || 0).toLocaleString("id-ID")}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {[...new Set(session.studentsTaught?.map(s => s.subject))].map(sub => (
                                                <span key={sub} style={{ fontSize: '10px', background: 'var(--background)', padding: '2px 8px', borderRadius: '4px' }}>
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>✓ Terdata</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
