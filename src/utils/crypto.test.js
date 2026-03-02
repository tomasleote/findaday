// Polyfill Web Crypto API for Jest's jsdom environment (Node 18+)
const { webcrypto } = require('crypto');
global.crypto = webcrypto;

const { hashPhrase } = require('../firebase');

describe('hashPhrase', () => {
    it('returns a 64-character lowercase hex string (SHA-256)', async () => {
        const result = await hashPhrase('hello');
        expect(typeof result).toBe('string');
        expect(result).toHaveLength(64);
        expect(result).toMatch(/^[0-9a-f]+$/);
    });

    it('is deterministic — same input always produces same hash', async () => {
        const a = await hashPhrase('vacation-scheduler');
        const b = await hashPhrase('vacation-scheduler');
        expect(a).toBe(b);
    });

    it('produces different hashes for different inputs', async () => {
        const a = await hashPhrase('passphrase-one');
        const b = await hashPhrase('passphrase-two');
        expect(a).not.toBe(b);
    });

    it('produces expected SHA-256 hash for known input', async () => {
        // SHA-256("hello") = well-known value
        const result = await hashPhrase('hello');
        expect(result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });
});
