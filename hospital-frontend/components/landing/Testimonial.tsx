'use client';
import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface TestimonialProps {
  testimonials: any[];
}

export default function TestimonialsSection({ testimonials }: TestimonialProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 3-second Auto Slide Right to Left
  useEffect(() => {
    if (testimonials.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section style={{ padding: '4rem 2rem', background: '#EFF6FF' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Testimonials
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B', margin: '0.5rem 0 0', letterSpacing: '-0.02em' }}>
            What Patients Say
          </h2>
        </div>

        {testimonials.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.95rem' }}>
            No testimonials available at the moment.
          </p>
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Left Button */}
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: '-2.5rem',
                zIndex: 10,
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '50%',
                width: 42,
                height: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <ChevronLeft size={20} color="#1E293B" />
            </button>

            {/* Slider Track */}
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: 'transform 0.5s ease-in-out',
                }}
              >
                {testimonials.map((t: any) => {
                  const item = t.attributes || t;
                  const avatarData = item.avatar?.data?.attributes || item.avatar;
                  const rawAvatarUrl = typeof avatarData === 'string' ? avatarData : avatarData?.url;

                  const avatarUrl = rawAvatarUrl
                    ? (rawAvatarUrl.startsWith('http') ? rawAvatarUrl : `http://localhost:1337${rawAvatarUrl}`)
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';

                  return (
                    <div
                      key={t.documentId || t.id}
                      style={{
                        minWidth: '100%',
                        boxSizing: 'border-box',
                        padding: '0 0.5rem',
                      }}
                    >
                      <div
                        style={{
                          background: 'white',
                          borderRadius: 16,
                          padding: '2rem',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 16px rgba(37,99,235,0.08)',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                          {[...Array(Number(item.rating) || 5)].map((_, j) => (
                            <Star key={j} size={20} color="#F59E0B" fill="#F59E0B" />
                          ))}
                        </div>
                        <p style={{ color: '#374151', fontSize: '1.05rem', lineHeight: 1.8, margin: '0 0 1.5rem' }}>
                          "{item.text || item.description || ''}"
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                          <img
                            src={avatarUrl}
                            alt={item.name || 'User'}
                            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div style={{ textAlign: 'left' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B', margin: 0 }}>
                              {item.name}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
                              {item.role || 'Patient'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Button */}
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '-2.5rem',
                zIndex: 10,
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '50%',
                width: 42,
                height: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <ChevronRight size={20} color="#1E293B" />
            </button>
          </div>
        )}

        {/* Dots Indicator */}
        {testimonials.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            {testimonials.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: currentIndex === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentIndex === idx ? '#2563EB' : '#CBD5E1',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}