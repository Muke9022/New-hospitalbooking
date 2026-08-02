'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Calendar, UserCheck, Users, FileText,
  Bell, User, LogOut, Stethoscope, ChevronRight,
  BarChart3, Settings, X, Home, Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const patientNav = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/about', icon: Info, label: 'About' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/booking', icon: Calendar, label: 'Book Appointment' },
  { href: '/appointments', icon: UserCheck, label: 'My Appointments' },
  { href: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const adminNav = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/about', icon: Info, label: 'About' },
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
  { href: '/admin/patients', icon: Users, label: 'Patients' },
  { href: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/admin/slots', icon: UserCheck, label: 'Slot Management' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  unreadCount?: number;
}

export function Sidebar({ open = true, onClose, unreadCount = 0 }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const nav = isAdmin ? adminNav : patientNav;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside style={{ width: 240, minHeight: '100vh', background: 'white', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', padding: '1rem', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0.5rem' }}>
        
        {/* 👈 Clickable Logo to Home Page */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2563EB, #10B981)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1E293B' }}>MediBook</span>
        </Link>

        {onClose && (<button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={18} /></button>)}
      </div>
      {user && (
        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0 }}>{isAdmin ? 'Administrator' : 'Patient'}</p>
          </div>
        </div>
      )}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
          return (
            <button key={href} className={`sidebar-item ${active ? 'active' : ''}`}
              onClick={() => { router.push(href); onClose?.(); }}
              style={{ position: 'relative' }}>
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#EF4444', color: 'white', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px' }}>{unreadCount}</span>
              )}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#2563EB' }} />}
            </button>
          );
        })}
      </nav>
      <button className="sidebar-item" onClick={handleLogout} style={{ color: '#EF4444', marginTop: '0.5rem' }}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const items = isAdmin
    ? [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dash' },
        { href: '/admin/appointments', icon: Calendar, label: 'Appts' },
        { href: '/admin/settings', icon: Settings, label: 'Settings' },
      ]
    : [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dash' },
        { href: '/doctors', icon: Stethoscope, label: 'Doctors' },
        { href: '/appointments', icon: Calendar, label: 'Appts' },
        { href: '/notifications', icon: Bell, label: 'Alerts' },
        { href: '/profile', icon: User, label: 'Profile' },
      ];

  return (
    <div className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', zIndex: 100, padding: '0.5rem 0 0.25rem' }}>
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <button key={href} onClick={() => router.push(href)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0', color: active ? '#2563EB' : '#94A3B8' }}>
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {label === 'Alerts' && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: 'white', borderRadius: '50%', fontSize: '0.55rem', fontWeight: 700, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
              )}
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 400 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}