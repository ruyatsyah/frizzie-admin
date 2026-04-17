"use client";
import { useState, useEffect } from "react";
import FormModal from "./FormModal";
import { showToast } from "./Toast";

export default function Topbar({ onMenuClick, onLogout, user }) {
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Edit Profile States
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Toggle visibility password
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                password: ""
            });
        }
    }, [user, isEditProfileOpen]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id || user._id, // Support different object formats
                    name: profileData.name,
                    email: profileData.email,
                    password: profileData.password // Can be empty
                })
            });

            const data = await res.json();
            if (res.ok) {
                showToast("Profil berhasil diperbarui!");
                // Update LocalStorage with server response to ensure all IDs remain perfectly intact
                if (data.user) {
                    localStorage.setItem("frizzie_auth", JSON.stringify(data.user));
                }
                
                setIsEditProfileOpen(false);
                setShowDropdown(false);
                
                // Force reload to apply visually across layout and sessions
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast(data.error || "Gagal memperbarui profil", "error");
            }
        } catch (error) {
            showToast("Terjadi kesalahan sistem", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <header className="topbar" style={{ boxShadow: 'var(--shadow-sm)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 50, justifyContent: 'space-between', padding: '4px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                    onClick={onMenuClick}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#5A57DA',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        width: '38px',
                        height: '38px',
                        padding: 0
                    }}
                    className="hamburger-btn"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(90, 87, 218, 0.08)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <span className="brand-name" style={{ 
                    color: '#5A57DA', 
                    fontSize: '20px', 
                    fontWeight: 800, 
                    letterSpacing: '-0.03em'
                }}>
                    FrizzieSmartClub
                </span>
            </div>



            {/* User Profile with Dropdown */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="user-profile-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'white',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '6px 12px 6px 6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                    }}>
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="user-name-text" style={{ textAlign: 'left' }}>
                        <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.2 }}>{user?.name || "User"}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)', transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <>
                        {/* Backdrop to close */}
                        <div
                            onClick={() => setShowDropdown(false)}
                            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-lg)',
                            minWidth: '200px',
                            zIndex: 50,
                            overflow: 'hidden',
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>{user?.name || "User"}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{user?.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsEditProfileOpen(true);
                                    setShowDropdown(false);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    borderRadius: 0,
                                    cursor: 'pointer',
                                    color: 'var(--text-dark)',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    textAlign: 'left',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                Edit Profil
                            </button>
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    onLogout && onLogout();
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: 0,
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    textAlign: 'left',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Keluar / Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
            {/* Edit Profile Modal */}
            <FormModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit Profil">
                <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Nama Lengkap</label>
                        <input
                            type="text"
                            required
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            placeholder="Masukkan nama lengkap"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Alamat Email</label>
                        <input
                            type="email"
                            required
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            placeholder="Masukkan email"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>Password Baru (Opsional)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={profileData.password}
                                onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                                placeholder="Kosongkan jika tidak ingin mengubah password"
                                style={{ width: '100%', paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                }}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={() => setIsEditProfileOpen(false)} className="btn-outline">
                            Batal
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </FormModal>
        </header>
    );
}
