'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', gender: 'male', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Create Account');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // 🌟 Render Cold-Start Warmup: Page load hote hi server ko background me jagao
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await api.doctors.list();
      } catch (e) {
        // Silent catch
      }
    };
    wakeUpServer();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.length < 10) e.phone = 'Valid phone required';
    if (!form.dob) e.dob = 'Date of birth required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.terms = 'You must agree to the terms';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setLoading(true);
      setLoadingText('Sending OTP...');

      // Agar server spin-up hone me time lage (4s+), toh user ko inform karo
      const timer = setTimeout(() => {
        setLoadingText('Waking up server, please wait...');
      }, 4000);

      try {
        const cleanEmail = form.email.trim().toLowerCase();
        await api.auth.sendOtp(cleanEmail);

        clearTimeout(timer);
        setLoading(false);
        setShowOtp(true);
      } catch (err: any) {
        clearTimeout(timer);
        setLoading(false);

        let msg = "Failed to send OTP";
        try {
          const parsed = JSON.parse(err.message);
          msg = parsed?.error?.message || msg;
        } catch {
          msg = err.message || msg;
        }

        setErrors({
          general: msg,
        });
      } finally {
        setLoadingText('Create Account');
      }
    }
  };

  const handleResendOtp = async () => {
    setErrors({});
    setLoading(true);
    try {
      const cleanEmail = form.email.trim().toLowerCase();
      await api.auth.sendOtp(cleanEmail);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      let msg = "Failed to resend OTP";
      try {
        const parsed = JSON.parse(err.message);
        msg = parsed?.error?.message || msg;
      } catch {
        msg = err.message || msg;
      }
      setErrors({
        general: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      setErrors({
        general: "Please enter the complete 6-digit OTP",
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const cleanEmail = form.email.trim().toLowerCase();
      await api.auth.verifyOtp(cleanEmail, code);

      const result = await register({
        ...form,
        email: cleanEmail,
      });

      if (result.success) {
        router.push("/dashboard");
      } else {
        setErrors({
          general: result.error || "Registration failed",
        });
      }
    } catch (err: any) {
      let msg = "Invalid OTP";
      try {
        const parsed = JSON.parse(err.message);
        msg = parsed?.error?.message || msg;
      } catch {
        msg = err.message || msg;
      }
      setErrors({
        general: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} className="animate-bounce-in">
          <div style={{ width: 64, height: 64, background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}><Mail size={28} color="#2563EB" /></div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.5rem' }}>Verify Your Email</h2>
          <p style={{ color: '#64748B', marginBottom: '2rem' }}>We sent a 6-digit code to <strong>{form.email.trim().toLowerCase()}</strong></p>
          
          {errors.general && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.85rem' }}>
              {errors.general}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {otp.map((v, i) => (
              <input key={i} type="text" maxLength={1} value={v}
                onChange={(e) => { const nv = [...otp]; nv[i] = e.target.value; setOtp(nv); if (e.target.value && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus(); }}
                id={`otp-${i}`}
                style={{ width: 48, height: 56, textAlign: 'center', border: '2px solid #E2E8F0', borderRadius: 12, fontSize: '1.25rem', fontWeight: 700, outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => (e.target.style.borderColor = '#2563EB')}
                onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')} />
            ))}
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
            onClick={handleOtpVerify}
            disabled={loading}
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                <CheckCircle size={16} />
                Verify & Complete Registration
              </>
            )}
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748B' }}>
            Did not receive?{' '}
            <button 
              type="button" 
              onClick={handleResendOtp} 
              disabled={loading}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
            >
              Resend Code
            </button>
          </p>
        </div>
      </div>
    );
  }

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>{label}</label>
      <input type={type} className="input-field" placeholder={placeholder} value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        style={{ borderColor: errors[key] ? '#EF4444' : undefined }} />
      {errors[key] && <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', maxWidth: 560, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} className="animate-fade-in">
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Create Account</h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Join MediBook and start booking appointments today.</p>
        {errors.general && <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#991B1B', fontSize: '0.85rem' }}>{errors.general}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {field('name', 'Full Name', 'text', 'John Doe')}
          {field('email', 'Email Address', 'email', 'you@example.com')}
          {field('phone', 'Phone Number', 'tel', '+1 (555) 000-0000')}
          {field('dob', 'Date of Birth', 'date')}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Gender</label>
            <select className="input-field" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} style={{ paddingRight: '2.5rem', borderColor: errors.password ? '#EF4444' : undefined }} />
              <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{errors.password}</p>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Confirm Password</label>
            <input type="password" className="input-field" placeholder="Repeat your password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} style={{ borderColor: errors.confirm ? '#EF4444' : undefined }} />
            {errors.confirm && <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{errors.confirm}</p>}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', marginTop: '1.25rem', fontSize: '0.85rem', color: '#374151' }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ accentColor: '#2563EB', width: 16, height: 16, marginTop: 2 }} />
          <span>I agree to the <span style={{ color: '#2563EB', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: '#2563EB', fontWeight: 600 }}>Privacy Policy</span></span>
        </label>
        {errors.terms && <p style={{ color: '#EF4444', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{errors.terms}</p>}
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '1.5rem' }} onClick={handleSubmit} disabled={loading}>
          {loading ? loadingText : 'Create Account'}
        </button>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#64748B' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}