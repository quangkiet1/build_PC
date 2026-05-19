import nodemailer from 'nodemailer'

// Tạo transporter từ env vars
function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error(
      'Thiếu cấu hình SMTP. Hãy thêm SMTP_HOST, SMTP_USER, SMTP_PASS vào .env.local'
    )
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })
}

export async function sendOtpEmail(to: string, otp: string, userName?: string) {
  const transporter = createTransporter()
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã xác nhận PC Builder</title>
</head>
<body style="margin:0;padding:0;background-color:#030304;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#030304;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0F1115,#090B10);border:1px solid rgba(247,147,26,0.2);border-radius:16px;overflow:hidden;max-width:480px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#EA580C,#F7931A);padding:24px 32px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">⚙ PC Builder</span>
                    </div>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:500;">Hệ thống xây dựng cấu hình PC</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="margin:0 0 8px;color:#ffffff;font-size:20px;font-weight:700;">Đặt lại mật khẩu</h2>
              <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;line-height:1.6;">
                Xin chào${userName ? ' <strong style="color:#F7931A;">' + userName + '</strong>' : ''}, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center" style="background:rgba(247,147,26,0.08);border:1px solid rgba(247,147,26,0.3);border-radius:12px;padding:28px;">
                    <p style="margin:0 0 10px;color:#94A3B8;font-size:12px;font-family:monospace;letter-spacing:2px;text-transform:uppercase;">MÃ XÁC NHẬN CỦA BẠN</p>
                    <div style="font-size:44px;font-weight:800;letter-spacing:12px;color:#F7931A;font-family:monospace;text-shadow:0 0 20px rgba(247,147,26,0.4);">${otp}</div>
                    <p style="margin:12px 0 0;color:#64748B;font-size:12px;">⏱ Mã hết hạn sau <strong style="color:#FFD600;">2 phút</strong></p>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:14px 16px;">
                    <p style="margin:0;color:#FCA5A5;font-size:13px;line-height:1.5;">
                      🔒 <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã này với bất kỳ ai. Nhân viên PC Builder sẽ không bao giờ yêu cầu mã xác nhận của bạn.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;color:#334155;font-size:11px;text-align:center;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
                © 2026 PC Builder · Email tự động, vui lòng không reply
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from: `"PC Builder" <${from}>`,
    to,
    subject: `[PC Builder] Mã xác nhận đặt lại mật khẩu: ${otp}`,
    html,
    text: `Mã xác nhận của bạn là: ${otp}\nMã hết hạn sau 2 phút.\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
  })
}
