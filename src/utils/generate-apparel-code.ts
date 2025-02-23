import crypto from "crypto";

export const generateApparelCode = (name: string): string => {
  const timestamp = Date.now().toString().slice(-5);
  const randomString = crypto.randomBytes(2).toString("hex").toUpperCase();
  const sanitizedName = name.replace(/\s+/g, "").toUpperCase().slice(0, 3);

  return `${sanitizedName}-${timestamp}-${randomString}`;
};

export const generateSizeId = (name: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  const randomString = crypto.randomBytes(2).toString("hex").toUpperCase();
  const sanitizedName = name.replace(/\s+/g, "").toUpperCase().slice(0, 3);

  return `${sanitizedName}-${timestamp}-${randomString}`;
};
