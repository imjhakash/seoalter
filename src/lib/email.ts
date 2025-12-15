import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (email: string, code: string) => {
    const mailOptions = {
        from: `"SEO Alter Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify your email",
        html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 15 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
};

export const sendAnalysisResultEmail = async (email: string, content: string) => {
    const mailOptions = {
        from: `"SEO Alter Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Analysis is Ready",
        html: `<p>Here is your analysis result:</p><br/>${content}<br/><p>Thank you for using our service.</p>`,
    };

    await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
        from: `"SEO Alter Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your password",
        html: `<p>You requested a password reset.</p><p>Click the link below to reset your password:</p><a href="${resetUrl}">Reset Password</a><p>It expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
};
