import { getColors, type ThemeMode } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export type { ThemeMode };

export function createAppTheme(mode: ThemeMode) {
  return {
    mode,
    colors: getColors(mode),
    spacing,
    typography,
    radius: {
      sm: 10,
      md: 16,
      lg: 24,
      pill: 999
    }
  };
}

export type AppTheme = ReturnType<typeof createAppTheme>;
