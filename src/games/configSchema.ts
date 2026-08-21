/**
 * What the writer's game forms are built from
 * ==========================================
 * An author configuring a game should be filling in fields, not writing JSON by
 * hand — a misplaced comma silently fell back to the built-in puzzle, which is
 * exactly the "I changed it and nothing happened" the raw textarea produced.
 *
 * Each game describes its own config as a list of fields here. The writer renders
 * that list (src/components/writer/GameConfigForm.tsx) and the game reads the
 * resulting object back through its own `fromConfig` (src/games/config.ts).
 * Adding a field means touching this file and that game's `fromConfig`; the form
 * needs no changes.
 *
 * Deliberately free of React and of any game component, so the writer can import
 * it without dragging nine games into its bundle.
 */

import { PALETTE_KEYS, type PaletteKey } from "./config";

/* ─────────────────────────────── fields ─────────────────────────────── */

interface FieldBase {
  /** Key in the config object. */
  key: string;
  label: string;
  /** One line telling the author what this does to the puzzle. */
  hint?: string;
  /** A puzzle missing this cannot be played, so the form flags it. */
  required?: boolean;
}

export type ConfigField =
  | (FieldBase & { kind: "text"; placeholder?: string })
  | (FieldBase & { kind: "textarea"; placeholder?: string; rows?: number })
  | (FieldBase & { kind: "number"; min?: number; max?: number; unit?: string })
  | (FieldBase & { kind: "select"; options: { value: string; label: string }[] })
  /** Ordered list of single-line strings, with add / remove / reorder. */
  | (FieldBase & { kind: "strings"; placeholder?: string; itemLabel?: string; min?: number })
  /** Ordered list of numbers — the values offered as blocks. */
  | (FieldBase & { kind: "numbers"; min?: number; max?: number })
  /** Ordered colour strip: the same colour may appear many times. */
  | (FieldBase & { kind: "colorStrip"; max?: number })
  /** Which colours are offered as blocks. Order is the palette order. */
  | (FieldBase & { kind: "colorSet"; min?: number })
  | (FieldBase & { kind: "point"; maxKey: string })
  /** A fixed set of named slots, each taking one colour. */
  | (FieldBase & { kind: "colorMap"; slots: { key: string; label: string }[] })
  /** Rows of an object list; each row is the sub-fields below. */
  | (FieldBase & {
      kind: "rows";
      itemLabel: string;
      fields: ConfigField[];
      min?: number;
      max?: number;
    })
  /**
   * Picks one entry of a sibling list by index — "which line is broken", "which
   * action this case must produce". `of` is the key of that list.
   */
  | (FieldBase & { kind: "indexOf"; of: string; allowNone?: boolean; noneLabel?: string })
  /**
   * Picks one of the fact names declared elsewhere in this config. Keeps a
   * condition from naming a fact no situation supplies.
   */
  | (FieldBase & { kind: "factRef"; of: string })
  /** A value per declared fact — one situation the rule has to handle. */
  | (FieldBase & { kind: "factValues"; of: string })
  /** Comparison / and / or, built from the declared facts. */
  | (FieldBase & { kind: "predicate"; of: string });

export interface GameConfigSchema {
  gameId: string;
  gameName: string;
  /** What the author is configuring, in one line. */
  description: string;
  fields: ConfigField[];
  /** Loaded by "Namuna to'ldirish" — a complete, playable puzzle. */
  sample: Record<string, any>;
}

/* ───────────────────────── shared field pieces ───────────────────────── */

const HINT_FIELD: ConfigField = {
  key: "hint",
  kind: "textarea",
  label: "Yo'l-yo'riq",
  hint: "O'quvchi taxtaning tepasida ko'radigan ko'rsatma.",
  rows: 2,
  required: true,
};

const WHY_FIELD: ConfigField = {
  key: "why",
  kind: "textarea",
  label: "Izoh (to'g'ri javobdan keyin)",
  hint: "Nima uchun shunday bo'lgani. Faqat to'g'ri yechgandan keyin ko'rinadi.",
  rows: 3,
};

const COLOUR_OPTIONS = PALETTE_KEYS.map((key) => ({ value: key, label: key }));

/* ──────────────────────────── the nine games ──────────────────────────── */

export const GAME_CONFIG_SCHEMAS: Record<string, GameConfigSchema> = {
  "robot-grid": {
    gameId: "robot-grid",
    gameName: "Robot marshruti",
    description: "Robotni maydon bo'ylab nishonga olib boradigan dastura tuzish.",
    fields: [
      {
        key: "grid",
        kind: "number",
        label: "Maydon o'lchami",
        hint: "Tomoni nechta katak. 3 dan 8 gacha.",
        min: 3,
        max: 8,
        unit: "katak",
        required: true,
      },
      {
        key: "start",
        kind: "point",
        label: "Robot boshlanadigan katak",
        maxKey: "grid",
        required: true,
      },
      {
        key: "facing",
        kind: "select",
        label: "Boshlang'ich yo'nalish",
        options: [
          { value: "right", label: "o'ngga" },
          { value: "down", label: "pastga" },
          { value: "left", label: "chapga" },
          { value: "up", label: "tepaga" },
        ],
        required: true,
      },
      { key: "target", kind: "point", label: "Nishon (yulduz) katagi", maxKey: "grid", required: true },
      {
        key: "obstacles",
        kind: "rows",
        label: "Devorlar",
        hint: "Robot kirolmaydigan kataklar. Devorga urilsa dastur to'xtaydi.",
        itemLabel: "devor",
        fields: [{ key: "cell", kind: "point", label: "Katak", maxKey: "grid" }],
      },
      {
        key: "slots",
        kind: "number",
        label: "Dastur uzunligi",
        hint: "Nechta buyruq sig'adi. Yechim shuncha buyruqqa sig'ishi kerak.",
        min: 2,
        max: 12,
        unit: "buyruq",
        required: true,
      },
      HINT_FIELD,
    ],
    sample: {
      grid: 5,
      start: { x: 0, y: 0 },
      facing: "right",
      target: { x: 3, y: 4 },
      slots: 8,
      obstacles: [{ cell: { x: 2, y: 0 } }],
      hint: "Oldinda devor bor. Robotni uni chetlab o'tib yulduzga olib boring.",
    },
  },

  "sequence-order": {
    gameId: "sequence-order",
    gameName: "Ketma-ketlik",
    description: "Qadamlarni to'g'ri tartibda joylashtirish.",
    fields: [
      {
        key: "task",
        kind: "textarea",
        label: "Topshiriq",
        hint: "Nimani tartibga solish kerakligi.",
        rows: 2,
        required: true,
      },
      HINT_FIELD,
      {
        key: "steps",
        kind: "strings",
        label: "Qadamlar — TO'G'RI tartibda",
        hint: "Shu tartib javob hisoblanadi. O'yin o'quvchiga aralashtirib beradi.",
        itemLabel: "qadam",
        placeholder: "suvni qaynat",
        min: 3,
        required: true,
      },
    ],
    sample: {
      task: "Choy damlash algoritmini to'g'ri tartibda tuzing.",
      hint: "Kompyuter yozilgan tartibda bajaradi.",
      steps: [
        "choynakni yuv",
        "suvni qaynat",
        "choy solib qaynoq suv quy",
        "5 daqiqa kutib tur",
        "piyolaga quy",
      ],
    },
  },

  "loop-repeat": {
    gameId: "loop-repeat",
    gameName: "Sikl va hisoblagich",
    description:
      "Sikl tanasini va chegarasini tuzish. Hisoblagich ko'rinib turadi va natijaga qatnashadi.",
    fields: [
      {
        key: "kind",
        kind: "select",
        label: "Sikl turi",
        hint: "Sanoqli — o'quvchi chegarani tanlaydi. toki — tana tayyor, o'quvchi to'xtash shartini tanlaydi.",
        options: [
          { value: "count", label: "sanoqli (har i uchun 1 dan N gacha)" },
          { value: "while", label: "toki <shart>:" },
        ],
        required: true,
      },
      HINT_FIELD,
      {
        key: "counter",
        kind: "text",
        label: "Hisoblagich nomi",
        hint: "Kodda qanday ko'rinishi.",
        placeholder: "i",
      },
      {
        key: "target",
        kind: "colorStrip",
        label: "Hosil qilinadigan zanjir",
        hint: "Bir qatorli naqsh uchun. Zinapoya kerak bo'lsa buni bo'sh qoldirib, pastdagi qatorlarni to'ldiring.",
        max: 16,
      },
      {
        key: "rows",
        kind: "rows",
        label: "Qatorlar (zinapoya uchun)",
        hint: "Har aylanish o'z qatorini chizadi. Uzunligi har xil bo'lsa, hisoblagichsiz yechish mumkin emas.",
        itemLabel: "qator",
        fields: [
          {
            key: "cells",
            kind: "colorStrip",
            label: "Shu aylanish chizadigan kataklar",
            max: 12,
            required: true,
          },
        ],
      },
      {
        key: "palette",
        kind: "colorSet",
        label: "Beriladigan ranglar",
        hint: "Bir katakli chiz(rang) bloklari. Nishondagi ranglar avtomatik qo'shiladi.",
      },
      {
        key: "blocks",
        kind: "strings",
        label: "Tana bloklari",
        hint: "Psevdokod: chiz(yashil), chiz_chiziq(i), chiz_chiziq(i * 2), rangla(kok).",
        itemLabel: "blok",
        placeholder: "chiz_chiziq(i)",
      },
      {
        key: "bodyMax",
        kind: "number",
        label: "Tanadagi qatorlar soni",
        min: 1,
        max: 4,
        unit: "qator",
      },
      {
        key: "pen",
        kind: "select",
        label: "Qalamning boshlang'ich rangi",
        hint: "chiz_chiziq shu rangda chizadi, rangla uni o'zgartiradi.",
        options: COLOUR_OPTIONS,
      },
      {
        key: "body",
        kind: "strings",
        label: "Tayyor tana (faqat toki uchun)",
        hint: "toki siklida tana beriladi — o'quvchi faqat to'xtash shartini tanlaydi.",
        itemLabel: "qator",
        placeholder: "chiz_chiziq(i)",
      },
      {
        key: "conditions",
        kind: "strings",
        label: "To'xtash shartlari (faqat toki uchun)",
        hint: "Masalan: i <= 4. Kamida 2 ta. Bittasi to'g'ri, qolganlari chalg'ituvchi — biri hech qachon to'xtamasa yaxshi.",
        itemLabel: "shart",
        placeholder: "i <= 4",
        min: 2,
      },
      {
        key: "start",
        kind: "number",
        label: "Hisoblagich qaydan boshlanadi",
        min: -99,
        max: 99,
      },
      {
        key: "step",
        kind: "number",
        label: "Har aylanishda qancha o'zgaradi",
        hint: "Manfiy son teskari sanoq beradi. Nol qabul qilinmaydi.",
        min: -9,
        max: 9,
      },
      WHY_FIELD,
    ],
    sample: {
      kind: "count",
      counter: "i",
      hint: "Har qator boshqa uzunlikda. Aniq son yozilsa, hamma qator bir xil chiqadi — hisoblagichni ishlating.",
      rows: [
        { cells: ["kok"] },
        { cells: ["kok", "kok"] },
        { cells: ["kok", "kok", "kok"] },
        { cells: ["kok", "kok", "kok", "kok"] },
      ],
      blocks: ["chiz_chiziq(i)", "chiz_chiziq(2)", "chiz_chiziq(i + 1)"],
      bodyMax: 1,
      pen: "kok",
      why:
        "chiz_chiziq(i) har aylanishda boshqa uzunlik berdi, chunki i o'zgarib bordi. Aniq son yozilganda hamma qator bir xil chiqardi.",
    },
  },

  "condition-branch": {
    gameId: "condition-branch",
    gameName: "Shart va tarmoqlanish",
    description: "Bir qoida tuzib, uni bir nechta holatda sinab ko'rish.",
    fields: [
      {
        key: "mode",
        kind: "select",
        label: "Qoida turi",
        hint: "Avval faqat `agar` o'rgatilsa tushunarli bo'ladi. `aks holda` keyingi darsga.",
        options: [
          { value: "if", label: "faqat agar (aks holda yo'q)" },
          { value: "if-else", label: "agar ... aks holda ..." },
        ],
        required: true,
      },
      {
        key: "scenario",
        kind: "textarea",
        label: "Vaziyat",
        hint: "Qoida nimani hal qilishi kerakligi.",
        rows: 3,
        required: true,
      },
      HINT_FIELD,
      {
        key: "facts",
        kind: "strings",
        label: "Ma'lumot nomlari",
        hint: "Qoida nimaga qaraydi — masalan quvvat, tanga. Shartlar va holatlar shu nomlardan foydalanadi.",
        itemLabel: "nom",
        placeholder: "quvvat",
        min: 1,
        required: true,
      },
      {
        key: "conditions",
        kind: "rows",
        label: "Shart variantlari",
        hint: "O'quvchi shulardan bittasini tanlaydi. Bittasi to'g'ri, qolganlari chalg'ituvchi.",
        itemLabel: "shart",
        min: 2,
        required: true,
        fields: [
          {
            key: "label",
            kind: "text",
            label: "Ko'rinishi",
            hint: "Blokda qanday yozilishi. Masalan: quvvat < 20",
            placeholder: "quvvat < 20",
            required: true,
          },
          { key: "predicate", kind: "predicate", label: "Ma'nosi", of: "facts", required: true },
        ],
      },
      {
        key: "actions",
        kind: "strings",
        label: "Amal variantlari",
        hint: "Qoida bajarishi mumkin bo'lgan amallar.",
        itemLabel: "amal",
        placeholder: "zaryad_ol()",
        min: 2,
        required: true,
      },
      {
        key: "cases",
        kind: "rows",
        label: "Sinov holatlari",
        hint: "Qoida har bir holatda to'g'ri ishlashi kerak. Kamida 3 holat bo'lsa qoida chindan sinaladi.",
        itemLabel: "holat",
        min: 2,
        required: true,
        fields: [
          {
            key: "label",
            kind: "text",
            label: "Holat ta'rifi",
            placeholder: "Quvvat 12% qolgan",
            required: true,
          },
          { key: "values", kind: "factValues", label: "Ma'lumot qiymatlari", of: "facts", required: true },
          {
            key: "expected",
            kind: "indexOf",
            label: "Kutilgan natija",
            of: "actions",
            allowNone: true,
            noneLabel: "hech narsa qilmaydi",
            required: true,
          },
        ],
      },
      WHY_FIELD,
    ],
    sample: {
      mode: "if",
      scenario:
        "Robot ishlab turibdi. Faqat quvvat 20% dan kam bo'lsa zaryadga qaytishi kerak — boshqa hollarda hech narsa qilmaydi.",
      hint: "Bu yerda bitta tarmoq bor: shart bajarilsa — amal, bajarilmasa — hech narsa.",
      facts: ["quvvat"],
      conditions: [
        { label: "quvvat < 20", predicate: { op: "<", fact: "quvvat", value: 20 } },
        { label: "quvvat > 20", predicate: { op: ">", fact: "quvvat", value: 20 } },
        { label: "quvvat == 20", predicate: { op: "==", fact: "quvvat", value: 20 } },
      ],
      actions: ["zaryadga_qayt()", "ishni_davom_et()"],
      cases: [
        { label: "Quvvat 12% qolgan", values: { quvvat: 12 }, expected: 0 },
        { label: "Quvvat 80% — to'la", values: { quvvat: 80 }, expected: -1 },
        { label: "Quvvat 5% — juda kam", values: { quvvat: 5 }, expected: 0 },
      ],
      why: "Bitta `agar` qoidasi uch holatni ham to'g'ri hal qildi. Shart yolg'on bo'lsa, `agar` shunchaki hech narsa qilmaydi.",
    },
  },

  "function-factory": {
    gameId: "function-factory",
    gameName: "Funksiya zavodi",
    description:
      "O'quvchi funksiya tanasini o'zi yig'adi, keyin bitta tana barcha chaqiruvlarda sinaladi.",
    fields: [
      { key: "fnName", kind: "text", label: "Funksiya nomi", placeholder: "chiz", required: true },
      {
        key: "params",
        kind: "rows",
        label: "Parametrlar",
        hint: "Imzoda ko'rinadigan tartibda. Chaqiruv argumentlari ham shu tartibda beriladi.",
        itemLabel: "parametr",
        min: 1,
        max: 2,
        required: true,
        fields: [
          { key: "name", kind: "text", label: "Nomi", placeholder: "uzunlik", required: true },
          {
            key: "type",
            kind: "select",
            label: "Turi",
            options: [
              { value: "number", label: "son" },
              { value: "colour", label: "rang" },
            ],
            required: true,
          },
        ],
      },
      {
        key: "mode",
        kind: "select",
        label: "Natija turi",
        hint: "Rasm — tana chiziq chizadi. Son — tana qiymat hisoblab, return bilan qaytaradi.",
        options: [
          { value: "strip", label: "rasm (chiziq chizadi)" },
          { value: "value", label: "son (return qaytaradi)" },
        ],
        required: true,
      },
      {
        key: "pen",
        kind: "select",
        label: "Qalamning boshlang'ich rangi",
        hint: "Faqat rasm rejimida. Bir qatorli tana ham chizishi uchun kerak.",
        options: COLOUR_OPTIONS,
      },
      {
        key: "bodySlots",
        kind: "number",
        label: "Tanadagi qatorlar soni",
        hint: "1 dan 3 gacha. Har qator to'ldirilishi shart.",
        min: 1,
        max: 3,
        unit: "qator",
        required: true,
      },
      {
        key: "blocks",
        kind: "rows",
        label: "Beriladigan bloklar",
        hint: "Kamida 2 ta. Bittasi to'g'ri yechim, qolganlari chalg'ituvchi — masalan aniq son yozilgani.",
        itemLabel: "blok",
        min: 2,
        required: true,
        fields: [
          {
            key: "op",
            kind: "select",
            label: "Amal",
            options: [
              { value: "draw", label: "katak_chiz(...)" },
              { value: "paint", label: "rangla(...)" },
              { value: "assign", label: "natija = ..." },
              { value: "return", label: "return ..." },
            ],
            required: true,
          },
          {
            key: "arg",
            kind: "text",
            label: "Argument",
            hint: "Parametr nomi, son, rang nomi, `natija`, yoki ikkisi + - * bilan: uzunlik * 2",
            placeholder: "uzunlik",
            required: true,
          },
        ],
      },
      {
        key: "calls",
        kind: "rows",
        label: "Chaqiruvlar",
        hint: "Kamida 2 ta — bitta chaqiruv funksiya haqida hech narsa isbotlamaydi. Eng ko'pi 3 ta ko'rsatiladi.",
        itemLabel: "chaqiruv",
        min: 2,
        max: 3,
        required: true,
        fields: [
          {
            key: "args",
            kind: "strings",
            label: "Argumentlar",
            hint: "Parametrlar tartibida. Rang parametriga rang nomini yozing: yashil, kok, sariq...",
            itemLabel: "argument",
            placeholder: "3",
            min: 1,
            required: true,
          },
          {
            key: "length",
            kind: "number",
            label: "Kutilgan uzunlik",
            hint: "Faqat rasm rejimida: nechta katak chizilishi kerak.",
            min: 1,
            max: 14,
            unit: "katak",
          },
          {
            key: "colour",
            kind: "select",
            label: "Kutilgan rang",
            hint: "Faqat rasm rejimida.",
            options: COLOUR_OPTIONS,
          },
          {
            key: "value",
            kind: "number",
            label: "Kutilgan son",
            hint: "Faqat son rejimida: return nima qaytarishi kerak.",
          },
        ],
      },
      HINT_FIELD,
      WHY_FIELD,
    ],
    sample: {
      fnName: "chiz",
      params: [
        { name: "uzunlik", type: "number" },
        { name: "rang", type: "colour" },
      ],
      mode: "strip",
      pen: "yashil",
      bodySlots: 2,
      hint: "Ikki qator kerak. Qatorlar yuqoridan pastga bajariladi — tartib natijaga ta'sir qiladi.",
      blocks: [
        { op: "paint", arg: "rang" },
        { op: "draw", arg: "uzunlik" },
        { op: "draw", arg: "2" },
        { op: "paint", arg: "sariq" },
      ],
      calls: [
        { args: ["3", "binafsha"], length: 3, colour: "binafsha" },
        { args: ["2", "kok"], length: 2, colour: "kok" },
        { args: ["4", "sariq"], length: 4, colour: "sariq" },
      ],
      why:
        "Bitta tana ikkala parametrni ham ishlatdi: rang bo'yashga, uzunlik chizishga. Shuning uchun uchta chaqiruv uch xil natija berdi.",
    },
  },

  "variable-trace": {
    gameId: "variable-trace",
    gameName: "O'zgaruvchi kuzatuvi",
    description:
      "Dasturni o'qib, qutilarning oxirgi qiymatini aytish. Qutida son, matn yoki rost/yolg'on turishi mumkin.",
    fields: [
      HINT_FIELD,
      {
        key: "vars",
        kind: "strings",
        label: "Qutilar",
        hint: "Har qutiga dasturda kamida bir marta qiymat berilishi kerak, aks holda masala qabul qilinmaydi.",
        itemLabel: "quti",
        placeholder: "a",
        min: 1,
        required: true,
      },
      {
        key: "program",
        kind: "rows",
        label: "Dastur qatorlari",
        hint: "Yuqoridan pastga bajariladi. Javobni o'yin o'zi hisoblaydi.",
        itemLabel: "qator",
        min: 2,
        required: true,
        fields: [
          { key: "target", kind: "factRef", label: "Qaysi quti", of: "vars", required: true },
          {
            key: "kind",
            kind: "select",
            label: "Amal",
            options: [
              { value: "set", label: "= qiymat (yangi qiymat)" },
              { value: "copy", label: "= boshqa quti (nusxa)" },
              { value: "add", label: "+ qo'shish" },
              { value: "sub", label: "- ayirish" },
              { value: "mul", label: "* ko'paytirish" },
              { value: "join", label: "+ matn ulash" },
              { value: "not", label: "EMAS — teskarilash" },
              { value: ">", label: "> dan katta" },
              { value: ">=", label: ">= katta yoki teng" },
              { value: "<", label: "< dan kichik" },
              { value: "<=", label: "<= kichik yoki teng" },
              { value: "==", label: "== teng" },
              { value: "!=", label: "!= teng emas" },
            ],
            required: true,
          },
          {
            key: "value",
            kind: "text",
            label: "O'ng tomon",
            hint:
              "Son: 18. Matn: «Ali» — qo'shtirnoq bilan yoziladi. Rost/yolg'on: true yoki false. Quti nomi yozilsa — shu qutiga murojaat.",
            placeholder: "5",
            required: true,
          },
          {
            key: "left",
            kind: "text",
            label: "Chap tomon",
            hint: "Taqqoslashlarda majburiy: katta = yosh >= 18 uchun bu yerga yosh yoziladi. Qo'shish/ayirishda bo'sh qoldirilsa, o'sha qutining o'zi olinadi.",
            placeholder: "yosh",
          },
        ],
      },
      WHY_FIELD,
    ],
    sample: {
      hint: "Har qatorni yuqoridan pastga bajarib, qutilar ichidagi qiymatni kuzatib boring.",
      vars: ["yosh", "katta"],
      program: [
        { target: "yosh", kind: "set", value: 20 },
        { target: "katta", kind: ">=", left: "yosh", value: 18 },
        { target: "yosh", kind: "sub", value: 5 },
      ],
      why:
        "katta qiymati taqqoslash bajarilgan paytdagi yosh ga qarab hisoblandi. Keyin yosh kamaygani katta ga ta'sir qilmaydi.",
    },
  },

  "algo-race": {
    gameId: "algo-race",
    gameName: "Qadamlarni sanash",
    description: "Qidiruv strategiyasi nechta qadam bosishini oldindan aytish.",
    fields: [
      {
        key: "strategy",
        kind: "select",
        label: "Strategiya",
        options: [
          { value: "linear", label: "chiziqli qidiruv (birma-bir)" },
          { value: "binary", label: "binary search (o'rtadan)" },
        ],
        required: true,
      },
      {
        key: "items",
        kind: "numbers",
        label: "Ro'yxat",
        hint: "Binary search uchun o'sish tartibida bo'lishi shart.",
        required: true,
      },
      {
        key: "target",
        kind: "number",
        label: "Qidirilayotgan son",
        hint: "Ro'yxat ichida bo'lishi kerak.",
        required: true,
      },
      HINT_FIELD,
      WHY_FIELD,
    ],
    sample: {
      strategy: "binary",
      items: [3, 8, 12, 17, 21, 30, 41, 55],
      target: 21,
      hint: "Binary search har qadamda ro'yxatning o'rtasiga qaraydi va yarmini tashlab yuboradi.",
      why: "Har tekshiruv qolgan variantlarni yarmiga qisqartirdi: 8 → 4 → 2 → 1. Shuning uchun qadam soni O(log N).",
    },
  },

  "debug-extra": {
    gameId: "debug-extra",
    gameName: "Xatoni topish",
    description:
      "Dasturdagi buzuq qatorni belgilash — yoki uni belgilab, to'g'ri variant bilan almashtirish.",
    fields: [
      {
        key: "mode",
        kind: "select",
        label: "Rejim",
        hint: "Topish — faqat buzuq qatorni belgilash. Tuzatish — qatorni belgilab, o'rniga to'g'ri variantni tanlash.",
        options: [
          { value: "find", label: "topish (qatorni belgilash)" },
          { value: "fix", label: "tuzatish (qatorni almashtirish)" },
        ],
      },
      {
        key: "goal",
        kind: "textarea",
        label: "Dastur nima qilishi kerak edi",
        rows: 2,
        required: true,
      },
      HINT_FIELD,
      {
        key: "lines",
        kind: "strings",
        label: "Dastur qatorlari",
        hint: "Bittasi buzuq bo'lsin. Boshidagi bo'sh joy saqlanadi — chekinish blok tuzilishini bildiradi.",
        itemLabel: "qator",
        placeholder: "agar yosh > 18:",
        min: 2,
        required: true,
      },
      {
        key: "badIndex",
        kind: "indexOf",
        label: "Buzuq qator",
        of: "lines",
        required: true,
      },
      {
        key: "fixes",
        kind: "rows",
        label: "Almashtirish variantlari",
        hint: "Faqat tuzatish rejimida. Kamida 2 ta, kamida bittasi to'g'ri. Bir nechta to'g'ri variant bo'lishi mumkin — masalan >= 18 va > 17.",
        itemLabel: "variant",
        fields: [
          {
            key: "text",
            kind: "text",
            label: "Almashtiruvchi qator",
            hint: "Boshidagi bo'sh joy saqlanadi — chekinishni o'zgartirish ham xato turi.",
            placeholder: "agar yosh >= 18:",
            required: true,
          },
          {
            key: "ok",
            kind: "select",
            label: "Bu variant to'g'rimi",
            options: [
              { value: "true", label: "ha — dastur maqsadga erishadi" },
              { value: "false", label: "yo'q — chalg'ituvchi" },
            ],
            required: true,
          },
        ],
      },
      WHY_FIELD,
    ],
    sample: {
      mode: "fix",
      goal: "18 yoshdan katta yoki teng foydalanuvchiga ruxsat berilishi kerak edi.",
      hint: "Chegaradagi qiymatni — aynan 18 ni — tekshirib ko'ring.",
      lines: ["yosh = 18", "agar yosh > 18:", "  ruxsat_ber()", "aks holda:", "  rad_et()"],
      badIndex: 1,
      fixes: [
        { text: "agar yosh >= 18:", ok: "true" },
        { text: "agar yosh > 17:", ok: "true" },
        { text: "agar yosh == 18:", ok: "false" },
        { text: "agar yosh < 18:", ok: "false" },
      ],
      why:
        "«18 va undan katta» chegaraning o'zini ham qamraydi. > belgisi aynan 18 yoshni rad etardi.",
    },
  },
};

export function configSchemaFor(gameId: string | undefined): GameConfigSchema | undefined {
  if (!gameId) return undefined;
  return GAME_CONFIG_SCHEMAS[gameId];
}

/** Colour keys the writer offers, so its swatches match the games'. */
export const CONFIG_PALETTE_KEYS: readonly PaletteKey[] = PALETTE_KEYS;
