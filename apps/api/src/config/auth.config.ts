export interface AuthConfig {
  accessTokenExpiresIn: string;
  accessTokenSecret: string;
  bcryptRounds: number;
  internalScopeAudience: string;
  refreshTokenExpiresIn: string;
  refreshTokenSecret: string;
  requireVerifiedEmail: boolean;
  servicePrincipalSecret: string;
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

export function loadAuthConfig(): AuthConfig {
  return {
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    accessTokenSecret: readRequired('JWT_ACCESS_SECRET'),
    bcryptRounds: readNumber('AUTH_BCRYPT_ROUNDS', 12),
    internalScopeAudience: process.env.AUTH_INTERNAL_SCOPE_AUDIENCE ?? 'internal-services',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
    refreshTokenSecret: readRequired('JWT_REFRESH_SECRET'),
    requireVerifiedEmail: readBoolean('AUTH_REQUIRE_VERIFIED_EMAIL', true),
    servicePrincipalSecret:
      process.env.AUTH_SERVICE_PRINCIPAL_SECRET ?? readRequired('JWT_ACCESS_SECRET'),
  };
}
