"use client";

import React, { useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconBraces,
  IconEraser,
  IconPlus,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";
import {
  OP_LABELS,
  PALETTE,
  PALETTE_KEYS,
  type ComparisonOp,
  type PaletteKey,
  type Predicate,
} from "@/games/config";
import {
  configSchemaFor,
  type ConfigField,
  type GameConfigSchema,
} from "@/games/configSchema";
import { AddButton, Field, Select, SubCard, TextArea, TextInput, inputClass } from "./fields";

/**
 * Authoring a game's own task
 * ===========================
 * Picking a puzzle from the game's pool covers the built-in curriculum, but an
 * author writing a lesson of their own needs to state the task themselves. That
 * used to be a raw JSON textarea, and it failed in the worst way available: a
 * typo parsed into something the game did not recognise, the game quietly fell
 * back to its built-in puzzle, and the author saw their edit do nothing at all.
 *
 * The form here is generated from the game's schema (src/games/configSchema.ts),
 * so the only values an author can produce are values the game reads back. The
 * JSON view is still one click away for anyone who wants it, but it is no longer
 * the way in.
 */

type Cfg = Record<string, any>;

interface Props {
  gameId: string | undefined;
  value: unknown;
  onChange: (config: Cfg | undefined) => void;
}

export function GameConfigForm({ gameId, value, onChange }: Props) {
  const schema = configSchemaFor(gameId);
  const [showJson, setShowJson] = useState(false);
  const [jsonDraft, setJsonDraft] = useState<string | null>(null);

  // A config that never parsed is kept as the author's raw text so their typing
  // is not thrown away; the form cannot show that, only the JSON view can.
  const rawText = typeof value === "string" ? value : null;
  const config: Cfg = value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Cfg) : {};
  const isOn = rawText !== null || Object.keys(config).length > 0;

  const set = (key: string, next: unknown) => {
    const merged = { ...config };
    if (next === undefined || next === "" || (Array.isArray(next) && next.length === 0)) {
      delete merged[key];
    } else {
      merged[key] = next;
    }
    onChange(Object.keys(merged).length > 0 ? merged : undefined);
  };

  if (!gameId) {
    return (
      <Note>
        Avval o&apos;yinni tanlang — shundan keyin o&apos;sha o&apos;yinning topshiriq
        sozlamalari shu yerda ochiladi.
      </Note>
    );
  }

  if (!schema) {
    return (
      <div className="flex flex-col gap-2">
        <Note>
          Bu o&apos;yin uchun forma hali yo&apos;q. Sozlamani JSON ko&apos;rinishida
          kiritishingiz mumkin.
        </Note>
        <JsonView
          value={value}
          draft={jsonDraft}
          setDraft={setJsonDraft}
          onChange={onChange}
        />
      </div>
    );
  }

  const missing = missingRequired(schema, config);

  return (
    <div className="flex flex-col gap-3">
      <header className="flex flex-col gap-2">
        <p className="text-[12px] text-gray-500 dark:text-zinc-400 leading-relaxed">
          {schema.description}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <ToolButton
            icon={<IconWand size={13} />}
            label={isOn ? "Namuna bilan almashtirish" : "Namuna to'ldirish"}
            onClick={() => {
              setJsonDraft(null);
              onChange(structuredClone(schema.sample));
            }}
          />
          {isOn && (
            <ToolButton
              icon={<IconEraser size={13} />}
              label="Tozalash"
              tone="danger"
              onClick={() => {
                setJsonDraft(null);
                onChange(undefined);
              }}
            />
          )}
          <ToolButton
            icon={<IconBraces size={13} />}
            label={showJson ? "Formaga qaytish" : "JSON ko'rinishi"}
            tone="quiet"
            onClick={() => {
              setJsonDraft(null);
              setShowJson((v) => !v);
            }}
          />
        </div>
      </header>

      {!isOn && (
        <Note>
          Sozlama bo&apos;sh — dars o&apos;yinning tayyor masalalaridan birini
          ko&apos;rsatadi. Bu yerni to&apos;ldirsangiz, o&apos;rniga sizning
          topshirig&apos;ingiz chiqadi.
        </Note>
      )}

      {rawText !== null && (
        <Warn>
          JSON o&apos;qilmadi, shuning uchun bu sozlama darsda ishlamaydi. JSON
          ko&apos;rinishini ochib qavs va vergullarni tekshiring, yoki
          &laquo;Tozalash&raquo;ni bosing.
        </Warn>
      )}

      {isOn && rawText === null && missing.length > 0 && (
        <Warn>
          To&apos;ldirilmagan majburiy maydon: <strong>{missing.join(", ")}</strong>.
          Shular to&apos;lmaguncha o&apos;yin tayyor masalaga qaytadi.
        </Warn>
      )}

      {showJson ? (
        <JsonView value={value} draft={jsonDraft} setDraft={setJsonDraft} onChange={onChange} />
      ) : rawText !== null ? null : (
        <div className="flex flex-col gap-3.5">
          {schema.fields.map((field) => (
            <FieldView
              key={field.key}
              field={field}
              value={config[field.key]}
              root={config}
              onChange={(next) => set(field.key, next)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── field dispatch ──────────────────────────── */

interface FieldViewProps {
  field: ConfigField;
  value: unknown;
  /** The whole config, so `indexOf` / `factRef` can read their sibling list. */
  root: Cfg;
  onChange: (next: unknown) => void;
}

function FieldView({ field, value, root, onChange }: FieldViewProps) {
  const label = field.required ? `${field.label} *` : field.label;

  switch (field.kind) {
    case "text":
      return (
        <Field label={label} hint={field.hint}>
          <TextInput
            value={asString(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "textarea":
      return (
        <Field label={label} hint={field.hint}>
          <TextArea
            rows={field.rows ?? 3}
            value={asString(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    case "number":
      return (
        <Field label={label} hint={field.hint}>
          <div className="flex items-center gap-2">
            <TextInput
              type="number"
              min={field.min}
              max={field.max}
              value={value === undefined || value === null ? "" : String(value)}
              onChange={(e) =>
                onChange(e.target.value === "" ? undefined : Number(e.target.value))
              }
            />
            {field.unit && (
              <span className="shrink-0 text-[12px] text-gray-400 dark:text-zinc-500">
                {field.unit}
              </span>
            )}
          </div>
        </Field>
      );

    case "select":
      return (
        <Field label={label} hint={field.hint}>
          <Select value={asString(value)} onChange={(e) => onChange(e.target.value || undefined)}>
            <option value="">— tanlang —</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      );

    case "strings":
      return <StringList field={field} value={value} onChange={onChange} label={label} />;

    case "numbers":
      return <NumberList field={field} value={value} onChange={onChange} label={label} />;

    case "colorStrip":
      return <ColorStrip field={field} value={value} onChange={onChange} label={label} />;

    case "colorSet":
      return <ColorSet field={field} value={value} onChange={onChange} label={label} />;

    case "colorMap":
      return <ColorMap field={field} value={value} onChange={onChange} label={label} />;

    case "point":
      return <PointField field={field} value={value} root={root} onChange={onChange} label={label} />;

    case "rows":
      return <RowList field={field} value={value} root={root} onChange={onChange} label={label} />;

    case "indexOf":
      return <IndexPicker field={field} value={value} root={root} onChange={onChange} label={label} />;

    case "factRef":
      return <FactPicker field={field} value={value} root={root} onChange={onChange} label={label} />;

    case "factValues":
      return <FactValues field={field} value={value} root={root} onChange={onChange} label={label} />;

    case "predicate":
      return <PredicateField field={field} value={value} root={root} onChange={onChange} label={label} />;

    default:
      return null;
  }
}

/* ─────────────────────────────── lists ─────────────────────────────── */

/** Add / remove / reorder controls shared by every list field. */
function RowTools({
  index,
  count,
  onMove,
  onRemove,
  min = 0,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  min?: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <IconBtn
        label="Yuqoriga"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
      >
        <IconArrowUp size={13} />
      </IconBtn>
      <IconBtn
        label="Pastga"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
      >
        <IconArrowDown size={13} />
      </IconBtn>
      <IconBtn
        label="O'chirish"
        tone="danger"
        disabled={count <= min}
        onClick={() => onRemove(index)}
      >
        <IconTrash size={13} />
      </IconBtn>
    </div>
  );
}

function useListOps<T>(items: T[], onChange: (next: T[] | undefined) => void) {
  return useMemo(
    () => ({
      replace: (index: number, next: T) =>
        onChange(items.map((item, i) => (i === index ? next : item))),
      append: (next: T) => onChange([...items, next]),
      remove: (index: number) => {
        const out = items.filter((_, i) => i !== index);
        onChange(out.length > 0 ? out : undefined);
      },
      move: (from: number, to: number) => {
        if (to < 0 || to >= items.length) return;
        const out = [...items];
        const [moved] = out.splice(from, 1);
        out.splice(to, 0, moved);
        onChange(out);
      },
    }),
    [items, onChange]
  );
}

function StringList({
  field,
  value,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "strings" }>;
  value: unknown;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const items = Array.isArray(value) ? value.map(asString) : [];
  const ops = useListOps(items, onChange as (next: string[] | undefined) => void);
  const itemLabel = field.itemLabel ?? "qator";

  return (
    <Field label={label} hint={field.hint}>
      <div className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="w-5 shrink-0 text-right text-[11px] font-mono text-gray-400 dark:text-zinc-600">
              {index + 1}
            </span>
            <TextInput
              value={item}
              placeholder={field.placeholder}
              onChange={(e) => ops.replace(index, e.target.value)}
            />
            <RowTools
              index={index}
              count={items.length}
              onMove={ops.move}
              onRemove={ops.remove}
            />
          </div>
        ))}
        <AddButton label={itemLabel} onClick={() => ops.append("")} />
        {field.min !== undefined && items.length < field.min && (
          <MiniWarn>Kamida {field.min} ta {itemLabel} kerak.</MiniWarn>
        )}
      </div>
    </Field>
  );
}

function NumberList({
  field,
  value,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "numbers" }>;
  value: unknown;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const items: number[] = Array.isArray(value)
    ? value.map((item) => (typeof item === "number" ? item : Number(item) || 0))
    : [];
  const ops = useListOps(items, onChange as (next: number[] | undefined) => void);

  return (
    <Field label={label} hint={field.hint}>
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-[9px] border-2 border-gray-200 dark:border-[#27272a] pl-2 pr-1 py-1"
          >
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={item}
              onChange={(e) => ops.replace(index, Number(e.target.value))}
              className="w-12 bg-transparent text-sm font-mono outline-none"
            />
            <IconBtn label="O'chirish" tone="danger" onClick={() => ops.remove(index)}>
              <IconTrash size={12} />
            </IconBtn>
          </span>
        ))}
        <AddButton
          label="son"
          onClick={() => ops.append(items.length > 0 ? items[items.length - 1] + 1 : field.min ?? 1)}
        />
      </div>
    </Field>
  );
}

/* ─────────────────────────────── colours ─────────────────────────────── */

function Swatch({
  colour,
  size = 22,
  ring,
}: {
  colour: PaletteKey;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className={`inline-block rounded-[6px] ${ring ? "ring-2 ring-offset-1 ring-[#26B54F] dark:ring-offset-[#161618]" : ""}`}
      style={{ width: size, height: size, background: PALETTE[colour].hex }}
    />
  );
}

/** Ordered strip — the same colour may appear many times, order is the answer. */
function ColorStrip({
  field,
  value,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "colorStrip" }>;
  value: unknown;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const items = (Array.isArray(value) ? value : []).filter(isPalette);
  const ops = useListOps(items, onChange as (next: PaletteKey[] | undefined) => void);
  const full = field.max !== undefined && items.length >= field.max;

  return (
    <Field label={label} hint={field.hint}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-[10px] border-2 border-dashed border-gray-200 dark:border-[#27272a] p-2 min-h-[46px]">
          {items.length === 0 && (
            <span className="text-[12px] text-gray-400 dark:text-zinc-600">
              Pastdagi ranglardan bosib naqsh tuzing
            </span>
          )}
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => ops.remove(index)}
              title={`${PALETTE[item].label} — bosib o'chiring`}
              className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <Swatch colour={item} size={26} />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PALETTE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              disabled={full}
              onClick={() => ops.append(key)}
              title={`${PALETTE[key].label} qo'shish`}
              className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-gray-200 dark:border-[#27272a] px-2 py-1 text-[11.5px] font-bold hover:border-[#26B54F] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Swatch colour={key} size={14} />
              {PALETTE[key].label}
            </button>
          ))}
        </div>

        {full && <MiniWarn>Eng ko&apos;pi {field.max} katak.</MiniWarn>}
      </div>
    </Field>
  );
}

/** Unordered set — which colours are offered as blocks. */
function ColorSet({
  field,
  value,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "colorSet" }>;
  value: unknown;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const items = (Array.isArray(value) ? value : []).filter(isPalette);
  const toggle = (key: PaletteKey) => {
    const next = items.includes(key) ? items.filter((item) => item !== key) : [...items, key];
    onChange(next.length > 0 ? PALETTE_KEYS.filter((k) => next.includes(k)) : undefined);
  };

  return (
    <Field label={label} hint={field.hint}>
      <div className="flex flex-wrap items-center gap-1.5">
        {PALETTE_KEYS.map((key) => {
          const on = items.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`inline-flex items-center gap-1.5 rounded-[8px] border-2 px-2 py-1 text-[11.5px] font-bold transition-colors cursor-pointer ${
                on
                  ? "border-[#26B54F] bg-[#26B54F]/10 text-[#177F37] dark:text-[#4ADE80]"
                  : "border-gray-200 dark:border-[#27272a] text-gray-500 dark:text-zinc-400"
              }`}
            >
              <Swatch colour={key} size={14} />
              {PALETTE[key].label}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

/** One colour per named slot. */
function ColorMap({
  field,
  value,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "colorMap" }>;
  value: unknown;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const map: Record<string, string> =
    value !== null && typeof value === "object" && !Array.isArray(value) ? (value as any) : {};

  return (
    <Field label={label} hint={field.hint}>
      <div className="flex flex-col gap-2">
        {field.slots.map((slot) => (
          <div key={slot.key} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-[12px] font-bold text-gray-600 dark:text-zinc-300">
              {slot.label}
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {PALETTE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  title={PALETTE[key].label}
                  onClick={() => onChange({ ...map, [slot.key]: key })}
                  className="cursor-pointer p-0.5"
                >
                  <Swatch colour={key} size={20} ring={map[slot.key] === key} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Field>
  );
}

/* ─────────────────────────── coordinates & rows ─────────────────────────── */

function PointField({
  field,
  value,
  root,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "point" }>;
  value: unknown;
  root: Cfg;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const size = Number(root[field.maxKey]);
  const grid = Number.isFinite(size) && size >= 2 && size <= 12 ? size : 5;
  const point =
    value !== null && typeof value === "object" && !Array.isArray(value) ? (value as any) : {};
  const x = Number(point.x);
  const y = Number(point.y);

  // A grid small enough to click is far clearer than two number inputs: the
  // author picks the cell they can see rather than converting it to coordinates.
  return (
    <Field label={label} hint={field.hint ?? "Katakni bosib tanlang."}>
      <div
        className="inline-grid gap-0.5 rounded-[10px] border-2 border-gray-200 dark:border-[#27272a] p-1.5"
        style={{ gridTemplateColumns: `repeat(${grid}, minmax(0, 1fr))`, width: "fit-content" }}
      >
        {Array.from({ length: grid * grid }, (_, index) => {
          const cx = index % grid;
          const cy = Math.floor(index / grid);
          const on = cx === x && cy === y;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange({ x: cx, y: cy })}
              aria-label={`${cx}, ${cy}`}
              className={`h-6 w-6 rounded-[4px] transition-colors cursor-pointer ${
                on
                  ? "bg-[#26B54F]"
                  : "bg-gray-100 dark:bg-[#232327] hover:bg-[#26B54F]/30"
              }`}
            />
          );
        })}
      </div>
    </Field>
  );
}

function RowList({
  field,
  value,
  root,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "rows" }>;
  value: unknown;
  root: Cfg;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const items: Cfg[] = Array.isArray(value)
    ? value.map((item) => (item !== null && typeof item === "object" ? item : {}))
    : [];
  const ops = useListOps(items, onChange as (next: Cfg[] | undefined) => void);
  const full = field.max !== undefined && items.length >= field.max;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            {label}
          </span>
          {field.hint && (
            <span className="text-[11px] text-gray-400 dark:text-zinc-500">{field.hint}</span>
          )}
        </div>
        {!full && (
          <AddButton label={field.itemLabel} onClick={() => ops.append({})} />
        )}
      </div>

      {items.map((row, index) => (
        <div key={index} className="flex items-start gap-1.5">
          <div className="min-w-0 flex-1">
            <SubCard
              title={`${index + 1}-${field.itemLabel}`}
              onRemove={items.length > (field.min ?? 0) ? () => ops.remove(index) : undefined}
            >
              {field.fields.map((sub) => (
                <FieldView
                  key={sub.key}
                  field={sub}
                  value={row[sub.key]}
                  root={root}
                  onChange={(next) => {
                    const merged = { ...row };
                    if (next === undefined || next === "") delete merged[sub.key];
                    else merged[sub.key] = next;
                    ops.replace(index, merged);
                  }}
                />
              ))}
            </SubCard>
          </div>
          <div className="pt-3">
            <RowTools
              index={index}
              count={items.length}
              onMove={ops.move}
              onRemove={ops.remove}
              min={field.min}
            />
          </div>
        </div>
      ))}

      {field.min !== undefined && items.length < field.min && (
        <MiniWarn>
          Kamida {field.min} ta {field.itemLabel} kerak.
        </MiniWarn>
      )}
    </div>
  );
}

/* ───────────────────────── references into siblings ───────────────────────── */

function siblingList(root: Cfg, key: string): string[] {
  const raw = root[key];
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return item;
    if (item !== null && typeof item === "object") return asString((item as any).label);
    return String(item ?? "");
  });
}

function IndexPicker({
  field,
  value,
  root,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "indexOf" }>;
  value: unknown;
  root: Cfg;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const options = siblingList(root, field.of);

  if (options.length === 0) {
    return (
      <Field label={label} hint={field.hint}>
        <MiniWarn>Avval yuqoridagi ro&apos;yxatni to&apos;ldiring.</MiniWarn>
      </Field>
    );
  }

  const current = typeof value === "number" ? String(value) : "";

  return (
    <Field label={label} hint={field.hint}>
      <Select
        value={current}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      >
        <option value="">— tanlang —</option>
        {field.allowNone && <option value="-1">{field.noneLabel ?? "hech narsa"}</option>}
        {options.map((option, index) => (
          <option key={index} value={index}>
            {index + 1}. {option || "(bo'sh)"}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function FactPicker({
  field,
  value,
  root,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "factRef" }>;
  value: unknown;
  root: Cfg;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const names = siblingList(root, field.of).filter(Boolean);

  if (names.length === 0) {
    return (
      <Field label={label} hint={field.hint}>
        <MiniWarn>Avval yuqoridagi ro&apos;yxatni to&apos;ldiring.</MiniWarn>
      </Field>
    );
  }

  return (
    <Field label={label} hint={field.hint}>
      <Select value={asString(value)} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">— tanlang —</option>
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function FactValues({
  field,
  value,
  root,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "factValues" }>;
  value: unknown;
  root: Cfg;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const names = siblingList(root, field.of).filter(Boolean);
  const values: Record<string, unknown> =
    value !== null && typeof value === "object" && !Array.isArray(value) ? (value as any) : {};

  if (names.length === 0) {
    return (
      <Field label={label} hint={field.hint}>
        <MiniWarn>Avval &laquo;Ma&apos;lumot nomlari&raquo;ni to&apos;ldiring.</MiniWarn>
      </Field>
    );
  }

  return (
    <Field label={label} hint={field.hint ?? "Son yozing, yoki ha / yo'q."}>
      <div className="flex flex-col gap-1.5">
        {names.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <span className="w-24 shrink-0 truncate text-[12px] font-mono font-bold text-gray-600 dark:text-zinc-300">
              {name}
            </span>
            <TextInput
              value={values[name] === undefined ? "" : String(values[name])}
              placeholder="12  yoki  ha"
              onChange={(e) => onChange({ ...values, [name]: coerce(e.target.value) })}
            />
          </div>
        ))}
      </div>
    </Field>
  );
}

/* ──────────────────────────── the condition builder ──────────────────────────── */

const COMPARISON_OPS: ComparisonOp[] = ["truthy", "falsy", "==", "!=", ">", ">=", "<", "<="];

function PredicateField({
  field,
  value,
  root,
  onChange,
  label,
}: {
  field: Extract<ConfigField, { kind: "predicate" }>;
  value: unknown;
  root: Cfg;
  onChange: (next: unknown) => void;
  label: string;
}) {
  const names = siblingList(root, field.of).filter(Boolean);

  if (names.length === 0) {
    return (
      <Field label={label} hint={field.hint}>
        <MiniWarn>Avval &laquo;Ma&apos;lumot nomlari&raquo;ni to&apos;ldiring.</MiniWarn>
      </Field>
    );
  }

  return (
    <Field label={label} hint={field.hint ?? "Shart aslida nimani tekshirishi."}>
      <PredicateNode value={value} names={names} onChange={onChange} depth={0} />
    </Field>
  );
}

/**
 * One node of the condition tree. `and` / `or` nest one level in practice, which
 * is as deep as a lesson for children ever needs — but the component recurses,
 * so nothing breaks if an author goes further.
 */
function PredicateNode({
  value,
  names,
  onChange,
  depth,
}: {
  value: unknown;
  names: string[];
  onChange: (next: unknown) => void;
  depth: number;
}) {
  const node: any = value !== null && typeof value === "object" ? value : {};
  const op: string = typeof node.op === "string" ? node.op : "";
  const isGroup = op === "and" || op === "or";
  const needsValue = op !== "" && op !== "truthy" && op !== "falsy" && !isGroup && op !== "not";

  const setOp = (nextOp: string) => {
    if (nextOp === "") return onChange(undefined);
    if (nextOp === "and" || nextOp === "or") {
      const existing = Array.isArray(node.of) ? node.of : [];
      return onChange({
        op: nextOp,
        of: existing.length >= 2 ? existing : [{ op: "truthy", fact: names[0] }, {}],
      });
    }
    onChange({
      op: nextOp,
      fact: node.fact ?? names[0],
      ...(nextOp === "truthy" || nextOp === "falsy" ? {} : { value: node.value ?? 0 }),
    });
  };

  return (
    <div
      className={
        depth > 0
          ? "rounded-[9px] border-2 border-gray-100 dark:border-[#222226] p-2 flex flex-col gap-1.5"
          : "flex flex-col gap-1.5"
      }
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          value={op}
          onChange={(e) => setOp(e.target.value)}
          className={`${inputClass} w-auto min-w-[9.5rem] cursor-pointer py-1.5 text-[12.5px]`}
        >
          <option value="">— tanlang —</option>
          {COMPARISON_OPS.map((item) => (
            <option key={item} value={item}>
              {OP_LABELS[item]}
            </option>
          ))}
          <option value="and">{OP_LABELS.and}</option>
          <option value="or">{OP_LABELS.or}</option>
        </select>

        {!isGroup && op !== "" && (
          <select
            value={asString(node.fact)}
            onChange={(e) => onChange({ ...node, fact: e.target.value })}
            className={`${inputClass} w-auto min-w-[7rem] cursor-pointer py-1.5 text-[12.5px] font-mono`}
          >
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}

        {needsValue && (
          <input
            value={node.value === undefined ? "" : String(node.value)}
            placeholder="20"
            onChange={(e) => onChange({ ...node, value: coerce(e.target.value) })}
            className={`${inputClass} w-24 py-1.5 text-[12.5px] font-mono`}
          />
        )}
      </div>

      {isGroup && (
        <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-[#26B54F]/30">
          {(Array.isArray(node.of) ? node.of : []).map((child: unknown, index: number) => (
            <div key={index} className="flex items-start gap-1.5">
              <div className="min-w-0 flex-1">
                <PredicateNode
                  value={child}
                  names={names}
                  depth={depth + 1}
                  onChange={(next) =>
                    onChange({
                      ...node,
                      of: node.of.map((item: unknown, i: number) => (i === index ? next : item)),
                    })
                  }
                />
              </div>
              <IconBtn
                label="O'chirish"
                tone="danger"
                disabled={node.of.length <= 2}
                onClick={() =>
                  onChange({
                    ...node,
                    of: node.of.filter((_: unknown, i: number) => i !== index),
                  })
                }
              >
                <IconTrash size={13} />
              </IconBtn>
            </div>
          ))}
          <AddButton
            label="shart"
            onClick={() => onChange({ ...node, of: [...node.of, { op: "truthy", fact: names[0] }] })}
          />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────── JSON view ──────────────────────────────── */

function JsonView({
  value,
  draft,
  setDraft,
  onChange,
}: {
  value: unknown;
  draft: string | null;
  setDraft: (next: string | null) => void;
  onChange: (next: Cfg | undefined) => void;
}) {
  const text =
    draft !== null
      ? draft
      : typeof value === "string"
        ? value
        : value === undefined || value === null
          ? ""
          : JSON.stringify(value, null, 2);

  // Typing valid JSON goes through as an object; typing broken JSON is kept as
  // the author's raw text so a half-finished edit is not silently discarded.
  const broken = (() => {
    if (!text.trim()) return false;
    try {
      const parsed = JSON.parse(text);
      return parsed === null || typeof parsed !== "object" || Array.isArray(parsed);
    } catch {
      return true;
    }
  })();

  return (
    <div className="flex flex-col gap-1.5">
      <TextArea
        rows={12}
        value={text}
        placeholder={`{\n  "hint": "..."\n}`}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          if (!next.trim()) return onChange(undefined);
          try {
            const parsed = JSON.parse(next);
            if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
              onChange(parsed);
              return;
            }
          } catch {
            /* fall through to keeping the raw text */
          }
          onChange(next as unknown as Cfg);
        }}
        className="font-mono text-[12px] leading-relaxed"
      />
      {broken && (
        <MiniWarn>
          JSON o&apos;qilmadi — qavs yoki vergulni tekshiring. Shu holatda o&apos;yin
          tayyor masalaga qaytadi.
        </MiniWarn>
      )}
    </div>
  );
}

/* ────────────────────────────── small pieces ────────────────────────────── */

function ToolButton({
  icon,
  label,
  onClick,
  tone = "accent",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "accent" | "quiet" | "danger";
}) {
  const tones = {
    accent:
      "bg-[#26B54F]/15 hover:bg-[#26B54F]/25 text-[#177F37] dark:text-[#4ADE80]",
    quiet:
      "bg-gray-100 dark:bg-[#232327] hover:bg-gray-200 dark:hover:bg-[#2a2a30] text-gray-600 dark:text-zinc-300",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[11.5px] font-bold transition-colors cursor-pointer ${tones[tone]}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  tone = "quiet",
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "quiet" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`shrink-0 rounded-[6px] p-1 transition-colors cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed ${
        tone === "danger"
          ? "text-gray-300 dark:text-zinc-600 hover:text-red-500"
          : "text-gray-400 dark:text-zinc-500 hover:text-[#26B54F]"
      }`}
    >
      {children}
    </button>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[10px] bg-gray-50 dark:bg-[#1c1c1f] px-3 py-2 text-[12px] leading-relaxed text-gray-500 dark:text-zinc-400">
      {children}
    </p>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-[10px] bg-amber-500/10 px-3 py-2 text-[12px] leading-relaxed text-amber-700 dark:text-amber-400">
      <IconAlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function MiniWarn({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{children}</span>;
}

/* ────────────────────────────── helpers ────────────────────────────── */

function asString(value: unknown): string {
  return typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);
}

function isPalette(value: unknown): value is PaletteKey {
  return typeof value === "string" && (PALETTE_KEYS as readonly string[]).includes(value);
}

/** "12" becomes 12 and "ha" becomes true, so a fact reads as the author meant it. */
function coerce(text: string): number | boolean | string {
  const trimmed = text.trim();
  if (trimmed === "ha" || trimmed === "rost" || trimmed === "true") return true;
  if (trimmed === "yo'q" || trimmed === "yolg'on" || trimmed === "false") return false;
  const asNumber = Number(trimmed);
  return trimmed !== "" && Number.isFinite(asNumber) ? asNumber : text;
}

/** Required fields the author has not filled in yet, by label. */
function missingRequired(schema: GameConfigSchema, config: Cfg): string[] {
  const out: string[] = [];
  for (const field of schema.fields) {
    if (!field.required) continue;
    const value = config[field.key];
    const empty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (field.kind === "colorMap" &&
        field.slots.some((slot) => !(value as any)?.[slot.key]));
    if (empty) out.push(field.label);
  }
  return out;
}
