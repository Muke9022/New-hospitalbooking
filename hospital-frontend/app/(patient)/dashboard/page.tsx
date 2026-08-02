'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Bell, ArrowRight, Activity, Stethoscope } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { api } from '@/lib/api';

// 🌟 Strapi Image URL Resolver Helper Function
function getImageUrl(imageField: any): string {
  if (!imageField)
    return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150";

  let url = "";

  if (typeof imageField === "string") {
    url = imageField;
  } else if (Array.isArray(imageField) && imageField.length > 0) {
    url = imageField[0]?.url || imageField[0]?.attributes?.url || "";
  } else if (imageField?.data?.attributes?.url) {
    url = imageField.data.attributes.url;
  } else if (imageField?.data?.url) {
    url = imageField.data.url;
  } else if (imageField?.url) {
    url = imageField.url;
  }

  if (!url)
    return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150";

  return url.startsWith("http")
    ? url
    : `http://localhost:1337${url}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { appointments, notifications, selectDoctor } = useAppointments();

  const [quickDoctors, setQuickDoctors] = useState<any[]>([]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await api.doctors.list();

        setQuickDoctors(
          (res.data || [])
            .filter((d: any) => d.available)
            .slice(0, 4)
        );
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    loadDoctors();
  }, []);

  // Dynamic Status Checker Logic
  const getAppointmentStatus = (appointment: any) => {
    if (appointment.status === 'cancelled') return 'cancelled';

    try {
      const now = new Date();
      const [year, month, day] = appointment.date.split('-').map(Number);

      const timeParts = appointment.slotLabel?.split('-');
      if (!timeParts || timeParts.length < 2) return appointment.status || 'upcoming';

      const endTime = timeParts[1].trim();
      const [time, modifier] = endTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const appointmentEnd = new Date(year, month - 1, day, hours, minutes);

      if (now > appointmentEnd) {
        return 'completed';
      }
    } catch (err) {
      console.error('Error calculating appointment status:', err);
    }

    return 'upcoming';
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.date === today && getAppointmentStatus(a) === 'upcoming');
  const upcoming = appointments.filter((a) => getAppointmentStatus(a) === 'upcoming');
  const completed = appointments.filter((a) => getAppointmentStatus(a) === 'completed');
  const cancelled = appointments.filter((a) => getAppointmentStatus(a) === 'cancelled');
  const unread = notifications.filter((n) => !n.read);

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, color: '#2563EB', bg: '#EFF6FF', icon: Calendar },
    { label: 'Upcoming', value: upcoming.length, color: '#10B981', bg: '#DCFCE7', icon: Clock },
    { label: 'Completed', value: completed.length, color: '#22C55E', bg: '#DCFCE7', icon: CheckCircle },
    { label: 'Cancelled', value: cancelled.length, color: '#EF4444', bg: '#FEE2E2', icon: XCircle },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ position: 'relative', background: '#F1F5F9', border: 'none', borderRadius: 10, padding: '0.6rem', cursor: 'pointer', color: '#64748B' }} onClick={() => router.push('/notifications')}>
            <Bell size={20} />
            {unread.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: 'white', borderRadius: '50%', fontSize: '0.6rem', fontWeight: 700, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread.length}</span>
            )}
          </button>
          <button className="btn-primary" onClick={() => router.push('/booking')}><Plus size={16} /> Book Appointment</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {stats.map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Quick Book */}
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B', margin: 0 }}>Quick Book a Doctor</h2>
            <button className="btn-outline" style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem' }} onClick={() => router.push('/doctors')}>View All <ArrowRight size={13} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {quickDoctors.map((doc) => (
              <div key={doc.documentId || doc.id}
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#F8FAFC';
                }}
                onClick={() => {
                  const docId = doc.documentId || doc.id;
                  selectDoctor(String(docId));
                  router.push(`/doctors/${docId}`);
                }}>
                
                {/* 🌟 SAFE IMAGE RENDER WITH STRAPI URL RESOLVER */}
                <img
                  src={getImageUrl(doc.image)}
                  alt={doc.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</p>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.1rem 0 0' }}>{doc.speciality || doc.specialty} · {doc.experience} yrs</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F59E0B' }}>⭐ {doc.rating}</span>
                  <button className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.78rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectDoctor(String(doc.id));
                      router.push('/booking');
                    }}>Book</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Announcements */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563EB)', borderRadius: 16, padding: '1.25rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <Activity size={18} />
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Hospital Update</h3>
            </div>
            <p style={{ fontSize: '0.825rem', opacity: 0.85, lineHeight: 1.6, margin: '0 0 1rem' }}>
              New Radiology wing now open! Advanced MRI and CT scan facilities available. Book your scan through the app.
            </p>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>Read more →</span>
          </div>

          {/* Recent Appointments */}
          <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', margin: 0 }}>Recent Activity</h3>
              <button style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => router.push('/appointments')}>View all</button>
            </div>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <Stethoscope size={36} color="#CBD5E1" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: '#94A3B8', fontSize: '0.825rem', margin: 0 }}>No appointments yet</p>
                <button className="btn-primary" style={{ marginTop: '0.75rem', fontSize: '0.78rem', padding: '0.5rem 1rem' }} onClick={() => router.push('/booking')}>Book Now</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {appointments.slice(0, 3).map((a) => {
                  const currentStatus = getAppointmentStatus(a);
                  return (
                    <div key={a.id || a.documentId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: currentStatus === 'upcoming' ? '#2563EB' : currentStatus === 'completed' ? '#22C55E' : '#EF4444', marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.825rem', color: '#1E293B', margin: 0 }}>{a.doctorName}</p>
                        <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: 0 }}>{a.slotLabel} · {a.department}</p>
                      </div>
                      <span className={`badge badge-${currentStatus}`}>{currentStatus}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications preview */}
          {unread.length > 0 && (
            <div style={{ background: '#FFFBEB', borderRadius: 16, padding: '1.25rem', border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Bell size={16} color="#D97706" />
                <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#92400E', margin: 0 }}>{unread.length} New Notification{unread.length > 1 ? 's' : ''}</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#78350F', lineHeight: 1.5, margin: '0 0 0.75rem' }}>{unread[0]?.message}</p>
              <button style={{ background: 'none', border: 'none', color: '#D97706', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', padding: 0 }} onClick={() => router.push('/notifications')}>
                View all notifications →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}