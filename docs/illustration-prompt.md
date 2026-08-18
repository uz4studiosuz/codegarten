# Codegarten — Modul rasm (illustration) generatsiya prompti

`Desktop/images` dagi 8 ta referens rasm uslubi tahlil qilib chiqarilgan shablon.
Har bir modul uchun faqat **2 ta joyni** to'ldirasiz:

| Placeholder | Nima yoziladi | Misol |
|---|---|---|
| `{OBJECT}` | Mavzuni ifodalovchi **aniq jismoniy buyum(lar)** — mavhum tushuncha emas | `a coiled spring wrapping around a stack of three cubes` |
| `{HEX}` | Asosiy rang hex kodi | `#8B5CF6` |

> ⚠️ Eng muhim qoida: `{OBJECT}` ga "Loops", "Functions" kabi **tushuncha nomini yozmang**.
> Uni ko'z bilan ko'rinadigan **buyumga** aylantiring. Referens rasmlar shunday ishlaydi:
> *Coordinate Plane* → panjarali taxta + kamon o'qlari, *Negative Numbers* → +/− tugmali kartalar,
> *Neural Networks* → robot qo'li + shaxmat piyodasi, *Probability* → futbol to'pi + ustunli diagramma.

---

## 1. MASTER PROMPT (nusxa oling va to'ldiring)

```text
A single flat-vector illustration icon of {OBJECT}, in a modern semi-flat 2.5D
educational-icon style.

COLOR: Strictly monochromatic around the base color {HEX}. Build depth using only
4-5 flat tints and shades derived from {HEX}: a deep dark shade for the side and
bottom faces, the pure base tone for the main faces, a lighter tint for the top
faces, and a very pale near-white tint for highlights. Add exactly ONE warm
complementary accent color covering roughly 15-25% of the artwork — golden yellow
(#F5C518) or warm orange (#F58220) if {HEX} is a cool color (blue, purple, teal,
green); soft violet (#9B7BD4) if {HEX} is a warm color (orange, red, yellow).
Use no other hues.

COMPOSITION: 2 to 4 simple objects grouped into one compact cluster — one hero
object plus one or two supporting props, overlapping each other and arranged along
a gentle diagonal. Three-quarter viewing angle with a slight isometric tilt.
Perfectly centered, filling about 85% of a square frame with even breathing room
on all sides.

FORM: Clean geometric shapes with generously rounded corners. Smooth, chunky,
toy-like, tactile forms. No outlines or strokes — shapes are separated purely by
color. Depth comes from stacked offset layers and flat side faces, never from
soft gradients or realistic lighting.

FINISH: Flat blocks of color with a single translucent lighter diagonal sheen band
sweeping across some faces, giving a subtle glossy-plastic feel. Scatter a few
small round accent-colored dots as rivet or joint details.

OUTPUT: Fully transparent background (PNG with alpha), 208x208 pixels, square,
crisp vector-clean edges, no cropping, object fully inside the frame.
```

### Negative prompt (qo'shimcha maydon bo'lsa)

```text
text, letters, numbers, words, labels, watermark, signature, background color,
background shapes, scene, floor, ground shadow, drop shadow outside the object,
photorealistic, 3D render, ray tracing, glossy reflections, skeuomorphic textures,
noise, grain, sketch, hand-drawn, watercolor, outlines, black strokes, thick
borders, rainbow palette, more than two hues, clutter, many small objects,
cropped edges, off-center composition, human faces, hands
```

---

## 2. TO'LDIRILGAN MISOL — "Loops"

`{OBJECT}` = `a thick coiled spring loop wrapping around a stack of three rounded cubes, with a small circular arrow orbiting them`
`{HEX}` = `#8B5CF6`

```text
A single flat-vector illustration icon of a thick coiled spring loop wrapping
around a stack of three rounded cubes, with a small circular arrow orbiting them,
in a modern semi-flat 2.5D educational-icon style.

COLOR: Strictly monochromatic around the base color #8B5CF6. Build depth using only
4-5 flat tints and shades derived from #8B5CF6: a deep dark shade for the side and
bottom faces, the pure base tone for the main faces, a lighter tint for the top
faces, and a very pale near-white tint for highlights. Add exactly ONE warm
complementary accent color covering roughly 15-25% of the artwork — golden yellow
(#F5C518) — on the orbiting arrow and the rivet details. Use no other hues.

COMPOSITION: 2 to 4 simple objects grouped into one compact cluster — one hero
object plus one or two supporting props, overlapping each other and arranged along
a gentle diagonal. Three-quarter viewing angle with a slight isometric tilt.
Perfectly centered, filling about 85% of a square frame with even breathing room
on all sides.

FORM: Clean geometric shapes with generously rounded corners. Smooth, chunky,
toy-like, tactile forms. No outlines or strokes — shapes are separated purely by
color. Depth comes from stacked offset layers and flat side faces, never from
soft gradients or realistic lighting.

FINISH: Flat blocks of color with a single translucent lighter diagonal sheen band
sweeping across some faces, giving a subtle glossy-plastic feel. Scatter a few
small round accent-colored dots as rivet or joint details.

OUTPUT: Fully transparent background (PNG with alpha), 208x208 pixels, square,
crisp vector-clean edges, no cropping, object fully inside the frame.
```

---

## 3. `{OBJECT}` ni topish uchun shpargalka

Codegarten modullari uchun tayyor variantlar:

| Modul | `{OBJECT}` | Tavsiya `{HEX}` |
|---|---|---|
| Buyruqlar va Ketma-ketlik | `three rounded arrow tiles snapping together in a row like puzzle pieces` | `#22C55E` |
| Sikllar (Loops) | `a thick coiled spring loop wrapping around a stack of three rounded cubes` | `#8B5CF6` |
| Funksiyalar va Modullik | `a rounded box with a funnel on top and a finished shape dropping out of a chute below` | `#3B82F6` |
| Shartlar (Conditionals) | `a railway track splitting into two branches with a rounded lever switch` | `#F59E0B` |
| O'zgaruvchilar va Xotira | `three labelled rounded storage jars on a shelf, one with its lid lifting off` | `#3B82F6` |
| Algoritmik Murakkablik | `a stopwatch beside a descending staircase of rounded bars` | `#10B981` |
| Ma'lumotlar Tahlili | `a rounded bar chart with a magnifying glass resting on it` | `#F59E0B` |
| Neyron Tarmoqlar | `a robotic arm reaching toward a chess pawn` | `#8B5CF6` |

**Formula:** mavhum tushuncha → uni maktabda tushuntirish uchun ishlatiladigan
jismoniy metafora → shu metaforaning 2–3 ta buyumi.

---

## 4. Model bo'yicha sozlamalar

| Model | Qo'shimcha |
|---|---|
| **Midjourney** | Prompt oxiriga `--ar 1:1 --style raw --stylize 150 --no text` qo'shing. Shaffof fon uchun natijani keyin fon olib tashlash bilan tozalang. |
| **GPT-Image / DALL·E 3** | Prompt to'g'ridan-to'g'ri ishlaydi. "transparent background" ni **prompt boshida ham** takrorlang — shunda alpha kanal ishonchli chiqadi. |
| **Flux / SDXL** | `Negative prompt` maydonini yuqoridagi ro'yxat bilan to'ldiring. `CFG 3.5–5`, `steps 28–35`. |
| **Ideogram** | `Style: Design` rejimini tanlang — flat-vector uchun eng yaqin natija beradi. |

Seriya bo'ylab **bir xillik** uchun: birinchi muvaffaqiyatli rasmni referens
(image prompt / style reference) sifatida keyingi generatsiyalarga biriktiring va
faqat `{OBJECT}` va `{HEX}` ni o'zgartiring.
