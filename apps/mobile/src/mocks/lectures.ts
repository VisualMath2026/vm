export type LectureItem = {
  id: string;
  title: string;
  author: string;
  subject: string;
  semester: string;
  level: string;
  tags: string[];
  description: string;
  blocks: string[];
  participationRequirements: string[];
  estimatedDuration: string;
  teacherLogin?: string;
};

export const mockLectures: LectureItem[] = [
  {
    id: "lecture-1",
    title: "Пределы и непрерывность",
    author: "Кафедра математического анализа",
    subject: "Матанализ",
    semester: "1 семестр",
    level: "Базовый",
    tags: ["пределы", "графики", "функции"],
    description: "Введение в пределы, непрерывность и геометрическую интерпретацию функции.",
    blocks: [
      "Теоретический блок",
      "Примеры графиков",
      "Мини-проверка понимания"
    ],
    participationRequirements: [
      "Базовые знания школьной алгебры",
      "Готовность работать с графиками функций"
    ],
    estimatedDuration: "25 минут"
  },
  {
    id: "lecture-2",
    title: "Производная и касательная",
    author: "Visual Math Team",
    subject: "Матанализ",
    semester: "1 семестр",
    level: "Средний",
    tags: ["производная", "касательная", "скорость изменения"],
    description: "Связь производной с графиком функции и касательной в выбранной точке.",
    blocks: [
      "Введение в производную",
      "Визуализация касательной",
      "Проверочный блок"
    ],
    participationRequirements: [
      "Понимание функций и графиков",
      "Желательно знать пределы"
    ],
    estimatedDuration: "30 минут"
  },
  {
    id: "lecture-3",
    title: "Векторы на плоскости",
    author: "Курс линейной алгебры",
    subject: "Линейная алгебра",
    semester: "1 семестр",
    level: "Базовый",
    tags: ["векторы", "координаты", "геометрия"],
    description: "Операции над векторами, длина, направление и визуализация на координатной плоскости.",
    blocks: [
      "Координаты вектора",
      "Сложение и вычитание",
      "Краткое задание"
    ],
    participationRequirements: [
      "Понимание координатной плоскости"
    ],
    estimatedDuration: "20 минут"
  },
  {
    id: "lecture-4",
    title: "Поверхность z = f(x, y)",
    author: "VM Graphics Demo",
    subject: "Многомерный анализ",
    semester: "2 семестр",
    level: "Продвинутый",
    tags: ["3d", "поверхность", "визуализация"],
    description: "Пример лекции под будущую интеграцию графической библиотеки VM Graphics.",
    blocks: [
      "3D-сцена",
      "Изменение параметров",
      "Наблюдение поверхности"
    ],
    participationRequirements: [
      "Базовое понимание функций двух переменных",
      "Устройство должно поддерживать интерактивную визуализацию"
    ],
    estimatedDuration: "35 минут"
  }
];