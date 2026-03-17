import nodemailer from "nodemailer";
import type { NextRequest } from "next/server";

const ADMIN_EMAIL = process.env.REGISTER_ADMIN_EMAIL || "info@verveautomation.com";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT || "465";
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || true;
const SMTP_USER = process.env.SMTP_USER || "guestiefy@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "vsix pjpp sygf jalm";
const SMTP_FROM = process.env.SMTP_FROM || "AI Video analytics Contact <guestiefy@gmail.com>";

function escapeHtml(input: string | undefined | null) {
  if (!input) return '-';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// module-scope cached transporter
let cachedTransport: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (cachedTransport) return cachedTransport;

  if (!SMTP_HOST) {
    console.error('SMTP_HOST not configured, email disabled');
    return null;
  }

  const t = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  } as nodemailer.TransportOptions);

  // Optional: verify now (awaiting here would block the first request)
  t.verify()
    .then(() => console.log('SMTP transporter verified'))
    .catch((err) => console.error('SMTP transporter verification failed', err));

  cachedTransport = t;
  return cachedTransport;
}

export async function POST(req: NextRequest) {
  if (!ADMIN_EMAIL) {
    return new Response("Server not configured", { status: 500 });
  }
  try {
    const data = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      industry,
      cameraCount,
      message,
    } = data;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return new Response('Invalid email', { status: 400 });
    }

    if (!firstName || !lastName || !company) {
      return new Response('First name, last name, and company are required', { status: 400 });
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.error('Attempt to send email but SMTP not configured');
      return new Response(JSON.stringify({
        ok: false,
        message: 'Email service is not configured. Please contact support.'
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
      await transporter.verify();
    } catch (err) {
      console.error('SMTP verify failed at send time', err);
      return new Response(JSON.stringify({ ok:false, message:'Email server unreachable' }), { status:500, headers:{ 'Content-Type':'application/json' } });
    }

    const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AI Analytics - New Contact Request</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#333;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding:24px 16px;">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px rgba(16,24,40,0.08);">
                <tr>
                  <td style="background:linear-gradient(90deg,#2563eb,#06b6d4);padding:20px 24px;color:#fff;">
                    <h1 style="margin:0;font-size:20px;font-weight:600;">AI Analytics — New Contact Request</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px 0;color:#555;">You have received a new contact request submitted via the AI Analytics landing page. Details are below.</p>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:12px;border-collapse:collapse;">
                      <tr>
                        <td style="padding:8px 0;width:150px;color:#6b7280;font-weight:600;">First Name</td>
                        <td style="padding:8px 0;">${escapeHtml(firstName)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-weight:600;">Last Name</td>
                        <td style="padding:8px 0;">${escapeHtml(lastName)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-weight:600;">Company</td>
                        <td style="padding:8px 0;">${escapeHtml(company)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-weight:600;">Industry</td>
                        <td style="padding:8px 0;">${escapeHtml(industry)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-weight:600;">Camera Count</td>
                        <td style="padding:8px 0;">${escapeHtml(cameraCount)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-weight:600;">Email</td>
                        <td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a></td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-weight:600;">Phone</td>
                        <td style="padding:8px 0;">${escapeHtml(phone)}</td>
                      </tr>
                    </table>
                    <div style="margin-top:18px;">
                      <div style="color:#6b7280;font-weight:600;margin-bottom:8px;">Message</div>
                      <div style="padding:12px;border-radius:6px;background:#f8fafc;border:1px solid #eef2f7;color:#111;">${escapeHtml(message)}</div>
                    </div>
                    <p style="margin:20px 0 0 0;color:#6b7280;font-size:13px;">This email was generated automatically by the AI Analytics landing page.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f1f5f9;padding:12px 24px;text-align:center;color:#94a3b8;font-size:12px;">
                    AI Analytics - Verve Automation
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`;

    const text = [
      'AI Analytics - New Contact Request',
      '',
      `First Name: ${escapeHtml(firstName)}`,
      `Last Name: ${escapeHtml(lastName)}`,
      `Company: ${escapeHtml(company)}`,
      `Industry: ${escapeHtml(industry)}`,
      `Camera Count: ${escapeHtml(cameraCount)}`,
      `Email: ${escapeHtml(email)}`,
      `Phone: ${escapeHtml(phone)}`,
      '',
      'Message:',
      escapeHtml(message),
    ].join('\n');

    await transporter.sendMail({
      from: SMTP_FROM,
      replyTo: email ? String(email) : undefined,
      to: ADMIN_EMAIL,
      subject: `AI Analytics Contact Request from ${escapeHtml(lastName)} - ${escapeHtml(company)}`,
      html,
      text,
    });

    console.log(`Email sent to ${ADMIN_EMAIL} for company: ${company}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("send email error", err);
    return new Response((err as Error)?.message || "Failed to send email", { status: 500 });
  }
}
