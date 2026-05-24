import nodemailer from 'nodemailer'

function createTransporter() {
  const host = process.env.SMTP_HOST?.trim()
  const port = Number.parseInt(process.env.SMTP_PORT ?? '587', 10)
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('Thiếu cấu hình SMTP. Hãy thêm SMTP_HOST, SMTP_USER và SMTP_PASS vào .env.local.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })
}
function getFromAddress() {
  const configuredFrom = process.env.SMTP_FROM?.trim()
  if (configuredFrom) return configuredFrom

  const user = process.env.SMTP_USER?.trim()
  if (!user) {
    throw new Error('Thiếu SMTP_USER để tạo địa chỉ gửi email.')
  }

  return `"PC Builder" <${user}>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return entities[char]
  })
}

export async function sendOtpEmail(to: string, otp: string, userName?: string) {
  const transporter = createTransporter()
  const from = getFromAddress()
  const safeName = userName ? escapeHtml(userName) : ''

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã OTP PC Builder</title>
</head>
<body style="margin:0;padding:0;background-color:#030304;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#030304;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="width:100%;max-width:480px;background:#090B10;border:1px solid rgba(247,147,26,0.26);border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#EA580C,#F7931A);padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.4px;">PC Builder</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.84);font-size:13px;">Mã xác thực tài khoản</p>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px;">
              <h2 style="margin:0 0 10px;color:#ffffff;font-size:20px;font-weight:700;">Đặt lại mật khẩu</h2>
              <p style="margin:0 0 24px;color:#94A3B8;font-size:14px;line-height:1.6;">
                Xin chào${safeName ? ` <strong style="color:#F7931A;">${safeName}</strong>` : ''}, PC Builder đã nhận yêu cầu xác thực quên mật khẩu cho tài khoản của bạn.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center" style="background:rgba(247,147,26,0.09);border:1px solid rgba(247,147,26,0.32);border-radius:10px;padding:28px;">
                    <p style="margin:0 0 10px;color:#94A3B8;font-size:12px;font-family:monospace;letter-spacing:2px;text-transform:uppercase;">Mã OTP của bạn</p>
                    <div style="font-size:44px;font-weight:800;letter-spacing:12px;color:#F7931A;font-family:monospace;text-shadow:0 0 20px rgba(247,147,26,0.35);">${otp}</div>
                    <p style="margin:12px 0 0;color:#64748B;font-size:12px;">Mã hết hạn sau <strong style="color:#FFD600;">2 phút</strong>.</p>
                  </td>
                </tr>
              </table>
              <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.22);border-radius:10px;padding:14px 16px;margin-bottom:24px;">
                <p style="margin:0;color:#FCA5A5;font-size:13px;line-height:1.5;">
                  Không chia sẻ mã này với bất kỳ ai. PC Builder sẽ không bao giờ hỏi mã OTP của bạn qua điện thoại hoặc chat.
                </p>
              </div>
              <p style="margin:0;color:#64748B;font-size:13px;line-height:1.6;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid rgba(255,255,255,0.08);">
              <p style="margin:0;color:#475569;font-size:11px;text-align:center;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
                PC Builder 2026 · Email tự động, vui lòng không phản hồi
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
    from,
    to,
    subject: `[PC Builder] Mã OTP đặt lại mật khẩu: ${otp}`,
    html,
    text: [
      `Mã OTP của bạn là: ${otp}`,
      'Mã hết hạn sau 2 phút.',
      'Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.',
    ].join('\n'),
  })
}
