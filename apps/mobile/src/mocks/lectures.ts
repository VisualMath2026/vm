export type LectureItem = {
  id: string;
  title: string;
  author: string;
  subject: string;
  semester: string;
  level: string;
  tags: string[];
  description: string;
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
    description: "Введение в пределы, непрерывность и геометрическую интерпретацию функции."
  },
  {
    id: "lecture-2",
    title: "Производная и касательная",
    author: "Visual Math Team",
    subject: "Матанализ",
    semester: "1 семестр",
    level: "Средний",
    tags: ["производная", "касательная", "скорость изменения"],
    description: "Связь производной с графиком функции и касательной в выбранной точке."
  },
  {
    id: "lecture-3",
    title: "Векторы на плоскости",
    author: "Курс линейной алгебры",
    subject: "Линейная алгебра",
    semester: "1 семестр",
    level: "Базовый",
    tags: ["векторы", "координаты", "геометрия"],
    description: "Операции над векторами, длина, направление и визуализация на координатной плоскости."
  },
  {
    id: "lecture-4",
    title: "Поверхность z = f(x, y)",
    author: "VM Graphics Demo",
    subject: "Многомерный анализ",
    semester: "2 семестр",
    level: "Продвинутый",
    tags: ["3d", "поверхность", "визуализация"],
    description: "Пример лекции под будущую интеграцию графической библиотеки VM Graphics."
  }
];
