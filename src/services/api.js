/**
 * Resplandor ATL - Frontend API Service
 */

const API_BASE = '/api';

export async function fetchAvailability(date) {
  try {
    const res = await fetch(`${API_BASE}/appointments/availability?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch availability:', err);
    return { success: false, error: 'Could not connect to appointment scheduling server.' };
  }
}

export async function submitAppointment(bookingData) {
  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    console.error('Failed to submit appointment:', err);
    return { ok: false, error: 'Network error submitting request. Please try again.' };
  }
}

export async function trackAppointment(query) {
  try {
    const isPhone = !query.toUpperCase().startsWith('RATL-') && /\d/.test(query);
    const param = isPhone ? `phone=${encodeURIComponent(query)}` : `reference=${encodeURIComponent(query)}`;
    const res = await fetch(`${API_BASE}/appointments/track?${param}`);
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    console.error('Failed to track appointment:', err);
    return { ok: false, error: 'Network error retrieving appointment status.' };
  }
}

export async function adminLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    console.error('Admin login failed:', err);
    return { ok: false, error: 'Network error logging into admin dashboard.' };
  }
}

export async function adminRequestPasswordReset(identifier) {
  try {
    const res = await fetch(`${API_BASE}/admin/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    console.error('Password reset request failed:', err);
    return { ok: false, error: 'Network error requesting password reset.' };
  }
}

export async function adminResetPassword({ identifier, resetCode, recoveryKey, newPassword }) {
  try {
    const res = await fetch(`${API_BASE}/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, resetCode, recoveryKey, newPassword }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    console.error('Password reset execution failed:', err);
    return { ok: false, error: 'Network error resetting password.' };
  }
}

export async function adminRecoverAccount(recoveryKey) {
  try {
    const res = await fetch(`${API_BASE}/admin/recover-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recoveryKey }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    console.error('Account recovery failed:', err);
    return { ok: false, error: 'Network error recovering account details.' };
  }
}

export async function adminUpdateCredentials({ recoveryKey, newUsername, newEmail, newPassword }) {
  try {
    const res = await fetch(`${API_BASE}/admin/update-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recoveryKey, newUsername, newEmail, newPassword }),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    console.error('Credentials update failed:', err);
    return { ok: false, error: 'Network error updating credentials.' };
  }
}

export async function fetchAdminAppointments(token, filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.date) params.append('date', filters.date);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/admin/appointments?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    console.error('Failed to fetch admin appointments:', err);
    return { ok: false, error: 'Network error retrieving appointments.' };
  }
}

export async function approveAppointment(token, id) {
  try {
    const res = await fetch(`${API_BASE}/admin/appointments/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, error: 'Network error approving appointment.' };
  }
}

export async function rejectAppointment(token, id, reason) {
  try {
    const res = await fetch(`${API_BASE}/admin/appointments/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, error: 'Network error rejecting appointment.' };
  }
}

export async function rescheduleAppointment(token, id, newDate, newTime, adminNotes) {
  try {
    const res = await fetch(`${API_BASE}/admin/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newDate, newTime, adminNotes })
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, error: 'Network error rescheduling appointment.' };
  }
}

export async function updateAppointmentStatus(token, id, status, adminNotes) {
  try {
    const res = await fetch(`${API_BASE}/admin/appointments/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, adminNotes })
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  } catch (err) {
    return { ok: false, error: 'Network error updating status.' };
  }
}

export async function fetchAdminSettings(token) {
  try {
    const res = await fetch(`${API_BASE}/settings/admin`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updateAdminSettings(token, settings) {
  try {
    const res = await fetch(`${API_BASE}/settings/admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to update settings' };
  }
}
