export type DemoSession = {
  mode: "demo";
  shownRecommendationIds?: string[];
};

export type SpotifySession = {
  mode: "spotify";
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  shownRecommendationIds?: string[];
};

export type AppSession = DemoSession | SpotifySession;

export type OAuthState = {
  state: string;
  codeVerifier: string;
  createdAt: number;
};

export const SESSION_COOKIE_NAME = "adc_session";
export const OAUTH_COOKIE_NAME = "adc_oauth";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function deriveEncryptionKey(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));

  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptCookieValue(payload: unknown, secret: string) {
  const key = await deriveEncryptionKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoder.encode(JSON.stringify(payload)),
  );

  return `${base64UrlEncode(iv)}.${base64UrlEncode(new Uint8Array(encrypted))}`;
}

export async function decryptCookieValue<T>(value: string | undefined, secret: string) {
  if (!value) {
    return null;
  }

  const [ivPart, encryptedPart] = value.split(".");

  if (!ivPart || !encryptedPart) {
    return null;
  }

  try {
    const key = await deriveEncryptionKey(secret);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64UrlDecode(ivPart),
      },
      key,
      base64UrlDecode(encryptedPart),
    );

    return JSON.parse(decoder.decode(decrypted)) as T;
  } catch {
    return null;
  }
}
