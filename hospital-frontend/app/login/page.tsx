'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Stethoscope } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F8FAFC' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 55%, #0ea5e9 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 60%, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid rgba(255,255,255,0.2)' }}>
            <Stethoscope size={38} color="white" />
          </div>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.75rem', margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>Welcome to MediBook</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>Book same-day appointments with top specialists. Fast, easy, and secure.</p>
          <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=350&fit=crop&auto=format" alt="Healthcare" style={{ width: '100%', borderRadius: 20, boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
            {[{ v: '10,000+', l: 'Patients' }, { v: '50+', l: 'Doctors' }, { v: '4.9★', l: 'Rating' }].map((s) => (
              <div key={s.l} style={{ display: 'flex', flexDirection: 'column', color: 'white', textAlign: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.3rem' }}>{s.v}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-in">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Sign In</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>Welcome back! Enter your credentials to continue.</p>
          </div>

          {/* Updated Info Message Box */}
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 10,
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              fontSize: "0.78rem",
              color: "#1e40af",
            }}>
            Login using your registered email and password.
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '2.5rem' }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type={showPwd ? 'text' : 'password'} className="input-field" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#374151' }}>
                <input type="checkbox" style={{ accentColor: '#2563EB', width: 15, height: 15 }} /> Remember me
              </label>
              <Link href="/forgot-password" style={{ color: '#2563EB', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748B' }}>
            Do not have an account?{' '}
            <Link href="/register" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}