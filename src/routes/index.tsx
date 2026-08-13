import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { CabinetTalks } from "@/components/game/CabinetTalks";
import { CoalitionTalks } from "@/components/game/CoalitionTalks";
import { GameBoard } from "@/components/game/GameBoard";
import { GovernBoard } from "@/components/game/GovernBoard";
import { PartySelect } from "@/components/game/PartySelect";
import { Results } from "@/components/game/Results";
import { TermReport } from "@/components/game/TermReport";
import type { Choice, PartyId } from "@/lib/game/data";
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

type Phase = "coalition" | "cabinet" | "results";

function Index() {
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<Phase>("coalition");
  const [allies, setAllies] = useState<PartyId[]>([]);
  const [claimed, setClaimed] = useState<string[]>([]);

  const reset = () => {
    setState(null);
    setPhase("coalition");
    setAllies([]);
    setClaimed([]);
  };

  const pick = (id: PartyId) => {
    setAllies([]);
    setClaimed([]);
    setPhase("coalition");
    setState(createGame(id));
  };

  const choose = (choice: Choice) =>
    setState((prev) => (prev ? applyEffect(prev, choice.effect, choice.label) : prev));

  const done = !!state && state.turn >= totalTurns(state.party);
  const projection = useMemo(() => (done && state ? runElection(state, []) : null), [done, state]);
  const result = useMemo(
    () => (done && state ? runElection(state, allies) : null),
    [done, state, allies],
  );

  if (!state) return <PartySelect onPick={pick} />;

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
    return (
      <Results
        state={state}
        result={result}
        cabinet={fillCabinet(state, result, claimed)}
        onRestart={reset}
      />
    );
  }

  return <GameBoard state={state} onChoose={choose} />;
}
