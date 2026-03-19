import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { loadMailConfig } from '../../../config/mail.config';

interface VerificationEmailInput {
  displayName: string;
  email: string;
  token: string;
}

export interface MailConnectivityResult {
  checkedAt: string;
  ok: boolean;
  requestId: string;
  status: 'reachable' | 'unreachable';
  failureClass?: 'auth' | 'network' | 'timeout' | 'unknown';
}

@Injectable()
export class VerificationEmailService {
  private transporter: Mail | null = null;

  async verifyConnectivity(requestId: string): Promise<MailConnectivityResult> {
    const checkedAt = new Date().toISOString();

    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      return {
        checkedAt,
        ok: true,
        requestId,
        status: 'reachable',
      };
    } catch (error) {
      const failureClass = classifyMailConnectivityFailure(error);
      console.error(`[MAIL CHECK] ${requestId}`, {
        checkedAt,
        failureClass,
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        checkedAt,
        failureClass,
        ok: false,
        requestId,
        status: 'unreachable',
      };
    }
  }

  async sendVerificationEmail(input: VerificationEmailInput): Promise<void> {
    const config = loadMailConfig();
    const transporter = this.getTransporter();

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

    await this.sendWithRetry(
      async () =>
        transporter.sendMail({
          from: config.fromAddress,
          html,
          subject: 'Verify your Suuka email',
          text: plainText,
          to: input.email,
        }),
      input.email,
    );
  }

  private getTransporter(): Mail {
    if (this.transporter) {
      return this.transporter;
    }

    const config = loadMailConfig();
    this.transporter = nodemailer.createTransport({
      auth: {
        pass: config.password,
        user: config.user,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      host: config.host,
      pool: true,
      maxConnections: 1,
      maxMessages: 20,
      port: config.port,
      requireTLS: !config.secure,
      secure: config.secure,
      socketTimeout: 20000,
      tls: {
        minVersion: 'TLSv1.2',
        servername: config.host,
      },
    });

    return this.transporter;
  }

  private async sendWithRetry(operation: () => Promise<unknown>, recipient: string): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        await operation();
        return;
      } catch (error) {
        lastError = error;
        const failureClass = classifyMailConnectivityFailure(error);

        console.error('[MAIL SEND]', {
          attempt,
          failureClass,
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'UnknownError',
          recipientDomain: recipient.split('@')[1] ?? 'unknown',
        });

        if (attempt === 2 || (failureClass !== 'network' && failureClass !== 'timeout')) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 750));
      }
    }

    throw lastError;
  }
}

function classifyMailConnectivityFailure(
  error: unknown,
): 'auth' | 'network' | 'timeout' | 'unknown' {
  if (!(error instanceof Error)) {
    return 'unknown';
  }

  const code = ((error as Error & { code?: string }).code ?? '').toUpperCase();
  const message = error.message.toLowerCase();

  if (
    code === 'EAUTH' ||
    message.includes('invalid login') ||
    message.includes('username and password not accepted')
  ) {
    return 'auth';
  }

  if (code === 'ETIMEDOUT' || code === 'ESOCKET' || message.includes('timed out')) {
    return 'timeout';
  }

  if (
    code === 'ENOTFOUND' ||
    code === 'ECONNECTION' ||
    code === 'ECONNREFUSED' ||
    code === 'EHOSTUNREACH' ||
    code === 'ENETUNREACH'
  ) {
    return 'network';
  }

  return 'unknown';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
