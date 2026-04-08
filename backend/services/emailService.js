const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️ Email not configured — EMAIL_USER/EMAIL_PASS missing');
        return null;
    }
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    return transporter;
}

/**
 * Send OTP verification email via Gmail SMTP
 */
exports.sendVerificationEmail = async (email, otp, name) => {
    const t = getTransporter();
    if (!t) {
        console.log('⚠️ SMTP not configured — OTP:', otp, 'for', email);
        return false;
    }
    try {
        const result = await t.sendMail({
            from: `"TravelAI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `${otp} is your TravelAI verification code`,
            html: `
                <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
                    <h1 style="font-size:24px;font-weight:800;color:#0A0A0A;margin-bottom:8px">
                        <span style="color:#FF4500">Travel</span>AI
                    </h1>
                    <p style="font-size:16px;color:#374151;margin-bottom:24px">Hi ${name || 'there'},</p>
                    <p style="font-size:15px;color:#6B7280;line-height:1.6;margin-bottom:24px">
                        Enter this code to verify your email and start planning amazing trips:
                    </p>
                    <div style="background:#FFF5F0;border:2px solid #FF4500;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
                        <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#FF4500">${otp}</span>
                    </div>
                    <p style="font-size:13px;color:#9CA3AF;line-height:1.5">
                        This code expires in 10 minutes. If you didn't request this, ignore this email.
                    </p>
                    <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0" />
                    <p style="font-size:12px;color:#9CA3AF;text-align:center">
                        TravelAI — AI-Powered Travel Planning
                    </p>
                </div>
            `,
        });
        console.log('✅ Email sent to', email, 'messageId:', result.messageId);
        return true;
    } catch (error) {
        console.log('❌ Email send error:', error.message);
        return false;
    }
};

/**
 * Generate 6-digit OTP
 */
exports.generateOTP = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};
