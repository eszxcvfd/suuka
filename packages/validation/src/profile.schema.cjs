const { z } = require('zod');
const { accountVisibilitySchema } = require('./auth.schema.cjs');

const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-zA-Z0-9_]+$/, 'Username may contain only letters, numbers, and underscores');

const httpsUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith('https://'), {
    message: 'External links must use https:// URLs',
  });

const profileExternalLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(40),
  url: httpsUrlSchema,
});

const updateProfileSchema = z
  .object({
    accountVisibility: accountVisibilitySchema.optional(),
    bio: z.string().trim().max(160).optional(),
    displayName: z.string().trim().min(2).max(60).optional(),
    externalLinks: z.array(profileExternalLinkSchema).max(5).optional(),
    username: usernameSchema.optional(),
  })
  .strict();

const updateAvatarSchema = z
  .object({
    mediaId: z.string().min(1).nullable(),
  })
  .strict();

const profileViewSchema = z.object({
  accountId: z.string().min(1),
  accountVisibility: accountVisibilitySchema,
  avatarUrl: z.string().url().nullable(),
  bio: z.string().max(160),
  displayName: z.string().min(2).max(60),
  externalLinks: z.array(profileExternalLinkSchema),
  username: usernameSchema.optional(),
});

module.exports = {
  profileExternalLinkSchema,
  profileViewSchema,
  updateAvatarSchema,
  updateProfileSchema,
};
