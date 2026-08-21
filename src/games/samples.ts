/**
 * Sample JSON configurations for each game type in Codegarten.
 * Used by the /writer inspector so authors can click "Namuna JSON ni yuklash"
 * and immediately have a working template to customize.
 */

export interface GameSampleConfig {
  gameId: string;
  gameName: string;
  description: string;
  sample: Record<string, any>;
}

export const GAME_SAMPLES: Record<string, GameSampleConfig> = {
  "robot-grid": {
    gameId: "robot-grid",
    gameName: "Robot Marshruti (Robot Grid)",
    description: "Robotni maydon bo'ylab yulduzga olib borish dasturi",
    sample: {
      grid: 5,
      start: { x: 0, y: 0 },
      facing: "right",
      target: { x: 3, y: 4 },
      slots: 5,
      hint: "Robotni burilishlar va oldinga qadamlar orqali nishondagi yulduzga olib boring.",
    },
  },

  "sequence-order": {
    gameId: "sequence-order",
    gameName: "Ketma-ketlik (Sequence Order)",
    description: "Qadamlarni to'g'ri mantiqiy tartibda joylashtirish",
    sample: {
      steps: [
        "1. Choynakka toza suv quyish",
        "2. Suvni qaynaguncha qizdirish",
        "3. Quruq choy solish",
        "4. Qaynagan suvni quyish",
        "5. 5 daqiqa damlab qo'yish",
      ],
      hint: "Choy damlash algoritmi qadamlarini to'g'ri tartibda joylashtiring.",
    },
  },

  "loop-repeat": {
    gameId: "loop-repeat",
    gameName: "Sikl va Takrorlash (Loop Repeat)",
    description: "Kataklar naqshini sikl orqali takrorlash",
    sample: {
      pattern: ["#26B54F", "#7C5CE0"],
      repeatCount: 4,
      hint: "2 katakli naqshni 4 marta takrorlab, 8 katakli zanjir hosil qiling.",
    },
  },

  "condition-branch": {
    gameId: "condition-branch",
    gameName: "Shart va Tarmoqlanish (Condition Branch)",
    description: "If/Else shartlariga ko'ra to'g'ri amalni tanlash",
    sample: {
      condition: "quvvat < 20",
      ifAction: "Tejash rejimini yoqish",
      elseAction: "Oddiy rejimda davom etish",
      scenario: "Telefon quvvati 15% qoldi. Dastur qaysi amalni bajaradi?",
      hint: "Shart to'g'ri bo'lganda (True) bajariladigan amalni aniqlang.",
    },
  },

  "variable-trace": {
    gameId: "variable-trace",
    gameName: "O'zgaruvchilar Izi (Variable Trace)",
    description: "O'zgaruvchilar qiymati qadam-baqadam qanday o'zgarishini topish",
    sample: {
      codeLines: [
        "son = 4",
        "kopaytiruvchi = 3",
        "natija = son * kopaytiruvchi",
      ],
      targetVariable: "natija",
      expectedValue: "12",
      options: ["4", "7", "12", "16"],
      hint: "Kod bajarilgandan so'ng 'natija' o'zgaruvchisining yakuniy qiymatini hisoblang.",
    },
  },

  "function-factory": {
    gameId: "function-factory",
    gameName: "Funksiya Fabrikasi (Function Factory)",
    description: "Funksiyaga berilgan argumentlarga mos natijani aniqlash",
    sample: {
      functionName: "ustun",
      parameters: ["balandlik", "rang"],
      task: "ustun(4, 'yashil') chaqirilganda qanday natija chiqadi?",
      expectedResult: "4 qavatli yashil ustun",
      options: [
        "4 qavatli yashil ustun",
        "4 qavatli qizil ustun",
        "2 qavatli yashil ustun",
        "1 qavatli ko'k ustun",
      ],
      hint: "Funksiya qabul qilgan argumentlarni tartibi bo'yicha moslang.",
    },
  },

  "shape-color": {
    gameId: "shape-color",
    gameName: "Shakl va Rang (Shape Color)",
    description: "Geometrik shakl va rang buyruqlarini moslashtirish",
    sample: {
      targetShape: "kvadrat",
      targetColor: "ko'k",
      command: "chiz('kvadrat', 'ko'k')",
      hint: "Ko'k rangli kvadrat chizish buyrug'ini bering.",
    },
  },

  "debug-extra": {
    gameId: "debug-extra",
    gameName: "Xatoni Topish (Debug Extra)",
    description: "Algoritmdagi xato yoki ortiqcha buyruqni aniqlab o'chirish",
    sample: {
      steps: [
        "1. Xonaga kirish",
        "2. Eshikni yopish",
        "3. Suv havzasida suzish",
        "4. Chiroqni yoqish",
        "5. Kitob o'qish",
      ],
      extraStepIndex: 2,
      hint: "Xonada kitob o'qish algoritmidagi ma'nosiz / ortiqcha qadamni toping.",
    },
  },

  "algo-race": {
    gameId: "algo-race",
    gameName: "Algoritm Poygasi (Algo Race)",
    description: "Ikki algoritm tezligi va samaradorligini solishtirish",
    sample: {
      algoA: "Chiziqli qidiruv (Linear Search)",
      algoB: "Ikkilik qidiruv (Binary Search)",
      dataSize: "10,000 ta saralangan son",
      winner: "algoB",
      hint: "Saralangan katta massivda Ikkilik qidiruv ancha kam qadamda topadi.",
    },
  },
};

export function getGameSample(gameId: string | undefined): GameSampleConfig | undefined {
  if (!gameId) return undefined;
  return GAME_SAMPLES[gameId];
}
