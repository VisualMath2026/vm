import { getColors, type ThemeMode } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export type { ThemeMode };

export function createAppTheme(mode: ThemeMode) {
  const colors = getColors(mode);

  return {
    mode,
    colors,
    spacing,
    typography,
    radius: {
      xs: 8,
      sm: 12,
      md: 18,
      lg: 24,
      xl: 32,
      pill: 999
    },
    shadow: {
      sm: {
        shadowColor: colors.shadow,
        shadowOpacity: mode === "dark" ? 0.18 : 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2
      },
      md: {
        shadowColor: colors.shadow,
        shadowOpacity: mode === "dark" ? 0.24 : 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5
      },
      lg: {
        shadowColor: colors.shadow,
        shadowOpacity: mode === "dark" ? 0.28 : 0.14,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 14 },
        elevation: 8
      }
    }
  };
}

export type AppTheme = ReturnType<typeof createAppTheme>;
