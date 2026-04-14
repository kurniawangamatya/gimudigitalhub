import os
import logging
from brevo import Brevo
from brevo.transactional_emails import (
    SendTransacEmailRequestSender,
    SendTransacEmailRequestToItem,
)

logger = logging.getLogger(__name__)

def get_brevo_client():
    api_key = os.environ.get("BREVO_API_KEY")
    if not api_key:
        return None
    return Brevo(api_key=api_key)

def get_sender():
    return SendTransacEmailRequestSender(
        name=os.environ.get("BREVO_SENDER_NAME", "Gimu Digital Hub"),
        email=os.environ.get("BREVO_SENDER_EMAIL", "noreply@gimudigitalhub.com"),
    )

async def send_email(to_email: str, to_name: str, subject: str, html_content: str):
    try:
        client = get_brevo_client()
        if not client:
            logger.warning(f"Brevo not configured. Email to {to_email} skipped: {subject}")
            return False
        result = client.transactional_emails.send_transac_email(
            subject=subject,
            html_content=html_content,
            sender=get_sender(),
            to=[SendTransacEmailRequestToItem(email=to_email, name=to_name)],
        )
        logger.info(f"Email sent to {to_email}: {subject} (ID: {result.message_id})")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

# ============ EMAIL TEMPLATES ============

def welcome_email_html(name: str) -> str:
    return f"""
    <div style="font-family:'Manrope',Arial,sans-serif;max-width:600px;margin:0 auto;background:#FBFBF9;padding:0;">
      <div style="background:#143D2E;padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;font-family:'Outfit',Arial,sans-serif;font-size:24px;margin:0;">Gimu Digital Hub</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="font-family:'Outfit',Arial,sans-serif;color:#1E2320;font-size:20px;margin:0 0 16px;">Selamat Datang, {name}!</h2>
        <p style="color:#6C7A70;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Terima kasih telah bergabung dengan Gimu Digital Hub. Anda sekarang memiliki akses ke platform edukasi medis terlengkap untuk dokter umum, dokter gigi, dan tenaga kesehatan.
        </p>
        <p style="color:#6C7A70;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Jelajahi koleksi e-book, video kursus, template dokumen, dan bank soal kami untuk meningkatkan kompetensi profesional Anda.
        </p>
        <a href="#" style="display:inline-block;background:#143D2E;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:14px;font-weight:600;">
          Jelajahi Produk
        </a>
      </div>
      <div style="background:#F0F2ED;padding:16px 24px;text-align:center;">
        <p style="color:#8FA998;font-size:12px;margin:0;">&copy; 2026 Gimu Digital Hub. All rights reserved.</p>
      </div>
    </div>
    """

def reset_password_email_html(name: str, reset_link: str) -> str:
    return f"""
    <div style="font-family:'Manrope',Arial,sans-serif;max-width:600px;margin:0 auto;background:#FBFBF9;padding:0;">
      <div style="background:#143D2E;padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;font-family:'Outfit',Arial,sans-serif;font-size:24px;margin:0;">Gimu Digital Hub</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="font-family:'Outfit',Arial,sans-serif;color:#1E2320;font-size:20px;margin:0 0 16px;">Reset Password</h2>
        <p style="color:#6C7A70;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Halo {name}, kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru.
        </p>
        <a href="{reset_link}" style="display:inline-block;background:#143D2E;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:14px;font-weight:600;margin:0 0 24px;">
          Reset Password
        </a>
        <p style="color:#6C7A70;font-size:13px;line-height:1.6;margin:16px 0 0;">
          Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
        </p>
        <p style="color:#8FA998;font-size:12px;margin:16px 0 0;word-break:break-all;">
          {reset_link}
        </p>
      </div>
      <div style="background:#F0F2ED;padding:16px 24px;text-align:center;">
        <p style="color:#8FA998;font-size:12px;margin:0;">&copy; 2026 Gimu Digital Hub. All rights reserved.</p>
      </div>
    </div>
    """

def purchase_confirmation_email_html(name: str, order_id: str, amount: float, product_names: list) -> str:
    products_html = ""
    for pname in product_names:
        products_html += f'<li style="color:#1E2320;font-size:14px;padding:4px 0;">{pname}</li>'

    return f"""
    <div style="font-family:'Manrope',Arial,sans-serif;max-width:600px;margin:0 auto;background:#FBFBF9;padding:0;">
      <div style="background:#143D2E;padding:32px 24px;text-align:center;">
        <h1 style="color:#fff;font-family:'Outfit',Arial,sans-serif;font-size:24px;margin:0;">Gimu Digital Hub</h1>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="font-family:'Outfit',Arial,sans-serif;color:#1E2320;font-size:20px;margin:0 0 16px;">Pembayaran Berhasil!</h2>
        <p style="color:#6C7A70;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Halo {name}, terima kasih atas pembelian Anda. Berikut detail pesanan:
        </p>
        <div style="background:#fff;border:1px solid #E5E7E2;border-radius:12px;padding:20px;margin:0 0 20px;">
          <p style="color:#8FA998;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Order #{order_id[:8]}</p>
          <p style="font-family:'Outfit',Arial,sans-serif;color:#143D2E;font-size:24px;font-weight:600;margin:0 0 16px;">${amount:.2f}</p>
          <p style="color:#6C7A70;font-size:13px;margin:0 0 8px;font-weight:600;">Produk yang dibeli:</p>
          <ul style="margin:0;padding:0 0 0 20px;">{products_html}</ul>
        </div>
        <p style="color:#6C7A70;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Produk digital Anda sudah dapat diakses. Selamat belajar!
        </p>
        <a href="#" style="display:inline-block;background:#143D2E;color:#fff;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:14px;font-weight:600;">
          Lihat Pesanan Saya
        </a>
      </div>
      <div style="background:#F0F2ED;padding:16px 24px;text-align:center;">
        <p style="color:#8FA998;font-size:12px;margin:0;">&copy; 2026 Gimu Digital Hub. All rights reserved.</p>
      </div>
    </div>
    """
