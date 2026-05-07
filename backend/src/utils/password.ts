import crypto from "node:crypto";

const HASH_ITERATIONS = 100_000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = "sha512";

const hashPassword = async (plainPassword: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(plainPassword, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });

  return `${HASH_DIGEST}$${HASH_ITERATIONS}$${salt}$${derivedKey.toString("hex")}`;
};

export { hashPassword };
