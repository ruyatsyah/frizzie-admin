"use client";
import { useState } from "react";

export default function Topbar({ onMenuClick, onLogout }) {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header className="topbar" style={{ boxShadow: 'var(--shadow-sm)', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 50, justifyContent: 'space-between', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ 
                    color: '#5A57DA', 
                    fontSize: '20px', 
                    fontWeight: 800, 
                    letterSpacing: '-0.03em'
                }}>
                    FrizzieSmart
                </span>
            </div>

            {/* User Profile with Dropdown */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '6px 12px 6px 6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
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
                        fontSize: '13px'
                    }}>
                        R
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.2 }}>Ruyatsyah</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)', transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
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
                                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>Ruyatsyah</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>ruyatsyah2203@gmail.com</p>
                            </div>
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
        </header>
    );
}
