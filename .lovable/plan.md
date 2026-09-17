# Election-night motion controls

## Goal
Make the 1994 and 1999 election-night sequence comfortable for different motion preferences while preserving every result and audio detail.

## Changes
- Add an accessible motion selector with **Reduced**, **1×**, and **2×** speeds, plus a separate **Show final result** action.
- Default to the device’s reduced-motion preference when enabled; otherwise use **1×**.
- Slow **1×** to reveal all 630 seats over roughly 30 seconds; **2×** completes in roughly 15 seconds.
- In reduced mode, show the completed chamber immediately without animated seat progression.
- Keep the final party seat totals, majority status, projection bulletin history, and optional result stinger available in every mode, including skipped results.
- Use named controls, 44px touch targets, clear focus states, and a polite status announcement.

## Technical details
- Keep the setting local to the election-night screen and apply it identically to the 1994 and 1999 sequences through their shared component.
- Replace the fixed reveal batch with elapsed-time-aware reveal rates, so each speed has predictable timing.
- Stop ticker timers cleanly when switching modes or showing the final result; populate the complete bulletin list instead of discarding it.
- Respect `prefers-reduced-motion` for both seat transitions and the completion entrance effect.

## Verification
- Check standard, fast, reduced, and immediate-result paths in the live preview.
- Confirm all 630 seats, final standings, majority message, bulletin details, sound toggle, replay, and continue action remain available on desktop and mobile.
