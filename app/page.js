"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    unpaidBillings: 0,
    unpaidSalaries: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="card" style={{ 
        marginBottom: '32px', 
        background: 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)',
        border: 'none',
        color: 'white',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>Selamat Datang, Ruyatsyah 👋</h1>
          <p style={{ opacity: 0.9, fontSize: '15px', maxWidth: '600px' }}>
            Pantau ringkasan keuangan dan manajemen operasional FrizzieSmartClub secara real-time dari satu tempat.
          </p>
        </div>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
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
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>Rp {(stats.totalIncome || 0).toLocaleString("id-ID")}</p>
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
            <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-dark)' }}>Rp {(stats.totalExpense || 0).toLocaleString("id-ID")}</p>
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
            <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>Rp {((stats.totalIncome || 0) - (stats.totalExpense || 0)).toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Management Section */}
      <div>
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
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.students}</p>
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
                <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.teachers}</p>
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
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>{stats.unpaidBillings}</p>
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
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>{stats.unpaidSalaries}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
