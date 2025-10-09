import { getIdToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function api(path: string, init: RequestInit = {}) {
    const token = await getIdToken();
    const headers = new Headers(init.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");
    const response = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers,
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    return response.json();
}