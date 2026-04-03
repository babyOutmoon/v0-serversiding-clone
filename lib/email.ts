// Email service for verification
// Uses Resend free tier (100 emails/day free)

const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function sendVerificationEmail(
  to: string,
  username: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  // If no API key, skip email but still create account (for testing)
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set, skipping email verification")
    return { success: true }
  }

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://moonss.vercel.app'}/verify?token=${verificationToken}`

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Moon Server-Side <noreply@resend.dev>",
        to: [to],
        subject: "Verify your Moon Server-Side account",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(145deg, #111111 0%, #0a0a0a 100%); border-radius: 16px; border: 1px solid #222; padding: 40px;">
    
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); border-radius: 50%; line-height: 60px; font-size: 28px;">
        🌙
      </div>
      <h1 style="color: #a855f7; margin: 15px 0 0 0; font-size: 24px;">Moon Server-Side</h1>
    </div>
    
    <!-- Content -->
    <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 20px; text-align: center;">Verify Your Email</h2>
    
    <p style="color: #888; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
      Hey <strong style="color: #fff;">${username}</strong>, thanks for signing up! Click the button below to verify your email address.
    </p>
    
    <!-- Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Verify Email
      </a>
    </div>
    
    <!-- Alternative link -->
    <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; word-break: break-all;">
      Or copy this link: <br>
      <span style="color: #888;">${verificationUrl}</span>
    </p>
    
    <!-- Footer -->
    <div style="border-top: 1px solid #222; margin-top: 30px; padding-top: 20px; text-align: center;">
      <p style="color: #555; font-size: 12px; margin: 0;">
        This link expires in 24 hours. If you didn't create an account, you can ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
        `,
        text: `Hey ${username}, verify your Moon Server-Side account by visiting: ${verificationUrl}\n\nThis link expires in 24 hours.`,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[email] Failed to send:", error)
      return { success: false, error: "Failed to send verification email" }
    }

    return { success: true }
  } catch (error) {
    console.error("[email] Exception:", error)
    return { success: false, error: "Failed to send verification email" }
  }
}

export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set")
    return { success: false, error: "Email service not configured" }
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://moonss.vercel.app'}/reset-password?token=${resetToken}`

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Moon Server-Side <noreply@resend.dev>",
        to: [to],
        subject: "Reset your Moon Server-Side password",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: #111; border-radius: 16px; border: 1px solid #222; padding: 40px;">
    <h1 style="color: #a855f7; text-align: center;">🌙 Moon Server-Side</h1>
    <h2 style="color: #fff; text-align: center;">Reset Your Password</h2>
    <p style="color: #888; text-align: center;">
      Hey ${username}, click the button below to reset your password.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #a855f7; color: #fff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600;">
        Reset Password
      </a>
    </div>
    <p style="color: #555; font-size: 12px; text-align: center;">
      This link expires in 1 hour. If you didn't request this, ignore this email.
    </p>
  </div>
</body>
</html>
        `,
        text: `Reset your Moon Server-Side password: ${resetUrl}`,
      }),
    })

    if (!response.ok) {
      return { success: false, error: "Failed to send email" }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Failed to send email" }
  }
}
