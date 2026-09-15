import type { PartyId } from "@/lib/game/data";
import type { GameState } from "@/lib/game/engine";
import type { GovState } from "@/lib/game/governing";

export const SLOT_COUNT = 10;
const KEY = "second-republic:saves:v2";

export type SavePhase = "brief" | "coalition" | "cabinet" | "results" | "govern";

export interface SaveSlot {
  slot: number;
  label: string;
  savedAt: number;
  phase: SavePhase;
  state: GameState;
  allies: PartyId[];
  claimed: string[];
  gov: GovState | null;
}

export type SaveBook = (SaveSlot | null)[];

function empty(): SaveBook {
  return Array.from({ length: SLOT_COUNT }, () => null);
}

export function loadSaves(): SaveBook {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as SaveBook;
    if (!Array.isArray(parsed)) return empty();
    const book = empty();
    for (let i = 0; i < SLOT_COUNT; i++) {
      const entry = parsed[i];
      if (entry && typeof entry === "object" && entry.state) book[i] = { ...entry, slot: i };
    }
    return book;
  } catch {
    return empty();
  }
}

function persist(book: SaveBook) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(book));
  } catch {
    /* quota or private mode — saving simply does nothing */
  }
}

export function writeSlot(slot: number, save: Omit<SaveSlot, "slot" | "savedAt">): SaveBook {
  const book = loadSaves();
  if (slot < 0 || slot >= SLOT_COUNT) return book;
  book[slot] = { ...save, slot, savedAt: Date.now() };
  persist(book);
  return book;
}

export function deleteSlot(slot: number): SaveBook {
  const book = loadSaves();
  book[slot] = null;
  persist(book);
  return book;
}

export function firstEmptySlot(book: SaveBook): number | null {
  const idx = book.findIndex((s) => !s);
  return idx === -1 ? null : idx;
}

export function describeSave(save: SaveSlot): string {
  if (save.phase === "govern" && save.gov) return `Government · month ${save.gov.turn + 1}`;
  if (save.phase === "coalition") return "Coalition talks";
  if (save.phase === "cabinet") return "Cabinet talks";
  if (save.phase === "results") return "Election night";
  return `Campaign · turn ${save.state.turn + 1}`;
}

export function savedWhen(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
