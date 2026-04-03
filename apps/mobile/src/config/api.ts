const envBaseUrl = process.env.EXPO_PUBLIC_VM_API_BASE_URL?.trim();

export const API_BASE_URL = envBaseUrl || "http://127.0.0.1:8787";
export const WS_BASE_URL = API_BASE_URL.replace(/^http/i, "ws");
