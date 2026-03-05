export interface ShopSettings {
  shopName: string;
  /** Pure base64 string (no "data:" prefix) */
  logoBase64: string | null;
  logoMimeType: string | null;
  updatedAt: string;
}
