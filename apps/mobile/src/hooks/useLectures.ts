import { useCallback, useEffect, useMemo, useState } from "react";
import { CatalogService, HttpClient, MemoryTokenStorage } from "@vm/integration";
import type { LectureSummary } from "@vm/shared";
import { API_BASE_URL } from "../api/endpoints";

export function useLectures() {
  const [lectures, setLectures] = useState<LectureSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsReloading, setSettingsReloading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthText, setHealthText] = useState("unknown");
  const [error, setError] = useState<string | null>(null);

  const catalogService = useMemo(() => {
    const tokenStorage = new MemoryTokenStorage();

    const http = new HttpClient(
      {
        baseUrl: API_BASE_URL,
        timeoutMs: 10000,
        maxRetries: 2,
      },
      {
        getAccessToken: () => tokenStorage.get().then((tokens) => tokens?.accessToken ?? null),
      },
    );

    return new CatalogService(http);
  }, []);

  const loadLectures = useCallback(async () => {
    try {
      setError(null);
      const data = await catalogService.listLectures();
      setLectures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lectures");
    }
  }, [catalogService]);

  useEffect(() => {
    loadLectures().finally(() => setLoading(false));
  }, [loadLectures]);

  const refreshLectures = useCallback(async () => {
    setRefreshing(true);
    await loadLectures();
    setRefreshing(false);
  }, [loadLectures]);

  const refreshFromSettings = useCallback(async () => {
    try {
      setSettingsReloading(true);
      setHealthLoading(true);
      await loadLectures();
      setHealthText("ok");
      return true;
    } catch {
      setHealthText("offline");
      return false;
    } finally {
      setHealthLoading(false);
      setSettingsReloading(false);
    }
  }, [loadLectures]);

  return {
    lectures,
    loading,
    refreshing,
    settingsReloading,
    healthLoading,
    healthText,
    error,
    refreshLectures,
    refreshFromSettings,
  };
}
