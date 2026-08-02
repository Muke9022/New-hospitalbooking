'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} className="animate-fade-in">
        {step === 'email' && (
          <>
            <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem' }}><ArrowLeft size={16} /> Back to Login</Link>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Forgot Password?</h2>
            <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Enter your email and we will send you a reset code.</p>
            <input type="email" className="input-field" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: '1rem' }} />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => email.includes('@') && setStep('otp')}>Send OTP</button>
          </>
        )}
        {step === 'otp' && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Enter OTP</h2>
            <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Enter the 6-digit code sent to {email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {[...Array(6)].map((_, i) => (
                <input key={i} type="text" maxLength={1} style={{ width: 44, height: 52, textAlign: 'center', border: '2px solid #E2E8F0', borderRadius: 10, fontSize: '1.1rem', fontWeight: 700, outline: 'none' }} onFocus={(e) => (e.target.style.borderColor = '#2563EB')} onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')} />
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('reset')}>Verify OTP</button>
          </>
        )}
        {step === 'reset' && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.5rem' }}>New Password</h2>
            <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Enter your new password below.</p>
            <input type="password" className="input-field" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: '0.75rem' }} />
            <input type="password" className="input-field" placeholder="Confirm new password" style={{ marginBottom: '1rem' }} />
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('done')}>Reset Password</button>
          </>
        )}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div className="animate-bounce-in" style={{ width: 72, height: 72, background: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={36} color="#16a34a" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Password Changed!</h2>
            <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Your password has been successfully updated.</p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => router.push('/login')}>Sign In Now</button>
          </div>
        )}
      </div>
    </div>
  );
}
