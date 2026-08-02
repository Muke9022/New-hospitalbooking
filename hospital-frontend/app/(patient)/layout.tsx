'use client';
import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, BottomNav } from '@/components/shared/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { Stethoscope } from 'lucide-react';

export default function PatientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { notifications } = useAppointments();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #2563EB, #10B981)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Stethoscope size={24} color="white" />
          </div>
          <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
        {/* Desktop sidebar */}
        <div className="sidebar-desktop">
          <Sidebar unreadCount={unreadCount} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileSidebarOpen(false)} />
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 201, animation: 'slideIn 0.25s ease' }}>
              <Sidebar open={true} onClose={() => setMobileSidebarOpen(false)} unreadCount={unreadCount} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: '4.5rem' }}>
          {/* Mobile top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'white', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 50 }} className="mobile-topbar">
            <button onClick={() => setMobileSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #2563EB, #10B981)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '1rem' }}>≡</span>
              </div>
              <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '1rem' }}>MediBook</span>
            </button>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <span style={{ background: '#EF4444', color: 'white', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem' }}>{unreadCount} new</span>
              )}
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>

      {/* Bottom nav (mobile) */}
      <BottomNav unreadCount={unreadCount} />
    </>
  );
}