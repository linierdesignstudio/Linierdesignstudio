import { Resend } from 'resend';
import { HttpError } from './http.js';

export interface PasswordResetEmailConfig {
  apiKey: string;
  from: string;
  publicUrl: URL;
}

export function getPasswordResetEmailConfig(): PasswordResetEmailConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.PORTAL_EMAIL_FROM?.trim();
  const publicUrlValue = process.env.PORTAL_PUBLIC_URL?.trim();
  if (!apiKey || !from || !publicUrlValue) {
    throw new HttpError(503, 'Email reset belum dikonfigurasi. Hubungi administrator studio.');
  }
  const senderAddress = /<([^<>]+)>/.exec(from)?.[1] ?? from;
  if (/[\r\n]/.test(from) || !isValidEmail(senderAddress)) {
    throw new HttpError(503, 'Alamat pengirim email belum dikonfigurasi dengan valid.');
  }

  let publicUrl: URL;
  try {
    publicUrl = new URL(publicUrlValue);
  } catch {
    throw new HttpError(503, 'Alamat situs untuk tautan reset belum dikonfigurasi.');
  }

  if (
    !['http:', 'https:'].includes(publicUrl.protocol)
    || (process.env.NODE_ENV === 'production' && publicUrl.protocol !== 'https:')
    || publicUrl.username
    || publicUrl.password
  ) {
    throw new HttpError(503, 'Alamat situs untuk tautan reset tidak valid.');
  }

  return { apiKey, from, publicUrl };
}

export async function sendPasswordResetEmail(
  config: PasswordResetEmailConfig,
  email: string,
  clientName: string,
  token: string
): Promise<void> {
  const resetUrl = new URL('/', config.publicUrl.origin);
  resetUrl.hash = `/portal?resetToken=${encodeURIComponent(token)}`;
  const escapedName = escapeHtml(clientName);
  const escapedUrl = escapeHtml(resetUrl.toString());
  const resend = new Resend(config.apiKey);
  const { data, error } = await resend.emails.send({
    from: config.from,
    to: [email],
    subject: 'Atur ulang password Portal Klien Linier Studio',
    html: `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:32px 16px;background:#f4f2ee;color:#27251f;font:14px/1.6 Arial,sans-serif">
    <main style="max-width:560px;margin:0 auto;padding:32px;background:#fff;border-top:4px solid #8c795e">
      <p style="margin:0 0 20px;color:#8c795e;font-size:11px;font-weight:700;letter-spacing:.14em">LINIER STUDIO · PORTAL KLIEN</p>
      <h1 style="margin:0 0 14px;font-size:23px">Atur ulang password</h1>
      <p>Halo ${escapedName},</p>
      <p>Kami menerima permintaan untuk mengubah password Portal Klien Linier Studio. Gunakan tombol berikut untuk membuat password baru.</p>
      <p style="margin:26px 0"><a href="${escapedUrl}" style="display:inline-block;padding:12px 20px;background:#8c795e;color:#fff;text-decoration:none;font-weight:700">Buat password baru</a></p>
      <p style="color:#68645d;font-size:12px">Tautan ini hanya dapat digunakan sekali dan berlaku selama 30 menit. Jika Anda tidak meminta perubahan password, abaikan email ini.</p>
      <p style="color:#68645d;font-size:12px">Jika tombol tidak berfungsi, salin tautan ini ke browser:<br><a href="${escapedUrl}" style="color:#746249;overflow-wrap:anywhere">${escapedUrl}</a></p>
      <hr style="margin:26px 0;border:0;border-top:1px solid #e8e4dc">
      <p style="margin:0;color:#68645d;font-size:12px">PT. LINIER NUSA KARYA PERSADA<br>hello@linierstudio.com</p>
    </main>
  </body>
</html>`,
    text: `Halo ${clientName},\n\nGunakan tautan berikut untuk membuat password baru Portal Klien Linier Studio:\n${resetUrl.toString()}\n\nTautan hanya dapat digunakan sekali dan berlaku selama 30 menit. Jika Anda tidak meminta perubahan password, abaikan email ini.\n\nPT. LINIER NUSA KARYA PERSADA`,
  });

  if (error || !data?.id) {
    console.error('Resend password reset delivery failed:', error?.name ?? 'Unknown error', error?.statusCode ?? 0);
    throw new HttpError(502, 'Email reset belum dapat dikirim. Coba kembali beberapa saat lagi.');
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
