// Simple email verification using Resend (free tier: 100 emails/day)
// Or falls back to console logging in development

const RESEND_API_KEY = process.env.RESEND_API_KEY

export function generateVerificationCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  username: string
): Promise<boolean> {
  // If no API key, log to console (development mode)
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL] Verification code for ${email}: ${code}`)
    return true
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Moon Server-Side <noreply@moonss.vercel.app>",
        to: [email],
        subject: "Verify Your Moon Account",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
            <div style="max-width: 500px; margin: 0 auto; background: #111111; border-radius: 16px; padding: 40px; border: 1px solid #222222;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Moon Server-Side</h1>
              </div>
              
              <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 20px;">Welcome, ${username}!</h2>
              
              <p style="color: #888888; margin: 0 0 24px; line-height: 1.6;">
                Your verification code is:
              </p>
              
              <div style="background: #1a1a1a; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">${code}</span>
              </div>
              
              <p style="color: #888888; margin: 0 0 8px; font-size: 14px;">
                This code will expire in 10 minutes.
              </p>
              
              <p style="color: #666666; margin: 0; font-size: 12px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error)
    return false
  }
}
