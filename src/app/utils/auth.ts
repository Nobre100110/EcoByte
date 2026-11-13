export const buildSupabaseRedirectUrl = (path: string = "/dashboard") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "http://localhost:5173";

  return new URL(normalizedPath, origin).toString();
};

export const getSupabaseRecoverySession = () => {
  if (typeof window === "undefined") {
    return { accessToken: "", refreshToken: "", recoveryType: "" };
  }

  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, ""),
  );

  return {
    accessToken: hashParams.get("access_token") ?? "",
    refreshToken: hashParams.get("refresh_token") ?? "",
    recoveryType: hashParams.get("type") ?? "",
  };
};
