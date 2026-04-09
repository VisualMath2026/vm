import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Linking,
  Pressable
} from "react-native";
import type { LectureDetails, LectureBlock, QuizBlock, TextBlock, VisualBlock } from "@vm/shared";
import { AppButton } from "../components/ui/AppButton";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import { VisualModuleFallback } from "../components/visual/VisualModuleFallback";
import type { LectureItem } from "../mocks/lectures";
import type { AppTheme } from "../theme";
import { fixText, fixTextList } from "../utils/fixText";

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
  const videoUrl = String((lecture as { videoUrl?: string }).videoUrl ?? "").trim();
  const blocks = lectureDetails?.blocks ?? [];

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title={lecture.title}
        subtitle={lecture.subject}
        rightSlot={
          <View style={styles.metaRow}>
            <StatusPill theme={theme} label={lecture.level} tone="info" />
            <StatusPill theme={theme} label={fixText((lecture.id.startsWith("draft-lecture-") ? "15 минут" : lecture.estimatedDuration))} tone="neutral" />
          </View>
        }
      />

      {videoUrl ? (
        <SectionCard
          title="\u0412\u0438\u0434\u0435\u043e\u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b"
          subtitle="\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0441\u0441\u044b\u043b\u043a\u0443 \u0438 \u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u0432\u0438\u0434\u0435\u043e"
          theme={theme}
        >
          <Pressable
            onPress={() => void Linking.openURL(videoUrl)}
            style={{
              paddingVertical: theme.spacing.xs
            }}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: theme.typography.body,
                fontWeight: "700"
              }}
            >
              \u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0432\u0438\u0434\u0435\u043e
            </Text>
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.caption,
                marginTop: theme.spacing.xs
              }}
            >
              {videoUrl}
            </Text>
          </Pressable>
        </SectionCard>
      ) : null}

      <SectionCard
        theme={theme}
        title="О лекции"
        subtitle="Краткая информация перед входом в занятие"
      >
        <Text style={styles.bodyText}>{fixText(lecture.description)}</Text>
        <Text style={styles.bodyText}>Автор: {lecture.id.startsWith("draft-lecture-") ? "Visual Math Team" : lecture.author}</Text>
        <Text style={styles.bodyText}>Семестр: {lecture.semester}</Text>
        <Text style={styles.bodyText}>Теги: {lecture.tags.join(", ")}</Text>

        <View style={styles.topSpacing}>
          {fixTextList((lecture.id.startsWith("draft-lecture-") ? ["Visual Math Team"] : lecture.participationRequirements)).map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        theme={theme}
        title="Структура лекции"
        subtitle="Список блоков и их preview"
      >
        {blocks.length > 0 ? (
          <>
            {blocks.map((block, index) => (
              <View key={`${block.type}-${index}`} style={styles.topSpacing}>
                <Text style={styles.bodyText}>
                  {index + 1}. {block.title || blockLabel(block)}
                </Text>
              </View>
            ))}

            {blocks.map((block, index) => (
              <View key={`preview-${block.type}-${index}`} style={styles.topSpacing}>
                <BlockPreview theme={theme} block={block} index={index} />
              </View>
            ))}
          </>
        ) : (
          <>
            {fixTextList((lecture.id.startsWith("draft-lecture-") ? ["Theory", "Questions"] : lecture.blocks)).map((block, index) => (
              <Text key={`${block}-${index}`} style={styles.listItem}>
                {index + 1}. {block}
              </Text>
            ))}
          </>
        )}

        <View style={styles.actionTop}>
          <AppButton label="Открыть занятие" onPress={onOpenSession} theme={theme} />
        </View>

        <View style={styles.actionTop}>
          <AppButton label="Назад" onPress={onBack} theme={theme} variant="secondary" />
        </View>

        <Text style={styles.noteText}>
          Можно перейти к сессии, просмотреть активный блок и пройти все задания лекции.
        </Text>
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
        title={`Блок ${index + 1}: текст`}
        subtitle={block.title || "Текстовый материал лекции"}
      >
        {lines.slice(0, 5).map((line, lineIndex) => (
          <Text key={`${line}-${lineIndex}`} style={line.startsWith("-") ? styles.listItem : styles.textLine}>
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
        title={`Блок ${index + 1}: визуализация`}
        subtitle={visualBlock.payload.caption || "Интерактивная визуализация для этой лекции"}
      >
        <Text style={styles.bodyText}>Сцена: {sceneName}</Text>
        <VisualModuleFallback
          theme={theme}
          compact
          title="Preview визуального модуля"
          description="Пока здесь безопасный UI-fallback. Позже этот контейнер можно будет заменить на реальный рендер VM Graphics."
        />
      </SectionCard>
    );
  }

  const quizBlock = block as QuizBlock;

  return (
    <SectionCard
      theme={theme}
      title={`Блок ${index + 1}: проверка`}
      subtitle="Проверочный блок лекции"
    >
      <Text style={styles.bodyText}>
        Ограничение по времени: {quizBlock.payload.timeLimitSec ?? 0} сек.
      </Text>

      {quizBlock.payload.questions.map((question, questionIndex) => (
        <Text key={`${question.text}-${questionIndex}`} style={styles.listItem}>
          {questionIndex + 1}. {question.text}
        </Text>
      ))}
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
