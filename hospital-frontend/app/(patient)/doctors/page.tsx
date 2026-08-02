'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { api } from '@/lib/api';

// Skeleton Component for Doctor Card Loading
function DoctorCardSkeleton() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
      }}
    >
      <div
        style={{
          height: 260,
          background: "#E5E7EB",
          animation: "pulse 1.5s infinite",
        }}
      />

      <div style={{ padding: 20 }}>
        <div className="skeleton-line" style={{ width: "60%", height: 20 }} />
        <div className="skeleton-line" style={{ width: "40%", height: 15, marginTop: 12 }} />
        <div className="skeleton-line" style={{ width: "70%", height: 15, marginTop: 12 }} />

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 25,
          }}
        >
          <div className="skeleton-line" style={{ flex: 1, height: 42 }} />
          <div className="skeleton-line" style={{ flex: 1, height: 42 }} />
        </div>
      </div>
    </div>
  );
}

// Helper function to resolve Strapi image URLs safely
function getImageUrl(image: any): string {
  if (!image) {
    return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500";
  }

  let url = "";

  if (typeof image === "string") {
    url = image;
  } else if (Array.isArray(image) && image.length > 0) {
    url = image[0]?.url || image[0]?.attributes?.url || "";
  } else if (image?.data?.attributes?.url) {
    url = image.data.attributes.url;
  } else if (image?.data?.url) {
    url = image.data.url;
  } else if (image?.url) {
    url = image.url;
  }

  if (!url) {
    return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500";
  }

  return url.startsWith("http") ? url : `http://localhost:1337${url}`;
}

export default function DoctorsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectDoctor } = useAppointments();
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [filterAvail, setFilterAvail] = useState(false);

  // 🌟 State to control initial display count (Default: 6)
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorRes = await api.doctors.list();
        const deptRes = await api.departments.list();

        setDoctors(doctorRes.data || []);
        setDepartments(deptRes.data || []);
      } catch (err) {
        console.error('Failed to fetch doctors data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🌟 Reset visible count back to 6 whenever filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [search, filterDept, filterGender, filterAvail]);

  // Fixed Robust Filtering Logic
  const filtered = doctors.filter((d) => {
    const q = search.trim().toLowerCase();
    const docDeptName = typeof d.department === 'object' ? (d.department?.name || '') : (d.department || '');
    
    const matchSearch =
      !q ||
      d.name?.toLowerCase().includes(q) ||
      d.speciality?.toLowerCase().includes(q) ||
      docDeptName.toLowerCase().includes(q);

    const matchDept =
      filterDept === 'All' ||
      docDeptName.toLowerCase() === filterDept.toLowerCase();

    const matchGender =
      filterGender === 'All' ||
      d.gender?.toLowerCase() === filterGender.toLowerCase();

    const isAvailable = Boolean(d.available);
    const matchAvail = !filterAvail || isAvailable;

    return matchSearch && matchDept && matchGender && matchAvail;
  });

  // 🌟 Load 6 more doctors on button click
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }} className="page-enter">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>Find a Doctor</h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
          Choose from {doctors.length} specialists across {departments.length} departments
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {/* Search Bar */}
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input type="text" className="input-field" placeholder="Search doctors, specialties..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>

        {/* Department Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <select className="input-field" value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ paddingRight: '2rem', minWidth: 160 }}>
            <option value="All">All Departments</option>
            {departments.map((d: any) => {
              const deptName = typeof d === 'string' ? d : (d.name || d.attributes?.name || '');
              return (
                <option key={d.id || d.documentId || deptName} value={deptName}>
                  {deptName}
                </option>
              );
            })}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
        </div>

        {/* Gender Filter Dropdown */}
        <div style={{ position: 'relative' }}>
          <select className="input-field" value={filterGender} onChange={(e) => setFilterGender(e.target.value)} style={{ paddingRight: '2rem', minWidth: 120 }}>
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
        </div>

        {/* Availability Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, color: '#374151', padding: '0 0.5rem' }}>
          <input type="checkbox" checked={filterAvail} onChange={(e) => setFilterAvail(e.target.checked)} style={{ accentColor: '#2563EB', width: 16, height: 16 }} />
          Available Today
        </label>
      </div>

      <p style={{ fontSize: '0.825rem', color: '#64748B', marginBottom: '1rem' }}>
        Showing {loading ? 0 : Math.min(visibleCount, filtered.length)} of {filtered.length} doctor{filtered.length !== 1 ? 's' : ''}
      </p>

      {loading ? (
        /* 🌟 Render 6 Skeletons Grid when Loading */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* 🌟 Display Doctors Sliced to visibleCount */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filtered.slice(0, visibleCount).map((doc) => (
              <div
                key={doc.id || doc.documentId}
                className="card-hover"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                }}
              >
                <div style={{ height: 260, overflow: 'hidden', background: '#e0f2fe', position: 'relative' }}>
                  <img
                    src={getImageUrl(doc.image)}
                    alt={doc.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top center",
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500";
                    }}
                  />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    <span
                      className={`badge ${doc.available ? 'badge-available' : 'badge-cancelled'}`}
                      style={{
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                      }}
                    >
                      {doc.available ? 'Available Today' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B', margin: '0 0 0.25rem' }}>{doc.name}</h3>
                  <p style={{ fontSize: '0.825rem', color: '#2563EB', fontWeight: 600, margin: '0 0 0.25rem' }}>{doc.speciality}</p>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.875rem' }}>{doc.qualification}</p>
                  <div style={{ display: 'flex', gap: '0.875rem', fontSize: '0.78rem', color: '#64748B', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span>🏥 {doc.experience} yrs exp</span>
                    <span>👥 {doc.patients?.toLocaleString() || 0}+ patients</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} color="#F59E0B" fill={i < Math.floor(doc.rating || 0) ? '#F59E0B' : 'none'} />
                      ))}
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginLeft: '0.25rem' }}>{doc.rating}</span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>({doc.reviews})</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#10B981', fontSize: '0.95rem' }}>${doc.fee}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '10px' }}
                      onClick={() => {
                        selectDoctor(doc.documentId);
                        router.push(`/doctors/${doc.documentId}`);
                      }}>View Profile</button>
                    <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.5rem', fontSize: '0.8rem', borderRadius: '10px' }}
                      disabled={!doc.available}
                      onClick={() => {
                        selectDoctor(doc.documentId);
                        user ? router.push("/booking") : router.push("/login");
                      }}>
                      {doc.available ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🌟 VIEW MORE BUTTON */}
          {visibleCount < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem', marginBottom: '1.5rem' }}>
              <button
                className="btn-primary"
                onClick={handleLoadMore}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '0.9rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  cursor: 'pointer'
                }}
              >
                View More Doctors ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Search size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600, color: '#94A3B8' }}>No doctors found</h3>
          <p style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}