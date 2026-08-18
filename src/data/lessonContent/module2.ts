import { LessonContent, L, s, t, q } from "./types";

/** MODULE 2 — Sikllar (Loops & Pattern Recognition) */
export const module2: Record<string, LessonContent> = {
  "m2-l1-1": L(
    "Koddagi takrorlanuvchi naqshni ko'rishni va uni ajratib olishni o'rganasiz.",
    [
      s("Takrorlanish — signal", [
        "Kodda bir xil qatorlar ketma-ket kelsa, bu naqsh (pattern) borligini bildiradi. Naqsh esa sikl bilan qisqartirilishi mumkin degani.",
        "Yaxshi dasturchi kodni yozishdan oldin \"bu yerda nima takrorlanadi?\" degan savolni beradi.",
      ], {
        code: {
          caption: "Naqshni toping",
          lines: [
            "oldinga(100)",
            "o'ngga(90)",
            "oldinga(100)",
            "o'ngga(90)",
            "oldinga(100)",
            "o'ngga(90)",
            "// \"oldinga + o'ngga\" 3 marta takrorlanadi",
          ],
        },
      }),
      s("DRY tamoyili", [
        "Dasturlashda DRY (Don't Repeat Yourself — o'zingizni takrorlamang) degan qoida bor. Bir xil kodni ko'chirib yozish keyinchalik muammo tug'diradi: o'zgartirish kerak bo'lsa, hamma joyda o'zgartirishga to'g'ri keladi.",
      ], {
        callout: "Ikki marta ko'chirib yozdingizmi — sikl haqida o'ylash vaqti keldi.",
      }),
    ],
    [
      t("pattern", "naqsh", "Kodda takrorlanuvchi bir xil qatorlar guruhi."),
      t("DRY", "takrorlamaslik", "Don't Repeat Yourself — bir xil kodni ko'chirmaslik tamoyili."),
      t("repetition", "takrorlanish", "Bir amalning bir necha marta bajarilishi."),
    ],
    [
      q(
        "Kodda bir xil ikki qator 5 marta ketma-ket kelsa, bu nimani bildiradi?",
        ["Kod to'g'ri yozilgan", "Bu yerda naqsh bor — sikl ishlatish mumkin", "Kodni o'chirish kerak"],
        1,
        "Takrorlanish — sikl uchun signal. Naqshni ajratib, siklga o'rash mumkin."
      ),
    ]
  ),

  "m2-l1-2": L(
    "Bir xil buyruqlarni ko'chirib yozishning muammolarini amalda ko'rasiz.",
    [
      s("Ko'chirib yozishning narxi", [
        "Bir xil kodni ko'chirib yozish oson ko'rinadi, lekin uchta muammo tug'diradi: kod uzayadi, xato ehtimoli oshadi va o'zgartirish qiyinlashadi.",
        "Agar 20 marta takrorlangan kodda bitta qiymatni o'zgartirish kerak bo'lsa, 20 joyda o'zgartirasiz — bittasini unutsangiz xato paydo bo'ladi.",
      ], {
        code: {
          caption: "Bu kodda masofani 150 ga o'zgartirish kerak bo'lsa...",
          lines: [
            "oldinga(100)",
            "o'ngga(90)",
            "oldinga(100)",
            "o'ngga(90)",
            "oldinga(100)   // ... 3 joyda o'zgartirish kerak",
            "o'ngga(90)",
          ],
        },
      }),
      s("Yechim yo'nalishi", [
        "Sikl bilan bir xil kod faqat bitta joyda yoziladi. O'zgartirish kerak bo'lsa — bir joyda o'zgartirasiz, hammasi o'zgaradi.",
      ], {
        callout: "Ko'chirib yozilgan kod — kelajakdagi xatoning manzili.",
      }),
    ],
    [
      t("duplication", "takroriylik", "Bir xil kodning bir necha joyda yozilgani."),
      t("maintenance", "qo'llab-quvvatlash", "Kodni keyinchalik o'zgartirish va tuzatish ishi."),
      t("single source", "yagona manba", "Qiymat yoki mantiq faqat bitta joyda saqlanishi."),
    ],
    [
      q(
        "20 marta ko'chirilgan kodda qiymatni o'zgartirish kerak. Asosiy xavf nima?",
        ["Kod chiroyli ko'rinmaydi", "Bir joyni unutib qoldirish va xato yuzaga kelishi", "Kompyuter sekinlashadi"],
        1,
        "Qo'lda ko'p joyni o'zgartirishda bittasini unutish juda oson — bu tipik xato manbai."
      ),
    ]
  ),

  "m2-l1-3": L(
    "repeat bloki bilan takrorlanuvchi kodni qisqartirishni o'rganasiz.",
    [
      s("repeat qanday ishlaydi", [
        "Loop (sikl) — kodning bir bo'lagini belgilangan marta takrorlaydigan konstruksiya. Eng oddiy shakli — repeat (takrorlash).",
        "repeat(n) { ... } yozuvi ichidagi kodni aynan n marta bajaradi.",
      ], {
        code: {
          caption: "6 qator -> 3 qator",
          lines: [
            "// Sikl bilan:",
            "repeat (3) {",
            "  oldinga(100)",
            "  o'ngga(90)",
            "}",
            "",
            "// Natija ilgarigidek, lekin qiymat bir joyda",
          ],
        },
      }),
      s("Sikl tanasi", [
        "Qavs ichidagi kod loop body (sikl tanasi) deb ataladi. Sikl tanasi har aylanishda to'liq qaytadan bajariladi.",
      ], {
        callout: "repeat(n) — sikl tanasini aynan n marta bajaradi.",
      }),
    ],
    [
      t("loop", "sikl", "Kod bo'lagini bir necha marta takrorlovchi konstruksiya."),
      t("loop body", "sikl tanasi", "Sikl ichidagi, har aylanishda bajariladigan kod."),
      t("iteration", "aylanish", "Sikl tanasining bir marta bajarilishi."),
    ],
    [
      q(
        "repeat (4) { oldinga(10) } buyrug'i nima qiladi?",
        ["Bir marta 40 masofaga yuradi", "oldinga(10) ni 4 marta bajaradi", "4 masofaga yuradi"],
        1,
        "Sikl tanasi 4 marta bajariladi, ya'ni har biri 10 masofadan 4 marta harakat bo'ladi."
      ),
    ]
  ),

  "m2-l1-4": L(
    "Sikl yordamida kvadrat chizib, takrorlanish sonini to'g'ri hisoblashni o'rganasiz.",
    [
      s("Kvadratning tuzilishi", [
        "Kvadratning 4 ta teng qirrasi va 4 ta burchagi bor. Har bir burchakda 90 daraja burilish kerak.",
        "Ya'ni takrorlanuvchi naqsh — \"bir qirra chiz, keyin burilish\" — va u aynan 4 marta bajariladi.",
      ], {
        code: {
          caption: "Kvadrat — 4 marta bir xil ish",
          lines: [
            "repeat (4) {",
            "  oldinga(100)   // qirra",
            "  o'ngga(90)     // burchak",
            "}",
          ],
        },
      }),
      s("Umumiy formula", [
        "Har qanday muntazam ko'pburchak uchun: burilish burchagi = 360 / qirralar soni. Uchburchak uchun 120, beshburchak uchun 72 daraja.",
      ], {
        callout: "Burilish burchagi = 360 / qirralar soni.",
      }),
    ],
    [
      t("polygon", "ko'pburchak", "Bir necha to'g'ri chiziqdan tashkil topgan yopiq shakl."),
      t("loop count", "takrorlanish soni", "Sikl tanasi necha marta bajarilishi."),
      t("angle", "burchak", "Burilish kattaligi, darajada o'lchanadi."),
    ],
    [
      q(
        "Muntazam beshburchak chizish uchun burilish burchagi qancha bo'ladi?",
        ["90 daraja", "72 daraja", "60 daraja"],
        1,
        "360 / 5 = 72 daraja. Formula har qanday muntazam ko'pburchak uchun ishlaydi."
      ),
    ]
  ),

  "m2-l1-5": L(
    "1-bosqich: naqsh, DRY va repeat sikli bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Takrorlanuvchi qatorlar naqsh (pattern) borligini bildiradi.",
        "DRY tamoyili bir xil kodni ko'chirib yozmaslikni talab qiladi.",
        "repeat(n) sikl tanasini (loop body) aynan n marta bajaradi.",
        "Muntazam ko'pburchakda burilish burchagi = 360 / qirralar soni.",
      ], {
        callout: "Keyingi bosqichda sikl hisoblagichi bilan ishlashni o'rganamiz.",
      }),
    ],
    [
      t("loop", "sikl", "Bosqichning asosiy tushunchasi."),
      t("DRY", "takrorlamaslik", "Bir xil kodni ko'chirmaslik tamoyili."),
    ],
    [
      q(
        "Sikl tanasi (loop body) nima?",
        ["Siklning nomi", "Sikl ichidagi, har aylanishda bajariladigan kod", "Sikl necha marta aylanishi"],
        1,
        "Sikl tanasi — qavs ichidagi kod. U har aylanishda to'liq qaytadan bajariladi."
      ),
      q(
        "Muntazam uchburchak uchun burilish burchagi qancha?",
        ["90", "120", "60"],
        1,
        "360 / 3 = 120 daraja."
      ),
    ]
  ),

  "m2-l2-1": L(
    "Sikl hisoblagichi nima va u qanday o'zgarishini tushunib olasiz.",
    [
      s("Hisoblagich — siklning xotirasi", [
        "Ko'p sikllarda counter (hisoblagich) bo'ladi — hozir nechanchi aylanish bajarilayotganini saqlaydigan qiymat.",
        "Hisoblagich odatda 0 yoki 1 dan boshlanadi va har aylanishda bittaga oshadi. Bu increment (oshirish) deb ataladi.",
      ], {
        code: {
          caption: "Hisoblagichli sikl",
          lines: [
            "for (i = 1; i <= 3; i = i + 1) {",
            "  chiz(i)      // i = 1, keyin 2, keyin 3",
            "}",
            "",
            "// i — counter (hisoblagich)",
          ],
        },
      }),
      s("Hisoblagichdan foydalanish", [
        "Hisoblagich qiymatini sikl tanasida ishlatish mumkin. Shunda har aylanish bir oz boshqacha natija beradi — masalan har safar uzunroq chiziq chiziladi.",
      ], {
        callout: "Hisoblagich sikl aylanishlarini bir-biridan farqlash imkonini beradi.",
      }),
    ],
    [
      t("counter", "hisoblagich", "Sikl nechanchi aylanishda turganini saqlovchi qiymat."),
      t("increment", "oshirish", "Qiymatni odatda bittaga oshirish amali."),
      t("for loop", "for sikli", "Hisoblagichi ochiq ko'rsatilgan sikl turi."),
    ],
    [
      q(
        "for (i = 1; i <= 3; i = i + 1) siklida i qanday qiymatlarni oladi?",
        ["1, 2, 3", "0, 1, 2", "1, 3"],
        0,
        "i 1 dan boshlanadi va 3 dan oshmaguncha bittaga oshib boradi: 1, 2, 3."
      ),
    ]
  ),

  "m2-l2-2": L(
    "Siklning boshlanish va tugash chegaralarini to'g'ri belgilashni o'rganasiz.",
    [
      s("Chegaralar muhim", [
        "Sikl qayerdan boshlanib qayerda tugashi boundary (chegara) deb ataladi. Chegarani bir birlikka xato qo'yish eng ko'p uchraydigan xato turi — u off-by-one error (bir birlik xatosi) deb ataladi.",
        "i <= 3 va i < 3 orasidagi farq bitta aylanish: birinchisi 3 marta, ikkinchisi 2 marta aylanadi.",
      ], {
        code: {
          caption: "Bitta belgi — bitta aylanish farqi",
          lines: [
            "for (i = 1; i <= 3; i++) // 3 aylanish: 1,2,3",
            "for (i = 1; i <  3; i++) // 2 aylanish: 1,2",
            "for (i = 0; i <  3; i++) // 3 aylanish: 0,1,2",
          ],
        },
      }),
      s("Tekshirish usuli", [
        "Chegarani tekshirishning eng oson yo'li — birinchi va oxirgi qiymatni qo'lda yozib ko'rish. Agar ikkisi ham to'g'ri bo'lsa, o'rtasi ham to'g'ri bo'ladi.",
      ], {
        callout: "Har doim birinchi va oxirgi aylanishni qo'lda tekshiring.",
      }),
    ],
    [
      t("boundary", "chegara", "Siklning boshlanish va tugash qiymatlari."),
      t("off-by-one", "bir birlik xatosi", "Sikl bir marta ko'p yoki kam aylanishiga olib keladigan xato."),
      t("condition", "shart", "Sikl davom etishini belgilovchi tekshiruv."),
    ],
    [
      q(
        "for (i = 0; i < 5; i++) sikli necha marta aylanadi?",
        ["4 marta", "5 marta", "6 marta"],
        1,
        "i qiymatlari 0,1,2,3,4 — jami 5 aylanish. 5 ning o'zi shartga kirmaydi."
      ),
    ]
  ),

  "m2-l2-3": L(
    "Sikl ichida qiymatlarni almashtirib, har aylanishda boshqa natija olasiz.",
    [
      s("Har aylanish — boshqa qiymat", [
        "Sikl faqat bir xil ishni takrorlash uchun emas. Hisoblagich yoki ro'yxatdan olingan qiymat bilan har aylanishda boshqa natija olish mumkin.",
        "Masalan ranglar ro'yxatini aylanib chiqib, har shaklga boshqa rang berish mumkin.",
      ], {
        code: {
          caption: "Har aylanishda boshqa rang",
          lines: [
            "ranglar = [\"qizil\", \"yashil\", \"ko'k\"]",
            "",
            "for (i = 0; i < 3; i++) {",
            "  chiz(shakl[i], ranglar[i])",
            "}",
          ],
        },
      }),
      s("Indeks bilan ishlash", [
        "Ro'yxatdagi element o'rni index (indeks) deb ataladi va ko'p tillarda 0 dan boshlanadi. Shuning uchun 3 elementli ro'yxatning indekslari 0, 1, 2 bo'ladi.",
      ], {
        callout: "Ko'p dasturlash tillarida indeks 0 dan boshlanadi.",
      }),
    ],
    [
      t("index", "indeks", "Ro'yxatdagi elementning tartib raqami, 0 dan boshlanadi."),
      t("array", "massiv", "Bir nechta qiymatni tartib bilan saqlovchi tuzilma."),
      t("zero-based", "noldan", "Sanoq 0 dan boshlanadigan indekslash usuli."),
    ],
    [
      q(
        "3 elementli ro'yxatning oxirgi elementi indeksi qanday?",
        ["3", "2", "1"],
        1,
        "Indeks 0 dan boshlanadi: 0, 1, 2. Ya'ni oxirgi element indeksi — 2."
      ),
    ]
  ),

  "m2-l2-4": L(
    "Hisoblagichdan foydalanib o'sib boruvchi zinapoya naqshini yasaysiz.",
    [
      s("O'sib boruvchi naqsh", [
        "Zinapoyada har qatorning uzunligi oshib boradi: 1, 2, 3, 4. Bu hisoblagich qiymatini bevosita ishlatishning klassik misoli.",
        "Sikl tanasida hisoblagichni uzunlik sifatida ishlatsangiz, naqsh o'zi hosil bo'ladi.",
      ], {
        code: {
          caption: "Zinapoya",
          lines: [
            "for (i = 1; i <= 4; i++) {",
            "  chiz_chiziq(i)   // uzunlik = i",
            "}",
            "",
            "// Natija:",
            "// *",
            "// **",
            "// ***",
            "// ****",
          ],
        },
      }),
      s("Teskari yo'nalish", [
        "Hisoblagichni kamaytirib borish ham mumkin. Shunda naqsh teskari — kattadan kichikka qarab hosil bo'ladi.",
      ], {
        callout: "Hisoblagich naqshning shaklini belgilaydi.",
      }),
    ],
    [
      t("counter", "hisoblagich", "Naqsh o'lchamini boshqaruvchi sikl qiymati."),
      t("pattern", "naqsh", "Qonuniyat bilan takrorlanuvchi tuzilma."),
      t("decrement", "kamaytirish", "Qiymatni bittaga kamaytirish amali."),
    ],
    [
      q(
        "for (i = 1; i <= 4; i++) { chiz_chiziq(i) } nima chizadi?",
        ["4 ta bir xil uzunlikdagi chiziq", "Uzunligi 1,2,3,4 bo'lgan 4 ta chiziq", "Bitta uzun chiziq"],
        1,
        "Har aylanishda i qiymati oshadi, shuning uchun chiziqlar uzunligi ham oshib boradi."
      ),
    ]
  ),

  "m2-l2-5": L(
    "2-bosqich: hisoblagich, chegara va indeks bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Hisoblagich (counter) sikl nechanchi aylanishda turganini saqlaydi.",
        "Chegarani (boundary) bir birlikka xato qo'yish off-by-one error ga olib keladi.",
        "Indeks (index) ko'p tillarda 0 dan boshlanadi.",
        "Hisoblagichni sikl tanasida ishlatib, o'sib boruvchi naqshlar yasash mumkin.",
      ], {
        callout: "Keyingi bosqichda sikl ichidagi siklga o'tamiz.",
      }),
    ],
    [
      t("counter", "hisoblagich", "Aylanish raqamini saqlovchi qiymat."),
      t("off-by-one", "bir birlik xatosi", "Chegara xatosining eng keng tarqalgan turi."),
    ],
    [
      q(
        "i < 3 va i <= 3 shartlari orasidagi farq nima?",
        ["Farq yo'q", "Bitta aylanish farqi", "Uch aylanish farqi"],
        1,
        "i <= 3 bir marta ko'proq aylanadi, chunki 3 ning o'zi ham shartga kiradi."
      ),
      q(
        "Off-by-one error qanday xato?",
        ["Sintaksis xatosi", "Sikl bir marta ko'p yoki kam aylanishi", "Kompyuter xatosi"],
        1,
        "Bu chegara xatosi: sikl kutilganidan bir marta ortiq yoki kam bajariladi."
      ),
    ]
  ),

  "m2-l3-1": L(
    "Sikl ichida sikl qanday ishlashini va jami aylanish sonini hisoblashni o'rganasiz.",
    [
      s("Ichma-ich sikl", [
        "Sikl tanasiga yana bir sikl joylashtirish mumkin. Bu nested loop (ichma-ich sikl) deb ataladi.",
        "Tashqi sikl bir marta aylanganda, ichki sikl to'liq aylanib chiqadi. Shuning uchun jami aylanish soni ikkisining ko'paytmasi bo'ladi.",
      ], {
        code: {
          caption: "3 x 4 = 12 aylanish",
          lines: [
            "for (qator = 1; qator <= 3; qator++) {",
            "  for (ustun = 1; ustun <= 4; ustun++) {",
            "    chiz_katak(qator, ustun)",
            "  }",
            "}",
            "// chiz_katak 12 marta chaqiriladi",
          ],
        },
      }),
      s("Qayerda kerak bo'ladi", [
        "Ichma-ich sikl ikki o'lchovli tuzilmalar bilan ishlashda kerak: jadval, shaxmat taxtasi, piksel maydoni, matritsa.",
      ], {
        callout: "Jami aylanish = tashqi sikl x ichki sikl.",
      }),
    ],
    [
      t("nested loop", "ichma-ich sikl", "Sikl tanasi ichida joylashgan boshqa sikl."),
      t("outer loop", "tashqi sikl", "Ichida boshqa sikl saqlovchi sikl."),
      t("inner loop", "ichki sikl", "Tashqi sikl tanasida joylashgan sikl."),
    ],
    [
      q(
        "Tashqi sikl 5 marta, ichki sikl 3 marta aylansa, ichki tana necha marta bajariladi?",
        ["8 marta", "15 marta", "5 marta"],
        1,
        "5 x 3 = 15. Tashqi siklning har aylanishida ichki sikl to'liq 3 marta aylanadi."
      ),
    ]
  ),

  "m2-l3-2": L(
    "Ichma-ich sikl bilan shaxmat taxtasi naqshini yasaysiz.",
    [
      s("Ikki o'lchovli maydon", [
        "Shaxmat taxtasi 8 qator va 8 ustundan iborat. Har katakni chizish uchun ikki sikl kerak: biri qatorlar, ikkinchisi ustunlar bo'yicha.",
        "Katakning rangi qator va ustun raqamining yig'indisiga bog'liq: yig'indi juft bo'lsa oq, toq bo'lsa qora.",
      ], {
        code: {
          caption: "Shaxmat taxtasi mantiqi",
          lines: [
            "for (q = 0; q < 8; q++) {",
            "  for (u = 0; u < 8; u++) {",
            "    agar ((q + u) juft) {",
            "      chiz(q, u, \"oq\")",
            "    } aks holda {",
            "      chiz(q, u, \"qora\")",
            "    }",
            "  }",
            "}",
          ],
        },
      }),
      s("Koordinatalar", [
        "Har katak ikki son bilan aniqlanadi: qator va ustun. Bu coordinate (koordinata) deb ataladi va grafikadagi asosiy tushuncha.",
      ], {
        callout: "Ikki o'lchovli maydon — ikki sikl.",
      }),
    ],
    [
      t("coordinate", "koordinata", "Nuqtaning o'rnini aniqlovchi sonlar to'plami."),
      t("grid", "to'r", "Qator va ustunlardan tashkil topgan maydon."),
      t("matrix", "matritsa", "Sonlarning qator-ustun ko'rinishidagi jadvali."),
    ],
    [
      q(
        "8x8 shaxmat taxtasida jami nechta katak bor?",
        ["16", "64", "32"],
        1,
        "8 x 8 = 64. Ichma-ich sikl ham aynan 64 marta ishlaydi."
      ),
    ]
  ),

  "m2-l3-3": L(
    "Cheksiz sikl nima va undan qanday qochish kerakligini o'rganasiz.",
    [
      s("Cheksiz sikl", [
        "Agar siklning tugash sharti hech qachon bajarilmasa, u to'xtamaydi. Bu infinite loop (cheksiz sikl) deb ataladi va dastur muzlab qolishiga olib keladi.",
        "Eng ko'p uchraydigan sabab — hisoblagichni oshirishni unutish.",
      ], {
        code: {
          caption: "Xatoli va to'g'ri sikl",
          lines: [
            "// XATO: i hech qachon o'zgarmaydi",
            "for (i = 1; i <= 3; ) {",
            "  chiz(i)",
            "}",
            "",
            "// TO'G'RI:",
            "for (i = 1; i <= 3; i = i + 1) {",
            "  chiz(i)",
            "}",
          ],
        },
      }),
      s("Qanday qochish kerak", [
        "Har sikl yozganda uchta savolga javob bering: hisoblagich qayerdan boshlanadi, qachon to'xtaydi, va har aylanishda qanday o'zgaradi. Uchinchisiga javob bo'lmasa — sikl cheksiz.",
      ], {
        callout: "Har aylanishda hisoblagich shartga yaqinlashishi shart.",
      }),
    ],
    [
      t("infinite loop", "cheksiz sikl", "Tugash sharti bajarilmaydigan, to'xtamaydigan sikl."),
      t("termination", "tugash", "Siklning to'xtash sharti bajarilishi."),
      t("freeze", "muzlash", "Dasturning javob bermay qolishi."),
    ],
    [
      q(
        "Cheksiz siklning eng ko'p uchraydigan sababi nima?",
        ["Sikl tanasi juda uzun", "Hisoblagichni oshirish unutilgan", "Shart juda murakkab"],
        1,
        "Hisoblagich o'zgarmasa shart hech qachon bajarilmaydi va sikl to'xtamaydi."
      ),
    ]
  ),

  "m2-l3-4": L(
    "Ichma-ich sikl va hisoblagich bilan murakkab naqsh generatori yasaysiz.",
    [
      s("Naqshni tahlil qilish", [
        "Murakkab naqshni yasashdan oldin uni tahlil qiling: nima qatorlar bo'yicha o'zgaradi, nima ustunlar bo'yicha?",
        "Odatda tashqi sikl qatorlarni, ichki sikl esa har qatordagi elementlarni boshqaradi.",
      ], {
        code: {
          caption: "Uchburchak naqsh",
          lines: [
            "for (q = 1; q <= 4; q++) {",
            "  for (u = 1; u <= q; u++) {",
            "    chiqar(\"*\")     // ichki chegara q ga bog'liq",
            "  }",
            "  yangi_qator()",
            "}",
          ],
        },
      }),
      s("Bog'liq chegaralar", [
        "Yuqoridagi misolda ichki siklning chegarasi tashqi siklning hisoblagichiga bog'liq. Shuning uchun har qatorda element soni oshib boradi.",
      ], {
        callout: "Ichki sikl chegarasi tashqi hisoblagichga bog'liq bo'lishi mumkin.",
      }),
    ],
    [
      t("nested loop", "ichma-ich sikl", "Naqsh generatorining asosiy vositasi."),
      t("generator", "generator", "Qonuniyat asosida natija hosil qiluvchi kod."),
      t("dependency", "bog'liqlik", "Ichki chegaraning tashqi qiymatga bog'liqligi."),
    ],
    [
      q(
        "Ichki siklning chegarasi tashqi hisoblagichga bog'liq bo'lsa nima yuzaga keladi?",
        ["Cheksiz sikl", "Har qatorda element soni o'zgaradigan naqsh", "Xato"],
        1,
        "Bu uchburchak va zinapoya kabi o'sib boruvchi naqshlar yasashning standart usuli."
      ),
    ]
  ),

  "m2-l3-5": L(
    "2-modul: sikllar bo'yicha yakuniy takrorlash.",
    [
      s("Modul xulosasi", [
        "Takrorlanuvchi naqsh (pattern) sikl bilan qisqartiriladi — DRY tamoyili.",
        "repeat(n) sikl tanasini n marta bajaradi; hisoblagich (counter) aylanishlarni farqlaydi.",
        "Chegara xatolari (off-by-one error) eng ko'p uchraydigan xato turi.",
        "Ichma-ich sikl (nested loop) ikki o'lchovli tuzilmalar uchun ishlatiladi; jami aylanish — ko'paytma.",
        "Cheksiz sikl (infinite loop) dan qochish uchun hisoblagich har aylanishda shartga yaqinlashishi kerak.",
      ], {
        callout: "Endi kodni nomlangan bo'laklarga ajratishga — funksiyalarga o'tamiz.",
      }),
    ],
    [
      t("loop", "sikl", "Modulning markaziy tushunchasi."),
      t("nested loop", "ichma-ich sikl", "Sikl ichidagi sikl."),
      t("infinite loop", "cheksiz sikl", "To'xtamaydigan sikl."),
    ],
    [
      q(
        "3x3 ichma-ich sikl ichki tanasi necha marta bajariladi?",
        ["6", "9", "3"],
        1,
        "3 x 3 = 9 marta."
      ),
      q(
        "DRY tamoyili nimani talab qiladi?",
        ["Kodni qisqa yozishni", "Bir xil kodni ko'chirib yozmaslikni", "Izohlar yozmaslikni"],
        1,
        "DRY (Don't Repeat Yourself) — mantiq bir joyda saqlanishi kerakligini bildiradi."
      ),
      q(
        "Sikl cheksiz bo'lib qolmasligi uchun nima shart?",
        ["Sikl tanasi qisqa bo'lishi", "Hisoblagich har aylanishda tugash shartiga yaqinlashishi", "Sikl 10 martadan oshmasligi"],
        1,
        "Hisoblagich o'zgarmasa yoki shartdan uzoqlashsa, sikl hech qachon to'xtamaydi."
      ),
    ]
  ),
};
