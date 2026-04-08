const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Send OTP email — tries Resend API first (works on Render), falls back to Gmail SMTP
 */
exports.sendVerificationEmail = async (email, otp, name) => {
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
            <h1 style="font-size:24px;font-weight:800;color:#0A0A0A"><span style="color:#FF4500">Travel</span>AI</h1>
            <p style="font-size:16px;color:#374151">Hi ${name || 'there'},</p>
            <p style="font-size:15px;color:#6B7280;line-height:1.6">Enter this code to verify your email:</p>
            <div style="background:#FFF5F0;border:2px solid #FF4500;border-radius:16px;padding:24px;text-align:center;margin:24px 0">
                <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#FF4500">${otp}</span>
            </div>
            <p style="font-size:13px;color:#9CA3AF">Code expires in 10 minutes.</p>
        </div>`;

    // Method 1: Resend HTTP API (works on Render — no SMTP needed)
    if (process.env.RESEND_API_KEY) {
        try {
            const { data } = await axios.post('https://api.resend.com/emails', {
                from: 'TravelAI <onboarding@resend.dev>',
                to: email,
                subject: `${otp} is your TravelAI verification code`,
                html,
            }, { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }, timeout: 8000 });
            console.log('✅ Email sent via Resend to', email);
            return true;
        } catch (e) {
            console.log('⚠️ Resend failed:', e.response?.data?.message || e.message);
        }
    }

    // Method 2: Gmail SMTP (works locally, blocked on some hosts)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const t = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
                connectionTimeout: 5000,
                greetingTimeout: 5000,
                socketTimeout: 5000,
            });
            await t.sendMail({
                from: `"TravelAI" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `${otp} is your TravelAI verification code`,
                html,
            });
            console.log('✅ Email sent via SMTP to', email);
            return true;
        } catch (e) {
            console.log('⚠️ SMTP failed:', e.message);
        }
    }

    console.log('⚠️ No email method available — OTP:', otp, 'for', email);
    return false;
};

exports.generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));
