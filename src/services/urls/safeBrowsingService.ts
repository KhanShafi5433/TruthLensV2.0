export interface SafeBrowsingMatch {
  threatType: string;
  platformType?: string;
  threat?: { url?: string };
}

export async function checkSafeBrowsing(urls: string[]): Promise<SafeBrowsingMatch[]> {
  const endpoint = import.meta.env.VITE_SAFE_BROWSING_PROXY_URL as string | undefined;
  if (!endpoint || urls.length === 0) return [];

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) return [];
    const data = (await response.json()) as { matches?: SafeBrowsingMatch[] };
    return data.matches ?? [];
  } catch (error) {
    console.warn("[SafeBrowsing] optional check failed, using local URL heuristics.", error);
    return [];
  }
}
