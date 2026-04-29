"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  // SWR for Admin Stats
  const { data: adminData, isLoading: adminLoading } = useSWR(
    mounted && user?.role === "admin" ? "/api/dashboard" : null,
    fetcher
  );
  
  const stats = adminData || {
    students: 0,
    teachers: 0,
    unpaidBillings: 0,
    unpaidSalaries: 0,
    totalIncome: 0,
    totalExpense: 0
  };

  useEffect(() => {
    setMounted(true);
    const authData = localStorage.getItem("frizzie_auth");
    if (authData) {
      try {
        setUser(JSON.parse(authData));
      } catch (e) {
        console.error("Auth parse error", e);
      }
    }

  }, []);

  if (!mounted) return null;

  if (!user) return null;

  if (user.role === "teacher") {
      return <TeacherDashboard user={user} />;
  }

  return (
    <div className="dashboard-container">

      {/* Management Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '20px', background: 'var(--success)', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Manajemen Operasional</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {/* Students */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#eef2ff', borderRadius: '12px', color: 'var(--primary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 500 }}>Siswa Aktif</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>
                    {adminLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '40px', height: '24px' }}></span> : stats.students}
                </p>
              </div>
            </div>
          </div>

          {/* Teachers */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '12px', color: 'var(--success)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 500 }}>Guru / Mentor</p>
                <p style={{ fontSize: '24px', fontWeight: 700 }}>
                    {adminLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '40px', height: '24px' }}></span> : stats.teachers}
                </p>
              </div>
            </div>
          </div>

          {/* Unpaid Billing */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '12px', color: 'var(--warning)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 500 }}>Tagihan Pending</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>
                    {adminLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '40px', height: '24px' }}></span> : stats.unpaidBillings}
                </p>
              </div>
            </div>
          </div>

          {/* Unpaid Salary */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px', color: 'var(--danger)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="m9 11 3 3 3-3"/></svg>
              </div>
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 500 }}>Gaji Pending</p>
                  {stats.unpaidSalaries === 0 && !adminLoading ? (
                    <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>0</p>
                  ) : (
                    <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>
                        {adminLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '40px', height: '24px' }}></span> : stats.unpaidSalaries}
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Rekapitulasi Keuangan</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Total Income */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pendapatan</span>
              <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '10px', color: 'var(--success)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '4px' }}>Tagihan Pelunasan</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>
                {adminLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '150px', height: '32px' }}></span> : `Rp ${stats.totalIncome?.toLocaleString("id-ID")}`}
            </p>
          </div>

          {/* Total Expense */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pengeluaran</span>
              <div style={{ padding: '8px', background: '#fef2f2', borderRadius: '10px', color: 'var(--danger)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 17-3-5 3-5"/><path d="m19 17 3-5-3-5"/></svg>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '4px' }}>Beban Gaji Dibayar</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>
                {adminLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '150px', height: '32px' }}></span> : `Rp ${stats.totalExpense?.toLocaleString("id-ID")}`}
            </p>
          </div>

          {/* Net Balance */}
          <div className="card" style={{ background: 'var(--secondary)', borderColor: 'var(--primary)', borderWidth: '1px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo Bersih</span>
              <div style={{ padding: '8px', background: 'white', borderRadius: '10px', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '4px' }}>Estimasi Kas Aktif</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
                {adminLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '150px', height: '32px' }}></span> : `Rp ${((stats.totalIncome || 0) - (stats.totalExpense || 0)).toLocaleString("id-ID")}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard({ user }) {
    const tId = user?.teacherId || user?.id;
    const { data: teacherData, isLoading: teacherLoading } = useSWR(
        tId ? `/api/teacher/dashboard?teacherId=${tId}` : null,
        fetcher
    );

    const stats = teacherData?.stats || { cpCount: 0, sessionsThisMonth: 0 };
    const recentCP = teacherData?.recentCP || [];
    const pendingTasks = teacherData?.pendingTasks || [];
    const salaries = teacherData?.salaries || [];

    return (
        <div className="dashboard-container teacher-dashboard">
            
            <div className="teacher-banner">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>Halo, Guru {user.name} 👋</h1>
                    <p style={{ opacity: 0.9, fontSize: '15px' }}>
                        Terima kasih atas dedikasi Anda. Berikut ringkasan capaian murid dan riwayat gaji Anda.
                    </p>
                </div>
                {/* Decorative circle */}
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                }} />
            </div>

            <div className="teacher-stats-grid">
                <div className="card" style={{ border: 'none', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>CAPAIAN PEMBELAJARAN (CP)</p>
                        <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>
                            {teacherLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '60px', height: '32px' }}></span> : stats.cpCount}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>Total evaluasi tersimpan</p>
                    </div>
                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.1, color: 'var(--primary)' }}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </div>
                </div>
                <div className="card" style={{ border: 'none', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>SESI BULAN INI</p>
                        <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--success)' }}>
                            {teacherLoading ? <span className="skeleton" style={{ display: 'inline-block', width: '60px', height: '32px' }}></span> : stats.sessionsThisMonth}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>Total kehadiran mengajar</p>
                    </div>
                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.1, color: 'var(--success)' }}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                </div>
            </div>

            <div className="teacher-main-grid">
                {/* Pending Tasks Section */}
                <div className="card" style={{ border: pendingTasks.length > 0 ? '1px solid #fecaca' : '1px solid var(--border)', background: pendingTasks.length > 0 ? '#fffafb' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: pendingTasks.length > 0 ? '#b91c1c' : 'var(--text-dark)' }}>
                            {pendingTasks.length > 0 ? '⚠️ Laporan CP Belum Selesai' : '✅ Laporan CP Terpenuhi'}
                        </h3>
                        {pendingTasks.length > 0 && <span style={{ fontSize: '12px', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{pendingTasks.length} Tertunda</span>}
                    </div>
                    
                    {teacherLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '10px' }}></div>
                            ))}
                        </div>
                    ) : pendingTasks.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Semua laporan CP untuk sesi terakhir sudah diisi. Kerja bagus! ✨</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {pendingTasks.slice(0, 5).map((task, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{task.student?.name || 'Murid Tidak Dikenal'}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                            {task.subject} • {task.date ? new Date(task.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }) : 'Tanggal tidak tersedia'}
                                        </p>
                                    </div>
                                    <Link href={`/learning-outcomes?sessionId=${task.sessionId}&studentId=${task.student?._id}`} className="btn-primary" style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#5A57DA', textDecoration: 'none' }}>
                                        Lengkapi
                                    </Link>
                                </div>
                            ))}
                            {pendingTasks.length > 5 && (
                                <a href="/learning-outcomes" style={{ textAlign: 'center', fontSize: '13px', color: '#5A57DA', fontWeight: 600, marginTop: '8px' }}>
                                    Lihat {pendingTasks.length - 5} tugas lainnya...
                                </a>
                            )}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Riwayat Gaji Terakhir</h3>
                    {salaries.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Belum ada riwayat gaji.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {salaries.slice(0, 5).map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', gap: '12px' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '13px' }}>{s.monthYear}</p>
                                        <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>{s.sessions} Sesi</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-dark)' }}>Rp {s.amount.toLocaleString("id-ID")}</p>
                                        <span style={{ 
                                            fontSize: '9px', 
                                            background: s.status === 'Sudah Dibayar' ? '#ecfdf5' : '#fff7ed', 
                                            color: s.status === 'Sudah Dibayar' ? '#059669' : '#9a3412', 
                                            padding: '2px 6px', 
                                            borderRadius: '4px', 
                                            fontWeight: 700 
                                        }}>
                                            {s.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
