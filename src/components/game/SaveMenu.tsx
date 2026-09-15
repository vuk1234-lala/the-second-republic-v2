import {
  SLOT_COUNT,
  describeSave,
  savedWhen,
  type SaveBook,
} from "@/lib/game/saves";

export function SaveMenu({
  book,
  activeSlot,
  mode,
  onLoad,
  onSave,
  onDelete,
  onClose,
}: {
  book: SaveBook;
  activeSlot: number | null;
  /** "load" on the title screen, "save" while a game is running */
  mode: "load" | "save";
  onLoad: (slot: number) => void;
  onSave?: (slot: number) => void;
  onDelete: (slot: number) => void;
  onClose?: () => void;
}) {
  return (
    <section className="card-paper p-4 sm:p-5">
      <div className="rule-top grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-2">
        <h2 className="label-caps min-w-0 truncate text-muted-foreground">
          {mode === "load" ? "Saved games" : "Save slots"} · {SLOT_COUNT} slots
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="label-caps shrink-0 border border-ink px-3 py-1.5 hover:bg-secondary"
          >
            Close
          </button>
        )}
      </div>

      <ul className="mt-3 divide-y divide-border">
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const save = book[i] ?? null;
          const isActive = activeSlot === i;
          return (
            <li
              key={i}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="label-caps text-muted-foreground">
                  Slot {i + 1}
                  {isActive ? " · current" : ""}
                </p>
                {save ? (
                  <>
                    <p className="font-display truncate text-sm font-semibold">{save.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {describeSave(save)} · {savedWhen(save.savedAt)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Empty</p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                {mode === "save" && onSave && (
                  <button
                    onClick={() => onSave(i)}
                    className="label-caps border border-ink px-2.5 py-1.5 hover:bg-secondary"
                  >
                    {save ? "Overwrite" : "Save"}
                  </button>
                )}
                {save && (
                  <button
                    onClick={() => onLoad(i)}
                    className="label-caps border border-ink bg-ink px-2.5 py-1.5 text-primary-foreground"
                  >
                    Load
                  </button>
                )}
                {save && (
                  <button
                    onClick={() => onDelete(i)}
                    className="label-caps border border-border px-2.5 py-1.5 text-muted-foreground hover:border-ink hover:text-foreground"
                  >
                    Erase
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {mode === "save" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Your current game is also saved automatically to its slot after every decision.
        </p>
      )}
    </section>
  );
}
