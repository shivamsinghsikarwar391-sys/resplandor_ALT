import express from 'express';
import crypto from 'crypto';
import { db } from '../services/db.js';
import { getAvailabilityForDate, isSlotAvailable } from '../services/availabilityService.js';
import { validateBookingRequest } from '../middleware/validation.js';

const router = express.Router();

function generateReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RATL-${random}`;
}

// 1. Check availability for a date
router.get('/availability', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, error: 'Query parameter "date" (YYYY-MM-DD) is required.' });
  }

  const result = getAvailabilityForDate(date);
  return res.json({ success: true, ...result });
});

// 2. Submit a new appointment request
router.post('/', validateBookingRequest, (req, res) => {
  const {
    fullName,
    phone,
    email,
    serviceId,
    serviceName,
    appointmentDate,
    appointmentTime,
    nailLength,
    nailShape,
    notes
  } = req.body;

  // Verify that the requested slot is currently free from Confirmed double-booking
  const slotCheck = isSlotAvailable(appointmentDate, appointmentTime);
  if (!slotCheck.available) {
    return res.status(409).json({
      success: false,
      error: slotCheck.reason,
      conflict: true
    });
  }

  let reference = generateReference();
  // Ensure reference uniqueness
  let attempts = 0;
  while (attempts < 10) {
    const existing = db.prepare('SELECT id FROM appointments WHERE reference = ?').get(reference);
    if (!existing) break;
    reference = generateReference();
    attempts++;
  }

  const now = new Date().toISOString();

  try {
    const insertStmt = db.prepare(`
      INSERT INTO appointments (
        reference,
        customer_name,
        customer_phone,
        customer_email,
        service_id,
        service_name,
        appointment_date,
        appointment_time,
        duration_minutes,
        nail_length,
        nail_shape,
        notes,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
    `);

    const result = insertStmt.run(
      reference,
      fullName.trim(),
      phone.trim(),
      email ? email.trim() : null,
      serviceId,
      serviceName || serviceId,
      appointmentDate,
      appointmentTime,
      60,
      nailLength || null,
      nailShape || null,
      notes ? notes.trim() : null,
      now,
      now
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (appointment_id, action, details, performed_by, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      result.lastInsertRowid,
      'APPOINTMENT_REQUESTED',
      `New request submitted by customer for ${appointmentDate} at ${appointmentTime}`,
      'CUSTOMER',
      now
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully. Awaiting salon confirmation.',
      appointment: {
        id: result.lastInsertRowid,
        reference,
        customerName: fullName.trim(),
        serviceName: serviceName || serviceId,
        appointmentDate,
        appointmentTime,
        status: 'Pending',
        createdAt: now
      }
    });
  } catch (err) {
    console.error('Failed to create appointment:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while saving your appointment request. Please try again.'
    });
  }
});

// 3. Track appointment status by Reference and/or Phone
router.get('/track', (req, res) => {
  const { reference, phone } = req.query;

  if (!reference && !phone) {
    return res.status(400).json({
      success: false,
      error: 'Please provide either a booking reference code or a phone number.'
    });
  }

  let row = null;
  if (reference) {
    row = db.prepare(`
      SELECT 
        reference,
        customer_name,
        service_name,
        appointment_date,
        appointment_time,
        nail_length,
        nail_shape,
        status,
        admin_notes,
        rejection_reason,
        created_at,
        updated_at
      FROM appointments
      WHERE UPPER(reference) = UPPER(?)
    `).get(reference.trim());
  } else if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    row = db.prepare(`
      SELECT 
        reference,
        customer_name,
        service_name,
        appointment_date,
        appointment_time,
        nail_length,
        nail_shape,
        status,
        admin_notes,
        rejection_reason,
        created_at,
        updated_at
      FROM appointments
      WHERE replace(replace(replace(replace(customer_phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ?
      ORDER BY id DESC
      LIMIT 1
    `).get(`%${cleanPhone}%`);
  }

  if (!row) {
    return res.status(404).json({
      success: false,
      error: 'No appointment found with the provided details. Please verify your reference or phone number.'
    });
  }

  // Generate appropriate status guidance
  let statusMessage = '';
  if (row.status === 'Pending') {
    statusMessage = 'Your request is currently awaiting review by the salon owner. Once availability is confirmed, your status will update to Confirmed.';
  } else if (row.status === 'Confirmed') {
    statusMessage = `Your appointment is officially confirmed for ${row.appointment_date} at ${row.appointment_time} at Resplandor ATL in Snellville, GA. We look forward to seeing you!`;
  } else if (row.status === 'Rescheduled') {
    statusMessage = `Your appointment has been rescheduled to ${row.appointment_date} at ${row.appointment_time}.`;
  } else if (row.status === 'Rejected') {
    statusMessage = row.rejection_reason 
      ? `Unfortunately, this request could not be accommodated: ${row.rejection_reason}`
      : 'Unfortunately, this time slot could not be accommodated. Please submit an alternate date or reach out on Instagram.';
  } else if (row.status === 'Cancelled') {
    statusMessage = 'This appointment was cancelled.';
  } else if (row.status === 'Completed') {
    statusMessage = 'Thank you for visiting Resplandor ATL! We hope you love your nails.';
  }

  return res.json({
    success: true,
    appointment: {
      reference: row.reference,
      customerName: row.customer_name,
      serviceName: row.service_name,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      nailLength: row.nail_length,
      nailShape: row.nail_shape,
      status: row.status,
      statusMessage,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  });
});

export default router;
