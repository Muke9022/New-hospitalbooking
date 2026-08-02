'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone, Star, ChevronDown, ArrowRight, ChevronLeft, ChevronRight,
  Heart, Brain, Baby, Bone, Activity, Eye, Stethoscope,
  CheckCircle, PlayCircle, Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FAQS } from '@/lib/mockData';
import { api } from '@/lib/api';

import Navbar from '@/components/landing/Navbar'; // 👈 Navbar Import केलाय
import TestimonialsSection from '@/components/landing/Testimonial';
import StatsSection from '@/components/landing/StatsSection';
import DepartmentsSection from '@/components/landing/DepartmentsSection';

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

// Icons Mapping Table
const depIcons: Record<string, any> = {
  Heart, Brain, Baby, Bone, Activity, Eye, Stethoscope,
  heart: Heart, brain: Brain, baby: Baby, bone: Bone,
  activity: Activity, eye: Eye, stethoscope: Stethoscope
};

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // 🌟 Ref for Smooth Horizontal Slider
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const doctorRes = await api.doctors.list();
        const deptRes = await api.departments.list();
        const testimonialRes = await api.testimonials.list();

        setDoctors(doctorRes.data || []);
        setDepartments(deptRes.data || []);
        setTestimonials(testimonialRes.data || []);
      } catch (err) {
        console.error("Error loading data from Strapi:", err);
      }
    };

    loadData();
  }, []);

  // 🌟 Left & Right Navigation Handlers
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75; // Scrolls 75% of view area

      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFC' }}>
      
      {/* 🌟 Navbar Rendering */}
      <Navbar />

      {/* Hero Section (Padding वाढवून 7.5rem केलीये जेणेकरून Navbar Hero Section वर ओव्हरलॅप होणार नाही) */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 55%, #0ea5e9 100%)', padding: '7.5rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center', position: 'relative' }}>
          
          <div className="animate-fade-in">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <CheckCircle size={14} /> Trusted by 10,000+ Patients
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 1.25rem' }}>
              Your Health, <br />
              <span style={{ color: '#6ee7f7' }}>Booked Instantly</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
              Book same-day appointments with top specialists. Real-time slot availability, instant confirmation, and zero wait times.
            </p>
            
            {/* Search Bar Container */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input 
                  type="text" 
                  placeholder="Search doctors, departments..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push(`/doctors?search=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 12, border: 'none', fontSize: '0.9rem', outline: 'none' }} 
                />
              </div>
              <button className="btn-secondary" style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }} onClick={() => router.push('/doctors')}>
                Find Doctor <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ background: 'white', color: '#2563EB', padding: '0.75rem 1.5rem' }} onClick={() => user ? router.push('/booking') : router.push('/login')}>
                Book Appointment
              </button>
              <button style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: 10, padding: '0.75rem 1.25rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }} onClick={() => router.push('/about')}>
                <PlayCircle size={18} /> How it Works
              </button>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239,68,68,0.15)', borderRadius: 12, padding: '0.75rem 1rem', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Phone size={18} color="#fca5a5" />
              <div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', margin: 0 }}>24/7 Emergency Helpline</p>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>+1 (555) 911-MEDI</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
              <img src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=500&fit=crop&auto=format" alt="Doctors at MediBook Hospital"
                style={{ width: '100%', borderRadius: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', display: 'block' }} />
              <div className="glass" style={{ position: 'absolute', bottom: '-1rem', left: '-1.5rem', padding: '1rem 1.25rem', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, background: '#DCFCE7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} color="#16a34a" /></div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', margin: 0 }}>Slot Booked!</p>
                    <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0 }}>09:00 AM · Dr. Sarah Mitchell</p>
                  </div>
                </div>
              </div>
              <div className="glass" style={{ position: 'absolute', top: '1rem', right: '-1rem', padding: '0.75rem 1rem', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>4.9</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Rating</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Counter Stats Section */}
      <StatsSection />

      {/* Departments Section */}
      <DepartmentsSection departments={departments} depIcons={depIcons} />

      {/* 🌟 Top Specialists Preview (WITH SLIDER & NAV BUTTONS) */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Header & Controls Container */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Our Team</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', margin: '0.5rem 0 0', letterSpacing: '-0.02em' }}>Top Specialists</h2>
            </div>
            
            {/* 🌟 Left, Right & View All Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => handleScroll('left')} 
                aria-label="Previous Doctors"
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  border: '1px solid #E2E8F0', 
                  background: '#F8FAFC', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#1E293B'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#2563EB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#1E293B'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <ChevronLeft size={20} />
              </button>

              <button 
                onClick={() => handleScroll('right')} 
                aria-label="Next Doctors"
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  border: '1px solid #E2E8F0', 
                  background: '#F8FAFC', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#1E293B'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#2563EB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#1E293B'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
              >
                <ChevronRight size={20} />
              </button>

              <button className="btn-outline" style={{ marginLeft: '0.5rem' }} onClick={() => router.push('/doctors')}>
                View All <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* 🌟 Horizontally Scrollable Cards Track */}
          <div 
            ref={scrollContainerRef}
            style={{ 
              display: 'flex', 
              gap: '1.25rem', 
              overflowX: 'auto', 
              scrollSnapType: 'x mandatory', 
              paddingBottom: '1rem',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none' // IE/Edge
            }}
            className="no-scrollbar"
          >
            {doctors.map((doc) => (
              <div 
                key={doc.documentId || doc.id} 
                className="card-hover" 
                onClick={() => router.push(`/doctors/${doc.documentId || doc.id}`)}
                style={{ 
                  flex: '0 0 280px', 
                  scrollSnapAlign: 'start',
                  background: '#F8FAFC', 
                  borderRadius: 16, 
                  overflow: 'hidden', 
                  cursor: 'pointer', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)' 
                }}
              >
                {/* Image Box */}
                <div style={{ height: 220, overflow: 'hidden', background: '#dbeafe', position: 'relative' }}>
                  <img 
                    src={getImageUrl(doc.image)} 
                    alt={doc.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} 
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500";
                    }}
                  />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                    <span className={`badge ${doc.available ? 'badge-available' : 'badge-cancelled'}`}>
                      {doc.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {/* Details Box */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B', margin: 0 }}>{doc.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, margin: '0.2rem 0 0' }}>{doc.speciality}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#64748B', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span>🏥 {doc.experience} yrs</span>
                    <span>⭐ {doc.rating}</span>
                    <span style={{ fontWeight: 700, color: '#10B981' }}>${doc.fee}</span>
                  </div>

                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: '10px' }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      user ? router.push('/booking') : router.push('/login'); 
                    }}
                    disabled={!doc.available}>
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* FAQ Section */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', margin: '0.5rem 0 0', letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
          </div>
          {FAQS.slice(0, 4).map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{ width: '100%', textAlign: 'left', padding: '1.25rem 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1E293B' }}>{faq.q}</span>
                <ChevronDown size={18} color="#64748B" style={{ transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>
              {faqOpen === i && (<div style={{ padding: '0 0 1.25rem', color: '#64748B', fontSize: '0.9rem', lineHeight: 1.7 }}>{faq.a}</div>)}
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-outline" onClick={() => router.push('/faq')}>View All FAQs <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Ready to Book Your Appointment?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1rem' }}>Join thousands of patients who trust MediBook for their healthcare needs.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ background: 'white', color: '#2563EB', padding: '0.875rem 2rem' }} onClick={() => user ? router.push('/booking') : router.push('/register')}>Get Started Free</button>
            <button style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)', padding: '0.875rem 2rem', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => router.push('/doctors')}>Browse Doctors</button>
          </div>
        </div>
      </section>

    </div>
  );
}