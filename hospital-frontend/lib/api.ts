// API client for Strapi backend
const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337/api';

async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;

  if (typeof window !== "undefined") {
   const rawToken =
  localStorage.getItem("medibook_token") ||
  localStorage.getItem("token");
    if (
      rawToken &&
      rawToken !== "undefined" &&
      rawToken !== "null"
    ) {
      token = rawToken;
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // ===== DEBUG =====
  console.log("==================================");
  console.log("API URL :", `${API_URL}${path}`);
  console.log("TOKEN :", token);
  console.log("HEADERS :", headers);
  console.log("BODY :", options.body);
  console.log("==================================");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  console.log("STATUS :", res.status);
  console.log("RESPONSE :", data);

  if (!res.ok) {
    console.error("API ERROR :", data);
    throw new Error(JSON.stringify(data));
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (identifier: string, password: string) =>
      fetchAPI<{ jwt: string; user: any }>('/auth/local', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }),

    // Custom OTP/Registration Route
    register: (data: {
      name: string;
      email: string;
      phone: string;
      dob: string;
      gender: string;
      password: string;
    }) =>
      fetchAPI<{ success: boolean; jwt?: string; user: any }>('/otp/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    sendOtp: (email: string) =>
      fetchAPI<{ success: boolean; message: string }>('/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    verifyOtp: (email: string, otp: string) =>
      fetchAPI<{ success: boolean; message: string }>('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }),

    me: () => fetchAPI<any>('/users/me?populate=*'),
  },

  // Doctors
  doctors: {
    list: (params?: string) =>
      fetchAPI<any>(
        `/doctors?populate=*${params ? '&' + params : ''}`
      ),
    get: (id: string) => fetchAPI<any>(`/doctors/${id}?populate=*`),
    create: (data: any) => fetchAPI<any>('/doctors', { method: 'POST', body: JSON.stringify({ data }) }),
    update: (id: string, data: any) => fetchAPI<any>(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),
    delete: (id: string) => fetchAPI<any>(`/doctors/${id}`, { method: 'DELETE' }),
  },

  // Users
  users: {
    me: () => fetchAPI<any>("/users/me"),

    update: (id: string | number, data: any) =>
      fetchAPI<any>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Departments
  departments: {
    list: () => fetchAPI<any>('/departments?populate=*'),
  },

  // Appointments
  appointments: {
    list: (email?: string) =>
      fetchAPI<any>(
        `/appointments?populate=*${email ? `&filters[patientEmail][$eq]=${email}` : ''}&sort=createdAt:desc`
      ),
    get: (id: string) => fetchAPI<any>(`/appointments/${id}?populate=*`),
    create: (data: any) => fetchAPI<any>('/appointments', { method: 'POST', body: JSON.stringify({ data }) }),
    update: (id: string, data: any) => fetchAPI<any>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),
    cancel: (id: string) => fetchAPI<any>(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify({ data: { appointmentStatus: 'cancelled' } }) }),
    all: () => fetchAPI<any>('/appointments?populate=*&sort=createdAt:desc'),

    byDoctorAndDate: (doctorId: string, date: string) =>
      fetchAPI<any>(
        `/appointments?filters[doctorId][$eq]=${doctorId}&filters[date][$eq]=${date}&sort=createdAt:desc`
      ),
  },

  // Time Slots
  slots: {
    listByDoctor: (doctorId: string, date: string) =>
      fetchAPI<any>(`/time-slots?filters[doctor][id][$eq]=${doctorId}&filters[date][$eq]=${date}&populate=*`),
    update: (id: string, data: any) =>
      fetchAPI<any>(`/time-slots/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),
  },

  // Notifications
  notifications: {
    list: (userId?: string) => fetchAPI<any>(`/notifications?populate=*${userId ? `&filters[user][id][$eq]=${userId}` : ''}&sort=createdAt:desc`),
    markRead: (id: string) => fetchAPI<any>(`/notifications/${id}`, { method: 'PUT', body: JSON.stringify({ data: { read: true } }) }),
    create: (data: any) => fetchAPI<any>('/notifications', { method: 'POST', body: JSON.stringify({ data }) }),
  },

  // Medical Records
  medicalRecords: {
    list: (userId?: string) => fetchAPI<any>(`/medical-records?populate=*${userId ? `&filters[patient][id][$eq]=${userId}` : ''}`),
  },

  // Testimonials
  testimonials: {
    list: () => fetchAPI<any>('/testimonials?populate=*'),
  },

  // Admin Stats
  admin: {
    stats: () => fetchAPI<any>('/admin-stats'),
    patients: () => fetchAPI<any>('/users?filters[role][name][$eq]=Patient&populate=*'),
  },
};