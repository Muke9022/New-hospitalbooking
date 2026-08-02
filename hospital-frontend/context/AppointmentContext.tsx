'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { Appointment, Notification } from '@/lib/types';

interface AppointmentContextType {
  appointments: Appointment[];
  notifications: Notification[];
  loading: boolean;
  lastBooking: Appointment | null;
  selectedDoctor: string | null;
  selectedAppointment: Appointment | null;

  loadAppointments: () => Promise<void>;

  bookAppointment: (appointment: Appointment) => void;

  cancelAppointment: (id: string) => Promise<void>;

  completeAppointment: (id: string) => Promise<void>;

  selectDoctor: (id: string) => void;

  getSlotBookings: (
    doctorId: string
  ) => Array<{
    slotStart: string;
    count: number;
    userBooked: boolean;
  }>;

  setSelectedAppointment: (appt: Appointment | null) => void;

  markNotificationRead: (id: string) => void;
}

const AppointmentContext =
  createContext<AppointmentContextType | null>(null);

export function AppointmentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(false);

  const [lastBooking, setLastBooking] =
    useState<Appointment | null>(null);

  const [selectedDoctor, setSelectedDoctor] =
    useState<string | null>(null);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  //-------------------------------------------------
  // Load Appointments from Strapi
  //-------------------------------------------------

  const loadAppointments = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);

      const res = await api.appointments.list(user?.email);

      const rows =
        res?.data
          ?.filter((item: any) => item.patientEmail === user.email)
          ?.map((item: any) => ({
            id: String(item.id),
            documentId: item.documentId,
            doctorId: item.doctorId,
            doctorName: item.doctorName,
            department: item.department,
            date: item.date,
            slotStart: item.slotStart,
            slotEnd: item.slotEnd,
            slotLabel: item.slotLabel,
            status: item.appointmentStatus,
            fee: item.fee,
            doctorImage: item.doctorImage,
          })) || [];

      console.log("API Response:", res.data);
      console.log("Mapped Appointments:", rows);

      setAppointments(rows);
    } catch (err) {
      console.error('Load appointments failed', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  //-------------------------------------------------
  // Booking
  //-------------------------------------------------

  const bookAppointment = useCallback((appointment: Appointment) => {
    setAppointments((prev) => [appointment, ...prev]);

    setLastBooking(appointment);

    setSelectedAppointment(appointment);

    const notification: Notification = {
      id: Date.now().toString(),
      type: 'confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment with ${appointment.doctorName} is confirmed.`,
      time: 'Just now',
      read: false,
    };

    setNotifications((prev) => [notification, ...prev]);
  }, []);

  //-------------------------------------------------
  // Cancel Appointment
  //-------------------------------------------------

  const cancelAppointment = useCallback(
    async (id: string) => {
      try {
        await api.appointments.cancel(id);

        const appointment = appointments.find((a) => a.id === id || a.documentId === id);

        if (appointment && user) {
          await api.notifications.create({
            title: "Appointment Cancelled",
            message: `Your appointment with ${appointment.doctorName} has been cancelled.`,
            type: "cancelled",
            read: false,
            activityDate: appointment.date,
            activityTime: appointment.slotLabel,
            user: user.id,
            appointment: appointment.documentId,
          });
        }

        await loadAppointments();
      } catch (err) {
        console.error(err);
      }
    },
    [appointments, user, loadAppointments]
  );

  //-------------------------------------------------
  // STEP 3 - Complete Appointment & Notification
  //-------------------------------------------------

  const completeAppointment = useCallback(
    async (id: string) => {
      try {
        const appointment = appointments.find((a) => a.id === id || a.documentId === id);

        // API Status Update Call
        if (api.appointments.update) {
          await api.appointments.update(id, {
            appointmentStatus: "completed",
          });
        }

        if (appointment && user) {
          await api.notifications.create({
            title: "Appointment Completed",
            message: `Your appointment with ${appointment.doctorName} has been completed.`,
            type: "completed",
            read: false,
            activityDate: appointment.date,
            activityTime: appointment.slotLabel,
            user: user.id,
            appointment: appointment.documentId,
          });
        }

        await loadAppointments();
      } catch (err) {
        console.error("Error completing appointment:", err);
      }
    },
    [appointments, user, loadAppointments]
  );

  //-------------------------------------------------

  // Step 2: Simplified getSlotBookings callback
  const getSlotBookings = useCallback(() => {
    return [];
  }, []);

  const selectDoctor = useCallback((id: string) => {
    setSelectedDoctor(id);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  }, []);

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        notifications,
        loading,
        lastBooking,
        selectedDoctor,
        selectedAppointment,
        loadAppointments,
        getSlotBookings,
        bookAppointment,
        cancelAppointment,
        completeAppointment,
        selectDoctor,
        setSelectedAppointment,
        markNotificationRead,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentContext);

  if (!ctx) {
    throw new Error(
      'useAppointments must be used inside AppointmentProvider'
    );
  }

  return ctx;
}