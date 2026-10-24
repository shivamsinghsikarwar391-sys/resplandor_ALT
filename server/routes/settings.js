import express from 'express';
import { db } from '../services/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { getSalonSetting, updateSalonSetting } from '../services/availabilityService.js';

const router = express.Router();

// 1. Public settings (working hours, salon info)
router.get('/public', (req, res) => {
  const workingHours = getSalonSetting('working_hours', {});
  const salonInfo = getSalonSetting('salon_info', {});
  const timeSlotsPreset = getSalonSetting('time_slots_preset', []);

  return res.json({
    success: true,
    workingHours,
    salonInfo,
    timeSlotsPreset
  });
});

// 2. Admin settings (full access)
router.get('/admin', requireAdmin, (req, res) => {
  const workingHours = getSalonSetting('working_hours', {});
  const blackoutDates = getSalonSetting('blackout_dates', []);
  const timeSlotsPreset = getSalonSetting('time_slots_preset', []);
  const slotDuration = getSalonSetting('slot_duration_minutes', 60);
  const salonInfo = getSalonSetting('salon_info', {});
  const recoveryKey = getSalonSetting('admin_recovery_key', process.env.ADMIN_RECOVERY_KEY || 'RESPLANDOR-ATL-OWNER-KEY-2026');

  // Notification configuration check
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID);
  const hasSmtp = Boolean(process.env.SMTP_HOST);

  return res.json({
    success: true,
    settings: {
      workingHours,
      blackoutDates,
      timeSlotsPreset,
      slotDuration,
      salonInfo,
      recoveryKey,
      notifications: {
        configured: hasResend || hasTwilio || hasSmtp,
        providers: {
          resend: hasResend,
          twilio: hasTwilio,
          smtp: hasSmtp
        }
      }
    }
  });
});

// 3. Admin update settings
router.post('/admin', requireAdmin, (req, res) => {
  const { workingHours, blackoutDates, timeSlotsPreset, slotDuration, recoveryKey } = req.body;

  if (workingHours) {
    updateSalonSetting('working_hours', workingHours);
  }

  if (Array.isArray(blackoutDates)) {
    updateSalonSetting('blackout_dates', blackoutDates);
  }

  if (Array.isArray(timeSlotsPreset)) {
    updateSalonSetting('time_slots_preset', timeSlotsPreset);
  }

  if (slotDuration && typeof slotDuration === 'number') {
    updateSalonSetting('slot_duration_minutes', slotDuration);
  }

  if (recoveryKey && typeof recoveryKey === 'string' && recoveryKey.trim().length >= 8) {
    updateSalonSetting('admin_recovery_key', recoveryKey.trim());
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO audit_logs (action, details, performed_by, created_at)
    VALUES (?, ?, ?, ?)
  `).run('SALON_SETTINGS_UPDATED', 'Salon operating hours or blackout dates updated', req.admin.username, now);

  return res.json({
    success: true,
    message: 'Salon settings successfully updated.'
  });
});

export default router;
