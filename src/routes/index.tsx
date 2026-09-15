import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { Election1992 } from "@/components/game/Election1992";
import { CabinetTalks } from "@/components/game/CabinetTalks";
import { CoalitionTalks } from "@/components/game/CoalitionTalks";
import { GameBoard } from "@/components/game/GameBoard";
import { GovernBoard } from "@/components/game/GovernBoard";
import { PartySelect } from "@/components/game/PartySelect";
import { Results } from "@/components/game/Results";
import { SaveMenu } from "@/components/game/SaveMenu";
import { TermReport } from "@/components/game/TermReport";
import { PARTIES, type Choice, type PartyId } from "@/lib/game/data";
import {
  deleteSlot,
  firstEmptySlot,
  loadSaves,
  writeSlot,
  type SaveBook,
} from "@/lib/game/saves";
import {
  applyEffect,
  createGame,
  runElection,
  totalTurns,
  type GameState,
} from "@/lib/game/engine";
import type { GovChoice } from "@/lib/game/govevents";
import { fillCabinet } from "@/lib/game/government";
import {
  applyGovChoice,
  createGovernment,
  governEvent,
  TERM_MONTHS,
  type GovState,
} from "@/lib/game/governing";


const TITLE = "The Second Republic — Italy 1992 Political Simulation";
const DESCRIPTION =
  "Lead Forza Italia, the PDS, Lega Nord, AN, PPI or Rifondazione from the summer of 1992 through Tangentopoli and the collapse of the First Republic to the Italian election of March 1994.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

type Phase = "brief" | "coalition" | "cabinet" | "results" | "govern";

function Index() {
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<Phase>("brief");
  const [allies, setAllies] = useState<PartyId[]>([]);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [gov, setGov] = useState<GovState | null>(null);
  const [book, setBook] = useState<SaveBook>(() => Array.from({ length: 10 }, () => null));
  const [slot, setSlot] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    setBook(loadSaves());
    hydrated.current = true;
  }, []);

  const label = (s: GameState) =>
    PARTIES.find((p) => p.id === s.party)?.short ?? s.party.toUpperCase();

  const store = (target: number, s: GameState = state!) =>
    setBook(
      writeSlot(target, {
        label: label(s),
        phase,
        state: s,
        allies,
        claimed,
        gov,
      }),
    );

  // autosave to the active slot after every change
  useEffect(() => {
    if (!hydrated.current || slot === null || !state) return;
    setBook(
      writeSlot(slot, { label: label(state), phase, state, allies, claimed, gov }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot, state, phase, allies, claimed, gov]);

  const reset = () => {
    setState(null);
    setPhase("coalition");
    setAllies([]);
    setClaimed([]);
    setGov(null);
    setSlot(null);
    setMenuOpen(false);
  };

  const load = (i: number) => {
    const save = loadSaves()[i];
    if (!save) return;
    setState(save.state);
    setPhase(save.phase as Phase);
    setAllies(save.allies ?? []);
    setClaimed(save.claimed ?? []);
    setGov(save.gov ?? null);
    setSlot(i);
    setMenuOpen(false);
  };

  const erase = (i: number) => {
    setBook(deleteSlot(i));
    if (slot === i) setSlot(null);
  };

  const pick = (id: PartyId) => {
    setAllies([]);
    setClaimed([]);
    setGov(null);
    setPhase("brief");
    const fresh = createGame(id);
    setState(fresh);
    const target = firstEmptySlot(loadSaves());
    setSlot(target);
    if (target !== null) {
      setBook(
        writeSlot(target, {
          label: label(fresh),
          phase: "brief",
          state: fresh,
          allies: [],
          claimed: [],
          gov: null,
        }),
      );
    }
  };

  const choose = (choice: Choice) =>
    setState((prev) => (prev ? applyEffect(prev, choice.effect, choice.label, choice.flag) : prev));

  const govern = (choice: GovChoice) =>
    setGov((prev) => {
      if (!prev) return prev;
      const event = governEvent(prev);
      return event ? applyGovChoice(prev, event, choice) : prev;
    });

  const done = !!state && state.turn >= totalTurns(state.party);
  const projection = useMemo(() => (done && state ? runElection(state, []) : null), [done, state]);
  const result = useMemo(
    () => (done && state ? runElection(state, allies) : null),
    [done, state, allies],
  );

  if (!state) return <PartySelect onPick={pick} />;
  if (phase === "brief") {
    return <Election1992 party={state.party} onStart={() => setPhase("coalition")} />;
  }

  if (done && projection && result) {
    if (phase === "coalition") {
      return (
        <CoalitionTalks
          state={state}
          projection={projection}
          picked={allies}
          onToggle={(id) =>
            setAllies((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
          }
          onConfirm={() => setPhase("cabinet")}
        />
      );
    }
    if (phase === "cabinet") {
      return (
        <CabinetTalks
          state={state}
          result={result}
          claimed={claimed}
          onToggle={(key) =>
            setClaimed((prev) =>
              prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
            )
          }
          onConfirm={() => setPhase("results")}
        />
      );
    }
    if (phase === "govern" && gov) {
      if (gov.turn >= TERM_MONTHS || !governEvent(gov)) {
        return <TermReport gov={gov} onRestart={reset} />;
      }
      return <GovernBoard gov={gov} onChoose={govern} />;
    }
    return (
      <Results
        state={state}
        result={result}
        cabinet={fillCabinet(state, result, claimed)}
        onGovern={() => {
          setGov(createGovernment(state.party, fillCabinet(state, result, claimed), state.flags));
          setPhase("govern");
        }}
        onRestart={reset}
      />
    );
  }

  return <GameBoard state={state} onChoose={choose} />;
}

