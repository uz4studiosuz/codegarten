import { LessonContent, L, s, t, q } from "./types";

/** MODULE 3 — Funksiyalar va Modullik (Functions & Modular Code) */
export const module3: Record<string, LessonContent> = {
  "m3-l1-1": L(
    "Funksiya nima va u kodni qanday tartibga solishini tushunib olasiz.",
    [
      s("Nomlangan kod bo'lagi", [
        "Function (funksiya) — nom berilgan, qayta ishlatilishi mumkin kod bo'lagi. Bir marta yozasiz, keyin nomini aytib chaqirasiz.",
        "Sikl bir xil kodni ketma-ket takrorlaydi. Funksiya esa kodni dasturning istalgan joyida, istalgan vaqtda ishlatishga imkon beradi.",
      ], {
        code: {
          caption: "Funksiya e'loni va chaqirilishi",
          lines: [
            "// E'lon (definition):",
            "funksiya kvadrat_chiz() {",
            "  repeat (4) {",
            "    oldinga(100)",
            "    o'ngga(90)",
            "  }",
            "}",
            "",
            "// Chaqirish (call):",
            "kvadrat_chiz()",
            "kvadrat_chiz()",
          ],
        },
      }),
      s("Qora quti tamoyili", [
        "Funksiyani ishlatish uchun uning ichida nima borligini bilish shart emas — nomi va nima qilishini bilish yetarli. Bu abstraction (abstraksiya) yoki qora quti tamoyili deb ataladi.",
      ], {
        callout: "Funksiya nomi uning nima qilishini aytib turishi kerak.",
      }),
    ],
    [
      t("function", "funksiya", "Nom berilgan, qayta ishlatiladigan kod bo'lagi."),
      t("definition", "e'lon", "Funksiyaning nima qilishini yozib qo'yish."),
      t("abstraction", "abstraksiya", "Ichki tafsilotni yashirib, faqat kerakli qismini ko'rsatish."),
    ],
    [
      q(
        "Funksiya bilan sikl orasidagi asosiy farq nima?",
        ["Funksiya tezroq ishlaydi", "Funksiyani dasturning istalgan joyida qayta chaqirish mumkin", "Sikl faqat sonlar bilan ishlaydi"],
        1,
        "Sikl kodni bir joyda ketma-ket takrorlaydi, funksiya esa istalgan joydan chaqirilishi mumkin."
      ),
    ]
  ),

  "m3-l1-2": L(
    "Birinchi funksiyani e'lon qilib, uni chaqirasiz.",
    [
      s("E'lon va chaqirish farqi", [
        "Funksiyani e'lon qilish — uni faqat yozib qo'yish. E'lon qilishning o'zi hech narsa bajarmaydi.",
        "Kod ishga tushishi uchun funksiyani chaqirish (function call — funksiya chaqirig'i) kerak. Bu eng ko'p uchraydigan boshlang'ich xato: funksiya yozilgan, lekin chaqirilmagan.",
      ], {
        code: {
          caption: "E'lon ishlamaydi, chaqiruv ishlaydi",
          lines: [
            "funksiya salom() {",
            "  chiqar(\"Salom!\")",
            "}",
            "",
            "// Bu yerda hech narsa chiqmaydi.",
            "",
            "salom()   // Endi \"Salom!\" chiqadi",
          ],
        },
      }),
      s("Nom berish qoidalari", [
        "Funksiya nomi u nima qilishini aytishi kerak. kvadrat_chiz() yaxshi nom, f1() yomon nom. Yaxshi nom izohsiz ham tushunarli bo'ladi.",
      ], {
        callout: "E'lon = retsept yozish. Chaqirish = ovqat tayyorlash.",
      }),
    ],
    [
      t("function call", "funksiya chaqirig'i", "Funksiyani ishga tushirish amali."),
      t("naming", "nom berish", "Funksiyaga mazmunli nom tanlash."),
      t("declaration", "e'lon", "Funksiyaning tanasini yozib qo'yish."),
    ],
    [
      q(
        "Funksiya yozilgan, lekin natija ko'rinmayapti. Eng ehtimoliy sabab?",
        ["Funksiya nomi noto'g'ri", "Funksiya chaqirilmagan", "Kompyuter sekin"],
        1,
        "E'lon qilishning o'zi kodni ishga tushirmaydi — funksiyani chaqirish kerak."
      ),
    ]
  ),

  "m3-l1-3": L(
    "Bir funksiyani bir necha marta chaqirib, kodni qisqartirasiz.",
    [
      s("Qayta ishlatish", [
        "Funksiyaning asosiy foydasi — reusability (qayta ishlatiluvchanlik). Bir marta yozilgan mantiq cheksiz marta ishlatilishi mumkin.",
        "Agar funksiya ichidagi kodni o'zgartirsangiz, uni chaqirgan barcha joylarda o'zgarish avtomatik aks etadi.",
      ], {
        code: {
          caption: "Bir e'lon, uch chaqiruv",
          lines: [
            "funksiya kvadrat_chiz() {",
            "  repeat (4) { oldinga(50) o'ngga(90) }",
            "}",
            "",
            "kvadrat_chiz()",
            "oldinga(60)",
            "kvadrat_chiz()",
            "oldinga(60)",
            "kvadrat_chiz()",
          ],
        },
      }),
      s("Bir joyda o'zgartirish", [
        "Yuqoridagi misolda kvadrat o'lchamini o'zgartirish uchun faqat funksiya ichidagi bitta sonni o'zgartirish kifoya. Uchta joyni qidirib yurish kerak emas.",
      ], {
        callout: "Funksiya — o'zgartirish nuqtasini bittaga kamaytiradi.",
      }),
    ],
    [
      t("reusability", "qayta ishlatiluvchanlik", "Bir kodni turli joylarda qayta ishlatish imkoni."),
      t("single point of change", "yagona o'zgartirish nuqtasi", "Mantiqni faqat bir joyda o'zgartirish yetarliligi."),
      t("modularity", "modullik", "Kodni mustaqil, almashtiriladigan bo'laklarga ajratish."),
    ],
    [
      q(
        "Funksiya ichidagi kodni o'zgartirsak, uni chaqirgan joylarda nima bo'ladi?",
        ["Hech narsa o'zgarmaydi", "Barcha chaqiruvlarda o'zgarish aks etadi", "Xato yuzaga keladi"],
        1,
        "Mantiq bitta joyda saqlanadi, shuning uchun o'zgarish barcha chaqiruvlarga tarqaladi."
      ),
    ]
  ),

  "m3-l1-4": L(
    "Takrorlanuvchi kodni funksiyaga ajratib olishni amalda qo'llaysiz.",
    [
      s("Qachon funksiyaga ajratish kerak", [
        "Uchta belgi funksiya kerakligini ko'rsatadi: kod bo'lagi ikki yoki undan ko'p joyda takrorlanadi; kod bo'lagiga nom berish mumkin; bo'lak mustaqil vazifani bajaradi.",
        "Bu jarayon extract function (funksiyaga ajratish) deb ataladi va eng ko'p ishlatiladigan refactoring usuli.",
      ], {
        code: {
          caption: "Ajratishdan oldin va keyin",
          lines: [
            "// Oldin — bir xil 3 qator ikki joyda",
            "chiz(\"ko'k\") ramka() soya()",
            "// ...",
            "chiz(\"ko'k\") ramka() soya()",
            "",
            "// Keyin",
            "funksiya kartochka_chiz() {",
            "  chiz(\"ko'k\") ramka() soya()",
            "}",
          ],
        },
      }),
      s("Bir funksiya — bir vazifa", [
        "Yaxshi funksiya faqat bitta ishni bajaradi. Agar funksiya nomida \"va\" so'zi kerak bo'lsa (chiz_va_saqla), ehtimol uni ikkiga bo'lish kerak.",
      ], {
        callout: "Funksiya nomida \"va\" bo'lsa — uni bo'lish vaqti keldi.",
      }),
    ],
    [
      t("extract function", "funksiyaga ajratish", "Takrorlanuvchi kodni alohida funksiyaga ko'chirish."),
      t("refactoring", "qayta tuzish", "Ishlashini o'zgartirmasdan kod tuzilishini yaxshilash."),
      t("single responsibility", "yagona mas'uliyat", "Bir funksiya faqat bitta vazifani bajarishi tamoyili."),
    ],
    [
      q(
        "Funksiya nomi \"hisobla_va_chiqar\" bo'lsa, bu nimani bildiradi?",
        ["Nom juda yaxshi", "Funksiya ikki vazifa bajaradi — bo'lish kerak", "Nom qisqartirish kerak"],
        1,
        "Nomdagi \"va\" ikki mas'uliyat borligini ko'rsatadi. Har birini alohida funksiyaga ajratish yaxshi."
      ),
    ]
  ),

  "m3-l1-5": L(
    "1-bosqich: funksiya, e'lon, chaqiruv va abstraksiya bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Funksiya (function) — nomlangan, qayta ishlatiladigan kod bo'lagi.",
        "E'lon (definition) kodni yozib qo'yadi, chaqiruv (function call) uni ishga tushiradi.",
        "Abstraksiya (abstraction) ichki tafsilotni yashiradi — qora quti tamoyili.",
        "Bir funksiya bir vazifani bajarishi kerak (single responsibility).",
      ], {
        callout: "Keyingi bosqichda parametrlar bilan funksiyani moslashuvchan qilamiz.",
      }),
    ],
    [
      t("function", "funksiya", "Bosqichning asosiy tushunchasi."),
      t("abstraction", "abstraksiya", "Tafsilotni yashirish tamoyili."),
    ],
    [
      q(
        "Qora quti tamoyili nimani bildiradi?",
        ["Funksiya kodini o'chirish kerak", "Funksiyani ishlatish uchun ichini bilish shart emas", "Funksiya qora rangda yozilishi kerak"],
        1,
        "Nomi va vazifasini bilish yetarli — bu abstraksiya tamoyili."
      ),
      q(
        "Funksiyani e'lon qilish nima qiladi?",
        ["Kodni darhol bajaradi", "Faqat yozib qo'yadi — bajarish uchun chaqirish kerak", "Xotirani tozalaydi"],
        1,
        "E'lon retsept yozishga o'xshaydi; chaqiruv esa uni tayyorlashga."
      ),
    ]
  ),

  "m3-l2-1": L(
    "Parametr nima va u funksiyani qanday moslashuvchan qilishini o'rganasiz.",
    [
      s("Parametr — funksiyaning kirishi", [
        "Parameter (parametr) — funksiyaga tashqaridan uzatiladigan qiymat. U funksiyani har chaqiruvda boshqacha ishlashga majbur qiladi.",
        "Parametrsiz funksiya har doim bir xil ishni bajaradi. Parametrli funksiya esa bir mantiq bilan turli natija beradi.",
      ], {
        code: {
          caption: "Parametrsiz va parametrli",
          lines: [
            "// Parametrsiz — har doim 50",
            "funksiya kvadrat_chiz() {",
            "  repeat (4) { oldinga(50) o'ngga(90) }",
            "}",
            "",
            "// Parametrli — istalgan o'lcham",
            "funksiya kvadrat_chiz(o'lcham) {",
            "  repeat (4) { oldinga(o'lcham) o'ngga(90) }",
            "}",
            "",
            "kvadrat_chiz(30)",
            "kvadrat_chiz(120)",
          ],
        },
      }),
      s("Parametr va argument", [
        "E'londa yozilgan nom — parameter (parametr). Chaqiruvda uzatilgan haqiqiy qiymat — argument (argument). Ko'pincha ikkisini almashtirib ishlatadilar, lekin farqi shu.",
      ], {
        callout: "Parametr — bo'sh joy. Argument — unga qo'yilgan qiymat.",
      }),
    ],
    [
      t("parameter", "parametr", "Funksiya e'lonida ko'rsatilgan kirish nomi."),
      t("argument", "argument", "Chaqiruvda parametr o'rniga uzatilgan haqiqiy qiymat."),
      t("flexibility", "moslashuvchanlik", "Bir kodning turli holatlarda ishlash qobiliyati."),
    ],
    [
      q(
        "kvadrat_chiz(120) chaqirig'ida 120 nima hisoblanadi?",
        ["Parametr", "Argument", "Funksiya nomi"],
        1,
        "120 — chaqiruvda uzatilgan haqiqiy qiymat, ya'ni argument. Parametr esa e'londagi nom."
      ),
    ]
  ),

  "m3-l2-2": L(
    "Parametrli funksiya yozib, turli qiymatlar bilan chaqirasiz.",
    [
      s("Parametrni ishlatish", [
        "Parametr funksiya tanasida oddiy qiymat kabi ishlatiladi. Chaqiruv vaqtida u argument qiymati bilan almashtiriladi.",
        "Shu tarzda bitta funksiya cheksiz turli natija bera oladi.",
      ], {
        code: {
          caption: "Bir funksiya, ko'p natija",
          lines: [
            "funksiya ko'pburchak(qirralar) {",
            "  burchak = 360 / qirralar",
            "  repeat (qirralar) {",
            "    oldinga(60)",
            "    o'ngga(burchak)",
            "  }",
            "}",
            "",
            "ko'pburchak(3)   // uchburchak",
            "ko'pburchak(6)   // oltiburchak",
          ],
        },
      }),
      s("Parametrni tekshirish", [
        "Parametrga noto'g'ri qiymat kelsa nima bo'ladi? Masalan ko'pburchak(0) nolga bo'lishga olib keladi. Shuning uchun jiddiy kodda parametrlar tekshiriladi — bu validation (tekshirish) deb ataladi.",
      ], {
        callout: "Parametr kelgan qiymatni tekshirish yaxshi funksiyaning belgisi.",
      }),
    ],
    [
      t("validation", "tekshirish", "Kelgan qiymatning to'g'riligini nazorat qilish."),
      t("edge case", "chegaraviy holat", "Kutilmagan yoki chekka qiymat bilan yuzaga keladigan holat."),
      t("reuse", "qayta ishlatish", "Bir mantiqni turli qiymatlar bilan ishlatish."),
    ],
    [
      q(
        "ko'pburchak(qirralar) funksiyasiga 0 uzatilsa nima muammo yuzaga keladi?",
        ["Hech qanday muammo yo'q", "360 / 0 — nolga bo'lish xatosi", "Funksiya tezroq ishlaydi"],
        1,
        "Nolga bo'lish aniqlanmagan amal. Shuning uchun parametrni tekshirish kerak."
      ),
    ]
  ),

  "m3-l2-3": L(
    "Bir necha parametrli funksiya yozib, ularning tartibini o'rganasiz.",
    [
      s("Ko'p parametr", [
        "Funksiya bir nechta parametr qabul qilishi mumkin. Ular vergul bilan ajratiladi va tartib muhim.",
        "Chaqiruvda argumentlar aynan e'londagi tartibda uzatiladi. Tartibni almashtirsangiz natija butunlay boshqacha bo'ladi.",
      ], {
        code: {
          caption: "Tartib muhim",
          lines: [
            "funksiya to'rtburchak(kenglik, balandlik) {",
            "  repeat (2) {",
            "    oldinga(kenglik)",
            "    o'ngga(90)",
            "    oldinga(balandlik)",
            "    o'ngga(90)",
            "  }",
            "}",
            "",
            "to'rtburchak(100, 50)   // yotiq",
            "to'rtburchak(50, 100)   // tik",
          ],
        },
      }),
      s("Parametrlar soni", [
        "Juda ko'p parametr funksiyani ishlatishni qiyinlashtiradi. Amalda 3 tadan oshsa, ularni bitta obyektga guruhlash tavsiya etiladi.",
      ], {
        callout: "3 tadan ko'p parametr — funksiyani qayta o'ylash signali.",
      }),
    ],
    [
      t("multiple parameters", "ko'p parametr", "Funksiyaning bir nechta kirish qiymati."),
      t("argument order", "argument tartibi", "Chaqiruvda qiymatlarning uzatilish ketma-ketligi."),
      t("signature", "imzo", "Funksiya nomi va parametrlari to'plami."),
    ],
    [
      q(
        "to'rtburchak(100, 50) va to'rtburchak(50, 100) bir xil natija beradimi?",
        ["Ha, sonlar bir xil", "Yo'q, tartib natijani o'zgartiradi", "Faqat kvadratda bir xil"],
        1,
        "Parametrlar tartibi ma'noga ega: birinchisi kenglik, ikkinchisi balandlik."
      ),
    ]
  ),

  "m3-l2-4": L(
    "Parametrlar bilan universal shakl chizuvchi funksiya yasaysiz.",
    [
      s("Universal funksiya", [
        "Parametrlarni birlashtirib, bitta funksiya bilan ko'p turli shakl chizish mumkin: qirralar soni, o'lcham va rang parametr bo'lsa, imkoniyatlar soni ko'payadi.",
        "Bu generalization (umumlashtirish) deb ataladi — maxsus holatlardan umumiy yechimga o'tish.",
      ], {
        code: {
          caption: "Uch parametrli universal funksiya",
          lines: [
            "funksiya shakl(qirralar, o'lcham, rang) {",
            "  rangni_tanla(rang)",
            "  burchak = 360 / qirralar",
            "  repeat (qirralar) {",
            "    oldinga(o'lcham)",
            "    o'ngga(burchak)",
            "  }",
            "}",
            "",
            "shakl(3, 80, \"qizil\")",
            "shakl(8, 40, \"ko'k\")",
          ],
        },
      }),
      s("Umumlashtirish chegarasi", [
        "Har narsani parametr qilish ham yaxshi emas. Agar funksiya juda ko'p narsani boshqarsa, u tushunarsiz bo'lib qoladi. Muvozanat kerak.",
      ], {
        callout: "Umumlashtirish foydali, lekin haddan oshsa kod tushunarsiz bo'ladi.",
      }),
    ],
    [
      t("generalization", "umumlashtirish", "Maxsus holatdan umumiy yechimga o'tish."),
      t("configurable", "sozlanuvchi", "Parametrlar orqali xatti-harakatini o'zgartirish mumkin bo'lgan."),
      t("over-engineering", "haddan oshirish", "Keragidan ortiq murakkab yechim yasash."),
    ],
    [
      q(
        "Funksiyaga juda ko'p parametr qo'shishning kamchiligi nima?",
        ["Sekin ishlaydi", "Funksiyani ishlatish va tushunish qiyinlashadi", "Xotira to'lib qoladi"],
        1,
        "Ko'p parametr chaqiruvni murakkablashtiradi va xato ehtimolini oshiradi."
      ),
    ]
  ),

  "m3-l2-5": L(
    "2-bosqich: parametr, argument va umumlashtirish bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Parametr (parameter) — e'londagi kirish nomi; argument (argument) — chaqiruvdagi haqiqiy qiymat.",
        "Parametr funksiyani moslashuvchan qiladi: bir mantiq, ko'p natija.",
        "Bir nechta parametrda tartib muhim.",
        "Umumlashtirish (generalization) foydali, lekin haddan oshirmaslik kerak.",
      ], {
        callout: "Keyingi bosqichda funksiyaning javob qaytarishini o'rganamiz.",
      }),
    ],
    [
      t("parameter", "parametr", "Funksiya kirishi."),
      t("argument", "argument", "Uzatilgan haqiqiy qiymat."),
    ],
    [
      q(
        "Parametr va argument orasidagi farq nima?",
        ["Farq yo'q", "Parametr — e'londagi nom, argument — uzatilgan qiymat", "Argument faqat sonlar bo'ladi"],
        1,
        "Parametr bo'sh joy, argument esa unga qo'yilgan aniq qiymat."
      ),
      q(
        "Parametrli funksiyaning asosiy foydasi nima?",
        ["Kod qisqaradi", "Bir mantiq bilan turli natija olish mumkin", "Tezroq ishlaydi"],
        1,
        "Parametr funksiyani turli holatlarga moslashtiradi."
      ),
    ]
  ),

  "m3-l3-1": L(
    "return nima qiladi va nima uchun kerakligini tushunib olasiz.",
    [
      s("Funksiya javob qaytaradi", [
        "Ba'zi funksiyalar ish bajaradi (chizadi, saqlaydi). Boshqalari esa hisoblab, natijani qaytaradi. Buning uchun return (qaytarish) ishlatiladi.",
        "return qiymatni funksiyadan tashqariga chiqaradi va shu bilan funksiya ishini darhol tugatadi.",
      ], {
        code: {
          caption: "Qaytaruvchi funksiya",
          lines: [
            "funksiya kvadrat_yuzasi(tomon) {",
            "  return tomon * tomon",
            "}",
            "",
            "yuza = kvadrat_yuzasi(5)   // yuza = 25",
            "chiqar(yuza)",
          ],
        },
      }),
      s("return dan keyin kod bajarilmaydi", [
        "return bajarilgach funksiya darhol to'xtaydi. Undan keyingi qatorlar hech qachon ishlamaydi — bu unreachable code (yetib bo'lmaydigan kod) deb ataladi.",
      ], {
        callout: "return — javobni chiqaradi va funksiyani tugatadi.",
      }),
    ],
    [
      t("return", "qaytarish", "Funksiyadan natijani tashqariga chiqarish."),
      t("return value", "qaytarilgan qiymat", "Funksiya chaqirig'i natijasida olinadigan qiymat."),
      t("unreachable code", "yetib bo'lmaydigan kod", "return dan keyin joylashgan, hech qachon bajarilmaydigan kod."),
    ],
    [
      q(
        "return bajarilgandan keyin funksiyadagi qolgan qatorlar nima bo'ladi?",
        ["Ular ham bajariladi", "Ular hech qachon bajarilmaydi", "Xato yuzaga keladi"],
        1,
        "return funksiyani darhol tugatadi, shuning uchun undan keyingi kod yetib bo'lmaydigan kod bo'lib qoladi."
      ),
    ]
  ),

  "m3-l3-2": L(
    "Hisoblab natija qaytaruvchi funksiya yozasiz.",
    [
      s("Hisoblovchi funksiya", [
        "Hisoblovchi funksiya kirish qiymatlarini oladi, ular ustida amal bajaradi va natijani qaytaradi. U ekranga hech narsa chiqarmaydi — faqat javob beradi.",
        "Bu pure function (toza funksiya) tamoyiliga yaqin: bir xil kirish har doim bir xil natija beradi va tashqi holatga ta'sir qilmaydi.",
      ], {
        code: {
          caption: "Toza hisoblovchi funksiya",
          lines: [
            "funksiya o'rtacha(a, b) {",
            "  return (a + b) / 2",
            "}",
            "",
            "chiqar(o'rtacha(10, 20))   // 15",
            "chiqar(o'rtacha(3, 7))     // 5",
          ],
        },
      }),
      s("Nima uchun toza funksiya yaxshi", [
        "Toza funksiyani sinash oson: kirishni berasiz, natijani tekshirasiz. Tashqi holatga bog'liq bo'lmaganligi uchun xatolarni topish ham osonlashadi.",
      ], {
        callout: "Toza funksiya: bir xil kirish -> har doim bir xil natija.",
      }),
    ],
    [
      t("pure function", "toza funksiya", "Tashqi holatga ta'sir qilmaydigan, bir xil kirishga bir xil natija beruvchi funksiya."),
      t("side effect", "yon ta'sir", "Funksiyaning tashqi holatni o'zgartirishi."),
      t("testable", "sinaladigan", "Natijani oson tekshirish mumkin bo'lgan kod."),
    ],
    [
      q(
        "Toza funksiya (pure function) nimasi bilan ajralib turadi?",
        ["Juda qisqa bo'ladi", "Bir xil kirish har doim bir xil natija beradi", "Faqat sonlar bilan ishlaydi"],
        1,
        "Toza funksiya tashqi holatga bog'liq emas va uni o'zgartirmaydi."
      ),
    ]
  ),

  "m3-l3-3": L(
    "Bir funksiya natijasini boshqasiga uzatib, ularni birlashtirasiz.",
    [
      s("Funksiyalarni ulash", [
        "Bir funksiyaning qaytargan qiymatini boshqa funksiyaga argument sifatida uzatish mumkin. Bu composition (kompozitsiya) deb ataladi.",
        "Shu tarzda oddiy funksiyalardan murakkab mantiq yasaladi — xuddi konstruktordagi bloklardan bino qurilgani kabi.",
      ], {
        code: {
          caption: "Kompozitsiya",
          lines: [
            "funksiya kvadrat(x) { return x * x }",
            "funksiya yarim(x)   { return x / 2 }",
            "",
            "// Ichkaridan tashqariga hisoblanadi",
            "natija = yarim(kvadrat(6))   // kvadrat(6)=36, yarim(36)=18",
          ],
        },
      }),
      s("Hisoblanish tartibi", [
        "Ichma-ich chaqiruvda eng ichkaridagi funksiya birinchi bajariladi. Uning natijasi tashqi funksiyaga argument bo'lib kiradi.",
      ], {
        callout: "Kompozitsiya: kichik funksiyalardan katta mantiq yasash.",
      }),
    ],
    [
      t("composition", "kompozitsiya", "Funksiyalarni bir-biriga ulab, murakkab mantiq yasash."),
      t("nested call", "ichma-ich chaqiruv", "Bir funksiya chaqirig'i ichida boshqasini chaqirish."),
      t("evaluation order", "hisoblanish tartibi", "Ichkaridan tashqariga qarab bajarilish tartibi."),
    ],
    [
      q(
        "yarim(kvadrat(4)) qanday hisoblanadi?",
        ["Avval yarim, keyin kvadrat", "Avval kvadrat(4)=16, keyin yarim(16)=8", "Ikkisi bir vaqtda"],
        1,
        "Eng ichkaridagi chaqiruv birinchi bajariladi, natijasi tashqi funksiyaga uzatiladi."
      ),
    ]
  ),

  "m3-l3-4": L(
    "3-modul: funksiyalar bo'yicha yakuniy takrorlash.",
    [
      s("Modul xulosasi", [
        "Funksiya (function) — nomlangan, qayta ishlatiladigan kod bo'lagi; e'lon va chaqiruv farqli narsalar.",
        "Abstraksiya (abstraction) ichki tafsilotni yashiradi.",
        "Parametr (parameter) va argument (argument) funksiyani moslashuvchan qiladi.",
        "return natijani qaytaradi va funksiyani tugatadi.",
        "Kompozitsiya (composition) oddiy funksiyalardan murakkab mantiq yasaydi.",
      ], {
        callout: "Endi dasturga qaror qabul qilishni o'rgatamiz — shartlarga o'tamiz.",
      }),
    ],
    [
      t("function", "funksiya", "Modulning markaziy tushunchasi."),
      t("return", "qaytarish", "Natijani tashqariga chiqarish."),
      t("composition", "kompozitsiya", "Funksiyalarni ulash."),
    ],
    [
      q(
        "Funksiyaga ajratish (extract function) qachon kerak bo'ladi?",
        ["Kod juda qisqa bo'lganda", "Kod bo'lagi takrorlansa va unga nom berish mumkin bo'lsa", "Har 10 qatordan keyin"],
        1,
        "Takrorlanish va nom berish imkoniyati — funksiyaga ajratishning asosiy belgilari."
      ),
      q(
        "return nima qiladi?",
        ["Faqat ekranga chiqaradi", "Natijani qaytaradi va funksiyani tugatadi", "Funksiyani qaytadan boshlaydi"],
        1,
        "return qiymatni tashqariga uzatib, funksiya ishini darhol to'xtatadi."
      ),
      q(
        "Kompozitsiya (composition) nima?",
        ["Funksiyani o'chirish", "Bir funksiya natijasini boshqasiga uzatish", "Ikki funksiyani bitta nom bilan atash"],
        1,
        "Kompozitsiya kichik funksiyalardan murakkabroq mantiq qurish usuli."
      ),
    ]
  ),
};
