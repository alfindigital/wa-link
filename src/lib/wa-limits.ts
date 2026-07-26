/** Shared validation limits for phone, messages, and history I/O. */
export const MAX_MESSAGE = 1000;
export const MAX_LABEL = 40;
export const MAX_HISTORY_ID = 80;
export const MAX_HISTORY_ITEMS = 100;
/** Reject oversized import files before parsing (512 KiB). */
export const MAX_IMPORT_BYTES = 512 * 1024;
/** Local digits after stripping 0/62 (Indonesian mobile). */
export const MIN_PHONE_DIGITS = 6;
export const MAX_PHONE_DIGITS = 14;
