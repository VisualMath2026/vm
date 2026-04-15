import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import type { AppTheme } from "../theme";

type SolverMode = "linear" | "quadratic" | "system" | "inequality";
type InequalityOperator = ">" | ">=" | "<" | "<=";

type SolverScreenProps = {
  theme: AppTheme;
  onBack: () => void;
};

type SolverHistoryItem = {
  id: string;
  mode: SolverMode;
  expression: string;
  result: string;
  createdAt: string;
};

const SOLVER_HISTORY_KEY = "vm.mobile.solver.history.v1";

function toNumber(value: string): number {
  const normalized = value.replace(",", ".").trim();
  return Number(normalized);
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Number(value.toFixed(4)));
}

function invertOperator(operator: InequalityOperator): InequalityOperator {
  if (operator === ">") {
    return "<";
  }

  if (operator === ">=") {
    return "<=";
  }

  if (operator === "<") {
    return ">";
  }

  return ">=";
}

function checkConstantInequality(value: number, operator: InequalityOperator): boolean {
  if (operator === ">") {
    return value > 0;
  }

  if (operator === ">=") {
    return value >= 0;
  }

  if (operator === "<") {
    return value < 0;
  }

  return value <= 0;
}

function readSolverHistory(): SolverHistoryItem[] {
  try {
    const storage = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;

    if (!storage) {
      return [];
    }

    const raw = storage.getItem(SOLVER_HISTORY_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SolverHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSolverHistory(items: SolverHistoryItem[]) {
  try {
    const storage = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;

    if (!storage) {
      return;
    }

    storage.setItem(SOLVER_HISTORY_KEY, JSON.stringify(items));
  } catch {}
}

export function SolverScreen({ theme, onBack }: SolverScreenProps) {
  const { width } = useWindowDimensions();
  const styles = createStyles(theme, width);

  const [mode, setMode] = useState<SolverMode>("linear");
  const [inequalityOperator, setInequalityOperator] = useState<InequalityOperator>(">");

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  const [e, setE] = useState("");
  const [f, setF] = useState("");

  const [resultTitle, setResultTitle] = useState("Результат появится после нажатия на кнопку.");
  const [steps, setSteps] = useState<string[]>([]);
  const [history, setHistory] = useState<SolverHistoryItem[]>([]);

  useEffect(() => {
    setHistory(readSolverHistory());
  }, []);

  const modeTitle = useMemo(() => {
    if (mode === "linear") {
      return "Линейное уравнение";
    }

    if (mode === "quadratic") {
      return "Квадратное уравнение";
    }

    if (mode === "system") {
      return "Система 2x2";
    }

    return "Линейное неравенство";
  }, [mode]);

  const modeFormula = useMemo(() => {
    if (mode === "linear") {
      return "ax + b = 0";
    }

    if (mode === "quadratic") {
      return "ax² + bx + c = 0";
    }

    if (mode === "system") {
      return "ax + by = c,  dx + ey = f";
    }

    return `ax + b ${inequalityOperator} 0`;
  }, [mode, inequalityOperator]);

  const modeExample = useMemo(() => {
    if (mode === "linear") {
      return "Пример: 2x + 6 = 0";
    }

    if (mode === "quadratic") {
      return "Пример: x² - 5x + 6 = 0";
    }

    if (mode === "system") {
      return "Пример: 2x + y = 5, x - y = 1";
    }

    return "Пример: 2x - 4 > 0";
  }, [mode]);

  function resetFields() {
    setA("");
    setB("");
    setC("");
    setD("");
    setE("");
    setF("");
    setResultTitle("Результат появится после нажатия на кнопку.");
    setSteps([]);
  }

  function saveHistoryItem(expression: string, result: string, itemMode: SolverMode) {
    const nextItem: SolverHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode: itemMode,
      expression,
      result,
      createdAt: new Date().toISOString()
    };

    setHistory((current) => {
      const next = [nextItem, ...current].slice(0, 10);
      writeSolverHistory(next);
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    writeSolverHistory([]);
  }

  function applyHistoryItem(item: SolverHistoryItem) {
    resetFields();

    if (item.mode === "linear" || item.mode === "quadratic" || item.mode === "inequality") {
      const numbers = item.expression.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
      setMode(item.mode);
      setA(numbers[0] ?? "");
      setB(numbers[1] ?? "");
      setC(item.mode === "quadratic" ? numbers[2] ?? "" : "");
      setD("");
      setE("");
      setF("");

      if (item.mode === "inequality") {
        if (item.expression.includes(">=")) {
          setInequalityOperator(">=");
        } else if (item.expression.includes("<=")) {
          setInequalityOperator("<=");
        } else if (item.expression.includes(">")) {
          setInequalityOperator(">");
        } else if (item.expression.includes("<")) {
          setInequalityOperator("<");
        }
      }

      setResultTitle(item.result);
      setSteps([]);
      return;
    }

    const numbers = item.expression.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
    setMode("system");
    setA(numbers[0] ?? "");
    setB(numbers[1] ?? "");
    setC(numbers[2] ?? "");
    setD(numbers[3] ?? "");
    setE(numbers[4] ?? "");
    setF(numbers[5] ?? "");
    setResultTitle(item.result);
    setSteps([]);
  }

  function fillExample() {
    resetFields();

    if (mode === "linear") {
      setA("2");
      setB("6");
      return;
    }

    if (mode === "quadratic") {
      setA("1");
      setB("-5");
      setC("6");
      return;
    }

    if (mode === "system") {
      setA("2");
      setB("1");
      setC("5");
      setD("1");
      setE("-1");
      setF("1");
      return;
    }

    setA("2");
    setB("-4");
    setInequalityOperator(">");
  }

  function solveLinear() {
    const av = toNumber(a);
    const bv = toNumber(b);

    if (Number.isNaN(av) || Number.isNaN(bv)) {
      setResultTitle("Введите корректные коэффициенты a и b.");
      setSteps([]);
      return;
    }

    if (av === 0) {
      if (bv === 0) {
        const result = "Бесконечно много решений.";
        setResultTitle(result);
        setSteps(["0x + 0 = 0", "Любое число подходит."]);
        saveHistoryItem(`${formatNumber(av)}x + ${formatNumber(bv)} = 0`, result, "linear");
        return;
      }

      const result = "Решений нет.";
      setResultTitle(result);
      setSteps([
        `0x + ${formatNumber(bv)} = 0`,
        "Нельзя получить ноль из ненулевой константы."
      ]);
      saveHistoryItem(`${formatNumber(av)}x + ${formatNumber(bv)} = 0`, result, "linear");
      return;
    }

    const x = -bv / av;
    const result = `x = ${formatNumber(x)}`;

    setResultTitle(result);
    setSteps([
      `${formatNumber(av)}x + ${formatNumber(bv)} = 0`,
      `${formatNumber(av)}x = ${formatNumber(-bv)}`,
      `x = ${formatNumber(-bv)} / ${formatNumber(av)}`,
      `x = ${formatNumber(x)}`
    ]);
    saveHistoryItem(`${formatNumber(av)}x + ${formatNumber(bv)} = 0`, result, "linear");
  }

  function solveQuadratic() {
    const av = toNumber(a);
    const bv = toNumber(b);
    const cv = toNumber(c);

    if (Number.isNaN(av) || Number.isNaN(bv) || Number.isNaN(cv)) {
      setResultTitle("Введите корректные коэффициенты a, b и c.");
      setSteps([]);
      return;
    }

    if (av === 0) {
      setResultTitle("Для квадратного уравнения коэффициент a не должен быть равен 0.");
      setSteps([]);
      return;
    }

    const discriminant = bv * bv - 4 * av * cv;

    if (discriminant < 0) {
      const result = "Действительных корней нет.";
      setResultTitle(result);
      setSteps([
        `D = b² - 4ac = ${formatNumber(bv)}² - 4·${formatNumber(av)}·${formatNumber(cv)}`,
        `D = ${formatNumber(discriminant)}`,
        "Так как D < 0, действительных корней нет."
      ]);
      saveHistoryItem(
        `${formatNumber(av)}x² + ${formatNumber(bv)}x + ${formatNumber(cv)} = 0`,
        result,
        "quadratic"
      );
      return;
    }

    if (discriminant === 0) {
      const x = -bv / (2 * av);
      const result = `x = ${formatNumber(x)}`;

      setResultTitle(result);
      setSteps([
        `D = ${formatNumber(discriminant)}`,
        `x = -b / 2a = ${formatNumber(-bv)} / ${formatNumber(2 * av)}`,
        `x = ${formatNumber(x)}`
      ]);
      saveHistoryItem(
        `${formatNumber(av)}x² + ${formatNumber(bv)}x + ${formatNumber(cv)} = 0`,
        result,
        "quadratic"
      );
      return;
    }

    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-bv + sqrtD) / (2 * av);
    const x2 = (-bv - sqrtD) / (2 * av);
    const result = `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`;

    setResultTitle(result);
    setSteps([
      `D = ${formatNumber(discriminant)}`,
      `√D = ${formatNumber(sqrtD)}`,
      `x₁ = (-b + √D) / 2a = (${formatNumber(-bv)} + ${formatNumber(sqrtD)}) / ${formatNumber(2 * av)}`,
      `x₁ = ${formatNumber(x1)}`,
      `x₂ = (-b - √D) / 2a = (${formatNumber(-bv)} - ${formatNumber(sqrtD)}) / ${formatNumber(2 * av)}`,
      `x₂ = ${formatNumber(x2)}`
    ]);
    saveHistoryItem(
      `${formatNumber(av)}x² + ${formatNumber(bv)}x + ${formatNumber(cv)} = 0`,
      result,
      "quadratic"
    );
  }

  function solveSystem() {
    const av = toNumber(a);
    const bv = toNumber(b);
    const cv = toNumber(c);
    const dv = toNumber(d);
    const ev = toNumber(e);
    const fv = toNumber(f);

    if ([av, bv, cv, dv, ev, fv].some(Number.isNaN)) {
      setResultTitle("Введите корректные коэффициенты для системы.");
      setSteps([]);
      return;
    }

    const determinant = av * ev - bv * dv;

    if (determinant === 0) {
      const result = "Система не имеет единственного решения.";
      setResultTitle(result);
      setSteps([
        `Δ = ae - bd = ${formatNumber(av)}·${formatNumber(ev)} - ${formatNumber(bv)}·${formatNumber(dv)}`,
        `Δ = ${formatNumber(determinant)}`,
        "Так как Δ = 0, метод Крамера не даёт единственного решения."
      ]);
      saveHistoryItem(
        `${formatNumber(av)}x + ${formatNumber(bv)}y = ${formatNumber(cv)}; ${formatNumber(dv)}x + ${formatNumber(ev)}y = ${formatNumber(fv)}`,
        result,
        "system"
      );
      return;
    }

    const dx = cv * ev - bv * fv;
    const dy = av * fv - cv * dv;
    const x = dx / determinant;
    const y = dy / determinant;
    const result = `x = ${formatNumber(x)}, y = ${formatNumber(y)}`;

    setResultTitle(result);
    setSteps([
      `Δ = ${formatNumber(determinant)}`,
      `Δx = ce - bf = ${formatNumber(dx)}`,
      `Δy = af - cd = ${formatNumber(dy)}`,
      `x = Δx / Δ = ${formatNumber(dx)} / ${formatNumber(determinant)} = ${formatNumber(x)}`,
      `y = Δy / Δ = ${formatNumber(dy)} / ${formatNumber(determinant)} = ${formatNumber(y)}`
    ]);
    saveHistoryItem(
      `${formatNumber(av)}x + ${formatNumber(bv)}y = ${formatNumber(cv)}; ${formatNumber(dv)}x + ${formatNumber(ev)}y = ${formatNumber(fv)}`,
      result,
      "system"
    );
  }

  function solveInequality() {
    const av = toNumber(a);
    const bv = toNumber(b);

    if (Number.isNaN(av) || Number.isNaN(bv)) {
      setResultTitle("Введите корректные коэффициенты a и b.");
      setSteps([]);
      return;
    }

    if (av === 0) {
      const isTrue = checkConstantInequality(bv, inequalityOperator);

      if (isTrue) {
        const result = "Подходит любое число x.";
        setResultTitle(result);
        setSteps([
          `${formatNumber(bv)} ${inequalityOperator} 0`,
          "Неравенство истинно при любом x."
        ]);
        saveHistoryItem(
          `${formatNumber(av)}x + ${formatNumber(bv)} ${inequalityOperator} 0`,
          result,
          "inequality"
        );
        return;
      }

      const result = "Решений нет.";
      setResultTitle(result);
      setSteps([
        `${formatNumber(bv)} ${inequalityOperator} 0`,
        "Неравенство ложно при любом x."
      ]);
      saveHistoryItem(
        `${formatNumber(av)}x + ${formatNumber(bv)} ${inequalityOperator} 0`,
        result,
        "inequality"
      );
      return;
    }

    const border = -bv / av;
    const finalOperator = av > 0 ? inequalityOperator : invertOperator(inequalityOperator);
    const result = `x ${finalOperator} ${formatNumber(border)}`;

    setResultTitle(result);
    setSteps([
      `${formatNumber(av)}x + ${formatNumber(bv)} ${inequalityOperator} 0`,
      `${formatNumber(av)}x ${inequalityOperator} ${formatNumber(-bv)}`,
      av > 0
        ? `Делим обе части на положительное число ${formatNumber(av)}. Знак не меняется.`
        : `Делим обе части на отрицательное число ${formatNumber(av)}. Знак меняется на противоположный.`,
      `x ${finalOperator} ${formatNumber(border)}`
    ]);
    saveHistoryItem(
      `${formatNumber(av)}x + ${formatNumber(bv)} ${inequalityOperator} 0`,
      result,
      "inequality"
    );
  }

  function handleSolve() {
    if (mode === "linear") {
      solveLinear();
      return;
    }

    if (mode === "quadratic") {
      solveQuadratic();
      return;
    }

    if (mode === "system") {
      solveSystem();
      return;
    }

    solveInequality();
  }

  const allowMinusKeyboard = Platform.OS === "ios" ? "numbers-and-punctuation" : "default";

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Решатель"
        subtitle="Компактный математический помощник с пошаговым объяснением. На Android минус теперь вводится обычной клавиатурой."
      />

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Math tools</Text>
        <Text style={styles.heroTitle}>{modeTitle}</Text>
        <Text style={styles.heroFormula}>{modeFormula}</Text>
        <Text style={styles.heroText}>{modeExample}</Text>

        <View style={styles.heroActions}>
          <AppButton label="Подставить пример" onPress={fillExample} theme={theme} variant="secondary" fullWidth={false} />
          <AppButton label="Очистить" onPress={resetFields} theme={theme} variant="ghost" fullWidth={false} />
        </View>
      </View>

      <SectionCard title="Режим" subtitle="Выбери тип задачи" theme={theme}>
        <View style={styles.modeGrid}>
          <ModeChip
            theme={theme}
            label="Линейное"
            isActive={mode === "linear"}
            onPress={() => {
              setMode("linear");
              resetFields();
            }}
          />
          <ModeChip
            theme={theme}
            label="Квадратное"
            isActive={mode === "quadratic"}
            onPress={() => {
              setMode("quadratic");
              resetFields();
            }}
          />
          <ModeChip
            theme={theme}
            label="Система 2x2"
            isActive={mode === "system"}
            onPress={() => {
              setMode("system");
              resetFields();
            }}
          />
          <ModeChip
            theme={theme}
            label="Неравенство"
            isActive={mode === "inequality"}
            onPress={() => {
              setMode("inequality");
              resetFields();
            }}
          />
        </View>
      </SectionCard>

      {mode === "inequality" ? (
        <SectionCard title="Знак неравенства" subtitle="Выбери знак" theme={theme}>
          <View style={styles.modeGrid}>
            <ModeChip theme={theme} label=">" isActive={inequalityOperator === ">"} onPress={() => setInequalityOperator(">")} />
            <ModeChip theme={theme} label=">=" isActive={inequalityOperator === ">="} onPress={() => setInequalityOperator(">=")} />
            <ModeChip theme={theme} label="<" isActive={inequalityOperator === "<"} onPress={() => setInequalityOperator("<")} />
            <ModeChip theme={theme} label="<=" isActive={inequalityOperator === "<="} onPress={() => setInequalityOperator("<=")} />
          </View>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Коэффициенты"
        subtitle="Можно вводить отрицательные числа, например -5 или -1.5."
        theme={theme}
      >
        <View style={styles.inputGrid}>
          <CoefficientInput theme={theme} label="a" value={a} onChangeText={setA} keyboardType={allowMinusKeyboard} />
          <CoefficientInput theme={theme} label="b" value={b} onChangeText={setB} keyboardType={allowMinusKeyboard} />
          {(mode === "quadratic" || mode === "system") ? (
            <CoefficientInput theme={theme} label="c" value={c} onChangeText={setC} keyboardType={allowMinusKeyboard} />
          ) : null}
          {mode === "system" ? (
            <>
              <CoefficientInput theme={theme} label="d" value={d} onChangeText={setD} keyboardType={allowMinusKeyboard} />
              <CoefficientInput theme={theme} label="e" value={e} onChangeText={setE} keyboardType={allowMinusKeyboard} />
              <CoefficientInput theme={theme} label="f" value={f} onChangeText={setF} keyboardType={allowMinusKeyboard} />
            </>
          ) : null}
        </View>

        <View style={styles.solveButtonWrap}>
          <AppButton label="Решить" onPress={handleSolve} theme={theme} />
        </View>
      </SectionCard>

      <SectionCard title="Ответ" subtitle="Результат и шаги решения" theme={theme}>
        <Text style={styles.resultTitle}>{resultTitle}</Text>
        {steps.map((step, index) => (
          <Text key={`${step}-${index}`} style={styles.stepText}>
            {index + 1}. {step}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="История решений" subtitle="Последние 10 вычислений" theme={theme}>
        {history.length === 0 ? (
          <Text style={styles.stepText}>История пока пуста.</Text>
        ) : (
          <>
            {history.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => applyHistoryItem(item)}
                style={styles.historyItem}
              >
                <Text style={styles.historyExpression}>{item.expression}</Text>
                <Text style={styles.historyResult}>{item.result}</Text>
                <Text style={styles.historyMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
              </Pressable>
            ))}

            <View style={styles.solveButtonWrap}>
              <AppButton
                label="Очистить историю"
                onPress={clearHistory}
                theme={theme}
                variant="secondary"
              />
            </View>
          </>
        )}
      </SectionCard>

      <AppButton label="Назад в каталог" onPress={onBack} theme={theme} variant="secondary" />
    </Screen>
  );
}

type ModeChipProps = {
  theme: AppTheme;
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function ModeChip({ theme, label, isActive, onPress }: ModeChipProps) {
  const styles = createModeChipStyles(theme, isActive);

  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function createModeChipStyles(theme: AppTheme, isActive: boolean) {
  return StyleSheet.create({
    chip: {
      flexBasis: 140,
      flexGrow: 1,
      minHeight: 44,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: isActive ? theme.colors.primary : theme.colors.border,
      backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs
    },
    label: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: isActive ? theme.colors.primary : theme.colors.text
    }
  });
}

type CoefficientInputProps = {
  theme: AppTheme;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType: "default" | "numbers-and-punctuation";
};

function CoefficientInput({
  theme,
  label,
  value,
  onChangeText,
  keyboardType
}: CoefficientInputProps) {
  const styles = createInputStyles(theme);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholder={`Например: -2`}
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType={keyboardType}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

function createInputStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrapper: {
      flexBasis: 130,
      flexGrow: 1,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.sm
    },
    label: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      fontWeight: "700"
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.input,
      color: theme.colors.text,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.body
    }
  });
}

function createStyles(theme: AppTheme, width: number) {
  const isPhone = width < 520;

  return StyleSheet.create({
    heroCard: {
      borderRadius: theme.radius.lg,
      padding: isPhone ? theme.spacing.lg : theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
      ...theme.shadow.md
    },
    heroEyebrow: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textTransform: "uppercase"
    },
    heroTitle: {
      fontSize: isPhone ? 24 : theme.typography.title,
      lineHeight: isPhone ? 30 : theme.typography.title + 4,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    heroFormula: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    heroText: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md
    },
    heroActions: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    modeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginRight: -theme.spacing.xs
    },
    inputGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginRight: -theme.spacing.xs
    },
    solveButtonWrap: {
      marginTop: theme.spacing.sm
    },
    resultTitle: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.text,
      fontWeight: "800",
      marginBottom: theme.spacing.sm
    },
    stepText: {
      fontSize: theme.typography.body,
      lineHeight: 22,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    historyItem: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceMuted
    },
    historyExpression: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      fontWeight: "800",
      marginBottom: theme.spacing.xs
    },
    historyResult: {
      fontSize: theme.typography.body,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
      fontWeight: "700"
    },
    historyMeta: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary
    }
  });
}
