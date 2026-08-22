import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendLeaveNotification(
  to: string,
  name: string,
  status: 'approved' | 'rejected',
  leaveType: string,
  comment?: string
) {
  try {
    await resend.emails.send({
      from: 'OHRMS <onboarding@resend.dev>',
      to,
      subject: `Leave request ${status} — OHRMS`,
      html: `<p>Hi ${name},</p><p>Your <b>${leaveType}</b> leave request has been <b>${status}</b>.</p>${comment ? `<p>Admin comment: ${comment}</p>` : ''}<p>Login to OHRMS for details.</p>`
    })
  } catch {
  }
}

export async function sendWarningEmail(to: string, name: string, message: string) {
  try {
    await resend.emails.send({
      from: 'OHRMS <onboarding@resend.dev>',
      to,
      subject: 'Warning Notice — OHRMS',
      html: `<p>Hi ${name},</p><p><b>Warning:</b> ${message}</p><p>Please contact your administrator for more information.</p>`
    })
  } catch {
  }
}
