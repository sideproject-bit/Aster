// Uses Resend when configured, otherwise logs the reset link to the console — the
// same conditional pattern as storage.ts's local-filesystem fallback for uploads.
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Aster <onboarding@resend.dev>",
      to: email,
      subject: "Reset your Aster password",
      html: `<p>Click the link below to reset your Aster password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
    return;
  }

  console.log(`[email] RESEND_API_KEY not set — password reset link for ${email}:\n${resetUrl}`);
}
