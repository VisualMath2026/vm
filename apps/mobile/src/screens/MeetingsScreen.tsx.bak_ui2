import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusPill } from "../components/ui/StatusPill";
import type { MeetingItem } from "../storage/meetingsStorage";
import type { AppTheme } from "../theme";
import { fixText } from "../utils/fixText";

export type MeetingDraftInput = {
  title: string;
  platform: string;
  url: string;
  scheduledAt: string;
  durationMin: number;
  description: string;
};

type MeetingsScreenProps = {
  theme: AppTheme;
  isTeacher: boolean;
  meetings: MeetingItem[];
  onCreateMeeting: (input: MeetingDraftInput) => void;
  onDeleteMeeting: (meetingId: string) => void;
};

const PLATFORM_OPTIONS = [
  "Яндекс Телемост",
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "Другое"
] as const;

export function MeetingsScreen({
  theme,
  isTeacher,
  meetings,
  onCreateMeeting,
  onDeleteMeeting
}: MeetingsScreenProps) {
  const styles = createStyles(theme);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<string>("Яндекс Телемост");
  const [url, setUrl] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setNowTs(Date.now());
    }, 30000);

    return () => clearInterval(timerId);
  }, []);

  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => {
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
  }, [meetings]);

  const nextMeeting = useMemo(() => {
    return sortedMeetings.find((meeting) => {
      const status = getMeetingStatus(meeting, nowTs);
      return status === "soon" || status === "live";
    }) ?? sortedMeetings[0] ?? null;
  }, [nowTs, sortedMeetings]);

  function handleCreate() {
    const nextTitle = title.trim();
    const nextUrl = url.trim();
    const nextDate = scheduledDate.trim();
    const nextTime = scheduledTime.trim();
    const nextDuration = Number(durationMin);

    if (!nextTitle || !nextUrl || !nextDate || !nextTime) {
      setError("Заполните название, ссылку, дату и время.");
      return;
    }

    if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
      setError("Укажите корректную длительность встречи в минутах.");
      return;
    }

    const scheduledAt = new Date(`${nextDate}T${nextTime}:00`);

    if (Number.isNaN(scheduledAt.getTime())) {
      setError("Дата или время указаны в неверном формате.");
      return;
    }

    onCreateMeeting({
      title: nextTitle,
      platform: platform.trim(),
      url: nextUrl,
      scheduledAt: scheduledAt.toISOString(),
      durationMin: nextDuration,
      description: description.trim()
    });

    setTitle("");
    setUrl("");
    setScheduledDate("");
    setScheduledTime("");
    setDurationMin("60");
    setDescription("");
    setError("");
    setPlatform("Яндекс Телемост");
  }

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Миты и онлайн-встречи"
        subtitle="Актуальные ссылки на созвоны, занятия и консультации с возможностью подключения в реальном времени."
        rightSlot={
          <View style={styles.headerChip}>
            <Text style={styles.headerChipText}>{sortedMeetings.length} встреч</Text>
          </View>
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroEyebrow}>Онлайн-коммуникация</Text>
          <Text style={styles.heroTitle}>
            {nextMeeting ? fixText(nextMeeting.title) : "Ближайших встреч пока нет"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {nextMeeting
              ? fixText(
                  `${nextMeeting.platform} • ${formatMeetingDate(nextMeeting.scheduledAt)} • ${nextMeeting.durationMin} мин`
                )
              : "Преподаватель может добавить новую конференцию, а студент — открыть ссылку и быстро подключиться."}
          </Text>

          {nextMeeting ? (
            <View style={styles.heroActions}>
              <AppButton
                label={getMeetingStatus(nextMeeting, nowTs) === "live" ? "Подключиться сейчас" : "Открыть ссылку"}
                onPress={() => void Linking.openURL(nextMeeting.url)}
                theme={theme}
                fullWidth={false}
                style={styles.heroButton}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.heroStats}>
          <MiniStatCard theme={theme} value={String(sortedMeetings.length)} label="Всего встреч" />
          <MiniStatCard
            theme={theme}
            value={String(sortedMeetings.filter((meeting) => getMeetingStatus(meeting, nowTs) === "live").length)}
            label="Идут сейчас"
          />
          <MiniStatCard
            theme={theme}
            value={String(sortedMeetings.filter((meeting) => getMeetingStatus(meeting, nowTs) === "soon").length)}
            label="Скоро"
          />
        </View>
      </View>

      {isTeacher ? (
        <SectionCard
          theme={theme}
          title="Добавить новую встречу"
          subtitle="Укажите сервис, ссылку, дату и время конференции."
        >
          <AppInput
            label="Название встречи"
            theme={theme}
            value={title}
            onChangeText={setTitle}
            placeholder="Например: Разбор домашнего задания"
            autoCorrect={false}
          />

          <Text style={styles.sectionLabel}>Платформа</Text>
          <View style={styles.platformRow}>
            {PLATFORM_OPTIONS.map((item) => {
              const isActive = platform === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setPlatform(item)}
                  style={[
                    styles.platformChip,
                    {
                      borderColor: isActive ? theme.colors.primary : theme.colors.border,
                      backgroundColor: isActive ? theme.colors.surfaceMuted : theme.colors.surface
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.platformChipText,
                      { color: isActive ? theme.colors.primary : theme.colors.text }
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <AppInput
            label="Ссылка на конференцию"
            theme={theme}
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            autoCorrect={false}
            autoCapitalize="none"
          />

          <View style={styles.inputGrid}>
            <View style={styles.inputCol}>
              <AppInput
                label="Дата"
                theme={theme}
                value={scheduledDate}
                onChangeText={setScheduledDate}
                placeholder="2026-04-20"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputCol}>
              <AppInput
                label="Время"
                theme={theme}
                value={scheduledTime}
                onChangeText={setScheduledTime}
                placeholder="18:30"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputCol}>
              <AppInput
                label="Длительность, мин"
                theme={theme}
                value={durationMin}
                onChangeText={setDurationMin}
                placeholder="60"
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppInput
            label="Комментарий"
            theme={theme}
            value={description}
            onChangeText={setDescription}
            placeholder="Например: подготовить вопросы по теме"
            multiline
            numberOfLines={3}
          />

          {error ? <Text style={styles.errorText}>{fixText(error)}</Text> : null}

          <AppButton
            label="Добавить встречу"
            onPress={handleCreate}
            theme={theme}
            style={styles.actionTop}
          />
        </SectionCard>
      ) : null}

      <SectionCard
        theme={theme}
        title="Список встреч"
        subtitle={sortedMeetings.length > 0 ? `Всего встреч: ${sortedMeetings.length}` : "Пока встреч нет"}
      >
        {sortedMeetings.length === 0 ? (
          <Text style={styles.emptyText}>
            {isTeacher
              ? "Пока нет созданных встреч. Добавьте первую конференцию."
              : "Пока преподаватель не добавил ни одной встречи."}
          </Text>
        ) : (
          <View style={styles.meetingList}>
            {sortedMeetings.map((meeting) => {
              const status = getMeetingStatus(meeting, nowTs);

              return (
                <View key={meeting.id} style={styles.meetingCard}>
                  <View style={styles.meetingTop}>
                    <View style={styles.meetingTitleWrap}>
                      <Text style={styles.meetingTitle}>{fixText(meeting.title)}</Text>
                      <Text style={styles.meetingMeta}>
                        {fixText(`${meeting.platform} • ${formatMeetingDate(meeting.scheduledAt)}`)}
                      </Text>
                    </View>

                    <StatusPill
                      theme={theme}
                      label={meetingStatusLabel(status)}
                      tone={meetingStatusTone(status)}
                    />
                  </View>

                  <View style={styles.infoGrid}>
                    <InfoTile theme={theme} label="Платформа" value={meeting.platform} />
                    <InfoTile theme={theme} label="Начало" value={formatMeetingDate(meeting.scheduledAt)} />
                    <InfoTile theme={theme} label="Длительность" value={`${meeting.durationMin} мин`} />
                    <InfoTile theme={theme} label="Добавил" value={meeting.createdBy} />
                  </View>

                  {meeting.description ? (
                    <Text style={styles.descriptionText}>{fixText(meeting.description)}</Text>
                  ) : null}

                  <Text style={styles.linkText}>{meeting.url}</Text>

                  <View style={styles.actionRow}>
                    <AppButton
                      label={status === "live" ? "Подключиться сейчас" : "Открыть ссылку"}
                      onPress={() => void Linking.openURL(meeting.url)}
                      theme={theme}
                      fullWidth={false}
                      style={styles.inlineButton}
                    />

                    {isTeacher ? (
                      <AppButton
                        label="Удалить"
                        onPress={() => onDeleteMeeting(meeting.id)}
                        theme={theme}
                        variant="ghost"
                        fullWidth={false}
                        style={styles.inlineButton}
                      />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </SectionCard>
    </Screen>
  );
}

type MiniStatCardProps = {
  theme: AppTheme;
  value: string;
  label: string;
};

function MiniStatCard({ theme, value, label }: MiniStatCardProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.miniStatCard}>
      <Text style={styles.miniStatValue}>{fixText(value)}</Text>
      <Text style={styles.miniStatLabel}>{fixText(label)}</Text>
    </View>
  );
}

type InfoTileProps = {
  theme: AppTheme;
  label: string;
  value: string;
};

function InfoTile({ theme, label, value }: InfoTileProps) {
  const styles = createStyles(theme);

  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoTileLabel}>{fixText(label)}</Text>
      <Text style={styles.infoTileValue}>{fixText(value)}</Text>
    </View>
  );
}

function getMeetingStatus(meeting: MeetingItem, nowTs: number): "soon" | "live" | "done" {
  const startTs = new Date(meeting.scheduledAt).getTime();
  const endTs = startTs + meeting.durationMin * 60 * 1000;

  if (nowTs < startTs) {
    return "soon";
  }

  if (nowTs >= startTs && nowTs <= endTs) {
    return "live";
  }

  return "done";
}

function meetingStatusLabel(status: "soon" | "live" | "done"): string {
  if (status === "live") {
    return "Идёт сейчас";
  }

  if (status === "soon") {
    return "Скоро";
  }

  return "Завершено";
}

function meetingStatusTone(status: "soon" | "live" | "done") {
  if (status === "live") {
    return "success";
  }

  if (status === "soon") {
    return "info";
  }

  return "neutral";
}

function formatMeetingDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    headerChip: {
      minHeight: 42,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    headerChipText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
    },
    heroCard: {
      flexDirection: "row",
      flexWrap: "wrap",
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.lg,
      ...theme.shadow.lg
    },
    heroLeft: {
      flex: 1,
      minWidth: 320,
      paddingRight: theme.spacing.lg
    },
    heroEyebrow: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 0.4
    },
    heroTitle: {
      fontSize: theme.typography.title,
      lineHeight: theme.typography.title + 6,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    heroSubtitle: {
      fontSize: theme.typography.body,
      lineHeight: 26,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      maxWidth: 760
    },
    heroActions: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    heroButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    heroStats: {
      width: 260,
      minWidth: 220,
      justifyContent: "space-between"
    },
    miniStatCard: {
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm
    },
    miniStatValue: {
      fontSize: 24,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    miniStatLabel: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary
    },
    sectionLabel: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    platformRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.md
    },
    platformChip: {
      minHeight: 40,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    platformChipText: {
      fontSize: theme.typography.caption,
      fontWeight: "800"
    },
    inputGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    inputCol: {
      flexBasis: 220,
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xs
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      fontWeight: "700",
      marginTop: theme.spacing.xs
    },
    actionTop: {
      marginTop: theme.spacing.sm
    },
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    meetingList: {
      width: "100%"
    },
    meetingCard: {
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
      ...theme.shadow.md
    },
    meetingTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: theme.spacing.md
    },
    meetingTitleWrap: {
      flex: 1,
      paddingRight: theme.spacing.md
    },
    meetingTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    meetingMeta: {
      fontSize: theme.typography.caption,
      lineHeight: 20,
      color: theme.colors.textSecondary
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs,
      marginBottom: theme.spacing.sm
    },
    infoTile: {
      flexBasis: 220,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    infoTileLabel: {
      fontSize: theme.typography.helper,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    infoTileValue: {
      fontSize: theme.typography.body,
      fontWeight: "800",
      color: theme.colors.text
    },
    descriptionText: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    linkText: {
      fontSize: theme.typography.caption,
      lineHeight: 20,
      color: theme.colors.primary,
      marginBottom: theme.spacing.md
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    inlineButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    }
  });
}
