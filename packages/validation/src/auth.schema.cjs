const { z } = require('zod');

const authorizationRoleSchema = z.enum(['admin', 'moderator', 'user']);
const accountVisibilitySchema = z.enum(['public', 'private']);
const internalScopeGrantSchema = z.object({
  scopes: z.array(z.string().min(1)).min(1),
  serviceName: z.string().min(2),
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(60),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

const resendVerificationSchema = z.object({
  email: z.string().email(),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

const updateRoleSchema = z.object({
  role: authorizationRoleSchema,
});

const updateAccountVisibilitySchema = z.object({
  visibility: accountVisibilitySchema,
});

module.exports = {
  accountVisibilitySchema,
  authorizationRoleSchema,
  internalScopeGrantSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  refreshSchema,
  resendVerificationSchema,
  signInSchema,
  signUpSchema,
  updateAccountVisibilitySchema,
  updateRoleSchema,
  verifyEmailSchema,
};
