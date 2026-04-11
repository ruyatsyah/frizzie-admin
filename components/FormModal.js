"use client";

/**
 * FormModal component for larger forms (e.g. Attendance Input).
 * Includes smooth fade-in and slide-up animations.
 */
export default function FormModal({ title, children, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
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
}
