"use client";

export default function ConfirmModal({ 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "Hapus Data", 
    cancelText = "Batal",
    variant = "danger" 
}) {
    return (
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
}
