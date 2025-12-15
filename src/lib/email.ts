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
