import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,    
  },
});

export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]) => {
  await transporter.sendMail({
    from: 'MKD Cinemas <no-reply@mkdcinemas.lk>',
    to,
    subject,
    html, 
    attachments, 
  });
};

    