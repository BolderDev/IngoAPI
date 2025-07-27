const crypto = require('crypto');

const HASH_ALGO = 'sha256';           // Secure hash algorithm
const SALT_LENGTH = 16;               // 128-bit salt
const ITERATIONS = 100_000;           // Cost factor
const KEY_LENGTH = 64;                // 512-bit derived key

function generateSalt(length = SALT_LENGTH) {
    return crypto.randomBytes(length).toString('hex');
}

function hash(password, salt = generateSalt()) {
    const hashBuffer = crypto.pbkdf2Sync(
        password,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        HASH_ALGO
    );
    return {
        salt,
        hash: hashBuffer.toString('hex')
    };
}

function verify(password, hashed, salt) {
    const reHashed = hash(password, salt);
    return reHashed.hash === hashed;
}

module.exports = {
    hash,
    verify
};