import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import JSZip from "jszip";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SectionCard } from "../components/ui/SectionCard";
import type { AppTheme } from "../theme";
import { fixText } from "../utils/fixText";

export type PhotoMaterialItem = {
  id: string;
  title: string;
  imageUrl: string;
  note: string;
  authorName: string;
  createdAt: string;
  teacherLogin?: string;
};

type PhotoMaterialsScreenProps = {
  theme: AppTheme;
  isTeacher: boolean;
  materials: PhotoMaterialItem[];
  onCreateMaterial: (input: { title: string; imageUrl: string; note: string }) => void;
  onDeleteMaterial: (materialId: string) => void;
};

export function PhotoMaterialsScreen({
  theme,
  isTeacher,
  materials,
  onCreateMaterial,
  onDeleteMaterial
}: PhotoMaterialsScreenProps) {
  const styles = createStyles(theme);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const filteredMaterials = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return materials;
    }

    return materials.filter((material) =>
      [material.title, material.note, material.authorName].join(" ").toLowerCase().includes(normalized)
    );
  }, [materials, query]);

  function handleCreate() {
    const nextTitle = title.trim();
    const nextImageUrl = imageUrl.trim();
    const nextNote = note.trim();

    if (!nextTitle || !nextImageUrl) {
      setError("Заполните название и изображение.");
      return;
    }

    onCreateMaterial({
      title: nextTitle,
      imageUrl: nextImageUrl,
      note: nextNote
    });

    setTitle("");
    setImageUrl("");
    setNote("");
    setError("");
  }

  function handlePickImage() {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      setError("Выбор файла сейчас доступен в web-версии.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        if (result) {
          setImageUrl(result);
          setError("");
        }
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }

  async function handleDownloadOne(material: PhotoMaterialItem) {
    try {
      const blob = await imageUrlToBlob(material.imageUrl);
      downloadBlob(blob, buildFileName(material.title, material.imageUrl));
    } catch {
      setError("Не удалось скачать изображение.");
    }
  }

  async function handleDownloadAll() {
    if (materials.length === 0) {
      return;
    }

    setIsDownloadingAll(true);
    setError("");

    try {
      const zip = new JSZip();
      const folder = zip.folder("visualmath-images");

      for (let index = 0; index < materials.length; index += 1) {
        const material = materials[index];
        const blob = await imageUrlToBlob(material.imageUrl);
        folder?.file(buildFileName(material.title || `image-${index + 1}`, material.imageUrl), blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      downloadBlob(content, "visualmath-images.zip");
    } catch {
      setError("Не удалось скачать архив изображений.");
    } finally {
      setIsDownloadingAll(false);
    }
  }

  return (
    <Screen theme={theme}>
      <ScreenHeader
        theme={theme}
        title="Фото и иллюстрации"
        subtitle="Наглядные материалы, изображения, конспекты и визуальные фрагменты для лекций."
        rightSlot={
          <View style={styles.headerChip}>
            <Text style={styles.headerChipText}>{filteredMaterials.length} материалов</Text>
          </View>
        }
      />

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroEyebrow}>Галерея курса</Text>
          <Text style={styles.heroTitle}>
            {isTeacher ? "Управляй визуальными материалами" : "Изучай материалы и скачивай изображения"}
          </Text>
          <Text style={styles.heroSubtitle}>
            Добавляй иллюстрации, делись наглядными схемами и собирай собственную библиотеку визуальных материалов.
          </Text>

          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{isTeacher ? "Режим преподавателя" : "Режим студента"}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Всего: {materials.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroStats}>
          <MiniStatCard theme={theme} value={String(materials.length)} label="Материалов" />
          <MiniStatCard theme={theme} value={String(filteredMaterials.length)} label="По фильтру" />
          <MiniStatCard theme={theme} value={isTeacher ? "Создание" : "Просмотр"} label="Режим" />
        </View>
      </View>

      <View style={styles.grid}>
        {isTeacher ? (
          <SectionCard
            title="Добавить материал"
            subtitle="Загрузи или укажи ссылку на изображение и добавь описание."
            theme={theme}
            style={styles.cardWide}
          >
            <AppInput
              label="Название"
              theme={theme}
              value={title}
              onChangeText={setTitle}
              placeholder="Например: Конспект по пределам"
              autoCorrect={false}
            />

            <AppInput
              label="Ссылка на изображение"
              theme={theme}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://... или выберите файл"
              autoCorrect={false}
              autoCapitalize="none"
            />

            <View style={styles.creationButtonsRow}>
              <AppButton
                label="Выбрать иллюстрацию"
                onPress={handlePickImage}
                theme={theme}
                variant="secondary"
                fullWidth={false}
                style={styles.creationButton}
              />
            </View>

            <AppInput
              label="Описание"
              theme={theme}
              value={note}
              onChangeText={setNote}
              placeholder="Краткое описание материала"
              multiline
              numberOfLines={3}
            />

            {imageUrl ? (
              <View style={styles.previewWrap}>
                <MaterialImage uri={imageUrl} height={240} rounded={22} />
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{fixText(error)}</Text> : null}

            <AppButton
              label="Добавить материал"
              onPress={handleCreate}
              theme={theme}
              style={styles.actionTop}
            />
          </SectionCard>
        ) : null}

        <SectionCard
          title="Поиск по материалам"
          subtitle="Ищи по названию, описанию и автору."
          theme={theme}
          style={isTeacher ? styles.cardNarrow : styles.cardWide}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Например: конспект, график, предел..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.searchInput}
          />

          <View style={styles.searchMetaRow}>
            <Text style={styles.searchMetaText}>Найдено: {filteredMaterials.length}</Text>

            <View style={styles.searchActions}>
              {query.trim() ? (
                <AppButton
                  label="Сбросить"
                  onPress={() => setQuery("")}
                  theme={theme}
                  variant="secondary"
                  fullWidth={false}
                  style={styles.searchActionButton}
                />
              ) : null}

              {materials.length > 0 ? (
                <AppButton
                  label={isDownloadingAll ? "Скачиваем..." : "Скачать всё"}
                  onPress={() => void handleDownloadAll()}
                  theme={theme}
                  variant="secondary"
                  fullWidth={false}
                  style={styles.searchActionButton}
                />
              ) : null}
            </View>
          </View>
        </SectionCard>
      </View>

      <SectionCard
        title="Галерея материалов"
        subtitle={
          filteredMaterials.length > 0
            ? `Доступно материалов: ${filteredMaterials.length}`
            : "Пока материалов нет"
        }
        theme={theme}
      >
        {filteredMaterials.length === 0 ? (
          <Text style={styles.emptyText}>{fixText("Пока нет загруженных материалов.")}</Text>
        ) : (
          <View style={styles.galleryGrid}>
            {filteredMaterials.map((material) => (
              <View key={material.id} style={styles.card}>
                {material.imageUrl ? (
                  <MaterialImage uri={material.imageUrl} height={240} rounded={20} />
                ) : (
                  <View style={styles.emptyImage}>
                    <Text style={styles.emptyImageText}>{fixText("Изображение не найдено")}</Text>
                  </View>
                )}

                <Text style={styles.cardTitle}>{fixText(material.title)}</Text>

                {material.note ? (
                  <Text numberOfLines={3} style={styles.noteText}>
                    {fixText(material.note)}
                  </Text>
                ) : null}

                <Text style={styles.metaText}>{fixText(`Автор: ${material.authorName}`)}</Text>
                <Text style={styles.metaText}>{fixText(`Добавлено: ${formatDate(material.createdAt)}`)}</Text>

                <View style={styles.actionsRow}>
                  <AppButton
                    label="Скачать"
                    onPress={() => void handleDownloadOne(material)}
                    theme={theme}
                    variant="secondary"
                    fullWidth={false}
                    style={styles.inlineButton}
                  />

                  {isTeacher ? (
                    <AppButton
                      label="Удалить"
                      onPress={() => onDeleteMaterial(material.id)}
                      theme={theme}
                      variant="ghost"
                      fullWidth={false}
                      style={styles.inlineButton}
                    />
                  ) : null}
                </View>
              </View>
            ))}
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

type MaterialImageProps = {
  uri: string;
  height: number;
  rounded: number;
};

function MaterialImage({ uri, height, rounded }: MaterialImageProps) {
  if (Platform.OS === "web") {
    return (
      <img
        src={uri}
        alt=""
        style={{
          width: "100%",
          height,
          objectFit: "cover",
          borderRadius: rounded,
          background: "#F3F4F6",
          marginBottom: 12,
          display: "block"
        }}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{
        width: "100%",
        height,
        borderRadius: rounded,
        marginBottom: 12
      }}
      resizeMode="cover"
    />
  );
}

async function imageUrlToBlob(uri: string): Promise<Blob> {
  if (uri.startsWith("data:")) {
    const response = await fetch(uri);
    return await response.blob();
  }

  const response = await fetch(uri);
  return await response.blob();
}

function buildFileName(title: string, uri: string): string {
  const safeTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-я0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";

  if (uri.includes(".png")) {
    return `${safeTitle}.png`;
  }

  if (uri.includes(".webp")) {
    return `${safeTitle}.webp`;
  }

  if (uri.includes(".gif")) {
    return `${safeTitle}.gif`;
  }

  return `${safeTitle}.jpg`;
}

function downloadBlob(blob: Blob, fileName: string) {
  if (Platform.OS !== "web" || typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function formatDate(value: string): string {
  const next = new Date(value);

  if (Number.isNaN(next.getTime())) {
    return "—";
  }

  return next.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
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
    heroBadges: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    heroBadge: {
      minHeight: 34,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    heroBadgeText: {
      fontSize: theme.typography.caption,
      fontWeight: "800",
      color: theme.colors.text
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
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    cardWide: {
      flexBasis: 720,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    cardNarrow: {
      flexBasis: 320,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs
    },
    creationButtonsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: theme.spacing.sm
    },
    creationButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    previewWrap: {
      marginTop: theme.spacing.sm
    },
    searchInput: {
      minHeight: 56,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.input,
      color: theme.colors.text,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.body,
      ...theme.shadow.sm
    },
    searchMetaRow: {
      marginTop: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap"
    },
    searchMetaText: {
      fontSize: theme.typography.caption,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm
    },
    searchActions: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    searchActionButton: {
      marginLeft: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    actionTop: {
      marginTop: theme.spacing.sm
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      fontWeight: "700",
      marginTop: theme.spacing.xs
    },
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    galleryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.xs
    },
    card: {
      flexBasis: 320,
      flexGrow: 1,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.md
    },
    cardTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "900",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    emptyImage: {
      width: "100%",
      height: 240,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceMuted,
      marginBottom: theme.spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border
    },
    emptyImageText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    noteText: {
      fontSize: theme.typography.body,
      lineHeight: 24,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    metaText: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs
    },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: theme.spacing.md
    },
    inlineButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    }
  });
}
