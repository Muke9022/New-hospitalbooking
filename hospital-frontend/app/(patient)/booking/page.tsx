'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { Modal } from '@/components/shared/Modal';
import { api } from "@/lib/api";

const MAX_PER_SLOT = 3;

// Skeleton Component for Doctor Avatars Loading
function DoctorSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: 12, border: '1px solid #E2E8F0', minWidth: 100, background: '#F8FAFC' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ width: 60, height: 12, borderRadius: 4, background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ width: 40, height: 10, borderRadius: 4, background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>
      ))}
    </div>
  );
}

// Skeleton Component for Main Doctor Card Loading
function DoctorCardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E2E8F0', flexShrink: 0, animation: 'pulse 1.5s infinite ease-in-out' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ width: '40%', height: 16, borderRadius: 4, background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: '30%', height: 12, borderRadius: 4, background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ width: '25%', height: 10, borderRadius: 4, background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>
      <div style={{ width: 50, height: 24, borderRadius: 4, background: '#E2E8F0', animation: 'pulse 1.5s infinite ease-in-out' }} />
    </div>
  );
}

// Skeleton Grid for Slots Loading
function SlotGridSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{ borderRadius: 12, padding: '0.875rem', border: '1px solid #E2E8F0', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 50, height: 14, background: '#E2E8F0', borderRadius: 4, animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ width: 40, height: 14, background: '#E2E8F0', borderRadius: 4, animation: 'pulse 1.5s infinite ease-in-out' }} />
          </div>
          <div style={{ width: '70%', height: 12, background: '#E2E8F0', borderRadius: 4, animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ width: '100%', height: 5, background: '#E2E8F0', borderRadius: 3, animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>
      ))}
    </div>
  );
}

// Helper function to extract image URL safely from any Strapi structure
function getImageUrl(imageField: any): string {
  if (!imageField) return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150";

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

  if (!url) return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `http://localhost:1337${url}`;
}

function getSlotStatus(slotStart: string, bookings: Array<{ slotStart: string; count: number }>): 'available' | 'almost' | 'full' | 'past' {
  const now = new Date();
  const [h] = slotStart.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(h, 0, 0, 0);
  if (slotTime < now) return 'past';
  const booking = bookings.find((b) => b.slotStart === slotStart);
  const count = booking?.count || 0;
  if (count >= MAX_PER_SLOT) return 'full';
  if (count === MAX_PER_SLOT - 1) return 'almost';
  return 'available';
}

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    selectedDoctor,
    selectDoctor,
    loadAppointments,
    bookAppointment,
  } = useAppointments();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | number | null>(selectedDoctor || null);
  
  // Skeleton Loading States
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Fetch doctors list from API
  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await api.doctors.list();
        const docsList = res.data || [];
        setDoctors(docsList);

        if (!selectedDoctor && docsList.length > 0) {
          setSelectedDoctorId(docsList[0].id || docsList[0].documentId);
        }
      } catch (err) {
        console.error("Error loading doctors:", err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [selectedDoctor]);

  // Find matching doctor from backend list
  const doc = doctors.find(
    (d) => String(d.id) === String(selectedDoctorId) || d.documentId === selectedDoctorId
  ) || doctors[0];

  // Dynamic Time Slots based on selected doctor
  const TIME_SLOTS = useMemo(() => {
    if (
      !doc?.workingStartTime ||
      !doc?.workingEndTime ||
      !doc?.slotDuration
    ) {
      return [];
    }

    const slots = [];

    const [startHour, startMinute] = doc.workingStartTime.split(":").map(Number);
    const [endHour, endMinute] = doc.workingEndTime.split(":").map(Number);

    const current = new Date();
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    while (current < end) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current);

      slotEnd.setMinutes(slotEnd.getMinutes() + doc.slotDuration);

      if (slotEnd > end) break;

      slots.push({
        start: slotStart.toTimeString().slice(0, 5),
        end: slotEnd.toTimeString().slice(0, 5),
        label: `${slotStart.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${slotEnd.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      });

      current.setMinutes(current.getMinutes() + doc.slotDuration);
    }

    return slots;
  }, [doc]);

  // Load appointments specifically by Doctor and Date
  useEffect(() => {
    const loadAllAppointments = async () => {
      if (!doc) return;
      setLoadingAppointments(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await api.appointments.byDoctorAndDate(
          doc.documentId || doc.id,
          today
        );
        console.log("Appointments from API:", res.data);
        setAllAppointments(res.data || []);
      } catch (err) {
        console.error("Error loading appointments:", err);
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAllAppointments();
  }, [doc]);

  // Compute real-time slot bookings (filtering out cancelled)
  const bookings = useMemo(() => {
    if (!doc) return [];

    return TIME_SLOTS.map((slot) => {
      const count = allAppointments.filter((appointment: any) => {
        const slotStart =
          appointment.slotStart || appointment.attributes?.slotStart;

        const status =
          appointment.appointmentStatus || appointment.status || appointment.attributes?.appointmentStatus || appointment.attributes?.status;

        return (
          slotStart === slot.start &&
          status !== "cancelled"
        );
      }).length;

      return {
        slotStart: slot.start,
        count,
        userBooked: false,
      };
    });
  }, [allAppointments, doc, TIME_SLOTS]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Safe handleBook with duplicate check, slot capacity limit, and Notification Creation
  const handleBook = async () => {
    if (!selectedSlot || !user || !doc) return;
    
    // Safe duplicate booking check
    const alreadyBooked = allAppointments.some((appointment: any) => {
      const slotStart =
        appointment.slotStart || appointment.attributes?.slotStart;

      const patientEmail =
        appointment.patientEmail || appointment.attributes?.patientEmail;

      const status =
        appointment.appointmentStatus || appointment.status || appointment.attributes?.appointmentStatus || appointment.attributes?.status;

      return (
        slotStart === selectedSlot &&
        patientEmail === user.email &&
        status !== "cancelled"
      );
    });

    if (alreadyBooked) {
      alert("You have already booked this time slot.");
      return;
    }

    // Block booking if slot count reaches maximum (MAX_PER_SLOT)
    const slotCount = allAppointments.filter((appointment: any) => {
      const slotStart =
        appointment.slotStart || appointment.attributes?.slotStart;

      const status =
        appointment.appointmentStatus || appointment.status || appointment.attributes?.appointmentStatus || appointment.attributes?.status;

      return (
        slotStart === selectedSlot &&
        status !== "cancelled"
      );
    }).length;

    if (slotCount >= MAX_PER_SLOT) {
      alert("This slot is already full.");
      return;
    }

    const slot = TIME_SLOTS.find((s) => s.start === selectedSlot)!;

    try {
      const appointmentRes = await api.appointments.create({
        doctorId: doc.documentId || String(doc.id),
        doctorName: doc.name,
        department: doc.department || doc.speciality || "General",
        date: new Date().toISOString().split("T")[0],
        slotStart: slot.start,
        slotEnd: slot.end,
        slotLabel: slot.label,
        appointmentStatus: "upcoming",
        fee: doc.fee || 50,
        patientName: user.name,
        patientEmail: user.email,
        user: user.id,
      });

      await api.notifications.create({
        title: "Appointment Confirmed",
        message: `Your appointment with ${doc.name} has been booked successfully.`,
        type: "confirmed",
        read: false,
        activityDate: new Date().toISOString().split("T")[0],
        activityTime: slot.label,
        user: user.id,
        appointment: appointmentRes?.data?.documentId,
      });

      bookAppointment({
        id: String(appointmentRes.data.id),
        documentId: appointmentRes.data.documentId,
        doctorId: doc.documentId || String(doc.id),
        doctorName: doc.name,
        department: doc.department || doc.speciality || "General",
        date: new Date().toISOString().split("T")[0],
        slotStart: slot.start,
        slotEnd: slot.end,
        slotLabel: slot.label,
        appointmentStatus: "upcoming",
        fee: doc.fee || 50,
        doctorImage: getImageUrl(doc.image),
      });

      // Refresh appointments and slot counts
      await loadAppointments();
      
      const todayDate = new Date().toISOString().split("T")[0];
      const res = await api.appointments.byDoctorAndDate(
        doc.documentId || doc.id,
        todayDate
      );
      console.log("Appointments from API:", res.data);
      setAllAppointments(res.data || []);

      setConfirmOpen(false);

      // Reset selection state
      setSelectedSlot(null);
      setSelectedDoctorId(doc.documentId || doc.id);

      router.push("/booking/success");
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

  const selectedSlotData = TIME_SLOTS.find((s) => s.start === selectedSlot);
  const statusColors: Record<string, string> = { available: '#10B981', almost: '#F59E0B', full: '#EF4444', past: '#94A3B8' };
  const statusLabels: Record<string, string> = { available: 'Available', almost: 'Almost Full', full: 'FULL', past: 'Past' };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      {/* Pulse keyframe inline injection */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      
      <button onClick={() => router.push('/doctors')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
        <ChevronLeft size={16} /> Back to Doctors
      </button>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>Book Appointment</h1>
      <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Select a doctor and available time slot for today.</p>

      {/* Doctor Selection List */}
      {!selectedDoctor && (
        <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Select Doctor</label>
          {loadingDoctors ? (
            <DoctorSkeleton />
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {doctors.filter((d) => d.available).map((d) => {
                const currentId = d.id || d.documentId;
                const isSelected = String(selectedDoctorId) === String(currentId);
                return (
                  <button key={currentId} onClick={() => { setSelectedDoctorId(currentId); setSelectedSlot(null); selectDoctor(String(currentId)); }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem', borderRadius: 12, border: `2px solid ${isSelected ? '#2563EB' : '#E2E8F0'}`, background: isSelected ? '#EFF6FF' : 'white', cursor: 'pointer', minWidth: 100, transition: 'all 0.2s' }}>
                    <img
                      src={getImageUrl(d.image)}
                      alt={d.name}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isSelected ? '#2563EB' : '#374151', textAlign: 'center', whiteSpace: 'nowrap' }}>{d.name?.replace('Dr. ', '')}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{d.speciality || d.specialty}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Doctor Card */}
      {loadingDoctors || !doc ? (
        <DoctorCardSkeleton />
      ) : (
        <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <img
            src={getImageUrl(doc.image)}
            alt={doc.name}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            loading="lazy"
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B', margin: 0 }}>{doc.name}</h2>
            <p style={{ fontSize: '0.825rem', color: '#2563EB', fontWeight: 600, margin: '0.15rem 0' }}>{doc.speciality || doc.specialty} · {doc.department || 'General'}</p>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>{doc.hospital || 'MediBook Hospital'}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontWeight: 800, color: '#10B981', fontSize: '1.1rem' }}>${doc.fee || 50}</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Consultation</div>
          </div>
        </div>
      )}

      {/* Date banner */}
      <div style={{ background: '#EFF6FF', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', border: '1px solid #BFDBFE' }}>
        <div style={{ width: 40, height: 40, background: '#2563EB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Clock size={20} color="white" /></div>
        <div>
          <p style={{ fontWeight: 700, color: '#1e40af', margin: 0 }}>Today — {today}</p>
          <p style={{ fontSize: '0.78rem', color: '#3B82F6', margin: '0.15rem 0 0' }}>
            {doc?.workingStartTime && doc?.workingEndTime 
              ? `Appointments available · ${doc.workingStartTime} – ${doc.workingEndTime}` 
              : 'Appointments only available for today · 9:00 AM – 6:00 PM'}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#64748B' }}>
        {Object.entries(statusColors).map(([k, c]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            {statusLabels[k]}
          </div>
        ))}
      </div>

      {/* Slot grid with Skeleton Loading */}
      {loadingAppointments || loadingDoctors ? (
        <SlotGridSkeleton />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {TIME_SLOTS.map((slot) => {
            const status = getSlotStatus(slot.start, bookings);
            const count = bookings.find((b) => b.slotStart === slot.start)?.count || 0;
            const remaining = MAX_PER_SLOT - count;
            const isSelected = selectedSlot === slot.start;
            const disabled = status === 'full' || status === 'past';
            return (
              <div key={slot.start} className={`slot-card ${isSelected ? 'slot-selected' : ''} slot-${status}`}
                onClick={() => { if (!disabled) setSelectedSlot(isSelected ? null : slot.start); }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: status === 'past' ? '#94A3B8' : '#1E293B' }}>{slot.label.split(' ')[0]}</span>
                  <span className="badge" style={{ background: statusColors[status] + '20', color: statusColors[status], padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>{statusLabels[status]}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.5rem' }}>{slot.label}</div>
                {status !== 'past' && (
                  <>
                    <div style={{ display: 'flex', gap: 4, marginBottom: '0.4rem' }}>
                      {[...Array(MAX_PER_SLOT)].map((_, i) => (
                        <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < count ? statusColors[status] : '#E2E8F0', transition: 'background 0.2s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: statusColors[status], fontWeight: 600 }}>
                      {status === 'full' ? 'No slots remaining' : `${remaining} slot${remaining !== 1 ? 's' : ''} remaining`}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{count}/{MAX_PER_SLOT} booked</div>
                  </>
                )}
                {status === 'past' && <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Slot passed</div>}
                {isSelected && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563EB', fontSize: '0.72rem', fontWeight: 600 }}>
                    <CheckCircle size={12} /> Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }} disabled={!selectedSlot || !doc} onClick={() => setConfirmOpen(true)}>
          {selectedSlot ? `Confirm Booking — ${selectedSlotData?.label.split(' ')[0]}` : 'Select a Time Slot'}
        </button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Appointment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '1rem' }}>
            {[{ label: 'Doctor', value: doc?.name }, { label: 'Department', value: doc?.department || doc?.speciality || 'General' },
              { label: 'Patient', value: user?.name || '—' }, { label: 'Date', value: today },
              { label: 'Time', value: selectedSlotData?.label || '—' }, { label: 'Fee', value: `$${doc?.fee || 50}` }].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748B' }}>{label}</span>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setConfirmOpen(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleBook}>
              <CheckCircle size={16} /> Confirm Booking
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}