'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle, XCircle, Plus, AlertCircle } from 'lucide-react';
import { useAppointments } from '@/context/AppointmentContext';
import { Modal } from '@/components/shared/Modal';

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { appointments, cancelAppointment } = useAppointments();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [cancelId, setCancelId] = useState<string | null>(null);

  // Dynamic Status Checker Function (Database status gets first priority)
  const getAppointmentStatus = (appointment: any) => {
    // Database status la first priority
    if (appointment.status === "completed") {
      return "completed";
    }

    if (appointment.status === "cancelled") {
      return "cancelled";
    }

    // Upcoming check
    try {
      const now = new Date();

      const [year, month, day] = appointment.date.split("-").map(Number);

      const timeParts = appointment.slotLabel?.split("-");
      if (!timeParts || timeParts.length < 2) return "upcoming";

      const endTime = timeParts[1].trim();

      const [time, modifier] = endTime.split(" ");

      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const appointmentEnd = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes
      );

      if (now > appointmentEnd) {
        return "completed";
      }
    } catch (err) {
      console.error(err);
    }

    return "upcoming";
  };

  // Filter appointments based on dynamic status
  const filtered = appointments.filter((a) => {
    const status = getAppointmentStatus(a);
    return filter === 'all' || status === filter;
  });

  const statusIcon = {
    upcoming: Clock,
    completed: CheckCircle,
    cancelled: XCircle,
  };

  const statusColor = {
    upcoming: '#2563EB',
    completed: '#22C55E',
    cancelled: '#EF4444',
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1000, margin: '0 auto' }} className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>My Appointments</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>{appointments.length} total appointments</p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/booking')}><Plus size={16} /> New Appointment</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            style={{ padding: '0.5rem 1.25rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.825rem', transition: 'all 0.2s',
              background: filter === tab ? '#2563EB' : '#F1F5F9',
              color: filter === tab ? 'white' : '#64748B' }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span style={{ marginLeft: '0.5rem', background: filter === tab ? 'rgba(255,255,255,0.25)' : '#E2E8F0', color: filter === tab ? 'white' : '#64748B', padding: '0.1rem 0.5rem', borderRadius: 10, fontSize: '0.72rem' }}>
              {tab === 'all' ? appointments.length : appointments.filter((a) => getAppointmentStatus(a) === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Calendar size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600, color: '#94A3B8', marginBottom: '0.5rem' }}>No {filter !== 'all' ? filter : ''} appointments</h3>
          <p style={{ color: '#CBD5E1', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Book your first appointment today!</p>
          <button className="btn-primary" onClick={() => router.push('/booking')}>Book Now</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((a) => {
            const currentStatus = getAppointmentStatus(a);
            const StatusIcon = statusIcon[currentStatus];

            return (
              <div key={a.id} style={{ background: 'white', borderRadius: 16, padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 52, height: 52, background: statusColor[currentStatus] + '15', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <StatusIcon size={24} color={statusColor[currentStatus]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B', margin: 0 }}>{a.doctorName}</h3>
                    <span className={`badge badge-${currentStatus}`}>{currentStatus}</span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#2563EB', fontWeight: 600, margin: '0 0 0.25rem' }}>{a.department}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: '#64748B', flexWrap: 'wrap' }}>
                    <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{a.date}</span>
                    <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{a.slotLabel}</span>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>#{a.id}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {currentStatus === 'upcoming' && (
                    <button className="btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setCancelId(a.id)}>Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel confirmation modal */}
      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Appointment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={32} color="#EF4444" />
          </div>
          <div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1E293B',
                margin: '0 0 0.5rem',
              }}>
              Appointment Cancellation
            </h3>
            <p
              style={{
                color: '#64748B',
                fontSize: '0.875rem',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              If you want to cancel your appointment, please contact the hospital.
              <br />
              Our staff will assist you with the cancellation process.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setCancelId(null)}>
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}