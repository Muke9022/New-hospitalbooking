'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle, Calendar, Clock, User, Download, Home, List } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';

export default function BookingSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lastBooking } = useAppointments();

  if (!lastBooking) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }} className="page-enter">
      <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        {/* Success banner */}
        <div style={{ background: 'linear-gradient(135deg, #059669, #10B981)', padding: '2.5rem', textAlign: 'center' }}>
          <div className="animate-bounce-in" style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle size={44} color="white" />
          </div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.75rem', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Appointment Confirmed!</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', margin: 0 }}>Your booking has been confirmed. See you soon!</p>
        </div>

        {/* Details */}
        <div style={{ padding: '1.75rem' }}>
          <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', margin: '0 0 1rem' }}>Booking Details</h3>
            {[{ icon: User, label: 'Doctor', value: lastBooking.doctorName },
              { icon: Calendar, label: 'Department', value: lastBooking.department },
              { icon: Clock, label: 'Time Slot', value: lastBooking.slotLabel },
              { icon: Calendar, label: 'Date', value: new Date(lastBooking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
              { icon: User, label: 'Patient', value: user?.name || '' },
              { icon: User, label: 'Booking ID', value: lastBooking.id }].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ width: 32, height: 32, background: '#EFF6FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={14} color="#2563EB" /></div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0 }}>{label}</p>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B', margin: 0 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* QR placeholder */}
          <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', border: '2px dashed #E2E8F0' }}>
            <div style={{ width: 80, height: 80, background: '#1E293B', borderRadius: 8, margin: '0 auto 0.75rem', display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 2, padding: 8 }}>
              {[...Array(64)].map((_, i) => (
                <div key={i} style={{ background: Math.random() > 0.5 ? 'white' : 'transparent', borderRadius: 1 }} />
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>Scan at reception for fast check-in</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-outline" style={{ flex: 1, justifyContent: 'center', minWidth: 140 }} onClick={() => router.push('/appointments')}>
              <List size={16} /> My Appointments
            </button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: 140 }} onClick={() => router.push('/dashboard')}>
              <Home size={16} /> Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
