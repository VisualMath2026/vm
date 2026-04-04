import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/ui/AppButton";
import { ErrorState } from "../components/ui/ErrorState";
import { OfflineState } from "../components/ui/OfflineState";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { LectureItem } from "../mocks/lectures";
import type { SessionData } from "../mocks/session";
import type { AppTheme } from "../theme";

type SessionScreenProps = {
  theme: AppTheme;
  lecture: LectureItem;
  session: SessionData;
  isOffline?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onBack: () => void;
  onOpenTask: () => void;
};

export function SessionScreen({
  theme,
  lecture,
  session,
  isOffline = false,
  hasError = false,
  onRetry,
  onBack,
  onOpenTask
}: SessionScreenProps) {
  const styles = createStyles(theme);

  const currentBlockIndex = lecture.blocks.findIndex(
    (block) => block.toLowerCase() === session.currentBlockTitle.toLowerCase()
  );

  const blockKind = getBlockKind(session.currentBlockTitle);
  const timeLimitSec = session.questions[0]?.timeLimitSec ?? 0;
  const totalPoints = session.questions.reduce((sum, question) => sum + question.points, 0);

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title={lecture.title}
        subtitle="Активная сессия занятия"
        rightSlot={
          <View style={styles.metaRow}>
            <StatusPill
              theme={theme}
              label={session.connectionStatus === "online" ? "Online" : "Offline"}
              tone={session.connectionStatus === "online" ? "success" : "warning"}
            />
            <StatusPill
              theme={theme}
              label={session.status === "active" ? "Идёт занятие" : "Ожидание"}
              tone={session.status === "active" ? "info" : "neutral"}
            />
            <StatusPill
              theme={theme}
              label={blockKind.label}
              tone={blockKind.tone}
            />
          </View>
        }
      />

      {isOffline ? <OfflineState theme={theme} onRetry={onRetry} /> : null}
      {hasError ? <ErrorState theme={theme} onRetry={onRetry} /> : null}

      <SectionCard
        theme={theme}
        title="Сводка по сессии"
        subtitle="Главные параметры текущего занятия"
      >
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Код сессии</Text>
            <Text style={styles.kpiValue}>{session.sessionCode}</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Участников</Text>
            <Text style={styles.kpiValue}>{session.participantsCount}</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Задач в блоке</Text>
            <Text style={styles.kpiValue}>{session.questions.length}</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Баллов максимум</Text>
            <Text style={styles.kpiValue}>{totalPoints}</Text>
          </View>
        </View>

        <Text style={styles.bodyText}>Текущий блок: {session.currentBlockTitle}</Text>
        <Text style={styles.bodyText}>
          Время на блок: {timeLimitSec > 0 ? `${Math.ceil(timeLimitSec / 60)} мин.` : "без ограничения"}
        </Text>
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Текущий активный блок"
        subtitle="Экран теперь показывает содержимое текущего этапа, а не только сухую сводку"
      >
        <View style={styles.currentBlockCard}>
          <Text style={styles.currentBlockTitle}>{session.currentBlockTitle}</Text>
          <Text style={styles.currentBlockDescription}>{blockKind.description}</Text>

          {blockKind.kind === "visual" ? (
            <View style={styles.visualContainer}>
              <View style={styles.visualHeader}>
                <Text style={styles.visualHeaderText}>Контейнер визуального модуля</Text>
                <StatusPill theme={theme} label="Fallback" tone="warning" />
              </View>

              <Text style={styles.visualHint}>
                Здесь позже подключается VM Graphics. Пока экран показывает безопасный fallback,
                чтобы приложение не ломалось даже без WebGL или WebView-модуля.
              </Text>

              <View style={styles.previewCanvas}>
                <View style={styles.axisHorizontal} />
                <View style={styles.axisVertical} />
                <View style={[styles.previewPoint, styles.previewPointA]} />
                <View style={[styles.previewPoint, styles.previewPointB]} />
                <View style={[styles.previewPoint, styles.previewPointC]} />
                <View style={styles.curveOne} />
                <View style={styles.curveTwo} />
              </View>
            </View>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                Для этого блока используется текстово-проверочный режим. Интерфейс готов открыть задания и показать
                пользователю понятный переход к следующему действию.
              </Text>
            </View>
          )}
        </View>
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Структура лекции"
        subtitle="Активный блок выделен, чтобы было видно прогресс по занятию"
      >
        {lecture.blocks.map((block, index) => {
          const isCurrent =
            index === currentBlockIndex ||
            block.toLowerCase() === session.currentBlockTitle.toLowerCase();

          return (
            <View
              key={`${block}-${index}`}
              style={[styles.blockRow, isCurrent ? styles.blockRowCurrent : null]}
            >
              <View style={[styles.blockIndex, isCurrent ? styles.blockIndexCurrent : null]}>
                <Text style={[styles.blockIndexText, isCurrent ? styles.blockIndexTextCurrent : null]}>
                  {index + 1}
                </Text>
              </View>

              <View style={styles.blockTextWrap}>
                <Text style={[styles.blockTitle, isCurrent ? styles.blockTitleCurrent : null]}>
                  {block}
                </Text>
                <Text style={styles.blockSubtitle}>
                  {isCurrent ? "Сейчас открыт у преподавателя и студентов" : "Следующий или уже просмотренный блок"}
                </Text>
              </View>
            </View>
          );
        })}
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Что будет в задании"
        subtitle="Краткий preview проверочного блока перед запуском"
      >
        {session.questions.slice(0, 3).map((question, index) => (
          <View key={question.id} style={styles.questionPreviewCard}>
            <Text style={styles.questionPreviewIndex}>Вопрос {index + 1}</Text>
            <Text style={styles.questionPreviewText}>{question.prompt}</Text>
            <Text style={styles.questionPreviewMeta}>
              {question.type === "single-choice" ? "Одиночный выбор" : "Короткий ответ"} · {question.points} балл.
            </Text>
          </View>
        ))}

        {session.questions.length > 3 ? (
          <Text style={styles.bodyText}>И ещё {session.questions.length - 3} задач в этом блоке.</Text>
        ) : null}

        <View style={styles.actionTop}>
          <AppButton
            label={`Открыть блок из ${session.questions.length} задач`}
            onPress={onOpenTask}
            theme={theme}
          />
        </View>

        <View style={styles.actionTop}>
          <AppButton
            label="Назад к лекции"
            onPress={onBack}
            theme={theme}
            variant="secondary"
          />
        </View>
      </SectionCard>
    </Screen>
  );
}

function getBlockKind(title: string): {
  kind: "visual" | "task" | "theory";
  label: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  description: string;
} {
  const normalized = title.toLowerCase();

  if (
    normalized.includes("визу") ||
    normalized.includes("граф") ||
    normalized.includes("модул")
  ) {
    return {
      kind: "visual",
      label: "Визуальный блок",
      tone: "info",
      description: "Блок рассчитан на отрисовку графики и интерактивных математических сцен."
    };
  }

  if (
    normalized.includes("задач") ||
    normalized.includes("тест") ||
    normalized.includes("провер") ||
    normalized.includes("опрос")
  ) {
    return {
      kind: "task",
      label: "Проверочный блок",
      tone: "warning",
      description: "Блок ориентирован на ответы студентов, таймер и последующую проверку."
    };
  }

  return {
    kind: "theory",
    label: "Теоретический блок",
    tone: "neutral",
    description: "Сейчас активен контентный блок лекции: текст, объяснение и сопровождающие материалы."
  };
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.sm
    },
    bodyText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    kpiGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md
    },
    kpiCard: {
      width: "47%",
      minWidth: 140,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm
    },
    kpiLabel: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    kpiValue: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text
    },
    currentBlockCard: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      padding: theme.spacing.md
    },
    currentBlockTitle: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    currentBlockDescription: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md
    },
    visualContainer: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md
    },
    visualHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm
    },
    visualHeaderText: {
      flex: 1,
      fontSize: theme.typography.body,
      fontWeight: "700",
      color: theme.colors.text
    },
    visualHint: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md
    },
    previewCanvas: {
      height: 220,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      overflow: "hidden",
      position: "relative"
    },
    axisHorizontal: {
      position: "absolute",
      left: 16,
      right: 16,
      top: "50%",
      height: 2,
      backgroundColor: theme.colors.border
    },
    axisVertical: {
      position: "absolute",
      top: 16,
      bottom: 16,
      left: "22%",
      width: 2,
      backgroundColor: theme.colors.border
    },
    previewPoint: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.primary
    },
    previewPointA: {
      left: "30%",
      top: "38%"
    },
    previewPointB: {
      left: "52%",
      top: "24%"
    },
    previewPointC: {
      left: "72%",
      top: "58%"
    },
    curveOne: {
      position: "absolute",
      left: "24%",
      right: "18%",
      top: "34%",
      height: 2,
      backgroundColor: theme.colors.primary,
      transform: [{ rotate: "-12deg" }]
    },
    curveTwo: {
      position: "absolute",
      left: "45%",
      right: "16%",
      top: "43%",
      height: 2,
      backgroundColor: theme.colors.success,
      transform: [{ rotate: "18deg" }]
    },
    infoBox: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md
    },
    infoBoxText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    blockRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.sm
    },
    blockRowCurrent: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted
    },
    blockIndex: {
      width: 32,
      height: 32,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm
    },
    blockIndexCurrent: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    blockIndexText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.textSecondary
    },
    blockIndexTextCurrent: {
      color: "#FFFFFF"
    },
    blockTextWrap: {
      flex: 1
    },
    blockTitle: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      fontWeight: "700",
      marginBottom: theme.spacing.xs
    },
    blockTitleCurrent: {
      color: theme.colors.primary
    },
    blockSubtitle: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary
    },
    questionPreviewCard: {
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm
    },
    questionPreviewIndex: {
      fontSize: theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: "800",
      marginBottom: theme.spacing.xs
    },
    questionPreviewText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    questionPreviewMeta: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary
    },
    actionTop: {
      marginTop: theme.spacing.md
    }
  });
}
