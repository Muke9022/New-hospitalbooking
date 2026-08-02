'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, ChevronLeft, Calendar, Users, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { api } from '@/lib/api';

// 🌟 Robust Helper to resolve Strapi Image URLs safely
function getImageUrl(imageField: any): string {
  if (!imageField) {
    return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500";
  }

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

  if (!url) {
    return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500";
  }

  return url.startsWith("http") ? url : `http://localhost:1337${url}`;
}

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { selectDoctor } = useAppointments();

  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (params?.id) {
          const res = await api.doctors.get(String(params.id));
          setDoc(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch doctor profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params?.id]);

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>
        <p style={{ fontWeight: 600 }}>Loading doctor profile...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>Doctor Not Found</h2>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>The requested doctor profile does not exist.</p>
        <button className="btn-primary" onClick={() => router.push('/doctors')}>
          Back to Doctors
        </button>
      </div>
    );
  }

  const handleBook = () => {
    selectDoctor(doc.documentId || doc.id);
    user ? router.push('/booking') : router.push('/login');
  };

  // 🌟 Safe extraction of department name
  const departmentName = typeof doc.department === 'object'
    ? (doc.department?.name || doc.department?.attributes?.name || '')
    : (doc.department || '');

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }} className="page-enter">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/doctors')} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}
      >
        <ChevronLeft size={16} /> Back to Doctors
      </button>

      {/* Profile Header Card */}
      <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}>
        <div style={{ height: 180, background: 'linear-gradient(135deg, #1e3a8a, #2563EB)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '1.5rem' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
        </div>

        <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative' }}>
          {/* Doctor Image with Focus on Top Center */}
          <img
            src={getImageUrl(doc.image)}
            alt={doc.name}
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              objectFit: "cover",
              objectPosition: "top center",
              border: "4px solid white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              marginTop: "-55px",
              display: "block",
              background: '#E0F2FE'
            }}
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500";
            }}
          />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>{doc.name}</h1>
              <p style={{ fontSize: '0.95rem', color: '#2563EB', fontWeight: 600, margin: '0 0 0.25rem' }}>
                {doc.speciality} {departmentName ? `· ${departmentName}` : ''}
              </p>
              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0 0 0.5rem' }}>{doc.qualification || 'MBBS, MD'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="#64748B" />
                <span style={{ fontSize: '0.825rem', color: '#64748B' }}>{doc.hospital || 'MediBook General Hospital'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
              <span className={`badge ${doc.available ? 'badge-available' : 'badge-cancelled'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.875rem' }}>
                {doc.available ? '✓ Available Today' : '✗ Unavailable'}
              </span>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#10B981' }}>
                ${doc.fee}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}> / visit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Left Column: Stats & Bio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { icon: Star, label: 'Rating', value: `${doc.rating || 4.9}/5`, color: '#F59E0B', bg: '#FFFBEB' },
              { icon: Users, label: 'Patients', value: `${doc.patients?.toLocaleString() || '1,200'}+`, color: '#2563EB', bg: '#EFF6FF' },
              { icon: Clock, label: 'Experience', value: `${doc.experience || 5} Yrs`, color: '#10B981', bg: '#DCFCE7' }
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} style={{ background: 'white', borderRadius: 14, padding: '1rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                  <Icon size={18} color={color} fill={label === 'Rating' ? color : 'none'} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Biography Section */}
          <div style={{ background: 'white', borderRadius: 16, padding: '1.25rem', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B', margin: '0 0 0.75rem' }}>
              About Dr. {doc.name ? doc.name.replace(/^Dr\.\s*/i, '') : ''}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
              {doc.bio || `${doc.name} is a highly experienced specialist dedicated to providing exceptional medical care and treatment to patients.`}
            </p>
          </div>
        </div>

        {/* Right Column: Booking Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563EB)', borderRadius: 16, padding: '1.5rem', color: 'white', textAlign: 'center' }}>
            <Calendar size={32} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.9 }} />
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 0.5rem' }}>Book an Appointment</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '0 0 1rem' }}>Same-day slots available from 9 AM - 6 PM</p>
            <button
              style={{
                background: 'white',
                color: '#2563EB',
                border: 'none',
                borderRadius: 10,
                padding: '0.875rem 2rem',
                fontWeight: 700,
                cursor: doc.available ? 'pointer' : 'not-allowed',
                width: '100%',
                opacity: doc.available ? 1 : 0.6,
                transition: 'opacity 0.2s',
                fontSize: '0.9rem'
              }}
              disabled={!doc.available}
              onClick={handleBook}
            >
              {doc.available ? 'Book Now →' : 'Not Available'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}