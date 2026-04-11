"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function SalariesPage() {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [toggleData, setToggleData] = useState(null); // For status toggle confirmation

    useEffect(() => {
        fetchSalaries();
    }, []);

    const fetchSalaries = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/salaries");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSalaries(data);
            } else {
                setSalaries([]);
            }
        } catch (e) {
            console.error(e);
            setSalaries([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (salary) => {
        setToggleData(salary);
    };

    const confirmToggle = async () => {
        if (!toggleData) return;
        try {
            const newStatus = toggleData.status === "Sudah Dibayar" ? "Belum Dibayar" : "Sudah Dibayar";
            const res = await fetch(`/api/salaries/${toggleData._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                showToast(`Status gaji berhasil diubah ke ${newStatus}`);
                fetchSalaries();
            } else {
                showToast("Gagal mengubah status", "error");
            }
        } catch (e) {
            showToast("Terjadi kesalahan", "error");
        } finally {
            setToggleData(null);
        }
    };

    const handlePrint = (salary) => {
        setPrintData(salary);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Laporan Gaji Guru</h1>
                <div style={{ fontSize: '13px', color: 'var(--text-light)', backgroundColor: '#F0F0FF', padding: '8px 16px', borderRadius: '8px', color: '#5A57DA', fontWeight: 600 }}>
                    Sistem Gaji Otomatis via Absensi
                </div>
            </div>

            <div className="card no-print">
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: 0 }}>
                        Data gaji di bawah ini dihitung otomatis berdasarkan jumlah kehadiran murid (Rp 10.000/murid). 
                        Anda tidak dapat menambah atau mengubah gaji secara manual dari sini.
                    </p>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nama Guru</th>
                                <th>Bulan/Tahun</th>
                                <th>Total Kehadiran</th>
                                <th>Total Honor</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Arsip</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: "center", padding: "32px" }}>Memuat data...</td></tr>
                            ) : salaries.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: "center", color: "var(--text-light)", padding: "32px" }}>Belum ada data gaji yang tercatat dari absensi.</td></tr>
                            ) : salaries.map((salary) => (
                                <tr key={salary._id}>
                                    <td style={{ fontWeight: 600 }}>{salary.teacher?.name || "Guru Dihapus"}</td>
                                    <td>{salary.monthYear}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontWeight: 700 }}>{salary.sessions || 0}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Murid Hadir</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#5A57DA' }}>Rp {salary.amount.toLocaleString("id-ID")}</td>
                                    <td>
                                        <button 
                                            onClick={() => toggleStatus(salary)}
                                            style={{
                                                backgroundColor: salary.status === 'Sudah Dibayar' ? '#ecfdf5' : '#fef2f2',
                                                color: salary.status === 'Sudah Dibayar' ? '#059669' : '#dc2626',
                                                padding: "6px 14px",
                                                borderRadius: "8px",
                                                fontSize: "11px",
                                                fontWeight: 700,
                                                border: `1px solid ${salary.status === 'Sudah Dibayar' ? '#10b981' : '#f87171'}`,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                            title="Klik untuk ubah status"
                                        >
                                            {salary.status === 'Sudah Dibayar' ? '✅ Sudah Dibayar' : '⏳ Belum Dibayar'}
                                        </button>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button onClick={() => handlePrint(salary)} className="btn-outline" style={{ fontSize: "11px", padding: "6px 12px", borderColor: '#5A57DA', color: '#5A57DA' }}>
                                            🖨️ Cetak Slip
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
                    backgroundColor: "white",
                    color: "#111",
                    fontFamily: "'Inter', sans-serif",
                }}>
                    <div style={{ textAlign: "center", borderBottom: "3px solid #5A57DA", paddingBottom: "20px", marginBottom: "30px" }}>
                        <h1 style={{ fontSize: "28px", color: "#5A57DA", marginBottom: "4px", fontWeight: 800 }}>FrizzieSmartClub</h1>
                        <p style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "2px" }}>Slip Honorarium Pengajar</p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", padding: "15px", background: "#f8fafc", borderRadius: "8px" }}>
                        <div>
                            <p style={{ fontSize: "10px", color: "#888", marginBottom: "4px", fontWeight: 700 }}>DETAIL PENERIMA</p>
                            <p style={{ fontWeight: 700, fontSize: "16px" }}>{printData.teacher?.name}</p>
                            <p style={{ fontSize: "13px" }}>ID Guru: {printData.teacher?._id?.slice(-6).toUpperCase()}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "10px", color: "#888", marginBottom: "4px", fontWeight: 700 }}>PERIODE / STATUS</p>
                            <p style={{ fontWeight: 700 }}>{printData.monthYear}</p>
                            <p style={{ fontSize: "12px", color: printData.status === 'Sudah Dibayar' ? '#059669' : '#dc2626', fontWeight: 700 }}>{printData.status.toUpperCase()}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: "40px" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                            <span style={{ color: '#555' }}>Total Kehadiran Murid</span>
                            <span style={{ fontWeight: 600 }}>{printData.sessions} Kali</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                            <span style={{ color: '#555' }}>Rate per Murid</span>
                            <span style={{ fontWeight: 600 }}>Rp 10.000</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '2px solid #5A57DA' }}>
                            <span style={{ fontWeight: 700, fontSize: '16px' }}>TOTAL HONOR</span>
                            <span style={{ fontWeight: 800, fontSize: '20px', color: '#5A57DA' }}>Rp {printData.amount.toLocaleString("id-ID")}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "50px", borderTop: "1px dashed #ccc", paddingTop: "20px" }}>
                        <p style={{ fontSize: "12px", color: "#777" }}>Dicetak otomatis oleh Sistem FrizzieSmart pada {new Date().toLocaleString("id-ID")}</p>
                    </div>
                </div>
            )}

            {toggleData && (
                <ConfirmModal
                    title="Ubah Status Pembayaran"
                    message={`Apakah Anda yakin ingin mengubah status gaji menjadi ${toggleData.status === 'Sudah Dibayar' ? 'Belum Dibayar' : 'Sudah Dibayar'}?`}
                    onConfirm={confirmToggle}
                    onCancel={() => setToggleData(null)}
                    confirmText="Ubah Status"
                    variant="primary"
                />
            )}
        </div>
    );
}
