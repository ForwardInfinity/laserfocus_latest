const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// Constants
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB
const ZIP_NAME = 'laserfocus.zip';

describe('Package size limit', () => {
  test(`bundle (${ZIP_NAME}) must be ≤ 200 MB`, () => {
    // Ensure a fresh build is produced before measuring
    execSync('npm run build', { stdio: 'inherit' });

    const zipPath = path.join(process.cwd(), ZIP_NAME);
    expect(fs.existsSync(zipPath)).toBe(true);

    const { size } = fs.statSync(zipPath);
    expect(size).toBeLessThanOrEqual(MAX_BYTES);
  });
}); 