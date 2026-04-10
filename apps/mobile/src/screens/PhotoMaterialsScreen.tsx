import React, { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";
import JSZip from "jszip";

import { AppButton } from "../components/ui/AppButton";
import { AppInput } from "../components/ui/AppInput";
import { Screen } from "../components/ui/Screen";
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
  const [error, setError] = useState("");
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

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
    if (Platform.OS !== "web") {
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
      <Text style={styles.title}>{fixText("Фото и иллюстрации")}</Text>
      <Text style={styles.subtitle}>{fixText("Задания, конспекты и наглядные материалы.")}</Text>

      {isTeacher ? (
        <SectionCard title="Новый материал" subtitle="Добавьте фото или иллюстрацию" theme={theme}>
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
          />

          <AppButton
            label="Выбрать иллюстрацию"
            onPress={handlePickImage}
            theme={theme}
            variant="secondary"
            style={styles.actionTop}
          />

          <AppInput
            label="Описание"
            theme={theme}
            value={note}
            onChangeText={setNote}
            placeholder="Краткое описание материала"
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />

          {imageUrl ? <MaterialImage uri={imageUrl} height={220} rounded={18} /> : null}

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
        title="Материалы"
        subtitle={materials.length > 0 ? `Всего материалов: ${materials.length}` : "Пока материалов нет"}
        theme={theme}
      >
        {materials.length > 0 ? (
          <AppButton
            label={isDownloadingAll ? "Скачиваем..." : "Скачать все изображения"}
            onPress={() => void handleDownloadAll()}
            theme={theme}
            variant="secondary"
            style={styles.downloadAllButton}
          />
        ) : null}

        {materials.length === 0 ? (
          <Text style={styles.emptyText}>{fixText("Пока нет загруженных материалов.")}</Text>
        ) : (
          materials.map((material) => (
            <View key={material.id} style={styles.card}>
              <Text style={styles.cardTitle}>{fixText(material.title)}</Text>

              {material.imageUrl ? (
                <MaterialImage uri={material.imageUrl} height={240} rounded={18} />
              ) : (
                <View style={styles.emptyImage}>
                  <Text style={styles.emptyImageText}>{fixText("Изображение не найдено")}</Text>
                </View>
              )}

              {material.note ? <Text style={styles.noteText}>{fixText(material.note)}</Text> : null}
              <Text style={styles.metaText}>{fixText("Автор")}: {fixText(material.authorName)}</Text>

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
                    variant="secondary"
                    fullWidth={false}
                    style={styles.inlineButton}
                  />
                ) : null}
              </View>
            </View>
          ))
        )}
      </SectionCard>
    </Screen>
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
          objectFit: "contain",
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
      resizeMode="contain"
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
  if (Platform.OS !== "web") {
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
    actionTop: {
      marginTop: theme.spacing.md
    },
    downloadAllButton: {
      marginBottom: theme.spacing.md
    },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: theme.spacing.sm
    },
    inlineButton: {
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    multilineInput: {
      minHeight: 96,
      textAlignVertical: "top"
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.caption,
      marginTop: theme.spacing.xs
    },
    emptyText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    card: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border
    },
    cardTitle: {
      fontSize: theme.typography.sectionTitle,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm
    },
    emptyImage: {
      width: "100%",
      height: 240,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceMuted,
      marginBottom: theme.spacing.sm,
      alignItems: "center",
      justifyContent: "center"
    },
    emptyImageText: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary
    },
    noteText: {
      fontSize: theme.typography.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs
    },
    metaText: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary
    }
  });
}
