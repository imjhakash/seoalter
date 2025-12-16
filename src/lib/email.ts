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

import { getDictionary } from './get-dictionary';

export const sendVerificationEmail = async (email: string, code: string, lang: 'en' | 'nl' | 'it' = 'en') => {
    const dict = await getDictionary(lang);
    const mailOptions = {
        from: `"SEO Alter Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: dict.emails.verification.subject,
        html: dict.emails.verification.body.replace('{code}', code),
    };

    await transporter.sendMail(mailOptions);
};

export const sendAnalysisResultEmail = async (email: string, content: string, lang: 'en' | 'nl' | 'it' = 'en') => {
    const dict = await getDictionary(lang);
    const mailOptions = {
        from: `"SEO Alter Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: dict.emails.analysis.subject,
        html: dict.emails.analysis.body.replace('{content}', content),
    };

    await transporter.sendMail(mailOptions);
};


export const sendPasswordResetEmail = async (email: string, token: string, lang: 'en' | 'nl' | 'it' = 'en') => {
    const dict = await getDictionary(lang);
    // Correctly resolve the Base URL for Vercel or Localhost
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
        if (process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`;
        } else {
            baseUrl = 'http://localhost:3000';
        }
    }

    console.log("Resolved Base URL for Email:", baseUrl); // Debug log

    // Use lang in the reset URL so the page opens in correct lang
    const resetUrl = `${baseUrl}/${lang}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
        from: `"SEO Alter Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: dict.emails.reset.subject,
        html: dict.emails.reset.body.replace('{url}', resetUrl),
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Setup Base URL:", baseUrl);
        console.error("Failed to send reset email:", error);
        throw error; // Re-throw to be handled by caller
    }
};

