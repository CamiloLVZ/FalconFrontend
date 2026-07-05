import type { AuthUser, JWTPayload } from "../types/auth";

const extractRawToken = (token: string): string => {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    throw new Error("Token is empty");
  }

  return trimmedToken.startsWith("Bearer ")
    ? trimmedToken.slice(7)
    : trimmedToken;
};

const base64UrlDecode = (value: string): string => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");

  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return decodeURIComponent(
    atob(padded)
      .split("")
      .map(
        (character) =>
          `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`,
      )
      .join(""),
  );
};

const parseJWTPayload = (token: string): JWTPayload => {
  const rawToken = extractRawToken(token);

  const segments = rawToken.split(".");

  if (segments.length !== 3) {
    throw new Error("Invalid JWT token format");
  }

  const payload = segments[1];

  const decodedPayload = base64UrlDecode(payload);

  return JSON.parse(decodedPayload) as JWTPayload;
};

export const decodeJWT = (token: string): AuthUser => {
  const payload = parseJWTPayload(token);

  return {
    id: Number(payload.sub),
    email: payload.email,
    roles: Array.isArray(payload.roles) ? payload.roles : [],
  };
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJWTPayload(token);

    return (
      typeof payload.exp !== "number" ||
      Math.floor(Date.now() / 1000) >= payload.exp
    );
  } catch {
    return true;
  }
};
