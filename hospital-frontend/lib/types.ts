// TypeScript types for Hospital Appointment Booking System

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  avatar?: string;
  role: 'patient' | 'admin';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  qualification: string;
  experience: number;
  rating: number;
  reviews: number;
  patients: number;
  fee: number;
  available: boolean;
  image: string;
  hospital: string;
  bio: string;
  gender: string;
  languages: string[];
  awards: string[];
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  description: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  slotLabel: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  fee?: number;
  doctorImage?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  label: string;
  booked: number;
  capacity: number;
  userBooked?: boolean;
}

export interface Notification {
  id: string;
  type: 'confirmed' | 'reminder' | 'cancelled' | 'update';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  doctor: string;
  type: 'prescription' | 'lab' | 'report' | 'scan';
  fileUrl?: string;
  notes?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  error?: {
    status: number;
    name: string;
    message: string;
  };
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface FAQ {
  q: string;
  a: string;
}
