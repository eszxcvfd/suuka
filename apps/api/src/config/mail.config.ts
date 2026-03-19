export interface MailConfig {
  fromAddress: string;
  host: string;
  password: string;
  port: number;
  secure: boolean;
  user: string;
  webBaseUrl: string;
}

function readRequired(key: string): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function readNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric environment variable: ${key}`);
  }

  return parsed;
}

function readBoolean(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }

  return raw.toLowerCase() === 'true';
}

export function loadMailConfig(): MailConfig {
  return {
    fromAddress: readRequired('MAIL_FROM'),
    host: readRequired('MAIL_HOST'),
    password: readRequired('MAIL_PASSWORD'),
    port: readNumber('MAIL_PORT', 587),
    secure: readBoolean('MAIL_SECURE', false),
    user: readRequired('MAIL_USER'),
    webBaseUrl: readRequired('WEB_BASE_URL'),
  };
}
