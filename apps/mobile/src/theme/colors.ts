export type ThemeMode = "light" | "dark";

const commonColors = {
  primary: "#315EFB",
  success: "#12B76A",
  danger: "#D92D20",
  warning: "#F79009"
};

export function getColors(mode: ThemeMode) {
  if (mode === "dark") {
    return {
      ...commonColors,
      background: "#0B1220",
      surface: "#101828",
      surfaceMuted: "#172033",
      surfaceElevated: "#1C2740",
      border: "#243041",
      input: "#111B2E",
      text: "#F8FAFC",
      textSecondary: "#98A2B3",
      shadow: "#000000",
      overlay: "rgba(2, 6, 23, 0.72)"
    };
  }

  return {
    ...commonColors,
    background: "#F5F7FB",
    surface: "#FFFFFF",
    surfaceMuted: "#F2F5FB",
    surfaceElevated: "#FCFDFF",
    border: "#E4E7EC",
    input: "#FCFDFF",
    text: "#101828",
    textSecondary: "#667085",
    shadow: "#101828",
    overlay: "rgba(15, 23, 42, 0.18)"
  };
}
