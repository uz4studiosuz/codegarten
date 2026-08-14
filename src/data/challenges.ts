import { QuizQuestion } from "@/types/curriculum";

export const interactiveChallenges: QuizQuestion[] = [
  {
    id: "challenge-binary-search",
    topic: "Algoritmik Fikrlash",
    title: "Binary Search o'rtadagi indeksni hisoblash",
    difficulty: "Easy",
    codeSnippet: `// Integer overflowdan himoyalangan o'rtacha indeks:
function findMiddle(left: number, right: number): number {
  // Qaysi ifoda to'g'ri va xavfsiz?
  return /* ??? */;
}`,
    question: "Katta massivlarda `(left + right) / 2` integer overflow keltirib chiqarishi mumkin. Qaysi formula xavfsiz hisoblanadi?",
    options: [
      {
        id: "opt-1",
        label: "left + Math.floor((right - left) / 2)",
        explanation: "To'g'ri! (right - left) hech qachon chegaradan oshmaydi va xavfsiz o'rtacha qiymatni beradi.",
      },
      {
        id: "opt-2",
        label: "(right - left) / 2",
        explanation: "Noto'g'ri: bu faqat masofaning yarmini beradi, boshlang'ich `left` nuqtasi qo'shilmagan.",
      },
      {
        id: "opt-3",
        label: "right + left / 2",
        explanation: "Noto'g'ri: amallar ketma-ketligi bo'yicha faqat `left` ikkiga bo'linadi.",
      },
      {
        id: "opt-4",
        label: "(left + right) * 2",
        explanation: "Noto'g'ri: bu massiv indeksini kattalashtirib yuboradi.",
      },
    ],
    correctOptionId: "opt-1",
    detailedSolution: "Klassik `(left + right) / 2` formulasi `left + right` qiymati maksimal xotira chegarasidan (2^31 - 1) oshganda overflow beradi. `left + (right - left) / 2` formulasi esa xavfsiz va aniq ishlaydi.",
    xpReward: 50,
  },
  {
    id: "challenge-react-state",
    topic: "React Internals",
    title: "Asinxron State Yangilanishi",
    difficulty: "Medium",
    codeSnippet: `const [count, setCount] = useState(0);

const handleDoubleIncrement = () => {
  setCount(count + 1);
  setCount(count + 1);
};
// Agar boshlang'ich count = 0 bo'lsa, bosilgandan so'ng count nechi bo'ladi?`,
    question: "Yuqoridagi funksiya bir marta chaqirilganda, React yangi renderda count qiymatini qanday belgilaydi?",
    options: [
      {
        id: "opt-1",
        label: "count = 1 bo'ladi (chunki har ikkala chaqiruv bitta closure qiymatidan foydalanadi)",
        explanation: "Ajoyib! Har ikkala `setCount(count + 1)` chaqiruvida `count` 0 bo'lgani sababli oxirgi natija 1 bo'ladi.",
      },
      {
        id: "opt-2",
        label: "count = 2 bo'ladi (chunki ikki marta chaqirildi)",
        explanation: "Noto'g'ri: `setCount(prev => prev + 1)` ishlatilmagan.",
      },
      {
        id: "opt-3",
        label: "Xatolik yuz beradi (Infinite re-render)",
        explanation: "Noto'g'ri: bu xatolik emas, oddiy batching hodisasi.",
      },
      {
        id: "opt-4",
        label: "count = 0 bo'lib qoladi",
        explanation: "Noto'g'ri: state yangilanadi, lekin faqat 1 ga oshadi.",
      },
    ],
    correctOptionId: "opt-1",
    detailedSolution: "React state yangilanishlarini batch qiladi. Closure snapshotida `count === 0` bo'lgani uchun har ikkala `setCount(0 + 1)` 1 ga o'rnatadi. Agar `2` bo'lishi kerak bo'lsa, `setCount(c => c + 1)` functional updater kerak.",
    xpReward: 75,
  },
  {
    id: "challenge-time-complexity",
    topic: "Algoritmik Murakkablik",
    title: "Binary Tree Balanslangan Qidirish",
    difficulty: "Easy",
    codeSnippet: `// N ta tugunga ega to'liq balanslangan Binary Search Tree
// Eng yomon holatdagi qidiruv vaqti:`,
    question: "N ta elementdan iborat mukammal balanslangan BST daraxtida qidiruv vaqt murakkabligi nima?",
    options: [
      {
        id: "opt-1",
        label: "O(log N)",
        explanation: "To'g'ri! Har bir qadamda daraxtning yarmi qisqaradi, bu esa logarifmik vaqt talab qiladi.",
      },
      {
        id: "opt-2",
        label: "O(N)",
        explanation: "Noto'g'ri: O(N) faqat degeneratsiyalangan (chiziqli bog'langan) daraxtda bo'ladi.",
      },
      {
        id: "opt-3",
        label: "O(1)",
        explanation: "Noto'g'ri: O(1) Hash Map qidiruviga xos.",
      },
      {
        id: "opt-4",
        label: "O(N log N)",
        explanation: "Noto'g'ri: O(N log N) odatda saralash algoritmlari (Merge Sort) vaqti.",
      },
    ],
    correctOptionId: "opt-1",
    detailedSolution: "Balanslangan BST balandligi h = log2(N) ga teng. Har bir taqqoslashda bitta shox tanlanadi, shuning uchun eng yomon holat O(log N) dir.",
    xpReward: 50,
  },
];
