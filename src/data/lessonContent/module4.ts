import { LessonContent, L, s, t, q } from "./types";

/** MODULE 4 — Shartlar va Mantiqiy Tarmoqlar (Conditionals & Boolean Logic) */
export const module4: Record<string, LessonContent> = {
  "m4-l1-1": L(
    "Mantiqiy qiymatlar nima va ular qanday hosil bo'lishini o'rganasiz.",
    [
      s("Faqat ikki qiymat", [
        "Boolean (mantiqiy tur) — faqat ikki qiymatga ega tur: true (rost) yoki false (yolg'on).",
        "Bu tur ingliz matematigi George Boole nomidan olingan. Kompyuterdagi barcha qarorlar oxir-oqibat shu ikki qiymatga borib taqaladi.",
      ], {
        code: {
          caption: "Mantiqiy qiymatlar",
          lines: [
            "yosh = 20",
            "",
            "katta = yosh >= 18     // true (rost)",
            "kichik = yosh < 10     // false (yolg'on)",
          ],
        },
      }),
      s("Nima uchun kerak", [
        "Mantiqiy qiymat dasturga tanlov qilish imkonini beradi. Shart rost bo'lsa bir yo'l, yolg'on bo'lsa boshqa yo'l tanlanadi.",
      ], {
        callout: "Har qanday shart oxirida true yoki false ga aylanadi.",
      }),
    ],
    [
      t("boolean", "mantiqiy tur", "Faqat true yoki false qiymatini oluvchi ma'lumot turi."),
      t("true", "rost", "Shart bajarilganini bildiruvchi qiymat."),
      t("false", "yolg'on", "Shart bajarilmaganini bildiruvchi qiymat."),
    ],
    [
      q(
        "Boolean tur nechta qiymat qabul qilishi mumkin?",
        ["Cheksiz", "Ikki: true va false", "Uch: true, false va bo'sh"],
        1,
        "Boolean faqat ikki qiymatga ega: true (rost) va false (yolg'on)."
      ),
    ]
  ),

  "m4-l1-2": L(
    "Taqqoslash amallari bilan mantiqiy qiymat hosil qilasiz.",
    [
      s("Taqqoslash amallari", [
        "Comparison operator (taqqoslash amali) ikki qiymatni solishtiradi va natijada true yoki false qaytaradi.",
        "Asosiy amallar: == (teng), != (teng emas), > (katta), < (kichik), >= (katta yoki teng), <= (kichik yoki teng).",
      ], {
        code: {
          caption: "Taqqoslash natijalari",
          lines: [
            "5 > 3      // true",
            "5 == 3     // false",
            "5 != 3     // true",
            "5 >= 5     // true",
            "\"a\" == \"a\"  // true",
          ],
        },
      }),
      s("Eng ko'p uchraydigan xato", [
        "Ko'p tillarda = (bitta teng) qiymat berish, == (ikki teng) esa taqqoslash uchun ishlatiladi. Ularni almashtirish klassik xato.",
      ], {
        callout: "= qiymat beradi, == taqqoslaydi. Bu ikkisini adashtirmang.",
      }),
    ],
    [
      t("comparison operator", "taqqoslash amali", "Ikki qiymatni solishtirib mantiqiy natija beruvchi amal."),
      t("assignment", "qiymat berish", "O'zgaruvchiga qiymat yozish amali (=)."),
      t("equality", "tenglik", "Ikki qiymatning bir xilligini tekshirish (==)."),
    ],
    [
      q(
        "5 >= 5 ifodasining natijasi qanday?",
        ["false", "true", "Xato"],
        1,
        ">= \"katta yoki teng\" degani. 5 5 ga teng, shuning uchun natija true."
      ),
    ]
  ),

  "m4-l1-3": L(
    "Ma'noli shartlar tuzishni va ularni tekshirishni o'rganasiz.",
    [
      s("Shart tuzish", [
        "Condition (shart) — true yoki false ga aylanadigan ifoda. Yaxshi shart aniq va bir ma'noli bo'ladi.",
        "Shart tuzishda savolni aniq shakllantiring: \"foydalanuvchi 18 dan katta-mi?\" -> yosh >= 18.",
      ], {
        code: {
          caption: "Savoldan shartga",
          lines: [
            "// Savol: ball o'tish balidan yuqorimi?",
            "o'tdi = ball >= 60",
            "",
            "// Savol: parol bo'sh-mi?",
            "bo'sh = parol == \"\"",
          ],
        },
      }),
      s("Chegaraviy holatlar", [
        "Shartni tekshirishda chegara qiymatlarini alohida sinash kerak. ball = 60 bo'lsa nima bo'ladi? >= va > farqi aynan shu yerda ko'rinadi.",
      ], {
        callout: "Shartni har doim chegara qiymatida sinab ko'ring.",
      }),
    ],
    [
      t("condition", "shart", "Mantiqiy natija beruvchi tekshiruv ifodasi."),
      t("expression", "ifoda", "Hisoblanib qiymat beruvchi kod bo'lagi."),
      t("edge case", "chegaraviy holat", "Chegara qiymatida yuzaga keladigan maxsus holat."),
    ],
    [
      q(
        "O'tish bali 60. ball >= 60 va ball > 60 shartlari qachon farq qiladi?",
        ["Hech qachon", "ball aynan 60 bo'lganda", "ball 100 bo'lganda"],
        1,
        "ball = 60 da birinchisi true, ikkinchisi false beradi. Chegara qiymati muhim."
      ),
    ]
  ),

  "m4-l1-4": L(
    "1-bosqich: mantiqiy qiymatlar va taqqoslash bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Boolean (mantiqiy tur) faqat true (rost) va false (yolg'on) qiymatlarini oladi.",
        "Taqqoslash amallari (comparison operators) mantiqiy natija hosil qiladi.",
        "= qiymat beradi, == taqqoslaydi.",
        "Shartlarni chegaraviy holatlarda sinash zarur.",
      ], {
        callout: "Keyingi bosqichda shartlar asosida tarmoqlanishni o'rganamiz.",
      }),
    ],
    [
      t("boolean", "mantiqiy tur", "true yoki false qiymati."),
      t("condition", "shart", "Mantiqiy natija beruvchi ifoda."),
    ],
    [
      q(
        "Qaysi amal taqqoslash uchun ishlatiladi?",
        ["=", "==", "+"],
        1,
        "== taqqoslaydi, = esa qiymat beradi."
      ),
      q(
        "\"5 != 3\" ifodasining natijasi qanday?",
        ["false", "true", "5"],
        1,
        "!= \"teng emas\" degani. 5 va 3 teng emas, shuning uchun true."
      ),
    ]
  ),

  "m4-l2-1": L(
    "Dastur qanday qilib yo'lni tanlashini — tarmoqlanishni tushunib olasiz.",
    [
      s("Yo'l ikkiga ajraladi", [
        "Shu paytgacha kod har doim bir yo'ldan bordi. Branching (tarmoqlanish) esa dasturga vaziyatga qarab yo'l tanlash imkonini beradi.",
        "Bu temir yo'l strelkasiga o'xshaydi: shart rost bo'lsa bir tomonga, yolg'on bo'lsa boshqa tomonga.",
      ], {
        code: {
          caption: "Tarmoqlanish tuzilishi",
          lines: [
            "agar (shart) {",
            "  // shart rost bo'lsa bu bajariladi",
            "} aks holda {",
            "  // shart yolg'on bo'lsa bu bajariladi",
            "}",
          ],
        },
      }),
      s("Control flow", [
        "Kodning bajarilish yo'li control flow (boshqaruv oqimi) deb ataladi. Shartlar shu oqimni boshqaradi — qaysi qatorlar bajarilib, qaysilari o'tkazib yuborilishini belgilaydi.",
      ], {
        callout: "Shart — dasturning yo'l tanlash strelkasi.",
      }),
    ],
    [
      t("branching", "tarmoqlanish", "Shartga qarab turli kod yo'llarini tanlash."),
      t("control flow", "boshqaruv oqimi", "Kodning bajarilish yo'li va tartibi."),
      t("block", "blok", "Qavs ichidagi, birga bajariladigan kod guruhi."),
    ],
    [
      q(
        "Boshqaruv oqimi (control flow) nimani bildiradi?",
        ["Kodning uzunligini", "Kodning bajarilish yo'li va tartibini", "Xotira hajmini"],
        1,
        "Control flow — qaysi qatorlar bajarilib, qaysilari o'tkazib yuborilishini belgilaydi."
      ),
    ]
  ),

  "m4-l2-2": L(
    "if bloki bilan shartli bajarilishni amalda qo'llaysiz.",
    [
      s("if — eng oddiy shart", [
        "if (agar) bloki faqat shart rost bo'lganda ichidagi kodni bajaradi. Shart yolg'on bo'lsa, blok butunlay o'tkazib yuboriladi.",
        "if bloki yolg'on holat uchun hech narsa qilmaydi — shuning uchun \"aks holda\" kerak bo'lmaganda ishlatiladi.",
      ], {
        code: {
          caption: "Faqat rost holatda ishlaydi",
          lines: [
            "ball = 75",
            "",
            "agar (ball >= 60) {",
            "  chiqar(\"Tabriklaymiz, o'tdingiz!\")",
            "}",
            "",
            "chiqar(\"Dastur tugadi\")   // har doim bajariladi",
          ],
        },
      }),
      s("Blok chegarasi", [
        "Faqat qavs ichidagi kod shartga bog'liq. Qavsdan tashqaridagi kod har doim bajariladi — bu ko'p boshlang'ich xatoning sababi.",
      ], {
        callout: "Qavs ichi — shartli. Qavsdan tashqari — har doim bajariladi.",
      }),
    ],
    [
      t("if statement", "if bloki", "Shart rost bo'lganda bajariladigan kod bloki."),
      t("scope", "amal doirasi", "Kod bo'lagining ta'sir chegarasi."),
      t("skip", "o'tkazib yuborish", "Shart bajarilmaganda blokni bajarmaslik."),
    ],
    [
      q(
        "if bloki shartida false chiqsa nima bo'ladi?",
        ["Xato yuzaga keladi", "Blok o'tkazib yuboriladi, dastur davom etadi", "Dastur to'xtaydi"],
        1,
        "Shart yolg'on bo'lsa blok bajarilmaydi, lekin dastur keyingi qatorlardan davom etadi."
      ),
    ]
  ),

  "m4-l2-3": L(
    "else bilan ikki yo'lli tanlov qurishni o'rganasiz.",
    [
      s("else — ikkinchi yo'l", [
        "else (aks holda) bloki shart yolg'on bo'lganda bajariladi. if va else birgalikda ikki yo'lli tanlov hosil qiladi.",
        "Muhim xususiyat: ikkisidan aynan bittasi bajariladi — hech qachon ikkisi birga yoki hech biri emas.",
      ], {
        code: {
          caption: "Ikki yo'lli tanlov",
          lines: [
            "agar (ball >= 60) {",
            "  chiqar(\"O'tdi\")",
            "} aks holda {",
            "  chiqar(\"O'tmadi\")",
            "}",
            "",
            "// Aynan bittasi chiqadi",
          ],
        },
      }),
      s("else if bilan ko'p yo'l", [
        "Ikkidan ko'p variant kerak bo'lsa, else if (aks holda agar) ishlatiladi. Shartlar yuqoridan pastga tekshiriladi va birinchi rost topilgan bloki bajariladi.",
      ], {
        callout: "if / else dan aynan bittasi bajariladi.",
      }),
    ],
    [
      t("else", "aks holda", "Shart yolg'on bo'lganda bajariladigan blok."),
      t("else if", "aks holda agar", "Ikkidan ko'p variant uchun qo'shimcha shart."),
      t("mutually exclusive", "o'zaro istisno", "Faqat bittasi bajarilishi mumkin bo'lgan holatlar."),
    ],
    [
      q(
        "if / else tuzilmasida nechta blok bajariladi?",
        ["Ikkisi ham", "Aynan bittasi", "Hech biri"],
        1,
        "Shart rost bo'lsa if bloki, yolg'on bo'lsa else bloki — aynan bittasi bajariladi."
      ),
    ]
  ),

  "m4-l2-4": L(
    "Shartlar bilan to'siqni aniqlab, robotni undan o'tkazasiz.",
    [
      s("Vaziyatga javob berish", [
        "Shartsiz robot ko'r-ko'rona harakat qiladi. Shart bilan esa u atrofni \"sezib\", vaziyatga mos qaror qabul qiladi.",
        "Bu reactive behaviour (javob beruvchi xatti-harakat) deb ataladi va robototexnikaning asosi.",
      ], {
        code: {
          caption: "To'siqni aylanib o'tish",
          lines: [
            "repeat (10) {",
            "  agar (oldinda_to'siq()) {",
            "    o'ngga_buril()",
            "  } aks holda {",
            "    oldinga(1)",
            "  }",
            "}",
          ],
        },
      }),
      s("Sikl va shart birgalikda", [
        "Sikl ichidagi shart eng kuchli kombinatsiyalardan biri: har aylanishda vaziyat qaytadan tekshiriladi va mos qaror qabul qilinadi.",
      ], {
        callout: "Sikl + shart = vaziyatga moslashuvchi dastur.",
      }),
    ],
    [
      t("reactive behaviour", "javob beruvchi xatti-harakat", "Atrof holatiga qarab qaror qabul qilish."),
      t("sensor", "sezgir", "Atrof-muhit holatini tekshiruvchi funksiya."),
      t("guard", "qo'riqchi shart", "Xatarli amaldan oldin qo'yiladigan tekshiruv."),
    ],
    [
      q(
        "Sikl ichidagi shart nima uchun kuchli?",
        ["Kod qisqaradi", "Har aylanishda vaziyat qaytadan tekshiriladi", "Tezroq ishlaydi"],
        1,
        "Har aylanishda shart yangidan hisoblanadi, shuning uchun dastur o'zgaruvchi vaziyatga moslashadi."
      ),
    ]
  ),

  "m4-l2-5": L(
    "2-bosqich: if, else va tarmoqlanish bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Tarmoqlanish (branching) dasturga yo'l tanlash imkonini beradi.",
        "if bloki faqat shart rost bo'lganda bajariladi; qavsdan tashqaridagi kod har doim bajariladi.",
        "if / else dan aynan bittasi bajariladi; else if ko'p variant uchun.",
        "Sikl va shart birgalikda vaziyatga moslashuvchi dastur hosil qiladi.",
      ], {
        callout: "Keyingi bosqichda bir necha shartni birlashtirishni o'rganamiz.",
      }),
    ],
    [
      t("branching", "tarmoqlanish", "Shartga qarab yo'l tanlash."),
      t("if statement", "if bloki", "Shartli bajarilish."),
    ],
    [
      q(
        "if blokidan tashqarida joylashgan kod qachon bajariladi?",
        ["Faqat shart rost bo'lganda", "Har doim", "Hech qachon"],
        1,
        "Shart faqat qavs ichidagi kodga ta'sir qiladi."
      ),
      q(
        "else bloki qachon bajariladi?",
        ["Shart rost bo'lganda", "Shart yolg'on bo'lganda", "Har doim"],
        1,
        "else — shart bajarilmagan holat uchun ikkinchi yo'l."
      ),
    ]
  ),

  "m4-l3-1": L(
    "VA / YOKI mantiqiy amallari bilan shartlarni birlashtirasiz.",
    [
      s("Mantiqiy amallar", [
        "Bir nechta shartni birlashtirish uchun logical operator (mantiqiy amal) ishlatiladi.",
        "AND (VA) — ikki shart ham rost bo'lsa rost beradi. OR (YOKI) — kamida bittasi rost bo'lsa rost beradi. NOT (EMAS) — qiymatni teskarisiga o'zgartiradi.",
      ], {
        code: {
          caption: "Uch mantiqiy amal",
          lines: [
            "// AND (VA): ikkisi ham kerak",
            "agar (yosh >= 18 VA hujjat_bor) { kirish_ruxsat() }",
            "",
            "// OR (YOKI): bittasi yetarli",
            "agar (chipta_bor YOKI taklif_bor) { kirish_ruxsat() }",
            "",
            "// NOT (EMAS): teskari",
            "agar (EMAS bo'sh) { ishlatish() }",
          ],
        },
      }),
      s("Rostlik jadvali", [
        "AND: rost + rost = rost; boshqa barcha holatlarda yolg'on.",
        "OR: yolg'on + yolg'on = yolg'on; boshqa barcha holatlarda rost.",
      ], {
        callout: "AND — hammasi kerak. OR — bittasi yetarli.",
      }),
    ],
    [
      t("AND", "VA", "Barcha shartlar rost bo'lganda rost beruvchi amal."),
      t("OR", "YOKI", "Kamida bitta shart rost bo'lganda rost beruvchi amal."),
      t("NOT", "EMAS", "Mantiqiy qiymatni teskarisiga o'zgartiruvchi amal."),
    ],
    [
      q(
        "true VA false ifodasining natijasi qanday?",
        ["true", "false", "Xato"],
        1,
        "AND uchun ikki shart ham rost bo'lishi kerak. Bittasi yolg'on bo'lsa natija yolg'on."
      ),
    ]
  ),

  "m4-l3-2": L(
    "Bir necha shartli murakkab tanlov qurishni o'rganasiz.",
    [
      s("Shartlarni birlashtirish", [
        "Amalda ko'p qarorlar bir necha shartga bog'liq bo'ladi. Ularni mantiqiy amallar bilan birlashtirasiz.",
        "Qavslar tekshirish tartibini aniq belgilaydi — matematikadagi kabi. Murakkab shartda qavs qo'yish o'qilishlilikni sezilarli oshiradi.",
      ], {
        code: {
          caption: "Qavs ma'noni o'zgartiradi",
          lines: [
            "// Qavssiz — noaniq",
            "a VA b YOKI c",
            "",
            "// Qavsli — aniq",
            "(a VA b) YOKI c",
            "a VA (b YOKI c)",
            "// Bu ikkisi turli natija beradi",
          ],
        },
      }),
      s("Shartni soddalashtirish", [
        "Juda murakkab shartni mantiqiy qiymatga saqlab, keyin ishlatish mumkin. Bu kodni ancha tushunarli qiladi.",
      ], {
        callout: "Murakkab shartni nomlangan qiymatga saqlash — o'qilishlilikni oshiradi.",
      }),
    ],
    [
      t("logical operator", "mantiqiy amal", "Shartlarni birlashtiruvchi amal (VA, YOKI, EMAS)."),
      t("precedence", "ustuvorlik", "Amallarning bajarilish tartibi."),
      t("parentheses", "qavslar", "Tekshirish tartibini aniq belgilovchi belgilar."),
    ],
    [
      q(
        "Murakkab shartda qavs qo'yishning foydasi nima?",
        ["Kod qisqaradi", "Tekshirish tartibi aniq bo'ladi", "Tezroq ishlaydi"],
        1,
        "Qavs amallarning bajarilish tartibini aniq belgilaydi va noaniqlikni yo'qotadi."
      ),
    ]
  ),

  "m4-l3-3": L(
    "Ko'p tarmoqli qaror daraxtini loyihalashtirasiz.",
    [
      s("Qaror daraxti", [
        "Decision tree (qaror daraxti) — bir necha ketma-ket shart orqali yakuniy natijaga olib boruvchi tuzilma.",
        "Har shart daraxtni ikkiga bo'ladi. Uchta ketma-ket shart 8 tagacha turli natija berishi mumkin.",
      ], {
        code: {
          caption: "Qaror daraxti",
          lines: [
            "agar (ball >= 90) {",
            "  baho = \"A\"",
            "} aks holda agar (ball >= 75) {",
            "  baho = \"B\"",
            "} aks holda agar (ball >= 60) {",
            "  baho = \"C\"",
            "} aks holda {",
            "  baho = \"F\"",
            "}",
          ],
        },
      }),
      s("Tartib muhim", [
        "else if zanjirida shartlar tartibi muhim: birinchi rost topilgan blok bajariladi va qolganlar tekshirilmaydi. Shuning uchun eng qat'iy shartni yuqoriga qo'yish kerak.",
      ], {
        callout: "else if zanjirida birinchi rost shart g'olib chiqadi.",
      }),
    ],
    [
      t("decision tree", "qaror daraxti", "Ketma-ket shartlar orqali natijaga olib boruvchi tuzilma."),
      t("short-circuit", "qisqa tutashuv", "Natija aniq bo'lgach qolgan shartlarni tekshirmaslik."),
      t("branch", "tarmoq", "Qaror daraxtining bir yo'li."),
    ],
    [
      q(
        "else if zanjirida ball = 95 bo'lsa qaysi blok bajariladi?",
        ["Barcha rost shartlar", "Faqat birinchi rost topilgan blok", "Oxirgi blok"],
        1,
        "Birinchi rost shart bajariladi, qolganlari umuman tekshirilmaydi."
      ),
    ]
  ),

  "m4-l3-4": L(
    "4-modul: shartlar va mantiq bo'yicha yakuniy takrorlash.",
    [
      s("Modul xulosasi", [
        "Boolean (mantiqiy tur) — true va false; taqqoslash amallari shu qiymatlarni hosil qiladi.",
        "Tarmoqlanish (branching) boshqaruv oqimini (control flow) boshqaradi.",
        "if / else dan aynan bittasi bajariladi; else if ko'p variant beradi.",
        "AND (VA), OR (YOKI), NOT (EMAS) shartlarni birlashtiradi; qavs tartibni aniqlaydi.",
        "Qaror daraxtida (decision tree) birinchi rost shart g'olib chiqadi.",
      ], {
        callout: "Endi ma'lumotni xotirada saqlashga — o'zgaruvchilarga o'tamiz.",
      }),
    ],
    [
      t("boolean", "mantiqiy tur", "true / false qiymati."),
      t("branching", "tarmoqlanish", "Yo'l tanlash."),
      t("logical operator", "mantiqiy amal", "Shartlarni birlashtirish."),
    ],
    [
      q(
        "false YOKI true ifodasining natijasi qanday?",
        ["false", "true", "Xato"],
        1,
        "OR uchun kamida bitta shart rost bo'lishi yetarli."
      ),
      q(
        "Control flow nima?",
        ["Kod hajmi", "Kodning bajarilish yo'li", "Xotira miqdori"],
        1,
        "Control flow — qaysi qatorlar qanday tartibda bajarilishini bildiradi."
      ),
      q(
        "AND amali qachon rost qiymat beradi?",
        ["Kamida bittasi rost bo'lsa", "Barcha shartlar rost bo'lsa", "Hech biri rost bo'lmasa"],
        1,
        "AND barcha shartlar rost bo'lishini talab qiladi."
      ),
    ]
  ),
};
