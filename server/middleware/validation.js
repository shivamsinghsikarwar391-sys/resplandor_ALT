export function validateBookingRequest(req, res, next) {
  const {
    fullName,
    phone,
    email,
    serviceId,
    serviceName,
    appointmentDate,
    appointmentTime
  } = req.body;

  const errors = {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters).';
  }

  if (!phone || typeof phone !== 'string') {
    errors.phone = 'Phone number is required.';
  } else {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      errors.phone = 'A valid 10-digit phone number is required.';
    }
  }

  if (email && typeof email === 'string' && email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
  }

  if (!serviceId || typeof serviceId !== 'string') {
    errors.serviceId = 'Please select a nail service.';
  }

  if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
    errors.appointmentDate = 'A valid appointment date (YYYY-MM-DD) is required.';
  } else {
    const selected = new Date(`${appointmentDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.appointmentDate = 'Appointment date cannot be in the past.';
    }
  }

  if (!appointmentTime || typeof appointmentTime !== 'string') {
    errors.appointmentTime = 'Please select a valid time slot.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors,
      message: 'Validation failed. Please correct the highlighted errors.'
    });
  }

  next();
}
