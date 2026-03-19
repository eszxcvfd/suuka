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
  return stripWrappingQuotes(value.trim());
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

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export function loadMailConfig(): MailConfig {
  const webBaseUrl = readRequired('WEB_BASE_URL');
  try {
    new URL(webBaseUrl);
  } catch {
    throw new Error('Invalid URL environment variable: WEB_BASE_URL');
  }

  return {
    fromAddress: readRequired('MAIL_FROM'),
    host: readRequired('MAIL_HOST'),
    password: readRequired('MAIL_PASSWORD'),
    port: readNumber('MAIL_PORT', 587),
    secure: readBoolean('MAIL_SECURE', false),
    user: readRequired('MAIL_USER'),
    webBaseUrl,
  };
}
