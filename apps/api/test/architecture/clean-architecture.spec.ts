import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function collectTypeScriptFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTypeScriptFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Clean Architecture boundaries', () => {
  it('keeps domain independent of infrastructure/framework modules', () => {
    const forbiddenImportsInDomain = ['@nestjs/common', 'mongoose', 'ioredis', 'cloudinary'];
    const domainDirectories = [
      path.resolve(__dirname, '../../src/modules/auth/domain'),
      path.resolve(__dirname, '../../src/modules/media/domain'),
      path.resolve(__dirname, '../../src/modules/notifications/domain'),
    ];

    const domainFiles = domainDirectories.flatMap((directory) => collectTypeScriptFiles(directory));

    for (const filePath of domainFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const moduleName of forbiddenImportsInDomain) {
        expect(content.includes(moduleName), `${path.basename(filePath)} imports forbidden module ${moduleName}`).toBe(
          false,
        );
      }
    }
  });
});
