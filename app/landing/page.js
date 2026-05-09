"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import './landing.css';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`landing-container ${isMobileMenuOpen ? 'mobile-nav-active' : ''}`}>
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '45px', height: '45px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src="/assets/logo-frizzie.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--landing-text)', letterSpacing: '-0.03em' }}>FrizzieSmartClub</h3>
            </div>
          </div>

          <div className="landing-nav-links">
            <Link href="#" className="active">Home</Link>
            <Link href="#tentang">Tentang</Link>
            <Link href="#program">Program</Link>
            <Link href="#lokasi">Lokasi</Link>
            <Link href="#blog">Blog</Link>
          </div>

          <Link href="/register" className="register-btn nav-register">Register</Link>

          {/* Mobile Hamburger */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Location Section (Sparks Edu Inspired) */}
      <section className="location-hero" id="lokasi">
        <div className="location-hero-content">
          <div className="location-hero-text">
            <h1>Lokasi kursus Frizzie Smartclub di Bandung</h1>
            <p>Pusat pembelajaran dengan metode fun learning yang dirancang khusus untuk mengasah potensi, kreativitas, dan rasa percaya diri anak Anda.</p>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px 24px', background: 'white', borderRadius: '50px', border: '1px solid #e2e8f0', fontWeight: 600, color: 'var(--landing-brown)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Fasilitas Lengkap
              </div>
              <div style={{ padding: '12px 24px', background: 'white', borderRadius: '50px', border: '1px solid #e2e8f0', fontWeight: 600, color: 'var(--landing-brown)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Mentor Expert
              </div>
            </div>
          </div>

          <div className="location-info-card">
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>Info Cabang Utama</h3>
            
            <div className="info-item">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="info-text">
                <h4>Alamat:</h4>
                <p>Jl. Setiabudi No.15, Sukasari, Kota Bandung, Jawa Barat 40153</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
              </div>
              <div className="info-text">
                <h4>Telepon / WhatsApp:</h4>
                <p>0812-3456-7890</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="info-text">
                <h4>Jam Operasional:</h4>
                <p>Setiap Hari<br/>08.00 – 17.00 WIB</p>
              </div>
            </div>

            <Link href="/register" className="trial-cta-btn">
              Daftar Kelas Trial Gratis!
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner Section */}
      <section className="promo-banner">
        <div className="promo-content">
          <div className="promo-tag">Penawaran Terbatas</div>
          <h2>Promo Diskon Rp1 Juta</h2>
          <p>Khusus untuk para pendaftar Kelas Trial Gratis bulan ini. Jangan lewatkan kesempatan emas ini untuk memberikan pendidikan terbaik bagi buah hati Anda.</p>
          <Link href="/register" className="promo-btn">
            Klaim Promo Sekarang!
          </Link>
        </div>
      </section>

      {/* Program / Course Section */}
      <section id="program" className="programs-section">
        <div className="section-header">
          <h2>Program Unggulan <span>Frizzie</span></h2>
          <p>Kami menyediakan berbagai program pembelajaran yang disesuaikan dengan minat dan kelompok usia anak untuk hasil yang lebih optimal.</p>
        </div>

        <div className="program-cards">
          {/* Little Frizzie */}
          <div className="program-card">
            <div className="program-image" style={{ background: '#fef2f2' }}>
              🎨
            </div>
            <div className="program-info">
              <span className="program-age" style={{ background: '#fee2e2', color: '#991b1b' }}>Usia 3 - 6 Tahun</span>
              <h3>Little Frizzie</h3>
              <p>Membentuk dasar kreativitas dan keterampilan motorik melalui bermain, bernyanyi, dan aktivitas seni interaktif.</p>
              <Link href="/register" className="program-link">
                Lihat Detail Program <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Frizzie Kid */}
          <div className="program-card">
            <div className="program-image" style={{ background: '#eff6ff' }}>
              💻
            </div>
            <div className="program-info">
              <span className="program-age" style={{ background: '#dbeafe', color: '#1e40af' }}>Usia 7 - 9 Tahun</span>
              <h3>Frizzie Kid</h3>
              <p>Pengenalan awal pada logika pemrograman, bahasa asing, dan sains dasar dengan metode yang sangat menyenangkan.</p>
              <Link href="/register" className="program-link">
                Lihat Detail Program <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Frizzie Teen */}
          <div className="program-card">
            <div className="program-image" style={{ background: '#f0fdf4' }}>
              🌍
            </div>
            <div className="program-info">
              <span className="program-age" style={{ background: '#dcfce7', color: '#166534' }}>Usia 10 - 15 Tahun</span>
              <h3>Frizzie Teen</h3>
              <p>Pengembangan *hard skill* dan *soft skill* tingkat lanjut untuk mempersiapkan mereka menghadapi kompetisi akademik.</p>
              <Link href="/register" className="program-link">
                Lihat Detail Program <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="tentang" className="story-section">
        <div className="story-container">
          <div className="story-image">
            <img src="/assets/landing/mentor/mentor-salma.png" alt="Frizzie Mentor" style={{ objectFit: 'cover' }} />
            {/* Decorative badge */}
            <div style={{ 
              position: 'absolute', bottom: '30px', right: '-20px', 
              background: 'white', padding: '20px', borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px'
            }}>
               <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  ⭐
               </div>
               <div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '18px', color: 'var(--landing-brown)' }}>4.9/5.0</p>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--landing-text-muted)' }}>Rating Kepuasan</p>
               </div>
            </div>
          </div>
          <div className="story-content">
            <h2>Our Story & <span>Testimonials</span></h2>
            <p>
              Berawal dari keinginan untuk menghadirkan pengalaman belajar yang tidak membosankan, Frizzie Smartclub telah berkembang menjadi tempat favorit anak-anak dalam mengeksplorasi minat mereka. 
            </p>
            <p>
              Didukung oleh ribuan mentor profesional dari berbagai latar belakang pendidikan, kami berkomitmen untuk terus berinovasi dalam memberikan metode pengajaran yang inspiratif dan efektif.
            </p>

            <div className="stats-row">
              <div className="stat-box">
                <h4>15K+</h4>
                <p>Siswa Aktif</p>
              </div>
              <div className="stat-box">
                <h4>200+</h4>
                <p>Mentor Ahli</p>
              </div>
              <div className="stat-box">
                <h4>50+</h4>
                <p>Modul Belajar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Socials Section */}
      <section className="social-section">
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--landing-text)' }}>Temukan Kami di Media Sosial</h3>
        <div className="social-links">
          <a href="#" className="social-btn" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="#" className="social-btn" aria-label="TikTok">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
          </a>
          <a href="#" className="social-btn" aria-label="YouTube">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--landing-brown)', margin: 0 }}>frizzie.</h3>
        </div>
        <p>
          © 2026 Frizzie Smartclub. Memberikan akses pendidikan berkualitas dan menyenangkan untuk masa depan anak bangsa.
        </p>
      </footer>
    </div>
  );
}
