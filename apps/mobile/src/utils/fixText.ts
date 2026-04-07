export function fixText(value: string | undefined | null): string {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  const exactMap: Record<string, string> = {
    "РЎРµСЂРіРµР№ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЊ": "Сергей преподаватель",
    "РўРµСЃС‚РѕРІС‹Р№ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЊ": "Тестовый преподаватель",
    "???????? ?????????????": "Доступно преподавателю",
    "??????": "Теория",
    "???????": "Вопросы",
    "15 ?????": "15 минут",
    "20 ?????": "20 минут",
    "25 ?????": "25 минут",
    "30 ?????": "30 минут",
    "35 ?????": "35 минут",
    "45 ?????": "45 минут",
    "60 ?????": "60 минут"
  };

  if (exactMap[text]) {
    return exactMap[text];
  }

  if (/^[? ]+$/.test(text)) {
    return "";
  }

  return text
    .replace(/РЎРµСЂРіРµР№ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЊ/g, "Сергей преподаватель")
    .replace(/РўРµСЃС‚РѕРІС‹Р№ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЊ/g, "Тестовый преподаватель")
    .replace(/15 \?{5}/g, "15 минут")
    .replace(/20 \?{5}/g, "20 минут")
    .replace(/25 \?{5}/g, "25 минут")
    .replace(/30 \?{5}/g, "30 минут")
    .replace(/35 \?{5}/g, "35 минут")
    .replace(/45 \?{5}/g, "45 минут")
    .replace(/60 \?{5}/g, "60 минут");
}

export function fixTextList(values: string[] | undefined | null): string[] {
  return (values ?? []).map((value) => fixText(value)).filter(Boolean);
}