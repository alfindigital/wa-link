export const SITE_URL =
  (typeof process !== "undefined" && process.env?.SITE_URL) ||
  (typeof import.meta !== "undefined" && (import.meta.env?.VITE_SITE_URL as string | undefined)) ||
  "http://localhost:3000";
export const OG_IMAGE_PATH = "/og-image.jpg";
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;

