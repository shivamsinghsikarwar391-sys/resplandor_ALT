import { db } from './db.js';

export function getSalonSetting(key, defaultValue = null) {
  try {
    const row = db.prepare('SELECT value FROM salon_settings WHERE key = ?').get(key);
    if (!row) return defaultValue;
    return JSON.parse(row.value);
  } catch (err) {
    console.error(`Error reading setting ${key}:`, err);
    return defaultValue;
  }
}

export function updateSalonSetting(key, value) {
  db.prepare(`
    INSERT INTO salon_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, JSON.stringify(value));
}

export function getAvailabilityForDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { available: false, reason: 'Invalid date format. Use YYYY-MM-DD.', slots: [] };
  }

  // 1. Check if date is in the past
  const targetDate = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (targetDate < today) {
    return { 
      date: dateStr, 
      isAvailableDay: false, 
      reason: 'Selected date is in the past.', 
      slots: [] 
    };
  }

  // 2. Check Blackout Dates
  const blackoutDates = getSalonSetting('blackout_dates', []);
  if (blackoutDates.includes(dateStr)) {
    return { 
      date: dateStr, 
      isAvailableDay: false, 
      reason: 'The salon is closed on this date (Holiday or Studio Off Day).', 
      slots: [] 
    };
  }

  // 3. Check Day of Week & Working Hours
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[targetDate.getDay()];
  const workingHours = getSalonSetting('working_hours', {});
  const scheduleForDay = workingHours[dayName];

  if (!scheduleForDay || scheduleForDay.closed) {
    return { 
      date: dateStr, 
      isAvailableDay: false, 
      reason: `The salon is closed on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}s.`, 
      slots: [] 
    };
  }

  // 4. Retrieve Base Time Slots
  const baseSlots = getSalonSetting('time_slots_preset', [
    '10:00 AM',
    '11:30 AM',
    '01:00 PM',
    '02:30 PM',
    '04:00 PM',
    '05:30 PM'
  ]);

  // 5. Query Existing Confirmed / Rescheduled / Pending Appointments on this date
  const bookedAppointments = db.prepare(`
    SELECT appointment_time, status 
    FROM appointments 
    WHERE appointment_date = ? 
      AND status IN ('Confirmed', 'Rescheduled', 'Pending')
  `).all(dateStr);

  const bookedTimes = new Set();
  const pendingTimes = new Set();

  bookedAppointments.forEach((apt) => {
    if (apt.status === 'Confirmed' || apt.status === 'Rescheduled') {
      bookedTimes.add(apt.appointment_time);
    } else if (apt.status === 'Pending') {
      // Pending requests also show as under review
      pendingTimes.add(apt.appointment_time);
    }
  });

  // 6. Map slots with availability status
  const evaluatedSlots = baseSlots.map((time) => {
    const isConfirmedBooked = bookedTimes.has(time);
    const isPendingReview = pendingTimes.has(time);

    let status = 'available';
    let label = 'Available';

    if (isConfirmedBooked) {
      status = 'booked';
      label = 'Unavailable (Booked)';
    } else if (isPendingReview) {
      // Slot has a pending request awaiting salon decision
      status = 'pending_review';
      label = 'Inquiry Pending';
    }

    return {
      time,
      available: status === 'available',
      status,
      label
    };
  });

  const availableCount = evaluatedSlots.filter((s) => s.available).length;

  return {
    date: dateStr,
    dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
    isAvailableDay: true,
    operatingHours: `${scheduleForDay.open} - ${scheduleForDay.close}`,
    slots: evaluatedSlots,
    totalAvailable: availableCount
  };
}

/**
 * Validates whether a specific time slot can be booked
 */
export function isSlotAvailable(dateStr, timeStr, excludeAppointmentId = null) {
  const dayCheck = getAvailabilityForDate(dateStr);
  if (!dayCheck.isAvailableDay) {
    return { available: false, reason: dayCheck.reason };
  }

  let query = `
    SELECT id, status, customer_name 
    FROM appointments 
    WHERE appointment_date = ? 
      AND appointment_time = ? 
      AND status IN ('Confirmed', 'Rescheduled')
  `;
  const params = [dateStr, timeStr];

  if (excludeAppointmentId) {
    query += ' AND id != ?';
    params.push(excludeAppointmentId);
  }

  const conflicting = db.prepare(query).get(...params);
  if (conflicting) {
    return { 
      available: false, 
      reason: `Time slot ${timeStr} on ${dateStr} is already confirmed for another appointment.` 
    };
  }

  return { available: true };
}
