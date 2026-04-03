import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LectureDetails, LectureBlock, QuizBlock, TextBlock, VisualBlock } from "@vm/shared";
import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { LectureItem } from "../mocks/lectures";
import type { AppTheme } from "../theme";

type LectureDetailsScreenProps = {
  theme: AppTheme;
  lecture: LectureItem;
  lectureDetails?: LectureDetails | null;
  onBack: () => void;
  onOpenSession: () => void;
};

export function LectureDetailsScreen({
  theme,
  lecture,
  lectureDetails,
  onBack,
  onOpenSession
}: LectureDetailsScreenProps) {
  const styles = createStyles(theme);
  const blocks = lectureDetails?.blocks ?? [];

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title={lecture.title}
        subtitle={lecture.description}
        rightSlot={
          <View style={styles.metaRow}>
            <StatusPill theme={theme} label={lecture.subject} tone="info" />
            <StatusPill theme={theme} label={lecture.level} tone="neutral" />
            <StatusPill theme={theme} label={lecture.estimatedDuration} tone="success" />
          </View>
        }
      />

      <SectionCard
        theme={theme}
        title="О лекции"
        subtitle="Основная информация и требования к участию"
      >
        <Text style={styles.bodyText}>Автор: {lecture.author}</Text>
        <Text style={styles.bodyText}>Семестр: {lecture.semester}</Text>
        <Text style={styles.bodyText}>Теги: {lecture.tags.join(", ")}</Text>

        <View style={styles.topSpacing}>
          {lecture.participationRequirements.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      </SectionCard>

      {blocks.length > 0 ? (
        <>
          <SectionCard
            theme={theme}
            title="Содержимое лекции"
            subtitle={`Загружено блоков: ${blocks.length}`}
          >
            {blocks.map((block, index) => (
              <Text key={block.id} style={styles.listItem}>
                {index + 1}. {block.title || blockLabel(block)}
              </Text>
            ))}
          </SectionCard>

          {blocks.map((block, index) => (
            <BlockPreview
              key={block.id}
              theme={theme}
              block={block}
              index={index}
            />
          ))}
        </>
      ) : (
        <SectionCard
          theme={theme}
          title="Структура лекции"
          subtitle="Пока показана локальная версия без детального контента"
        >
          {lecture.blocks.map((block, index) => (
            <Text key={`${block}-${index}`} style={styles.listItem}>
              {index + 1}. {block}
            </Text>
          ))}
        </SectionCard>
      )}

      <SectionCard
        theme={theme}
        title="Следующий шаг"
        subtitle="После открытия сессии станет доступен проверочный блок"
      >
        <Text style={styles.bodyText}>
          Можно перейти к сессии, просмотреть активный блок и пройти все задания лекции.
        </Text>

        <View style={styles.actionTop}>
          <AppButton
            label="Открыть сессию"
            onPress={onOpenSession}
            theme={theme}
          />
        </View>

        <View style={styles.actionTop}>
          <AppButton
            label="Назад к каталогу"
            onPress={onBack}
            theme={theme}
            variant="secondary"
          />
        </View>
      </SectionCard>
    </Screen>
  );
}

type BlockPreviewProps = {
  theme: AppTheme;
  block: LectureBlock;
  index: number;
};

function BlockPreview({ theme, block, index }: BlockPreviewProps) {
  const styles = createStyles(theme);

  if (block.type === "text") {
    const textBlock = block as TextBlock;
    const lines = textBlock.payload.markdown
      .split("\n")
      .map((line) => line.replace(/^#+\s*/, "").trim())
      .filter(Boolean);

    return (
      <SectionCard
        theme={theme}
        title={`Блок ${index + 1}: ${block.title || "Теория"}`}
        subtitle="Текстовый материал"
      >
        {lines.map((line, lineIndex) => (
          <Text key={`${block.id}-${lineIndex}`} style={styles.textLine}>
            {line.startsWith("-") ? `• ${line.replace(/^-+\s*/, "")}` : line}
          </Text>
        ))}
      </SectionCard>
    );
  }

  if (block.type === "visual") {
    const visualBlock = block as VisualBlock;
    const sceneName =
      typeof visualBlock.payload.scene === "object" &&
      visualBlock.payload.scene !== null &&
      "preset" in visualBlock.payload.scene
        ? String((visualBlock.payload.scene as { preset?: unknown }).preset ?? "scene")
        : "scene";

    return (
      <SectionCard
        theme={theme}
        title={`Блок ${index + 1}: ${block.title || "Визуализация"}`}
        subtitle="Визуальный модуль"
      >
        <Text style={styles.bodyText}>
          {visualBlock.payload.caption || "Интерактивная визуализация для этой лекции."}
        </Text>
        <Text style={styles.bodyText}>Сцена: {sceneName}</Text>
        <Text style={styles.noteText}>
          На следующем шаге сюда можно подключить полноценный рендер VM Graphics.
        </Text>
      </SectionCard>
    );
  }

  const quizBlock = block as QuizBlock;

  return (
    <SectionCard
      theme={theme}
      title={`Блок ${index + 1}: ${block.title || "Проверочный блок"}`}
      subtitle={`Вопросов: ${quizBlock.payload.questions.length}`}
    >
      <Text style={styles.bodyText}>
        Ограничение по времени: {quizBlock.payload.timeLimitSec ?? 0} сек.
      </Text>

      <View style={styles.topSpacing}>
        {quizBlock.payload.questions.map((question, questionIndex) => (
          <Text key={question.id} style={styles.listItem}>
            {questionIndex + 1}. {question.text}
          </Text>
        ))}
      </View>
    </SectionCard>
  );
}

function blockLabel(block: LectureBlock): string {
  if (block.type === "text") {
    return "Текстовый блок";
  }

  if (block.type === "visual") {
    return "Визуальный блок";
  }

  return "Проверочный блок";
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    bodyText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    textLine: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      lineHeight: 22
    },
    listItem: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      lineHeight: 22
    },
    noteText: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm
    },
    actionTop: {
      marginTop: theme.spacing.md
    },
    topSpacing: {
      marginTop: theme.spacing.sm
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.sm
    }
  });
}