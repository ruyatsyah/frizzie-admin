"use client";
import { useEffect, useState } from "react";

export default function StudentRecapPage() {
    const [recapData, setRecapData] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
        fetchRecap();
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/students");
            setStudents(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchRecap = async () => {
        setLoading(true);
        try {
            const url = selectedStudent ? `/api/attendance/rekap-murid?studentId=${selectedStudent}` : "/api/attendance/rekap-murid";
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
        
        const headers = ["Tanggal", "Nama Murid", "Mata Pelajaran", "Guru Pengajar", "Status Kehadiran"];
        const rows = recapData.map(item => [
            new Date(item.date).toLocaleDateString("id-ID"),
            item.studentName || "N/A",
            item.subject || "N/A",
            item.teacherName || "N/A",
            item.status || "N/A"
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `rekap_absen_murid_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Rekap Absen Murid</h1>
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
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Filter Per Murid</label>
                        <select 
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                        >
                            <option value="">Semua Murid</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.grade})</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                            Menampilkan riwayat kehadiran murid berdasarkan sesi mengajar guru.
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
                                <th>Nama Murid</th>
                                <th>Mata Pelajaran</th>
                                <th>Guru Pengajar</th>
                                <th>Status Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Memuat data...</td></tr>
                            ) : recapData.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-light)' }}>Tidak ada riwayat kehadiran.</td></tr>
                            ) : recapData.map((row) => (
                                <tr key={row._id}>
                                    <td>{new Date(row.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td style={{ fontWeight: 600 }}>{row.studentName}</td>
                                    <td>{row.subject}</td>
                                    <td>{row.teacherName}</td>
                                    <td>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '6px', 
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            background: row.status === 'Hadir' ? '#ecfdf5' : row.status === 'Izin' ? '#fff7ed' : '#fef2f2',
                                            color: row.status === 'Hadir' ? 'var(--success)' : row.status === 'Izin' ? 'var(--warning)' : 'var(--danger)'
                                        }}>
                                            {row.status}
                                        </span>
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
