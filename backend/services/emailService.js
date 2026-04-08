const axios = require('axios');

const getHtml = (otp, name) => `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px">
        <h1 style="font-size:24px;font-weight:800;color:#0A0A0A"><span style="color:#FF4500">Travel</span>AI</h1>
        <p style="font-size:16px;color:#374151">Hi ${name || 'there'},</p>
        <p style="font-size:15px;color:#6B7280;line-height:1.6">Enter this code to verify your email:</p>
        <div style="background:#FFF5F0;border:2px solid #FF4500;border-radius:16px;padding:24px;text-align:center;margin:24px 0">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#FF4500">${otp}</span>
        </div>
        <p style="font-size:13px;color:#9CA3AF">Code expires in 10 minutes.</p>
    </div>`;

/**
 * Send OTP email via Brevo HTTP API (no SMTP ports needed — works on Render)
 */
exports.sendVerificationEmail = async (email, otp, name) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.log('⚠️ BREVO_API_KEY not set — OTP:', otp, 'for', email);
        return false;
    }

    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: 'TravelAI', email: process.env.EMAIL_FROM || 'travelfypai@gmail.com' },
            to: [{ email }],
            subject: `${otp} is your TravelAI verification code`,
            htmlContent: getHtml(otp, name),
        }, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 8000,
        });
        console.log('✅ Email sent to', email, 'via Brevo API');
        return true;
    } catch (error) {
        console.log('❌ Brevo API failed:', error.response?.data?.message || error.message);
        console.log('📧 FALLBACK — OTP for', email, 'is:', otp);
        return false;
    }
};

exports.generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));
