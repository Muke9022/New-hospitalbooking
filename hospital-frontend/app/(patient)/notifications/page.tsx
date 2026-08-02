'use client';
import { useEffect, useState } from "react";
import { Bell, CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  confirmed: { icon: CheckCircle, color: '#10B981', bg: '#DCFCE7' },
  completed: { icon: CheckCircle, color: '#10B981', bg: '#DCFCE7' },
  reminder: { icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
  cancelled: { icon: AlertCircle, color: '#EF4444', bg: '#FEE2E2' },
  update: { icon: Info, color: '#2563EB', bg: '#EFF6FF' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        // 1. Load Notifications from DB
        const res = await api.notifications.list(user.id);
        let fetchedNotifications = res.data || [];
        console.log("Fetched Notifications:", fetchedNotifications);

        // 2. Load Appointments to check Admin-cancelled ones
        const apptRes = await api.appointments.list(user.email);
        const userAppointments = apptRes?.data?.filter(
          (item: any) => item.patientEmail === user.email
        ) || [];

        // Filter out appointments cancelled by Admin
        const cancelledAppointments = userAppointments.filter((item: any) => {
          const status = item.appointmentStatus || item.status;
          return status === "cancelled";
        });

        // 3. Convert Admin-cancelled appointments to Notification format
        const cancelledNotifications = cancelledAppointments.map((item: any) => ({
          documentId: `cancelled-${item.documentId || item.id}`,
          id: `cancelled-${item.id}`,
          title: "Appointment Cancelled",
          message: `Your appointment with ${item.doctorName} on ${item.date} (${item.slotLabel || item.slotStart}) was cancelled.`,
          type: "cancelled",
          read: true,
          activityDate: item.date,
          activityTime: item.slotLabel || item.slotStart,
        }));

        // 4. Merge DB Notifications and Admin Cancelled Notifications (Avoid Duplicates)
        const allNotifications = [...fetchedNotifications];

        cancelledNotifications.forEach((cNotif: any) => {
          const exists = allNotifications.some(
            (n) => n.message?.includes(cNotif.activityDate) && n.type === "cancelled"
          );
          if (!exists) {
            allNotifications.unshift(cNotif);
          }
        });

        setNotifications(allNotifications);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    load();
  }, [user]);

  const markRead = async (targetId: string) => {
    if (!targetId || targetId.startsWith("cancelled-")) return;

    try {
      await api.notifications.markRead(targetId);

      setNotifications((prev) =>
        prev.map((n) =>
          (n.documentId === targetId || String(n.id) === String(targetId))
            ? { ...n, read: true }
            : n
        )
      );
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }} className="page-enter">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>Notifications</h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
          {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Bell size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600, color: '#94A3B8' }}>No notifications yet</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.update;
            const Icon = cfg.icon;
            const notificationId = n.documentId || String(n.id);

            return (
              <div
                key={notificationId}
                onClick={() => markRead(notificationId)}
                style={{
                  background: n.read ? 'white' : '#F0F9FF',
                  borderRadius: 16,
                  padding: '1.25rem',
                  border: `1px solid ${n.read ? '#E2E8F0' : '#BAE6FD'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ width: 44, height: 44, background: cfg.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '0.5rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', margin: 0 }}>{n.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />}
                      {(n.activityDate || n.activityTime) && (
                        <div style={{ fontSize: 12, color: "#94A3B8" }}>
                          📅 {n.activityDate || 'Today'} • 🕒 {n.activityTime || 'Just now'}
                        </div>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}