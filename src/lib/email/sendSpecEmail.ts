import nodemailer from 'nodemailer';
import { renderSpecEmail } from './renderSpecEmail';
import { agency } from '@/src/brand/agency';
import type { Session } from '../session';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type SendValues = {
  session: Session;
  pdfUrl: string;
  expiresAt: string;
  locale: 'sv' | 'en';
};

export async function sendSpecEmail(args: SendValues) {
  const { subject, html, text } = await renderSpecEmail(args);

  const to = args.session.email;
  if (!to)
    throw new Error('Failed to send email: session has no email address');

  await transporter.sendMail({
    from: process.env.GMAIL_USER!,
    to,
    cc: agency.salesEmail,
    replyTo: agency.salesEmail,
    subject,
    html,
    text,
  });
}
