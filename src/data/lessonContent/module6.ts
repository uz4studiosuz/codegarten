import { LessonContent, L, s, t, q } from "./types";

/** MODULE 6 — Algoritmik Murakkablik (Algorithmic Efficiency & Big-O) */
export const module6: Record<string, LessonContent> = {
  "m6-l1-1": L(
    "Algoritm tezligi nima uchun muhimligini va u qanday o'lchanishini tushunib olasiz.",
    [
      s("Tezlik masshtabda ko'rinadi", [
        "10 element bilan har qanday algoritm tez ishlaydi. Farq million element bilan ishlaganda ko'rinadi.",
        "Sekin algoritm kichik ma'lumotda muammo tug'dirmaydi, lekin ma'lumot o'sgach dastur ishlamay qoladi.",
      ], {
        code: {
          caption: "Masshtab farqi",
          lines: [
            "// 1 000 000 element uchun taxminiy vaqt:",
            "// Tez algoritm:   0.02 sekund",
            "// Sekin algoritm: 3 soat",
            "",
            "// 10 element uchun ikkisi ham bir zumda ishlaydi",
          ],
        },
      }),
      s("Vaqtni sekundda o'lchamaymiz", [
        "Sekund kompyuterga bog'liq: kuchli kompyuterda tezroq. Shuning uchun algoritm tezligini qadamlar soni bilan o'lchaymiz.",
        "Bu o'lchov time complexity (vaqt murakkabligi) deb ataladi va kompyuterdan mustaqil.",
      ], {
        callout: "Algoritm tezligi sekundda emas, qadamlar sonida o'lchanadi.",
      }),
    ],
    [
      t("time complexity", "vaqt murakkabligi", "Algoritm qadamlari sonining ma'lumot hajmiga bog'liqligi."),
      t("scalability", "masshtablanuvchanlik", "Ma'lumot o'sganda algoritmning ishlashda davom etishi."),
      t("performance", "unumdorlik", "Algoritmning tezlik va resurs bo'yicha ko'rsatkichi."),
    ],
    [
      q(
        "Algoritm tezligini nima uchun sekundda o'lchamaymiz?",
        ["Sekund juda katta o'lchov", "Sekund kompyuter kuchiga bog'liq", "Sekundni o'lchash qiyin"],
        1,
        "Kuchli kompyuterda bir xil algoritm tezroq ishlaydi. Qadamlar soni esa kompyuterdan mustaqil."
      ),
    ]
  ),

  "m6-l1-2": L(
    "Algoritm bajaradigan qadamlar sonini sanashni o'rganasiz.",
    [
      s("Qadamlarni sanash", [
        "Qadam sanashda ma'lumot hajmini n deb belgilaymiz va algoritm nechta amal bajarishini n orqali ifodalaymiz.",
        "Oddiy sikl n element bo'ylab bir marta yursa, u n qadam bajaradi. Ichma-ich sikl esa n * n = n kvadrat qadam bajaradi.",
      ], {
        code: {
          caption: "Qadamlarni sanash",
          lines: [
            "// n qadam — bir sikl",
            "for (i = 0; i < n; i++) { ish() }",
            "",
            "// n * n qadam — ichma-ich sikl",
            "for (i = 0; i < n; i++) {",
            "  for (j = 0; j < n; j++) { ish() }",
            "}",
          ],
        },
      }),
      s("Doimiylar hisobga olinmaydi", [
        "2n va 100n — ikkisi ham \"n ga proporsional\" hisoblanadi. Katta masshtabda muhimi o'sish shakli, aniq koeffitsiyent emas.",
      ], {
        callout: "Muhimi — o'sish shakli, aniq son emas.",
      }),
    ],
    [
      t("n", "n", "Ma'lumot hajmini bildiruvchi belgi."),
      t("step count", "qadamlar soni", "Algoritm bajaradigan amallar miqdori."),
      t("growth rate", "o'sish tezligi", "n oshganda qadamlar sonining o'sish shakli."),
    ],
    [
      q(
        "Ichma-ich ikki sikl (ikkisi ham n marta) jami necha qadam bajaradi?",
        ["2n", "n * n", "n"],
        1,
        "Tashqi siklning har aylanishida ichki sikl to'liq n marta aylanadi: n * n."
      ),
    ]
  ),

  "m6-l1-3": L(
    "O(1) va O(N) murakkabliklarini solishtirishni o'rganasiz.",
    [
      s("Big-O yozuvi", [
        "Big-O notation (Big-O yozuvi) algoritmning o'sish shaklini ifodalaydi. U eng yomon holatdagi qadamlar sonini bildiradi.",
        "O(1) — constant time (doimiy vaqt): qadamlar soni ma'lumot hajmiga bog'liq emas.",
        "O(n) — linear time (chiziqli vaqt): qadamlar soni ma'lumot hajmiga proporsional o'sadi.",
      ], {
        code: {
          caption: "O(1) va O(n)",
          lines: [
            "// O(1) — ro'yxat qanchalik katta bo'lsa ham 1 qadam",
            "birinchi = ballar[0]",
            "",
            "// O(n) — har elementni ko'rish kerak",
            "for (i = 0; i < n; i++) {",
            "  agar (ballar[i] == izlanayotgan) return i",
            "}",
          ],
        },
      }),
      s("Amaliy farq", [
        "Ro'yxat 1000 barobar kattalashsa: O(1) algoritm bir xil tezlikda ishlaydi, O(n) algoritm esa 1000 barobar sekinlashadi.",
      ], {
        callout: "O(1) hajmga bog'liq emas, O(n) hajm bilan proporsional o'sadi.",
      }),
    ],
    [
      t("Big-O notation", "Big-O yozuvi", "Algoritmning o'sish shaklini ifodalovchi yozuv."),
      t("constant time", "doimiy vaqt", "O(1) — hajmga bog'liq bo'lmagan tezlik."),
      t("linear time", "chiziqli vaqt", "O(n) — hajmga proporsional tezlik."),
    ],
    [
      q(
        "Ro'yxatning birinchi elementini olish qanday murakkablikka ega?",
        ["O(n)", "O(1)", "O(n kvadrat)"],
        1,
        "Indeks orqali murojaat bir qadamda bajariladi va ro'yxat hajmiga bog'liq emas."
      ),
    ]
  ),

  "m6-l1-4": L(
    "1-bosqich: vaqt murakkabligi va Big-O bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Algoritm tezligi qadamlar sonida o'lchanadi (time complexity), sekundda emas.",
        "n — ma'lumot hajmi; bir sikl n qadam, ichma-ich sikl n kvadrat qadam bajaradi.",
        "O(1) — doimiy vaqt (constant time); O(n) — chiziqli vaqt (linear time).",
        "Doimiy koeffitsiyentlar hisobga olinmaydi — muhimi o'sish shakli.",
      ], {
        callout: "Keyingi bosqichda qidirish algoritmlarini solishtiramiz.",
      }),
    ],
    [
      t("Big-O notation", "Big-O yozuvi", "O'sish shaklini ifodalash."),
      t("time complexity", "vaqt murakkabligi", "Qadamlar sonining hajmga bog'liqligi."),
    ],
    [
      q(
        "O(1) murakkablik nimani bildiradi?",
        ["Bir sekundda ishlaydi", "Qadamlar soni ma'lumot hajmiga bog'liq emas", "Faqat bitta element bilan ishlaydi"],
        1,
        "O(1) — ma'lumot qanchalik katta bo'lsa ham qadamlar soni o'zgarmaydi."
      ),
      q(
        "Ichma-ich ikki sikl murakkabligi qanday?",
        ["O(n)", "O(n kvadrat)", "O(1)"],
        1,
        "n * n qadam bajariladi, ya'ni O(n kvadrat)."
      ),
    ]
  ),

  "m6-l2-1": L(
    "Chiziqli qidiruv qanday ishlashini va uning cheklovini o'rganasiz.",
    [
      s("Boshdan oxirigacha", [
        "Linear search (chiziqli qidiruv) — eng oddiy qidirish usuli: elementlarni birinchisidan boshlab birma-bir tekshirib borish.",
        "Uning katta afzalligi bor: ro'yxat tartiblangan bo'lishi shart emas. Kamchiligi — sekin.",
      ], {
        code: {
          caption: "Chiziqli qidiruv",
          lines: [
            "funksiya chiziqli_qidiruv(ro'yxat, maqsad) {",
            "  for (i = 0; i < ro'yxat.uzunlik; i++) {",
            "    agar (ro'yxat[i] == maqsad) {",
            "      return i",
            "    }",
            "  }",
            "  return -1     // topilmadi",
            "}",
          ],
        },
      }),
      s("Eng yomon holat", [
        "Izlanayotgan element oxirida bo'lsa yoki umuman bo'lmasa, barcha n elementni ko'rishga to'g'ri keladi. Shuning uchun murakkablik O(n).",
      ], {
        callout: "Chiziqli qidiruv: O(n), lekin tartiblash talab qilmaydi.",
      }),
    ],
    [
      t("linear search", "chiziqli qidiruv", "Elementlarni birma-bir tekshirib qidirish usuli."),
      t("worst case", "eng yomon holat", "Algoritm eng ko'p qadam bajaradigan vaziyat."),
      t("unsorted", "tartiblanmagan", "Elementlari tartibga solinmagan ro'yxat."),
    ],
    [
      q(
        "Chiziqli qidiruvning afzalligi nima?",
        ["Juda tez ishlaydi", "Ro'yxat tartiblangan bo'lishi shart emas", "Xotira sarflamaydi"],
        1,
        "Chiziqli qidiruv har qanday ro'yxatda ishlaydi, lekin O(n) — sekin."
      ),
    ]
  ),

  "m6-l2-2": L(
    "Binary search bilan qidirishni keskin tezlashtirishni o'rganasiz.",
    [
      s("Yarmini tashlab yuborish", [
        "Binary search (ikkilik qidiruv) tartiblangan ro'yxatda ishlaydi. Har qadamda o'rtadagi elementni tekshirib, ro'yxatning yarmini butunlay tashlab yuboradi.",
        "Xuddi lug'atdan so'z izlash kabi: o'rtasini ochib, keraksiz yarmini yopib qo'yasiz.",
      ], {
        code: {
          caption: "Ikkilik qidiruv",
          lines: [
            "chap = 0,  o'ng = n - 1",
            "",
            "while (chap <= o'ng) {",
            "  o'rta = (chap + o'ng) / 2",
            "  agar (ro'yxat[o'rta] == maqsad) return o'rta",
            "  agar (ro'yxat[o'rta] < maqsad) chap = o'rta + 1",
            "  aks holda o'ng = o'rta - 1",
            "}",
          ],
        },
      }),
      s("Logarifmik tezlik", [
        "Har qadamda hajm yarmiga kamayadi, shuning uchun murakkablik O(log n) — logarithmic time (logarifmik vaqt).",
        "1 000 000 element uchun chiziqli qidiruv 1 000 000 qadam, ikkilik qidiruv esa faqat 20 qadam bajaradi.",
      ], {
        callout: "Million elementdan keraklisini 20 qadamda topish mumkin.",
      }),
    ],
    [
      t("binary search", "ikkilik qidiruv", "Tartiblangan ro'yxatda yarmini tashlab qidirish usuli."),
      t("logarithmic time", "logarifmik vaqt", "O(log n) — har qadamda hajm yarmiga kamayadigan tezlik."),
      t("sorted", "tartiblangan", "Elementlari o'sish yoki kamayish tartibida joylashgan."),
    ],
    [
      q(
        "Binary search ishlashi uchun qanday shart bajarilishi kerak?",
        ["Ro'yxat kichik bo'lishi", "Ro'yxat tartiblangan bo'lishi", "Elementlar son bo'lishi"],
        1,
        "Tartiblanmagan ro'yxatda o'rtadagi elementni taqqoslash ma'no bermaydi."
      ),
    ]
  ),

  "m6-l2-3": L(
    "Ikki algoritmni solishtirib, vaziyatga mosini tanlashni o'rganasiz.",
    [
      s("Tanlov vaziyatga bog'liq", [
        "Binary search tezroq, lekin tartiblash talab qiladi. Tartiblash esa o'zi vaqt oladi.",
        "Agar bir marta qidirish kerak bo'lsa, chiziqli qidiruv yaxshiroq: tartiblashga sarflangan vaqt o'zini oqlamaydi. Ko'p marta qidirish kerak bo'lsa — bir marta tartiblab, keyin binary search ishlatish maqsadga muvofiq.",
      ], {
        code: {
          caption: "Qaysi biri arzon?",
          lines: [
            "// 1 marta qidirish:",
            "// chiziqli:  n qadam",
            "// tartiblash + binary: n*log n + log n  -> qimmatroq",
            "",
            "// 1000 marta qidirish:",
            "// chiziqli:  1000 * n",
            "// tartiblash + binary: n*log n + 1000*log n  -> ancha arzon",
          ],
        },
      }),
      s("Muhandislik qarori", [
        "Eng tez algoritm har doim to'g'ri tanlov emas. Ma'lumot hajmi, qidirish chastotasi va kodning murakkabligi birgalikda hisobga olinadi.",
      ], {
        callout: "Eng tez algoritm har doim eng mos algoritm emas.",
      }),
    ],
    [
      t("trade-off", "murosaviy tanlov", "Bir afzallik uchun boshqasidan voz kechish."),
      t("amortized cost", "taqsimlangan narx", "Bir marta sarflangan vaqtning ko'p amalga bo'linishi."),
      t("engineering decision", "muhandislik qarori", "Amaliy shartlarni hisobga olib tanlov qilish."),
    ],
    [
      q(
        "Ro'yxatda faqat bir marta qidirish kerak bo'lsa, qaysi usul afzal?",
        ["Tartiblab, keyin binary search", "Chiziqli qidiruv", "Ikkisi bir xil"],
        1,
        "Bir marta qidirish uchun tartiblashga sarflangan vaqt o'zini oqlamaydi."
      ),
    ]
  ),

  "m6-l2-4": L(
    "2-bosqich: qidirish algoritmlari bo'yicha takrorlash.",
    [
      s("Bosqich xulosasi", [
        "Chiziqli qidiruv (linear search) O(n) — tartiblash talab qilmaydi.",
        "Ikkilik qidiruv (binary search) O(log n) — lekin ro'yxat tartiblangan bo'lishi shart.",
        "Har qadamda hajm yarmiga kamaysa, murakkablik logarifmik bo'ladi.",
        "Algoritm tanlash — murosaviy tanlov (trade-off): hajm, chastota va murakkablik hisobga olinadi.",
      ], {
        callout: "Keyingi bosqichda tartiblash algoritmlarini o'rganamiz.",
      }),
    ],
    [
      t("binary search", "ikkilik qidiruv", "O(log n) qidirish usuli."),
      t("trade-off", "murosaviy tanlov", "Afzalliklar orasidagi muvozanat."),
    ],
    [
      q(
        "1 000 000 elementli tartiblangan ro'yxatda binary search taxminan necha qadam bajaradi?",
        ["1 000 000", "20", "1000"],
        1,
        "Har qadamda hajm yarmiga kamayadi. 2 ning 20-darajasi taxminan 1 000 000."
      ),
      q(
        "Chiziqli qidiruv murakkabligi qanday?",
        ["O(1)", "O(n)", "O(log n)"],
        1,
        "Eng yomon holatda barcha n elementni tekshirishga to'g'ri keladi."
      ),
    ]
  ),

  "m6-l3-1": L(
    "Tartiblash nima uchun kerakligini tushunib olasiz.",
    [
      s("Tartib qiymat yaratadi", [
        "Sorting (tartiblash) — elementlarni ma'lum tartibda joylashtirish. U ko'p amallarni keskin tezlashtiradi.",
        "Tartiblangan ma'lumotda binary search ishlaydi, eng katta va eng kichik element bir qadamda topiladi, takrorlanuvchi elementlar yonma-yon turadi.",
      ], {
        code: {
          caption: "Tartiblash nimani osonlashtiradi",
          lines: [
            "// Tartiblanmagan: [85, 92, 78, 95]",
            "// Eng kattasini topish -> n qadam",
            "",
            "// Tartiblangan: [78, 85, 92, 95]",
            "// Eng kattasi -> oxirgi element, 1 qadam",
            "// Qidirish -> binary search, O(log n)",
          ],
        },
      }),
      s("Tartiblashning narxi", [
        "Tartiblash bepul emas — yaxshi algoritmlar O(n log n) qadam talab qiladi. Shuning uchun tartiblash faqat keyin ko'p marta ishlatilganda o'zini oqlaydi.",
      ], {
        callout: "Tartiblash keyingi barcha amallarni tezlashtiradi.",
      }),
    ],
    [
      t("sorting", "tartiblash", "Elementlarni ma'lum tartibda joylashtirish."),
      t("ascending", "o'sish tartibi", "Kichikdan kattaga qarab joylashtirish."),
      t("O(n log n)", "n log n", "Samarali tartiblash algoritmlarining murakkabligi."),
    ],
    [
      q(
        "Tartiblangan ro'yxatda eng katta elementni topish necha qadam oladi?",
        ["n qadam", "1 qadam — oxirgi element", "log n qadam"],
        1,
        "O'sish tartibida tartiblangan bo'lsa, eng katta element oxirida turadi."
      ),
    ]
  ),

  "m6-l3-2": L(
    "Bubble Sort algoritmi qanday ishlashini o'rganasiz.",
    [
      s("Qo'shnilarni solishtirish", [
        "Bubble sort (pufakchali tartiblash) — eng oddiy tartiblash algoritmi. Qo'shni elementlarni solishtirib, kerak bo'lsa o'rin almashtiradi.",
        "Har o'tishda eng katta element ro'yxat oxiriga \"pufakcha kabi\" ko'tarilib boradi — nom shundan.",
      ], {
        code: {
          caption: "Bubble sort",
          lines: [
            "for (i = 0; i < n - 1; i++) {",
            "  for (j = 0; j < n - 1 - i; j++) {",
            "    agar (ro'yxat[j] > ro'yxat[j + 1]) {",
            "      almashtir(ro'yxat[j], ro'yxat[j + 1])",
            "    }",
            "  }",
            "}",
          ],
        },
      }),
      s("Nima uchun sekin", [
        "Ichma-ich ikki sikl borligi uchun murakkablik O(n kvadrat). 1000 element uchun taxminan million amal kerak bo'ladi.",
        "Shuning uchun bubble sort amalda deyarli ishlatilmaydi — u faqat o'quv maqsadida qulay.",
      ], {
        callout: "Bubble sort: tushunarli, lekin O(n kvadrat) — sekin.",
      }),
    ],
    [
      t("bubble sort", "pufakchali tartiblash", "Qo'shni elementlarni almashtirish orqali tartiblash."),
      t("swap", "almashtirish", "Ikki elementning o'rnini o'zgartirish."),
      t("quadratic time", "kvadratik vaqt", "O(n kvadrat) — hajm kvadratiga proporsional tezlik."),
    ],
    [
      q(
        "Bubble sort murakkabligi qanday?",
        ["O(n)", "O(n kvadrat)", "O(log n)"],
        1,
        "Ichma-ich ikki sikl borligi uchun O(n kvadrat)."
      ),
    ]
  ),

  "m6-l3-3": L(
    "Vaziyatga mos tartiblash algoritmini tanlashni o'rganasiz.",
    [
      s("Algoritmlarni solishtirish", [
        "Bubble sort — O(n kvadrat), tushunarli, kichik ro'yxatlar uchun.",
        "Merge sort va Quick sort — O(n log n), amalda ishlatiladigan algoritmlar.",
        "1000 element uchun farq: O(n kvadrat) taxminan 1 000 000 amal, O(n log n) esa taxminan 10 000 amal — 100 barobar tezroq.",
      ], {
        code: {
          caption: "Masshtab farqi",
          lines: [
            "// n = 1 000",
            "// O(n kvadrat):  1 000 000 amal",
            "// O(n log n):       10 000 amal",
            "",
            "// n = 1 000 000",
            "// O(n kvadrat):  1 000 000 000 000 amal  (soatlar)",
            "// O(n log n):       20 000 000 amal      (sekundlar)",
          ],
        },
      }),
      s("Amaliy maslahat", [
        "Amalda tartiblashni o'zingiz yozmaysiz — har bir tilda tayyor, optimallashtirilgan tartiblash funksiyasi bor. Lekin murakkablikni bilish qaysi yechim ishlashini oldindan aytish imkonini beradi.",
      ], {
        callout: "Murakkablikni bilish — yechim ishlashini oldindan bilish.",
      }),
    ],
    [
      t("merge sort", "birlashtirib tartiblash", "O(n log n) murakkablikdagi barqaror tartiblash algoritmi."),
      t("quick sort", "tez tartiblash", "Amalda eng ko'p ishlatiladigan O(n log n) algoritm."),
      t("built-in", "tayyor", "Tilning o'zida mavjud, optimallashtirilgan funksiya."),
    ],
    [
      q(
        "1 000 000 element uchun O(n kvadrat) va O(n log n) orasidagi farq qanday?",
        ["Sezilmaydi", "Soatlar va sekundlar farqi", "Ikki barobar"],
        1,
        "O(n kvadrat) trillion amal, O(n log n) esa 20 million amal talab qiladi — bu amalda ishlaydi va ishlamaydi degani."
      ),
    ]
  ),

  "m6-l3-4": L(
    "6-modul: algoritmik murakkablik bo'yicha yakuniy takrorlash.",
    [
      s("Modul xulosasi", [
        "Algoritm tezligi qadamlar sonida o'lchanadi (time complexity), kompyuterdan mustaqil.",
        "O(1) doimiy, O(log n) logarifmik, O(n) chiziqli, O(n log n) va O(n kvadrat) — asosiy murakkablik sinflari.",
        "Chiziqli qidiruv O(n), ikkilik qidiruv O(log n) — lekin tartiblash talab qiladi.",
        "Bubble sort O(n kvadrat) — o'quv uchun; amalda O(n log n) algoritmlar ishlatiladi.",
        "Algoritm tanlash — murosaviy tanlov (trade-off), faqat tezlik emas.",
      ], {
        callout: "Tabriklaymiz — asosiy bosqichni yakunladingiz!",
      }),
    ],
    [
      t("Big-O notation", "Big-O yozuvi", "Modulning markaziy tushunchasi."),
      t("trade-off", "murosaviy tanlov", "Amaliy shartlar asosida tanlov."),
      t("scalability", "masshtablanuvchanlik", "Hajm o'sganda ishlashda davom etish."),
    ],
    [
      q(
        "Quyidagi murakkabliklardan qaysi biri eng tez?",
        ["O(n kvadrat)", "O(1)", "O(n)"],
        1,
        "O(1) — doimiy vaqt, ma'lumot hajmiga umuman bog'liq emas."
      ),
      q(
        "Binary search nima uchun tez ishlaydi?",
        ["Ko'p xotira ishlatadi", "Har qadamda ro'yxatning yarmini tashlab yuboradi", "Barcha elementni bir vaqtda tekshiradi"],
        1,
        "Hajmni har qadamda yarmiga qisqartirish O(log n) tezlikni beradi."
      ),
      q(
        "Eng tez algoritm har doim to'g'ri tanlovmi?",
        ["Ha, har doim", "Yo'q — hajm, chastota va murakkablik ham hisobga olinadi", "Faqat kichik ma'lumotda"],
        1,
        "Bu muhandislik qarori: tartiblash narxi, kod murakkabligi va foydalanish chastotasi ham muhim."
      ),
    ]
  ),
};
