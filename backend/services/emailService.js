const nodemailer = require('nodemailer');

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
 * Send OTP email via Gmail SMTP with OAuth2 transport
 * Uses nodemailer with Gmail — works locally, may timeout on some hosts
 * Non-blocking: caller should NOT await this
 */
exports.sendVerificationEmail = async (email, otp, name) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️ Email not configured — OTP:', otp, 'for', email);
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000,
        });

        await transporter.sendMail({
            from: `"TravelAI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `${otp} is your TravelAI verification code`,
            html: getHtml(otp, name),
        });
        console.log('✅ Email sent to', email);
        return true;
    } catch (error) {
        console.log('❌ SMTP failed:', error.message);
        // Log OTP to console as fallback so user can still verify
        console.log('📧 FALLBACK — OTP for', email, 'is:', otp);
        return false;
    }
};

exports.generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));
