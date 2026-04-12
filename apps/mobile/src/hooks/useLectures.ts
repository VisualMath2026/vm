import { useCallback, useEffect, useState } from "react";
import { checkHealth, fetchLectures } from "../api/client";
import type { Lecture } from "../types/lecture";

export function useLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsReloading, setSettingsReloading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthText, setHealthText] = useState("unknown");
  const [error, setError] = useState<string | null>(null);

  const loadLectures = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchLectures();
      setLectures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lectures");
    }
  }, []);

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

      const health = await checkHealth();
      setHealthText(health.status);

      await loadLectures();
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
