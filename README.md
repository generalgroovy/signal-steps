# Signal Steps

Build small logic circuits by connecting familiar rules to a lamp. Toggle two switches, choose **Both**, **Either**, **One only** or **Opposite**, and see all four possible outcomes.

## Run

No dependencies or build step. Run `python -m http.server 8000` in this folder and open http://localhost:8000/. Run tests with `npm test` and syntax checks with `npm run check` (Node22 or later).

## Play and explore

Six short puzzles have reachable goals. The first asks for a lamp that lights only when both switches are on: change Rule1 to **Both**. A puzzle succeeds only when every input combination matches. Add up to four rules; later rules can use earlier answers. **Explore freely** removes the target while keeping the circuit. **Undo** recovers edits and resets. Save/Open transfers a validated JSON board; local browser storage is best-effort and may be cleared by the browser.

The default board shows one rule choice and a plain-language explanation. Open **Inputs** to rewire a rule; **Change lamp input** selects the final answer. The four switch-pair buttons let you try every case directly. The active pair stays visibly selected and keeps keyboard focus. Reset, free exploration and portable files are under **Board options**.

All controls support keyboard and touch without dragging. Rules update immediately; they do not execute scripts, connect hardware or control the desktop. The signal graph only points forward, so loops and ambiguous evaluation are rejected.

## Design and lineage

An original companion idea inspired by MIDILIN's input-to-action reasoning, implemented independently as a software logic playground. The pure model owns validation, evaluation, truth tables and challenge completion. The UI renders that same model. Tests cover actual truth tables, composition, puzzle reachability, unsafe wiring, import validation and recovery.
