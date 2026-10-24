/**
 * Resplandor ATL - Customer Notification Dispatcher
 * 
 * Rules:
 * - After an appointment is approved or rescheduled, notify the customer through the
 *   configured email or messaging provider, IF available.
 * - DO NOT pretend an email or SMS was sent if no notification provider is configured.
 */

export async function sendAppointmentNotification(appointment, actionType = 'approved') {
  const emailProvider = process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : null);
  const smsProvider = process.env.SMS_PROVIDER || (process.env.TWILIO_ACCOUNT_SID ? 'twilio' : null);

  const recipientEmail = appointment.customer_email;
  const recipientPhone = appointment.customer_phone;
  const customerName = appointment.customer_name;
  const serviceName = appointment.service_name;
  const date = appointment.appointment_date;
  const time = appointment.appointment_time;
  const reference = appointment.reference;

  let subject = '';
  let messageBody = '';

  if (actionType === 'approved') {
    subject = `Your Resplandor ATL Appointment is Confirmed! (Ref: ${reference})`;
    messageBody = `Dear ${customerName},\n\nYour appointment request for ${serviceName} on ${date} at ${time} has been CONFIRMED by Resplandor ATL.\n\nBooking Reference: ${reference}\nStudio Location: Snellville, Georgia\n\nArrival Information:\n• Please arrive 5 minutes prior to your time.\n• If you need to make changes or share design inspiration, message @resplandor.atl on Instagram with reference ${reference}.\n\nThank you,\nResplandor ATL`;
  } else if (actionType === 'rescheduled') {
    subject = `Rescheduled: Your Resplandor ATL Appointment (Ref: ${reference})`;
    messageBody = `Dear ${customerName},\n\nYour appointment has been RESCHEDULED to ${date} at ${time}.\n\nBooking Reference: ${reference}\n\nIf this new time works for you, no further action is needed. To request an alternative, please message us on Instagram @resplandor.atl.\n\nThank you,\nResplandor ATL`;
  } else if (actionType === 'rejected') {
    subject = `Update Regarding Your Appointment Request (Ref: ${reference})`;
    messageBody = `Dear ${customerName},\n\nThank you for reaching out to Resplandor ATL. Unfortunately, we are unable to accept your appointment request for ${serviceName} on ${date} at ${time} due to scheduling constraints.\n\nPlease visit our website or message @resplandor.atl on Instagram to select an alternate date.\n\nBest regards,\nResplandor ATL`;
  }

  // Case 1: Resend Email Provider configured
  if (emailProvider === 'resend' && process.env.RESEND_API_KEY && recipientEmail) {
    try {
      console.log(`[Notification] Dispatching real email via Resend to ${recipientEmail}...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'Resplandor ATL <appointments@resplandor-atl.com>',
          to: recipientEmail,
          subject,
          text: messageBody
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          sent: true,
          status: 'sent',
          provider: 'resend',
          details: `Delivered to ${recipientEmail} via Resend (ID: ${data.id})`
        };
      } else {
        const errText = await res.text();
        console.error('[Notification] Resend API error:', errText);
        return {
          sent: false,
          status: 'failed',
          provider: 'resend',
          details: `Resend error: ${errText}`
        };
      }
    } catch (err) {
      console.error('[Notification] Email delivery failure:', err);
      return {
        sent: false,
        status: 'failed',
        provider: 'resend',
        details: err.message
      };
    }
  }

  // Case 2: No provider is configured
  console.log(`[Notification] No external notification provider is configured in environment (.env).`);
  console.log(`[Notification Details] Action: ${actionType.toUpperCase()} | Recipient: ${customerName} (${recipientPhone}) | Ref: ${reference}`);

  return {
    sent: false,
    status: 'unconfigured',
    provider: 'none',
    details: 'No notification provider (e.g. RESEND_API_KEY, SENDGRID_API_KEY, or TWILIO) is configured in environment variables. Notification logged on server.'
  };
}

/**
 * Dispatch password reset verification code to salon admin email
 */
export async function sendAdminResetCodeEmail(recipientEmail, code, expiresMinutes = 15) {
  const emailProvider = process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : null);
  const subject = `Resplandor ATL Admin: Your Password Reset Code is ${code}`;
  const messageBody = `Hello,\n\nYou requested to reset your credentials for the Resplandor ATL Salon Admin Portal.\n\nYour 6-digit verification code is:\n\n    ${code}\n\nThis verification code will expire in ${expiresMinutes} minutes.\n\nIf you did not request a password reset, you can safely ignore this message or use your Master Recovery Key to verify your account security.\n\nWarm regards,\nResplandor ATL • Snellville, GA`;

  if (emailProvider === 'resend' && process.env.RESEND_API_KEY && recipientEmail) {
    try {
      console.log(`[Notification] Dispatching admin reset code via Resend to ${recipientEmail}...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'Resplandor ATL <security@resplandor-atl.com>',
          to: recipientEmail,
          subject,
          text: messageBody
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          sent: true,
          provider: 'resend',
          id: data.id,
          details: `Sent to ${recipientEmail}`
        };
      } else {
        const errText = await res.text();
        console.error('[Notification] Resend admin reset email error:', errText);
        return { sent: false, provider: 'resend', details: errText };
      }
    } catch (err) {
      console.error('[Notification] Failed to dispatch admin reset email:', err);
      return { sent: false, provider: 'resend', details: err.message };
    }
  }

  // No email provider configured - log code cleanly for local/presentation mode
  console.log(`[Admin Security] Generated reset code for ${recipientEmail}: ${code} (expires in ${expiresMinutes} mins)`);
  return {
    sent: false,
    provider: 'none',
    code,
    details: 'No email provider configured. Verification code logged on server.'
  };
}
