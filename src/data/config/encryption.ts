import crypto from "crypto";
import dotenv from "dotenv";
import { ENCRYPTION_KEY } from "../../utils/config";

/**
 * The purpose of this module is to serve as an encryption service for the data stored in the json file.
 * This file contains functions to encrypt and decrypt the data using the 'aes-256-gcm' algorithm.
 */

dotenv.config();

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = ENCRYPTION_KEY
  ? Buffer.from(ENCRYPTION_KEY, "base64")
  : "rkBLTES3DispmABQFhQouX9C3TE5ufOhA5Gj4l";
const IV_LENGTH = 12;

export function encryptData(data: any): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);

  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return JSON.stringify({ iv: iv.toString("hex"), encrypted, authTag });
}

export function decryptData(encryptedData: string): any {
  const { iv, encrypted, authTag } = JSON.parse(encryptedData);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY),
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}
