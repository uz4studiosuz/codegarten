import { LessonContent, L, s, t, q } from "./types";

/** MODULE 1 — Buyruqlar va Ketma-ketlik (Commands & Sequencing) */
export const module1: Record<string, LessonContent> = {
  "m1-l1-1": L(
    "Kompyuter buyruqni qanday tushunishini va nega aniqlik muhimligini bilib olasiz.",
    [
      s("Kompyuter o'ylamaydi, bajaradi", [
        "Odam bilan gaplashganda ko'p narsa aytilmasa ham tushuniladi. \"Choy damlab qo'y\" desangiz, suvni qaynatish va choyni solish kerakligini odam o'zi biladi.",
        "Kompyuter esa taxmin qilmaydi. U faqat berilgan instruction (buyruq) ni, aynan aytilgan tartibda bajaradi. Bir qadamni aytishni unutsangiz, u shu qadamni tashlab ketadi va ogohlantirmaydi ham.",
      ]),
      s("Aniqlik — birinchi ko'nikma", [
        "Shuning uchun dasturlashdagi eng muhim ko'nikma — fikrni aniq qadamlarga aylantirish.",
      ], {
        code: {
          caption: "Noaniq va aniq buyruq",
          lines: [
            "// Kompyuter tushunmaydi:",
            "kvadrat chiz",
            "",
            "// Kompyuter tushunadi:",
            "oldinga(100)",
            "o'ngga(90)",
            "oldinga(100)",
            "o'ngga(90)",
          ],
        },
        callout: "Kompyuter — juda tez, lekin juda ham so'zma-so'z ijrochi.",
      }),
    ],
    [
      t("instruction", "buyruq", "Kompyuterga beriladigan bitta aniq ko'rsatma."),
      t("execute", "bajarish", "Buyruqni amalda ishga tushirish jarayoni."),
      t("literal", "so'zma-so'z", "Aytilganidan ortiq ham, kam ham emas — aynan shundayligicha."),
    ],
    [
      q(
        "Kompyuterga \"xonani tozala\" deb buyruq bersak nima bo'ladi?",
        [
          "O'zi tushunib, kerakli ishlarni bajaradi",
          "Tushunmaydi — buyruq juda noaniq",
          "Xatoni tuzatib, so'ng bajaradi",
        ],
        1,
        "Kompyuter noaniq buyruqni to'ldirib qo'ymaydi. Har bir qadam alohida va aniq aytilishi kerak."
      ),
    ]
  ),

  "m1-l1-2": L(
    "Birinchi ishlaydigan buyruqni yozib, natijasini ekranda ko'rasiz.",
    [
      s("Buyruq qanday ko'rinadi", [
        "Har bir buyruq ikki qismdan iborat: nima qilish kerak (command — buyruq nomi) va qanday qilish kerak (parameter — parametr).",
        "Masalan oldinga(100) da \"oldinga\" — buyruq, 100 esa parametr: qancha masofaga yurish kerakligini bildiradi.",
      ], {
        code: {
          caption: "Buyruq tuzilishi",
          lines: [
            "oldinga(100)",
            "//  ^      ^",
            "//  |      parameter (parametr)",
            "//  command (buyruq)",
          ],
        },
      }),
      s("Parametrni o'zgartirish", [
        "Parametrni o'zgartirsangiz natija ham o'zgaradi. Ya'ni bitta buyruq bilan turli ishlarni bajarish mumkin.",
      ], {
        callout: "Bitta buyruq + turli parametr = turli natija.",
      }),
    ],
    [
      t("command", "buyruq", "Bajarilishi kerak bo'lgan amalning nomi."),
      t("parameter", "parametr", "Buyruqqa uzatiladigan qiymat — qanday bajarilishini belgilaydi."),
      t("output", "natija", "Buyruq bajarilgandan keyin ko'rinadigan holat."),
    ],
    [
      q(
        "oldinga(50) buyrug'ida 50 nima vazifasini bajaradi?",
        ["Buyruq nomi", "Parametr — masofani belgilaydi", "Xato kodi"],
        1,
        "50 — parametr. U buyruqqa \"qancha?\" degan savolga javob beradi."
      ),
    ]
  ),

  "m1-l1-3": L(
    "Buyruqlar tartibi natijani qanday o'zgartirishini tushunib olasiz.",
    [
      s("Tartib hammasini o'zgartiradi", [
        "Kompyuter buyruqlarni yuqoridan pastga, birma-bir bajaradi. Bu sequence (ketma-ketlik) deb ataladi.",
        "Xuddi retseptdek: avval xamir qorib, keyin pishirasiz. Tartibni almashtirsangiz natija butunlay boshqacha bo'ladi.",
      ], {
        code: {
          caption: "Bir xil buyruqlar, boshqa natija",
          lines: [
            "// 1-variant: avval yuradi, keyin buriladi",
            "oldinga(100)",
            "o'ngga(90)",
            "",
            "// 2-variant: avval buriladi, keyin yuradi",
            "o'ngga(90)",
            "oldinga(100)",
          ],
        },
      }),
      s("Nega bu muhim", [
        "Dasturdagi ko'p xatolar buyruqlar noto'g'ri tartibda yozilganidan kelib chiqadi. Kod \"ishlaydi\", lekin kutilgan natijani bermaydi.",
      ], {
        callout: "Bir xil buyruqlar to'plami — turli tartibda butunlay boshqa dastur.",
      }),
    ],
    [
      t("sequence", "ketma-ketlik", "Buyruqlarning yuqoridan pastga bajarilish tartibi."),
      t("order", "tartib", "Qaysi buyruq oldin, qaysi keyin bajarilishi."),
      t("top-to-bottom", "yuqoridan pastga", "Kodning standart o'qilish va bajarilish yo'nalishi."),
    ],
    [
      q(
        "Buyruqlar tartibini almashtirsak natija o'zgaradimi?",
        ["Yo'q, buyruqlar bir xil bo'lsa natija ham bir xil", "Ha, tartib natijani o'zgartiradi", "Faqat uzun dasturlarda o'zgaradi"],
        1,
        "Ketma-ketlik natijaning bir qismi. Tartib o'zgarsa dastur boshqa ishni bajaradi."
      ),
    ]
  ),

  "m1-l1-4": L(
    "Ishlamayotgan koddagi xatoni topish va tuzatish usulini o'rganasiz.",
    [
      s("Xato — bu odatiy hol", [
        "Hech bir dasturchi kodni birinchi urinishda mukammal yozmaydi. Xatoni topib tuzatish jarayoni debugging (xatoni tuzatish) deb ataladi.",
        "Eng ishonchli usul — kodni kompyuter kabi o'qish: har bir qatorni birma-bir bajarib, natijani kuzatib borish.",
      ]),
      s("Xatoni topish tartibi", [
        "1. Kutilgan natijani aniq yozib oling.",
        "2. Kodni qator-qator \"qo'lda\" bajaring.",
        "3. Natija kutilganidan chetga chiqqan qatorni toping — xato aynan shu joyda.",
      ], {
        code: {
          caption: "Kvadrat chizmoqchi edik, lekin qadam kam",
          lines: [
            "oldinga(100)",
            "o'ngga(90)",
            "oldinga(100)",
            "o'ngga(90)",
            "oldinga(100)",
            "// yetishmayapti: yana bir burilish va bir yurish",
          ],
        },
        callout: "Xatoni izlashda taxmin qilmang — kodni bajarib ko'ring.",
      }),
    ],
    [
      t("bug", "xato", "Dasturning kutilganidan boshqacha ishlashiga olib keladigan nuqson."),
      t("debugging", "xatoni tuzatish", "Xatoni topish, sababini aniqlash va bartaraf etish jarayoni."),
      t("trace", "kuzatish", "Kodni qator-qator bajarib, holatni yozib borish usuli."),
    ],
    [
      q(
        "Kod ishlaydi, lekin natija noto'g'ri. Birinchi navbatda nima qilish kerak?",
        ["Kodni butunlay o'chirib, boshidan yozish", "Kutilgan natijani aniqlab, kodni qator-qator kuzatish", "Tasodifiy qatorlarni o'zgartirib ko'rish"],
        1,
        "Avval nima kutilganini aniq bilish, keyin kodni kuzatib chetga chiqqan joyni topish kerak."
      ),
    ]
  ),

  "m1-l1-5": L(
    "1-bosqich: buyruq, parametr va ketma-ketlik tushunchalarini mustahkamlaysiz.",
    [
      s("Bosqich xulosasi", [
        "Kompyuter so'zma-so'z ijrochi: faqat aytilgan narsani, aytilgan tartibda bajaradi.",
        "Har bir buyruq (command) nomdan va kerak bo'lsa parametr (parameter) dan iborat.",
        "Buyruqlar ketma-ketligi (sequence) natijani belgilaydi — tartib o'zgarsa natija ham o'zgaradi.",
        "Xatoni tuzatish (debugging) — taxmin qilish emas, kodni kuzatib borish.",
      ], {
        callout: "Keyingi bosqichda katta vazifani mayda qadamlarga bo'lishni o'rganamiz.",
      }),
    ],
    [
      t("sequence", "ketma-ketlik", "Bosqichning asosiy tushunchasi — bajarilish tartibi."),
      t("debugging", "xatoni tuzatish", "Xatoni kuzatish orqali topish."),
    ],
    [
      q(
        "Quyidagilardan qaysi biri kompyuter uchun to'g'ri buyruq hisoblanadi?",
        ["Chiroyli rasm chiz", "oldinga(100)", "Nimadir qil"],
        1,
        "Faqat oldinga(100) aniq: qaysi amal va qanday qiymat bilan — ikkisi ham ko'rsatilgan."
      ),
      q(
        "Dasturda xato bo'lsa, bu nimani bildiradi?",
        ["Dasturchi qobiliyatsiz", "Bu odatiy hol — tuzatish jarayonning bir qismi", "Kodni tashlab yuborish kerak"],
        1,
        "Xato — normal hol. Dasturlashning katta qismi aynan xatolarni topib tuzatishdan iborat."
      ),
    ]
  ),

  "m1-l2-1": L(
    "Katta vazifani bajarilishi mumkin mayda qadamlarga bo'lishni o'rganasiz.",
    [
      s("Katta vazifa — mayda qadamlar", [
        "\"Uyni tozala\" — bu vazifa, buyruq emas. Uni bajarish uchun kichik qadamlarga bo'lish kerak: idishlarni yuvish, polni supurish, chang olish.",
        "Bu usul decomposition (bo'laklash) deb ataladi va dasturlashning eng kuchli vositalaridan biri.",
      ]),
      s("Qanday bo'laklash kerak", [
        "Qadam shunchalik mayda bo'lishi kerak-ki, uni bajarish uchun yana savol tug'ilmasin. Agar \"buni qanday qilaman?\" degan savol qolsa — qadam hali ham katta.",
      ], {
        code: {
          caption: "Vazifani bo'laklash",
          lines: [
            "// Vazifa: kvadrat chizish",
            "// 1-daraja: 4 ta qirra chizish",
            "// 2-daraja:",
            "oldinga(100)   // qirra",
            "o'ngga(90)     // burilish",
            "// ... va shu 4 marta",
          ],
        },
        callout: "Qadam \"qanday?\" savolini tug'dirmasa — yetarlicha mayda.",
      }),
    ],
    [
      t("decomposition", "bo'laklash", "Katta vazifani mayda, bajariladigan qismlarga ajratish."),
      t("task", "vazifa", "Erishilishi kerak bo'lgan umumiy maqsad."),
      t("step", "qadam", "Vazifaning bo'linmas, bajariladigan bir qismi."),
    ],
    [
      q(
        "Qadam yetarlicha mayda bo'lganini qanday bilamiz?",
        ["Bir qatorga sig'sa", "\"Buni qanday qilaman?\" degan savol qolmasa", "Uzunligi 10 so'zdan kam bo'lsa"],
        1,
        "Agar qadamni bajarish uchun yana tushuntirish kerak bo'lsa, u hali ham katta hisoblanadi."
      ),
    ]
  ),

  "m1-l2-2": L(
    "Robotni buyruqlar bilan boshqarib, mo'ljalga olib borasiz.",
    [
      s("Holat va harakat", [
        "Robotning ikki xususiyati bor: qayerda turgani (position — pozitsiya) va qayoqqa qaragani (direction — yo'nalish).",
        "Har bir buyruq shu ikkisidan birini o'zgartiradi. \"oldinga\" pozitsiyani, \"burilish\" yo'nalishni o'zgartiradi.",
      ], {
        code: {
          caption: "Pozitsiya va yo'nalish",
          lines: [
            "// Boshlanish: (0,0), o'ngga qaragan",
            "oldinga(2)      // (2,0) — yo'nalish o'zgarmadi",
            "o'ngga_buril()  // (2,0) — pozitsiya o'zgarmadi",
            "oldinga(1)      // (2,1)",
          ],
        },
      }),
      s("Yo'nalishni hisobga olish", [
        "Eng ko'p uchraydigan xato — yo'nalishni unutish. \"oldinga\" har doim bir tomonga emas, robot qaragan tomonga harakat qiladi.",
      ], {
        callout: "Burilishdan keyin \"oldinga\" boshqa tomonni bildiradi.",
      }),
    ],
    [
      t("position", "pozitsiya", "Robotning maydondagi joyi, koordinatalar bilan beriladi."),
      t("direction", "yo'nalish", "Robot hozir qaysi tomonga qaragani."),
      t("state", "holat", "Pozitsiya va yo'nalishning birgalikdagi hozirgi qiymati."),
    ],
    [
      q(
        "Robot o'ngga qaragan, keyin bir marta buriladi. \"oldinga\" endi qayoqqa harakat qiladi?",
        ["Yana o'ngga", "Burilgandan keyingi yangi yo'nalishga", "Boshlang'ich yo'nalishga"],
        1,
        "\"oldinga\" har doim robot ayni damda qaragan yo'nalishga harakat qiladi."
      ),
    ]
  ),

  "m1-l2-3": L(
    "Kodni qisqartirib, ortiqcha qadamlarni olib tashlashni o'rganasiz.",
    [
      s("Ortiqcha qadam nima", [
        "Ba'zi buyruqlar natijaga hech qanday ta'sir qilmaydi. Masalan to'rt marta ketma-ket burilish robotni boshlang'ich yo'nalishga qaytaradi — ya'ni hech narsa o'zgarmaydi.",
        "Bunday buyruqlarni olib tashlash optimization (optimallashtirish) deb ataladi.",
      ], {
        code: {
          caption: "Ortiqcha burilishlar",
          lines: [
            "// Ortiqcha:",
            "o'ngga_buril()",
            "o'ngga_buril()",
            "o'ngga_buril()",
            "o'ngga_buril()   // 360 daraja — hech narsa o'zgarmadi",
            "",
            "// Bu 4 qator umuman kerak emas",
          ],
        },
      }),
      s("Qisqa kod — yaxshi kod", [
        "Qisqa kodni o'qish, tushunish va tuzatish osonroq. Lekin qisqartirish natijani o'zgartirmasligi shart — aks holda bu xato bo'ladi.",
      ], {
        callout: "Qisqartirish natijani o'zgartirsa — bu optimallashtirish emas, buzilish.",
      }),
    ],
    [
      t("optimization", "optimallashtirish", "Natijani saqlab, kodni qisqartirish yoki tezlashtirish."),
      t("redundant", "ortiqcha", "Natijaga ta'sir qilmaydigan, keraksiz buyruq."),
      t("refactor", "qayta tuzish", "Ishlashini o'zgartirmasdan kod tuzilishini yaxshilash."),
    ],
    [
      q(
        "Kodni qisqartirishda eng muhim shart nima?",
        ["Qatorlar soni yarmiga kamayishi", "Natija o'zgarmasligi", "Barcha izohlarni o'chirish"],
        1,
        "Optimallashtirish natijani saqlashi kerak. Natija o'zgarsa, bu qisqartirish emas."
      ),
    ]
  ),

  "m1-l2-4": L(
    "Labirintdan chiqish uchun to'liq algoritm tuzasiz.",
    [
      s("Yo'lni oldin rejalashtiring", [
        "Labirintda darhol kod yozishga shoshilmang. Avval yo'lni ko'z bilan kuzatib, burilish nuqtalarini belgilab oling.",
        "Keyin har bir bo'lakni buyruqqa aylantiring: qancha yurish, qayerda burilish.",
      ], {
        code: {
          caption: "Reja — keyin kod",
          lines: [
            "// Reja: 2 katak o'ngga, keyin 1 katak pastga",
            "oldinga(2)",
            "o'ngga_buril()",
            "oldinga(1)",
          ],
        },
      }),
      s("To'siqlarni hisobga olish", [
        "Devor bor joyga yurish buyrug'i xatoga olib keladi. Har bir qadamdan keyin robot qayerda turganini tekshirib boring.",
      ], {
        callout: "Reja qog'ozda ishlamasa, kodda ham ishlamaydi.",
      }),
    ],
    [
      t("algorithm", "algoritm", "Maqsadga olib boruvchi aniq qadamlar ketma-ketligi."),
      t("path", "yo'l", "Boshlang'ich nuqtadan mo'ljalga qadar bo'lgan harakat izi."),
      t("obstacle", "to'siq", "Harakatni to'xtatuvchi element — devor yoki chegara."),
    ],
    [
      q(
        "Labirint masalasini yechishda birinchi qadam nima?",
        ["Darhol kod yozishni boshlash", "Yo'lni rejalashtirib, burilish nuqtalarini belgilash", "Barcha yo'nalishlarni tasodifiy sinash"],
        1,
        "Reja tuzmasdan yozilgan kod ko'p urinish talab qiladi. Avval yo'lni aniqlang."
      ),
    ]
  ),

  "m1-l2-5": L(
    "2-bosqich: bo'laklash, holat va optimallashtirish tushunchalarini mustahkamlaysiz.",
    [
      s("Bosqich xulosasi", [
        "Katta vazifani bo'laklash (decomposition) — har bir qadam \"qanday?\" savolini tug'dirmasligi kerak.",
        "Robotning holati (state) pozitsiya va yo'nalishdan iborat; har bir buyruq shulardan birini o'zgartiradi.",
        "Optimallashtirish (optimization) — natijani saqlab, ortiqcha qadamlarni olib tashlash.",
        "Algoritm avval rejada, keyin kodda tug'iladi.",
      ], {
        callout: "Keyingi bosqichda algoritm tushunchasini rasmiy ta'riflaymiz.",
      }),
    ],
    [
      t("decomposition", "bo'laklash", "Vazifani mayda qadamlarga ajratish."),
      t("state", "holat", "Dasturning ayni damdagi barcha qiymatlari."),
    ],
    [
      q(
        "\"oldinga\" buyrug'i nimaga bog'liq holda ishlaydi?",
        ["Har doim bir xil tomonga", "Robotning hozirgi yo'nalishiga", "Buyruq nechanchi qatorda turganiga"],
        1,
        "Harakat robot qaragan yo'nalishga bo'ladi, shuning uchun burilishlarni kuzatib borish kerak."
      ),
      q(
        "4 marta ketma-ket o'ngga burilish nimaga olib keladi?",
        ["Robot boshlang'ich yo'nalishga qaytadi", "Robot orqaga qaraydi", "Xato yuz beradi"],
        0,
        "4 x 90 = 360 daraja, ya'ni to'liq aylanish. Yo'nalish o'zgarmaydi — bu ortiqcha kod."
      ),
    ]
  ),

  "m1-l3-1": L(
    "Algoritmning rasmiy ta'rifi va uning shartlarini o'rganasiz.",
    [
      s("Algoritm nima", [
        "Algorithm (algoritm) — muayyan masalani yechish uchun aniq belgilangan, chekli qadamlar ketma-ketligi.",
        "Bu nom IX asrda yashagan buyuk xorazmiy matematik Muhammad al-Xorazmiy nomidan kelib chiqqan.",
      ]),
      s("Algoritmning shartlari", [
        "Aniqlik — har bir qadam bir xil tushunilishi kerak, ikki xil ma'no bo'lmasin.",
        "Chekli — algoritm cheklangan qadamdan keyin tugashi shart.",
        "Natijaviylik — bajarilgandan keyin aniq natija berishi kerak.",
        "Ommaviylik — bir turdagi barcha masalalar uchun ishlashi kerak.",
      ], {
        callout: "Cheksiz davom etadigan qadamlar ketma-ketligi algoritm hisoblanmaydi.",
      }),
    ],
    [
      t("algorithm", "algoritm", "Masalani yechuvchi aniq va chekli qadamlar ketma-ketligi."),
      t("finite", "chekli", "Cheklangan qadamdan keyin albatta tugaydigan."),
      t("deterministic", "aniq", "Bir xil kirish uchun har doim bir xil natija beruvchi."),
    ],
    [
      q(
        "Quyidagilardan qaysi biri algoritm bo'lish shartini buzadi?",
        ["Qadamlar aniq yozilgan", "Hech qachon tugamaydi", "Natija beradi"],
        1,
        "Chekli bo'lish — algoritmning majburiy sharti. Tugamaydigan jarayon algoritm emas."
      ),
    ]
  ),

  "m1-l3-2": L(
    "Kundalik hayotdagi algoritmlarni tanib, ularni qadamlarga ajratasiz.",
    [
      s("Algoritmlar atrofimizda", [
        "Retsept, yo'l ko'rsatmasi, dori ichish tartibi — bularning barchasi algoritm. Har birida aniq qadamlar va aniq tartib bor.",
        "Kundalik algoritmlarni tanib olish dasturlash tafakkurini rivojlantiradi.",
      ], {
        code: {
          caption: "Choy damlash algoritmi",
          lines: [
            "1. Choynakni chayqash",
            "2. Suvni qaynatish",
            "3. Choy solish (2 choy qoshiq)",
            "4. Qaynoq suv quyish",
            "5. 5 daqiqa kutish",
          ],
        },
      }),
      s("Bog'liq qadamlar", [
        "Ba'zi qadamlar joyini almashtirsa bo'ladi, ba'zilari yo'q. Suvni qaynatmasdan quyish mumkin emas — bu dependency (bog'liqlik) deb ataladi.",
      ], {
        callout: "Bog'liq qadamlar tartibini o'zgartirish algoritmni buzadi.",
      }),
    ],
    [
      t("dependency", "bog'liqlik", "Bir qadamning boshqasidan keyin bajarilishi shartligi."),
      t("procedure", "tartib-qoida", "Belgilangan tartibda bajariladigan qadamlar to'plami."),
      t("input", "kirish", "Algoritm ishlashi uchun kerak bo'ladigan boshlang'ich ma'lumot."),
    ],
    [
      q(
        "Choy damlashda qaysi ikki qadam o'rnini almashtirish mumkin emas?",
        ["Choynakni chayqash va choy solish", "Suvni qaynatish va qaynoq suv quyish", "Kutish va ichish"],
        1,
        "Suv qaynamasa, qaynoq suv quyish mumkin emas — bu bog'liq qadamlar."
      ),
    ]
  ),

  "m1-l3-3": L(
    "Bir necha yechim orasidan eng qisqasini tanlashni o'rganasiz.",
    [
      s("Bitta masala, ko'p yechim", [
        "Bir masalani turli algoritmlar bilan yechish mumkin. Ularning barchasi to'g'ri natija beradi, lekin qadamlar soni farq qiladi.",
        "Kamroq qadam — kamroq vaqt va kamroq xato ehtimoli. Shuning uchun efficiency (samaradorlik) muhim.",
      ], {
        code: {
          caption: "Bir xil natija, turli yo'l",
          lines: [
            "// A yechimi: 6 qadam",
            "oldinga(1) oldinga(1) oldinga(1)",
            "o'ngga_buril() oldinga(1) oldinga(1)",
            "",
            "// B yechimi: 3 qadam",
            "oldinga(3)",
            "o'ngga_buril()",
            "oldinga(2)",
          ],
        },
      }),
      s("Qanday tanlaymiz", [
        "Yechimni tanlashda ikki narsani solishtiramiz: qadamlar soni va kodning tushunarliligi. Ba'zan bir oz uzunroq, lekin ancha tushunarli kod yaxshiroq tanlov bo'ladi.",
      ], {
        callout: "Eng qisqa kod har doim eng yaxshi kod emas — o'qilishlilik ham muhim.",
      }),
    ],
    [
      t("efficiency", "samaradorlik", "Masalani kamroq qadam va resurs bilan yechish darajasi."),
      t("solution", "yechim", "Masalani hal qiluvchi aniq algoritm."),
      t("readability", "o'qilishlilik", "Kodni boshqa odam tushunishining osonligi."),
    ],
    [
      q(
        "Ikki algoritm bir xil natija beradi: biri 3, ikkinchisi 8 qadam. Qaysi biri samaraliroq?",
        ["8 qadamli — batafsilroq", "3 qadamli", "Ikkisi ham bir xil"],
        1,
        "Samaradorlik kamroq qadam bilan bir xil natijaga erishishni bildiradi."
      ),
    ]
  ),

  "m1-l3-4": L(
    "1-modul: buyruq, ketma-ketlik va algoritm bo'yicha yakuniy takrorlash.",
    [
      s("Modul xulosasi", [
        "Kompyuter so'zma-so'z ijrochi — har bir qadam aniq aytilishi kerak.",
        "Buyruq (command) nomdan va parametr (parameter) dan iborat; ketma-ketlik (sequence) natijani belgilaydi.",
        "Katta vazifa bo'laklanadi (decomposition), ortiqcha qadamlar olib tashlanadi (optimization).",
        "Algoritm (algorithm) aniq, chekli va natijaviy bo'lishi shart.",
        "Bir masalaning ko'p yechimi bor — samaradorlik (efficiency) va o'qilishlilik orasida muvozanat tanlanadi.",
      ], {
        callout: "Endi takrorlanuvchi naqshlarni avtomatlashtirishga — sikllarga o'tamiz.",
      }),
    ],
    [
      t("algorithm", "algoritm", "Modulning markaziy tushunchasi."),
      t("sequence", "ketma-ketlik", "Bajarilish tartibi."),
      t("efficiency", "samaradorlik", "Kamroq qadam bilan bir xil natija."),
    ],
    [
      q(
        "Algoritm bo'lish uchun majburiy shart qaysi?",
        ["Kamida 10 qadamdan iborat bo'lishi", "Chekli — albatta tugashi", "Ingliz tilida yozilishi"],
        1,
        "Chekli bo'lish majburiy shart. Tugamaydigan jarayon algoritm hisoblanmaydi."
      ),
      q(
        "Bo'laklash (decomposition) nima uchun kerak?",
        ["Kodni uzunroq qilish uchun", "Katta vazifani bajariladigan qadamlarga ajratish uchun", "Xatolarni yashirish uchun"],
        1,
        "Bo'laklash katta, tushunarsiz vazifani aniq va bajariladigan qadamlarga aylantiradi."
      ),
      q(
        "Kompyuter noaniq buyruqni qanday bajaradi?",
        ["Taxmin qilib to'ldiradi", "Bajarmaydi yoki kutilmagan natija beradi", "Dasturchidan so'raydi"],
        1,
        "Kompyuter taxmin qilmaydi. Aniqlik dasturchining vazifasi."
      ),
    ]
  ),
};
