'use client';
import Link from "next/link";
import { Stethoscope, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: "Services",
      links: [
        { name: "Find Doctors", href: "/doctors" },
        { name: "Book Appointment", href: "/booking" },
        { name: "My Appointments", href: "/appointments" },
        { name: "Medical Records", href: "/medical-records" },
      ],
    },
    {
      title: "Hospital",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Departments", href: "/departments" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms of Service", href: "/terms-of-service" },
        { name: "Cookie Policy", href: "/cookie-policy" },
      ],
    },
  ];

  return (
    <footer 
      style={{ 
        position: 'relative',        // 🌟 बॅकग्राऊंड इमेजच्या वर आणण्यासाठी
        zIndex: 30,                   // 🌟 बॅकग्राऊंड इमेजच्या वर आणण्यासाठी
        backgroundColor: '#0B1329',   // 🌟 १-टक्केसुद्धा ट्रांसपरंट न राहता Solid Dark लूक
        color: 'rgba(255,255,255,0.6)', 
        padding: '3.5rem 2rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #2563EB, #10B981)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stethoscope size={16} color="white" />
              </div>
              <span style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>MediBook</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
              Your trusted healthcare partner for same-day appointments.
            </p>
          </div>

          {/* Navigation Links */}
          {footerSections.map((col) => (
            <div key={col.title}>
              <h4 style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>
                {col.title}
              </h4>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    marginBottom: "0.5rem",
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
                  }
                >
                  {link.name}
                </Link>
              ))}
            </div>
          ))}

          {/* Contact Details */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} /> 456 Medical Drive, NY 10001
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Phone size={14} /> +1 (555) 911-MEDI
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Mail size={14} /> hello@medibook.com
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.78rem',
          }}
        >
          <span>© {new Date().getFullYear()} MediBook. All rights reserved.</span>
          <span>Made with ❤️ for better healthcare</span>
        </div>
      </div>
    </footer>
  );
}