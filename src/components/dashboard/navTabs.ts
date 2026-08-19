import { IconBook, IconBookmarks, IconHome } from "@tabler/icons-react";

/**
 * The primary tabs, in one place.
 *
 * Two navigations render them — the header from `sm` up and the bottom bar below
 * it — and a phone showing a different set from a laptop is the kind of drift that
 * only surfaces after someone ships a fourth tab to one of them.
 */
export const NAV_TABS = [
  { key: "home", href: "/home", label: "Bosh sahifa", Icon: IconHome },
  { key: "courses", href: "/courses", label: "Kurslar", Icon: IconBook },
  { key: "vocabulary", href: "/vocabulary", label: "Lug'at", Icon: IconBookmarks },
] as const;

export type NavTabKey = (typeof NAV_TABS)[number]["key"];
