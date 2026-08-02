'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
      
      {/* 👈 Brand Logo wrapped inside Link for instant navigation */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2563EB, #10B981)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stethoscope size={18} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>MediBook</span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="hidden-mobile">
        {['Home', 'Doctors', 'About', 'Contact'].map((item) => (
          <button key={item}
            onClick={() => {
             if (item === 'Home') router.push('/');
else if (item === 'Doctors') router.push('/doctors');
else if (item === 'About') router.push('/about');
else if (item === 'Contact') router.push('/contact');
            }}
            style={{ background: 'none', border: 'none', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: '#64748B', fontWeight: 500, cursor: 'pointer', borderRadius: 8, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Auth Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {user ? (
          <>
            <button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }} onClick={() => router.push('/dashboard')}>Dashboard</button>
            <button className="btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login"><button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}>Login</button></Link>
            <Link href="/register"><button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}>Register</button></Link>
          </>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }} className="mobile-menu-btn">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}