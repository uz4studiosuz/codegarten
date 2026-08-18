import { LessonContent, L, s, t, q } from "./types";

/** MODULE 5 — O'zgaruvchilar va Xotira (Variables & Memory Storage) */
export const module5: Record<string, LessonContent> = {
  "m5-l1-1": L(
    "O'zgaruvchi nima va u xotirada qanday saqlanishini tushunib olasiz.",
    [
      s("Nomlangan quti", [
        "Variable (o'zgaruvchi) — qiymat saqlanadigan, nom berilgan xotira joyi. Nom orqali qiymatni keyin topib, o'qib yoki o'zgartirish mumkin.",
        "Uni yorliq yozilgan quti deb tasavvur qiling: quti ustida \"yosh\" yozilgan, ichida 20 soni turadi.",
      ], {
        code: {
          caption: "O'zgaruvchi yaratish va o'qish",
          lines: [
            "yosh = 20            // yaratildi, qiymat berildi",
            "chiqar(yosh)         // 20",
            "",
            "ism = \"Ali\"",
            "chiqar(ism)          // Ali",
          ],
        },
      }),
      s("Nima uchun kerak", [
        "O'zgaruvchisiz har qiymatni qayta-qayta yozishga to'g'ri keladi. O'zgaruvchi bilan qiymat bir joyda saqlanadi va nom orqali istalgan joyda ishlatiladi.",
        "Bundan tashqari nom kodni tushunarli qiladi: 0.2 emas, soliq_foizi yozilsa, ma'no darhol ayon bo'ladi.",
      ], {
        callout: "O'zgaruvchi — nom berilgan xotira joyi.",
      }),
    ],
    [
      t("variable", "o'zgaruvchi", "Qiymat saqlanadigan, nom berilgan xotira joyi."),
      t("value", "qiymat", "O'zgaruvchida saqlanayotgan ma'lumot."),
      t("memory", "xotira", "Kompyuterda ma'lumot vaqtincha saqlanadigan joy."),
    ],
    [
      q(
        "O'zgaruvchi nima uchun kodni tushunarli qiladi?",
        ["Kodni qisqartiradi", "Nom qiymatning ma'nosini aytib turadi", "Xotirani tozalaydi"],
        1,
        "soliq_foizi kabi mazmunli nom 0.2 sonidan ancha tushunarli."
      ),
    ]
  ),

  "m5-l1-2": L(
    "O'zgaruvchiga qiymat berish amalini o'rganasiz.",
    [
      s("Qiymat berish", [
        "Assignment (qiymat berish) — o'zgaruvchiga qiymat yozish amali. Ko'p tillarda = belgisi bilan yoziladi.",
        "Muhim nuqta: = matematikadagi tenglik emas. U \"o'ngdagi qiymatni chapdagi qutiga sol\" degan buyruq.",
      ], {
        code: {
          caption: "= matematik tenglik emas",
          lines: [
            "son = 5",
            "son = son + 1     // matematikada bu mumkin emas",
            "",
            "// Bu quyidagini bildiradi:",
            "// 1. son + 1 hisoblanadi -> 6",
            "// 2. natija son ga yoziladi -> son = 6",
          ],
        },
      }),
      s("O'ng tomon avval hisoblanadi", [
        "Qiymat berishda har doim o'ng tomon to'liq hisoblanib, keyin natija chap tomondagi o'zgaruvchiga yoziladi. Bu tartibni bilish o'zgaruvchini o'zgartirishni tushunish uchun kalit.",
      ], {
        callout: "= o'ngdagi natijani chapdagi o'zgaruvchiga yozadi.",
      }),
    ],
    [
      t("assignment", "qiymat berish", "O'zgaruvchiga qiymat yozish amali."),
      t("declaration", "e'lon", "O'zgaruvchini birinchi marta yaratish."),
      t("evaluation", "hisoblanish", "Ifodaning qiymatga aylanishi jarayoni."),
    ],
    [
      q(
        "son = 5 dan keyin son = son + 3 bajarilsa, son qanday bo'ladi?",
        ["5", "8", "3"],
        1,
        "Avval o'ng tomon hisoblanadi: 5 + 3 = 8. Keyin 8 son ga yoziladi."
      ),
    ]
  ),

  "m5-l1-3": L(
    "O'zgaruvchi qiymatini o'zgartirib, holatni kuzatishni o'rganasiz.",
    [
      s("Qiymat almashadi", [
        "O'zgaruvchining nomi \"o'zgaruvchi\" — chunki uning qiymati dastur ishlashi davomida o'zgarishi mumkin.",
        "Yangi qiymat yozilganda eski qiymat butunlay yo'qoladi. Kompyuter eski qiymatni eslab qolmaydi.",
      ], {
        code: {
          caption: "Qiymat tarixi saqlanmaydi",
          lines: [
            "ball = 10",
            "ball = 25",
            "ball = 40",
            "",
            "chiqar(ball)   // 40",
            "// 10 va 25 butunlay yo'qoldi",
          ],
        },
      }),
      s("Holatni kuzatish", [
        "Dasturdagi barcha o'zgaruvchilarning ayni damdagi qiymatlari birgalikda program state (dastur holati) deb ataladi. Xatoni topishda holatni qator-qator kuzatib borish eng ishonchli usul.",
      ], {
        callout: "Yangi qiymat eski qiymatni butunlay o'chiradi.",
      }),
    ],
    [
      t("mutation", "o'zgartirish", "O'zgaruvchi qiymatini yangisiga almashtirish."),
      t("program state", "dastur holati", "Barcha o'zgaruvchilarning ayni damdagi qiymatlari."),
      t("overwrite", "ustiga yozish", "Eski qiymatni yangisi bilan almashtirish."),
    ],
    [
      q(
        "O'zgaruvchiga yangi qiymat yozilsa, eski qiymat nima bo'ladi?",
        ["Saqlanib qoladi", "Butunlay yo'qoladi", "Ikkinchi qutiga ko'chadi"],
        1,
        "O'zgaruvchi faqat bitta qiymat saqlaydi. Yangisi eskisini o'chiradi."
      ),
    ]
  ),

  "m5-l1-4": L(
    "1-bosqich: o'zgaruvchi, qiymat berish va holat bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "O'zgaruvchi (variable) — nom berilgan xotira joyi.",
        "Qiymat berish (assignment) = belgisi bilan bajariladi va matematik tenglik emas.",
        "O'ng tomon avval to'liq hisoblanadi, keyin natija chapga yoziladi.",
        "Yangi qiymat eskisini butunlay o'chiradi; barcha qiymatlar birgalikda dastur holatini (program state) tashkil qiladi.",
      ], {
        callout: "Keyingi bosqichda ma'lumot turlari bilan ishlaymiz.",
      }),
    ],
    [
      t("variable", "o'zgaruvchi", "Nomlangan xotira joyi."),
      t("assignment", "qiymat berish", "Qiymat yozish amali."),
    ],
    [
      q(
        "x = 3 dan keyin x = x * 4 bajarilsa, x qanday bo'ladi?",
        ["3", "12", "4"],
        1,
        "O'ng tomon avval hisoblanadi: 3 * 4 = 12."
      ),
      q(
        "Dastur holati (program state) nima?",
        ["Kod uzunligi", "Barcha o'zgaruvchilarning ayni damdagi qiymatlari", "Xotira hajmi"],
        1,
        "Holat — dasturning ayni damdagi barcha qiymatlari to'plami."
      ),
    ]
  ),

  "m5-l2-1": L(
    "Ma'lumot turlari va ular orasidagi farqni o'rganasiz.",
    [
      s("Har qiymatning turi bor", [
        "Data type (ma'lumot turi) qiymat qanday saqlanishini va u bilan qanday amallar mumkinligini belgilaydi.",
        "Asosiy turlar: number (son), string (matn), boolean (mantiqiy qiymat).",
      ], {
        code: {
          caption: "Uch asosiy tur",
          lines: [
            "son = 42              // number (son)",
            "matn = \"42\"           // string (matn)",
            "mantiqiy = true       // boolean (mantiqiy)",
            "",
            "// Diqqat: 42 va \"42\" bir xil emas!",
          ],
        },
      }),
      s("Tur amalni o'zgartiradi", [
        "+ amali sonlar uchun qo'shish, matnlar uchun ulash (concatenation — birlashtirish) ma'nosini bildiradi. Shu sababli 2 + 3 = 5, lekin \"2\" + \"3\" = \"23\".",
      ], {
        callout: "Bir xil amal turli turlarda turli ish bajaradi.",
      }),
    ],
    [
      t("data type", "ma'lumot turi", "Qiymatning turi — son, matn yoki mantiqiy."),
      t("string", "matn", "Belgilar ketma-ketligi, qo'shtirnoq ichida yoziladi."),
      t("concatenation", "birlashtirish", "Ikki matnni ulab bitta matn hosil qilish."),
    ],
    [
      q(
        "\"2\" + \"3\" ifodasining natijasi qanday?",
        ["5", "\"23\"", "Xato"],
        1,
        "Bular matn, shuning uchun + ularni ulaydi: \"23\". Sonlar bo'lsa natija 5 bo'lardi."
      ),
    ]
  ),

  "m5-l2-2": L(
    "Ikki o'zgaruvchi qiymatini almashtirishni o'rganasiz.",
    [
      s("Klassik masala", [
        "Ikki o'zgaruvchi qiymatini almashtirish oddiy ko'rinadi, lekin to'g'ridan-to'g'ri urinish ishlamaydi: birinchi qiymat yo'qoladi.",
        "Yechim — temporary variable (vaqtinchalik o'zgaruvchi) ishlatish.",
      ], {
        code: {
          caption: "Xato va to'g'ri yechim",
          lines: [
            "a = 1   b = 2",
            "",
            "// XATO: a ning qiymati yo'qoldi",
            "a = b     // a = 2",
            "b = a     // b = 2  (1 emas!)",
            "",
            "// TO'G'RI: vaqtinchalik o'zgaruvchi",
            "vaqt = a  // vaqt = 1",
            "a = b     // a = 2",
            "b = vaqt  // b = 1",
          ],
        },
      }),
      s("Nima uchun shunday", [
        "a = b bajarilgach a ning eski qiymati o'chib ketadi. Uni oldindan saqlab qo'ymasa, tiklashning imkoni bo'lmaydi.",
      ], {
        callout: "Qiymatni o'chirishdan oldin saqlab qo'ying.",
      }),
    ],
    [
      t("temporary variable", "vaqtinchalik o'zgaruvchi", "Qiymatni vaqtincha saqlash uchun ishlatiladigan o'zgaruvchi."),
      t("swap", "almashtirish", "Ikki o'zgaruvchi qiymatini o'rin almashtirish."),
      t("data loss", "ma'lumot yo'qolishi", "Qiymat ustiga yozilib, tiklanmas bo'lib qolishi."),
    ],
    [
      q(
        "Ikki qiymatni almashtirish uchun nima kerak?",
        ["Faqat ikki qatorlik kod", "Vaqtinchalik uchinchi o'zgaruvchi", "Sikl"],
        1,
        "Birinchi qiymatni saqlab qo'ymasa u yo'qoladi. Shuning uchun vaqtinchalik o'zgaruvchi kerak."
      ),
    ]
  ),

  "m5-l2-3": L(
    "Hisoblagich yasab, qiymatni bosqichma-bosqich oshirishni o'rganasiz.",
    [
      s("Hisoblagich naqshi", [
        "Hisoblagich — nol yoki boshqa qiymatdan boshlanib, hodisa yuz berganda oshib boradigan o'zgaruvchi.",
        "Bu accumulator (yig'uvchi) naqshining eng oddiy shakli: o'zgaruvchi o'z qiymatiga tayanib yangilanadi.",
      ], {
        code: {
          caption: "Hisoblagich va yig'uvchi",
          lines: [
            "// Hisoblagich",
            "soni = 0",
            "repeat (5) { soni = soni + 1 }",
            "chiqar(soni)      // 5",
            "",
            "// Yig'uvchi",
            "jami = 0",
            "jami = jami + 10",
            "jami = jami + 25",
            "chiqar(jami)      // 35",
          ],
        },
      }),
      s("Boshlang'ich qiymat muhim", [
        "Hisoblagichni boshlang'ich qiymat bermasdan ishlatish xatoga olib keladi. Yig'uvchi uchun 0, ko'paytiruvchi uchun 1 dan boshlash kerak.",
      ], {
        callout: "Yig'uvchi 0 dan, ko'paytiruvchi 1 dan boshlanadi.",
      }),
    ],
    [
      t("accumulator", "yig'uvchi", "Natijani bosqichma-bosqich to'plovchi o'zgaruvchi."),
      t("initialization", "boshlang'ich qiymat", "O'zgaruvchiga birinchi qiymatni berish."),
      t("counter", "hisoblagich", "Hodisalar sonini sanovchi o'zgaruvchi."),
    ],
    [
      q(
        "Yig'uvchi o'zgaruvchini qaysi qiymatdan boshlash kerak?",
        ["1", "0", "Boshlang'ich qiymat kerak emas"],
        1,
        "Qo'shish uchun 0 neytral qiymat. Ko'paytirish uchun esa 1 dan boshlanadi."
      ),
    ]
  ),

  "m5-l2-4": L(
    "2-bosqich: turlar, almashtirish va yig'uvchi bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Ma'lumot turi (data type) qiymat bilan qanday amallar mumkinligini belgilaydi.",
        "\"2\" + \"3\" = \"23\" — matnlarda + birlashtiradi (concatenation).",
        "Ikki qiymatni almashtirish uchun vaqtinchalik o'zgaruvchi kerak.",
        "Yig'uvchi (accumulator) 0 dan, ko'paytiruvchi 1 dan boshlanadi.",
      ], {
        callout: "Keyingi bosqichda bitta nom ostida ko'p qiymat saqlashni o'rganamiz.",
      }),
    ],
    [
      t("data type", "ma'lumot turi", "Qiymat turi."),
      t("accumulator", "yig'uvchi", "Natijani to'plovchi o'zgaruvchi."),
    ],
    [
      q(
        "2 + 3 va \"2\" + \"3\" natijalari nima uchun farq qiladi?",
        ["Farq qilmaydi", "Turlari boshqa: sonlar qo'shiladi, matnlar ulanadi", "Ikkinchisi xato"],
        1,
        "+ amali turga qarab boshqa ish bajaradi."
      ),
      q(
        "Vaqtinchalik o'zgaruvchi nima uchun kerak?",
        ["Kodni chiroyli qilish uchun", "Qiymat ustiga yozilishidan oldin uni saqlash uchun", "Xotirani tejash uchun"],
        1,
        "Aks holda birinchi qiymat yo'qoladi va tiklanmaydi."
      ),
    ]
  ),

  "m5-l3-1": L(
    "Ro'yxat nima va u qanday tuzilishini o'rganasiz.",
    [
      s("Bitta nom, ko'p qiymat", [
        "Array yoki list (ro'yxat) — bitta nom ostida bir nechta qiymatni tartib bilan saqlovchi tuzilma.",
        "100 ta o'quvchi bali uchun 100 ta o'zgaruvchi emas, bitta ro'yxat yaratiladi.",
      ], {
        code: {
          caption: "Ro'yxat yaratish",
          lines: [
            "ballar = [85, 92, 78, 95]",
            "",
            "chiqar(ballar.uzunlik)   // 4",
            "chiqar(ballar[0])        // 85 — birinchi element",
          ],
        },
      }),
      s("Tartib saqlanadi", [
        "Ro'yxatdagi elementlar tartibi saqlanadi — bu muhim xususiyat. Birinchi qo'shilgan element birinchi o'rinda turadi.",
      ], {
        callout: "Ro'yxat — tartiblangan qiymatlar to'plami.",
      }),
    ],
    [
      t("array", "massiv", "Tartiblangan qiymatlar to'plamini saqlovchi tuzilma."),
      t("element", "element", "Ro'yxatdagi bitta qiymat."),
      t("length", "uzunlik", "Ro'yxatdagi elementlar soni."),
    ],
    [
      q(
        "Ro'yxat (array) nima uchun ishlatiladi?",
        ["Faqat sonlarni saqlash uchun", "Bitta nom ostida ko'p qiymatni tartib bilan saqlash uchun", "Kodni tezlashtirish uchun"],
        1,
        "Ro'yxat ko'p bog'liq qiymatni yagona nom bilan boshqarish imkonini beradi."
      ),
    ]
  ),

  "m5-l3-2": L(
    "Indeks orqali ro'yxat elementiga murojaat qilishni o'rganasiz.",
    [
      s("Indeks 0 dan boshlanadi", [
        "Ro'yxatdagi element o'rni index (indeks) deb ataladi. Ko'p tillarda birinchi element indeksi 0 bo'ladi, ikkinchisi 1 va shu tarzda.",
        "Shuning uchun n elementli ro'yxatning oxirgi element indeksi n - 1 bo'ladi.",
      ], {
        code: {
          caption: "Indekslar",
          lines: [
            "ranglar = [\"qizil\", \"yashil\", \"ko'k\"]",
            "//            0         1         2",
            "",
            "chiqar(ranglar[0])   // qizil",
            "chiqar(ranglar[2])   // ko'k",
            "chiqar(ranglar[3])   // XATO — bunday indeks yo'q",
          ],
        },
      }),
      s("Chegaradan chiqish", [
        "Mavjud bo'lmagan indeksga murojaat qilish out of bounds (chegaradan chiqish) xatosiga olib keladi. Shuning uchun indeks har doim 0 dan uzunlik - 1 oralig'ida bo'lishi kerak.",
      ], {
        callout: "n elementli ro'yxat indekslari: 0 dan n-1 gacha.",
      }),
    ],
    [
      t("index", "indeks", "Ro'yxatdagi elementning tartib raqami."),
      t("out of bounds", "chegaradan chiqish", "Mavjud bo'lmagan indeksga murojaat qilish xatosi."),
      t("zero-based", "noldan", "Indeksning 0 dan boshlanishi."),
    ],
    [
      q(
        "5 elementli ro'yxatning oxirgi element indeksi qanday?",
        ["5", "4", "6"],
        1,
        "Indeks 0 dan boshlanadi: 0,1,2,3,4. Oxirgisi — 4, ya'ni uzunlik - 1."
      ),
    ]
  ),

  "m5-l3-3": L(
    "Sikl bilan ro'yxatni aylanib chiqishni o'rganasiz.",
    [
      s("Ro'yxat va sikl", [
        "Ro'yxatning kuchi sikl bilan birgalikda ochiladi. Sikl har elementni birma-bir olib, ular ustida bir xil amal bajaradi.",
        "Bu iteration (aylanib chiqish) deb ataladi va ma'lumot bilan ishlashning asosiy usuli.",
      ], {
        code: {
          caption: "Ro'yxatni aylanib chiqish",
          lines: [
            "ballar = [85, 92, 78, 95]",
            "jami = 0",
            "",
            "for (i = 0; i < ballar.uzunlik; i++) {",
            "  jami = jami + ballar[i]",
            "}",
            "",
            "o'rtacha = jami / ballar.uzunlik",
            "chiqar(o'rtacha)    // 87.5",
          ],
        },
      }),
      s("Uzunlikni qattiq yozmang", [
        "Sikl chegarasida 4 emas, ballar.uzunlik yozish kerak. Shunda ro'yxat o'zgarsa ham kod ishlashda davom etadi.",
      ], {
        callout: "Chegarada ro'yxat uzunligini ishlatish — kodni moslashuvchan qiladi.",
      }),
    ],
    [
      t("iteration", "aylanib chiqish", "Ro'yxat elementlarini birma-bir ko'rib chiqish."),
      t("traversal", "kezish", "Butun tuzilmani boshidan oxirigacha ko'rib chiqish."),
      t("aggregate", "yig'ma", "Ko'p qiymatdan bitta natija hosil qilish (yig'indi, o'rtacha)."),
    ],
    [
      q(
        "Sikl chegarasida 4 emas ballar.uzunlik yozishning foydasi nima?",
        ["Tezroq ishlaydi", "Ro'yxat o'zgarsa ham kod ishlashda davom etadi", "Kod qisqaradi"],
        1,
        "Uzunlikni qattiq yozish ro'yxat o'zgarganda xatoga olib keladi."
      ),
    ]
  ),

  "m5-l3-4": L(
    "5-modul: o'zgaruvchilar va ro'yxatlar bo'yicha yakuniy takrorlash.",
    [
      s("Modul xulosasi", [
        "O'zgaruvchi (variable) — nomlangan xotira joyi; qiymat berish (assignment) o'ngdagi natijani chapga yozadi.",
        "Ma'lumot turi (data type) mumkin bo'lgan amallarni belgilaydi.",
        "Ikki qiymatni almashtirish uchun vaqtinchalik o'zgaruvchi kerak.",
        "Ro'yxat (array) bitta nom ostida ko'p qiymat saqlaydi; indeks (index) 0 dan boshlanadi.",
        "Sikl bilan ro'yxatni aylanib chiqish (iteration) ma'lumot bilan ishlashning asosi.",
      ], {
        callout: "Endi algoritmlarning tezligini o'lchashga o'tamiz.",
      }),
    ],
    [
      t("variable", "o'zgaruvchi", "Nomlangan xotira joyi."),
      t("array", "massiv", "Tartiblangan qiymatlar to'plami."),
      t("index", "indeks", "Element o'rni, 0 dan boshlanadi."),
    ],
    [
      q(
        "10 elementli ro'yxatda to'g'ri indekslar oralig'i qanday?",
        ["1 dan 10 gacha", "0 dan 9 gacha", "0 dan 10 gacha"],
        1,
        "Indeks 0 dan boshlanadi, shuning uchun oxirgisi uzunlik - 1 = 9."
      ),
      q(
        "Ma'lumot turi (data type) nimani belgilaydi?",
        ["Faqat xotira hajmini", "Qiymat bilan qanday amallar mumkinligini", "O'zgaruvchi nomini"],
        1,
        "Tur amallarning ma'nosini belgilaydi — masalan + sonlarda qo'shadi, matnlarda ulaydi."
      ),
    ]
  ),
};
