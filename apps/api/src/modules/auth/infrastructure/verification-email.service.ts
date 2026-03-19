import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { loadMailConfig } from '../../../config/mail.config';

interface VerificationEmailInput {
  displayName: string;
  email: string;
  token: string;
}

@Injectable()
export class VerificationEmailService {
  async sendVerificationEmail(input: VerificationEmailInput): Promise<void> {
    const config = loadMailConfig();
    const transporter = nodemailer.createTransport({
      auth: {
        pass: config.password,
        user: config.user,
      },
      host: config.host,
      port: config.port,
      secure: config.secure,
    });

    const verificationUrl = new URL(config.webBaseUrl);
    verificationUrl.searchParams.set('mode', 'verifyEmail');
    verificationUrl.searchParams.set('token', input.token);

    const recipientName = input.displayName.trim().length > 0 ? input.displayName : input.email;
    const plainText = [
      `Hi ${recipientName},`,
      '',
      'Use the verification token below to confirm your Suuka account:',
      input.token,
      '',
      `Open Suuka here: ${verificationUrl.toString()}`,
      'If the token is not filled in automatically, copy and paste it into the Verify email screen.',
      '',
      'If you did not create this account, you can ignore this email.',
    ].join('\n');

    const html = [
      `<p>Hi ${escapeHtml(recipientName)},</p>`,
      '<p>Use the verification token below to confirm your Suuka account:</p>',
      `<p><strong>${escapeHtml(input.token)}</strong></p>`,
      `<p><a href="${escapeHtml(verificationUrl.toString())}">Open Suuka verification</a></p>`,
      '<p>If the token is not filled in automatically, copy and paste it into the Verify email screen.</p>',
      '<p>If you did not create this account, you can ignore this email.</p>',
    ].join('');

    await transporter.sendMail({
      from: config.fromAddress,
      html,
      subject: 'Verify your Suuka email',
      text: plainText,
      to: input.email,
    });
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
