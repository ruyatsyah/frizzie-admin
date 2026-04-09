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

        // Simulate brief loading
        await new Promise((r) => setTimeout(r, 600));

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            localStorage.setItem("frizzie_auth", "authenticated");
            router.push("/");
        } else {
            setError("Email atau password salah. Silakan coba lagi.");
        }
        setLoading(false);
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #6366f1 0%, #4338ca 50%, #1e1b4b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Decorative blobs */}
            <div style={{
                position: "absolute", top: "-100px", left: "-100px",
                width: "400px", height: "400px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "50%",
            }} />
            <div style={{
                position: "absolute", bottom: "-150px", right: "-100px",
                width: "500px", height: "500px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "50%",
            }} />

            {/* Card */}
            <div style={{
                background: "rgba(255,255,255,0.97)",
                borderRadius: "20px",
                padding: "48px 40px",
                width: "100%",
                maxWidth: "440px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
                position: "relative",
                zIndex: 1,
            }}>
                {/* Logo/Brand */}
                    <div style={{
                        width: "56px", height: "56px",
                        background: "linear-gradient(135deg, #6366f1, #4338ca)",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                        FrizzieSmartClub
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "14px" }}>Admin Panel — Masuk untuk melanjutkan</p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Email Field */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                            Email Admin
                        </label>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                                color: "#9ca3af"
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Masukkan email admin"
                                required
                                autoComplete="email"
                                style={{
                                    paddingLeft: "40px",
                                    borderRadius: "10px",
                                    border: error ? "1px solid #ef4444" : "1px solid #e2e8f0",
                                    height: "44px",
                                    fontSize: "14px",
                                    transition: "all 0.2s",
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                            Password
                        </label>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                                color: "#9ca3af"
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                    paddingLeft: "40px",
                                    paddingRight: "44px",
                                    borderRadius: "10px",
                                    border: error ? "1px solid #ef4444" : "1px solid #e2e8f0",
                                    height: "44px",
                                    fontSize: "14px",
                                    transition: "all 0.2s",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", padding: "0",
                                    color: "#9ca3af", cursor: "pointer"
                                }}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            height: "46px",
                            background: loading
                                ? "#a5b4fc"
                                : "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "15px",
                            fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: loading ? "none" : "0 4px 15px rgba(99,102,241,0.4)",
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
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    marginTop: "24px",
                    color: "#94a3b8",
                    fontSize: "12px",
                }}>
                    © 2025 FrizzieSmartClub. Akses terbatas untuk admin.
                </p>
            </div>
        </div>
    );
}
