import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { SectionCard } from "../components/ui/SectionCard";
import type { AppTheme } from "../theme";

type SolverMode = "linear" | "quadratic" | "system";

type SolverScreenProps = {
  theme: AppTheme;
  onBack: () => void;
};

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

export function SolverScreen({ theme, onBack }: SolverScreenProps) {
  const styles = createStyles(theme);

  const [mode, setMode] = useState<SolverMode>("linear");

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  const [e, setE] = useState("");
  const [f, setF] = useState("");

  const [resultTitle, setResultTitle] = useState("Результат появится после нажатия на кнопку.");
  const [steps, setSteps] = useState<string[]>([]);

  const modeTitle = useMemo(() => {
    if (mode === "linear") {
      return "Линейное уравнение";
    }

    if (mode === "quadratic") {
      return "Квадратное уравнение";
    }

    return "Система 2x2";
  }, [mode]);

  const modeFormula = useMemo(() => {
    if (mode === "linear") {
      return "ax + b = 0";
    }

    if (mode === "quadratic") {
      return "ax² + bx + c = 0";
    }

    return "ax + by = c,  dx + ey = f";
  }, [mode]);

  const modeExample = useMemo(() => {
    if (mode === "linear") {
      return "Пример: 2x + 6 = 0";
    }

    if (mode === "quadratic") {
      return "Пример: x² - 5x + 6 = 0";
    }

    return "Пример: 2x + y = 5,  x - y = 1";
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
        setResultTitle("Бесконечно много решений.");
        setSteps(["0x + 0 = 0", "Любое число подходит."]);
        return;
      }

      setResultTitle("Решений нет.");
      setSteps([
        `0x + ${formatNumber(bv)} = 0`,
        "Нельзя получить ноль из ненулевой константы."
      ]);
      return;
    }

    const x = -bv / av;

    setResultTitle(`x = ${formatNumber(x)}`);
    setSteps([
      `${formatNumber(av)}x + ${formatNumber(bv)} = 0`,
      `${formatNumber(av)}x = ${formatNumber(-bv)}`,
      `x = ${formatNumber(-bv)} / ${formatNumber(av)}`,
      `x = ${formatNumber(x)}`
    ]);
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
      setResultTitle("Действительных корней нет.");
      setSteps([
        `D = b² - 4ac = ${formatNumber(bv)}² - 4·${formatNumber(av)}·${formatNumber(cv)}`,
        `D = ${formatNumber(discriminant)}`,
        "Так как D < 0, действительных корней нет."
      ]);
      return;
    }

    if (discriminant === 0) {
      const x = -bv / (2 * av);

      setResultTitle(`x = ${formatNumber(x)}`);
      setSteps([
        `D = ${formatNumber(discriminant)}`,
        `x = -b / 2a = ${formatNumber(-bv)} / ${formatNumber(2 * av)}`,
        `x = ${formatNumber(x)}`
      ]);
      return;
    }

    const sqrtD = Math.sqrt(discriminant);
    const x1 = (-bv + sqrtD) / (2 * av);
    const x2 = (-bv - sqrtD) / (2 * av);

    setResultTitle(`x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`);
    setSteps([
      `D = ${formatNumber(discriminant)}`,
      `√D = ${formatNumber(sqrtD)}`,
      `x₁ = (-b + √D) / 2a = (${formatNumber(-bv)} + ${formatNumber(sqrtD)}) / ${formatNumber(2 * av)}`,
      `x₁ = ${formatNumber(x1)}`,
      `x₂ = (-b - √D) / 2a = (${formatNumber(-bv)} - ${formatNumber(sqrtD)}) / ${formatNumber(2 * av)}`,
      `x₂ = ${formatNumber(x2)}`
    ]);
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
      setResultTitle("Система не имеет единственного решения.");
      setSteps([
        `Δ = ae - bd = ${formatNumber(av)}·${formatNumber(ev)} - ${formatNumber(bv)}·${formatNumber(dv)}`,
        `Δ = ${formatNumber(determinant)}`,
        "Так как Δ = 0, метод Крамера не даёт единственного решения."
      ]);
      return;
    }

    const dx = cv * ev - bv * fv;
    const dy = av * fv - cv * dv;
    const x = dx / determinant;
    const y = dy / determinant;

    setResultTitle(`x = ${formatNumber(x)}, y = ${formatNumber(y)}`);
    setSteps([
      `Δ = ${formatNumber(determinant)}`,
      `Δx = ce - bf = ${formatNumber(dx)}`,
      `Δy = af - cd = ${formatNumber(dy)}`,
      `x = Δx / Δ = ${formatNumber(dx)} / ${formatNumber(determinant)} = ${formatNumber(x)}`,
      `y = Δy / Δ = ${formatNumber(dy)} / ${formatNumber(determinant)} = ${formatNumber(y)}`
    ]);
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

    solveSystem();
  }

  return (
    <Screen theme={theme}>
      <Text style={styles.title}>Решатель</Text>
      <Text style={styles.subtitle}>Решение уравнений с пошаговым объяснением.</Text>

      <SectionCard title="Как пользоваться" subtitle="Короткая инструкция" theme={theme}>
        <Text style={styles.stepText}>1. Выберите тип задачи.</Text>
        <Text style={styles.stepText}>2. Введите коэффициенты.</Text>
        <Text style={styles.stepText}>3. Нажмите «Решить».</Text>
        <Text style={styles.stepText}>4. Посмотрите ответ и шаги решения.</Text>
      </SectionCard>

      <SectionCard title="Выбор режима" subtitle="Выберите тип задачи" theme={theme}>
        <View style={styles.modeItem}>
          <AppButton
            label="Линейное"
            onPress={() => {
              setMode("linear");
              resetFields();
            }}
            theme={theme}
            variant={mode === "linear" ? undefined : "secondary"}
          />
        </View>

        <View style={styles.modeItem}>
          <AppButton
            label="Квадратное"
            onPress={() => {
              setMode("quadratic");
              resetFields();
            }}
            theme={theme}
            variant={mode === "quadratic" ? undefined : "secondary"}
          />
        </View>

        <View style={styles.modeItem}>
          <AppButton
            label="Система 2x2"
            onPress={() => {
              setMode("system");
              resetFields();
            }}
            theme={theme}
            variant={mode === "system" ? undefined : "secondary"}
          />
        </View>
      </SectionCard>

      <SectionCard title={modeTitle} subtitle="Формула и пример" theme={theme}>
        <Text style={styles.resultTitle}>{modeFormula}</Text>
        <Text style={styles.stepText}>{modeExample}</Text>
      </SectionCard>

      <SectionCard title={modeTitle} subtitle="Введите коэффициенты" theme={theme}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>a</Text>
          <TextInput
            value={a}
            onChangeText={setA}
            style={styles.input}
            placeholder="Введите a"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>b</Text>
          <TextInput
            value={b}
            onChangeText={setB}
            style={styles.input}
            placeholder="Введите b"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>c</Text>
          <TextInput
            value={c}
            onChangeText={setC}
            style={styles.input}
            placeholder="Введите c"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {mode === "system" ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>d</Text>
              <TextInput
                value={d}
                onChangeText={setD}
                style={styles.input}
                placeholder="Введите d"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>e</Text>
              <TextInput
                value={e}
                onChangeText={setE}
                style={styles.input}
                placeholder="Введите e"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>f</Text>
              <TextInput
                value={f}
                onChangeText={setF}
                style={styles.input}
                placeholder="Введите f"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </>
        ) : null}

        <View style={styles.buttonGroup}>
          <AppButton label="Решить" onPress={handleSolve} theme={theme} />
        </View>

        <View style={styles.buttonGroup}>
          <AppButton label="Очистить" onPress={resetFields} theme={theme} variant="secondary" />
        </View>
      </SectionCard>

      <SectionCard title="Ответ" subtitle="Результат вычисления" theme={theme}>
        <Text style={styles.resultTitle}>{resultTitle}</Text>
        {steps.map((step, index) => (
          <Text key={`${step}-${index}`} style={styles.stepText}>
            {index + 1}. {step}
          </Text>
        ))}
      </SectionCard>

      <View style={styles.buttonGroup}>
        <AppButton label="Назад в каталог" onPress={onBack} theme={theme} variant="secondary" />
      </View>
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    title: {
      fontSize: theme.typography.screenTitle,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    subtitle: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg
    },
    modeItem: {
      marginBottom: theme.spacing.sm
    },
    inputGroup: {
      marginBottom: theme.spacing.md
    },
    label: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      fontWeight: "600"
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.input,
      color: theme.colors.text,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body
    },
    buttonGroup: {
      marginTop: theme.spacing.sm
    },
    resultTitle: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      fontWeight: "700",
      marginBottom: theme.spacing.sm
    },
    stepText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    }
  });
}