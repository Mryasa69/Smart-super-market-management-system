export const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  import.meta.env.VITE_GOOGLE_ID ??
  '';
export const isGoogleAuthConfigured = Boolean(googleClientId);
