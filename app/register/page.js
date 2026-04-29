"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        studentName: "",
        parentName: "",
        whatsapp: "",
        program: "",
        notes: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulating API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <div style={{
                minHeight: "100vh", backgroundColor: "#fffbeb",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
                fontFamily: "'Poppins', sans-serif"
            }}>
                <div style={{
                    background: "white", padding: "60px 40px", borderRadius: "32px",
                    maxWidth: "500px", width: "100%", textAlign: "center",
                    boxShadow: "0 20px 40px rgba(120,53,15,0.05)"
                }}>
                    <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
                    <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#78350f", marginBottom: "16px" }}>Pendaftaran Terkirim!</h2>
                    <p style={{ color: "#64748b", lineHeight: 1.6, marginBottom: "32px" }}>
                        Terima kasih telah mendaftar di <strong>FrizzieSmartClub</strong>. Tim kami akan segera menghubungi Anda melalui WhatsApp untuk langkah selanjutnya.
                    </p>
                    <Link href="/landing" style={{
                        display: "inline-block", padding: "16px 40px", background: "#78350f",
                        color: "white", borderRadius: "16px", fontWeight: 700, textDecoration: "none"
                    }}>
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh", backgroundColor: "#fefce8",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px",
            fontFamily: "'Poppins', sans-serif"
        }}>
            <div style={{
                background: "white", borderRadius: "32px", padding: "48px",
                maxWidth: "600px", width: "100%", boxShadow: "0 25px 50px -12px rgba(120,53,15,0.1)",
                border: "1px solid #fef3c7"
            }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <Link href="/landing">
                        <img src="/assets/logo-frizzie.png" alt="Logo" style={{ width: "80px", marginBottom: "20px" }} />
                    </Link>
                    <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#78350f", marginBottom: "8px" }}>Ayo Bergabung!</h1>
                    <p style={{ color: "#92400e", fontWeight: 500 }}>Daftarkan putra-putri Anda sekarang juga.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#451a03", marginBottom: "8px" }}>Nama Lengkap Siswa</label>
                        <input 
                            required
                            type="text" 
                            placeholder="Contoh: Andi Pratama"
                            style={inputStyle}
                            value={formData.studentName}
                            onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#451a03", marginBottom: "8px" }}>Nama Orang Tua</label>
                        <input 
                            required
                            type="text" 
                            placeholder="Contoh: Ibu Siti"
                            style={inputStyle}
                            value={formData.parentName}
                            onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#451a03", marginBottom: "8px" }}>Nomor WhatsApp</label>
                        <input 
                            required
                            type="tel" 
                            placeholder="Contoh: 08123456789"
                            style={inputStyle}
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#451a03", marginBottom: "8px" }}>Program yang Diminati</label>
                        <select 
                            required
                            style={inputStyle}
                            value={formData.program}
                            onChange={(e) => setFormData({...formData, program: e.target.value})}
                        >
                            <option value="">Pilih Program</option>
                            <option value="Coding">Coding & Technology</option>
                            <option value="Mandarin">Bahasa Mandarin</option>
                            <option value="Drawing">Melukis Digital</option>
                            <option value="Music">Musik & Vokal</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#451a03", marginBottom: "8px" }}>Catatan Tambahan (Opsional)</label>
                        <textarea 
                            rows="3"
                            placeholder="Ada hal yang ingin ditanyakan?"
                            style={{ ...inputStyle, height: "auto", padding: "16px" }}
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            background: "#78350f", color: "white", padding: "18px",
                            borderRadius: "16px", border: "none", fontSize: "16px", fontWeight: 800,
                            cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s",
                            marginTop: "12px", boxShadow: "0 10px 20px rgba(120,53,15,0.2)"
                        }}
                    >
                        {loading ? "Mengirim..." : "Kirim Pendaftaran"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "#92400e" }}>
                    Sudah punya akun? <Link href="/login" style={{ fontWeight: 800, textDecoration: "none", color: "#78350f" }}>Masuk Dashboard</Link>
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    height: "56px",
    padding: "0 20px",
    borderRadius: "12px",
    border: "2px solid #fef3c7",
    backgroundColor: "#fffbeb",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit"
};
