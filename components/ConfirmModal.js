"use client";

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-title">{title}</div>
                <div className="modal-body">{message}</div>
                <div className="modal-actions">
                    <button className="btn-outline" onClick={onCancel}>Batal</button>
                    <button className="btn-danger" onClick={onConfirm}>Hapus Data</button>
                </div>
            </div>
        </div>
    );
}
