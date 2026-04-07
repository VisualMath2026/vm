export type ThemeMode = "light" | "dark";

const commonColors = {
  primary: "#375DFB",
  success: "#12B76A",
  danger: "#D92D20",
  warning: "#F79009"
};

export function getColors(mode: ThemeMode) {
  if (mode === "dark") {
    return {
      ...commonColors,
      background: "#0F172A",
      surface: "#111827",
      surfaceMuted: "#1E293B",
      border: "#334155",
      input: "#1E293B",
      text: "#F8FAFC",
      textSecondary: "#CBD5E1"
    };
  }

  return {
    ...commonColors,
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#EEF2FF",
    border: "#E2E8F0",
    input: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#475569"
  };
}
