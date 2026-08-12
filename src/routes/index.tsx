import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { GameBoard } from "@/components/game/GameBoard";
import { PartySelect } from "@/components/game/PartySelect";
import { Results } from "@/components/game/Results";
import type { Choice, PartyId } from "@/lib/game/data";
import {
  applyEffect,
  createGame,
  runElection,
  totalTurns,
  type GameState,
} from "@/lib/game/engine";

const TITLE = "The Second Republic — Italy 1993 Political Simulation";
const DESCRIPTION =
  "Lead Forza Italia, the PDS, Lega Nord, AN, PPI or Rifondazione through Tangentopoli and the collapse of the First Republic to the Italian election of March 1994.";

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

function Index() {
  const [state, setState] = useState<GameState | null>(null);

  const pick = (id: PartyId) => setState(createGame(id));

  const choose = (choice: Choice) =>
    setState((prev) => (prev ? applyEffect(prev, choice.effect, choice.label) : prev));

  if (!state) return <PartySelect onPick={pick} />;

  if (state.turn >= totalTurns(state.party)) {
    return <Results state={state} result={runElection(state)} onRestart={() => setState(null)} />;
  }

  return <GameBoard state={state} onChoose={choose} />;
}
