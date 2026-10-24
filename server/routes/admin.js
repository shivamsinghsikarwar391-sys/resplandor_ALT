import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../services/db.js';
import { requireAdmin, generateToken } from '../middleware/auth.js';
import { isSlotAvailable, getSalonSetting, updateSalonSetting } from '../services/availabilityService.js';
import { sendAppointmentNotification, sendAdminResetCodeEmail } from '../services/notificationService.js';

const router = express.Router();

// Helper: Mask email for privacy (e.g. o*****r@resplandor-atl.com)
function maskEmail(email) {
  if (!email || !email.includes('@')) return '***@resplandor-atl.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return `${user[0]}***@${domain}`;
  }
  const maskedUser = `${user[0]}${'*'.repeat(Math.min(user.length - 2, 5))}${user[user.length - 1]}`;
  return `${maskedUser}@${domain}`;
}

// Helper: Retrieve active master recovery key
function getMasterRecoveryKey() {
  const settingKey = getSalonSetting('admin_recovery_key', null);
  return settingKey || process.env.ADMIN_RECOVERY_KEY || 'RESPLANDOR-ATL-OWNER-KEY-2026';
}

// 1. Admin Authentication Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both username and password.'
    });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ? OR email = ?').get(username.trim(), username.trim());
  if (!admin) {
    return res.status(401).json({
      success: false,
      error: 'Invalid administrator credentials.'
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, admin.password_hash);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid administrator credentials.'
    });
  }

  const token = generateToken(admin);

  return res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name
    }
  });
});

// 1B. Forgot Password - Request 6-digit Reset Code
router.post('/forgot-password', async (req, res) => {
  const { identifier } = req.body;

  if (!identifier || !identifier.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Please enter your registered username or email address.'
    });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const admin = db.prepare('SELECT * FROM admins WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanIdentifier, cleanIdentifier);

  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'No administrator account was found matching that username or email.'
    });
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
  const now = new Date().toISOString();

  // Invalidate any previous unused reset codes for this admin
  db.prepare('UPDATE admin_password_resets SET used = 1 WHERE admin_id = ? AND used = 0').run(admin.id);

  // Store new reset code
  db.prepare(`
    INSERT INTO admin_password_resets (admin_id, reset_code, expires_at, used, created_at)
    VALUES (?, ?, ?, 0, ?)
  `).run(admin.id, code, expiresAt, now);

  // Attempt email delivery if provider configured
  const emailResult = await sendAdminResetCodeEmail(admin.email, code, 15);
  const masked = maskEmail(admin.email);

  return res.json({
    success: true,
    message: emailResult.sent
      ? `A 6-digit verification code has been dispatched to ${masked}.`
      : `Reset verification code generated for ${masked}.`,
    maskedEmail: masked,
    username: admin.username,
    emailConfigured: emailResult.sent,
    demoCode: emailResult.sent ? undefined : code
  });
});

// 1C. Reset Password - Verify Code or Master Recovery Key & Set New Password
router.post('/reset-password', (req, res) => {
  const { identifier, resetCode, recoveryKey, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 8 characters long.'
    });
  }

  let admin = null;
  const masterKey = getMasterRecoveryKey();

  // Mode A: Reset via Master Recovery Key
  if (recoveryKey && recoveryKey.trim()) {
    if (recoveryKey.trim() !== masterKey.trim()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid salon master recovery key. Please check your recovery records or use a verification code.'
      });
    }

    if (identifier && identifier.trim()) {
      const cleanId = identifier.trim().toLowerCase();
      admin = db.prepare('SELECT * FROM admins WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanId, cleanId);
    } else {
      admin = db.prepare('SELECT * FROM admins ORDER BY id ASC LIMIT 1').get();
    }
  }
  // Mode B: Reset via 6-digit Verification Code
  else if (resetCode && resetCode.trim()) {
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide the username or email associated with this reset code.'
      });
    }

    const cleanId = identifier.trim().toLowerCase();
    admin = db.prepare('SELECT * FROM admins WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanId, cleanId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'No administrator account found.'
      });
    }

    const resetRecord = db.prepare(`
      SELECT * FROM admin_password_resets
      WHERE admin_id = ? AND reset_code = ? AND used = 0
      ORDER BY id DESC LIMIT 1
    `).get(admin.id, resetCode.trim());

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or previously used verification code. Please request a new code.'
      });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'This verification code has expired (15-minute limit). Please request a new one.'
      });
    }

    // Mark code as used
    db.prepare('UPDATE admin_password_resets SET used = 1 WHERE id = ?').run(resetRecord.id);
  } else {
    return res.status(400).json({
      success: false,
      error: 'Please provide either a valid 6-digit reset code or the Salon Master Recovery Key.'
    });
  }

  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'Administrator account not found.'
    });
  }

  // Hash new password using bcrypt
  const newHash = bcrypt.hashSync(newPassword, 10);
  const now = new Date().toISOString();

  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(newHash, admin.id);

  // Invalidate any other pending reset codes for this admin
  db.prepare('UPDATE admin_password_resets SET used = 1 WHERE admin_id = ? AND used = 0').run(admin.id);

  // Audit log entry
  db.prepare(`
    INSERT INTO audit_logs (action, details, performed_by, created_at)
    VALUES (?, ?, ?, ?)
  `).run(
    'ADMIN_PASSWORD_RESET',
    `Password reset successfully for admin '${admin.username}'`,
    admin.username,
    now
  );

  return res.json({
    success: true,
    message: 'Your administrator password has been successfully reset! You can now log in.',
    username: admin.username
  });
});

// 1D. Forgot Username or Email - Recover Account Identity using Master Recovery Key
router.post('/recover-account', (req, res) => {
  const { recoveryKey } = req.body;

  if (!recoveryKey || !recoveryKey.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Please enter the Salon Master Recovery Key to recover your registered username and email.'
    });
  }

  const masterKey = getMasterRecoveryKey();
  if (recoveryKey.trim() !== masterKey.trim()) {
    return res.status(401).json({
      success: false,
      error: 'Invalid salon master recovery key. Please verify the key from your salon documentation.'
    });
  }

  const admin = db.prepare('SELECT id, username, email, name, created_at FROM admins ORDER BY id ASC LIMIT 1').get();
  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'No administrator accounts exist in the salon database.'
    });
  }

  const masked = maskEmail(admin.email);

  return res.json({
    success: true,
    message: 'Account identity verified with Salon Master Recovery Key.',
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      maskedEmail: masked,
      name: admin.name,
      createdAt: admin.created_at
    }
  });
});

// 1E. Update Credentials via Master Recovery Key (Emergency Update)
router.post('/update-credentials', (req, res) => {
  const { recoveryKey, newUsername, newEmail, newPassword } = req.body;

  if (!recoveryKey || !recoveryKey.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Salon master recovery key is required to update credentials.'
    });
  }

  const masterKey = getMasterRecoveryKey();
  if (recoveryKey.trim() !== masterKey.trim()) {
    return res.status(401).json({
      success: false,
      error: 'Invalid salon master recovery key.'
    });
  }

  const admin = db.prepare('SELECT * FROM admins ORDER BY id ASC LIMIT 1').get();
  if (!admin) {
    return res.status(404).json({
      success: false,
      error: 'Administrator account not found.'
    });
  }

  let updatedUsername = admin.username;
  let updatedEmail = admin.email;
  let updatedHash = admin.password_hash;

  if (newUsername && newUsername.trim()) {
    updatedUsername = newUsername.trim();
  }

  if (newEmail && newEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }
    updatedEmail = newEmail.trim().toLowerCase();
  }

  if (newPassword) {
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long.'
      });
    }
    updatedHash = bcrypt.hashSync(newPassword, 10);
  }

  try {
    db.prepare(`
      UPDATE admins 
      SET username = ?, email = ?, password_hash = ?
      WHERE id = ?
    `).run(updatedUsername, updatedEmail, updatedHash, admin.id);

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_logs (action, details, performed_by, created_at)
      VALUES (?, ?, ?, ?)
    `).run(
      'ADMIN_CREDENTIALS_UPDATED',
      `Credentials updated for admin ${updatedUsername} (${updatedEmail}) via Master Recovery Key`,
      updatedUsername,
      now
    );

    return res.json({
      success: true,
      message: 'Admin credentials successfully updated! You may now sign in with your updated details.',
      admin: {
        username: updatedUsername,
        email: updatedEmail
      }
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({
        success: false,
        error: 'That username or email is already registered.'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to update credentials in database.'
    });
  }
});

// 2. Current Authenticated Admin
router.get('/me', requireAdmin, (req, res) => {
  return res.json({ success: true, admin: req.admin });
});

// 3. List Appointments with filters & metrics
router.get('/appointments', requireAdmin, (req, res) => {
  const { status, date, search } = req.query;

  let query = 'SELECT * FROM appointments WHERE 1=1';
  const params = [];

  if (status && status !== 'All') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (date) {
    query += ' AND appointment_date = ?';
    params.push(date);
  }

  if (search && search.trim()) {
    query += ` AND (
      customer_name LIKE ? OR 
      customer_phone LIKE ? OR 
      customer_email LIKE ? OR 
      reference LIKE ?
    )`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY appointment_date ASC, appointment_time ASC';

  const appointments = db.prepare(query).all(...params);

  // Compute metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Pending'").get().count;
  const confirmedTodayCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Confirmed' AND appointment_date = ?").get(todayStr).count;
  const upcomingCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status IN ('Confirmed', 'Rescheduled') AND appointment_date >= ?").get(todayStr).count;
  const totalCount = db.prepare("SELECT COUNT(*) as count FROM appointments").get().count;

  return res.json({
    success: true,
    appointments,
    metrics: {
      pending: pendingCount,
      confirmedToday: confirmedTodayCount,
      upcoming: upcomingCount,
      total: totalCount
    }
  });
});

// 4. Approve appointment (Pending -> Confirmed)
router.patch('/appointments/:id/approve', requireAdmin, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Appointment not found.' });
  }

  // Prevent conflicting confirmed appointments at the same date and time
  const conflictCheck = isSlotAvailable(appointment.appointment_date, appointment.appointment_time, appointmentId);
  if (!conflictCheck.available) {
    return res.status(409).json({
      success: false,
      error: `Conflict detected: ${conflictCheck.reason}. Please reschedule before approving.`
    });
  }

  const now = new Date().toISOString();

  // Notification dispatch
  const notificationResult = await sendAppointmentNotification(appointment, 'approved');

  db.prepare(`
    UPDATE appointments
    SET status = 'Confirmed',
        notification_status = ?,
        notification_details = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    notificationResult.status,
    notificationResult.details,
    now,
    appointmentId
  );

  // Audit log
  db.prepare(`
    INSERT INTO audit_logs (appointment_id, action, details, performed_by, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    appointmentId,
    'APPOINTMENT_APPROVED',
    `Approved by admin ${req.admin.username}. Notification: ${notificationResult.details}`,
    req.admin.username,
    now
  );

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

  return res.json({
    success: true,
    message: 'Appointment approved and confirmed successfully.',
    appointment: updated,
    notification: notificationResult
  });
});

// 5. Reject appointment
router.patch('/appointments/:id/reject', requireAdmin, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { reason } = req.body;
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Appointment not found.' });
  }

  const now = new Date().toISOString();
  const rejectionReason = reason ? reason.trim() : 'Schedule conflict / fully booked.';

  const notificationResult = await sendAppointmentNotification(
    { ...appointment, rejection_reason: rejectionReason },
    'rejected'
  );

  db.prepare(`
    UPDATE appointments
    SET status = 'Rejected',
        rejection_reason = ?,
        notification_status = ?,
        notification_details = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    rejectionReason,
    notificationResult.status,
    notificationResult.details,
    now,
    appointmentId
  );

  db.prepare(`
    INSERT INTO audit_logs (appointment_id, action, details, performed_by, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    appointmentId,
    'APPOINTMENT_REJECTED',
    `Rejected by admin ${req.admin.username}. Reason: ${rejectionReason}`,
    req.admin.username,
    now
  );

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

  return res.json({
    success: true,
    message: 'Appointment request rejected.',
    appointment: updated,
    notification: notificationResult
  });
});

// 6. Reschedule appointment
router.patch('/appointments/:id/reschedule', requireAdmin, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { newDate, newTime, adminNotes } = req.body;

  if (!newDate || !newTime) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both new appointment date and new time slot.'
    });
  }

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Appointment not found.' });
  }

  // Conflict validation on new slot
  const conflictCheck = isSlotAvailable(newDate, newTime, appointmentId);
  if (!conflictCheck.available) {
    return res.status(409).json({
      success: false,
      error: `Conflict: ${conflictCheck.reason}`
    });
  }

  const now = new Date().toISOString();
  const updatedNotes = adminNotes ? adminNotes.trim() : appointment.admin_notes;

  const notificationResult = await sendAppointmentNotification(
    { ...appointment, appointment_date: newDate, appointment_time: newTime },
    'rescheduled'
  );

  db.prepare(`
    UPDATE appointments
    SET appointment_date = ?,
        appointment_time = ?,
        status = 'Rescheduled',
        admin_notes = ?,
        notification_status = ?,
        notification_details = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    newDate,
    newTime,
    updatedNotes,
    notificationResult.status,
    notificationResult.details,
    now,
    appointmentId
  );

  db.prepare(`
    INSERT INTO audit_logs (appointment_id, action, details, performed_by, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    appointmentId,
    'APPOINTMENT_RESCHEDULED',
    `Rescheduled from ${appointment.appointment_date} ${appointment.appointment_time} to ${newDate} ${newTime}`,
    req.admin.username,
    now
  );

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

  return res.json({
    success: true,
    message: `Appointment successfully rescheduled to ${newDate} at ${newTime}.`,
    appointment: updated,
    notification: notificationResult
  });
});

// 7. General status update (Completed / Cancelled)
router.patch('/appointments/:id/status', requireAdmin, (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { status, adminNotes } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Rejected', 'Rescheduled', 'Cancelled', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);
  if (!appointment) {
    return res.status(404).json({ success: false, error: 'Appointment not found.' });
  }

  const now = new Date().toISOString();
  const notes = adminNotes !== undefined ? adminNotes : appointment.admin_notes;

  db.prepare(`
    UPDATE appointments
    SET status = ?,
        admin_notes = ?,
        updated_at = ?
    WHERE id = ?
  `).run(status, notes, now, appointmentId);

  db.prepare(`
    INSERT INTO audit_logs (appointment_id, action, details, performed_by, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    appointmentId,
    `STATUS_CHANGED_${status.toUpperCase()}`,
    `Status updated to ${status} by admin ${req.admin.username}`,
    req.admin.username,
    now
  );

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointmentId);

  return res.json({
    success: true,
    message: `Appointment status updated to ${status}.`,
    appointment: updated
  });
});

export default router;
