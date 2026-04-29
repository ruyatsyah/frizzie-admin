"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "ruyatsyah2203@gmail.com";
const ADMIN_PASSWORD = "admin";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const userData = await res.json();
                localStorage.setItem("frizzie_auth", JSON.stringify(userData));
                router.push("/");
            } else {
                const data = await res.json();
                setError(data.error || "Login gagal. Silakan coba lagi.");
            }
        } catch (err) {
            setError("Terjadi kesalahan jaringan.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f1f5f9", // Light neutral background
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            position: "relative",
        }}>
            {/* Card */}
            <div style={{
                background: "#ffffff",
                borderRadius: "24px",
                padding: "48px 40px",
                width: "100%",
                maxWidth: "440px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
                zIndex: 1,
                border: "1px solid #e2e8f0"
            }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "20px",
                    }}>
                        <img 
                            src="/assets/logo-frizzie.png" 
                            alt="Logo Frizzie" 
                            style={{ width: '130px', height: '130px', objectFit: 'contain' }} 
                        />
                    </div>
                    <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#78350f", marginBottom: "4px", letterSpacing: "-0.025em" }}>
                        FrizzieSmartClub
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>Sistem Manajemen Dashboard</p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Email Field */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                            Email Pengguna
                        </label>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                                color: "#94a3b8"
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                required
                                autoComplete="email"
                                style={{
                                    width: "100%",
                                    paddingLeft: "44px",
                                    borderRadius: "12px",
                                    border: error ? "2px solid #ef4444" : "1px solid #e2e8f0",
                                    height: "48px",
                                    fontSize: "14px",
                                    transition: "all 0.2s",
                                    outline: "none",
                                    backgroundColor: "#F9FAFB",
                                    color: "#1e293b"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#78350f"}
                                onBlur={(e) => e.target.style.borderColor = error ? "#ef4444" : "#e2e8f0"}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                            Kata Sandi
                        </label>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                                color: "#94a3b8"
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                style={{
                                    width: "100%",
                                    paddingLeft: "44px",
                                    paddingRight: "48px",
                                    borderRadius: "12px",
                                    border: error ? "2px solid #ef4444" : "1px solid #e2e8f0",
                                    height: "48px",
                                    fontSize: "14px",
                                    transition: "all 0.2s",
                                    outline: "none",
                                    backgroundColor: "#F9FAFB",
                                    color: "#1e293b"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#78350f"}
                                onBlur={(e) => e.target.style.borderColor = error ? "#ef4444" : "#e2e8f0"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", padding: "0",
                                    color: "#94a3b8", cursor: "pointer"
                                }}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            marginBottom: "20px",
                            padding: "12px 16px",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            color: "#dc2626",
                            fontSize: "13px",
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            height: "50px",
                            background: loading
                                ? "#d6d3d1"
                                : "linear-gradient(135deg, #78350f 0%, #451a03 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "15px",
                            fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            boxShadow: loading ? "none" : "0 8px 20px rgba(120,53,15,0.25)",
                        }}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Memverifikasi...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                                Masuk ke Dashboard
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p style={{
                    textAlign: "center",
                    marginTop: "32px",
                    color: "#94a3b8",
                    fontSize: "12px",
                    fontWeight: 500,
                    lineHeight: 1.6
                }}>
                    © 2025 FrizzieSmartClub. <br/>
                    Create with ❤️ ruyatsyah
                </p>
            </div>
        </div>
    );
}
