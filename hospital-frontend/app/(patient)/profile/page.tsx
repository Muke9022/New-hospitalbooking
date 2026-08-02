'use client';
import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Save
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || 'male',
  });

  // Fetch profile details from Strapi API
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const res = await api.users.me();

        setForm({
          name: res.name || "",
          phone: res.phone || "",
          dob: res.dob || "",
          gender: res.gender || "male",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Step 1 & Step 2: Explicit Strapi Payload & Reload Page After Save
  const handleSave = async () => {
    try {
      await api.users.update(user!.id, {
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
      });

      setEditing(false);
      alert("Profile Updated Successfully");
      
      // Avatar आणि युझर स्टेट रिफ्रेश होण्यासाठी
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Update Failed");
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        Loading profile...
      </div>
    );
  }

  const fields = [
    { icon: User, label: 'Full Name', key: 'name', type: 'text' },
    { icon: Phone, label: 'Phone', key: 'phone', type: 'tel' },
    { icon: Calendar, label: 'Date of Birth', key: 'dob', type: 'date' },
  ] as const;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 700, margin: '0 auto' }} className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>My Profile</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Manage your personal information</p>
        </div>
        {!editing ? (
          <button className="btn-outline" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit Profile</button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563EB)', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
          {form.name ? form.name.charAt(0).toUpperCase() : user.name?.charAt(0) || 'U'}
        </div>
        <div>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.25rem' }}>{form.name || user.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>{user.email}</p>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>Patient</span>
        </div>
      </div>

      {/* Fields */}
      <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Email (read-only) */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              <Mail size={14} color="#94A3B8" /> Email Address
            </label>
            <input className="input-field" value={user.email} disabled style={{ background: '#F8FAFC', color: '#94A3B8' }} />
          </div>

          {fields.map(({ icon: Icon, label, key, type }) => (
            <div key={key}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                <Icon size={14} color="#94A3B8" /> {label}
              </label>
              {editing ? (
                <input type={type} className="input-field" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              ) : (
                <div style={{ padding: '0.75rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.9rem', color: form[key] ? '#1E293B' : '#94A3B8', background: '#FAFAFA' }}>
                  {form[key] || 'Not set'}
                </div>
              )}
            </div>
          ))}

          {/* Gender */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Gender</label>
            {editing ? (
              <select className="input-field" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <div style={{ padding: '0.75rem 1rem', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: '0.9rem', color: '#1E293B', background: '#FAFAFA', textTransform: 'capitalize' }}>
                {form.gender || 'Not set'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}