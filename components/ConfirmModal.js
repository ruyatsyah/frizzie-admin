"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({ 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "Hapus Data", 
    cancelText = "Batal",
    variant = "danger" 
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!mounted) return null;

    const modalContent = (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-title">{title}</div>
                <div className="modal-body">{message}</div>
                <div className="modal-actions">
                    <button className="btn-outline" onClick={onCancel}>{cancelText}</button>
                    <button 
                        className={variant === 'danger' ? 'btn-danger' : 'btn-primary'} 
                        onClick={onConfirm}
                        style={variant === 'primary' ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
