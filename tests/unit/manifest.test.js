const fs = require('node:fs/promises');
const path = require('node:path');

/**
 * Unit tests for Chrome Manifest compliance (FR-016 / REQ-016).
 * The test intentionally fails until manifest.json includes all required permissions.
 */

describe('manifest.json compliance', () => {
  let manifest;
  beforeAll(async () => {
    const file = await fs.readFile(path.join(process.cwd(), 'manifest.base.json'), 'utf8');
    manifest = JSON.parse(file);
  });

  it('uses Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('declares required permissions', () => {
    const required = ['storage', 'declarativeNetRequest', 'tabs', 'scripting'];
    required.forEach((perm) => {
      expect(manifest.permissions).toContain(perm);
    });
  });

  it('includes <all_urls> in host_permissions', () => {
    expect(manifest.host_permissions).toContain('<all_urls>');
  });

  it('defines options_page', () => {
    expect(manifest.options_page).toBe('src/options/options.html');
  });

  it('defines declarative_net_request rule resource', () => {
    const ruleResources = manifest.declarative_net_request?.rule_resources;
    expect(Array.isArray(ruleResources)).toBe(true);
    const defaultRule = ruleResources.find((r) => r.id === 'default');
    expect(defaultRule).toMatchObject({
      id: 'default',
      path: 'dnr_rules.json',
      enabled: true,
    });
  });
}); 