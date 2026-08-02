import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AppointmentProvider } from '@/context/AppointmentContext';
import Footer from '@/components/landing/Footer'; // 👈 1. Footer Import केला

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MediBook – Hospital Appointment Booking System',
  description: 'Book same-day appointments with top specialists. Real-time slot availability, instant confirmation, and zero wait times.',
  keywords: 'hospital, appointment, booking, doctor, medical, healthcare',
  openGraph: {
    title: 'MediBook – Book Doctor Appointments Instantly',
    description: 'Trusted by 10,000+ patients. 50+ doctors. Same-day appointments.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter bg-[#F8FAFC] text-[#1E293B] antialiased">
        <AuthProvider>
          <AppointmentProvider>
            {/* Main Pages Content */}
            {children}

            
            <Footer />
          </AppointmentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}