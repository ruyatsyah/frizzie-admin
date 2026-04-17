"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * FormModal component for larger forms (e.g. Attendance Input).
 * Includes smooth fade-in and slide-up animations.
 * Uses React Portal to ensure full-screen overlay (covering Sidebar/Topbar).
 */
export default function FormModal({ title, children, isOpen, onClose }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal-content modal-content-lg fade-in-up" 
                onClick={(e) => e.stopPropagation()}
                style={{ 
                    maxHeight: '90vh', 
                    overflowY: 'auto',
                    padding: '32px'
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="btn-outline" 
                        style={{ padding: '8px', minWidth: '36px', borderRadius: '50%' }}
                    >
                        ✕
                    </button>
                </div>
                
                <div className="modal-body-content">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
