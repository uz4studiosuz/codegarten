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
      slots: 5,
      hint: "Robotni burilishlar va oldinga qadamlar orqali yulduzga olib boring.",
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
    gameName: "Sikl va takrorlash",
    description: "Naqshni sikl tanasi va takror soni bilan qayta tuzish.",
    fields: [
      HINT_FIELD,
      {
        key: "target",
        kind: "colorStrip",
        label: "Hosil qilinadigan naqsh",
        hint: "O'quvchi shu zanjirni sikl bilan takrorlab chiqarishi kerak. Takrorlanadigan bo'lak aniq ko'rinsin.",
        max: 16,
        required: true,
      },
      {
        key: "palette",
        kind: "colorSet",
        label: "Beriladigan ranglar",
        hint: "Naqshdagi ranglar avtomatik qo'shiladi. Ortiqcha rang qo'shsangiz vazifa qiyinlashadi.",
        min: 2,
      },
      WHY_FIELD,
    ],
    sample: {
      hint: "Naqshni kuzatib, takrorlanadigan eng qisqa bo'lakni sikl ichiga joylang.",
      target: ["yashil", "binafsha", "yashil", "binafsha", "yashil", "binafsha"],
      palette: ["yashil", "binafsha", "sariq"],
      why: "Takrorlanadigan bo'lak — yashil + binafsha. 6 katak = 3 x 2 katak.",
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
    description: "Bitta funksiyani turli argumentlar bilan chaqirish.",
    fields: [
      {
        key: "fnName",
        kind: "text",
        label: "Funksiya nomi",
        placeholder: "chiz",
        required: true,
      },
      {
        key: "params",
        kind: "strings",
        label: "Parametr nomlari",
        hint: "Aynan 2 ta: birinchisi son, ikkinchisi rang.",
        itemLabel: "parametr",
        placeholder: "uzunlik",
        min: 2,
        required: true,
      },
      HINT_FIELD,
      {
        key: "lengths",
        kind: "numbers",
        label: "Beriladigan sonlar",
        hint: "Argument sifatida tashlanadigan son bloklari.",
        min: 1,
        max: 12,
        required: true,
      },
      {
        key: "palette",
        kind: "colorSet",
        label: "Beriladigan ranglar",
        hint: "Nishondagi ranglar avtomatik qo'shiladi.",
        min: 2,
      },
      {
        key: "targets",
        kind: "rows",
        label: "Chaqiruvlar (nishon)",
        hint: "Har qator — bitta chaqiruv va uning kutilgan natijasi.",
        itemLabel: "chaqiruv",
        min: 2,
        max: 4,
        required: true,
        fields: [
          {
            key: "length",
            kind: "number",
            label: "Son argumenti",
            min: 1,
            max: 12,
            required: true,
          },
          {
            key: "colour",
            kind: "select",
            label: "Rang argumenti",
            options: COLOUR_OPTIONS,
            required: true,
          },
        ],
      },
      WHY_FIELD,
    ],
    sample: {
      fnName: "chiz",
      params: ["uzunlik", "rang"],
      hint: "Funksiya tanasi tayyor — sizga faqat argumentlarni joylash qoldi.",
      lengths: [1, 2, 3, 4, 5],
      palette: ["yashil", "binafsha", "sariq"],
      targets: [
        { length: 2, colour: "yashil" },
        { length: 5, colour: "binafsha" },
        { length: 3, colour: "sariq" },
      ],
      why: "Bitta funksiya uch xil natija berdi — farq faqat argumentlarda.",
    },
  },

  "shape-color": {
    gameId: "shape-color",
    gameName: "Shakl va rang",
    description: "Uch chaqiruvning rang argumentini to'ldirib rasmni takrorlash.",
    fields: [
      HINT_FIELD,
      {
        key: "target",
        kind: "colorMap",
        label: "Nishon rasm",
        hint: "Har shakl qaysi rangda bo'lishi kerak.",
        slots: [
          { key: "doira", label: "doira" },
          { key: "olti_burchak", label: "olti burchak" },
          { key: "uchburchak", label: "uchburchak" },
        ],
        required: true,
      },
      {
        key: "choices",
        kind: "colorSet",
        label: "Beriladigan ranglar",
        hint: "Nishondagi ranglar avtomatik qo'shiladi. Ortiqcha rang qo'shsangiz qiyinlashadi.",
        min: 2,
      },
      WHY_FIELD,
    ],
    sample: {
      hint: "Har shaklga o'z rangi kerak. Qaysi qator qaysi shaklni chizishiga qarang.",
      target: { doira: "kok", olti_burchak: "sariq", uchburchak: "yashil" },
      choices: ["sariq", "kok", "yashil", "qizil"],
      why: "Har chaqiruv o'zining argumentini oldi — bitta funksiya uch xil qatlam chizdi.",
    },
  },

  "variable-trace": {
    gameId: "variable-trace",
    gameName: "O'zgaruvchi kuzatuvi",
    description: "Dasturni o'qib, qutilarning oxirgi qiymatini aytish.",
    fields: [
      HINT_FIELD,
      {
        key: "vars",
        kind: "strings",
        label: "O'zgaruvchilar",
        hint: "Qutilar nomi. Dastur faqat shu nomlardan foydalanadi.",
        itemLabel: "o'zgaruvchi",
        placeholder: "a",
        min: 1,
        required: true,
      },
      {
        key: "program",
        kind: "rows",
        label: "Dastur qatorlari",
        hint: "Yuqoridan pastga bajariladi. Javob o'yin tomonidan hisoblanadi.",
        itemLabel: "qator",
        min: 2,
        required: true,
        fields: [
          {
            key: "target",
            kind: "factRef",
            label: "Qaysi quti",
            of: "vars",
            required: true,
          },
          {
            key: "kind",
            kind: "select",
            label: "Amal",
            options: [
              { value: "set", label: "= son (yangi qiymat)" },
              { value: "copy", label: "= boshqa quti (nusxa)" },
              { value: "add", label: "+= qo'shish" },
              { value: "sub", label: "-= ayirish" },
              { value: "mul", label: "*= ko'paytirish" },
            ],
            required: true,
          },
          {
            key: "value",
            kind: "text",
            label: "Qiymat",
            hint: "Son yozing, yoki boshqa quti nomini.",
            placeholder: "5",
            required: true,
          },
        ],
      },
      WHY_FIELD,
    ],
    sample: {
      hint: "Har qatorni yuqoridan pastga bajarib, qutilar ichidagi qiymatni kuzatib boring.",
      vars: ["a", "b"],
      program: [
        { target: "a", kind: "set", value: 3 },
        { target: "b", kind: "set", value: 5 },
        { target: "a", kind: "add", value: "b" },
        { target: "b", kind: "add", value: 2 },
      ],
      why: "a = a + b bajarilganda b ning o'sha paytdagi qiymati qo'shildi. Keyin b o'zgargani a ga ta'sir qilmaydi.",
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
    description: "Dasturdagi bitta buzuq qatorni belgilash.",
    fields: [
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
        hint: "Bittasi buzuq bo'lsin. Bo'sh joy bilan ichkarilashni saqlaymiz.",
        itemLabel: "qator",
        placeholder: "oldinga()",
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
      WHY_FIELD,
    ],
    sample: {
      goal: "Robot 3 katak oldinga yurishi kerak edi. Buyruqlar ichida ortiqcha qadam bor.",
      hint: "Har bir qatorni maqsad bilan solishtirib o'qing.",
      lines: ["oldinga()", "oldinga()", "o'ngga_burl()", "oldinga()"],
      badIndex: 2,
      why: "Burilish robotni yo'nalishdan chiqaradi — 3 marta oldinga yurish uchun faqat oldinga() kerak.",
    },
  },
};

export function configSchemaFor(gameId: string | undefined): GameConfigSchema | undefined {
  if (!gameId) return undefined;
  return GAME_CONFIG_SCHEMAS[gameId];
}

/** Colour keys the writer offers, so its swatches match the games'. */
export const CONFIG_PALETTE_KEYS: readonly PaletteKey[] = PALETTE_KEYS;
