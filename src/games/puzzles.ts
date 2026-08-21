/**
 * Game puzzles catalog
 * --------------------
 * Holds human-readable descriptors for the puzzles/variants built into each game.
 * Authors in /writer can pick an exact puzzle (or leave it auto) and see what task
 * the learner will be given.
 */

export interface GamePuzzleInfo {
  variant: number;
  title: string;
  hint: string;
  difficulty?: "Oson" | "O'rta" | "Qiyin";
}

export const GAME_PUZZLES: Record<string, GamePuzzleInfo[]> = {
  "sequence-order": [
    { variant: 0, title: "Choy damlash algoritmi", hint: "5 ta qadamni to'g'ri tartibda joylash", difficulty: "Oson" },
    { variant: 1, title: "Robot eshikdan chiqishi", hint: "4 ta qadamni to'g'ri ketma-ketlikda tuzish", difficulty: "Oson" },
    { variant: 2, title: "Rasm chizish tartibi", hint: "Tayyorgarlik, chizish va saqlash (4 qadam)", difficulty: "Oson" },
    { variant: 3, title: "Nonushta tayyorlash", hint: "Ketma-ketlikni mantiqan joylash (4 qadam)", difficulty: "O'rta" },
    { variant: 4, title: "Gamburger tayyorlash", hint: "Masalliqlarni qatlamlab terish (5 qadam)", difficulty: "O'rta" },
    { variant: 5, title: "Dastur ishga tushirish", hint: "Kod yozish, kompilyatsiya va ishga tushirish (4 qadam)", difficulty: "O'rta" },
    { variant: 6, title: "Kir yuvish ketma-ketligi", hint: "Kirlarni saralashdan quritishgacha (5 qadam)", difficulty: "O'rta" },
    { variant: 7, title: "Xat jo'natish", hint: "Xat yozish, manzil kiritish va jo'natish (4 qadam)", difficulty: "Oson" },
    { variant: 8, title: "Gul ekish", hint: "Urug' ekish va sug'orish tartibi (5 qadam)", difficulty: "O'rta" },
    { variant: 9, title: "Kvadrat chizish", hint: "Oldinga va burilish buyruqlari tartibi (4 qadam)", difficulty: "Qiyin" },
  ],
  "robot-grid": [
    { variant: 0, title: "Oson marshrut — 4x4 maydon", hint: "To'g'riga va burilish (4 ta slot)", difficulty: "Oson" },
    { variant: 1, title: "Burilish bilan — 4x4 maydon", hint: "O'ngga/chapga burilishlar (4 ta slot)", difficulty: "Oson" },
    { variant: 2, title: "Uzoqroq yo'l — 5x5 maydon", hint: "Burchakdan nishonga yetib borish (5 ta slot)", difficulty: "O'rta" },
    { variant: 3, title: "Z-shakl marshrut — 5x5 maydon", hint: "Murakkab burilishlar ketma-ketligi (6 ta slot)", difficulty: "O'rta" },
    { variant: 4, title: "Burchakdan burchakka — 5x5 maydon", hint: "Maydon bo'ylab to'liq harakat (6 ta slot)", difficulty: "O'rta" },
    { variant: 5, title: "Spiral yo'l — 5x5 maydon", hint: "Maydon markaziga burilib borish (6 ta slot)", difficulty: "Qiyin" },
    { variant: 6, title: "Tejamkor yo'l — 4x4 maydon", hint: "Eng qisqa buyruqlar soni bilan (5 ta slot)", difficulty: "O'rta" },
    { variant: 7, title: "Murakkab labirint — 6x6 maydon", hint: "Katta maydonda optimal marshrut (7 ta slot)", difficulty: "Qiyin" },
  ],
  "loop-repeat": [
    { variant: 0, title: "Yashil + Binafsha naqsh", hint: "4 x 2 = 8 katakli takrorlanuvchi sikl", difficulty: "Oson" },
    { variant: 1, title: "Uch xil rang takrori", hint: "3 x 3 = 9 katak (yashil, sariq, ko'k)", difficulty: "Oson" },
    { variant: 2, title: "Bitta rangli 5 marta takror", hint: "Eng qisqa 1 katakli bo'lakni 5 marta aylantirish", difficulty: "Oson" },
    { variant: 3, title: "Sariq + Ko'k naqsh", hint: "3 x 2 = 6 katakli takror", difficulty: "O'rta" },
    { variant: 4, title: "Ko'k, ko'k, yashil naqsh", hint: "3 katakli bo'lak 2 marta aylanadi", difficulty: "O'rta" },
    { variant: 5, title: "To'rt rangli naqsh", hint: "4 x 2 = 8 katak (to'rtta turli rang)", difficulty: "O'rta" },
    { variant: 6, title: "Sariq + Yashil uzun zanjir", hint: "5 x 2 = 10 katak takror", difficulty: "O'rta" },
    { variant: 7, title: "Bitta ko'k katak 7 marta", hint: "Bir xil rangli uzun zanjir yasash", difficulty: "Oson" },
    { variant: 8, title: "Binafsha, binafsha, sariq", hint: "3 x 3 = 9 katak", difficulty: "Qiyin" },
    { variant: 9, title: "To'rt katakli naqsh", hint: "3 x 4 = 12 katakli uzun naqsh", difficulty: "Qiyin" },
  ],
  "condition-branch": [
    { variant: 0, title: "Agar to'siq bo'lsa signal ber", hint: "Faqat to'siq bor holatda signal chalish (if)", difficulty: "Oson" },
    { variant: 1, title: "Agar quvvat < 20 tejashni yoq", hint: "Telefon quvvati chegarasini tekshirish", difficulty: "Oson" },
    { variant: 2, title: "Agar yosh >= 18 ruxsat ber", hint: "Yosh chegarasi tekshiruvi (if)", difficulty: "Oson" },
    { variant: 3, title: "Agar harorat > 30 sovutgich", hint: "Harorat ko'tarilganda ishga tushirish", difficulty: "Oson" },
    { variant: 4, title: "Ball >= 60 o'tdi / yiqildi", hint: "Ikki tarmoqli shart (if / else)", difficulty: "O'rta" },
    { variant: 5, title: "Parol to'g'ri / xato", hint: "Parolni solishtirish tarmoqlanishi", difficulty: "O'rta" },
    { variant: 6, title: "Chipta bor / xarid qil", hint: "Chipta holatiga qarab amal bajarish", difficulty: "O'rta" },
    { variant: 7, title: "Svetofor yashil / to'xta", hint: "Rang bo'yicha harakatlanish", difficulty: "Oson" },
    { variant: 8, title: "Son > 0 musbat / emas", hint: "Musbat yoki manfiy sonni aniqlash", difficulty: "O'rta" },
    { variant: 9, title: "Balans >= narx xarid / yetarli emas", hint: "Mablag' yetarliligini tekshirish", difficulty: "Qiyin" },
  ],
  "variable-trace": [
    { variant: 0, title: "O'zgaruvchi qiymatini hisoblash", hint: "a = 3, b = 5, a = a + b", difficulty: "Oson" },
    { variant: 1, title: "Nusxa olish va kamaytirish", hint: "a = 7, b = 2, b = a, a = a - 4", difficulty: "Oson" },
    { variant: 2, title: "Hisoblagichni oshirish", hint: "son = 1, son = son * 2, son = son * 2", difficulty: "Oson" },
    { variant: 3, title: "O'zgaruvchilar qiymatini almashtirish", hint: "Vaqtinchalik o'zgaruvchi orqali almashtirish", difficulty: "O'rta" },
    { variant: 4, title: "Ketma-ket ayirish amallari", hint: "ball = 20, jarima = 3, ball = ball - jarima", difficulty: "O'rta" },
    { variant: 5, title: "Mustaqil nusxalar", hint: "x = 6, y = x, x = x * 2, y = y + 1", difficulty: "O'rta" },
    { variant: 6, title: "Uch o'zgaruvchi izi", hint: "a = 10, b = 20, c = a + b, a = c - 5", difficulty: "Qiyin" },
    { variant: 7, title: "Ko'p qadamli hisob-kitob", hint: "natija = 5, natija = natija * 3 - 2", difficulty: "Qiyin" },
  ],
  "function-factory": [
    { variant: 0, title: "Chizish funksiyasi — chiz(uzunlik, rang)", hint: "Bitta funksiyani 3 xil argument bilan chaqirish", difficulty: "Oson" },
    { variant: 1, title: "Ustun yasash — ustun(balandlik, rang)", hint: "Balandlik va rang argumentlari", difficulty: "Oson" },
    { variant: 2, title: "Chizgi chizish — chizgi(qadam, rang)", hint: "Bir xil uzunlik, turli ranglar", difficulty: "Oson" },
    { variant: 3, title: "Bir xil natija — chiziq(soni, rang)", hint: "Bir xil argumentlar bir xil natija beradi", difficulty: "O'rta" },
    { variant: 4, title: "O'suvchi bloklar — bloklar(nechta, rang)", hint: "Uzunliklar ortib borishi", difficulty: "O'rta" },
    { variant: 5, title: "Zina yasash — zina(balandlik, rang)", hint: "Bosqichma-bosqich oshirish", difficulty: "O'rta" },
    { variant: 6, title: "Rangli ustunlar — ustunlar(uzunlik, rang)", hint: "Turli parametrlar kombinatsiyasi", difficulty: "Qiyin" },
    { variant: 7, title: "Shakllar majmuasi — shakl(hajm, rang)", hint: "Murakkabroq argumentlar tartibi", difficulty: "Qiyin" },
  ],
  "shape-color": [
    { variant: 0, title: "Qizil doira va ko'k kvadrat", hint: "Rang va shakl parametrlarini to'g'ri berish", difficulty: "Oson" },
    { variant: 1, title: "Yashil uchburchak va sariq doira", hint: "Shakllarni bo'yash", difficulty: "Oson" },
    { variant: 2, title: "Binafsha kvadrat va qizil uchburchak", hint: "Geometrik shakl buyruqlari", difficulty: "Oson" },
    { variant: 3, title: "Ko'k doira va yashil kvadrat", hint: "Mos ranglarni tanlash", difficulty: "O'rta" },
    { variant: 4, title: "Sariq uchburchak va binafsha doira", hint: "Shakllarni to'g'ri tartiblash", difficulty: "O'rta" },
    { variant: 5, title: "Qizil kvadrat va ko'k uchburchak", hint: "Ranglar kombinatsiyasi", difficulty: "O'rta" },
    { variant: 6, title: "Yashil doira va sariq kvadrat", hint: "Shakl parametrlari", difficulty: "Qiyin" },
    { variant: 7, title: "Binafsha uchburchak va qizil doira", hint: "Yakuniy shakllar majmuasi", difficulty: "Qiyin" },
  ],
  "debug-extra": [
    { variant: 0, title: "Ortiqcha qadamni topish (Choy tayyorlash)", hint: "Algoritmdagi xato yoki keraksiz buyruqni o'chirish", difficulty: "Oson" },
    { variant: 1, title: "Sikldagi xato buyruqni tuzatish", hint: "Keraksiz qaytarilayotgan qatorni topish", difficulty: "Oson" },
    { variant: 2, title: "Shartdagi ortiqcha amal", hint: "Bajarilmasligi kerak bo'lgan buyruq", difficulty: "O'rta" },
    { variant: 3, title: "Hisoblashdagi ortiqcha qator", hint: "Natijani buzayotgan ifodani aniqlash", difficulty: "O'rta" },
    { variant: 4, title: "Robot marshrutidagi adashgan buyruq", hint: "Nishondan chetga eltuvchi qadam", difficulty: "O'rta" },
    { variant: 5, title: "O'zgaruvchini keraksiz o'zgartirish", hint: "Eski qiymatni buzuvchi amal", difficulty: "O'rta" },
    { variant: 6, title: "Chizishdagi ortiqcha chiziq", hint: "Shaklni xunuklashtirgan buyruq", difficulty: "Qiyin" },
    { variant: 7, title: "Funksiya ichidagi noto'g'ri qaytarish", hint: "Kutilmagan natija sababchisi", difficulty: "Qiyin" },
  ],
  "algo-race": [
    { variant: 0, title: "Chiziqli qidiruv vs Ikkilik (Binary) qidiruv", hint: "Tartiblangan ro'yxatda ikkilik qidiruvning ustunligi", difficulty: "Oson" },
    { variant: 1, title: "Pufakchali saralash vs Tezkor (Quick) saralash", hint: "Katta ma'lumotlarda tezlik farqi", difficulty: "O'rta" },
    { variant: 2, title: "To'g'ridan-to'g'ri hisoblash vs Rekursiya", hint: "Xotira va vaqt sarfi taqqosi", difficulty: "O'rta" },
    { variant: 3, title: "Oddiy takrorlash vs Matematik formula", hint: "O(1) vs O(N) algoritmlar", difficulty: "O'rta" },
    { variant: 4, title: "Ro'yxatdan qidirish vs Lug'at (Hash Map)", hint: "Kalit bo'yicha darhol topish", difficulty: "Qiyin" },
    { variant: 5, title: "Ketma-ket yuklash vs Parallel yuklash", hint: "Vaqtni tejash strategiyalari", difficulty: "Qiyin" },
  ],
};

export function getGamePuzzles(gameId: string | undefined): GamePuzzleInfo[] {
  if (!gameId) return [];
  return GAME_PUZZLES[gameId] ?? [];
}
