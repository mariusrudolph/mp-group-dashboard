"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Einfacher Passwort-Check (in Produktion sollte das sicherer sein)
        if (password === process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || password === "SAG2025!") {
            // Setze Auth-Cookie
            document.cookie = "auth-token=authenticated; path=/; max-age=86400"; // 24 Stunden
            router.push("/dashboard");
        } else {
            setError("Falsches Passwort");
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    backgroundColor: '#1f2937',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    maxWidth: '400px',
                    width: '100%'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '600',
                        color: '#ffffff',
                        margin: '0 0 8px 0'
                    }}>
                        SAG Digital Dashboard
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: '#9ca3af',
                        margin: 0
                    }}>
                        Bitte geben Sie das Passwort ein
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Passwort"
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '16px',
                                backgroundColor: '#374151',
                                border: '1px solid #4b5563',
                                borderRadius: '8px',
                                color: '#ffffff',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '16px',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: '500',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                            }
                        }}
                    >
                        {isLoading ? 'Wird überprüft...' : 'Anmelden'}
                    </button>
                </form>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#6b7280'
                }}>
                    <p style={{ margin: 0 }}>
                        Passwort: <code style={{ backgroundColor: '#374151', padding: '2px 6px', borderRadius: '4px' }}>SAG2025!</code>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
