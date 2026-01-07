import sgMail from "@sendgrid/mail";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailOptions): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not defined");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not defined");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const from = process.env.EMAIL_FROM;

  const msg = {
    to,
    from,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""), // HTMLタグを除去してテキスト版を生成
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

export function generateEmailVerificationHtml(
  verificationUrl: string,
  name?: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>メールアドレスの確認</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #0070f3; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .footer { margin-top: 30px; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Works Logue</h1>
          <h2>メールアドレスの確認</h2>
        </div>
        
        <p>${name ? `${name}さん、` : ""}Works Logueにご登録いただきありがとうございます。</p>
        
        <p>以下のボタンをクリックしてメールアドレスを確認してください：</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">メールアドレスを確認</a>
        </div>
        
        <p>このリンクは24時間で有効期限が切れます。</p>
        
        <p>もしボタンがクリックできない場合は、以下のURLを直接コピー＆ペーストしてください：</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        
        <div class="footer">
          <p>このメールに心当たりがない場合は、このメールを無視してください。</p>
          <p>© Works Logue</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
