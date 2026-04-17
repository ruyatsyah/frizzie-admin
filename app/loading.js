export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '20px'
        }}>
            <div className="animate-spin" style={{
                width: '48px',
                height: '48px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #5A57DA',
                borderRadius: '50%'
            }}></div>
            <p style={{ 
                color: '#5A57DA', 
                fontWeight: 600, 
                fontSize: '14px',
                letterSpacing: '0.05em'
            }}>MEMUAT HALAMAN...</p>
        </div>
    );
}
