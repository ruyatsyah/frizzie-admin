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
              width: '50px', height: '50px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src="/assets/logo-frizzie.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--landing-text)', letterSpacing: '-0.03em' }}>FrizzieSmartClub</h3>
            </div>
          </div>

          <div className="landing-nav-links">
            <Link href="#" className="active">Home</Link>
            <Link href="#about">About</Link>
            <Link href="#courses">Courses</Link>
            <Link href="#guru">Guru</Link>
            <Link href="#blogs">Blogs</Link>
          </div>

          <Link href="/register" className="register-btn" style={{ textDecoration: 'none', alignItems: 'center', justifyContent: 'center' }}>Register</Link>

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

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-headline">
          Belajar Seru, <span>Tumbuh Hebat.</span>
        </h1>
        
        <p className="hero-subheadline">
          Tempat di mana anak belajar dengan cara yang menyenangkan sekaligus terarah. Kami membantu mereka mengembangkan kreativitas, membangun kepercayaan diri, dan mengasah kemampuan berpikir sejak dini sebagai bekal menghadapi masa depan.
        </p>

        <Link href="/register" className="explore-btn" style={{ borderRadius: '50px', textDecoration: 'none', display: 'inline-block' }}>Mulai Belajar Sekarang</Link>
      </section>

      {/* Sponsorship Section */}
      <div className="sponsor-container">
        <p style={{ color: 'var(--landing-text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>sponsored by</p>
        <img src="/assets/landing/sponsorship/binar.png" alt="Binar Academy" className="sponsor-logo" style={{ height: '50px', opacity: 1 }} />
      </div>


      {/* Feature Section (About) */}
      <section id="about" className="feature-section">
        <div className="feature-image-container">
          <img src="/assets/landing/mentor/mentor-salma.png" alt="Mentor Salma" />
          {/* Decorative badge */}
          <div style={{ 
            position: 'absolute', bottom: '40px', right: '-10px', 
            background: 'white', padding: '16px 24px', borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
             <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                ⭐
             </div>
             <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '15px' }}>Lovely Guru</p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--landing-text-muted)' }}>43+ Countries</p>
             </div>
          </div>
        </div>

        <div id="guru" className="feature-content">
          <h2>Lebih dari Ribuan <span>Mentor Terbaik</span> Seluruh Dunia</h2>
          <p>
            Kami bekerja sama dengan hampir semua mentor dari seluruh dunia dengan subjek yang berbeda-beda untuk mengajar anak Anda di sini.
          </p>
          <button className="explore-btn">Explore More</button>
        </div>
      </section>

      {/* Course Interests */}
      <section id="courses" className="courses-section">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, marginBottom: '16px' }}>Temukan Kelas Sesuai <span>Minatmu</span></h2>
          <p style={{ color: 'var(--landing-text-muted)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Butuh belajar Kimia? Matematika? Sejarah? Bahkan subjek olahraga? Jangan khawatir, kami punya semuanya.</p>
        </div>
        
        <div className="course-grid">
          {[
            { title: 'Coding & Tech', icon: '💻', color: '#eff6ff' },
            { title: 'Seni & Desain', icon: '🎨', color: '#fff1f2' },
            { title: 'Bahasa Asing', icon: '🌎', color: '#f0fdf4' },
            { title: 'Musik & Vokal', icon: '🎵', color: '#fff7ed' }
          ].map(course => (
            <div key={course.title} style={{ 
              background: course.color, padding: '48px 40px', borderRadius: '40px', 
              textAlign: 'left', transition: 'all 0.3s', cursor: 'pointer',
              border: '1px solid transparent'
            }} onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px)';
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.04)';
            }} onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ fontSize: '56px', marginBottom: '32px' }}>{course.icon}</div>
              <h4 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>{course.title}</h4>
              <p style={{ fontSize: '15px', color: 'var(--landing-text-muted)', lineHeight: 1.6 }}>Jelajahi berbagai materi seru yang dirancang khusus untuk mengasah potensi anak.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer (Blogs Placeholder) */}
      <footer id="blogs" style={{ padding: '80px 24px', borderTop: '1px solid #F1F5F9', textAlign: 'center', background: 'white' }}>
         <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--landing-brown)' }}>frizzie.</h3>
         </div>
         <p style={{ color: 'var(--landing-text-muted)', fontSize: '14px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
            © 2026 Frizzie Smartclub. Memberikan akses pendidikan berkualitas dan menyenangkan untuk masa depan anak bangsa.
         </p>
      </footer>
    </div>
  );
}
